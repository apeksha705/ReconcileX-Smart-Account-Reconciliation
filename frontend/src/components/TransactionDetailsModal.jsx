import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Edit3,
  Calendar,
  Building2,
  Sparkles
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import ConfidenceScore from './ConfidenceScore';
import MatchingEvidence from './MatchingEvidence';
import EditTransactionModal from './EditTransactionModal';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  onStatusChange,
  onEditSave
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      if (onStatusChange) {
        await onStatusChange(transaction.id, 'matched', 'Approved manually in review mode');
      }
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      if (onStatusChange) {
        await onStatusChange(transaction.id, 'unmatched', 'Rejected manually - discrepancy unresolved');
      }
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#FAF9F6] rounded-2xl border border-[#DCD8CC] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-[#DBD7CB] flex items-center justify-between bg-[#F0EFEB]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#D4E2D4] text-[#0B3C2C] font-mono font-bold text-xs border border-[#B8CEB8]">
                {transaction.id}
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                  <span>Transaction #{transaction.id}</span>
                  <StatusBadge status={transaction.status} size="sm" />
                </h3>
                <p className="text-xs text-[#6B786B] font-medium">
                  Explainable Reconciliation Audit Trail
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B786B] hover:text-[#1A1A1A] hover:bg-[#EAE8DE] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Primary Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F4F3ED] border border-[#E2DFD4]">
              <div>
                <p className="text-[10px] font-bold text-[#6B786B] uppercase tracking-wider">
                  Amount
                </p>
                <p className="text-xl font-black text-[#1A1A1A] font-mono mt-0.5">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#6B786B] uppercase tracking-wider">
                  Date
                </p>
                <p className="text-sm font-bold text-[#1A1A1A] mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#6B786B]" />
                  {formatDate(transaction.date)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#6B786B] uppercase tracking-wider">
                  Vendor
                </p>
                <p className="text-sm font-bold text-[#1A1A1A] mt-1 truncate flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#6B786B] flex-shrink-0" />
                  <span className="truncate">{transaction.vendor}</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#6B786B] uppercase tracking-wider">
                  Reference
                </p>
                <p className="text-xs font-mono font-bold text-[#1A1A1A] mt-1 bg-[#FAF9F6] px-2 py-0.5 rounded-md border border-[#DBD7CB] truncate inline-block">
                  {transaction.reference || 'N/A'}
                </p>
              </div>
            </div>

            {/* Visual Confidence Meter */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DFD4] shadow-xs">
              <ConfidenceScore score={transaction.confidence} size="lg" />
            </div>

            {/* Explainable Matching Evidence */}
            <MatchingEvidence transaction={transaction} />
          </div>

          {/* Modal Footer Actions */}
          <div className="px-6 py-4 border-t border-[#DBD7CB] bg-[#F0EFEB] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-[#0B3C2C] bg-[#D4E2D4]/60 hover:bg-[#D4E2D4] border border-[#B8CEB8] rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#0B3C2C]" />
                <span>Edit Details</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-4 py-2 text-xs font-bold text-[#9E3626] bg-[#FDEBE8] hover:bg-[#FCD8D4] border border-[#F2C0B8] rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-5 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-sm shadow-[#0B3C2C]/30 flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Match</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Edit Modal */}
      <EditTransactionModal
        transaction={transaction}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={async (edits) => {
          if (onEditSave) {
            await onEditSave(transaction.id, edits);
          }
        }}
      />
    </>
  );
}
