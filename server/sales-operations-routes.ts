// Sales Operations API Routes
// This file contains the API endpoints for the sales operations module

import type { Express } from "express";
import * as storage from "./sales-operations-storage";
import { requireAuth } from "./auth";
import { storage as mainStorage } from "./storage";
import { db } from "./db";
import { clients, productMaster, invoicePayments, purchaseInvoicePayments } from "@shared/schema";
import { eq, sum, sql } from "drizzle-orm";

export default function setupSalesOperationsRoutes(app: Express) {
  
  // ============ COMPANY MANAGEMENT ============
  
  // Get company details
  app.get("/api/sales-operations/company", requireAuth, async (req, res) => {
    try {
      const company = await storage.getCompany();
      res.json(company);
    } catch (error: any) {
      console.error("Error fetching company:", error);
      res.status(500).json({ error: "Failed to fetch company details" });
    }
  });

  // Create/Update company
  app.post("/api/sales-operations/company", requireAuth, async (req, res) => {
    try {
      const existingCompany = await storage.getCompany();
      let company;
      
      if (existingCompany) {
        company = await storage.updateCompany(existingCompany.id, req.body);
      } else {
        company = await storage.createCompany(req.body);
      }
      
      res.status(201).json(company);
    } catch (error: any) {
      console.error("Error saving company:", error);
      res.status(500).json({ error: "Failed to save company details" });
    }
  });

  // ============ PARTY (CUSTOMER/SUPPLIER) MANAGEMENT ============
  
  // Get all parties
  app.get("/api/sales-operations/parties", requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      let parties;
      
      if (type) {
        parties = await storage.getPartiesByType(type as string);
      } else {
        parties = await storage.getAllParties();
      }
      
      res.json(parties);
    } catch (error: any) {
      console.error("Error fetching parties:", error);
      res.status(500).json({ error: "Failed to fetch parties" });
    }
  });

  // Get party by ID
  app.get("/api/sales-operations/parties/:id", requireAuth, async (req, res) => {
    try {
      const party = await storage.getPartyById(req.params.id);
      if (!party) {
        return res.status(404).json({ error: "Party not found" });
      }
      res.json(party);
    } catch (error: any) {
      console.error("Error fetching party:", error);
      res.status(500).json({ error: "Failed to fetch party" });
    }
  });

  // Create party
  app.post("/api/sales-operations/parties", requireAuth, async (req, res) => {
    try {
      const party = await storage.createParty(req.body);
      res.status(201).json(party);
    } catch (error: any) {
      console.error("Error creating party:", error);
      res.status(500).json({ error: "Failed to create party" });
    }
  });

  // Update party
  app.put("/api/sales-operations/parties/:id", requireAuth, async (req, res) => {
    try {
      const party = await storage.updateParty(req.params.id, req.body);
      res.json(party);
    } catch (error: any) {
      console.error("Error updating party:", error);
      res.status(500).json({ error: "Failed to update party" });
    }
  });

  // Delete party
  app.delete("/api/sales-operations/parties/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteParty(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting party:", error);
      res.status(500).json({ error: "Failed to delete party" });
    }
  });

  // ============ PRODUCT MANAGEMENT ============
  
  // Get all products
  app.get("/api/sales-operations/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get product by ID
  app.get("/api/sales-operations/products/:id", requireAuth, async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create product
  app.post("/api/sales-operations/products", requireAuth, async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Update product
  app.put("/api/sales-operations/products/:id", requireAuth, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Delete product
  app.delete("/api/sales-operations/products/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Get low stock products
  app.get("/api/sales-operations/products/low-stock", requireAuth, async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ error: "Failed to fetch low stock products" });
    }
  });

  // ============ TRANSPORTER MANAGEMENT ============
  
  // Get all transporters
  app.get("/api/sales-operations/transporters", requireAuth, async (req, res) => {
    try {
      const transporters = await storage.getAllTransporters();
      res.json(transporters);
    } catch (error: any) {
      console.error("Error fetching transporters:", error);
      res.status(500).json({ error: "Failed to fetch transporters" });
    }
  });

  // Create transporter
  app.post("/api/sales-operations/transporters", requireAuth, async (req, res) => {
    try {
      const transporter = await storage.createTransporter(req.body);
      res.status(201).json(transporter);
    } catch (error: any) {
      console.error("Error creating transporter:", error);
      res.status(500).json({ error: "Failed to create transporter" });
    }
  });

  // ============ SALES INVOICE MANAGEMENT ============
  
  // Get all sales invoices
  app.get("/api/sales-operations/sales-invoices", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getAllSalesInvoices();
      res.json(invoices);
    } catch (error: any) {
      console.error("Error fetching sales invoices:", error);
      res.status(500).json({ error: "Failed to fetch sales invoices" });
    }
  });

  // Get sales invoice by ID with items
  app.get("/api/sales-operations/sales-invoices/:id", requireAuth, async (req, res) => {
    try {
      const result = await storage.getSalesInvoiceWithItems(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Sales invoice not found" });
      }
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching sales invoice:", error);
      res.status(500).json({ error: "Failed to fetch sales invoice" });
    }
  });

  // Update sales invoice payment status
  app.patch("/api/sales-operations/sales-invoices/:id/status", requireAuth, async (req, res) => {
    try {
      const { paymentStatus } = req.body;
      const validStatuses = ['PENDING', 'OVERDUE', 'PAID', 'PARTIAL'];
      
      if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
        return res.status(400).json({ error: "Valid payment status is required (PENDING, OVERDUE, PAID, PARTIAL)" });
      }

      const updated = await storage.updateSalesInvoice(req.params.id, { paymentStatus });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating sales invoice status:", error);
      res.status(500).json({ error: "Failed to update sales invoice status" });
    }
  });

  // Create sales invoice
  app.post("/api/sales-operations/sales-invoices", requireAuth, async (req, res) => {
    try {
      const { invoice, items } = req.body;
      const currentUser = (req as any).user;
      
      console.log('📝 CREATE SALES INVOICE - Full request body:', JSON.stringify(req.body, null, 2));
      console.log('📝 CREATE SALES INVOICE - Received invoice data:', {
        invoiceNumber: invoice.invoiceNumber,
        salesOrderNumber: invoice.salesOrderNumber,
        salesOrderNumberType: typeof invoice.salesOrderNumber,
        customerId: invoice.customerId,
        itemsCount: items?.length
      });
      
      // Validate required fields
      if (!invoice) {
        return res.status(400).json({ error: "Invoice data is required" });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
      }
      if (!invoice.customerId) {
        return res.status(400).json({ error: "Customer ID is required" });
      }
      
      // Sync client to invoice_parties if needed
      console.log('🔍 SYNCING CUSTOMER - START', { customerId: invoice.customerId });
      const client = await db.select().from(clients).where(eq(clients.id, invoice.customerId)).limit(1);
      console.log('🔍 Found client:', client[0] ? { id: client[0].id, name: client[0].name } : 'NOT FOUND');
      if (!client || client.length === 0) {
        return res.status(400).json({ error: "Customer not found" });
      }
      
      const syncedCustomer = await storage.syncClientToInvoiceParties(client[0]);
      console.log('✅ Customer synced to invoice_parties:', { oldId: invoice.customerId, newId: syncedCustomer.id, name: syncedCustomer.partyName });
      // Use the invoice_parties ID instead of clients ID
      invoice.customerId = syncedCustomer.id;
      
      // Sync products to invoice_products if needed
      console.log('🔍 SYNCING PRODUCTS - START', { itemsCount: items.length });
      for (const item of items) {
        console.log(`🔍 Processing item: productId=${item.productId}, productName=${item.productName}`);
        if (item.productId) {
          const product = await db.select().from(productMaster).where(eq(productMaster.id, item.productId)).limit(1);
          console.log(`🔍 Found product in productMaster table:`, product[0] ? {id: product[0].id, name: product[0].name} : '❌ NOT FOUND');
          if (product && product.length > 0) {
            const syncedProduct = await storage.syncProductToInvoiceProducts(product[0]);
            console.log(`✅ Product synced: oldId=${item.productId}, newId=${syncedProduct.id}, name=${syncedProduct.productName}`);
            // Update the item's productId to use the invoice_products ID
            item.productId = syncedProduct.id;
            console.log(`✅ Item productId updated to: ${item.productId}`);
          }
        }
      }
      console.log('✅ ALL PRODUCTS SYNCED');

      
      // Generate invoice number if not provided
      if (!invoice.invoiceNumber) {
        const financialYear = await storage.getCurrentFinancialYear();
        invoice.invoiceNumber = await storage.generateInvoiceNumber('SALES', financialYear);
        invoice.financialYear = financialYear;
      } else {
        // If invoice number is provided, still need financial year
        if (!invoice.financialYear) {
          invoice.financialYear = await storage.getCurrentFinancialYear();
        }
      }
      
      // Convert date strings to Date objects
      if (invoice.invoiceDate && typeof invoice.invoiceDate === 'string') {
        invoice.invoiceDate = new Date(invoice.invoiceDate);
      }
      if (invoice.dueDate && typeof invoice.dueDate === 'string') {
        invoice.dueDate = new Date(invoice.dueDate);
      }
      if (invoice.ewayBillValidUpto && typeof invoice.ewayBillValidUpto === 'string') {
        invoice.ewayBillValidUpto = new Date(invoice.ewayBillValidUpto);
      }
      
      // Set creator
      invoice.createdBy = currentUser.id;
      
      const result = await storage.createSalesInvoice(invoice, items);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error creating sales invoice:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ 
        error: error.message || "Failed to create sales invoice",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Update sales invoice
  app.put("/api/sales-operations/sales-invoices/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const updateData = { ...req.body, modifiedBy: currentUser.id };
      
      // Auto-update payment status based on remaining balance
      if (updateData.paidAmount !== undefined || updateData.remainingBalance !== undefined) {
        const existingInvoice = await storage.getSalesInvoiceById(req.params.id);
        if (existingInvoice) {
          const totalAmount = parseFloat(updateData.totalInvoiceAmount || existingInvoice.totalInvoiceAmount || '0');
          const paidAmount = parseFloat(updateData.paidAmount || existingInvoice.paidAmount || '0');
          const remainingBalance = totalAmount - paidAmount;
          
          updateData.remainingBalance = remainingBalance.toFixed(2);
          
          // Auto-set status to PAID if fully paid
          if (remainingBalance <= 0) {
            updateData.paymentStatus = 'PAID';
          } else if (paidAmount > 0 && remainingBalance > 0) {
            updateData.paymentStatus = 'PARTIAL';
          }
        }
      }
      
      const invoice = await storage.updateSalesInvoice(req.params.id, updateData);
      res.json(invoice);
    } catch (error: any) {
      console.error("Error updating sales invoice:", error);
      res.status(500).json({ error: "Failed to update sales invoice" });
    }
  });

  // Delete sales invoice
  app.delete("/api/sales-operations/sales-invoices/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSalesInvoice(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting sales invoice:", error);
      res.status(500).json({ error: "Failed to delete sales invoice" });
    }
  });

  // ============ PENDING ORDERS CALCULATION ============
  
  // Get pending orders - items with remaining quantities not yet fully invoiced
  app.get("/api/sales-operations/pending-orders", requireAuth, async (req, res) => {
    try {
      console.log("🔍 Fetching pending orders...");
      
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
        ORDER BY so.created_at DESC
      `);
      
      const salesOrders = salesOrdersResult.rows as any[];
      console.log(`📦 Found ${salesOrders.length} sales orders`);
      
      // Log the sales order we're looking for
      const targetSO = salesOrders.find((so: any) => so.orderNumber === "SRIHM-SO/338/25-26");
      if (targetSO) {
        console.log(`🎯 Found target SO: ${targetSO.orderNumber}, Customer: ${targetSO.customerName}, Amount: ${targetSO.totalAmount}`);
      }
      
      const result: any[] = [];
      
      // For each sales order
      for (const order of salesOrders) {
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
        
        const items = itemsResult.rows as any[];
        
        // Calculate total invoiced for this sales order
        let totalInvoicedAmount = 0;
        let allInvoiceNumbers: string[] = [];
        let totalSOQty = 0;
        let totalInvoicedQty = 0;
        
        // Get ALL invoices for this sales order in ONE query (simplified)
        const allInvoicesResult = await db.execute(sql`
          SELECT DISTINCT
            si.id,
            si.invoice_number as "invoiceNumber",
            si.total_invoice_amount as "invoiceAmount",
            si.created_at as "invoiceDate"
          FROM sales_invoices si
          WHERE si.sales_order_number = ${order.orderNumber}
          ORDER BY si.created_at DESC
        `);
        
        const allInvoices = allInvoicesResult.rows as any[];
        console.log(`🔗 Found ${allInvoices.length} invoices for SO ${order.orderNumber}`, allInvoices.map(inv => inv.invoiceNumber));
        
        // Collect invoice numbers and sum amounts
        allInvoices.forEach((inv: any) => {
          allInvoiceNumbers.push(inv.invoiceNumber);
          totalInvoicedAmount += parseFloat(inv.invoiceAmount || 0);
        });
        
        // Calculate total quantities from items
        for (const item of items) {
          totalSOQty += parseFloat(item.quantity || 0);
        }
        
        // Get total invoiced quantity from ALL invoice items (don't match by product_id as they may differ after sync)
        const totalInvoicedQtyResult = await db.execute(sql`
          SELECT 
            SUM(CAST(sii.quantity AS DECIMAL)) as "totalQty"
          FROM sales_invoice_items sii
          INNER JOIN sales_invoices si ON sii.invoice_id = si.id
          WHERE si.sales_order_number = ${order.orderNumber}
        `);
        
        console.log(`🔎 Invoiced qty query result for SO ${order.orderNumber}:`, totalInvoicedQtyResult.rows);
        
        const qtyResult = totalInvoicedQtyResult.rows[0] as any;
        if (qtyResult && qtyResult.totalQty) {
          totalInvoicedQty = parseFloat(qtyResult.totalQty || 0);
        }
        
        console.log(`✅ Final invoiced qty for SO ${order.orderNumber}: ${totalInvoicedQty}`);
        
        // Calculate pending qty = total SO qty - total invoiced qty
        const totalPendingQty = Math.max(0, totalSOQty - totalInvoicedQty);
        
        // Log detailed info for the target SO
        if (order.orderNumber === "SRIHM-SO/338/25-26") {
          console.log(`\n📊 DETAILED CALCULATION FOR ${order.orderNumber}:`);
          console.log(`   Total SO Qty: ${totalSOQty}`);
          console.log(`   Total Invoiced Qty: ${totalInvoicedQty}`);
          console.log(`   Total Invoiced Amount: ${totalInvoicedAmount}`);
          console.log(`   Total Pending Qty: ${totalPendingQty}`);
          console.log(`   Invoice Numbers: ${allInvoiceNumbers.join(", ")}\n`);
        }
        
        // Show this sales order with all its invoices
        result.push({
          id: order.id,
          salesOrderNumber: order.orderNumber,
          customerName: order.customerName || "N/A",
          invoiceNumbers: allInvoiceNumbers.length > 0 ? allInvoiceNumbers.join(", ") : "N/A",
          totalSOQty: totalSOQty,
          totalInvoicedQty: totalInvoicedQty,
          totalPendingQty: totalPendingQty,
          totalSalesAmount: parseFloat(order.totalAmount || 0),
          totalInvoicedAmount: Math.round(totalInvoicedAmount * 100) / 100,
          createdAt: order.createdAt
        });
        
        console.log(`📋 SO ${order.orderNumber}: SOQty=${totalSOQty}, InvoicedQty=${totalInvoicedQty}, Pending=${totalPendingQty}`);
      }
      
      console.log(`✅ Returning ${result.length} sales orders`);
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error fetching pending orders:", error);
      res.status(500).json({ error: "Failed to fetch pending orders" });
    }
  });

  // Update invoice number (for quick correction of old data)
  app.patch("/api/sales-operations/update-invoice-number", requireAuth, async (req, res) => {
    try {
      const { salesOrderNumber, oldInvoiceNumber, newInvoiceNumber } = req.body;

      // Validate inputs
      if (!salesOrderNumber || !oldInvoiceNumber || !newInvoiceNumber) {
        return res.status(400).json({ 
          message: "Sales order number, old invoice number, and new invoice number are required" 
        });
      }

      // Find the invoice to update
      const invoiceResult = await db.execute(sql`
        SELECT id FROM sales_invoices 
        WHERE sales_order_number = ${salesOrderNumber} 
        AND invoice_number = ${oldInvoiceNumber}
      `);

      const invoice = invoiceResult.rows[0] as any;
      if (!invoice) {
        return res.status(404).json({ 
          message: `Invoice ${oldInvoiceNumber} not found for sales order ${salesOrderNumber}` 
        });
      }

      // Check if new invoice number already exists for this sales order
      const existingResult = await db.execute(sql`
        SELECT id FROM sales_invoices 
        WHERE sales_order_number = ${salesOrderNumber} 
        AND invoice_number = ${newInvoiceNumber}
        AND id != ${invoice.id}
      `);

      if (existingResult.rows.length > 0) {
        return res.status(409).json({ 
          message: `Invoice number ${newInvoiceNumber} already exists for this sales order` 
        });
      }

      // Update the invoice number
      await db.execute(sql`
        UPDATE sales_invoices 
        SET invoice_number = ${newInvoiceNumber}
        WHERE id = ${invoice.id}
      `);

      console.log(`✅ Successfully updated invoice number from ${oldInvoiceNumber} to ${newInvoiceNumber} for SO ${salesOrderNumber}`);

      res.json({ 
        message: "Invoice number updated successfully",
        invoiceId: invoice.id,
        oldInvoiceNumber,
        newInvoiceNumber,
        salesOrderNumber
      });
    } catch (error: any) {
      console.error("❌ Error updating invoice number:", error);
      res.status(500).json({ error: "Failed to update invoice number", details: error.message });
    }
  });

  // ============ PURCHASE INVOICE MANAGEMENT ============
  
  // Get next invoice number for auto-generation
  app.get("/api/sales-operations/next-invoice-number", requireAuth, async (req, res) => {
    try {
      const type = (req.query.type as string)?.toUpperCase() === 'SALES' ? 'SALES' : 'PURCHASE';
      const financialYear = await storage.getCurrentFinancialYear();
      const nextNumber = await storage.generateInvoiceNumber(type as 'SALES' | 'PURCHASE', financialYear);
      res.json({ invoiceNumber: nextNumber, financialYear });
    } catch (error: any) {
      console.error("Error generating next invoice number:", error);
      res.status(500).json({ error: "Failed to generate invoice number" });
    }
  });
  
  // Get all purchase invoices with items for display and printing
  app.get("/api/sales-operations/purchase-invoices", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getAllPurchaseInvoicesWithItems();
      res.json(invoices);
    } catch (error: any) {
      console.error("Error fetching purchase invoices:", error);
      res.status(500).json({ error: "Failed to fetch purchase invoices" });
    }
  });

  // Get purchase invoice by ID with items
  app.get("/api/sales-operations/purchase-invoices/:id", requireAuth, async (req, res) => {
    try {
      const result = await storage.getPurchaseInvoiceWithItems(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Purchase invoice not found" });
      }
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching purchase invoice:", error);
      res.status(500).json({ error: "Failed to fetch purchase invoice" });
    }
  });

  // Update purchase invoice payment status
  app.patch("/api/sales-operations/purchase-invoices/:id/status", requireAuth, async (req, res) => {
    try {
      const { paymentStatus } = req.body;
      const validStatuses = ['PENDING', 'OVERDUE', 'PAID', 'PARTIAL'];
      
      if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
        return res.status(400).json({ error: "Valid payment status is required (PENDING, OVERDUE, PAID, PARTIAL)" });
      }

      const updated = await storage.updatePurchaseInvoice(req.params.id, { paymentStatus });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating purchase invoice status:", error);
      res.status(500).json({ error: "Failed to update purchase invoice status" });
    }
  });

  // Create purchase invoice
  app.post("/api/sales-operations/purchase-invoices", requireAuth, async (req, res) => {
    try {
      console.log('=== Purchase Invoice POST Request ===');
      const { invoice, items } = req.body;
      console.log('Invoice data received:', JSON.stringify(invoice, null, 2));
      console.log('Items data received:', JSON.stringify(items, null, 2));
      
      const currentUser = (req as any).user;
      console.log('Current user:', currentUser.id);
      
      // AUTO-SYNC: If supplierId is from Suppliers Master, sync to invoice_parties first
      if (invoice.supplierId) {
        try {
          // Get the supplier from Suppliers Master
          const supplier = await mainStorage.getSupplier(invoice.supplierId);
          if (supplier) {
            console.log('Found supplier in master:', supplier.supplierName);
            const syncedParty = await storage.syncSupplierToInvoiceParties(supplier);
            // Update the supplierId to the invoice_parties ID
            invoice.supplierId = syncedParty.id;
            console.log('Supplier synced successfully, new party ID:', syncedParty.id);
          } else {
            console.log('Supplier not found in master, checking if already exists in invoice_parties...');
            // Maybe it's already an invoice_parties ID
            const existingParty = await storage.getPartyById(invoice.supplierId);
            if (existingParty) {
              console.log('Found existing party in invoice_parties:', existingParty.partyName);
            } else {
              console.error('Supplier ID not found in either table:', invoice.supplierId);
              return res.status(400).json({ error: "Invalid supplier ID. Please select a valid supplier." });
            }
          }
        } catch (syncError: any) {
          console.error('Error syncing supplier:', syncError.message);
          // Try to continue - maybe it's already synced
        }
      }
      
      // Convert date strings to Date objects - with detailed logging
      console.log('Converting dates...');
      console.log('invoiceDate type:', typeof invoice.invoiceDate, 'value:', invoice.invoiceDate);
      if (invoice.invoiceDate && typeof invoice.invoiceDate === 'string') {
        invoice.invoiceDate = new Date(invoice.invoiceDate);
        console.log('Converted invoiceDate:', invoice.invoiceDate);
      }
      
      console.log('supplierInvoiceDate type:', typeof invoice.supplierInvoiceDate, 'value:', invoice.supplierInvoiceDate);
      if (invoice.supplierInvoiceDate && typeof invoice.supplierInvoiceDate === 'string') {
        invoice.supplierInvoiceDate = new Date(invoice.supplierInvoiceDate);
        console.log('Converted supplierInvoiceDate:', invoice.supplierInvoiceDate);
      }
      
      console.log('dueDate type:', typeof invoice.dueDate, 'value:', invoice.dueDate);
      if (invoice.dueDate && typeof invoice.dueDate === 'string') {
        invoice.dueDate = new Date(invoice.dueDate);
        console.log('Converted dueDate:', invoice.dueDate);
      } else if (invoice.dueDate === null || invoice.dueDate === '' || invoice.dueDate === undefined) {
        delete invoice.dueDate; // Remove null/empty dates to let DB handle default
        console.log('Removed empty dueDate');
      }
      
      // Remove any auto-generated timestamp fields that shouldn't be sent
      delete invoice.createdAt;
      delete invoice.modifiedAt;
      delete invoice.updatedAt;
      
      // Only generate invoice number if not provided by user (manual entry)
      // If user provided an invoice number, respect it
      const financialYear = invoice.financialYear || await storage.getCurrentFinancialYear();
      
      // Debug logging for invoice number
      console.log('=== INVOICE NUMBER DEBUG ===');
      console.log('Invoice object keys:', Object.keys(invoice));
      console.log('invoiceNumber value:', invoice.invoiceNumber);
      console.log('invoiceNumber type:', typeof invoice.invoiceNumber);
      console.log('invoiceNumber trimmed:', invoice.invoiceNumber?.trim());
      console.log('isEmpty check:', !invoice.invoiceNumber || invoice.invoiceNumber.trim() === '');
      
      if (!invoice.invoiceNumber || invoice.invoiceNumber.trim() === '') {
        // Auto-generate only if empty
        invoice.invoiceNumber = await storage.generateInvoiceNumber('PURCHASE', financialYear);
        console.log('Generated auto invoice number at save time:', invoice.invoiceNumber);
      } else {
        // User provided manual invoice number
        console.log('Using user-provided invoice number:', invoice.invoiceNumber);
      }
      invoice.financialYear = financialYear;
      
      // Set creator
      invoice.createdBy = currentUser.id;
      
      // Map unit values to valid enum values
      const unitMapping: { [key: string]: string } = {
        'MT': 'TON',
        'METRIC TON': 'TON',
        'TONS': 'TON',
        'KGS': 'KG',
        'KILOGRAM': 'KG',
        'KILOGRAMS': 'KG',
        'DRUMS': 'DRUM',
        'LITRES': 'LITRE',
        'LTR': 'LITRE',
        'L': 'LITRE',
        'PCS': 'PIECE',
        'PIECES': 'PIECE',
        'NOS': 'PIECE',
        'METERS': 'METER',
        'MTR': 'METER',
        'M': 'METER',
        'BOXES': 'BOX'
      };
      
      // Valid enum values
      const validUnits = ['DRUM', 'KG', 'LITRE', 'PIECE', 'METER', 'TON', 'BOX'];
      
      // Process items to ensure valid unit values
      const processedItems = items.map((item: any) => {
        let unit = (item.unitOfMeasurement || 'PIECE').toUpperCase().trim();
        
        // Check if it needs mapping
        if (unitMapping[unit]) {
          unit = unitMapping[unit];
        }
        
        // If still not valid, default to PIECE
        if (!validUnits.includes(unit)) {
          console.log(`Invalid unit "${item.unitOfMeasurement}" mapped to PIECE`);
          unit = 'PIECE';
        }
        
        return {
          ...item,
          unitOfMeasurement: unit
        };
      });
      
      console.log('Final invoice data before storage:', JSON.stringify(invoice, null, 2));
      console.log('Processed items:', JSON.stringify(processedItems, null, 2));
      console.log('Calling createPurchaseInvoice...');
      const result = await storage.createPurchaseInvoice(invoice, processedItems);
      console.log('Invoice created successfully:', result.invoice.id);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error creating purchase invoice:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: error.message || "Failed to create purchase invoice" });
    }
  });

  // Update purchase invoice
  app.put("/api/sales-operations/purchase-invoices/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const updateData = { ...req.body, modifiedBy: currentUser.id };
      
      // Auto-update payment status based on remaining balance
      if (updateData.paidAmount !== undefined || updateData.remainingBalance !== undefined) {
        const existingInvoice = await storage.getPurchaseInvoiceById(req.params.id);
        if (existingInvoice) {
          const totalAmount = parseFloat(updateData.totalInvoiceAmount || existingInvoice.totalInvoiceAmount || '0');
          const paidAmount = parseFloat(updateData.paidAmount || existingInvoice.paidAmount || '0');
          const remainingBalance = totalAmount - paidAmount;
          
          updateData.remainingBalance = remainingBalance.toFixed(2);
          
          // Auto-set status to PAID if fully paid
          if (remainingBalance <= 0) {
            updateData.paymentStatus = 'PAID';
          } else if (paidAmount > 0 && remainingBalance > 0) {
            updateData.paymentStatus = 'PARTIAL';
          }
        }
      }
      
      const invoice = await storage.updatePurchaseInvoice(req.params.id, updateData);
      res.json(invoice);
    } catch (error: any) {
      console.error("Error updating purchase invoice:", error);
      res.status(500).json({ error: "Failed to update purchase invoice" });
    }
  });

  // Delete purchase invoice
  app.delete("/api/sales-operations/purchase-invoices/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePurchaseInvoice(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting purchase invoice:", error);
      res.status(500).json({ error: "Failed to delete purchase invoice" });
    }
  });

  // ============ PURCHASE INVOICE PAYMENT MANAGEMENT ============

  // Record payment for purchase invoice
  app.post("/api/sales-operations/purchase-invoices/record-payment", requireAuth, async (req, res) => {
    try {
      const { invoiceId, amount, paymentDate, paymentMode, referenceNumber } = req.body;
      const currentUser = (req as any).user;

      if (!invoiceId || !amount) {
        return res.status(400).json({ error: "Invoice ID and payment amount are required" });
      }

      // Get the purchase invoice
      const invoice = await storage.getPurchaseInvoiceById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Purchase invoice not found" });
      }

      // Create payment record for purchase invoice using purchaseInvoicePayments table
      await db.insert(purchaseInvoicePayments).values({
        invoiceId: invoiceId,
        paymentAmount: amount.toString(),
        paymentDate: new Date(paymentDate || new Date()),
        paymentMode: paymentMode || 'CASH',
        referenceNumber: referenceNumber || null,
        createdBy: currentUser.id,
      });

      // Get all payments for this invoice and recalculate totals
      const allPayments = await db.select({
        total: sum(purchaseInvoicePayments.paymentAmount),
      }).from(purchaseInvoicePayments).where(eq(purchaseInvoicePayments.invoiceId, invoiceId));

      const totalPaid = parseFloat(allPayments[0]?.total || '0');
      const totalInvoiceAmount = parseFloat(invoice.totalInvoiceAmount || '0');
      const remainingBalance = totalInvoiceAmount - totalPaid;

      let paymentStatus = 'PENDING';
      if (remainingBalance <= 0) {
        paymentStatus = 'PAID';
      } else if (totalPaid > 0) {
        paymentStatus = 'PARTIAL';
      }

      // Update purchase invoice with new totals
      const updatedInvoice = await storage.updatePurchaseInvoice(invoiceId, {
        paidAmount: totalPaid.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
        paymentStatus: paymentStatus,
        modifiedBy: currentUser.id,
      });

      res.json(updatedInvoice);
    } catch (error: any) {
      console.error("Error recording purchase payment:", error);
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  // Get all payments for a purchase invoice
  app.get("/api/sales-operations/purchase-invoices/:invoiceId/payments", requireAuth, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      console.log(`🔍 Fetching payments for purchase invoice: ${invoiceId}`);

      const payments = await db
        .select()
        .from(purchaseInvoicePayments)
        .where(eq(purchaseInvoicePayments.invoiceId, invoiceId));

      console.log(`✅ Fetched ${payments.length} payments for purchase invoice ${invoiceId}`);
      res.json(payments || []);
    } catch (error: any) {
      console.error("❌ Error fetching purchase payments:", error.message);
      res.status(500).json({ error: error.message || "Failed to fetch payments" });
    }
  });

  // ============ PAYMENT MANAGEMENT ============
  
  // Create payment
  app.post("/api/sales-operations/payments", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const paymentData = { ...req.body, createdBy: currentUser.id };
      
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error: any) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // ============ STOCK MANAGEMENT ============
  
  // Get stock ledger
  app.get("/api/sales-operations/stock-ledger", requireAuth, async (req, res) => {
    try {
      const { productId } = req.query;
      const ledger = await storage.getStockLedger(productId as string);
      res.json(ledger);
    } catch (error: any) {
      console.error("Error fetching stock ledger:", error);
      res.status(500).json({ error: "Failed to fetch stock ledger" });
    }
  });

  // ============ REPORTS ============
  
  // Sales report
  app.get("/api/sales-operations/reports/sales", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }
      
      const report = await storage.getSalesReportByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json(report);
    } catch (error: any) {
      console.error("Error generating sales report:", error);
      res.status(500).json({ error: "Failed to generate sales report" });
    }
  });

  // Purchase report
  app.get("/api/sales-operations/reports/purchase", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }
      
      const report = await storage.getPurchaseReportByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json(report);
    } catch (error: any) {
      console.error("Error generating purchase report:", error);
      res.status(500).json({ error: "Failed to generate purchase report" });
    }
  });

  // ============ INVOICE PROFIT REPORT ============
  
  // Get all sales invoices with items for profit calculation
  app.get("/api/sales-operations/invoices-with-items", requireAuth, async (req, res) => {
    try {
      const salesInvoices = await storage.getAllSalesInvoicesWithItems();
      const purchaseInvoices = await storage.getAllPurchaseInvoicesWithItems();
      res.json({ salesInvoices, purchaseInvoices });
    } catch (error: any) {
      console.error("Error fetching invoices with items:", error);
      res.status(500).json({ error: "Failed to fetch invoices with items" });
    }
  });

  // ============ UTILITY ENDPOINTS ============
  
  // Generate invoice number
  app.get("/api/sales-operations/generate-invoice-number", requireAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const financialYear = await storage.getCurrentFinancialYear();
      const invoiceNumber = await storage.generateInvoiceNumber(
        (type as string).toUpperCase() as 'SALES' | 'PURCHASE',
        financialYear
      );
      
      res.json({ invoiceNumber, financialYear });
    } catch (error: any) {
      console.error("Error generating invoice number:", error);
      res.status(500).json({ error: "Failed to generate invoice number" });
    }
  });

  // Validate GSTIN
  app.post("/api/sales-operations/validate-gstin", requireAuth, async (req, res) => {
    try {
      const { gstin } = req.body;
      const isValid = await storage.validateGSTIN(gstin);
      res.json({ valid: isValid });
    } catch (error: any) {
      console.error("Error validating GSTIN:", error);
      res.status(500).json({ error: "Failed to validate GSTIN" });
    }
  });

  // ============ LEDGER MANAGEMENT ============

  // Get company-wise ledger for sales order
  app.get("/api/sales-orders/:salesOrderId/company-ledger", requireAuth, async (req, res) => {
    try {
      const { salesOrderId } = req.params;

      // Get sales order with client info
      const salesOrder = await mainStorage.getSalesOrderById(salesOrderId);
      if (!salesOrder) {
        return res.status(404).json({ error: "Sales order not found" });
      }

      // Get all sales invoices for this client
      const invoices = await mainStorage.getSalesInvoicesForClient(salesOrder.clientId);

      // Build ledger data
      let totalAmount = 0;
      let totalPaid = 0;
      let totalPending = 0;

      const ledgerEntries = invoices.map((invoice: any) => {
        const paid = invoice.paidAmount || 0;
        const pending = (invoice.totalAmount || 0) - paid;
        
        totalAmount += invoice.totalAmount || 0;
        totalPaid += paid;
        totalPending += pending;

        let status = "PENDING";
        if (paid >= (invoice.totalAmount || 0)) {
          status = "PAID";
        } else if (paid > 0) {
          status = "PARTIAL";
        }

        // Check if overdue
        const dueDate = new Date(invoice.dueDate || invoice.invoiceDate);
        if (dueDate < new Date() && paid < (invoice.totalAmount || 0)) {
          status = "OVERDUE";
        }

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate || new Date(new Date(invoice.invoiceDate).getTime() + 30 * 24 * 60 * 60 * 1000),
          totalAmount: invoice.totalAmount || 0,
          paidAmount: paid,
          pendingAmount: pending,
          status,
          paymentDetails: invoice.payments || []
        };
      });

      const client = await mainStorage.getClientById(salesOrder.clientId);

      res.json({
        companyId: salesOrder.clientId,
        companyName: client?.name || "Unknown",
        totalInvoices: ledgerEntries.length,
        totalAmount,
        totalPaid,
        totalPending,
        ledgerEntries: ledgerEntries.sort((a: any, b: any) => 
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
        )
      });
    } catch (error: any) {
      console.error("Error fetching company ledger:", error);
      res.status(500).json({ error: "Failed to fetch company ledger" });
    }
  });

  // ============ RECORD PAYMENT ============

  // Record payment for invoice
  app.post("/api/sales-operations/record-payment", requireAuth, async (req, res) => {
    try {
      const { invoiceId, amount, paymentDate, paymentMode, referenceNumber } = req.body;
      const currentUser = (req as any).user;

      if (!invoiceId || !amount) {
        return res.status(400).json({ error: "Invoice ID and payment amount are required" });
      }

      // Get the invoice
      const invoice = await storage.getSalesInvoiceById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Create payment record
      await db.insert(invoicePayments).values({
        invoiceId: invoiceId,
        paymentAmount: amount.toString(),
        paymentDate: new Date(paymentDate || new Date()),
        paymentMode: paymentMode || 'CASH',
        referenceNumber: referenceNumber || null,
        createdBy: currentUser.id,
      });

      // Get all payments for this invoice and recalculate totals
      const allPayments = await db.select({
        total: sum(invoicePayments.paymentAmount),
      }).from(invoicePayments).where(eq(invoicePayments.invoiceId, invoiceId));

      const totalPaid = parseFloat(allPayments[0]?.total || 0);
      const totalInvoiceAmount = parseFloat(invoice.totalInvoiceAmount || 0);
      const remainingBalance = totalInvoiceAmount - totalPaid;

      let paymentStatus = 'PENDING';
      if (remainingBalance <= 0) {
        paymentStatus = 'PAID';
      } else if (totalPaid > 0) {
        paymentStatus = 'PARTIAL';
      }

      // Update invoice with new totals
      const updatedInvoice = await storage.updateSalesInvoice(invoiceId, {
        paidAmount: totalPaid.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
        paymentStatus: paymentStatus,
        modifiedBy: currentUser.id,
      });

      res.json(updatedInvoice);
    } catch (error: any) {
      console.error("Error recording payment:", error);
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  // Get all payments for an invoice
  app.get("/api/sales-operations/invoices/:invoiceId/payments", requireAuth, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      console.log(`🔍 Fetching payments for invoice: ${invoiceId}`);

      // First, verify invoicePayments table is accessible
      console.log('📋 invoicePayments schema:', invoicePayments);

      const payments = await db
        .select()
        .from(invoicePayments)
        .where(eq(invoicePayments.invoiceId, invoiceId));

      console.log(`✅ Fetched ${payments.length} payments for invoice ${invoiceId}`);
      if (payments.length > 0) {
        console.log('First payment:', JSON.stringify(payments[0]));
      }
      res.json(payments || []);
    } catch (error: any) {
      console.error("❌ Error fetching payments:");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: error.message || "Failed to fetch payments", details: error.stack });
    }
  });

  // ============ INVOICE LEDGER ============

  // Get invoice payment ledger details
  app.get("/api/sales-operations/invoices/:invoiceId/ledger", requireAuth, async (req, res) => {
    try {
      const { invoiceId } = req.params;
      
      const invoices = await storage.getAllSalesInvoices();
      const invoice = invoices.find((inv: any) => inv.id === invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Fetch all invoices for this customer to show in ledger
      const customerInvoices = invoices.filter((inv: any) => inv.customerId === invoice.customerId);
      
      let totalAmount = 0;
      let totalPaid = 0;
      let totalPending = 0;

      const ledgerEntries = customerInvoices.map((inv: any) => {
        const invoiceAmount = parseFloat(inv.totalInvoiceAmount || 0);
        const paid = parseFloat(inv.paidAmount || 0);
        const pending = invoiceAmount - paid;

        totalAmount += invoiceAmount;
        totalPaid += paid;
        totalPending += pending;

        // Determine status based on payment and due date
        let status = "PENDING";
        if (paid >= invoiceAmount) {
          status = "PAID";
        } else if (paid > 0) {
          status = "PARTIAL";
        } else if (inv.dueDate) {
          const dueDate = new Date(inv.dueDate);
          const today = new Date();
          if (dueDate < today) {
            status = "OVERDUE";
          }
        }

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate || new Date(new Date(inv.invoiceDate).getTime() + 30 * 24 * 60 * 60 * 1000),
          totalAmount: invoiceAmount,
          paidAmount: paid,
          pendingAmount: pending,
          status,
          paymentDetails: inv.payments || []
        };
      });

      const customer = await mainStorage.getClientById(invoice.customerId);

      res.json({
        customerId: invoice.customerId,
        customerName: customer?.name || invoice.customerName || "Unknown",
        totalInvoices: ledgerEntries.length,
        totalAmount,
        totalPaid,
        totalPending,
        ledgerEntries: ledgerEntries.sort((a: any, b: any) => 
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
        )
      });
    } catch (error: any) {
      console.error("Error fetching invoice ledger:", error);
      res.status(500).json({ error: "Failed to fetch invoice ledger" });
    }
  });
}