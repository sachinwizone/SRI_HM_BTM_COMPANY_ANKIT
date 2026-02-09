#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

const migrations = [
  `ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS factory_rate numeric(15,2);`,
  `ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS delivery_rate numeric(15,2);`,
  `ALTER TABLE quotation_items ALTER COLUMN rate DROP NOT NULL;`,
  `CREATE INDEX IF NOT EXISTS idx_quotation_items_factory_rate ON quotation_items(factory_rate);`,
  `CREATE INDEX IF NOT EXISTS idx_quotation_items_delivery_rate ON quotation_items(delivery_rate);`,
];

async function runMigrations() {
  try {
    console.log('🔄 Starting quotation item migrations...');
    
    for (const migration of migrations) {
      try {
        console.log(`⏳ Running: ${migration.substring(0, 60)}...`);
        await sql(migration);
        console.log(`✅ Completed`);
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log(`ℹ️  Already exists, skipping`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
