import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function testPendingOrders() {
  try {
    console.log("\n� CHECKING INVOICE CUSTOMER LINKING:");
    const allInv = await db.execute(sql`
      SELECT si.invoice_number, si.customer_id, c.id, c.name
      FROM sales_invoices si
      LEFT JOIN clients c ON si.customer_id = c.id
      LIMIT 5
    `);
    
    allInv.rows.forEach((inv) => {
      console.log(`   Invoice: ${inv.invoice_number} | customer_id: ${inv.customer_id} | client.id: ${inv.id} | client.name: ${inv.name}`);
    });
    
    console.log("\n🔍 CHECKING IF CUSTOMER_ID IS EVEN A VALID CLIENT ID:");
    const inv559 = await db.execute(sql`
      SELECT si.invoice_number, si.customer_id
      FROM sales_invoices si
      WHERE si.invoice_number = 'SRIHM/559/25-26'
    `);
    
    if (inv559.rows.length > 0) {
      const custId = inv559.rows[0].customer_id;
      console.log(`\n   Invoice SRIHM/559/25-26 customer_id: ${custId}`);
      
      const client = await db.execute(sql`
        SELECT * FROM clients WHERE id = ${custId}
      `);
      
      if (client.rows.length > 0) {
        console.log(`   Found client: ${client.rows[0].name}`);
      } else {
        console.log(`   NO CLIENT FOUND with that ID`);
      }
    }
    // Query all sales orders
    const salesOrdersResult = await db.execute(sql`
      SELECT 
        so.id,
        so.order_number as "orderNumber",
        c.name as "customerName",
        so.total_amount as "totalAmount",
        so.created_at as "createdAt"
      FROM sales_orders so
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE so.order_number = 'SRIHM-SO/338/25-26'
      ORDER BY so.created_at DESC
    `);
    
    const salesOrders = salesOrdersResult.rows;
    console.log(`\n📦 Found ${salesOrders.length} sales orders`);
    
    if (salesOrders.length === 0) {
      console.log("No sales order found with that number");
      process.exit(0);
    }
    
    const order = salesOrders[0];
    console.log(`\n🎯 TARGET SO: ${order.orderNumber}`);
    console.log(`   Customer: ${order.customerName}`);
    console.log(`   Total Amount: ${order.totalAmount}`);
    
    // Get all items in this sales order
    const itemsResult = await db.execute(sql`
      SELECT 
        soi.id,
        soi.product_id as "productId",
        soi.description as "productName",
        soi.unit,
        soi.quantity,
        soi.unit_price as "rate"
      FROM sales_order_items soi
      WHERE soi.sales_order_id = ${order.id}
    `);
    
    const items = itemsResult.rows;
    console.log(`\n📦 Found ${items.length} items in this SO:`);
    
    let totalSOQty = 0;
    let totalInvoicedQty = 0;
    let totalInvoicedAmount = 0;
    let allInvoiceNumbers = [];
    
    for (const item of items) {
      console.log(`\n   Item: ${item.productName}`);
      console.log(`      Qty: ${item.quantity}, Unit: ${item.unit}, Rate: ${item.rate}`);
      
      const invoicedResult = await db.execute(sql`
        SELECT 
          si.invoice_number as "invoiceNumber",
          SUM(CAST(sii.quantity AS DECIMAL)) as "quantity",
          sii.product_id as "productId",
          si.total_invoice_amount as "invoiceAmount",
          si.created_at as "invoiceDate"
        FROM sales_invoice_items sii
        INNER JOIN sales_invoices si ON sii.invoice_id = si.id
        WHERE si.sales_order_number = ${order.orderNumber}
        AND sii.product_id = ${item.productId}
        GROUP BY si.id, si.invoice_number, si.total_invoice_amount, sii.product_id, si.created_at
        ORDER BY si.created_at DESC
      `);
      
      const invoices = invoicedResult.rows;
      console.log(`      Invoices: ${invoices.length}`);
      
      invoices.forEach((inv) => {
        if (!allInvoiceNumbers.includes(inv.invoiceNumber)) {
          allInvoiceNumbers.push(inv.invoiceNumber);
        }
        console.log(`         - ${inv.invoiceNumber}: Qty=${inv.quantity}, Amount=${inv.invoiceAmount}`);
        totalInvoicedAmount += parseFloat(inv.invoiceAmount || 0);
      });
      
      const soQty = parseFloat(item.quantity);
      totalSOQty += soQty;
      
      let invoicedQty = 0;
      invoices.forEach((inv) => {
        invoicedQty += parseFloat(inv.quantity || 0);
      });
      
      totalInvoicedQty += invoicedQty;
    }
    
    const totalPendingQty = Math.max(0, totalSOQty - totalInvoicedQty);
    
    console.log(`\n📊 FINAL CALCULATION:`);
    console.log(`   Total SO Qty: ${totalSOQty}`);
    console.log(`   Total Invoiced Qty: ${totalInvoicedQty}`);
    console.log(`   Total Pending Qty: ${totalPendingQty} ✅`);
    console.log(`   Total SO Amount: ${order.totalAmount}`);
    console.log(`   Total Invoiced Amount: ${Math.round(totalInvoicedAmount * 100) / 100}`);
    console.log(`   All Invoices: ${allInvoiceNumbers.join(", ")}`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

testPendingOrders();
