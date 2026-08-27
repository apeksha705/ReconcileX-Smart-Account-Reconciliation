import React, { useEffect } from 'react';
import {
  UploadCloud,
  FileSearch,
  Sparkles,
  Layers,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Loader2,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProcessingWorkflow({
  currentStep,
  statusMessage,
  isComplete,
  onViewResults,
  stats
}) {
  const steps = [
    { num: '01', key: 'upload', name: 'Upload', icon: UploadCloud, desc: 'Ingesting CSV/PDF multi-source streams' },
    { num: '02', key: 'extract', name: 'Extract', icon: FileSearch, desc: 'Extracting narration, GSTIN & UTR tokens' },
    { num: '03', key: 'clean', name: 'Clean', icon: Sparkles, desc: 'Normalizing merchant names & date formats' },
    { num: '04', key: 'match', name: 'Match', icon: Layers, desc: '3-way fuzzy amount & reference correlation' },
    { num: '05', key: 'detect', name: 'Detect', icon: ShieldAlert, desc: 'Anomaly detection & duplicate check' },
    { num: '06', key: 'review', name: 'Review', icon: UserCheck, desc: 'Confidence scoring & queue partitioning' },
    { num: '07', key: 'reconcile', name: 'Reconcile', icon: CheckCircle2, desc: 'Ledger finalization & summary report' },
  ];

  useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#0B3C2C', '#D4E2D4', '#6C8B6C', '#FAF9F6'],
        origin: { y: 0.6 }
      });
    }
  }, [isComplete]);

  return (
    <div className="bg-[#FAF9F6] rounded-2xl border border-[#E2DFD4] shadow-md p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Engine Status Header */}
      <div className="text-center mb-8">
        {!isComplete ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4E2D4] text-[#0B3C2C] text-xs font-bold border border-[#B8CEB8] mb-3 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B3C2C]" />
            <span>AI Reconciliation Engine Active</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4E2D4] text-[#0B3C2C] text-xs font-bold border border-[#B8CEB8] mb-3">
            <CheckCircle2 className="w-4 h-4 text-[#0B3C2C]" />
            <span>Reconciliation Pipeline Complete</span>
          </div>
        )}

        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
          {isComplete ? 'Reconciliation Complete ✓' : 'Processing Three-Way Ledger Stream'}
        </h2>
        <p className="text-xs sm:text-sm text-[#6B786B] mt-1 max-w-lg mx-auto font-medium">
          {statusMessage || 'Cross-referencing bank debits, vendor tax invoices, and payment records...'}
        </p>
      </div>

      {/* 7-Stage Horizontal Pipeline */}
      <div className="relative mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isFinished = isComplete || currentStep > stepNum;
            const isActive = !isComplete && currentStep === stepNum;
            const isPending = !isComplete && currentStep < stepNum;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`relative p-3.5 rounded-xl border flex flex-col items-center text-center transition-all duration-300 ${
                  isFinished
                    ? 'bg-[#D4E2D4]/40 border-[#B8CEB8] text-[#0B3C2C]'
                    : isActive
                    ? 'bg-[#D4E2D4] border-[#0B3C2C] text-[#0B3C2C] ring-2 ring-[#0B3C2C]/20 shadow-md scale-105'
                    : 'bg-[#F2F0E8]/70 border-[#E5E2D9] text-[#8C8C8C] opacity-70'
                }`}
              >
                {/* Step badge */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold mb-2 ${
                    isFinished
                      ? 'bg-[#0B3C2C] text-[#FAF9F6]'
                      : isActive
                      ? 'bg-[#0B3C2C] text-[#FAF9F6] shadow-sm animate-pulse'
                      : 'bg-[#EAE8DE] text-[#6B786B]'
                  }`}
                >
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-[#D4E2D4]" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4E2D4]" />
                  ) : (
                    step.num
                  )}
                </div>

                <p className="text-xs font-black tracking-tight mb-0.5">{step.name}</p>
                <p className="text-[10px] text-[#6B786B] line-clamp-2 leading-tight hidden sm:block">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results Summary Box when complete */}
      {isComplete && stats && (
        <div className="mt-8 pt-6 border-t border-[#EAE7DC] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[#F0EFEB] border border-[#DBD7CB] text-center">
              <p className="text-xs font-bold text-[#6B786B] uppercase">Total Transactions</p>
              <p className="text-2xl font-black text-[#1A1A1A] font-mono mt-1">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#D4E2D4]/50 border border-[#B8CEB8] text-center">
              <p className="text-xs font-bold text-[#0B3C2C] uppercase">Matched</p>
              <p className="text-2xl font-black text-[#0B3C2C] font-mono mt-1">
                {stats.matched}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF0D9] border border-[#E8D8B0] text-center">
              <p className="text-xs font-bold text-[#8A5C14] uppercase">Needs Review</p>
              <p className="text-2xl font-black text-[#8A5C14] font-mono mt-1">
                {stats.needsReview}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FDEBE8] border border-[#F2C0B8] text-center">
              <p className="text-xs font-bold text-[#9E3626] uppercase">Unmatched</p>
              <p className="text-2xl font-black text-[#9E3626] font-mono mt-1">
                {stats.unmatched}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onViewResults}
              className="w-full sm:w-auto px-6 py-3 bg-[#0B3C2C] hover:bg-[#134E39] text-[#FAF9F6] font-bold text-sm rounded-xl shadow-md shadow-[#0B3C2C]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Explore Reconciled Dataset</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
