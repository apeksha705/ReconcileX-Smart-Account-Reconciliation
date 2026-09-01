import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Calendar,
  Clock,
  User,
  Eye,
  FileCheck2,
  X,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { reconciliationService } from '../services/reconciliationService';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function History({ showToast }) {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await reconciliationService.getHistory({
        search,
        status: statusFilter,
      });
      setHistoryList(data);
    } catch (err) {
      if (showToast) showToast('warning', 'Failed to load history', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [search, statusFilter]);

  const handleExportAllHistory = () => {
    reconciliationService.exportHistoryCSV();
    if (showToast) {
      showToast('success', 'History Exported', 'Downloaded complete reconciliation batch audit summary');
    }
  };

  const handleExportSingleBatch = (batch) => {
    reconciliationService.exportTransactionsCSV(null, `ReconcileX_${batch.id}_Ledger.csv`);
    if (showToast) {
      showToast('success', `Batch ${batch.id} Exported`, 'Downloaded transaction ledger for this batch');
    }
  };

  // Lifetime Stats
  const totalBatches = historyList.length;
  const totalVolume = historyList.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const avgMatchRate = totalBatches > 0
    ? (historyList.reduce((acc, b) => acc + (Number(b.matchRate) || 0), 0) / totalBatches).toFixed(1)
    : 0;
  const totalExceptions = historyList.reduce((acc, b) => acc + (b.needsReview || 0), 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-[#FAF9F6]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              Reconciliation History & Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#D4E2D4] text-[#0B3C2C] border border-[#B8CEB8]">
              Immutable Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B786B] mt-1 font-medium">
            Inspect previous 3-way reconciliation batches, audit ledger snapshots, and performance records.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAllHistory}
            className="px-4 py-2 text-xs font-bold text-[#1A1A1A] bg-[#FAF9F6] hover:bg-[#EAE8DE] border border-[#DBD7CB] rounded-xl shadow-2xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#6B786B]" />
            <span>Export History CSV</span>
          </button>

          <button
            onClick={() => navigate('/reconcile')}
            className="px-4 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-sm shadow-[#0B3C2C]/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4E2D4]" />
            <span>New Batch Run</span>
          </button>
        </div>
      </div>

      {/* Lifetime KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B786B]">
            Total Batches Run
          </p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-black text-[#1A1A1A] font-mono">
            {totalBatches}
          </h3>
          <p className="text-xs text-[#6B786B] mt-2 font-medium">
            Permanent session audit log
          </p>
        </div>

        <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#B8CEB8] bg-gradient-to-b from-[#D4E2D4]/30 to-[#FAF9F6] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0B3C2C]">
            All-Time Reconciled Volume
          </p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-black text-[#0B3C2C] font-mono">
            {formatCurrency(totalVolume)}
          </h3>
          <p className="text-xs text-[#0B3C2C] mt-2 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified & Matched
          </p>
        </div>

        <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#B8CEB8] bg-gradient-to-b from-[#D4E2D4]/30 to-[#FAF9F6] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0B3C2C]">
            Lifetime Match Rate
          </p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-black text-[#0B3C2C] font-mono">
            {avgMatchRate}%
          </h3>
          <p className="text-xs text-[#0B3C2C] mt-2 font-medium">
            3-Way correlation accuracy
          </p>
        </div>

        <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8D8B0] bg-gradient-to-b from-[#FAF0D9]/30 to-[#FAF9F6] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8A5C14]">
            Exceptions Flagged
          </p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-black text-[#8A5C14] font-mono">
            {totalExceptions}
          </h3>
          <p className="text-xs text-[#8A5C14] mt-2 font-medium">
            TDS & alias items reviewed
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E2DFD4] shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#7A8A7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batch ID, period, name, or initiator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#F0EFEB] border border-[#DBD7CB] rounded-xl text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C] font-semibold"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8A7A] hover:text-[#1A1A1A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#EAE8DE] rounded-xl border border-[#DBD7CB] text-xs w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Batches' },
            { id: 'completed', label: 'Completed' },
            { id: 'audit_complete', label: 'Audit Complete' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#FAF9F6] text-[#1A1A1A] shadow-xs'
                  : 'text-[#6B786B] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Stream List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4]">
            <div className="w-8 h-8 border-3 border-[#0B3C2C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-[#6B786B]">Loading historical batch ledger...</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="p-12 text-center bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4]">
            <HistoryIcon className="w-12 h-12 text-[#7A8A7A] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#1A1A1A]">No History Batches Found</h4>
            <p className="text-xs text-[#6B786B] mt-1 max-w-sm mx-auto font-medium">
              No previous reconciliation records match your search criteria.
            </p>
          </div>
        ) : (
          historyList.map((batch) => (
            <div
              key={batch.id}
              className="p-6 bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4] hover:border-[#CBD3CB] shadow-xs hover:shadow-sm transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#EAE7DC]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#D4E2D4] text-[#0B3C2C] border border-[#B8CEB8]">
                    <Layers className="w-5 h-5 text-[#0B3C2C]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#0B3C2C] bg-[#D4E2D4]/50 px-2 py-0.5 rounded border border-[#B8CEB8]">
                        {batch.id}
                      </span>
                      <h3 className="text-sm font-black text-[#1A1A1A]">
                        {batch.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          batch.status === 'Completed' || batch.status === 'Audit Complete'
                            ? 'bg-[#D4E2D4] text-[#0B3C2C] border-[#B8CEB8]'
                            : 'bg-[#EAE8DE] text-[#6B786B] border-[#D4D0C0]'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B786B] mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {batch.period}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(batch.date).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {batch.initiatedBy}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleExportSingleBatch(batch)}
                    className="px-3 py-1.5 text-xs font-bold text-[#1A1A1A] bg-[#FAF9F6] hover:bg-[#EAE8DE] border border-[#DBD7CB] rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#6B786B]" />
                    <span>CSV Ledger</span>
                  </button>

                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="px-3.5 py-1.5 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-xs shadow-[#0B3C2C]/30 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Batch</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 bg-[#F0EFEB] rounded-xl border border-[#DBD7CB]">
                  <p className="text-[10px] font-bold uppercase text-[#6B786B]">Volume</p>
                  <p className="text-lg font-black text-[#1A1A1A] font-mono mt-0.5">
                    {formatCurrency(batch.totalAmount)}
                  </p>
                  <p className="text-[10px] text-[#6B786B] font-medium">{batch.totalTransactions} transactions</p>
                </div>

                <div className="p-3 bg-[#D4E2D4]/50 rounded-xl border border-[#B8CEB8]">
                  <p className="text-[10px] font-bold uppercase text-[#0B3C2C]">Match Accuracy</p>
                  <p className="text-lg font-black text-[#0B3C2C] font-mono mt-0.5">
                    {batch.matchRate}%
                  </p>
                  <p className="text-[10px] text-[#0B3C2C] font-bold">{batch.matched} auto-matched</p>
                </div>

                <div className="p-3 bg-[#FAF0D9] rounded-xl border border-[#E8D8B0]">
                  <p className="text-[10px] font-bold uppercase text-[#8A5C14]">Needs Review</p>
                  <p className="text-lg font-black text-[#8A5C14] font-mono mt-0.5">
                    {batch.needsReview}
                  </p>
                  <p className="text-[10px] text-[#8A5C14] font-medium">{formatCurrency(batch.reviewAmount || 0)}</p>
                </div>

                <div className="p-3 bg-[#FDEBE8] rounded-xl border border-[#F2C0B8]">
                  <p className="text-[10px] font-bold uppercase text-[#9E3626]">Unmatched</p>
                  <p className="text-lg font-black text-[#9E3626] font-mono mt-0.5">
                    {batch.unmatched}
                  </p>
                  <p className="text-[10px] text-[#9E3626] font-medium">{formatCurrency(batch.unmatchedAmount || 0)}</p>
                </div>
              </div>

              {/* Uploaded Files Strip */}
              {batch.files && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#6B786B]">
                  <span className="font-bold text-[#1A1A1A]">Source Datasets:</span>
                  {batch.files.map((file, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#EAE8DE] text-[#1A1A1A] border border-[#DBD7CB] font-mono"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-[#0B3C2C]" />
                      {file}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-2xl border border-[#DCD8CC] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#2D2D2D] flex items-center justify-between bg-[#1A1A1A] text-[#FAF9F6]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#0B3C2C] text-[#D4E2D4] border border-[#1E6B50]">
                  <FileCheck2 className="w-5 h-5 text-[#D4E2D4]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#FAF9F6]">{selectedBatch.name}</h3>
                  <p className="text-[10px] text-[#D4E2D4] font-mono">{selectedBatch.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-[#8C8C8C] hover:text-[#FAF9F6] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs text-[#1A1A1A] leading-relaxed flex-1">
              <div className="p-4 rounded-xl bg-[#F0EFEB] border border-[#DBD7CB] space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-[#6B786B]">Billing Cycle Period:</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">{selectedBatch.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#6B786B]">Execution Timestamp:</span>
                  <span className="font-mono text-[#1A1A1A]">
                    {new Date(selectedBatch.date).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#6B786B]">Engine Runtime:</span>
                  <span className="font-mono text-[#0B3C2C] font-bold">{selectedBatch.executionTime || '4.2s'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#6B786B]">Initiated By:</span>
                  <span className="font-semibold text-[#1A1A1A]">{selectedBatch.initiatedBy}</span>
                </div>
              </div>

              {/* 3-Way Match Distribution Bar */}
              <div>
                <h4 className="font-black text-[#1A1A1A] uppercase text-[11px] tracking-wider mb-2">
                  Reconciliation Outcome
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-[#D4E2D4]/50 border border-[#B8CEB8]">
                    <p className="text-[10px] font-bold text-[#0B3C2C] uppercase">Matched</p>
                    <p className="text-lg font-black text-[#0B3C2C] font-mono">{selectedBatch.matched}</p>
                    <p className="text-[10px] text-[#0B3C2C]">{formatCurrency(selectedBatch.matchedAmount || 0)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF0D9] border border-[#E8D8B0]">
                    <p className="text-[10px] font-bold text-[#8A5C14] uppercase">Needs Review</p>
                    <p className="text-lg font-black text-[#8A5C14] font-mono">{selectedBatch.needsReview}</p>
                    <p className="text-[10px] text-[#8A5C14]">{formatCurrency(selectedBatch.reviewAmount || 0)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FDEBE8] border border-[#F2C0B8]">
                    <p className="text-[10px] font-bold text-[#9E3626] uppercase">Unmatched</p>
                    <p className="text-lg font-black text-[#9E3626] font-mono">{selectedBatch.unmatched}</p>
                    <p className="text-[10px] text-[#9E3626]">{formatCurrency(selectedBatch.unmatchedAmount || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBatch.notes && (
                <div className="p-3.5 rounded-xl bg-[#EBF2EB] border border-[#B8CEB8] text-[#0B3C2C]">
                  <p className="font-bold text-[11px] mb-0.5">Audit Log Summary:</p>
                  <p>{selectedBatch.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-[#DBD7CB] bg-[#F0EFEB] flex items-center justify-between">
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 text-xs font-bold text-[#6B786B] hover:bg-[#EAE8DE] rounded-xl"
              >
                Close
              </button>

              <button
                onClick={() => {
                  handleExportSingleBatch(selectedBatch);
                  setSelectedBatch(null);
                }}
                className="px-4 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-sm shadow-[#0B3C2C]/30 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#D4E2D4]" />
                <span>Export Batch Audit CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
