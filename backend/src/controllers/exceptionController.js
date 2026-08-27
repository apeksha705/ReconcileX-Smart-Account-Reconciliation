/**
 * exceptionController.js
 * GET /api/exceptions
 */

import { supabase } from '../config/supabase.js';
import { camelCaseTxn } from './reconciliationController.js';

export async function getExceptions(req, res) {
  try {
    const { category } = req.query;

    // Base query: any transaction flagged as needs_review or unmatched
    let query = supabase
      .from('transactions')
      .select('*')
      .in('status', ['needs_review', 'unmatched'])
      .order('date', { ascending: false });

    // Category / exception_type filter
    if (category && category !== 'all') {
      query = query.eq('exception_type', category);
    }

    const { data: exceptions, error } = await query;
    if (error) throw error;

    // Breakdown counts across ALL exception types (not filtered)
    const { data: allFlagged } = await supabase
      .from('transactions')
      .select('exception_type')
      .in('status', ['needs_review', 'unmatched']);

    const breakdown = {
      amount_mismatch:       0,
      missing_invoice:       0,
      missing_records:       0,
      duplicate_transaction: 0,
      vendor_mismatch:       0,
      date_mismatch:         0,
    };

    for (const row of allFlagged || []) {
      const key = row.exception_type;
      if (key && key in breakdown) breakdown[key]++;
    }

    // Merge missing_invoice into missing_records for frontend compatibility
    breakdown.missing_records += breakdown.missing_invoice;

    return res.json({
      exceptions:      (exceptions || []).map(camelCaseTxn),
      breakdown,
      totalExceptions: (exceptions || []).length,
    });
  } catch (err) {
    console.error('[getExceptions]', err);
    return res.status(500).json({ error: err.message });
  }
}
