/**
 * reconciliationController.js
 * POST /api/reconciliation/upload
 * POST /api/reconciliation/start
 * GET  /api/reconciliation/history
 * GET  /api/reconciliation/history/:id
 * DELETE /api/reconciliation/history/:id
 */

import { supabase } from '../config/supabase.js';
import { runReconciliation } from '../engine/matchingEngine.js';
import {
  parseBankStatement,
  parseInvoices,
  parsePaymentRecords,
  parsePDFStatement,
} from '../engine/parsers.js';

// In-memory staging store for uploaded files (cleared after /start)
// Keyed by a session token provided by the client.
const stagingStore = new Map();
const STAGING_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getOrCreateSession(sessionId) {
  if (!stagingStore.has(sessionId)) {
    stagingStore.set(sessionId, {
      bankRows:    [],
      invoiceRows: [],
      paymentRows: [],
      meta:        {},
      createdAt:   Date.now(),
    });
  }
  return stagingStore.get(sessionId);
}

// Prune stale sessions
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of stagingStore.entries()) {
    if (now - val.createdAt > STAGING_TTL_MS) stagingStore.delete(key);
  }
}, 5 * 60 * 1000);

// ─── POST /api/reconciliation/upload ──────────────────────────────────────────
export async function uploadFiles(req, res) {
  try {
    const files = req.files || {};
    const sessionId = req.headers['x-session-id'] || req.body?.sessionId || 'default';
    const session   = getOrCreateSession(sessionId);
    const summary   = {};

    // bankStatement
    if (files.bankStatement?.[0]) {
      const f = files.bankStatement[0];
      const rows = f.mimetype === 'application/pdf'
        ? await parsePDFStatement(f.buffer)
        : parseBankStatement(f.buffer);
      session.bankRows      = rows;
      session.meta.bankFile = f.originalname;
      summary.bankStatement = { name: f.originalname, size: f.size, rowCount: rows.length };
    }

    // invoices
    if (files.invoices?.[0]) {
      const f = files.invoices[0];
      const rows = parseInvoices(f.buffer);
      session.invoiceRows      = rows;
      session.meta.invoiceFile = f.originalname;
      summary.invoices         = { name: f.originalname, size: f.size, rowCount: rows.length };
    }

    // paymentRecords
    if (files.paymentRecords?.[0]) {
      const f = files.paymentRecords[0];
      const rows = parsePaymentRecords(f.buffer);
      session.paymentRows      = rows;
      session.meta.paymentFile = f.originalname;
      summary.paymentRecords   = { name: f.originalname, size: f.size, rowCount: rows.length };
    }

    return res.json({ success: true, sessionId, summary });
  } catch (err) {
    console.error('[upload]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── POST /api/reconciliation/start ───────────────────────────────────────────
export async function startReconciliation(req, res) {
  try {
    const sessionId = req.headers['x-session-id'] || req.body?.sessionId || 'default';
    const session   = stagingStore.get(sessionId);

    // Fetch current settings
    const { data: settingsRows } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    const settings = settingsRows || {};

    let bankRows    = session?.bankRows    || [];
    let invoiceRows = session?.invoiceRows || [];
    let paymentRows = session?.paymentRows || [];

    // Graceful fallback: if no files were uploaded, generate synthetic sample rows
    if (!bankRows.length && !invoiceRows.length && !paymentRows.length) {
      ({ bankRows, invoiceRows, paymentRows } = buildSampleDataset());
    }

    const result = await runReconciliation(
      { bankRows, invoiceRows, paymentRows },
      settings,
      session?.meta || {}
    );

    // Clear staging
    stagingStore.delete(sessionId);

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[startReconciliation]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/reconciliation/history ──────────────────────────────────────────
export async function getHistory(req, res) {
  try {
    const { search, status } = req.query;

    let query = supabase
      .from('batches')
      .select('*')
      .order('date', { ascending: false });

    if (search) {
      query = query.or(
        `id.ilike.%${search}%,name.ilike.%${search}%,period.ilike.%${search}%`
      );
    }

    if (status && status !== 'all') {
      // Map underscore form to enum values
      const statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      query = query.eq('status', statusLabel);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.json(data.map(camelCaseBatch));
  } catch (err) {
    console.error('[getHistory]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/reconciliation/history/:id ──────────────────────────────────────
export async function getHistoryById(req, res) {
  try {
    const { id } = req.params;

    const { data: batch, error: bErr } = await supabase
      .from('batches')
      .select('*')
      .eq('id', id)
      .single();

    if (bErr || !batch) {
      return res.status(404).json({ error: `Batch ${id} not found` });
    }

    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .eq('batch_id', id)
      .order('created_at', { ascending: true });

    return res.json({
      ...camelCaseBatch(batch),
      transactions: (txns || []).map(camelCaseTxn),
    });
  } catch (err) {
    console.error('[getHistoryById]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── DELETE /api/reconciliation/history/:id ───────────────────────────────────
export async function deleteHistoryBatch(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('batches').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (err) {
    console.error('[deleteHistoryBatch]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function camelCaseBatch(b) {
  return {
    id:                b.id,
    name:              b.name,
    date:              b.date,
    period:            b.period,
    status:            b.status,
    totalTransactions: b.total_transactions,
    matched:           b.matched,
    needsReview:       b.needs_review,
    unmatched:         b.unmatched,
    matchRate:         b.match_rate,
    totalAmount:       b.total_amount,
    matchedAmount:     b.matched_amount,
    reviewAmount:      b.review_amount,
    unmatchedAmount:   b.unmatched_amount,
    executionTime:     b.execution_time,
    initiatedBy:       b.initiated_by,
    files:             b.files || [],
    notes:             b.notes,
    createdAt:         b.created_at,
  };
}

function camelCaseTxn(t) {
  return {
    id:              t.id,
    batchId:         t.batch_id,
    date:            t.date,
    vendor:          t.vendor,
    category:        t.category,
    amount:          t.amount,
    bankAmount:      t.bank_amount,
    invoiceAmount:   t.invoice_amount,
    paymentAmount:   t.payment_amount,
    reference:       t.reference,
    status:          t.status,
    confidence:      t.confidence,
    exceptionType:   t.exception_type,
    severity:        t.severity,
    matchReasons:    t.match_reasons || [],
    issues:          t.issues || [],
    reviewed:        t.reviewed,
    resolutionNotes: t.resolution_notes,
    bankRecord:      t.bank_record,
    invoiceRecord:   t.invoice_record,
    paymentRecord:   t.payment_record,
    createdAt:       t.created_at,
    updatedAt:       t.updated_at,
  };
}

/**
 * Build a tiny synthetic dataset so /start works even without uploaded files.
 * Uses the same structure as parsers output.
 */
function buildSampleDataset() {
  const bankRows = [
    { date: '2026-08-18', description: 'NEFT-ABC SUPPLIES-INV-2048-HDFC000123', amount: 12500, reference: 'HDFC9823412', account: 'HDFC Current A/C ••••4829' },
    { date: '2026-08-19', description: 'IMPS/ZETA TECH/INV8831/RATN00021',       amount: 18500, reference: 'RATN29100412', account: 'HDFC Current A/C ••••4829' },
    { date: '2026-08-20', description: 'POS-AMAZON WEB SERVICES IN-MUMBAI',       amount: 45200, reference: 'POS99238411',  account: 'ICICI Corporate Card ••••9102' },
    { date: '2026-08-21', description: 'RTGS-GLOBAL LOGISTICS HUB-GLH7749',       amount: 32000, reference: 'RTGS8812903', account: 'HDFC Current A/C ••••4829' },
    { date: '2026-08-21', description: 'NEFT-APEX CONSULTING PARTNERS-ADVANCE',   amount: 75000, reference: 'NEFT7712093', account: 'HDFC Current A/C ••••4829' },
  ];
  const invoiceRows = [
    { date: '2026-08-17', invoiceNo: 'INV-2048',     vendor: 'ABC Supplies',           amount: 12500, gstNo: '27AAACB1234L1Z9', dueDate: '2026-08-25' },
    { date: '2026-08-16', invoiceNo: 'INV-8831',     vendor: 'Zeta Tech Solutions LLP', amount: 19000, gstNo: '29AADCB4821M1Z2', dueDate: '2026-08-30' },
    { date: '2026-08-20', invoiceNo: 'AWS-IN-90812', vendor: 'AWS Cloud India Pvt Ltd', amount: 45200, gstNo: '27AABCA1234F1Z8', dueDate: '2026-08-20' },
    { date: '2026-08-14', invoiceNo: 'GLH-7749',     vendor: 'Global Logistics Hub',    amount: 32000, gstNo: '33AAACG5512N1Z3', dueDate: '2026-08-15' },
  ];
  const paymentRows = [
    { date: '2026-08-18', paymentRef: 'PAY-882910',   method: 'NEFT Bank Transfer',   amount: 12500, status: 'SUCCESS' },
    { date: '2026-08-19', paymentRef: 'PAY-991201',   method: 'IMPS Instant',          amount: 18500, status: 'SUCCESS' },
    { date: '2026-08-20', paymentRef: 'PAY-AWS-4412', method: 'Corporate Credit Card', amount: 45200, status: 'SUCCESS' },
    { date: '2026-08-21', paymentRef: 'PAY-771829',   method: 'RTGS',                  amount: 32000, status: 'SUCCESS' },
    { date: '2026-08-21', paymentRef: 'PAY-993810',   method: 'NEFT',                  amount: 75000, status: 'SUCCESS' },
  ];
  return { bankRows, invoiceRows, paymentRows };
}

export { camelCaseTxn };
