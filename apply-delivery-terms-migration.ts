import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Adding delivery_terms columns to database...');
    
    // Read and execute the migration SQL
    const migrationSql = fs.readFileSync(
      path.join(process.cwd(), 'migrations', 'add_delivery_terms.sql'),
      'utf-8'
    );
    
    await pool.query(migrationSql);
    
    console.log('✅ Migration completed successfully!');
    console.log('Added delivery_terms columns to quotations and sales_orders tables');
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.detail) console.error('Details:', error.detail);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();
