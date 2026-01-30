import { db } from "./server/db";
import { sql } from "drizzle-orm";

(async () => {
  try {
    console.log("🔍 Testing the exact SUM query...");
    
    const result = await db.execute(sql`
      SELECT SUM(CAST(sii.quantity AS DECIMAL)) as "totalQty"
      FROM sales_invoice_items sii
      INNER JOIN sales_invoices si ON sii.invoice_id = si.id
      WHERE si.sales_order_number = 'SRIHM-SO/338/25-26'
    `);
    
    console.log("SUM Query Result:", JSON.stringify(result.rows, null, 2));
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
})();
