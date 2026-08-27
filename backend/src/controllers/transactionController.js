/**
 * transactionController.js
 * GET   /api/transactions
 * GET   /api/transactions/:id
 * PATCH /api/transactions/:id/status
 */

import { supabase } from '../config/supabase.js';
import { camelCaseTxn } from './reconciliationController.js';

// ─── GET /api/transactions ────────────────────────────────────────────────────
export async function getTransactions(req, res) {
  try {
    const {
      search, status, severity,
      minAmount, maxAmount,
      sortBy, page = 1, limit = 50,
    } = req.query;

    let query = supabase.from('transactions').select('*', { count: 'exact' });

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Severity filter
    if (severity && severity !== 'all') {
      query = query.eq('severity', severity);
    }

    // Amount range
    if (minAmount !== undefined && minAmount !== '') {
      query = query.gte('amount', Number(minAmount));
    }
    if (maxAmount !== undefined && maxAmount !== '') {
      query = query.lte('amount', Number(maxAmount));
    }

    // Text search across vendor, id, reference, category
    if (search) {
      query = query.or(
        `id.ilike.%${search}%,vendor.ilike.%${search}%,reference.ilike.%${search}%,category.ilike.%${search}%`
      );
    }

    // Sorting
    const sortMap = {
      'amount-asc':       { col: 'amount',     asc: true  },
      'amount-desc':      { col: 'amount',     asc: false },
      'confidence-asc':   { col: 'confidence', asc: true  },
      'confidence-desc':  { col: 'confidence', asc: false },
      'date-asc':         { col: 'date',       asc: true  },
      'date-desc':        { col: 'date',       asc: false },
    };
    const sort = sortMap[sortBy] || { col: 'date', asc: false };
    query = query.order(sort.col, { ascending: sort.asc });

    // Pagination
    const pageNum  = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const from     = (pageNum - 1) * pageSize;
    const to       = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return res.json({
      transactions: (data || []).map(camelCaseTxn),
      total:        count ?? 0,
      page:         pageNum,
      limit:        pageSize,
      totalPages:   Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    console.error('[getTransactions]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/transactions/:id ────────────────────────────────────────────────
export async function getTransactionById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: `Transaction ${id} not found` });
    }

    return res.json(camelCaseTxn(data));
  } catch (err) {
    console.error('[getTransactionById]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── PATCH /api/transactions/:id/status ───────────────────────────────────────
export async function updateTransactionStatus(req, res) {
  try {
    const { id }                         = req.params;
    const { status, notes, edits = {} }  = req.body;

    if (!['matched', 'unmatched', 'needs_review'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Fetch current record
    const { data: current, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !current) {
      return res.status(404).json({ error: `Transaction ${id} not found` });
    }

    const confidenceMap = { matched: 98, unmatched: 25, needs_review: current.confidence };
    const updatedConfidence = confidenceMap[status] ?? current.confidence;

    const matchReasons = current.match_reasons || [];
    const updatedReasons = status === 'matched'
      ? [...matchReasons, `Manually resolved & approved: ${notes || 'Verified by Finance Operations'}`]
      : matchReasons;

    const updates = {
      status,
      confidence:       updatedConfidence,
      reviewed:         true,
      resolution_notes: notes || current.resolution_notes,
      match_reasons:    updatedReasons,
      issues:           status === 'matched' ? [] : current.issues,
      updated_at:       new Date().toISOString(),
    };

    // Apply field-level edits
    if (edits.amount)    updates.amount    = Number(edits.amount);
    if (edits.vendor)    updates.vendor    = edits.vendor;
    if (edits.reference) updates.reference = edits.reference;

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json(camelCaseTxn(data));
  } catch (err) {
    console.error('[updateTransactionStatus]', err);
    return res.status(500).json({ error: err.message });
  }
}
