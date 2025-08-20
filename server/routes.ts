import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AuthService, requireAuth, requireAdmin, requireManager } from "./auth";
import { loginSchema, registerSchema } from "@shared/schema";
import { 
  insertUserSchema, insertClientSchema, insertOrderSchema, insertPaymentSchema,
  insertTaskSchema, insertEwayBillSchema, insertClientTrackingSchema, insertSalesRateSchema,
  insertCreditAgreementSchema, insertPurchaseOrderSchema, insertSalesSchema,
  insertShippingAddressSchema, insertFollowUpSchema,
  insertNumberSeriesSchema, insertTransporterSchema, insertProductSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes (Public)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const result = await AuthService.loginUser(username, password);
      if (!result) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const { user, sessionToken } = result;
      
      // Set session cookie
      res.cookie('sessionToken', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax'
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, sessionToken });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const { confirmPassword, ...userDataWithoutConfirm } = userData;
      
      const user = await AuthService.createUser(userDataWithoutConfirm);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: "Username or email already exists" });
      }
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '') ||
                          req.cookies?.sessionToken;
      
      if (sessionToken) {
        await AuthService.logoutUser(sessionToken);
      }
      
      res.clearCookie('sessionToken');
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  // User Management Routes (Protected)
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      // Only admins and managers can see all users
      if (!['ADMIN', 'SALES_MANAGER'].includes(currentUser.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const allUsers = await AuthService.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const { confirmPassword, ...userDataWithoutConfirm } = userData;
      
      const user = await AuthService.createUser(userDataWithoutConfirm);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.code === '23505') {
        return res.status(400).json({ error: "Username or email already exists" });
      }
      res.status(400).json({ error: error.message || "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      
      // Users can only update their own profile unless they're admin
      if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const updates = req.body;
      // Don't allow role changes unless admin
      if (updates.role && currentUser.role !== 'ADMIN') {
        delete updates.role;
      }

      const updatedUser = await AuthService.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(400).json({ error: error.message || "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await AuthService.deactivateUser(id);
      res.json({ message: "User deactivated successfully" });
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ error: "Failed to deactivate user" });
    }
  });

  // Dashboard API
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Legacy Users API (keeping for compatibility)
  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      
      // Users can only view their own profile unless they're admin/manager
      if (currentUser.id !== id && !['ADMIN', 'SALES_MANAGER'].includes(currentUser.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const user = await AuthService.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Clients API
  app.get("/api/clients", async (req, res) => {
    try {
      const { category, search, dateFrom, dateTo } = req.query;
      const clients = await storage.getFilteredClients({
        category: category as string,
        search: search as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Get client category statistics (must come before :id route)
  app.get("/api/clients/stats", async (req, res) => {
    try {
      const stats = await storage.getClientCategoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client stats" });
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
      // Clean up empty strings and convert to appropriate types
      const cleanedData = { ...req.body };
      
      // Convert ALL empty strings to null for any field
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '' || (Array.isArray(cleanedData[key]) && cleanedData[key].length === 0)) {
          cleanedData[key] = null;
        }
      });
      

      const clientData = insertClientSchema.parse(cleanedData);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error: any) {
      console.error("Client creation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client", error: error.message });
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

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Shipping Addresses routes
  app.get('/api/shipping-addresses/:clientId', async (req, res) => {
    try {
      const { clientId } = req.params;
      const addresses = await storage.getShippingAddressesByClient(clientId);
      res.json(addresses);
    } catch (error) {
      console.error("Get shipping addresses error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/shipping-addresses', async (req, res) => {
    try {
      const result = insertShippingAddressSchema.parse(req.body);
      const address = await storage.createShippingAddress(result);
      res.status(201).json(address);
    } catch (error) {
      console.error("Create shipping address error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/shipping-addresses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertShippingAddressSchema.parse(req.body);
      const address = await storage.updateShippingAddress(id, result);
      res.json(address);
    } catch (error) {
      console.error("Update shipping address error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/shipping-addresses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteShippingAddress(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete shipping address error:", error);
      res.status(500).json({ error: error.message });
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
      console.error("Task fetch error:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      
      // Convert string dates to Date objects
      const taskData = {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : null,
        nextDueDate: validatedData.nextDueDate ? new Date(validatedData.nextDueDate) : null
      } as any;
      
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
      const validatedData = insertTaskSchema.partial().parse(req.body);
      
      // Convert string dates to Date objects
      const taskData = {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : undefined,
        nextDueDate: validatedData.nextDueDate ? new Date(validatedData.nextDueDate) : undefined
      } as any;
      
      // Remove undefined values
      Object.keys(taskData).forEach(key => (taskData as any)[key] === undefined && delete (taskData as any)[key]);
      
      const task = await storage.updateTask(req.params.id, taskData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Follow-ups API
  app.get("/api/follow-ups", async (req, res) => {
    try {
      const { taskId, userId } = req.query;
      let followUps;
      
      if (taskId) {
        followUps = await storage.getFollowUpsByTask(taskId as string);
      } else if (userId) {
        followUps = await storage.getFollowUpsByUser(userId as string);
      } else {
        // Return all follow-ups for admin view
        followUps = await storage.getFollowUpsByUser(""); // Will return empty array
      }
      
      res.json(followUps);
    } catch (error) {
      console.error("Follow-up fetch error:", error);
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  app.post("/api/follow-ups", async (req, res) => {
    try {
      const validatedData = insertFollowUpSchema.parse(req.body);
      
      const followUpData = {
        ...validatedData,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : new Date(),
        nextFollowUpDate: validatedData.nextFollowUpDate ? new Date(validatedData.nextFollowUpDate) : null,
        completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : null,
      } as any;
      
      const followUp = await storage.createFollowUp(followUpData);
      res.status(201).json(followUp);
    } catch (error) {
      console.error("Follow-up creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid follow-up data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create follow-up" });
    }
  });

  app.put("/api/follow-ups/:id", async (req, res) => {
    try {
      const validatedData = insertFollowUpSchema.partial().parse(req.body);
      
      const followUpData = {
        ...validatedData,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined,
        nextFollowUpDate: validatedData.nextFollowUpDate ? new Date(validatedData.nextFollowUpDate) : undefined,
        completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : undefined,
      } as any;
      
      // Remove undefined values
      Object.keys(followUpData).forEach(key => (followUpData as any)[key] === undefined && delete (followUpData as any)[key]);
      
      const followUp = await storage.updateFollowUp(req.params.id, followUpData);
      res.json(followUp);
    } catch (error) {
      console.error("Follow-up update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid follow-up data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update follow-up" });
    }
  });

  app.delete("/api/follow-ups/:id", async (req, res) => {
    try {
      await storage.deleteFollowUp(req.params.id);
      res.json({ message: "Follow-up deleted successfully" });
    } catch (error) {
      console.error("Follow-up deletion error:", error);
      res.status(500).json({ message: "Failed to delete follow-up" });
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

  // Sales API
  app.get("/api/sales", requireAuth, async (req, res) => {
    try {
      const { salespersonId, status } = req.query;
      let sales;
      
      if (salespersonId) {
        sales = await storage.getSalesBySalesperson(salespersonId as string);
      } else if (status) {
        sales = await storage.getSalesByStatus(status as string);
      } else {
        sales = await storage.getAllSales();
      }
      
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", requireAuth, async (req, res) => {
    try {
      const sales = await storage.getSales(req.params.id);
      if (!sales) {
        return res.status(404).json({ message: "Sales record not found" });
      }
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales record" });
    }
  });

  app.post("/api/sales", requireAuth, async (req, res) => {
    try {
      console.log("Received sales data:", req.body);
      const salesData = insertSalesSchema.parse(req.body);
      console.log("Validated sales data:", salesData);
      
      // Calculate net weight automatically (gross weight - tare weight)
      const grossWeight = parseFloat(salesData.grossWeight as any);
      const tareWeight = parseFloat(salesData.tareWeight as any);
      const netWeight = grossWeight - tareWeight;
      
      const finalSalesData = {
        ...salesData,
        netWeight: netWeight.toString()
      };
      
      console.log("Final sales data to save:", finalSalesData);
      const sales = await storage.createSales(finalSalesData);
      res.status(201).json(sales);
    } catch (error) {
      console.error("Sales creation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid sales data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sales record", error: error.message });
    }
  });

  app.put("/api/sales/:id", requireAuth, async (req, res) => {
    try {
      const salesData = insertSalesSchema.partial().parse(req.body);
      
      // Recalculate net weight if gross weight or tare weight is being updated
      if (salesData.grossWeight || salesData.tareWeight) {
        const existingSales = await storage.getSales(req.params.id);
        if (!existingSales) {
          return res.status(404).json({ message: "Sales record not found" });
        }
        
        const grossWeight = parseFloat(salesData.grossWeight as any || existingSales.grossWeight);
        const tareWeight = parseFloat(salesData.tareWeight as any || existingSales.tareWeight);
        const netWeight = grossWeight - tareWeight;
        
        salesData.netWeight = netWeight.toString();
      }
      
      const sales = await storage.updateSales(req.params.id, salesData);
      res.json(sales);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sales data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sales record" });
    }
  });

  app.patch("/api/sales/:id/sign-challan", requireAuth, async (req, res) => {
    try {
      const sales = await storage.signDeliveryChallan(req.params.id);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to sign delivery challan" });
    }
  });

  app.delete("/api/sales/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSales(req.params.id);
      res.json({ message: "Sales record deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sales record" });
    }
  });

  // Number Series API (Admin only)
  app.get("/api/number-series", requireAdmin, async (req, res) => {
    try {
      const series = await storage.getAllNumberSeries();
      res.json(series);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch number series" });
    }
  });

  app.post("/api/number-series", requireAdmin, async (req, res) => {
    try {
      const seriesData = insertNumberSeriesSchema.parse(req.body);
      const series = await storage.createNumberSeries(seriesData);
      res.status(201).json(series);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid number series data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create number series" });
    }
  });

  app.put("/api/number-series/:id", requireAdmin, async (req, res) => {
    try {
      const seriesData = insertNumberSeriesSchema.partial().parse(req.body);
      const series = await storage.updateNumberSeries(req.params.id, seriesData);
      res.json(series);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid number series data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update number series" });
    }
  });

  app.post("/api/number-series/next/:seriesType", requireAuth, async (req, res) => {
    try {
      const nextNumber = await storage.getNextNumber(req.params.seriesType);
      res.json({ nextNumber });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Transporters API
  app.get("/api/transporters", requireAuth, async (req, res) => {
    try {
      const transporters = await storage.getAllTransporters();
      res.json(transporters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transporters" });
    }
  });

  app.post("/api/transporters", requireAuth, async (req, res) => {
    try {
      const transporterData = insertTransporterSchema.parse(req.body);
      const transporter = await storage.createTransporter(transporterData);
      res.status(201).json(transporter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transporter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transporter" });
    }
  });

  app.put("/api/transporters/:id", requireAuth, async (req, res) => {
    try {
      const transporterData = insertTransporterSchema.partial().parse(req.body);
      const transporter = await storage.updateTransporter(req.params.id, transporterData);
      res.json(transporter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transporter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transporter" });
    }
  });

  // Products API
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
