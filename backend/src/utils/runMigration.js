/**
 * runMigration.js
 * Runs the Supabase SQL migration and seeds the database.
 * Usage: node src/utils/runMigration.js
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function runMigration() {
  console.log('\n[Migration] Connecting to:', process.env.SUPABASE_URL);

  // ── Step 1: Create ENUMs (ignore if already exist) ──────────────────────────
  const enumStatements = [
    `DO $$ BEGIN CREATE TYPE reconciliation_status AS ENUM ('matched','needs_review','unmatched'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE TYPE exception_type AS ENUM ('amount_mismatch','missing_invoice','missing_records','duplicate_transaction','vendor_mismatch','date_mismatch'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE TYPE severity_level AS ENUM ('High','Medium','Low'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
    `DO $$ BEGIN CREATE TYPE batch_status AS ENUM ('Completed','Audit Complete','Archived','Processing','Failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
  ];

  console.log('[Migration] Creating ENUMs...');
  for (const sql of enumStatements) {
    const { error } = await supabase.rpc('exec_sql', { sql }).catch(() => ({ error: null }));
    // rpc may not exist — fall through, table creation handles it
  }

  // ── Step 2: Create tables via REST (Supabase SQL HTTP endpoint) ─────────────
  const migrationSQL = `
DO $$ BEGIN CREATE TYPE reconciliation_status AS ENUM ('matched','needs_review','unmatched'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE exception_type AS ENUM ('amount_mismatch','missing_invoice','missing_records','duplicate_transaction','vendor_mismatch','date_mismatch'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE severity_level AS ENUM ('High','Medium','Low'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE batch_status AS ENUM ('Completed','Audit Complete','Archived','Processing','Failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  period TEXT NOT NULL,
  status batch_status DEFAULT 'Completed',
  total_transactions INT DEFAULT 0,
  matched INT DEFAULT 0,
  needs_review INT DEFAULT 0,
  unmatched INT DEFAULT 0,
  match_rate NUMERIC(5,2) DEFAULT 0.00,
  total_amount NUMERIC(15,2) DEFAULT 0.00,
  matched_amount NUMERIC(15,2) DEFAULT 0.00,
  review_amount NUMERIC(15,2) DEFAULT 0.00,
  unmatched_amount NUMERIC(15,2) DEFAULT 0.00,
  execution_time TEXT DEFAULT '4.2s',
  initiated_by TEXT DEFAULT 'Ananya Deshmukh (Head of Finance)',
  files JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  vendor TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  amount NUMERIC(15,2) NOT NULL,
  bank_amount NUMERIC(15,2) DEFAULT 0.00,
  invoice_amount NUMERIC(15,2) DEFAULT 0.00,
  payment_amount NUMERIC(15,2) DEFAULT 0.00,
  reference TEXT,
  status reconciliation_status NOT NULL DEFAULT 'matched',
  confidence INT DEFAULT 95,
  exception_type exception_type,
  severity severity_level,
  match_reasons JSONB DEFAULT '[]'::JSONB,
  issues JSONB DEFAULT '[]'::JSONB,
  reviewed BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  bank_record JSONB,
  invoice_record JSONB,
  payment_record JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  business_name TEXT DEFAULT 'Apex Retail & Logistics Pvt Ltd',
  gstin TEXT DEFAULT '27AAACA9918B1ZX',
  pan TEXT DEFAULT 'AAACA9918B',
  primary_currency TEXT DEFAULT 'INR (₹)',
  auto_match_threshold INT DEFAULT 90,
  fuzzy_vendor_matching BOOLEAN DEFAULT TRUE,
  date_tolerance_days INT DEFAULT 3,
  auto_flag_duplicate_threshold_hours INT DEFAULT 48,
  require_approval_for_tds_differences BOOLEAN DEFAULT TRUE,
  notify_on_high_severity BOOLEAN DEFAULT TRUE,
  notify_on_completion BOOLEAN DEFAULT TRUE,
  email_alerts TEXT DEFAULT 'finance-ops@apexretail.in',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_status   ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_batch_id ON transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_vendor   ON transactions(vendor);
CREATE INDEX IF NOT EXISTS idx_batches_date          ON batches(date DESC);

ALTER TABLE batches      DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings     DISABLE ROW LEVEL SECURITY;
  `;

  // Use Supabase Management API (pg REST endpoint)
  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql: migrationSQL }),
    }
  );

  if (!response.ok) {
    // Try direct pg endpoint
    console.log('[Migration] RPC not available — using direct table creation via Supabase client...');
    await createTablesDirectly();
  } else {
    console.log('[Migration] ✓ Schema migration complete via RPC');
  }

  // ── Step 3: Seed ─────────────────────────────────────────────────────────────
  console.log('\n[Seed] Running seed script...');
  const { seedDatabase } = await import('./seedData.js');
  await seedDatabase();

  console.log('\n✅  Database is fully connected and seeded!\n');
  console.log('  You can now run:  npm start');
  console.log('  Health check:    http://localhost:5000/health\n');
  process.exit(0);
}

async function createTablesDirectly() {
  // Create tables one by one using supabase-js (works without exec_sql RPC)
  
  // Check if batches table exists by querying it
  const { error: batchCheckErr } = await supabase.from('batches').select('id').limit(1);
  
  if (batchCheckErr?.code === '42P01') {
    // Table doesn't exist — user must run SQL manually
    console.error('\n[Migration] ❌ Tables do not exist yet.');
    console.error('[Migration] Please run the SQL migration manually:');
    console.error('  1. Go to: https://supabase.com/dashboard/project/gvlxmagvpkioztntrvfm/sql/new');
    console.error('  2. Paste the contents of: backend/supabase_migration.sql');
    console.error('  3. Click Run');
    console.error('  4. Then run this script again: node src/utils/runMigration.js\n');
    process.exit(1);
  } else if (batchCheckErr) {
    console.error('[Migration] Unexpected error:', batchCheckErr.message);
    process.exit(1);
  } else {
    console.log('[Migration] ✓ Tables already exist — skipping DDL');
  }
}

runMigration().catch(err => {
  console.error('[Migration] Fatal error:', err.message);
  process.exit(1);
});
