import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  FileQuestion,
  Copy,
  Receipt,
  Scale,
  Calendar,
  Eye,
  CheckCircle2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfidenceScore from '../components/ConfidenceScore';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import DiscrepancyBarChart from '../components/Charts/DiscrepancyBarChart';
import { reconciliationService } from '../services/reconciliationService';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Exceptions({ showToast, onDataUpdated }) {
  const [exceptions, setExceptions] = useState([]);
  const [breakdown, setBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const loadExceptions = async () => {
    setLoading(true);
    try {
      const data = await reconciliationService.getExceptions(activeCategory);
      setExceptions(data.exceptions);
      setBreakdown(data.breakdown);
    } catch (err) {
      if (showToast) showToast('warning', 'Failed to load review queue', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExceptions();
  }, [activeCategory]);

  const handleStatusChange = async (id, newStatus, notes) => {
    try {
      await reconciliationService.updateTransactionStatus(id, newStatus, notes);
      loadExceptions();
      if (onDataUpdated) onDataUpdated();
      if (showToast) {
        showToast('success', `Exception Resolved`, `Transaction ${id} marked as ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Resolution failed', err.message);
    }
  };

  const handleEditSave = async (id, edits) => {
    try {
      await reconciliationService.updateTransactionStatus(id, 'matched', edits.notes, edits);
      loadExceptions();
      if (onDataUpdated) onDataUpdated();
      if (showToast) {
        showToast('success', `Exception Resolved & Matched`, `Transaction ${id} attributes updated`);
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Save failed', err.message);
    }
  };

  const categories = [
    { id: 'all', label: 'All Exceptions', count: exceptions.length, icon: AlertOctagon },
    { id: 'amount_mismatch', label: 'Amount Mismatch', count: breakdown?.amount_mismatch || 0, icon: Scale },
    { id: 'missing_invoice', label: 'Missing Invoice', count: breakdown?.missing_records || 0, icon: FileQuestion },
    { id: 'duplicate_transaction', label: 'Duplicate Payments', count: breakdown?.duplicate_transaction || 0, icon: Copy },
    { id: 'vendor_mismatch', label: 'Vendor Name Diff', count: breakdown?.vendor_mismatch || 0, icon: Receipt },
    { id: 'date_mismatch', label: 'Date Discrepancy', count: breakdown?.date_mismatch || 0, icon: Calendar },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-[#FAF9F6]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              Reconciliation Exceptions Queue
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FAF0D9] text-[#8A5C14] border border-[#E8D8B0]">
              {exceptions.length} Items Require Review
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B786B] mt-1 font-medium">
            Human-in-the-loop audit queue for resolving TDS withholding, vendor aliases, and missing records.
          </p>
        </div>
      </div>

      {/* Category Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#D4E2D4] border-[#0B3C2C] ring-2 ring-[#0B3C2C]/20 shadow-xs'
                  : 'bg-[#FAF9F6] border-[#DBD7CB] hover:border-[#B8CEB8] hover:bg-[#F2F0E8]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-[#0B3C2C] text-[#FAF9F6]' : 'bg-[#EAE8DE] text-[#4A554A]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-[#0B3C2C] text-[#FAF9F6]'
                      : 'bg-[#EAE8DE] text-[#1A1A1A]'
                  }`}
                >
                  {cat.count}
                </span>
              </div>
              <p className="text-xs font-bold text-[#1A1A1A] truncate">{cat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Review Queue List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-wider">
              Pending Audit Stream ({exceptions.length})
            </h3>
            <span className="text-xs text-[#6B786B] font-medium">Sorted by Severity (High First)</span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4]">
              <div className="w-8 h-8 border-3 border-[#0B3C2C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-[#6B786B]">Loading audit queue...</p>
            </div>
          ) : exceptions.length === 0 ? (
            <div className="p-12 text-center bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4]">
              <CheckCircle2 className="w-12 h-12 text-[#0B3C2C] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[#1A1A1A]">All Exceptions Cleared!</h4>
              <p className="text-xs text-[#6B786B] mt-1 max-w-sm mx-auto font-medium">
                No outstanding discrepancies require review. Great job maintaining ledger accuracy!
              </p>
            </div>
          ) : (
            exceptions.map((item) => {
              const isHigh = item.severity === 'High';
              const isMedium = item.severity === 'Medium';

              return (
                <div
                  key={item.id}
                  className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4] hover:border-[#CBD3CB] shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0B3C2C] text-xs">
                          {item.id}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            isHigh
                              ? 'bg-[#FDEBE8] text-[#9E3626] border border-[#F2C0B8]'
                              : isMedium
                              ? 'bg-[#FAF0D9] text-[#8A5C14] border border-[#E8D8B0]'
                              : 'bg-[#EAE8DE] text-[#4A554A] border border-[#D4D0C0]'
                          }`}
                        >
                          {item.severity || 'Medium'} Severity
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-[#1A1A1A]">
                        {item.vendor}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#4A554A] pt-1">
                        <span>
                          Reconciled Amount:{' '}
                          <strong className="font-mono text-[#1A1A1A]">
                            {formatCurrency(item.amount)}
                          </strong>
                        </span>
                        {item.bankAmount !== undefined && (
                          <span className="text-[#6B786B]">
                            Bank: <span className="font-mono">{formatCurrency(item.bankAmount)}</span>
                          </span>
                        )}
                        {item.invoiceAmount !== undefined && (
                          <span className="text-[#6B786B]">
                            Invoice:{' '}
                            <span className="font-mono">{formatCurrency(item.invoiceAmount)}</span>
                          </span>
                        )}
                        <span>Date: {formatDate(item.date)}</span>
                      </div>

                      {/* Problem Description Alert */}
                      {item.issues && item.issues.length > 0 && (
                        <div className="mt-2.5 p-3 rounded-xl bg-[#FAF0D9] border border-[#E8D8B0] text-xs text-[#8A5C14] space-y-1">
                          {item.issues.map((iss, i) => (
                            <p key={i} className="flex items-start gap-1.5 leading-relaxed font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#8A5C14] flex-shrink-0 mt-0.5" />
                              <span>{iss}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Review CTA */}
                    <div className="flex sm:flex-col items-end justify-between gap-2 self-end sm:self-center">
                      <ConfidenceScore score={item.confidence} size="sm" />
                      <button
                        onClick={() => setSelectedTransaction(item)}
                        className="px-4 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-xs shadow-[#0B3C2C]/30 flex items-center gap-1.5 transition-all whitespace-nowrap hover:scale-[1.02]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review & Match</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Root Cause Analytics Sidebar */}
        <div className="lg:col-span-1">
          <DiscrepancyBarChart breakdown={breakdown} />
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
        onStatusChange={handleStatusChange}
        onEditSave={handleEditSave}
      />
    </div>
  );
}
