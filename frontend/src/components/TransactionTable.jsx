import React from 'react';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfidenceScore from './ConfidenceScore';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionTable({
  transactions = [],
  onSelectTransaction,
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = "No transactions found matching your criteria."
}) {
  if (loading) {
    return (
      <div className="p-12 text-center bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4]">
        <div className="w-8 h-8 border-3 border-[#0B3C2C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-[#6B786B]">Loading reconciliation records...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-12 text-center bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4]">
        <div className="w-12 h-12 rounded-full bg-[#EAE8DE] text-[#7A8A7A] flex items-center justify-center mx-auto mb-3">
          <Receipt className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#1A1A1A]">No Transactions Found</h4>
        <p className="text-xs text-[#6B786B] mt-1 max-w-sm mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F0EFEB] border-b border-[#DBD7CB] text-[11px] font-black uppercase tracking-wider text-[#6B786B]">
              <th className="py-3.5 px-4">Transaction ID</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Vendor / Party</th>
              <th className="py-3.5 px-4 text-right">Amount (₹)</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-center">Match Status</th>
              <th className="py-3.5 px-4 text-center">Confidence</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE7DC] text-xs">
            {transactions.map((t) => (
              <tr
                key={t.id}
                onClick={() => onSelectTransaction && onSelectTransaction(t)}
                className="hover:bg-[#EBF2EB]/60 cursor-pointer transition-colors group"
              >
                {/* Transaction ID */}
                <td className="py-3.5 px-4 font-mono font-bold text-[#0B3C2C] group-hover:text-[#134E39]">
                  {t.id}
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-[#4A554A] font-medium whitespace-nowrap">
                  {formatDate(t.date)}
                </td>

                {/* Vendor */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-[#1A1A1A] truncate max-w-[180px]">
                    {t.vendor}
                  </div>
                  {t.reference && (
                    <span className="font-mono text-[10px] text-[#7A8A7A]">
                      Ref: {t.reference}
                    </span>
                  )}
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1A1A1A] tabular-nums">
                  {formatCurrency(t.amount)}
                </td>

                {/* Category */}
                <td className="py-3.5 px-4 text-[#4A554A] whitespace-nowrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EAE8DE] text-[#1A1A1A] border border-[#DBD7CB]">
                    {t.category || 'General'}
                  </span>
                </td>

                {/* Match Status Badge */}
                <td className="py-3.5 px-4 text-center">
                  <StatusBadge status={t.status} size="sm" />
                </td>

                {/* Confidence */}
                <td className="py-3.5 px-4 text-center">
                  <div className="flex justify-center">
                    <ConfidenceScore score={t.confidence} size="sm" />
                  </div>
                </td>

                {/* Action */}
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTransaction && onSelectTransaction(t);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#0B3C2C] hover:text-[#134E39] bg-[#D4E2D4]/60 hover:bg-[#D4E2D4] border border-[#B8CEB8] rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Audit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#DBD7CB] bg-[#F0EFEB] flex items-center justify-between text-xs text-[#6B786B]">
          <span>
            Page <strong className="text-[#1A1A1A]">{page}</strong> of{' '}
            <strong className="text-[#1A1A1A]">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="p-1 rounded-lg bg-[#FAF9F6] border border-[#DBD7CB] text-[#1A1A1A] hover:bg-[#EAE8DE] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="p-1 rounded-lg bg-[#FAF9F6] border border-[#DBD7CB] text-[#1A1A1A] hover:bg-[#EAE8DE] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
