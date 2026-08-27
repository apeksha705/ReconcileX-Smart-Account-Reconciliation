import React, { useState, useEffect } from 'react';
import {
  Save,
  Sliders,
  Building2
} from 'lucide-react';
import { reconciliationService } from '../services/reconciliationService';

export default function Settings({ showToast }) {
  const [settings, setSettings] = useState({
    autoMatchThreshold: 90,
    fuzzyVendorMatching: true,
    dateToleranceDays: 3,
    autoFlagDuplicateThresholdHours: 48,
    requireApprovalForTdsDifferences: true,
    businessName: 'Apex Retail & Logistics Pvt Ltd',
    gstin: '27AAACA9918B1ZX',
    pan: 'AAACA9918B',
    primaryCurrency: 'INR (₹)',
    notifyOnHighSeverity: true,
    notifyOnCompletion: true,
    emailAlerts: 'finance-ops@apexretail.in'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const data = await reconciliationService.getSettings();
      setSettings(data);
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reconciliationService.updateSettings(settings);
      if (showToast) {
        showToast('success', 'Preferences Saved', 'Reconciliation engine rules updated successfully');
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 bg-[#FAF9F6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
            Reconciliation Engine Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#6B786B] mt-1 font-medium">
            Configure matching tolerance rules, auto-approval thresholds, and entity credentials.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-sm shadow-[#0B3C2C]/30 flex items-center gap-2 transition-all self-start sm:self-auto hover:scale-[1.02]"
        >
          <Save className="w-3.5 h-3.5 text-[#D4E2D4]" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Matching & AI Engine Rules */}
        <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#E2DFD4] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE7DC]">
            <div className="p-2 rounded-xl bg-[#D4E2D4] text-[#0B3C2C]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1A1A1A]">Matching Preferences & Rules</h3>
              <p className="text-xs text-[#6B786B] font-medium">Heuristics for 3-way reconciliation correlation</p>
            </div>
          </div>

          {/* Auto-match Threshold Slider */}
          <div className="p-4 rounded-xl bg-[#F0EFEB] border border-[#DBD7CB] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Auto-Match Confidence Threshold
                </label>
                <p className="text-xs text-[#6B786B] mt-0.5 font-medium">
                  Transactions above this confidence score can be automatically matched and settled.
                </p>
              </div>
              <span className="text-xl font-black font-mono text-[#0B3C2C] bg-[#D4E2D4] px-3 py-1 rounded-xl border border-[#B8CEB8] shadow-2xs">
                {settings.autoMatchThreshold}%
              </span>
            </div>

            <input
              type="range"
              min="70"
              max="99"
              step="1"
              value={settings.autoMatchThreshold}
              onChange={(e) =>
                setSettings({ ...settings, autoMatchThreshold: Number(e.target.value) })
              }
              className="w-full h-2 bg-[#DBD7CB] rounded-lg appearance-none cursor-pointer accent-[#0B3C2C]"
            />
            <div className="flex justify-between text-[11px] text-[#6B786B] font-mono">
              <span>70% (Permissive)</span>
              <span>85% (Recommended)</span>
              <span>99% (Strict 1-to-1)</span>
            </div>
          </div>

          {/* Granular Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#DBD7CB] flex items-start justify-between gap-3 bg-[#FAF9F6]">
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">Fuzzy Vendor Matching</p>
                <p className="text-[11px] text-[#6B786B] mt-0.5">
                  Match trade names and parent entities (e.g. 'ABC Supplies' vs 'ABC Supplies Pvt Ltd')
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.fuzzyVendorMatching}
                onChange={(e) =>
                  setSettings({ ...settings, fuzzyVendorMatching: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#0B3C2C] focus:ring-[#0B3C2C] mt-1 cursor-pointer accent-[#0B3C2C]"
              />
            </div>

            <div className="p-4 rounded-xl border border-[#DBD7CB] flex items-start justify-between gap-3 bg-[#FAF9F6]">
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">TDS Difference Flagging</p>
                <p className="text-[11px] text-[#6B786B] mt-0.5">
                  Require human confirmation when invoice net difference matches 2% / 10% TDS withholding
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireApprovalForTdsDifferences}
                onChange={(e) =>
                  setSettings({ ...settings, requireApprovalForTdsDifferences: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#0B3C2C] focus:ring-[#0B3C2C] mt-1 cursor-pointer accent-[#0B3C2C]"
              />
            </div>
          </div>

          {/* Date Tolerance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                Date Settlement Tolerance Window (Days)
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={settings.dateToleranceDays}
                onChange={(e) =>
                  setSettings({ ...settings, dateToleranceDays: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 text-xs bg-[#F0EFEB] border border-[#DBD7CB] rounded-xl text-[#1A1A1A] font-mono font-bold"
              />
              <p className="text-[10px] text-[#6B786B] mt-1">
                Allow up to {settings.dateToleranceDays} days difference between invoice date and bank clearance.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                Duplicate Charge Window (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.autoFlagDuplicateThresholdHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoFlagDuplicateThresholdHours: Number(e.target.value)
                  })
                }
                className="w-full px-3.5 py-2 text-xs bg-[#F0EFEB] border border-[#DBD7CB] rounded-xl text-[#1A1A1A] font-mono font-bold"
              />
              <p className="text-[10px] text-[#6B786B] mt-1">
                Flag identical amounts within {settings.autoFlagDuplicateThresholdHours} hours as potential double debits.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Business Profile */}
        <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#E2DFD4] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE7DC]">
            <div className="p-2 rounded-xl bg-[#D4E2D4] text-[#0B3C2C]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1A1A1A]">Registered Business Entity</h3>
              <p className="text-xs text-[#6B786B] font-medium">Tax compliance and registered credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-[#F0EFEB] border border-[#DBD7CB] rounded-xl text-[#1A1A1A] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-[#F0EFEB] border border-[#DBD7CB] rounded-xl text-[#1A1A1A] font-mono font-bold"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
