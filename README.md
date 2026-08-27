# RECONCILEX — Smart Account Reconciliation

> **Production-Ready Smart Account Reconciliation Platform**  
> Built with React 19, Tailwind CSS v4, React Router, Lucide Icons, and Recharts.

---

## 🚀 Quick Start

All frontend application code is organized cleanly inside the [`frontend/`](./frontend) directory:

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

---

## 🌟 Core Application Workflow

1. **Sign In**: Open `http://localhost:5173/login` and enter your work credentials.
2. **Dashboard Overview**:
   - Inspect summary KPIs: **Total Transactions (1,248)**, **Matched (1,043)**, **Needs Review (127)**, and **Unmatched (78)**.
   - Review live interactive charts: Status Breakdown Donut, 7-Day Velocity Bar Chart, and Monthly Accuracy Growth.
3. **Execute 3-Way Reconciliation**:
   - Click **"New Reconciliation"** or navigate to `/reconcile`.
   - Click **"Load Sample Q3 Files"** to populate Bank Statements, Vendor Tax Invoices, and Payment Gateway records.
   - Click **"Start Reconciliation"**.
   - Watch the **7-Stage AI Engine** animate across:  
     `01 Upload` → `02 Extract` → `03 Clean` → `04 Match` → `05 Detect` → `06 Review` → `07 Reconcile`
   - Review the celebratory completion state and breakdown table.
4. **Explainable AI Matching Evidence**:
   - Click any transaction (e.g. `TXN-1042 ABC Supplies`) to open the **Explainable Audit Modal**.
   - Inspect the **98% Visual Confidence Meter** and the **3-Way Cross-Source Comparison Matrix** (Bank Statement vs. Tax Invoice vs. Payment Record).
5. **Human-in-the-Loop Exceptions Resolution**:
   - Open `/exceptions` to inspect categorized issues (*Amount Mismatch / TDS*, *Missing Invoices*, *Duplicate Debits*, *Vendor Aliases*).
   - Review `TXN-1087` (Zeta Tech Solutions ₹500 TDS difference) and click **"Approve & Match"** or **"Edit"**.
   - Watch dashboard statistics update live across the entire session.
6. **Executive Audit Reports**:
   - Navigate to `/reports` to view the **GST ITC Compliance Ledger** and click **"Export CSV"** to download the ledger or **"Generate Executive Summary"** to print the certified audit certificate.

---

## 🏗️ Architecture & Backend Readiness

The frontend is built on a clean asynchronous service layer (`src/services/reconciliationService.js`) that mimics standard REST API contracts:

| Frontend Service Method | Prepared Backend REST Endpoint | Purpose |
|---|---|---|
| `reconciliationService.uploadFiles(files)` | `POST /api/reconciliation/upload` | Ingest multi-source CSV/PDF files |
| `reconciliationService.startReconciliation(files)` | `POST /api/reconciliation/start` | Trigger 7-stage engine execution |
| `reconciliationService.getTransactions(filters)` | `GET /api/transactions` | Query filtered/sorted ledger data |
| `reconciliationService.getTransactionById(id)` | `GET /api/transactions/:id` | Fetch 3-way matching record details |
| `reconciliationService.updateTransactionStatus(id, status)` | `PATCH /api/transactions/:id/status` | Approve, reject, or resolve item |
| `reconciliationService.getDashboardStats()` | `GET /api/dashboard/stats` | Live reconciliation KPI metrics |
| `reconciliationService.getExceptions(cat)` | `GET /api/exceptions` | Filtered review queue items |
| `reconciliationService.exportTransactionsCSV()` | `GET /api/reports/export` | Download reconciled audit ledger |
