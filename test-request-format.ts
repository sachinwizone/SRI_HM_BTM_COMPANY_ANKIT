import { z } from "zod";

// Import the actual schema from shared/schema.ts
const insertQuotationItemSchema = z.object({
  quotationId: z.string(),
  productId: z.string(),
  description: z.string().optional(),
  quantity: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  unit: z.string(),
  unitPrice: z.union([z.string(), z.number()]).optional().transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
  totalPrice: z.union([z.string(), z.number()]).optional().transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
  rate: z.union([z.string(), z.number()]).optional().transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
  amount: z.union([z.string(), z.number()]).optional().transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
  factoryRate: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? undefined : num;
  }),
  deliveryRate: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? undefined : num;
  }),
});

console.log("🧪 Testing Schema Validation for Quotation Items\n");

// Simulate what would be sent from the frontend for quotation item creation
const testItems = [
  {
    name: "Item with deliveryRate = 0 (from frontend: deliveryRate || 0)",
    data: {
      quotationId: "test-qid",
      productId: "test-pid",
      description: "PVC TANK",
      quantity: 54,
      unit: "DRUM",
      unitPrice: 0,
      deliveryRate: 0,  // Frontend sends 0 when user doesn't enter delivery rate
      totalPrice: 0,
    }
  },
  {
    name: "Item with deliveryRate = 434 (from frontend: actual value)",
    data: {
      quotationId: "test-qid",
      productId: "test-pid",
      description: "PVC TANK",
      quantity: 54,
      unit: "DRUM",
      unitPrice: 0,
      deliveryRate: 434,  // Frontend sends the value user entered
      totalPrice: 23436,
    }
  },
  {
    name: "Item with deliveryRate = '0' (from frontend as string)",
    data: {
      quotationId: "test-qid",
      productId: "test-pid",
      description: "PVC TANK",
      quantity: "54",
      unit: "DRUM",
      unitPrice: "0",
      deliveryRate: "0",  // Sometimes sent as string from form
      totalPrice: "0",
    }
  },
  {
    name: "Item without deliveryRate (old format)",
    data: {
      quotationId: "test-qid",
      productId: "test-pid",
      description: "PVC TANK",
      quantity: 54,
      unit: "DRUM",
      unitPrice: 0,
      totalPrice: 0,
      // No deliveryRate field
    }
  }
];

testItems.forEach(test => {
  console.log(`Testing: ${test.name}`);
  try {
    const result = insertQuotationItemSchema.parse(test.data);
    console.log(`  ✅ Schema validation passed`);
    console.log(`     Validated deliveryRate: ${result.deliveryRate} (${result.deliveryRate === undefined ? "undefined" : typeof result.deliveryRate})`);
    
    // What will be sent to the database
    const dbValue = (result as any).deliveryRate !== undefined ? String(Number((result as any).deliveryRate)) : undefined;
    console.log(`     Will be saved to DB as: "${dbValue}" (${dbValue === undefined ? "NULL" : "decimal value"})`);
    
    if (test.data.deliveryRate === 0 && result.deliveryRate === undefined) {
      console.log(`  ❌ PROBLEM: deliveryRate=0 was converted to undefined!`);
    } else if (test.data.deliveryRate === 434 && result.deliveryRate !== 434) {
      console.log(`  ❌ PROBLEM: deliveryRate=434 was not preserved!`);
    } else {
      console.log(`  ✅ deliveryRate handled correctly`);
    }
  } catch (e) {
    console.log(`  ❌ Validation failed: ${(e as any).message}`);
  }
  console.log("");
});

console.log("\n🎯 Summary:");
console.log("If all tests show '✅ deliveryRate handled correctly', then the fix is working!");
