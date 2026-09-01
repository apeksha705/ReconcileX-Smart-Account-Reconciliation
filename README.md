# ReconcileX — Smart Account Reconciliation

> AI-powered 3-way reconciliation engine for Indian finance operations.
> Matches bank statements, vendor GST invoices, and payment gateway records automatically — with TDS anomaly detection, duplicate flagging, and explainable confidence scoring.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | _Vercel URL after deployment_ |
| Backend API | _Render URL after deployment_ |
| Health Check | `<backend-url>/health` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v4, Vite, Recharts |
| Backend | Node.js (ESM), Express.js |
| Database | Supabase (PostgreSQL) |
| Auth / Storage | Supabase service role |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

- **7-Stage Reconciliation Engine** — Upload → Extract → Clean → Match → Detect → Review → Reconcile
- **3-Way Matching** — Cross-correlates bank debits, supplier invoices, and payment gateway records
- **TDS Anomaly Detection** — Flags 194C / 194J / 194H discrepancies with section citations
- **Fuzzy Vendor Matching** — Levenshtein string similarity for alias detection
- **Duplicate Payment Detection** — Flags identical vendor + amount within configurable time window
- **Confidence Scoring** — Composite score: Amount (40%) + Vendor (30%) + Date (15%) + Reference (15%)
- **Exceptions Queue** — Human-in-the-loop review workflow for disputed items
- **Executive Summary Certificate** — GST GSTR-2B ready compliance report
- **CSV Export** — Full reconciliation ledger download

---

## Project Structure

```
reconcilex/
├── frontend/                  # React 19 + Tailwind CSS + Vite
│   ├── src/
│   │   ├── pages/             # Dashboard, Transactions, Exceptions, History, Reports, Settings, Reconciliation
│   │   ├── components/        # StatCard, TransactionTable, Charts, Modals, etc.
│   │   └── services/          # reconciliationService.js — API layer with mock fallback
│   └── vercel.json            # SPA routing config
│
└── backend/                   # Node.js / Express REST API
    ├── src/
    │   ├── engine/            # matchingEngine.js, parsers.js, anomalyDetector.js
    │   ├── controllers/       # dashboard, transactions, exceptions, reports, settings, reconciliation
    │   ├── routes/            # Express routers
    │   └── utils/             # seedData.js
    ├── supabase_migration.sql  # Run this in Supabase SQL Editor first
    └── .env.example           # Copy to .env and fill credentials
```

---

## Local Development

### Prerequisites
- Node.js >= 18
- A free [Supabase](https://supabase.com) project

### 1. Database Setup
Open your Supabase project → SQL Editor → paste and run `backend/supabase_migration.sql`

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
npm install
npm start
# Server starts on http://localhost:5000
# Database is auto-seeded on first boot
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
# App starts on http://localhost:5173
```

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect this GitHub repo
3. Settings:

| Field | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

4. Add environment variables:
```
SUPABASE_URL               = https://gvlxmagvpkioztntrvfm.supabase.co
SUPABASE_SERVICE_ROLE_KEY  = <your service role key>
NODE_ENV                   = production
PORT                       = 5000
CLIENT_ORIGIN              = https://reconcilex.vercel.app
```

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import this GitHub repo
3. Settings:

| Field | Value |
|---|---|
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Add environment variable:
```
VITE_API_URL = https://<your-render-service>.onrender.com/api
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reconciliation/upload` | Upload 3 CSV/PDF files |
| `POST` | `/api/reconciliation/start` | Run 7-stage matching engine |
| `GET` | `/api/reconciliation/history` | List all batch runs |
| `GET` | `/api/reconciliation/history/:id` | Single batch details |
| `GET` | `/api/transactions` | Paginated, filtered transaction list |
| `GET` | `/api/transactions/:id` | Single transaction with 3-way evidence |
| `PATCH` | `/api/transactions/:id/status` | Update status + resolution notes |
| `GET` | `/api/dashboard/stats` | KPI metrics |
| `GET` | `/api/exceptions` | Exceptions queue with breakdown |
| `GET` | `/api/reports/summary` | Category breakdown + quarterly metrics |
| `GET` | `/api/reports/export` | CSV download of full ledger |
| `GET` | `/api/settings` | Engine configuration |
| `PUT` | `/api/settings` | Update engine configuration |
| `GET` | `/health` | Server health check |

---

## Built for Omnikon National Hackathon 2026

**Team:** Apeksha Shukla
**Category:** FinTech / Enterprise SaaS
**Problem:** Manual 3-way account reconciliation costs Indian finance teams 40+ hours per month and is error-prone at scale.
**Solution:** ReconcileX automates the entire workflow with an AI matching engine, reduces reconciliation time by 90%, and produces GST-ready audit certificates.

---

## License

MIT
