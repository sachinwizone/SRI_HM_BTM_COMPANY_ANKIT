import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './server/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  try {
    console.log('🚀 Running delivery_terms migration...');
    await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
