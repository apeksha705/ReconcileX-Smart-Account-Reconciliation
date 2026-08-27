/**
 * matchingEngine.js
 * 7-stage 3-way reconciliation engine.
 *
 * Stage 1  – Upload & Ingest
 * Stage 2  – Extract Tokens
 * Stage 3  – Clean & Normalize
 * Stage 4  – 3-Way Matching Correlation
 * Stage 5  – Anomaly Detection
 * Stage 6  – Partition Queues
 * Stage 7  – Reconcile & Persist
 */

import stringSimilarity from 'string-similarity';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';
import {
  normalizeDate,
  normalizeAmount,
  vendorToken,
} from './parsers.js';
import {
  detectTDSDiscrepancy,
  detectDuplicates,
  detectMissingInvoices,
  detectMissingBankDebits,
} from './anomalyDetector.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const GSTIN_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g;
const UTR_REGEX   = /[A-Z]{3,}[0-9]{6,}/g;
const INV_REGEX   = /[A-Z]{2,}\-?[\w\-]{3,}/g;

// ─── Stage 2: Token extraction ────────────────────────────────────────────────

function extractTokens(text) {
  const s = String(text || '').toUpperCase();
  return {
    gstins:     s.match(GSTIN_REGEX)  || [],
    utrs:       s.match(UTR_REGEX)    || [],
    invoiceNos: s.match(INV_REGEX)    || [],
  };
}

// ─── Stage 3: Row-level normalization ─────────────────────────────────────────

function normalizeBankRow(row) {
  return {
    ...row,
    date:        normalizeDate(row.date),
    amount:      normalizeAmount(row.amount),
    vendorToken: vendorToken(row.description),
    tokens:      extractTokens(row.description + ' ' + row.reference),
  };
}

function normalizeInvoiceRow(row) {
  return {
    ...row,
    date:        normalizeDate(row.date),
    dueDate:     normalizeDate(row.dueDate),
    amount:      normalizeAmount(row.amount),
    vendorToken: vendorToken(row.vendor),
    tokens:      extractTokens(row.invoiceNo + ' ' + row.gstNo + ' ' + row.vendor),
  };
}

function normalizePaymentRow(row) {
  return {
    ...row,
    date:   normalizeDate(row.date),
    amount: normalizeAmount(row.amount),
  };
}

// ─── Stage 4: Scoring helpers ─────────────────────────────────────────────────

/**
 * Returns 1 if amounts are within ±1 rupee, otherwise 0.
 * (TDS differences are handled by Stage 5 anomaly detection.)
 */
function scoreAmount(a, b, c) {
  const ab = Math.abs(a - b) <= 1;
  const bc = Math.abs(b - c) <= 1;
  const ac = Math.abs(a - c) <= 1;
  if (ab && bc) return 1;
  if (ab || ac || bc) return 0.5;
  return 0;
}

/**
 * Vendor similarity 0.0 → 1.0 using Jaro-Winkler / dice coefficient.
 */
function scoreVendor(tokenA, tokenB) {
  if (!tokenA || !tokenB) return 0;
  if (tokenA === tokenB) return 1;
  return stringSimilarity.compareTwoStrings(tokenA, tokenB);
}

/**
 * Date delta score: 1.0 if same day, decays to 0 beyond tolerance.
 */
function scoreDate(dateA, dateB, toleranceDays = 3) {
  if (!dateA || !dateB) return 0;
  const diffMs  = Math.abs(new Date(dateA) - new Date(dateB));
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays === 0) return 1;
  if (diffDays <= toleranceDays) return 1 - (diffDays / (toleranceDays + 1));
  return 0;
}

/**
 * Reference match: 1 if bank narration contains the invoice number, else 0.
 */
function scoreReference(bankDescription, invoiceNo) {
  if (!bankDescription || !invoiceNo) return 0;
  const norm = (s) => s.toLowerCase().replace(/[\s\-\/]/g, '');
  return norm(bankDescription).includes(norm(invoiceNo)) ? 1 : 0;
}

/**
 * Composite confidence (0 → 100).
 * Weights: Amount 40, Vendor 30, Date 15, Reference 15.
 */
function compositeConfidence(amtScore, vendorScore, dateScore, refScore) {
  return Math.round(
    amtScore  * 40 +
    vendorScore * 30 +
    dateScore  * 15 +
    refScore   * 15
  );
}

// ─── Stage 4: Best-match finder ───────────────────────────────────────────────

