import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function EditTransactionModal({ transaction, isOpen, onClose, onSave }) {
  if (!isOpen || !transaction) return null;

  const [vendor, setVendor] = useState(transaction.vendor || '');
  const [amount, setAmount] = useState(transaction.amount || '');
  const [reference, setReference] = useState(transaction.reference || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        vendor,
        amount: Number(amount),
        reference,
        notes: notes || 'Updated transaction attributes manually'
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF9F6] rounded-2xl border border-[#DCD8CC] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-[#DBD7CB] flex items-center justify-between bg-[#F0EFEB]">
          <div>
            <h3 className="text-base font-black text-[#1A1A1A]">
              Edit Reconciliation Mapping
            </h3>
            <p className="text-xs text-[#6B786B] font-mono">
              Transaction ID: {transaction.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6B786B] hover:text-[#1A1A1A] hover:bg-[#EAE8DE]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
              Vendor Name
            </label>
            <input
              type="text"
              required
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#DBD7CB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C] font-semibold text-[#1A1A1A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
              Reconciled Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-white border border-[#DBD7CB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C] text-[#1A1A1A]"
            />
            <p className="text-[11px] text-[#6B786B] mt-1">
              Original: {formatCurrency(transaction.amount)} (Bank: {formatCurrency(transaction.bankAmount || 0)}, Inv: {formatCurrency(transaction.invoiceAmount || 0)})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
              Invoice / UTR Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-[#DBD7CB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C] text-[#1A1A1A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
              Audit Resolution Note
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Verified TDS deduction & corrected vendor alias"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#DBD7CB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C] text-[#1A1A1A]"
            />
          </div>

          <div className="pt-4 border-t border-[#EAE7DC] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#6B786B] hover:bg-[#EAE8DE] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-sm shadow-[#0B3C2C]/30 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Apply & Re-Match'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
