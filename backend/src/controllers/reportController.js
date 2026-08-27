/**
 * reportController.js
 * GET /api/reports/summary
 * GET /api/reports/export   → CSV download stream
 */

import { supabase } from '../config/supabase.js';

// ─── GET /api/reports/summary ─────────────────────────────────────────────────
export async function getReportSummary(req, res) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('category, status, amount, date, severity, exception_type');

    if (error) throw error;
    const list = data || [];

    // Category breakdown
    const categoryMap = {};
    for (const t of list) {
      const cat = t.category || 'General';
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, amount: 0, matched: 0, flagged: 0 };
      categoryMap[cat].total++;
      categoryMap[cat].amount += parseFloat(t.amount) || 0;
      if (t.status === 'matched') categoryMap[cat].matched++;
      if (t.status !== 'matched') categoryMap[cat].flagged++;
    }

    const categoryBreakdown = Object.entries(categoryMap).map(([name, v]) => ({
      name,
      total:     v.total,
      amount:    parseFloat(v.amount.toFixed(2)),
      matched:   v.matched,
      flagged:   v.flagged,
      matchRate: v.total > 0 ? parseFloat(((v.matched / v.total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Quarterly rollup (group by quarter)
    const quarterMap = {};
    for (const t of list) {
      if (!t.date) continue;
      const d = new Date(t.date);
      const q = `Q${Math.ceil((d.getMonth() + 1) / 3)} FY${d.getFullYear()}`;
      if (!quarterMap[q]) quarterMap[q] = { total: 0, amount: 0, matched: 0 };
      quarterMap[q].total++;
      quarterMap[q].amount += parseFloat(t.amount) || 0;
      if (t.status === 'matched') quarterMap[q].matched++;
    }

    const quarterlyMetrics = Object.entries(quarterMap).map(([period, v]) => ({
      period,
      total:     v.total,
      amount:    parseFloat(v.amount.toFixed(2)),
      matched:   v.matched,
      matchRate: v.total > 0 ? parseFloat(((v.matched / v.total) * 100).toFixed(1)) : 0,
    }));

    // Exception type distribution
    const exceptionMap = {};
    for (const t of list) {
      if (!t.exception_type) continue;
      exceptionMap[t.exception_type] = (exceptionMap[t.exception_type] || 0) + 1;
    }

    // Severity distribution
    const severityMap = { High: 0, Medium: 0, Low: 0 };
    for (const t of list) {
      if (t.severity && severityMap[t.severity] !== undefined) {
        severityMap[t.severity]++;
      }
    }

    const totalAmount     = list.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const matchedAmount   = list.filter(t => t.status === 'matched').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const unmatchedAmount = list.filter(t => t.status === 'unmatched').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);

    return res.json({
      totalTransactions: list.length,
      totalAmount:       parseFloat(totalAmount.toFixed(2)),
      matchedAmount:     parseFloat(matchedAmount.toFixed(2)),
      unmatchedAmount:   parseFloat(unmatchedAmount.toFixed(2)),
      categoryBreakdown,
      quarterlyMetrics,
      exceptionDistribution: exceptionMap,
      severityDistribution:  severityMap,
    });
  } catch (err) {
    console.error('[getReportSummary]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/reports/export ──────────────────────────────────────────────────
export async function exportCSV(req, res) {
  try {
    const { batchId, status } = req.query;

    let query = supabase.from('transactions').select('*').order('date', { ascending: false });
    if (batchId) query = query.eq('batch_id', batchId);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    const filename = `ReconcileX_Report_${new Date().toISOString().slice(0, 10)}.csv`;

    const headers = [
      'Transaction ID', 'Batch ID', 'Date', 'Vendor', 'Category',
      'Amount (INR)', 'Bank Amount', 'Invoice Amount', 'Payment Amount',
      'Reference', 'Status', 'Confidence Score (%)', 'Severity',
      'Exception Type', 'Issues / Discrepancy', 'Reviewed', 'Resolution Notes',
    ];

    const escapeCSV = (v) => {
      const s = String(v ?? '').replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    };

    const csvLines = [
      headers.join(','),
      ...rows.map(t => [
        t.id,
        t.batch_id || '',
        t.date,
        escapeCSV(t.vendor),
        escapeCSV(t.category),
        t.amount,
        t.bank_amount    || 0,
        t.invoice_amount || 0,
        t.payment_amount || 0,
        t.reference      || '',
        t.status.toUpperCase(),
        t.confidence,
        t.severity       || 'N/A',
        t.exception_type || '',
        escapeCSV((t.issues || []).join('; ')),
        t.reviewed ? 'Yes' : 'No',
        escapeCSV(t.resolution_notes || ''),
      ].join(',')),
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvLines.join('\r\n'));
  } catch (err) {
    console.error('[exportCSV]', err);
    return res.status(500).json({ error: err.message });
  }
}
