-- ═══════════════════════════════════════════════════════════════════════════════
-- RECONCILEX — Supabase PostgreSQL Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Enums
CREATE TYPE IF NOT EXISTS reconciliation_status AS ENUM ('matched', 'needs_review', 'unmatched');
CREATE TYPE IF NOT EXISTS exception_type        AS ENUM ('amount_mismatch', 'missing_invoice', 'missing_records', 'duplicate_transaction', 'vendor_mismatch', 'date_mismatch');
CREATE TYPE IF NOT EXISTS severity_level        AS ENUM ('High', 'Medium', 'Low');
CREATE TYPE IF NOT EXISTS batch_status          AS ENUM ('Completed', 'Audit Complete', 'Archived', 'Processing', 'Failed');

-- 2. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id                 TEXT PRIMARY KEY,
    name               TEXT NOT NULL,
    date               TIMESTAMPTZ DEFAULT NOW(),
    period             TEXT NOT NULL,
    status             batch_status DEFAULT 'Completed',
    total_transactions INT DEFAULT 0,
    matched            INT DEFAULT 0,
    needs_review       INT DEFAULT 0,
    unmatched          INT DEFAULT 0,
    match_rate         NUMERIC(5,2) DEFAULT 0.00,
    total_amount       NUMERIC(15,2) DEFAULT 0.00,
    matched_amount     NUMERIC(15,2) DEFAULT 0.00,
    review_amount      NUMERIC(15,2) DEFAULT 0.00,
    unmatched_amount   NUMERIC(15,2) DEFAULT 0.00,
    execution_time     TEXT DEFAULT '4.2s',
    initiated_by       TEXT DEFAULT 'Ananya Deshmukh (Head of Finance)',
    files              JSONB DEFAULT '[]'::JSONB,
    notes              TEXT,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id                TEXT PRIMARY KEY,
    batch_id          TEXT REFERENCES batches(id) ON DELETE CASCADE,
    date              DATE NOT NULL,
    vendor            TEXT NOT NULL,
    category          TEXT DEFAULT 'General',
    amount            NUMERIC(15,2) NOT NULL,
    bank_amount       NUMERIC(15,2) DEFAULT 0.00,
    invoice_amount    NUMERIC(15,2) DEFAULT 0.00,
    payment_amount    NUMERIC(15,2) DEFAULT 0.00,
    reference         TEXT,
    status            reconciliation_status NOT NULL DEFAULT 'matched',
    confidence        INT DEFAULT 95,
    exception_type    exception_type,
    severity          severity_level,
    match_reasons     JSONB DEFAULT '[]'::JSONB,
    issues            JSONB DEFAULT '[]'::JSONB,
    reviewed          BOOLEAN DEFAULT FALSE,
    resolution_notes  TEXT,
    bank_record       JSONB,
    invoice_record    JSONB,
    payment_record    JSONB,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id                                      INT PRIMARY KEY DEFAULT 1,
    business_name                           TEXT DEFAULT 'Apex Retail & Logistics Pvt Ltd',
    gstin                                   TEXT DEFAULT '27AAACA9918B1ZX',
    pan                                     TEXT DEFAULT 'AAACA9918B',
    primary_currency                        TEXT DEFAULT 'INR (₹)',
    auto_match_threshold                    INT DEFAULT 90,
    fuzzy_vendor_matching                   BOOLEAN DEFAULT TRUE,
    date_tolerance_days                     INT DEFAULT 3,
    auto_flag_duplicate_threshold_hours     INT DEFAULT 48,
    require_approval_for_tds_differences    BOOLEAN DEFAULT TRUE,
    notify_on_high_severity                 BOOLEAN DEFAULT TRUE,
    notify_on_completion                    BOOLEAN DEFAULT TRUE,
    email_alerts                            TEXT DEFAULT 'finance-ops@apexretail.in',
    updated_at                              TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_status   ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_batch_id ON transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_vendor   ON transactions(vendor);
CREATE INDEX IF NOT EXISTS idx_batches_date          ON batches(date DESC);

-- 6. Disable RLS (service role key bypasses anyway, but explicit is safer)
ALTER TABLE batches      DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings     DISABLE ROW LEVEL SECURITY;
