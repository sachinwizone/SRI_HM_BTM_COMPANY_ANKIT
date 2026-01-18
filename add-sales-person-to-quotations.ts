import { sql } from 'drizzle-orm';
import { db } from './server/db';

/**
 * Migration: Add salesPersonId column to quotations table
 * This allows quotations to have an assigned sales person separate from the preparedBy user
 */
async function addSalesPersonToQuotations() {
  try {
    console.log('🔄 Adding sales_person_id column to quotations table...');
    
    // Add the salesPersonId column to the quotations table
    await db.execute(sql`
      ALTER TABLE quotations 
      ADD COLUMN sales_person_id VARCHAR REFERENCES users(id)
    `);
    
    console.log('✅ Successfully added sales_person_id column to quotations table');
    console.log('📝 Quotations can now have assigned sales persons');
    
  } catch (error) {
    console.error('❌ Error adding sales_person_id column:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  addSalesPersonToQuotations()
    .then(() => {
      console.log('🎉 Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export default addSalesPersonToQuotations;