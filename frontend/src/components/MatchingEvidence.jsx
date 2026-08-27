import React from 'react';
import {
  Landmark,
  FileSpreadsheet,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function MatchingEvidence({ transaction }) {
  if (!transaction) return null;

  const {
    bankRecord,
    invoiceRecord,
    paymentRecord,
    matchReasons = [],
    issues = [],
    status
  } = transaction;

  const isMatched = status === 'matched';
  const isReview = status === 'needs_review';
  const isUnmatched = status === 'unmatched';

  return (
    <div className="space-y-6">
      {/* Explainable Checklist */}
      <div className="p-4 rounded-xl bg-[#F4F3ED] border border-[#E2DFD4]">
        <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#0B3C2C]" />
          Why was this {isMatched ? 'matched' : isReview ? 'flagged for review' : 'unmatched'}?
        </h4>

        {matchReasons.length > 0 && (
          <div className="space-y-2 mb-3">
            {matchReasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#1A1A1A] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#0B3C2C] flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#DBD7CB]">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#8A5C14] font-semibold bg-[#FAF0D9] p-2.5 rounded-lg border border-[#E8D8B0]">
                <AlertTriangle className="w-4 h-4 text-[#8A5C14] flex-shrink-0 mt-0.5" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3-Way Evidence Matrix */}
      <div>
        <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider mb-3">
          3-Way Cross-Source Comparison
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Bank Statement Record */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              bankRecord
                ? 'bg-[#FAF9F6] border-[#DCD8CC]'
                : 'bg-[#FDEBE8]/40 border-[#F2C0B8] border-dashed'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#EAE7DC]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#D4E2D4] text-[#0B3C2C]">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#1A1A1A]">Bank Statement</span>
                </div>
                {bankRecord ? (
                  <span className="text-[10px] font-bold text-[#0B3C2C] bg-[#D4E2D4] px-2 py-0.5 rounded-md">
                    Found
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#9E3626] bg-[#FDEBE8] px-2 py-0.5 rounded-md">
                    Missing
                  </span>
                )}
              </div>

              {bankRecord ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Debit Amount</p>
                    <p className="font-mono font-bold text-[#1A1A1A] text-sm">
                      {formatCurrency(bankRecord.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Value Date</p>
                    <p className="font-semibold text-[#1A1A1A]">{formatDate(bankRecord.date)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Narration</p>
                    <p className="font-mono text-[11px] text-[#4A554A] bg-[#F0EFEB] p-1.5 rounded-md border border-[#E2DFD4] break-all">
                      {bankRecord.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Bank Account</p>
                    <p className="text-[#4A554A] font-medium">{bankRecord.account}</p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#9E3626] font-medium">
                  <XCircle className="w-6 h-6 mx-auto mb-1 opacity-70" />
                  No matching bank statement debit recorded
                </div>
              )}
            </div>
          </div>

          {/* 2. Vendor Tax Invoice */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              invoiceRecord
                ? 'bg-[#FAF9F6] border-[#DCD8CC]'
                : 'bg-[#FDEBE8]/40 border-[#F2C0B8] border-dashed'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#EAE7DC]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#D4E2D4] text-[#0B3C2C]">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#1A1A1A]">Tax Invoice</span>
                </div>
                {invoiceRecord ? (
                  <span className="text-[10px] font-bold text-[#0B3C2C] bg-[#D4E2D4] px-2 py-0.5 rounded-md">
                    Found
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#9E3626] bg-[#FDEBE8] px-2 py-0.5 rounded-md">
                    Missing
                  </span>
                )}
              </div>

              {invoiceRecord ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Invoice Total</p>
                    <p className="font-mono font-bold text-[#1A1A1A] text-sm">
                      {formatCurrency(invoiceRecord.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Invoice Date</p>
                    <p className="font-semibold text-[#1A1A1A]">{formatDate(invoiceRecord.date)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Vendor Entity</p>
                    <p className="font-bold text-[#1A1A1A]">{invoiceRecord.vendor}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Invoice / GSTIN</p>
                    <p className="font-mono text-[11px] text-[#4A554A]">
                      {invoiceRecord.invoiceNo} • {invoiceRecord.gstNo}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#9E3626] font-medium">
                  <XCircle className="w-6 h-6 mx-auto mb-1 opacity-70" />
                  No vendor tax invoice uploaded
                </div>
              )}
            </div>
          </div>

          {/* 3. Payment Record */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              paymentRecord
                ? 'bg-[#FAF9F6] border-[#DCD8CC]'
                : 'bg-[#FDEBE8]/40 border-[#F2C0B8] border-dashed'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#EAE7DC]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#D4E2D4] text-[#0B3C2C]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#1A1A1A]">Payment Record</span>
                </div>
                {paymentRecord ? (
                  <span className="text-[10px] font-bold text-[#0B3C2C] bg-[#D4E2D4] px-2 py-0.5 rounded-md">
                    Found
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#9E3626] bg-[#FDEBE8] px-2 py-0.5 rounded-md">
                    Missing
                  </span>
                )}
              </div>

              {paymentRecord ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Paid Amount</p>
                    <p className="font-mono font-bold text-[#1A1A1A] text-sm">
                      {formatCurrency(paymentRecord.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Payment Date</p>
                    <p className="font-semibold text-[#1A1A1A]">{formatDate(paymentRecord.date)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Method / Gateway</p>
                    <p className="font-semibold text-[#1A1A1A]">{paymentRecord.method}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B786B] uppercase font-bold">Payment Ref / Status</p>
                    <p className="font-mono text-[11px] text-[#0B3C2C] font-bold">
                      {paymentRecord.paymentRef} ({paymentRecord.status})
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#9E3626] font-medium">
                  <XCircle className="w-6 h-6 mx-auto mb-1 opacity-70" />
                  No payment gateway record found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
