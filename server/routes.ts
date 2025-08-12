import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertClientSchema, insertOrderSchema, insertPaymentSchema,
  insertTaskSchema, insertEwayBillSchema, insertClientTrackingSchema, insertSalesRateSchema,
  insertCreditAgreementSchema, insertPurchaseOrderSchema,
  insertTallyCompanySchema, insertTallyLedgerSchema, insertTallyStockItemSchema,
  insertTallyVoucherSchema, insertTallySyncLogSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard API
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Users API
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Clients API
  app.get("/api/clients", async (req, res) => {
    try {
      const { category } = req.query;
      let clients;
      if (category) {
        clients = await storage.getClientsByCategory(category as string);
      } else {
        clients = await storage.getAllClients();
      }
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, clientData);
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // Orders API
  app.get("/api/orders", async (req, res) => {
    try {
      const { clientId, salesPersonId } = req.query;
      let orders;
      if (clientId) {
        orders = await storage.getOrdersByClient(clientId as string);
      } else if (salesPersonId) {
        orders = await storage.getOrdersBySalesPerson(salesPersonId as string);
      } else {
        orders = await storage.getAllOrders();
      }
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Check if credit agreement is required and exists
      if (orderData.creditAgreementRequired) {
        const creditAgreement = await storage.getActiveCreditAgreementByClient(orderData.clientId);
        if (!creditAgreement) {
          return res.status(400).json({ message: "Active credit agreement required before creating order" });
        }
        orderData.creditAgreementId = creditAgreement.id;
      }
      
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const orderData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(req.params.id, orderData);
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Purchase Orders API
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const { clientId } = req.query;
      let purchaseOrders;
      if (clientId) {
        purchaseOrders = await storage.getPurchaseOrdersByClient(clientId as string);
      } else {
        purchaseOrders = await storage.getAllPurchaseOrders();
      }
      res.json(purchaseOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const poData = insertPurchaseOrderSchema.parse(req.body);
      const purchaseOrder = await storage.createPurchaseOrder(poData);
      res.status(201).json(purchaseOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });

  // Credit Agreements API
  app.get("/api/credit-agreements", async (req, res) => {
    try {
      const { clientId } = req.query;
      if (clientId) {
        const agreements = await storage.getCreditAgreementsByClient(clientId as string);
        res.json(agreements);
      } else {
        res.status(400).json({ message: "Client ID required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit agreements" });
    }
  });

  app.get("/api/credit-agreements/active/:clientId", async (req, res) => {
    try {
      const agreement = await storage.getActiveCreditAgreementByClient(req.params.clientId);
      res.json(agreement);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active credit agreement" });
    }
  });

  app.post("/api/credit-agreements", async (req, res) => {
    try {
      const agreementData = insertCreditAgreementSchema.parse(req.body);
      const agreement = await storage.createCreditAgreement(agreementData);
      res.status(201).json(agreement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid credit agreement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit agreement" });
    }
  });

  app.put("/api/credit-agreements/:id", async (req, res) => {
    try {
      const agreementData = insertCreditAgreementSchema.partial().parse(req.body);
      const agreement = await storage.updateCreditAgreement(req.params.id, agreementData);
      res.json(agreement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid credit agreement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update credit agreement" });
    }
  });

  // Payments API
  app.get("/api/payments", async (req, res) => {
    try {
      const { clientId, overdue, dueSoon } = req.query;
      let payments;
      
      if (overdue === 'true') {
        payments = await storage.getOverduePayments();
      } else if (dueSoon) {
        payments = await storage.getPaymentsDueSoon(parseInt(dueSoon as string));
      } else if (clientId) {
        payments = await storage.getPaymentsByClient(clientId as string);
      } else {
        payments = await storage.getAllPayments();
      }
      
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(req.params.id, paymentData);
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // Tasks API
  app.get("/api/tasks", async (req, res) => {
    try {
      const { userId, type } = req.query;
      let tasks;
      
      if (userId) {
        tasks = await storage.getTasksByUser(userId as string);
      } else if (type) {
        tasks = await storage.getTasksByType(type as string);
      } else {
        tasks = await storage.getAllTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, taskData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // E-way Bills API
  app.get("/api/eway-bills", async (req, res) => {
    try {
      const { orderId, expiring } = req.query;
      let ewayBills;
      
      if (orderId) {
        ewayBills = await storage.getEwayBillsByOrder(orderId as string);
      } else if (expiring) {
        ewayBills = await storage.getExpiringEwayBills(parseInt(expiring as string));
      } else {
        ewayBills = await storage.getAllEwayBills();
      }
      
      res.json(ewayBills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch e-way bills" });
    }
  });

  app.post("/api/eway-bills", async (req, res) => {
    try {
      const ewayBillData = insertEwayBillSchema.parse(req.body);
      const ewayBill = await storage.createEwayBill(ewayBillData);
      res.status(201).json(ewayBill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid e-way bill data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create e-way bill" });
    }
  });

  app.put("/api/eway-bills/:id", async (req, res) => {
    try {
      const ewayBillData = insertEwayBillSchema.partial().parse(req.body);
      const ewayBill = await storage.updateEwayBill(req.params.id, ewayBillData);
      res.json(ewayBill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid e-way bill data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update e-way bill" });
    }
  });

  // Client Tracking API
  app.get("/api/client-tracking", async (req, res) => {
    try {
      const { clientId } = req.query;
      let tracking;
      
      if (clientId) {
        tracking = await storage.getClientTrackingByClient(clientId as string);
      } else {
        tracking = await storage.getAllClientTracking();
      }
      
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client tracking" });
    }
  });

  app.post("/api/client-tracking", async (req, res) => {
    try {
      const trackingData = insertClientTrackingSchema.parse(req.body);
      const tracking = await storage.createClientTracking(trackingData);
      res.status(201).json(tracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tracking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tracking" });
    }
  });

  app.put("/api/client-tracking/:id", async (req, res) => {
    try {
      const trackingData = insertClientTrackingSchema.partial().parse(req.body);
      const tracking = await storage.updateClientTracking(req.params.id, trackingData);
      res.json(tracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tracking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tracking" });
    }
  });

  // Sales Rates API
  app.get("/api/sales-rates", async (req, res) => {
    try {
      const { clientId, startDate, endDate } = req.query;
      
      if (!clientId) {
        return res.status(400).json({ message: "Client ID required" });
      }
      
      let salesRates;
      if (startDate && endDate) {
        salesRates = await storage.getSalesRatesByDateRange(
          clientId as string,
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        salesRates = await storage.getSalesRatesByClient(clientId as string);
      }
      
      res.json(salesRates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales rates" });
    }
  });

  app.post("/api/sales-rates", async (req, res) => {
    try {
      const salesRateData = insertSalesRateSchema.parse(req.body);
      const salesRate = await storage.createSalesRate(salesRateData);
      res.status(201).json(salesRate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sales rate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sales rate" });
    }
  });

  // Tally API Routes
  // Tally Companies
  app.get("/api/tally/companies", async (req, res) => {
    try {
      const companies = await storage.getAllTallyCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Tally companies" });
    }
  });

  app.get("/api/tally/companies/:id", async (req, res) => {
    try {
      const company = await storage.getTallyCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Tally company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Tally company" });
    }
  });

  app.post("/api/tally/companies", async (req, res) => {
    try {
      const companyData = insertTallyCompanySchema.parse(req.body);
      const company = await storage.createTallyCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Tally company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create Tally company" });
    }
  });

  app.put("/api/tally/companies/:id", async (req, res) => {
    try {
      const companyData = insertTallyCompanySchema.partial().parse(req.body);
      const company = await storage.updateTallyCompany(req.params.id, companyData);
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Tally company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update Tally company" });
    }
  });

  // Tally Ledgers
  app.get("/api/tally/companies/:companyId/ledgers", async (req, res) => {
    try {
      const ledgers = await storage.getTallyLedgersByCompany(req.params.companyId);
      res.json(ledgers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Tally ledgers" });
    }
  });

  app.post("/api/tally/companies/:companyId/ledgers", async (req, res) => {
    try {
      const ledgerData = insertTallyLedgerSchema.parse({
        ...req.body,
        companyId: req.params.companyId
      });
      const ledger = await storage.createTallyLedger(ledgerData);
      res.status(201).json(ledger);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Tally ledger data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create Tally ledger" });
    }
  });

  // Tally Stock Items
  app.get("/api/tally/companies/:companyId/stock-items", async (req, res) => {
    try {
      const stockItems = await storage.getTallyStockItemsByCompany(req.params.companyId);
      res.json(stockItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Tally stock items" });
    }
  });

  app.post("/api/tally/companies/:companyId/stock-items", async (req, res) => {
    try {
      const stockItemData = insertTallyStockItemSchema.parse({
        ...req.body,
        companyId: req.params.companyId
      });
      const stockItem = await storage.createTallyStockItem(stockItemData);
      res.status(201).json(stockItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Tally stock item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create Tally stock item" });
    }
  });

  // Tally Vouchers
  app.get("/api/tally/companies/:companyId/vouchers", async (req, res) => {
    try {
      const vouchers = await storage.getTallyVouchersByCompany(req.params.companyId);
      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Tally vouchers" });
    }
  });

  app.post("/api/tally/companies/:companyId/vouchers", async (req, res) => {
    try {
      const voucherData = insertTallyVoucherSchema.parse({
        ...req.body,
        companyId: req.params.companyId
      });
      const voucher = await storage.createTallyVoucher(voucherData);
      res.status(201).json(voucher);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid Tally voucher data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create Tally voucher" });
    }
  });

  // Tally Sync API (for desktop app to send data)
  app.post("/api/tally/sync/companies", async (req, res) => {
    try {
      const { apiKey, companies } = req.body;
      
      if (!apiKey) {
        return res.status(401).json({ message: "API key required" });
      }

      // Validate API key exists
      const existingCompany = await storage.getTallyCompanyByApiKey(apiKey);
      if (!existingCompany) {
        return res.status(401).json({ message: "Invalid API key" });
      }

      const results = [];
      for (const companyData of companies || []) {
        try {
          const validatedData = insertTallyCompanySchema.parse(companyData);
          const company = await storage.createTallyCompany(validatedData);
          results.push({ success: true, company });
        } catch (error) {
          results.push({ success: false, error: error.message, data: companyData });
        }
      }

      // Log sync operation
      await storage.createTallySyncLog({
        companyId: existingCompany.id,
        entity: 'companies',
        syncStatus: 'SUCCESS',
        recordsReceived: companies?.length || 0,
        recordsAccepted: results.filter(r => r.success).length,
        recordsFailed: results.filter(r => !r.success).length,
        errorDetails: results.filter(r => !r.success).map(r => r.error).join('; ') || null
      });

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync companies", error: error.message });
    }
  });

  app.post("/api/tally/sync/ledgers", async (req, res) => {
    try {
      const { apiKey, ledgers } = req.body;
      
      if (!apiKey) {
        return res.status(401).json({ message: "API key required" });
      }

      const company = await storage.getTallyCompanyByApiKey(apiKey);
      if (!company) {
        return res.status(401).json({ message: "Invalid API key" });
      }

      const results = [];
      for (const ledgerData of ledgers || []) {
        try {
          const validatedData = insertTallyLedgerSchema.parse({
            ...ledgerData,
            companyId: company.id
          });
          
          // Use upsert to handle duplicates
          const ledger = await storage.upsertTallyLedger({
            ...validatedData,
            externalId: ledgerData.externalId || ledgerData.id || ''
          });
          results.push({ success: true, ledger });
        } catch (error) {
          results.push({ success: false, error: error.message, data: ledgerData });
        }
      }

      await storage.createTallySyncLog({
        companyId: company.id,
        entity: 'ledgers',
        syncStatus: 'SUCCESS',
        recordsReceived: ledgers?.length || 0,
        recordsAccepted: results.filter(r => r.success).length,
        recordsFailed: results.filter(r => !r.success).length,
        errorDetails: results.filter(r => !r.success).map(r => r.error).join('; ') || null
      });

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync ledgers", error: error.message });
    }
  });

  app.post("/api/tally/sync/stock-items", async (req, res) => {
    try {
      const { apiKey, stockItems } = req.body;
      
      if (!apiKey) {
        return res.status(401).json({ message: "API key required" });
      }

      const company = await storage.getTallyCompanyByApiKey(apiKey);
      if (!company) {
        return res.status(401).json({ message: "Invalid API key" });
      }

      const results = [];
      for (const stockItemData of stockItems || []) {
        try {
          const validatedData = insertTallyStockItemSchema.parse({
            ...stockItemData,
            companyId: company.id
          });
          
          const stockItem = await storage.upsertTallyStockItem({
            ...validatedData,
            externalId: stockItemData.externalId || stockItemData.id || ''
          });
          results.push({ success: true, stockItem });
        } catch (error) {
          results.push({ success: false, error: error.message, data: stockItemData });
        }
      }

      await storage.createTallySyncLog({
        companyId: company.id,
        entity: 'stock_items',
        syncStatus: 'SUCCESS',
        recordsReceived: stockItems?.length || 0,
        recordsAccepted: results.filter(r => r.success).length,
        recordsFailed: results.filter(r => !r.success).length,
        errorDetails: results.filter(r => !r.success).map(r => r.error).join('; ') || null
      });

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync stock items", error: error.message });
    }
  });

  app.post("/api/tally/sync/vouchers", async (req, res) => {
    try {
      const { apiKey, vouchers } = req.body;
      
      if (!apiKey) {
        return res.status(401).json({ message: "API key required" });
      }

      const company = await storage.getTallyCompanyByApiKey(apiKey);
      if (!company) {
        return res.status(401).json({ message: "Invalid API key" });
      }

      const results = [];
      for (const voucherData of vouchers || []) {
        try {
          const validatedData = insertTallyVoucherSchema.parse({
            ...voucherData,
            companyId: company.id
          });
          
          const voucher = await storage.upsertTallyVoucher(validatedData);
          results.push({ success: true, voucher });
        } catch (error) {
          results.push({ success: false, error: error.message, data: voucherData });
        }
      }

      await storage.createTallySyncLog({
        companyId: company.id,
        entity: 'vouchers',
        syncStatus: 'SUCCESS',
        recordsReceived: vouchers?.length || 0,
        recordsAccepted: results.filter(r => r.success).length,
        recordsFailed: results.filter(r => !r.success).length,
        errorDetails: results.filter(r => !r.success).map(r => r.error).join('; ') || null
      });

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync vouchers", error: error.message });
    }
  });

  // Tally Sync Status
  app.get("/api/tally/sync/status", async (req, res) => {
    try {
      const { companyId } = req.query;
      const status = await storage.getTallyLastSyncStatus(companyId as string);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sync status" });
    }
  });

  app.get("/api/tally/sync/logs/:companyId", async (req, res) => {
    try {
      const logs = await storage.getTallySyncLogsByCompany(req.params.companyId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sync logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
