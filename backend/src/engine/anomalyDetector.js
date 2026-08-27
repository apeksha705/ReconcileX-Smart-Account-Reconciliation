/**
 * anomalyDetector.js
 * Detects TDS discrepancies, duplicate payments, and missing-record anomalies.
 * All functions are pure — they take data arrays and return annotated copies.
 */

// TDS rates applicable under Indian Income Tax Act
const TDS_RATES = [
  { rate: 0.01, section: '194C (sub-contractor, 1%)' },
  { rate: 0.02, section: '194C (contractor, 2%)' },
  { rate: 0.05, section: '194H / 194I (commission/rent, 5%)' },
  { rate: 0.10, section: '194J (professional/technical, 10%)' },
];

/**
 * Check if the difference between invoiceAmount and bankAmount matches a known TDS rate.
 * Returns { isTDS, rate, section, tdsAmount } or null.
 */
export function detectTDSDiscrepancy(invoiceAmount, bankAmount) {
  if (!invoiceAmount || !bankAmount) return null;
  const diff = invoiceAmount - bankAmount;
  if (diff <= 0) return null;

  for (const { rate, section } of TDS_RATES) {
    const expected = invoiceAmount * rate;
    // Allow ±2 rupee rounding tolerance
    if (Math.abs(diff - expected) <= 2) {
      return {
        isTDS: true,
        rate,
        section,
        tdsAmount: parseFloat(diff.toFixed(2)),
      };
    }
  }
  return null;
}

/**
 * Scan a list of candidate transactions for duplicates.
 * A duplicate is defined as: same vendor + same amount within `thresholdHours` hours.
 * Returns a Set of _rowIndex values flagged as duplicates.
 */
export function detectDuplicates(candidates, thresholdHours = 48) {
  const flagged = new Set();
  const thresholdMs = thresholdHours * 60 * 60 * 1000;

  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];

      const sameVendor =
        a.vendorToken && b.vendorToken && a.vendorToken === b.vendorToken;
      const sameAmount = Math.abs(a.amount - b.amount) < 0.01;
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const withinWindow = !isNaN(dateA) && !isNaN(dateB) && Math.abs(dateA - dateB) <= thresholdMs;

      if (sameVendor && sameAmount && withinWindow) {
        flagged.add(a._rowIndex ?? i);
        flagged.add(b._rowIndex ?? j);
      }
    }
  }
  return flagged;
}

/**
 * Identify bank debits that have no matching invoice record.
 * Returns indices (from bankRows) of rows with no invoice counterpart.
 */
export function detectMissingInvoices(bankRows, invoiceRows) {
  const invoiceRefs = new Set(
    invoiceRows.map(inv => inv.invoiceNo?.toLowerCase().replace(/[\s\-]/g, ''))
  );
  const invoiceVendorAmounts = new Map();
  for (const inv of invoiceRows) {
    const key = `${inv.vendorToken || ''}::${inv.amount}`;
    invoiceVendorAmounts.set(key, true);
  }

  const missing = [];
  for (let i = 0; i < bankRows.length; i++) {
    const row = bankRows[i];
    // Check if the description contains any known invoice reference
    const descNorm = (row.description || '').toLowerCase().replace(/[\s\-]/g, '');
    const hasRef = [...invoiceRefs].some(ref => ref && descNorm.includes(ref));
    const hasVendorAmount = invoiceVendorAmounts.has(`${row.vendorToken || ''}::${row.amount}`);

    if (!hasRef && !hasVendorAmount) {
      missing.push(i);
    }
  }
  return missing;
}

/**
 * Identify invoices/payments that have no corresponding bank debit.
 * Returns indices of invoiceRows with no bank match.
 */
export function detectMissingBankDebits(invoiceRows, bankRows) {
  const bankAmounts = new Map();
  for (const row of bankRows) {
    const key = `${row.vendorToken || ''}::${row.amount}`;
    bankAmounts.set(key, true);
  }

  const missing = [];
  for (let i = 0; i < invoiceRows.length; i++) {
    const inv = invoiceRows[i];
    const key = `${inv.vendorToken || ''}::${inv.amount}`;
    if (!bankAmounts.has(key)) {
      missing.push(i);
    }
  }
  return missing;
}
