import { sql } from 'drizzle-orm';
import { db } from './server/db';

async function addDeliveryRateColumns() {
  try {
    console.log('Adding factory_rate and delivery_rate columns to quotation_items...');
    
    // Add factory_rate column
    await db.execute(sql`
      ALTER TABLE quotation_items 
      ADD COLUMN IF NOT EXISTS factory_rate numeric(15,2)
    `);
    console.log('✓ Added factory_rate column');
    
    // Add delivery_rate column
    await db.execute(sql`
      ALTER TABLE quotation_items 
      ADD COLUMN IF NOT EXISTS delivery_rate numeric(15,2)
    `);
    console.log('✓ Added delivery_rate column');
    
    // Make rate nullable for backward compatibility
    await db.execute(sql`
      ALTER TABLE quotation_items 
      ALTER COLUMN rate DROP NOT NULL
    `);
    console.log('✓ Made rate column nullable');
    
    // Create indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_quotation_items_factory_rate 
      ON quotation_items(factory_rate)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_quotation_items_delivery_rate 
      ON quotation_items(delivery_rate)
    `);
    console.log('✓ Created indexes');
    
    console.log('\n✅ Successfully added delivery rate columns!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addDeliveryRateColumns();
