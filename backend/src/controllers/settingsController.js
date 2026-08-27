/**
 * settingsController.js
 * GET /api/settings
 * PUT /api/settings
 */

import { supabase } from '../config/supabase.js';

const DEFAULT_SETTINGS = {
  id:                                      1,
  business_name:                           'Apex Retail & Logistics Pvt Ltd',
  gstin:                                   '27AAACA9918B1ZX',
  pan:                                     'AAACA9918B',
  primary_currency:                        'INR (₹)',
  auto_match_threshold:                    90,
  fuzzy_vendor_matching:                   true,
  date_tolerance_days:                     3,
  auto_flag_duplicate_threshold_hours:     48,
  require_approval_for_tds_differences:    true,
  notify_on_high_severity:                 true,
  notify_on_completion:                    true,
  email_alerts:                            'finance-ops@apexretail.in',
};

function toClientShape(row) {
  return {
    businessName:                       row.business_name,
    gstin:                              row.gstin,
    pan:                                row.pan,
    primaryCurrency:                    row.primary_currency,
    autoMatchThreshold:                 row.auto_match_threshold,
    fuzzyVendorMatching:                row.fuzzy_vendor_matching,
    dateToleranceDays:                  row.date_tolerance_days,
    autoFlagDuplicateThresholdHours:    row.auto_flag_duplicate_threshold_hours,
    requireApprovalForTdsDifferences:   row.require_approval_for_tds_differences,
    notifyOnHighSeverity:               row.notify_on_high_severity,
    notifyOnCompletion:                 row.notify_on_completion,
    emailAlerts:                        row.email_alerts,
    updatedAt:                          row.updated_at,
  };
}

function toDbShape(body) {
  const db = {};
  if (body.businessName                     !== undefined) db.business_name                           = body.businessName;
  if (body.gstin                            !== undefined) db.gstin                                   = body.gstin;
  if (body.pan                              !== undefined) db.pan                                     = body.pan;
  if (body.primaryCurrency                  !== undefined) db.primary_currency                        = body.primaryCurrency;
  if (body.autoMatchThreshold               !== undefined) db.auto_match_threshold                    = Number(body.autoMatchThreshold);
  if (body.fuzzyVendorMatching              !== undefined) db.fuzzy_vendor_matching                   = Boolean(body.fuzzyVendorMatching);
  if (body.dateToleranceDays                !== undefined) db.date_tolerance_days                     = Number(body.dateToleranceDays);
  if (body.autoFlagDuplicateThresholdHours  !== undefined) db.auto_flag_duplicate_threshold_hours     = Number(body.autoFlagDuplicateThresholdHours);
  if (body.requireApprovalForTdsDifferences !== undefined) db.require_approval_for_tds_differences    = Boolean(body.requireApprovalForTdsDifferences);
  if (body.notifyOnHighSeverity             !== undefined) db.notify_on_high_severity                 = Boolean(body.notifyOnHighSeverity);
  if (body.notifyOnCompletion               !== undefined) db.notify_on_completion                    = Boolean(body.notifyOnCompletion);
  if (body.emailAlerts                      !== undefined) db.email_alerts                            = body.emailAlerts;
  db.updated_at = new Date().toISOString();
  return db;
}

// ─── GET /api/settings ────────────────────────────────────────────────────────
export async function getSettings(req, res) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      // Return defaults if row doesn't exist yet
      return res.json(toClientShape(DEFAULT_SETTINGS));
    }

    return res.json(toClientShape(data));
  } catch (err) {
    console.error('[getSettings]', err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── PUT /api/settings ────────────────────────────────────────────────────────
export async function updateSettings(req, res) {
  try {
    const updates = toDbShape(req.body);

    // Upsert so it works even if the row doesn't exist yet
    const { data, error } = await supabase
      .from('settings')
      .upsert({ id: 1, ...updates }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;

    return res.json(toClientShape(data));
  } catch (err) {
    console.error('[updateSettings]', err);
    return res.status(500).json({ error: err.message });
  }
}
