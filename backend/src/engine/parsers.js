/**
 * parsers.js
 * CSV and PDF data normalizers for the 3-way reconciliation engine.
 * Converts raw uploaded file buffers into clean, typed JS arrays.
 */

import Papa from 'papaparse';
import pdf from 'pdf-parse';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize a date string or value to YYYY-MM-DD.
 * Handles common Indian formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD Mon YYYY.
 */
export function normalizeDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD Mon YYYY  e.g. "18 Aug 2026"
  const months = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };
  const text = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (text) {
    const [, d, mon, y] = text;
    const m = months[mon.toLowerCase()];
    if (m) return `${y}-${m}-${d.padStart(2, '0')}`;
  }

  // Fallback: let JS parse it and reformat
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);

  return null;
}

/**
 * Strip currency symbols and commas, return a float.
 */
export function normalizeAmount(raw) {
  if (raw === null || raw === undefined || raw === '') return 0;
  const cleaned = String(raw).replace(/[₹$€£,\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/**
 * Lowercase alphanumeric token for fuzzy vendor comparison.
 */
export function vendorToken(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\b(pvt|ltd|llp|inc|corp|private|limited|india|co)\b/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── CSV Parsers ──────────────────────────────────────────────────────────────

/**
 * Parse a CSV buffer into an array of normalized bank statement rows.
 * Expected columns (case-insensitive): date, description/narration, amount/debit, reference/utr/txn_id, account
 */
export function parseBankStatement(buffer) {
  const text = buffer.toString('utf8');
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: h => h.trim().toLowerCase() });

  return data.map((row, i) => ({
    _rowIndex: i,
    date: normalizeDate(row.date || row['value date'] || row['txn date']),
    description: String(row.description || row.narration || row.particulars || '').trim(),
    amount: normalizeAmount(row.amount || row.debit || row['withdrawal amt']),
    reference: String(row.reference || row.utr || row.txn_id || row.chequeno || '').trim(),
    account: String(row.account || row['account no'] || row['a/c no'] || '').trim(),
  })).filter(r => r.date && r.amount > 0);
}

/**
 * Parse a CSV buffer into an array of normalized invoice rows.
 * Expected columns: date, invoice_no/invoiceno, vendor/party, amount, gst_no/gstin, due_date
 */
export function parseInvoices(buffer) {
  const text = buffer.toString('utf8');
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: h => h.trim().toLowerCase().replace(/\s+/g, '_') });

  return data.map((row, i) => ({
    _rowIndex: i,
    date: normalizeDate(row.date || row.invoice_date),
    invoiceNo: String(row.invoice_no || row.invoiceno || row.inv_no || row['invoice #'] || '').trim(),
    vendor: String(row.vendor || row.party || row.supplier || row.name || '').trim(),
    amount: normalizeAmount(row.amount || row.total || row.grand_total || row.invoice_amount),
    gstNo: String(row.gst_no || row.gstin || row.gst_number || '').trim(),
    dueDate: normalizeDate(row.due_date || row.payment_due || row.due),
  })).filter(r => r.date && r.invoiceNo);
}

/**
 * Parse a CSV buffer into an array of normalized payment records.
 * Expected columns: date, payment_ref/ref, method, amount, status
 */
export function parsePaymentRecords(buffer) {
  const text = buffer.toString('utf8');
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: h => h.trim().toLowerCase().replace(/\s+/g, '_') });

  return data.map((row, i) => ({
    _rowIndex: i,
    date: normalizeDate(row.date || row.payment_date || row.txn_date),
    paymentRef: String(row.payment_ref || row.ref || row.reference || row.utr || '').trim(),
    method: String(row.method || row.mode || row.payment_mode || '').trim(),
    amount: normalizeAmount(row.amount || row.paid_amount || row.credit),
    status: String(row.status || 'SUCCESS').trim().toUpperCase(),
  })).filter(r => r.date && r.amount > 0);
}

/**
 * Parse a PDF buffer and extract text lines as a pseudo bank-statement array.
 * Returns rows in the same shape as parseBankStatement so the engine handles them uniformly.
 */
export async function parsePDFStatement(buffer) {
  const data = await pdf(buffer);
  const lines = data.text.split('\n').map(l => l.trim()).filter(Boolean);

  const rows = [];
  // Simple heuristic: look for lines containing a date pattern and a number
  const dateAmtPattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}-\d{2}-\d{2})/;
  const amtPattern = /[\d,]+\.\d{2}/;

  for (const line of lines) {
    if (!dateAmtPattern.test(line) || !amtPattern.test(line)) continue;
    const dateMatch = line.match(dateAmtPattern);
    const amtMatches = line.match(/[\d,]+\.\d{2}/g) || [];
    const refMatch = line.match(/[A-Z]{3,}\d{6,}/);

    rows.push({
      _rowIndex: rows.length,
      date: normalizeDate(dateMatch[0]),
      description: line.replace(dateAmtPattern, '').replace(/[\d,]+\.\d{2}/g, '').trim(),
      amount: normalizeAmount(amtMatches[amtMatches.length - 1]),
      reference: refMatch ? refMatch[0] : '',
      account: '',
    });
  }

  return rows.filter(r => r.date && r.amount > 0);
}

/**
 * Auto-detect file type by mimetype/extension and parse accordingly.
 * Returns { type, rows } where type is 'bank' | 'invoice' | 'payment'.
 */
export async function parseUploadedFile(file) {
  const ext = (file.originalname || '').toLowerCase().split('.').pop();
  const mime = (file.mimetype || '').toLowerCase();

  if (mime === 'application/pdf' || ext === 'pdf') {
    const rows = await parsePDFStatement(file.buffer);
    return { type: 'bank', rows, rowCount: rows.length };
  }

  const buf = file.buffer;
  const name = (file.originalname || '').toLowerCase();

  // Heuristic: decide which dataset this file represents
  if (name.includes('invoice') || name.includes('inv') || name.includes('gst')) {
    const rows = parseInvoices(buf);
    return { type: 'invoice', rows, rowCount: rows.length };
  }
  if (name.includes('payment') || name.includes('payout') || name.includes('gateway')) {
    const rows = parsePaymentRecords(buf);
    return { type: 'payment', rows, rowCount: rows.length };
  }
  // Default: bank statement
  const rows = parseBankStatement(buf);
  return { type: 'bank', rows, rowCount: rows.length };
}
