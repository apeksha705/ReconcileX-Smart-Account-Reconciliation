import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  FileSpreadsheet,
  CreditCard,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  ArrowRight
} from 'lucide-react';
import UploadCard from '../components/UploadCard';
import ProcessingWorkflow from '../components/ProcessingWorkflow';
import TransactionTable from '../components/TransactionTable';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import { reconciliationService } from '../services/reconciliationService';
import { SAMPLE_FILES } from '../data/mockTransactions';

export default function Reconciliation({ showToast, onDataUpdated }) {
  const navigate = useNavigate();
  const [bankFile, setBankFile] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);

  // Engine Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [resultStats, setResultStats] = useState(null);
  const [reconciledTransactions, setReconciledTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const allFilesSelected = bankFile && invoiceFile && paymentFile;

  // 1-Click Sample loader
  const handleLoadAllSampleFiles = () => {
    setBankFile(SAMPLE_FILES.bankStatement);
    setInvoiceFile(SAMPLE_FILES.invoices);
    setPaymentFile(SAMPLE_FILES.payments);
    if (showToast) {
      showToast('info', 'Sample Dataset Loaded', '3-Way CSV files for August 2026 pre-filled');
    }
  };

  const handleStartReconciliation = async () => {
    if (!allFilesSelected) return;

    setIsProcessing(true);
    setIsComplete(false);
    setCurrentStep(1);

    try {
      const response = await reconciliationService.startReconciliation(
        { bankFile, invoiceFile, paymentFile },
        ({ step, name, message }) => {
          setCurrentStep(step);
          setStatusMessage(message);
        }
      );

      setIsComplete(true);
      setResultStats(response.stats);

      const txns = await reconciliationService.getTransactions();
      setReconciledTransactions(txns);

      if (onDataUpdated) onDataUpdated();
      if (showToast) {
        showToast(
          'success',
          'Reconciliation Complete ✓',
          `Processed ${response.totalProcessed} transactions with ${response.stats.matchRate}% match rate`
        );
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Processing Error', err.message);
    }
  };

  const handleResetReconciliation = () => {
    setIsProcessing(false);
    setIsComplete(false);
    setCurrentStep(0);
    setBankFile(null);
    setInvoiceFile(null);
    setPaymentFile(null);
  };

  const handleStatusChange = async (id, newStatus, notes) => {
    try {
      await reconciliationService.updateTransactionStatus(id, newStatus, notes);
      const [updatedStats, updatedTxns] = await Promise.all([
        reconciliationService.getDashboardStats(),
        reconciliationService.getTransactions()
      ]);
      setResultStats(updatedStats);
      setReconciledTransactions(updatedTxns);
      if (onDataUpdated) onDataUpdated();
      if (showToast) {
        showToast('success', `Transaction ${id} Resolved`, `Updated to ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Update failed', err.message);
    }
  };

  const handleEditSave = async (id, edits) => {
    try {
      await reconciliationService.updateTransactionStatus(id, 'matched', edits.notes, edits);
      const [updatedStats, updatedTxns] = await Promise.all([
        reconciliationService.getDashboardStats(),
        reconciliationService.getTransactions()
      ]);
      setResultStats(updatedStats);
      setReconciledTransactions(updatedTxns);
      if (onDataUpdated) onDataUpdated();
      if (showToast) {
        showToast('success', `Transaction ${id} Re-Matched`, 'Manual adjustments applied');
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Save failed', err.message);
    }
  };

  const filteredResults = reconciledTransactions.filter((t) => {
    if (activeTab === 'all') return true;
    return t.status === activeTab;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-[#FAF9F6]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              New Reconciliation
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#D4E2D4] text-[#0B3C2C] border border-[#B8CEB8]">
              3-Way AI Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B786B] mt-1 font-medium">
            Upload your Bank Statement, Invoices, and Payment Gateway records to execute automated matching.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadAllSampleFiles}
            className="px-4 py-2 text-xs font-black text-[#0B3C2C] bg-[#D4E2D4] hover:bg-[#B8CEB8] border border-[#B8CEB8] rounded-xl flex items-center gap-2 transition-all shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#0B3C2C]" />
            <span>Load Sample Q3 Files</span>
          </button>

          {isComplete && (
            <button
              onClick={handleResetReconciliation}
              className="px-3.5 py-2 text-xs font-bold text-[#1A1A1A] bg-[#FAF9F6] hover:bg-[#EAE8DE] border border-[#DBD7CB] rounded-xl flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6B786B]" />
              <span>Start Over</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      {!isProcessing && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Bank Statement Card */}
            <UploadCard
              title="Bank Statement"
              subtitle="Upload current A/C transactions"
              icon={Landmark}
              supported="CSV / PDF"
              file={bankFile}
              colorScheme="forest"
              onFileSelect={(f) => setBankFile(f)}
              onRemove={() => setBankFile(null)}
              onLoadSample={() => setBankFile(SAMPLE_FILES.bankStatement)}
            />

            {/* 2. Invoices Card */}
            <UploadCard
              title="Invoices"
              subtitle="Upload vendor tax invoices"
              icon={FileSpreadsheet}
              supported="CSV / PDF / Excel"
              file={invoiceFile}
              colorScheme="sage"
              onFileSelect={(f) => setInvoiceFile(f)}
              onRemove={() => setInvoiceFile(null)}
              onLoadSample={() => setInvoiceFile(SAMPLE_FILES.invoices)}
            />

            {/* 3. Payment Records Card */}
            <UploadCard
              title="Payment Records"
              subtitle="Upload gateway & payout ledger"
              icon={CreditCard}
              supported="CSV / PDF"
              file={paymentFile}
              colorScheme="forest"
              onFileSelect={(f) => setPaymentFile(f)}
              onRemove={() => setPaymentFile(null)}
              onLoadSample={() => setPaymentFile(SAMPLE_FILES.payments)}
            />
          </div>

          {/* Reconciliation Trigger Card */}
          <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  allFilesSelected
                    ? 'bg-[#D4E2D4] text-[#0B3C2C]'
                    : 'bg-[#EAE8DE] text-[#8C8C8C]'
                }`}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#1A1A1A]">
                  {allFilesSelected
                    ? 'All 3 Source Documents Ready'
                    : 'Select or Load All 3 Datasets to Begin'}
                </h4>
                <p className="text-xs text-[#6B786B] font-medium">
                  {allFilesSelected
                    ? 'Engine will parse narration tokens, correlate amounts, and identify anomalies.'
                    : 'Tip: Use the "Load Sample Q3 Files" button above for instant reconciliation.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleStartReconciliation}
              disabled={!allFilesSelected}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                allFilesSelected
                  ? 'bg-[#0B3C2C] hover:bg-[#134E39] text-[#FAF9F6] shadow-[#0B3C2C]/30 hover:scale-[1.02] cursor-pointer'
                  : 'bg-[#EAE8DE] text-[#8C8C8C] cursor-not-allowed shadow-none'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Reconciliation</span>
            </button>
          </div>
        </div>
      )}

      {/* 7-Step Animated Processing State */}
      {isProcessing && (
        <div className="space-y-8">
          <ProcessingWorkflow
            currentStep={currentStep}
            statusMessage={statusMessage}
            isComplete={isComplete}
            stats={resultStats}
            onViewResults={() => {
              const el = document.getElementById('results-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Results Table Section */}
          {isComplete && (
            <div id="results-section" className="space-y-4 pt-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-[#1A1A1A] tracking-tight">
                    Batch Reconciliation Results
                  </h3>
                  <p className="text-xs text-[#6B786B] font-medium">
                    Review matched ledger entries or resolve discrepancies requiring approval.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#EAE8DE] rounded-xl border border-[#DBD7CB] text-xs">
                  {[
                    { id: 'all', label: `All (${reconciledTransactions.length})` },
                    {
                      id: 'matched',
                      label: `Matched (${
                        reconciledTransactions.filter((t) => t.status === 'matched').length
                      })`,
                    },
                    {
                      id: 'needs_review',
                      label: `Needs Review (${
                        reconciledTransactions.filter((t) => t.status === 'needs_review').length
                      })`,
                    },
                    {
                      id: 'unmatched',
                      label: `Unmatched (${
                        reconciledTransactions.filter((t) => t.status === 'unmatched').length
                      })`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#FAF9F6] text-[#1A1A1A] shadow-xs'
                          : 'text-[#6B786B] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions Table */}
              <TransactionTable
                transactions={filteredResults}
                onSelectTransaction={(txn) => setSelectedTransaction(txn)}
              />

              {/* Next Steps Prompt */}
              <div className="p-4 rounded-2xl bg-[#EBF2EB] border border-[#B8CEB8] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#0B3C2C] text-[#FAF9F6]">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#0B3C2C]">
                      Audit Trail & GST Compliance Ready
                    </p>
                    <p className="text-[11px] text-[#4A554A] font-medium">
                      Ready to generate certified tax audit reports and download reconciliation ledgers.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/reports')}
                  className="px-4 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-xs shadow-[#0B3C2C]/30 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Go to Audit Reports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Inspection Modal */}
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
