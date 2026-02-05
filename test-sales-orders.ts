import 'dotenv/config';
import { db } from './server/db.js';
import { salesOrders } from './shared/schema.js';

async function testQuery() {
  try {
    console.log('Testing salesOrders query...');
    const results = await db.select().from(salesOrders).limit(1);
    console.log('✅ Query successful!');
    console.log('Sample result:', results[0] || 'No sales orders found');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Query failed:', error.message);
    if (error.detail) console.error('Details:', error.detail);
    process.exit(1);
  }
}

testQuery();