function findBestMatch(bankRow, invoiceRows, paymentRows, settings) {
  let bestInvoice  = null;
  let bestPayment  = null;
  let bestConfidence = 0;
  let bestScores   = {};

  for (const inv of invoiceRows) {
    for (const pay of paymentRows) {
      const amtScore  = scoreAmount(bankRow.amount, inv.amount, pay.amount);
      const vendorSim = scoreVendor(bankRow.vendorToken, inv.vendorToken);
      const dateScore = scoreDate(bankRow.date, inv.date, settings.dateToleranceDays ?? 3);
      const refScore  = scoreReference(bankRow.description, inv.invoiceNo);

      const conf = compositeConfidence(amtScore, vendorSim, dateScore, refScore);

      if (conf > bestConfidence) {
        bestConfidence = conf;
        bestInvoice    = inv;
        bestPayment    = pay;
        bestScores     = { amtScore, vendorSim, dateScore, refScore };
      }
    }
  }

  return { bestInvoice, bestPayment, bestConfidence, bestScores };
}

// ─── Match reason builder ─────────────────────────────────────────────────────

function buildMatchReasons(bankRow, inv, pay, scores) {
  const reasons = [];
  if (scores.amtScore === 1) {
    reasons.push(`Exact amount matched across all 3 source documents (₹${bankRow.amount.toLocaleString('en-IN')})`);
  } else if (scores.amtScore > 0) {
    reasons.push(`Partial amount match — bank ₹${bankRow.amount} / invoice ₹${inv?.amount} / payment ₹${pay?.amount}`);
  }
  if (scores.vendorSim >= 0.9) {
    reasons.push(`Vendor name verified: ${inv?.vendor || bankRow.description}`);
  } else if (scores.vendorSim >= 0.6) {
    reasons.push(`Vendor name matched with ${Math.round(scores.vendorSim * 100)}% string similarity`);
  }
  if (scores.dateScore === 1) {
    reasons.push('Transaction date matches invoice date exactly');
  } else if (scores.dateScore > 0) {
    reasons.push('Invoice date within bank settlement window');
  }
  if (scores.refScore === 1) {
    reasons.push(`Invoice reference '${inv?.invoiceNo}' detected in bank narration`);
  }
  if (pay?.paymentRef) {
    reasons.push(`Payment reference ${pay.paymentRef} cross-verified`);
  }
  return reasons;
}

// ─── Main engine export ───────────────────────────────────────────────────────

/**
 * runReconciliation
 * @param {object} datasets  { bankRows, invoiceRows, paymentRows }
 * @param {object} settings  Engine settings from DB / defaults
 * @param {object} filesMeta { bankFile, invoiceFile, paymentFile } – name/size/rowCount
 * @returns {object} { batchId, reconciledAt, stats, transactions, batch }
 */
