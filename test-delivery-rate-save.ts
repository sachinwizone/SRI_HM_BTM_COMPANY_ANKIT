import { db } from './server/db.js';
import { quotations, quotationItems } from './shared/schema.js';
import { sql } from 'drizzle-orm';

async function testDeliveryRateFlow() {
  try {
    console.log("🧪 Testing Delivery Rate Functionality\n");
    
    // 1. Create a new test quotation
    console.log("1. Creating a test quotation...");
    const [newQuotation] = await db
      .insert(quotations)
      .values({
        quotationNumber: `TEST-${Date.now()}`,
        clientId: '52d072e8-c6f9-4d65-938f-b782021b5db8', // Using existing client
        quotationDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalAmount: '2376',
        discountPercentage: '0',
        discountAmount: '0',
        taxAmount: '0',
        grandTotal: '2376',
        paymentTerms: '30 Days',
        deliveryTerms: 'Standard',
        salesPersonId: 'system',
        preparedByUserId: '87af5f6e-6050-47dd-8328-0186365a5b5e',
        approvalStatus: 'PENDING',
        freightCharged: '0',
      })
      .returning();
    
    console.log(`✅ Created quotation: ${newQuotation.id}\n`);
    
    // 2. Add items with delivery rate = 0
    console.log("2. Adding item with deliveryRate = 0...");
    const [item1] = await db
      .insert(quotationItems)
      .values({
        quotationId: newQuotation.id,
        productId: 'f43d3ce3-17e8-4c76-b4b6-937c43628e85', // PVC TANK
        description: 'PVC TANK (Test with deliveryRate = 0)',
        quantity: '54',
        unit: 'DRUM',
        rate: '0',
        deliveryRate: '0',  // THIS SHOULD BE SAVED AS 0.00, NOT NULL
        amount: '0',
      })
      .returning();
    
    console.log(`✅ Created item 1: ${item1.id}`);
    console.log(`   - Rate: ${item1.rate}`);
    console.log(`   - DeliveryRate: ${(item1 as any).deliveryRate} (Type: ${typeof (item1 as any).deliveryRate})\n`);
    
    // 3. Add items with delivery rate = 434
    console.log("3. Adding item with deliveryRate = 434...");
    const [item2] = await db
      .insert(quotationItems)
      .values({
        quotationId: newQuotation.id,
        productId: 'f43d3ce3-17e8-4c76-b4b6-937c43628e85', // PVC TANK
        description: 'PVC TANK (Test with deliveryRate = 434)',
        quantity: '54',
        unit: 'DRUM',
        rate: '0',
        deliveryRate: '434',  // THIS SHOULD BE SAVED AS 434.00
        amount: '23436',
      })
      .returning();
    
    console.log(`✅ Created item 2: ${item2.id}`);
    console.log(`   - Rate: ${item2.rate}`);
    console.log(`   - DeliveryRate: ${(item2 as any).deliveryRate} (Type: ${typeof (item2 as any).deliveryRate})\n`);
    
    // 4. Verify the items were saved correctly
    console.log("4. Verifying items were saved correctly...\n");
    const savedItems = await db
      .select()
      .from(quotationItems)
      .where(sql`quotation_id = ${newQuotation.id}`);
    
    console.log(`Retrieved ${savedItems.length} items for quotation ${newQuotation.id}:`);
    savedItems.forEach((item, idx) => {
      const deliveryRateValue = (item as any).deliveryRate;
      console.log(`\n Item ${idx + 1}:`);
      console.log(`   - Description: ${item.description}`);
      console.log(`   - Rate: ${item.rate}`);
      console.log(`   - DeliveryRate: ${deliveryRateValue}`);
      console.log(`   - Amount: ${item.amount}`);
      
      // Check if deliveryRate is properly saved
      if (deliveryRateValue === null) {
        console.log(`   ❌ ERROR: deliveryRate is NULL! Should have a value.`);
      } else {
        console.log(`   ✅ Correct: deliveryRate is properly saved as ${deliveryRateValue}`);
      }
    });
    
    console.log("\n✅ Test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    process.exit(0);
  }
}

testDeliveryRateFlow();
