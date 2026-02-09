import { db } from './server/db.js';
import { quotationItems } from './shared/schema.js';
import { sql } from 'drizzle-orm';

async function checkDeliveryRates() {
  try {
    console.log("Checking quotation_items table for delivery_rate values...\n");
    
    // Query the raw database
    const items = await db.select().from(quotationItems);
    
    console.log(`Total items in quotation_items table: ${items.length}\n`);
    
    if (items.length === 0) {
      console.log("No items found in quotation_items table");
      return;
    }
    
    // Show first 10 items
    console.log("First 10 items with all fields:");
    items.slice(0, 10).forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Quotation ID: ${item.quotationId}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Unit: ${item.unit}`);
      console.log(`  Rate: ${item.rate}`);
      console.log(`  Factory Rate: ${(item as any).factoryRate}`);
      console.log(`  Delivery Rate: ${(item as any).deliveryRate}`);
      console.log(`  Amount: ${item.amount}`);
    });
    
    // Count items with delivery rate values
    const itemsWithDeliveryRate = items.filter((item: any) => item.deliveryRate && parseFloat(String(item.deliveryRate)) > 0);
    console.log(`\n\nItems with delivery_rate > 0: ${itemsWithDeliveryRate.length}`);
    
    if (itemsWithDeliveryRate.length > 0) {
      console.log("Items with delivery rate:");
      itemsWithDeliveryRate.forEach((item: any) => {
        console.log(`  - Item ${item.id}: deliveryRate = ${item.deliveryRate}`);
      });
    }
    
  } catch (error) {
    console.error("Error checking delivery rates:", error);
  } finally {
    process.exit(0);
  }
}

checkDeliveryRates();
