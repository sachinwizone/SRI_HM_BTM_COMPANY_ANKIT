import { z } from "zod";

// Test the fixed schema with deliveryRate values
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

console.log("Testing deliveryRate schema transformations:\n");

// Test case 1: deliveryRate = 0
const test1 = { quotationId: "1", productId: "p1", unit: "PCS", quantity: 1, deliveryRate: 0 };
try {
  const result1 = insertQuotationItemSchema.parse(test1);
  console.log("✅ Test 1 (deliveryRate = 0):");
  console.log(`   Input: ${test1.deliveryRate}`);
  console.log(`   Output: ${result1.deliveryRate}`);
  console.log(`   Result: ${result1.deliveryRate === undefined ? "UNDEFINED (WRONG!)" : "Saved correctly"}\n`);
} catch (e) {
  console.log("❌ Test 1 failed:", (e as any).message);
}

// Test case 2: deliveryRate = "0"
const test2 = { quotationId: "1", productId: "p1", unit: "PCS", quantity: 1, deliveryRate: "0" };
try {
  const result2 = insertQuotationItemSchema.parse(test2);
  console.log("✅ Test 2 (deliveryRate = '0'):");
  console.log(`   Input: '${test2.deliveryRate}'`);
  console.log(`   Output: ${result2.deliveryRate}`);
  console.log(`   Result: ${result2.deliveryRate === undefined ? "UNDEFINED (WRONG!)" : "Saved correctly"}\n`);
} catch (e) {
  console.log("❌ Test 2 failed:", (e as any).message);
}

// Test case 3: deliveryRate = 434
const test3 = { quotationId: "1", productId: "p1", unit: "PCS", quantity: 1, deliveryRate: 434 };
try {
  const result3 = insertQuotationItemSchema.parse(test3);
  console.log("✅ Test 3 (deliveryRate = 434):");
  console.log(`   Input: ${test3.deliveryRate}`);
  console.log(`   Output: ${result3.deliveryRate}`);
  console.log(`   Result: ${result3.deliveryRate === 434 ? "Saved correctly" : "WRONG!"}\n`);
} catch (e) {
  console.log("❌ Test 3 failed:", (e as any).message);
}

// Test case 4: deliveryRate = undefined
const test4 = { quotationId: "1", productId: "p1", unit: "PCS", quantity: 1 };
try {
  const result4 = insertQuotationItemSchema.parse(test4);
  console.log("✅ Test 4 (deliveryRate = undefined):");
  console.log(`   Input: undefined`);
  console.log(`   Output: ${result4.deliveryRate}`);
  console.log(`   Result: ${result4.deliveryRate === undefined ? "Correctly undefined" : "WRONG!"}\n`);
} catch (e) {
  console.log("❌ Test 4 failed:", (e as any).message);
}
