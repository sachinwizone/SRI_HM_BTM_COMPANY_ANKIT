import { db } from './server/db.js';
import { quotationItems, quotations } from './shared/schema.js';
import { sql, desc } from 'drizzle-orm';

async function checkNewerDeliveryRates() {
  try {
    console.log("Checking for quotation items created recently with delivery_rate values...\n");
    
    // Get the most recent quotations
    const recentQuotations = await db
      .select()
      .from(quotations)
      .orderBy(desc(quotations.createdAt))
      .limit(10);
    
    console.log(`Most recent 10 quotations:\n`);
    
    for (const quotation of recentQuotations) {
      console.log(`\nQuotation: ${quotation.id}`);
      console.log(`  Created: ${quotation.createdAt}`);
      console.log(`  Client ID: ${quotation.clientId}`);
      
      const items = await db
        .select()
        .from(quotationItems)
        .where(sql`quotation_id = ${quotation.id}`);
      
      console.log(`  Items (${items.length}):`);
      items.forEach(item => {
        console.log(`    - ${item.description}: qty=${item.quantity} ${item.unit}, rate=${item.rate}, deliveryRate=${(item as any).deliveryRate}, amount=${item.amount}`);
      });
    }
    
  } catch (error) {
    console.error("Error checking delivery rates:", error);
  } finally {
    process.exit(0);
  }
}

checkNewerDeliveryRates();
