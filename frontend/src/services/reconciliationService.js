import { INITIAL_TRANSACTIONS, INITIAL_HISTORY } from '../data/mockTransactions';

// ─────────────────────────────────────────────────────────────────────────────
// 🔌 LIVE API TOGGLE
// Set USE_LIVE_API = true  →  calls the Node.js/Express backend at API_BASE_URL
// Set USE_LIVE_API = false →  runs entirely in localStorage (no backend needed)
// ─────────────────────────────────────────────────────────────────────────────
const USE_LIVE_API = true;
// In development: set VITE_API_URL in frontend/.env.local
// In production (Vercel): set VITE_API_URL in Vercel environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Shared fetch helper ──────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status} – ${path}`);
  }
  return res.json();
}

// ─── Local storage keys ───────────────────────────────────────────────────────
const STORAGE_KEY  = 'reconcilex_transactions_v1';
const SETTINGS_KEY = 'reconcilex_settings_v1';
const HISTORY_KEY  = 'reconcilex_history_v1';

const DEFAULT_SETTINGS = {
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
  emailAlerts: 'finance-ops@apexretail.in',
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
function getStoredTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }
  return [...INITIAL_TRANSACTIONS];
}

function saveStoredTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function getStoredHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read history from localStorage:', e);
  }
  return [...INITIAL_HISTORY];
}

function saveStoredHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save history to localStorage:', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Layer — all methods auto-switch between live API and localStorage
// ─────────────────────────────────────────────────────────────────────────────
export const reconciliationService = {

  // ── GET /api/transactions ──────────────────────────────────────────────────
  async getTransactions(filters = {}) {
    if (USE_LIVE_API) {
      const params = new URLSearchParams();
      if (filters.status   && filters.status   !== 'all') params.set('status',    filters.status);
      if (filters.search)                                  params.set('search',    filters.search);
      if (filters.severity && filters.severity !== 'all') params.set('severity',  filters.severity);
      if (filters.minAmount !== undefined && filters.minAmount !== '') params.set('minAmount', filters.minAmount);
      if (filters.maxAmount !== undefined && filters.maxAmount !== '') params.set('maxAmount', filters.maxAmount);
      if (filters.sortBy)                                  params.set('sortBy',    filters.sortBy);
      if (filters.page)                                    params.set('page',      filters.page);
      if (filters.limit)                                   params.set('limit',     filters.limit);
      const data = await apiFetch(`/transactions?${params}`);
      return data.transactions ?? data;
    }

    // ── Mock mode ────────────────────────────────────────────────────────────
    await new Promise((res) => setTimeout(res, 80));
    let list = getStoredTransactions();

    if (filters.status && filters.status !== 'all') list = list.filter((t) => t.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter((t) =>
        t.id.toLowerCase().includes(q) ||
        t.vendor.toLowerCase().includes(q) ||
        t.reference?.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }
    if (filters.severity && filters.severity !== 'all') list = list.filter((t) => t.severity === filters.severity);
    if (filters.minAmount !== undefined && filters.minAmount !== '') list = list.filter((t) => t.amount >= Number(filters.minAmount));
    if (filters.maxAmount !== undefined && filters.maxAmount !== '') list = list.filter((t) => t.amount <= Number(filters.maxAmount));
    if (filters.sortBy) {
      list = [...list].sort((a, b) => {
        if (filters.sortBy === 'amount-asc')       return a.amount     - b.amount;
        if (filters.sortBy === 'amount-desc')      return b.amount     - a.amount;
        if (filters.sortBy === 'confidence-desc')  return b.confidence - a.confidence;
        if (filters.sortBy === 'confidence-asc')   return a.confidence - b.confidence;
        if (filters.sortBy === 'date-asc')         return new Date(a.date) - new Date(b.date);
        return new Date(b.date) - new Date(a.date);
      });
    }
    return list;
  },

  // ── GET /api/transactions/:id ──────────────────────────────────────────────
  async getTransactionById(id) {
    if (USE_LIVE_API) return apiFetch(`/transactions/${id}`);

    await new Promise((res) => setTimeout(res, 60));
    const item = getStoredTransactions().find((t) => t.id === id);
    if (!item) throw new Error(`Transaction ${id} not found`);
    return item;
  },

  // ── GET /api/dashboard/stats ───────────────────────────────────────────────
  async getDashboardStats() {
    if (USE_LIVE_API) return apiFetch('/dashboard/stats');

    await new Promise((res) => setTimeout(res, 60));
    const list = getStoredTransactions();
    const total       = list.length;
    const matched     = list.filter((t) => t.status === 'matched').length;
    const needsReview = list.filter((t) => t.status === 'needs_review').length;
    const unmatched   = list.filter((t) => t.status === 'unmatched').length;
    const totalAmount     = list.reduce((s, t) => s + (t.amount || 0), 0);
    const matchedAmount   = list.filter((t) => t.status === 'matched').reduce((s, t) => s + (t.amount || 0), 0);
    const reviewAmount    = list.filter((t) => t.status === 'needs_review').reduce((s, t) => s + (t.amount || 0), 0);
    const unmatchedAmount = list.filter((t) => t.status === 'unmatched').reduce((s, t) => s + (t.amount || 0), 0);
    const matchRate   = total > 0 ? Math.round((matched / total) * 100) : 0;
    return {
      totalTransactions: total, matched, needsReview, unmatched, matchRate,
      totalAmount, matchedAmount, reviewAmount, unmatchedAmount,
      scaledStats: {
        totalTransactions: 1248 + total - INITIAL_TRANSACTIONS.length,
        matched:     1043 + (matched     - INITIAL_TRANSACTIONS.filter((t) => t.status === 'matched').length),
        needsReview: 127  + (needsReview - INITIAL_TRANSACTIONS.filter((t) => t.status === 'needs_review').length),
        unmatched:   78   + (unmatched   - INITIAL_TRANSACTIONS.filter((t) => t.status === 'unmatched').length),
      },
    };
  },

  // ── GET /api/exceptions ────────────────────────────────────────────────────
  async getExceptions(category = 'all') {
    if (USE_LIVE_API) {
      const params = category !== 'all' ? `?category=${category}` : '';
      return apiFetch(`/exceptions${params}`);
    }

    await new Promise((res) => setTimeout(res, 60));
    const list = getStoredTransactions();
    let exceptions = list.filter((t) => t.status === 'needs_review' || t.status === 'unmatched');
    if (category !== 'all') exceptions = exceptions.filter((t) => t.exceptionType === category);
    return {
      exceptions,
      breakdown: {
        missing_records:       list.filter((t) => t.exceptionType === 'missing_records' || t.exceptionType === 'missing_invoice').length,
        duplicate_transaction: list.filter((t) => t.exceptionType === 'duplicate_transaction').length,
        amount_mismatch:       list.filter((t) => t.exceptionType === 'amount_mismatch').length,
        vendor_mismatch:       list.filter((t) => t.exceptionType === 'vendor_mismatch').length,
        date_mismatch:         list.filter((t) => t.exceptionType === 'date_mismatch').length,
      },
      totalExceptions: exceptions.length,
    };
  },

  // ── PATCH /api/transactions/:id/status ────────────────────────────────────
  async updateTransactionStatus(id, newStatus, notes = '', edits = null) {
    if (USE_LIVE_API) {
      return apiFetch(`/transactions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, notes, edits }),
      });
    }

    await new Promise((res) => setTimeout(res, 120));
    const list  = getStoredTransactions();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Transaction ${id} not found`);
    const current = list[index];
    const updated = {
      ...current,
      status: newStatus,
      reviewed: true,
      resolutionNotes: notes || current.resolutionNotes,
      confidence: newStatus === 'matched' ? 98 : newStatus === 'unmatched' ? 25 : current.confidence,
    };
    if (newStatus === 'matched' && current.issues?.length > 0) {
      updated.matchReasons = [...(current.matchReasons || []), `Manually resolved & approved: ${notes || 'Verified by Finance Operations'}`];
      updated.issues = [];
    }
    if (edits) {
      if (edits.amount)    updated.amount    = Number(edits.amount);
      if (edits.vendor)    updated.vendor    = edits.vendor;
      if (edits.reference) updated.reference = edits.reference;
    }
    list[index] = updated;
    saveStoredTransactions(list);
    return updated;
  },

  // ── POST /api/reconciliation/upload (live only) ────────────────────────────
  async uploadFiles(bankFile, invoiceFile, paymentFile, sessionId) {
    if (!USE_LIVE_API) return { success: true, summary: {} };
    const formData = new FormData();
    if (bankFile)    formData.append('bankStatement',  bankFile);
    if (invoiceFile) formData.append('invoices',       invoiceFile);
    if (paymentFile) formData.append('paymentRecords', paymentFile);
    const res = await fetch(`${API_BASE_URL}/reconciliation/upload`, {
      method:  'POST',
      headers: sessionId ? { 'X-Session-Id': sessionId } : {},
      body:    formData,
    });
    if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
    return res.json();
  },

  // ── POST /api/reconciliation/start ────────────────────────────────────────
  async startReconciliation(files, onProgress, sessionId) {
    if (USE_LIVE_API) {
      // Upload files first
      if (files?.bankFile || files?.invoiceFile || files?.paymentFile) {
        await this.uploadFiles(files.bankFile, files.invoiceFile, files.paymentFile, sessionId);
      }
      // Simulate progress stages on the UI while waiting for the server
      const stages = [
        { step: 1, name: 'Upload',     message: 'Ingesting CSV/PDF files & parsing 3-way data streams...' },
        { step: 2, name: 'Extract',    message: 'Extracting narration tokens, GSTINs, and UTR reference codes...' },
        { step: 3, name: 'Clean',      message: 'Normalizing merchant names & standardizing date formats...' },
        { step: 4, name: 'Match',      message: 'Executing 3-way fuzzy matching & ledger mapping algorithm...' },
        { step: 5, name: 'Detect',     message: 'Running anomaly detection for duplicates and TDS gaps...' },
        { step: 6, name: 'Review',     message: 'Categorizing high-confidence matches and isolating review queue...' },
        { step: 7, name: 'Reconcile',  message: 'Finalizing ledger entries and generating balance summary...' },
      ];
      // Fire /start and animate progress in parallel
      const startPromise = apiFetch('/reconciliation/start', {
        method:  'POST',
        headers: sessionId ? { 'X-Session-Id': sessionId } : {},
        body:    JSON.stringify({ sessionId }),
      });
      for (let i = 0; i < stages.length; i++) {
        if (onProgress) onProgress({ ...stages[i], progress: Math.round(((i + 1) / stages.length) * 100) });
        await new Promise((r) => setTimeout(r, 500));
      }
      return startPromise;
    }

    // ── Mock mode ─────────────────────────────────────────────────────────────
    const stages = [
      { step: 1, name: 'Upload',    message: 'Ingesting CSV/PDF files & parsing 3-way data streams...' },
      { step: 2, name: 'Extract',   message: 'Extracting narration tokens, GSTINs, and UTR reference codes...' },
      { step: 3, name: 'Clean',     message: 'Normalizing merchant names & standardizing date formats...' },
      { step: 4, name: 'Match',     message: 'Executing 3-way fuzzy matching & ledger mapping algorithm...' },
      { step: 5, name: 'Detect',    message: 'Running AI anomaly detection for duplicates and TDS gaps...' },
      { step: 6, name: 'Review',    message: 'Categorizing high-confidence matches and isolating review queue...' },
      { step: 7, name: 'Reconcile', message: 'Finalizing ledger entries and generating balance summary...' },
    ];
    for (let i = 0; i < stages.length; i++) {
      if (onProgress) onProgress({ ...stages[i], progress: Math.round(((i + 1) / stages.length) * 100) });
      await new Promise((r) => setTimeout(r, 600));
    }
    const freshData = [...INITIAL_TRANSACTIONS];
    saveStoredTransactions(freshData);
    const stats = await this.getDashboardStats();
    const newBatchId = `BATCH-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newBatch = {
      id: newBatchId,
      name: `Reconciliation Run #${newBatchId.slice(-3)}`,
      date: new Date().toISOString(),
      period: '01 Aug 2026 - 26 Aug 2026',
      status: 'Completed',
      totalTransactions: stats.scaledStats?.totalTransactions || 1248,
      matched:     stats.scaledStats?.matched     || 1043,
      needsReview: stats.scaledStats?.needsReview || 127,
      unmatched:   stats.scaledStats?.unmatched   || 78,
      matchRate:   stats.matchRate || 94.2,
      totalAmount:     stats.totalAmount     || 589250,
      matchedAmount:   stats.matchedAmount   || 520000,
      reviewAmount:    stats.reviewAmount    || 42500,
      unmatchedAmount: stats.unmatchedAmount || 26750,
      executionTime: '4.2s',
      initiatedBy: 'Ananya Deshmukh (Head of Finance)',
      files: [
        files?.bankFile?.name    || 'HDFC_Current_Account_Stmt_Aug2026.csv',
        files?.invoiceFile?.name || 'Vendor_Tax_Invoices_Q3_Batch.csv',
        files?.paymentFile?.name || 'Payouts_Gateway_Records_Aug2026.csv',
      ],
      notes: `Automated 3-way reconciliation generated successfully. ${stats.matched || 20} records matched immediately.`,
    };
    const history = getStoredHistory();
    history.unshift(newBatch);
    saveStoredHistory(history);
    return { success: true, batchId: newBatchId, reconciledAt: new Date().toISOString(), stats, totalProcessed: freshData.length };
  },

  // ── GET /api/reconciliation/history ───────────────────────────────────────
  async getHistory(filters = {}) {
    if (USE_LIVE_API) {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      return apiFetch(`/reconciliation/history?${params}`);
    }

    await new Promise((res) => setTimeout(res, 80));
    let list = getStoredHistory();
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter((b) =>
        b.id.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.period.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter((b) => b.status.toLowerCase().replace(/\s+/g, '_') === filters.status.toLowerCase());
    }
    return list;
  },

  // ── GET /api/reconciliation/history/:id ───────────────────────────────────
  async getHistoryBatchById(id) {
    if (USE_LIVE_API) return apiFetch(`/reconciliation/history/${id}`);

    await new Promise((res) => setTimeout(res, 60));
    const batch = getStoredHistory().find((b) => b.id === id);
    if (!batch) throw new Error(`Batch ${id} not found in history`);
    return batch;
  },

  // ── DELETE /api/reconciliation/history/:id ────────────────────────────────
  async deleteHistoryBatch(id) {
    if (USE_LIVE_API) {
      await apiFetch(`/reconciliation/history/${id}`, { method: 'DELETE' });
      return true;
    }
    await new Promise((res) => setTimeout(res, 100));
    saveStoredHistory(getStoredHistory().filter((b) => b.id !== id));
    return true;
  },

  // ── GET /api/reports/summary ───────────────────────────────────────────────
  async getReportSummary() {
    if (USE_LIVE_API) return apiFetch('/reports/summary');
    return null; // not available in mock mode
  },

  // ── GET /api/reports/export ────────────────────────────────────────────────
  exportTransactionsCSV(transactions, customFilename = null) {
    if (USE_LIVE_API) {
      window.open(`${API_BASE_URL}/reports/export`, '_blank');
      return true;
    }
    const list = transactions || getStoredTransactions();
    const headers = [
      'Transaction ID','Date','Vendor','Category','Amount (INR)',
      'Bank Amount','Invoice Amount','Payment Amount','Reference',
      'Status','Confidence Score (%)','Severity','Issues / Discrepancy',
    ];
    const rows = list.map((t) => [
      t.id, t.date,
      `"${(t.vendor   || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount, t.bankAmount || 0, t.invoiceAmount || 0, t.paymentAmount || 0,
      t.reference || '', t.status.toUpperCase(), t.confidence, t.severity || 'N/A',
      `"${(t.issues || []).join('; ').replace(/"/g, '""')}"`,
    ]);
    const csv  = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = customFilename || `ReconcileX_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  },

  async exportHistoryCSV() {
    if (USE_LIVE_API) {
      // Fetch live history from API, then build CSV client-side
      try {
        const list = await apiFetch('/reconciliation/history');
        const headers = ['Batch ID','Batch Name','Execution Date','Billing Period','Status','Total Transactions','Matched','Needs Review','Unmatched','Match Rate (%)','Total Amount (INR)','Initiated By'];
        const rows = list.map((b) => [b.id, `"${(b.name||'').replace(/"/g,'""')}"`, b.date, `"${b.period||''}"`, b.status, b.totalTransactions, b.matched, b.needsReview, b.unmatched, Number(b.matchRate), b.totalAmount, `"${b.initiatedBy||''}"`]);
        const csv  = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ReconcileX_Audit_History_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
      } catch (e) {
        console.warn('exportHistoryCSV live fetch failed:', e.message);
        return false;
      }
    }
    const list = getStoredHistory();
    const headers = ['Batch ID','Batch Name','Execution Date','Billing Period','Status','Total Transactions','Matched','Needs Review','Unmatched','Match Rate (%)','Total Amount (INR)','Initiated By'];
    const rows = list.map((b) => [b.id, `"${(b.name||'').replace(/"/g,'""')}"`, b.date, `"${b.period||''}"`, b.status, b.totalTransactions, b.matched, b.needsReview, b.unmatched, Number(b.matchRate), b.totalAmount, `"${b.initiatedBy||''}"`]);
    const csv  = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReconcileX_Audit_History_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  },

  // ── GET /api/settings ─────────────────────────────────────────────────────
  async getSettings() {
    if (USE_LIVE_API) return apiFetch('/settings');

    await new Promise((res) => setTimeout(res, 50));
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.warn(e); }
    return { ...DEFAULT_SETTINGS };
  },

  // ── PUT /api/settings ──────────────────────────────────────────────────────
  async updateSettings(newSettings) {
    if (USE_LIVE_API) {
      return apiFetch('/settings', { method: 'PUT', body: JSON.stringify(newSettings) });
    }

    await new Promise((res) => setTimeout(res, 80));
    const merged = { ...DEFAULT_SETTINGS, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  },

  // ── Reset to original mock dataset ────────────────────────────────────────
  resetToDefaultData() {
    saveStoredTransactions([...INITIAL_TRANSACTIONS]);
    saveStoredHistory([...INITIAL_HISTORY]);
    return [...INITIAL_TRANSACTIONS];
  },
};
