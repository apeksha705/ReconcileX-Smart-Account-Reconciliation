import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Receipt,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import ReconciliationDonutChart from '../components/Charts/ReconciliationDonutChart';
import TransactionTrendChart from '../components/Charts/TransactionTrendChart';
import MonthlyOverviewChart from '../components/Charts/MonthlyOverviewChart';
import { reconciliationService } from '../services/reconciliationService';

export default function Dashboard({ showToast, onDataUpdated, currentUser }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('all');

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = currentUser?.name?.split(' ')[0] || currentUser?.name || 'there';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashStats, txns] = await Promise.all([
        reconciliationService.getDashboardStats(),
        reconciliationService.getTransactions()
      ]);
      setStats(dashStats);
      setRecentTransactions(txns.slice(0, 7));
    } catch (err) {
      if (showToast) showToast('warning', 'Failed to load dashboard', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleStatusChange = async (id, newStatus, notes) => {
    try {
      await reconciliationService.updateTransactionStatus(id, newStatus, notes);
      loadDashboardData();
      if (onDataUpdated) onDataUpdated();
      if (showToast) {
        showToast('success', `Transaction ${id} Updated`, `Marked as ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Action failed', err.message);
    }
  };

  const handleEditSave = async (id, edits) => {
    try {
      await reconciliationService.updateTransactionStatus(id, 'matched', edits.notes, edits);
      loadDashboardData();
      if (onDataUpdated) onDataUpdated();
      if (showToast) {
        showToast('success', `Transaction ${id} Resolved`, 'Changes saved and verified');
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Save failed', err.message);
    }
  };

  const filteredRecent = recentTransactions.filter((t) => {
    if (tableFilter === 'all') return true;
    return t.status === tableFilter;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-[#FAF9F6]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              {getTimeGreeting()}, {displayName}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#D4E2D4] text-[#0B3C2C] border border-[#B8CEB8]">
              Q3 FY26 Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B786B] mt-1 font-medium">
            Here's your real-time three-way reconciliation overview across Bank, Invoices & Gateways.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/exceptions')}
            className="px-4 py-2 text-xs font-bold text-[#1A1A1A] bg-[#FAF9F6] hover:bg-[#EAE8DE] border border-[#DBD7CB] rounded-xl shadow-2xs flex items-center gap-2 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#8A5C14]" />
            <span>Resolve Exceptions ({stats?.needsReview || 0})</span>
          </button>

          <button
            onClick={() => navigate('/reconcile')}
            className="px-4 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-sm shadow-[#0B3C2C]/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4E2D4]" />
            <span>Run New Batch</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={stats?.scaledStats.totalTransactions || 1248}
          change="+14.2%"
          changeType="positive"
          icon={Receipt}
          subtext="Processed in August 2026"
          variant="default"
          onClick={() => navigate('/transactions')}
        />

        <StatCard
          title="Matched"
          value={stats?.scaledStats.matched || 1043}
          change="94.2% Auto"
          changeType="positive"
          icon={CheckCircle2}
          subtext="3-Way confidence > 90%"
          variant="matched"
          onClick={() => setTableFilter('matched')}
        />

        <StatCard
          title="Needs Review"
          value={stats?.scaledStats.needsReview || 127}
          change="Action Required"
          changeType="negative"
          icon={AlertTriangle}
          subtext="TDS & Vendor discrepancies"
          variant="review"
          onClick={() => navigate('/exceptions')}
        />

        <StatCard
          title="Unmatched"
          value={stats?.scaledStats.unmatched || 78}
          change="-4.5% vs July"
          changeType="neutral"
          icon={XCircle}
          subtext="Missing invoices / slips"
          variant="unmatched"
          onClick={() => navigate('/exceptions')}
        />
      </div>

      {/* Chart Section */}
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

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[#1A1A1A] tracking-tight">
              Recent Reconciliation Activity
            </h3>
            <p className="text-xs text-[#6B786B] font-medium">
              Click any transaction row to inspect 3-way explainable matching evidence.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EAE8DE] rounded-xl border border-[#DBD7CB] text-xs self-start sm:self-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'matched', label: 'Matched' },
              { id: 'needs_review', label: 'Needs Review' },
              { id: 'unmatched', label: 'Unmatched' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTableFilter(tab.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  tableFilter === tab.id
                    ? 'bg-[#FAF9F6] text-[#1A1A1A] shadow-xs'
                    : 'text-[#6B786B] hover:text-[#1A1A1A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <TransactionTable
          transactions={filteredRecent.slice(0, 8)}
          onSelectTransaction={(txn) => setSelectedTransaction(txn)}
          loading={loading}
        />

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/transactions')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3C2C] hover:text-[#134E39] bg-[#D4E2D4]/60 hover:bg-[#D4E2D4] px-4 py-2 rounded-xl transition-colors border border-[#B8CEB8]"
          >
            <span>View All Transactions Explorer ({stats?.totalTransactions || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