export async function runReconciliation(datasets, settings = {}, filesMeta = {}) {
  const mergedSettings = {
    autoMatchThreshold:              settings.auto_match_threshold              ?? 90,
    fuzzyVendorMatching:             settings.fuzzy_vendor_matching             ?? true,
    dateToleranceDays:               settings.date_tolerance_days               ?? 3,
    autoFlagDuplicateThresholdHours: settings.auto_flag_duplicate_threshold_hours ?? 48,
    requireApprovalForTdsDifferences:settings.require_approval_for_tds_differences ?? true,
  };

  // ── Stage 3: Normalize ──────────────────────────────────────────────────────
  const bankRows    = (datasets.bankRows    || []).map(normalizeBankRow);
  const invoiceRows = (datasets.invoiceRows || []).map(normalizeInvoiceRow);
  const paymentRows = (datasets.paymentRows || []).map(normalizePaymentRow);

  // ── Stage 5 pre-pass: duplicate detection across bank rows ──────────────────
  const dupIndices = detectDuplicates(
    bankRows.map((r, i) => ({ ...r, _rowIndex: i })),
    mergedSettings.autoFlagDuplicateThresholdHours
  );

  const missingInvIndices  = new Set(detectMissingInvoices(bankRows, invoiceRows));
  const missingBankIndices = new Set(detectMissingBankDebits(invoiceRows, bankRows));

  // ── Stage 4 + 5 + 6: Match, annotate, partition ────────────────────────────
  const transactions = [];
  const now = new Date().toISOString();

  for (let i = 0; i < bankRows.length; i++) {
    const bank = bankRows[i];

    const { bestInvoice, bestPayment, bestConfidence, bestScores } =
      findBestMatch(bank, invoiceRows, paymentRows, mergedSettings);

    const issues       = [];
    let exceptionType  = null;
    let severity       = null;
    let status         = 'matched';
    let confidence     = bestConfidence;

    // ── Anomaly: duplicate payment ──────────────────────────────────────────
    if (dupIndices.has(i)) {
      issues.push(
        `Duplicate Payment Alert: Identical amount ₹${bank.amount} and vendor within ${mergedSettings.autoFlagDuplicateThresholdHours}h window`
      );
      exceptionType = 'duplicate_transaction';
      severity      = 'High';
    }

    // ── Anomaly: missing invoice ─────────────────────────────────────────────
    if (missingInvIndices.has(i)) {
      issues.push(
        `Missing Invoice: No vendor tax invoice matched for this ₹${bank.amount} debit`
      );
      exceptionType = exceptionType || 'missing_invoice';
      severity      = severity || 'High';
    }

    // ── Anomaly: TDS discrepancy ─────────────────────────────────────────────
    if (bestInvoice) {
      const tds = detectTDSDiscrepancy(bestInvoice.amount, bank.amount);
      if (tds && mergedSettings.requireApprovalForTdsDifferences) {
        issues.push(
          `TDS Discrepancy (${tds.section}): Invoice ₹${bestInvoice.amount} − Bank ₹${bank.amount} = ₹${tds.tdsAmount} (${(tds.rate * 100).toFixed(0)}%)`
        );
        exceptionType = exceptionType || 'amount_mismatch';
        severity      = severity || 'Medium';
      }
    }

    // ── Anomaly: general amount mismatch ─────────────────────────────────────
    if (bestInvoice && Math.abs(bank.amount - bestInvoice.amount) > 1 && !exceptionType) {
      issues.push(
        `Amount mismatch: Bank ₹${bank.amount} vs Invoice ₹${bestInvoice.amount}`
      );
      exceptionType = 'amount_mismatch';
      severity      = 'Medium';
    }

    // ── Anomaly: vendor name mismatch ─────────────────────────────────────────
    if (bestInvoice && bestScores.vendorSim < 0.6 && bestScores.vendorSim > 0) {
      issues.push(
        `Vendor name mismatch: Bank says '${bank.description}', Invoice says '${bestInvoice.vendor}'`
      );
      exceptionType = exceptionType || 'vendor_mismatch';
      severity      = severity || 'Medium';
    }

    // ── Anomaly: date gap exceeds tolerance ───────────────────────────────────
    if (bestInvoice && bestScores.dateScore < 0.5 && bestScores.dateScore > 0) {
      issues.push(
        `Date gap: Bank ${bank.date} vs Invoice ${bestInvoice.date} exceeds ${mergedSettings.dateToleranceDays}-day tolerance`
      );
      exceptionType = exceptionType || 'date_mismatch';
      severity      = severity || 'Low';
    }

    // ── Stage 6: Status assignment ────────────────────────────────────────────
    if (missingInvIndices.has(i) && !bestInvoice) {
      status     = 'unmatched';
      confidence = Math.min(confidence, 40);
    } else if (
      issues.length > 0 ||
      confidence < mergedSettings.autoMatchThreshold
    ) {
      status     = issues.length > 0 ? 'needs_review' : 'needs_review';
      confidence = Math.max(confidence, 40); // floor so it's not confused with unmatched
    } else {
      status     = 'matched';
    }

    const matchReasons = buildMatchReasons(bank, bestInvoice, bestPayment, bestScores);

    const txnId = `TXN-${String(1000 + i + 1).padStart(4, '0')}`;

    transactions.push({
      id:              txnId,
      date:            bank.date,
      vendor:          bestInvoice?.vendor || bank.description || 'Unknown',
      category:        'General',
      amount:          bank.amount,
      bank_amount:     bank.amount,
      invoice_amount:  bestInvoice?.amount ?? 0,
      payment_amount:  bestPayment?.amount ?? 0,
      reference:       bestInvoice?.invoiceNo || bank.reference || '',
      status,
      confidence,
      exception_type:  exceptionType,
      severity,
      match_reasons:   matchReasons,
      issues,
      reviewed:        false,
      resolution_notes: null,
      bank_record: {
        date:        bank.date,
        description: bank.description,
        amount:      bank.amount,
        reference:   bank.reference,
        account:     bank.account || '',
      },
      invoice_record: bestInvoice ? {
        date:      bestInvoice.date,
        invoiceNo: bestInvoice.invoiceNo,
        vendor:    bestInvoice.vendor,
        amount:    bestInvoice.amount,
        gstNo:     bestInvoice.gstNo,
        dueDate:   bestInvoice.dueDate,
      } : null,
      payment_record: bestPayment ? {
        date:       bestPayment.date,
        paymentRef: bestPayment.paymentRef,
        method:     bestPayment.method,
        amount:     bestPayment.amount,
        status:     bestPayment.status,
      } : null,
      created_at: now,
      updated_at: now,
    });
  }

  // Handle invoices that have no bank debit → unmatched (missing bank record)
  for (const idx of missingBankIndices) {
    const inv  = invoiceRows[idx];
    const pay  = paymentRows.find(p => Math.abs(p.amount - inv.amount) <= 1);
    const txnId = `TXN-MISS-${String(idx).padStart(4, '0')}`;

    transactions.push({
      id:              txnId,
      date:            inv.date,
      vendor:          inv.vendor,
      category:        'General',
      amount:          inv.amount,
      bank_amount:     0,
      invoice_amount:  inv.amount,
      payment_amount:  pay?.amount ?? 0,
      reference:       inv.invoiceNo,
      status:          'unmatched',
      confidence:      35,
      exception_type:  'missing_records',
      severity:        'High',
      match_reasons:   ['Vendor invoice and payment slip uploaded'],
      issues: [
        `Missing Bank Debit: Payment of ₹${inv.amount} has no matching entry in the bank statement`,
      ],
      reviewed:        false,
      resolution_notes: null,
      bank_record:     null,
      invoice_record: {
        date:      inv.date,
        invoiceNo: inv.invoiceNo,
        vendor:    inv.vendor,
        amount:    inv.amount,
        gstNo:     inv.gstNo,
        dueDate:   inv.dueDate,
      },
      payment_record: pay ? {
        date:       pay.date,
        paymentRef: pay.paymentRef,
        method:     pay.method,
        amount:     pay.amount,
        status:     pay.status,
      } : null,
      created_at: now,
      updated_at: now,
    });
  }

  // ── Stage 7: Persist ─────────────────────────────────────────────────────────
  const batchId = `BATCH-${new Date().getFullYear()}-${
    String(new Date().getMonth() + 1).padStart(2, '0')}${
    String(new Date().getDate()).padStart(2, '0')}-${
    String(Math.floor(Math.random() * 900) + 100)}`;

  const total     = transactions.length;
  const matched   = transactions.filter(t => t.status === 'matched').length;
  const needsRev  = transactions.filter(t => t.status === 'needs_review').length;
  const unmatched = transactions.filter(t => t.status === 'unmatched').length;
  const matchRate = total > 0 ? parseFloat(((matched / total) * 100).toFixed(2)) : 0;

  const totalAmount     = transactions.reduce((s, t) => s + t.amount, 0);
  const matchedAmount   = transactions.filter(t => t.status === 'matched').reduce((s, t) => s + t.amount, 0);
  const reviewAmount    = transactions.filter(t => t.status === 'needs_review').reduce((s, t) => s + t.amount, 0);
  const unmatchedAmount = transactions.filter(t => t.status === 'unmatched').reduce((s, t) => s + t.amount, 0);

  const startMs = Date.now();

  // Insert transactions in batches of 100 to stay within Supabase limits
  for (let i = 0; i < transactions.length; i += 100) {
    const chunk = transactions.slice(i, i + 100).map(t => ({ ...t, batch_id: batchId }));
    const { error } = await supabase.from('transactions').insert(chunk);
    if (error) throw new Error(`Failed to insert transactions: ${error.message}`);
  }

  const execTime = `${((Date.now() - startMs) / 1000).toFixed(1)}s`;

  const batch = {
    id:                 batchId,
    name:               `Reconciliation Run #${batchId.slice(-3)}`,
    date:               now,
    period:             buildPeriodLabel(bankRows),
    status:             'Completed',
    total_transactions: total,
    matched,
    needs_review:       needsRev,
    unmatched,
    match_rate:         matchRate,
    total_amount:       totalAmount,
    matched_amount:     matchedAmount,
    review_amount:      reviewAmount,
    unmatched_amount:   unmatchedAmount,
    execution_time:     execTime,
    files: [
      filesMeta.bankFile    || 'bank_statement.csv',
      filesMeta.invoiceFile || 'invoices.csv',
      filesMeta.paymentFile || 'payments.csv',
    ],
    notes: `Automated 3-way reconciliation. ${matched} records matched immediately.`,
  };

  const { error: batchErr } = await supabase.from('batches').insert(batch);
  if (batchErr) throw new Error(`Failed to insert batch: ${batchErr.message}`);

  return {
    batchId,
    reconciledAt: now,
    stats: {
      totalTransactions: total,
      matched,
      needsReview: needsRev,
      unmatched,
      matchRate,
      totalAmount,
      matchedAmount,
      reviewAmount,
      unmatchedAmount,
    },
    totalProcessed: total,
    batch,
  };
}

function buildPeriodLabel(rows) {
  const dates = rows.map(r => r.date).filter(Boolean).sort();
  if (!dates.length) return 'Unknown period';
  const fmt = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  return `${fmt(dates[0])} - ${fmt(dates[dates.length - 1])}`;
}
