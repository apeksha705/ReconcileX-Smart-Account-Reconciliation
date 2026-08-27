import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Printer,
  CheckCircle2,
  ShieldCheck,
  X
} from 'lucide-react';
import ReconciliationDonutChart from '../components/Charts/ReconciliationDonutChart';
import TransactionTrendChart from '../components/Charts/TransactionTrendChart';
import MonthlyOverviewChart from '../components/Charts/MonthlyOverviewChart';
import { reconciliationService } from '../services/reconciliationService';
import { formatCurrency } from '../utils/formatters';

export default function Reports({ showToast }) {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, txns] = await Promise.all([
        reconciliationService.getDashboardStats(),
        reconciliationService.getTransactions()
      ]);
      setStats(s);
      setTransactions(txns);
    } catch (err) {
      if (showToast) showToast('warning', 'Failed to load report data', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    reconciliationService.exportTransactionsCSV(transactions);
    if (showToast) {
      showToast('success', 'Audit Report Exported', 'Downloaded complete 3-way reconciliation ledger as CSV');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-[#FAF9F6]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              Audit & Reconciliation Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#D4E2D4] text-[#0B3C2C] border border-[#B8CEB8]">
              Certified Audit Trail
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B786B] mt-1 font-medium">
            Generate executive compliance summaries, 3-way balance proof certificates, and CSV ledgers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-bold text-[#1A1A1A] bg-[#FAF9F6] hover:bg-[#EAE8DE] border border-[#DBD7CB] rounded-xl shadow-2xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#6B786B]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowExecutiveModal(true)}
            className="px-4 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-sm shadow-[#0B3C2C]/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <FileText className="w-3.5 h-3.5 text-[#D4E2D4]" />
            <span>Generate Executive Summary</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B786B]">
            Total Reconciled Volume
          </p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-black text-[#1A1A1A] font-mono">
            {formatCurrency(stats?.totalAmount || 589250)}
          </h3>
          <p className="text-xs text-[#6B786B] mt-2 font-medium">
            Across {stats?.totalTransactions || 24} vendor billing cycles
          </p>
        </div>

        <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#B8CEB8] bg-gradient-to-b from-[#D4E2D4]/30 to-[#FAF9F6] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0B3C2C]">
            Automated Match Rate
          </p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-black text-[#0B3C2C] font-mono">
            {stats?.matchRate || 94}%
          </h3>
          <p className="text-xs text-[#0B3C2C] mt-2 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {formatCurrency(stats?.matchedAmount || 520000)} settled
          </p>
        </div>

        <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8D8B0] bg-gradient-to-b from-[#FAF0D9]/30 to-[#FAF9F6] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8A5C14]">
            Exceptions In Review
          </p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-black text-[#8A5C14] font-mono">
            {stats?.needsReview || 0}
          </h3>
          <p className="text-xs text-[#8A5C14] mt-2 font-medium">
            Value at risk: {formatCurrency(stats?.reviewAmount || 42500)}
          </p>
        </div>

        <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#F2C0B8] bg-gradient-to-b from-[#FDEBE8]/30 to-[#FAF9F6] shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9E3626]">
            Unmatched Records
          </p>
          <h3 className="mt-2 text-2xl lg:text-3xl font-black text-[#9E3626] font-mono">
            {stats?.unmatched || 0}
          </h3>
          <p className="text-xs text-[#9E3626] mt-2 font-medium">
            Missing tax invoice or slip ({formatCurrency(stats?.unmatchedAmount || 26750)})
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ReconciliationDonutChart
            matched={stats?.matched || 0}
            needsReview={stats?.needsReview || 0}
            unmatched={stats?.unmatched || 0}
          />
        </div>
        <div className="lg:col-span-1">
          <TransactionTrendChart />
        </div>
        <div className="lg:col-span-1">
          <MonthlyOverviewChart />
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4] shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#1A1A1A]">
              Audit Breakdown by Spending Category
            </h3>
            <p className="text-xs text-[#6B786B] font-medium">
              Reconciled ledger amounts categorised for GST Input Tax Credit (ITC) verification
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-[#EAE8DE] text-[#1A1A1A] px-3 py-1 rounded-lg border border-[#DBD7CB]">
            FY 2026-27 Q3
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F0EFEB] border-b border-[#DBD7CB] text-[#6B786B] uppercase font-black text-[10px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Transactions</th>
                <th className="py-3 px-4 text-right">Bank Debit Total</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-center">Match Accuracy</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DC] font-medium">
              {[
                { cat: 'Cloud Infrastructure & SaaS', count: 7, bank: 119650, inv: 119650, acc: '98.5%', status: 'Reconciled' },
                { cat: 'Office & Facilities', count: 6, bank: 87320, inv: 87320, acc: '95.0%', status: 'Reconciled' },
                { cat: 'Shipping & Logistics', count: 4, bank: 44050, inv: 44050, acc: '92.4%', status: 'Reconciled' },
                { cat: 'Professional & Legal Services', count: 3, bank: 189000, inv: 195000, acc: '82.0%', status: 'TDS Review' },
                { cat: 'Utilities & Connectivity', count: 3, bank: 62590, inv: 62590, acc: '99.0%', status: 'Reconciled' },
                { cat: 'Marketing & Advertising', count: 2, bank: 63500, inv: 63500, acc: '74.0%', status: 'Dup Flagged' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#EBF2EB]/50">
                  <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">{row.cat}</td>
                  <td className="py-3.5 px-4 text-center font-mono">{row.count}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1A1A1A]">{formatCurrency(row.bank)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#6B786B]">{formatCurrency(row.inv)}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-[#0B3C2C]">{row.acc}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        row.status === 'Reconciled'
                          ? 'bg-[#D4E2D4] text-[#0B3C2C]'
                          : 'bg-[#FAF0D9] text-[#8A5C14]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Executive Summary Modal */}
      {showExecutiveModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-2xl border border-[#DCD8CC] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#2D2D2D] flex items-center justify-between bg-[#1A1A1A] text-[#FAF9F6]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#D4E2D4]" />
                <div>
                  <h3 className="text-sm font-bold text-[#FAF9F6]">Executive Reconciliation Summary</h3>
                  <p className="text-[10px] text-[#A3A3A3]">ReconcileX Smart Account Reconciliation Certificate</p>
                </div>
              </div>
              <button
                onClick={() => setShowExecutiveModal(false)}
                className="text-[#8C8C8C] hover:text-[#FAF9F6] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs text-[#1A1A1A] leading-relaxed flex-1">
              <div className="p-4 rounded-xl bg-[#F0EFEB] border border-[#DBD7CB] space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#6B786B]">Business Entity:</span>
                  <strong className="text-[#1A1A1A]">Apex Retail & Logistics Pvt Ltd</strong>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#6B786B]">Audit Billing Cycle:</span>
                  <span className="font-mono text-[#1A1A1A]">01 Aug 2026 – 26 Aug 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#6B786B]">GSTIN Registered:</span>
                  <span className="font-mono text-[#1A1A1A]">27AAACA9918B1ZX</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#6B786B]">Primary Current Account:</span>
                  <span className="font-mono text-[#1A1A1A]">HDFC Bank ••••4829</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-[#1A1A1A] uppercase text-[11px] tracking-wider">
                  Audit Findings Summary
                </h4>
                <p>
                  Out of <strong className="text-[#1A1A1A]">{stats?.totalTransactions || 24}</strong> multi-source entries analyzed, <strong className="text-[#0B3C2C]">{stats?.matched || 20} transactions ({stats?.matchRate || 94}%)</strong> satisfied strict 3-way correlation between bank debits, supplier GST invoices, and electronic payment records with &gt;90% confidence.
                </p>
                <p>
                  <strong>{stats?.needsReview || 2} transactions</strong> were flagged for minor TDS withholding adjustments (e.g. ₹500 TDS on Zeta Tech Solutions; 10% 194J on Prime Legal Advisors). No systemic variance detected.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#D4E2D4]/60 border border-[#B8CEB8] text-[#0B3C2C] flex items-center gap-2.5 font-medium">
                <CheckCircle2 className="w-5 h-5 text-[#0B3C2C] flex-shrink-0" />
                <span>
                  <strong>Compliance Certified:</strong> All matched records are ready for GST GSTR-2B Input Tax Credit filing and annual statutory balance sheet reconciliation.
                </span>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-[#DBD7CB] bg-[#F0EFEB] flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-bold text-[#1A1A1A] hover:bg-[#EAE8DE] rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#6B786B]" />
                <span>Print Certificate</span>
              </button>

              <button
                onClick={() => {
                  handleExportCSV();
                  setShowExecutiveModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-sm shadow-[#0B3C2C]/30 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#D4E2D4]" />
                <span>Download Certified CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
