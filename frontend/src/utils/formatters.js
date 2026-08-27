// Currency and Date formatting utilities for ReconcileX

/**
 * Format amount into Indian Rupee (₹) standard
 * Example: 12500 -> ₹12,500.00
 */
export function formatCurrency(amount, includeDecimals = true) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  
  const num = Number(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num);

  return formatted;
}

/**
 * Format date into clean standard format (e.g. 18 Aug 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format relative time (e.g. 10 mins ago, 2 hours ago)
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
