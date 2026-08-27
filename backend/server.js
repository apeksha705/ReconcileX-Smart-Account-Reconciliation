/**
 * server.js — Entry point
 * Starts the Express server and (on first run) seeds the database.
 */

import 'dotenv/config';
import app from './src/app.js';
import { seedDatabase } from './src/utils/seedData.js';
import { supabase } from './src/config/supabase.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function bootstrap() {
  // Check if DB is reachable and seed if empty
  try {
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('[Seed Check] Could not reach Supabase:', error.message);
      console.warn('  → Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    } else if (count === 0) {
      console.log('[Seed] Database is empty — running seed script...');
      await seedDatabase();
      console.log('[Seed] ✓ Database seeded successfully');
    } else {
      console.log(`[Seed] ✓ Database already has ${count} transactions — skipping seed`);
    }
  } catch (err) {
    console.warn('[Seed] Skipped due to error:', err.message);
  }

  app.listen(PORT, () => {
    console.log('');
    console.log('  ╔═══════════════════════════════════════════════╗');
    console.log('  ║          RECONCILEX API SERVER                ║');
    console.log('  ╠═══════════════════════════════════════════════╣');
    console.log(`  ║  Listening on  http://localhost:${PORT}          ║`);
    console.log(`  ║  Environment:  ${(process.env.NODE_ENV || 'development').padEnd(29)}║`);
    console.log('  ║  Health:       /health                        ║');
    console.log('  ╚═══════════════════════════════════════════════╝');
    console.log('');
  });
}

bootstrap();
