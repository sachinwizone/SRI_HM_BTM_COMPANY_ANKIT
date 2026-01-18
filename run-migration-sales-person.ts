import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running sales person migration...');
    
    // Add sales_person_id column to quotations
    await client.query(`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS sales_person_id varchar(255)`);
    console.log('✓ Added sales_person_id column to quotations');
    
    console.log('\n✅ Sales person migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});