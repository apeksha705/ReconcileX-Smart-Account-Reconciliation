import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Download,
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import TransactionTable from '../components/TransactionTable';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import { reconciliationService } from '../services/reconciliationService';

export default function Transactions({ showToast, onDataUpdated }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Filters State
  const [search, setSearch] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await reconciliationService.getTransactions({
        search,
        status: statusFilter,
        sortBy,
        minAmount,
        maxAmount,
        page,
        limit: pageSize,
      });
      // Live API returns paginated slice; mock returns full array
      setTransactions(Array.isArray(data) ? data : (data.transactions ?? []));
      setPage(1);
    } catch (err) {
      if (showToast) showToast('warning', 'Failed to load transactions', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, sortBy, minAmount, maxAmount]);

  const handleExportCSV = () => {
    reconciliationService.exportTransactionsCSV(transactions);
    if (showToast) {
      showToast('success', 'Export Complete', `Exported ${transactions.length} transactions as CSV`);
    }
  };

  const handleStatusChange = async (id, newStatus, notes) => {
    try {
      await reconciliationService.updateTransactionStatus(id, newStatus, notes);
      loadData();
      if (onDataUpdated) onDataUpdated();
      if (showToast) {
        showToast('success', `Transaction ${id} Updated`, `Status: ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Update failed', err.message);
    }
  };

  const handleEditSave = async (id, edits) => {
    try {
      await reconciliationService.updateTransactionStatus(id, 'matched', edits.notes, edits);
      loadData();
      if (onDataUpdated) onDataUpdated();
      if (showToast) {
        showToast('success', `Transaction ${id} Saved`, 'Manual correction resolved');
      }
    } catch (err) {
      if (showToast) showToast('warning', 'Save failed', err.message);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('date-desc');
    setMinAmount('');
    setMaxAmount('');
  };

  const totalPages = Math.ceil(transactions.length / pageSize) || 1;
  const paginatedTransactions = transactions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-[#FAF9F6]">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
            Transaction Ledger Explorer
          </h1>
          <p className="text-xs sm:text-sm text-[#6B786B] mt-1 font-medium">
            Search, filter, and audit {transactions.length} reconciled cross-ledger records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
              showAdvancedFilters || minAmount || maxAmount
                ? 'bg-[#D4E2D4] text-[#0B3C2C] border-[#B8CEB8]'
                : 'bg-[#FAF9F6] text-[#1A1A1A] border-[#DBD7CB] hover:bg-[#EAE8DE]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {(minAmount || maxAmount) ? '• 1' : ''}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#D4E2D4]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E2DFD4] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#7A8A7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendor name, transaction ID, reference..."
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
              { id: 'all', label: 'All' },
              { id: 'matched', label: 'Matched' },
              { id: 'needs_review', label: 'Needs Review' },
              { id: 'unmatched', label: 'Unmatched' },
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

          {/* Sort Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F0EFEB] border border-[#DBD7CB] rounded-xl text-[#1A1A1A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C]"
            >
              <option value="date-desc">Date: Newest first</option>
              <option value="date-asc">Date: Oldest first</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
              <option value="confidence-desc">Confidence: Highest</option>
              <option value="confidence-asc">Confidence: Lowest</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-[#EAE7DC] flex flex-wrap items-center gap-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1A1A1A]">Amount (₹):</span>
              <input
                type="number"
                placeholder="Min"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-24 px-2.5 py-1.5 bg-[#F0EFEB] border border-[#DBD7CB] rounded-lg font-mono font-bold"
              />
              <span className="text-[#6B786B]">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-24 px-2.5 py-1.5 bg-[#F0EFEB] border border-[#DBD7CB] rounded-lg font-mono font-bold"
              />
            </div>

            <button
              onClick={resetFilters}
              className="text-[#0B3C2C] hover:text-[#134E39] text-xs font-bold flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <TransactionTable
        transactions={paginatedTransactions}
        onSelectTransaction={(txn) => setSelectedTransaction(txn)}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

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
