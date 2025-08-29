import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AuthService, requireAuth, requireAdmin, requireManager } from "./auth";
import { loginSchema, registerSchema } from "@shared/schema";
import { 
  insertUserSchema, insertClientSchema, insertOrderSchema, insertPaymentSchema,
  insertTaskSchema, insertEwayBillSchema, insertClientTrackingSchema, insertSalesRateSchema,
  insertCreditAgreementSchema, insertPurchaseOrderSchema, insertSalesSchema,
  insertShippingAddressSchema, insertFollowUpSchema, insertClientAssignmentSchema,
  insertNumberSeriesSchema, insertTransporterSchema, insertProductSchema,
  insertCompanyProfileSchema, insertBranchSchema, insertProductMasterSchema,
  insertSupplierSchema, insertBankSchema, insertVehicleSchema,
  insertLeadSchema, insertOpportunitySchema, insertQuotationSchema, insertQuotationItemSchema,
  insertSalesOrderSchema, insertSalesOrderItemSchema, insertDeliveryPlanSchema,
  insertDispatchSchema, insertDeliveryChallanSchema
} from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

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
      
      // Allow admins, managers, and sales executives to see users (for client assignment)
      if (!['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'].includes(currentUser.role)) {
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

  // Dashboard API - Role-based filtering
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      let stats;
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SALES_MANAGER') {
        // Admin and Sales Manager can see all stats
        stats = await storage.getDashboardStats();
      } else {
        // Sales Executive and others can only see stats for their assigned clients
        stats = await storage.getDashboardStats(currentUser.id);
      }
      
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

  // Clients API - Role-based access control
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const { category, search, dateFrom, dateTo } = req.query;
      const currentUser = (req as any).user;
      
      // Get filtered clients based on user role
      let clients;
      if (currentUser.role === 'ADMIN') {
        // Admin can see all clients
        clients = await storage.getFilteredClients({
          category: category as string,
          search: search as string,
          dateFrom: dateFrom as string,
          dateTo: dateTo as string,
        });
      } else if (currentUser.role === 'SALES_MANAGER') {
        // Sales Manager can see all clients
        clients = await storage.getFilteredClients({
          category: category as string,
          search: search as string,
          dateFrom: dateFrom as string,
          dateTo: dateTo as string,
        });
      } else if (currentUser.role === 'SALES_EXECUTIVE') {
        // Sales Executive can only see their assigned clients
        clients = await storage.getFilteredClients({
          category: category as string,
          search: search as string,
          dateFrom: dateFrom as string,
          dateTo: dateTo as string,
          assignedToUserId: currentUser.id,
        });
      } else {
        // Other roles can only see their assigned clients
        clients = await storage.getFilteredClients({
          category: category as string,
          search: search as string,
          dateFrom: dateFrom as string,
          dateTo: dateTo as string,
          assignedToUserId: currentUser.id,
        });
      }
      
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Get client category statistics (must come before :id route) - Role-based
  app.get("/api/clients/stats", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      let stats;
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SALES_MANAGER') {
        // Admin and Sales Manager can see all client stats
        stats = await storage.getClientCategoryStats();
      } else {
        // Sales Executive and others can only see stats for their assigned clients
        stats = await storage.getClientCategoryStats(currentUser.id);
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client stats" });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const client = await storage.getClient(req.params.id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if user can access this client
      if (currentUser.role === 'SALES_EXECUTIVE' && client.primarySalesPersonId !== currentUser.id) {
        return res.status(403).json({ error: "You can only access your assigned clients" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      // Check if user can create clients
      if (!['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'].includes(currentUser.role)) {
        return res.status(403).json({ error: "Insufficient permissions to create clients" });
      }
      
      // Clean up empty strings and convert to appropriate types
      const cleanedData = { ...req.body };
      
      // Convert ALL empty strings to null for any field
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '' || (Array.isArray(cleanedData[key]) && cleanedData[key].length === 0)) {
          cleanedData[key] = null;
        }
      });
      
      // Auto-assign primary sales person to the user creating the client (if not already assigned)
      if (!cleanedData.primarySalesPersonId) {
        cleanedData.primarySalesPersonId = currentUser.id;
      }

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

  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      // Check if user can update clients
      if (!['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'].includes(currentUser.role)) {
        return res.status(403).json({ error: "Insufficient permissions to update clients" });
      }
      
      // For Sales Executive, check if they can access this client
      if (currentUser.role === 'SALES_EXECUTIVE') {
        const existingClient = await storage.getClient(req.params.id);
        if (!existingClient) {
          return res.status(404).json({ message: "Client not found" });
        }
        if (existingClient.primarySalesPersonId !== currentUser.id) {
          return res.status(403).json({ error: "You can only update your assigned clients" });
        }
      }
      
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

  // Client Assignments API
  app.get("/api/client-assignments", requireAuth, async (req, res) => {
    try {
      const assignments = await storage.getAllClientAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Get all client assignments error:", error);
      res.status(500).json({ message: "Failed to fetch client assignments" });
    }
  });

  app.get("/api/client-assignments/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const assignment = await storage.getClientAssignment(id);
      if (!assignment) {
        return res.status(404).json({ message: "Client assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Get client assignment error:", error);
      res.status(500).json({ message: "Failed to fetch client assignment" });
    }
  });

  app.get("/api/client-assignments/client/:clientId", requireAuth, async (req, res) => {
    try {
      const { clientId } = req.params;
      const assignments = await storage.getClientAssignmentsByClient(clientId);
      res.json(assignments);
    } catch (error) {
      console.error("Get client assignments by client error:", error);
      res.status(500).json({ message: "Failed to fetch client assignments" });
    }
  });

  app.get("/api/client-assignments/sales-person/:salesPersonId", requireAuth, async (req, res) => {
    try {
      const { salesPersonId } = req.params;
      const assignments = await storage.getClientAssignmentsBySalesPerson(salesPersonId);
      res.json(assignments);
    } catch (error) {
      console.error("Get client assignments by sales person error:", error);
      res.status(500).json({ message: "Failed to fetch client assignments" });
    }
  });

  app.get("/api/my-clients", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const myClients = await storage.getMyClients(currentUser.id);
      res.json(myClients);
    } catch (error) {
      console.error("Get my clients error:", error);
      res.status(500).json({ message: "Failed to fetch my clients" });
    }
  });

  app.post("/api/client-assignments", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const assignmentData = insertClientAssignmentSchema.parse({
        ...req.body,
        assignedBy: currentUser.id
      });
      const assignment = await storage.createClientAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error: any) {
      console.error("Create client assignment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client assignment" });
    }
  });

  app.put("/api/client-assignments/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const assignmentData = insertClientAssignmentSchema.partial().parse(req.body);
      const assignment = await storage.updateClientAssignment(id, assignmentData);
      res.json(assignment);
    } catch (error: any) {
      console.error("Update client assignment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client assignment" });
    }
  });

  app.delete("/api/client-assignments/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClientAssignment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete client assignment error:", error);
      res.status(500).json({ message: "Failed to delete client assignment" });
    }
  });

  // Assign client to primary sales person
  app.post("/api/clients/:clientId/assign-primary", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const { clientId } = req.params;
      const { salesPersonId } = req.body;

      if (!salesPersonId) {
        return res.status(400).json({ message: "Sales person ID is required" });
      }

      const assignment = await storage.assignClientToPrimarySalesPerson(
        clientId, 
        salesPersonId, 
        currentUser.id
      );
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Assign primary sales person error:", error);
      res.status(500).json({ message: "Failed to assign primary sales person" });
    }
  });

  // Bulk assign clients
  app.post("/api/client-assignments/bulk", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const { clientIds, salesPersonId, assignmentType = 'PRIMARY' } = req.body;

      if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
        return res.status(400).json({ message: "Client IDs array is required" });
      }

      if (!salesPersonId) {
        return res.status(400).json({ message: "Sales person ID is required" });
      }

      const assignments = await storage.bulkAssignClients(
        clientIds, 
        salesPersonId, 
        currentUser.id, 
        assignmentType
      );
      res.status(201).json(assignments);
    } catch (error) {
      console.error("Bulk assign clients error:", error);
      res.status(500).json({ message: "Failed to bulk assign clients" });
    }
  });

  // Transfer clients from one sales person to another
  app.post("/api/client-assignments/transfer", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const { fromSalesPersonId, toSalesPersonId } = req.body;

      if (!fromSalesPersonId || !toSalesPersonId) {
        return res.status(400).json({ message: "Both from and to sales person IDs are required" });
      }

      const assignments = await storage.transferClients(
        fromSalesPersonId, 
        toSalesPersonId, 
        currentUser.id
      );
      res.status(201).json(assignments);
    } catch (error) {
      console.error("Transfer clients error:", error);
      res.status(500).json({ message: "Failed to transfer clients" });
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
        followUps = await storage.getAllFollowUps();
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

  // Object Storage Routes for Client Documents

  // Get upload URL for client documents  
  app.post("/api/clients/documents/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Get upload URL error:", error);
      res.status(500).json({ message: "Failed to get upload URL", error: error.message });
    }
  });

  // Set ACL policy for uploaded client documents
  app.put("/api/clients/:clientId/documents/:documentType", requireAuth, async (req, res) => {
    try {
      if (!req.body.documentURL) {
        return res.status(400).json({ error: "documentURL is required" });
      }

      const { clientId, documentType } = req.params;
      const currentUser = (req as any).user;
      
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.documentURL,
        {
          owner: currentUser.id,
          visibility: "private",
        }
      );

      // Update client document status in database
      const updateData: any = {};
      switch (documentType) {
        case 'gst-certificate':
          updateData.gstCertificateUploaded = true;
          break;
        case 'pan-copy':
          updateData.panCopyUploaded = true;
          break;
        case 'security-cheque':
          updateData.securityChequeUploaded = true;
          break;
        case 'aadhar-card':
          updateData.aadharCardUploaded = true;
          break;
        case 'agreement':
          updateData.agreementUploaded = true;
          break;
        case 'po-rate-contract':
          updateData.poRateContractUploaded = true;
          break;
        default:
          return res.status(400).json({ error: "Invalid document type" });
      }

      await storage.updateClient(clientId, updateData);

      res.json({ objectPath, message: "Document uploaded successfully" });
    } catch (error: any) {
      console.error("Document upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // Serve client documents (with authentication)
  app.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const objectStorageService = new ObjectStorageService();
      
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: currentUser.id,
        requestedPermission: "read" as any,
      });
      
      if (!canAccess) {
        return res.sendStatus(401);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error("Error accessing document:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
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

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Products fetch error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Product creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Transporters API
  app.get("/api/transporters", async (req, res) => {
    try {
      const transporters = await storage.getAllTransporters();
      res.json(transporters);
    } catch (error) {
      console.error("Transporters fetch error:", error);
      res.status(500).json({ message: "Failed to fetch transporters" });
    }
  });

  app.post("/api/transporters", async (req, res) => {
    try {
      const validatedData = insertTransporterSchema.parse(req.body);
      const transporter = await storage.createTransporter(validatedData);
      res.status(201).json(transporter);
    } catch (error) {
      console.error("Transporter creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transporter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transporter" });
    }
  });

  // ==================== MASTER DATA API ENDPOINTS ====================
  
  // Company Profile API
  app.get("/api/company-profile", async (req, res) => {
    try {
      const companyProfile = await storage.getCompanyProfile();
      res.json(companyProfile);
    } catch (error) {
      console.error("Company profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch company profile" });
    }
  });

  app.post("/api/company-profile", async (req, res) => {
    try {
      console.log("Received create request with body:", req.body);
      const validatedData = insertCompanyProfileSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const companyProfile = await storage.createCompanyProfile(validatedData);
      res.status(201).json(companyProfile);
    } catch (error) {
      console.error("Company profile creation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid company profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company profile", error: error.message });
    }
  });

  app.put("/api/company-profile/:id", async (req, res) => {
    try {
      console.log("Received update request for ID:", req.params.id);
      console.log("Request body:", req.body);
      const validatedData = insertCompanyProfileSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const companyProfile = await storage.updateCompanyProfile(req.params.id, validatedData);
      res.json(companyProfile);
    } catch (error) {
      console.error("Company profile update error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid company profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company profile", error: error.message });
    }
  });

  app.delete("/api/company-profile/:id", async (req, res) => {
    try {
      await storage.deleteCompanyProfile(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Company profile deletion error:", error);
      res.status(500).json({ message: "Failed to delete company profile" });
    }
  });

  // Branches API
  app.get("/api/branches", requireAuth, async (req, res) => {
    try {
      const branches = await storage.getAllBranches();
      res.json(branches);
    } catch (error) {
      console.error("Branches fetch error:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  app.post("/api/branches", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(validatedData);
      res.status(201).json(branch);
    } catch (error) {
      console.error("Branch creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid branch data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create branch" });
    }
  });

  app.put("/api/branches/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBranchSchema.parse(req.body);
      const branch = await storage.updateBranch(req.params.id, validatedData);
      res.json(branch);
    } catch (error) {
      console.error("Branch update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid branch data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update branch" });
    }
  });

  app.delete("/api/branches/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteBranch(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Branch deletion error:", error);
      res.status(500).json({ message: "Failed to delete branch" });
    }
  });

  // Product Master API
  app.get("/api/product-master", async (req, res) => {
    try {
      const products = await storage.getAllProductMaster();
      res.json(products);
    } catch (error) {
      console.error("Product master fetch error:", error);
      res.status(500).json({ message: "Failed to fetch product master" });
    }
  });

  app.post("/api/product-master", async (req, res) => {
    try {
      console.log("Received create request with body:", req.body);
      
      // Clean the data - remove empty strings and convert to proper types
      const cleanedData = {
        ...req.body,
        densityFactor: req.body.densityFactor ? String(req.body.densityFactor) : null,
        drumsPerMT: req.body.drumsPerMT ? Number(req.body.drumsPerMT) : null,
        taxRate: req.body.taxRate ? String(req.body.taxRate) : null,
        shelfLifeDays: req.body.shelfLifeDays ? Number(req.body.shelfLifeDays) : null,
        minOrderQuantity: req.body.minOrderQuantity ? String(req.body.minOrderQuantity) : null,
        maxOrderQuantity: req.body.maxOrderQuantity ? String(req.body.maxOrderQuantity) : null,
        reorderLevel: req.body.reorderLevel ? String(req.body.reorderLevel) : null,
      };
      
      const validatedData = insertProductMasterSchema.parse(cleanedData);
      console.log("Validated data:", validatedData);
      const product = await storage.createProductMaster(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Product master creation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid product master data", errors: error.errors });
      }
      // Handle duplicate key constraint
      if (error.code === '23505') {
        return res.status(400).json({ message: "Product code already exists. Please use a different product code." });
      }
      res.status(500).json({ message: "Failed to create product master", error: error.message });
    }
  });

  app.put("/api/product-master/:id", async (req, res) => {
    try {
      console.log("Received update request for ID:", req.params.id);
      console.log("Request body:", req.body);
      
      // Clean the data - remove empty strings and convert to proper types
      const cleanedData = {
        ...req.body,
        densityFactor: req.body.densityFactor ? String(req.body.densityFactor) : null,
        drumsPerMT: req.body.drumsPerMT ? Number(req.body.drumsPerMT) : null,
        taxRate: req.body.taxRate ? String(req.body.taxRate) : null,
        shelfLifeDays: req.body.shelfLifeDays ? Number(req.body.shelfLifeDays) : null,
        minOrderQuantity: req.body.minOrderQuantity ? String(req.body.minOrderQuantity) : null,
        maxOrderQuantity: req.body.maxOrderQuantity ? String(req.body.maxOrderQuantity) : null,
        reorderLevel: req.body.reorderLevel ? String(req.body.reorderLevel) : null,
      };
      
      const validatedData = insertProductMasterSchema.parse(cleanedData);
      console.log("Validated data:", validatedData);
      const product = await storage.updateProductMaster(req.params.id, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Product master update error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid product master data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product master", error: error.message });
    }
  });

  app.delete("/api/product-master/:id", async (req, res) => {
    try {
      await storage.deleteProductMaster(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Product master deletion error:", error);
      res.status(500).json({ message: "Failed to delete product master" });
    }
  });

  // Suppliers API
  app.get("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Suppliers fetch error:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Supplier creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, validatedData);
      res.json(supplier);
    } catch (error) {
      console.error("Supplier update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Supplier deletion error:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Banks API
  app.get("/api/banks", requireAuth, async (req, res) => {
    try {
      const banks = await storage.getAllBanks();
      res.json(banks);
    } catch (error) {
      console.error("Banks fetch error:", error);
      res.status(500).json({ message: "Failed to fetch banks" });
    }
  });

  app.post("/api/banks", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBankSchema.parse(req.body);
      const bank = await storage.createBank(validatedData);
      res.status(201).json(bank);
    } catch (error) {
      console.error("Bank creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bank data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bank" });
    }
  });

  app.put("/api/banks/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBankSchema.parse(req.body);
      const bank = await storage.updateBank(req.params.id, validatedData);
      res.json(bank);
    } catch (error) {
      console.error("Bank update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bank data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bank" });
    }
  });

  app.delete("/api/banks/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteBank(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Bank deletion error:", error);
      res.status(500).json({ message: "Failed to delete bank" });
    }
  });

  // Vehicles API
  app.get("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Vehicles fetch error:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Vehicle creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  app.put("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, validatedData);
      res.json(vehicle);
    } catch (error) {
      console.error("Vehicle update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Vehicle deletion error:", error);
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // ==================== SALES OPERATIONS API ====================
  
  // Leads API - Role-based access control
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const currentUser = (req as any).user;
      
      let leads;
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SALES_MANAGER') {
        // Admin and Sales Manager can see all leads
        if (status) {
          leads = await storage.getLeadsByStatus(status as string);
        } else {
          leads = await storage.getAllLeads();
        }
      } else {
        // Sales Executive and others can only see their assigned leads
        if (status) {
          leads = await storage.getLeadsByStatusAndUser(status as string, currentUser.id);
        } else {
          leads = await storage.getLeadsByUser(currentUser.id);
        }
      }
      
      res.json(leads);
    } catch (error) {
      console.error("Leads fetch error:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const lead = await storage.getLead(req.params.id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Check if user can access this lead
      if (currentUser.role === 'SALES_EXECUTIVE' && lead.assignedToUserId !== currentUser.id) {
        return res.status(403).json({ error: "You can only access your assigned leads" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Lead fetch error:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      // Check if user can create leads
      if (!['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'].includes(currentUser.role)) {
        return res.status(403).json({ error: "Insufficient permissions to create leads" });
      }
      
      const leadData = { ...req.body };
      
      // Auto-assign lead to current user if not already assigned
      if (!leadData.assignedToUserId) {
        leadData.assignedToUserId = currentUser.id;
      }
      
      // Generate lead number
      const leadNumber = await storage.generateNextLeadNumber();
      leadData.leadNumber = leadNumber;
      
      const validatedData = insertLeadSchema.parse(leadData);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Lead creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      // Check if user can update leads
      if (!['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE'].includes(currentUser.role)) {
        return res.status(403).json({ error: "Insufficient permissions to update leads" });
      }
      
      // For Sales Executive, check if they can access this lead
      if (currentUser.role === 'SALES_EXECUTIVE') {
        const existingLead = await storage.getLead(req.params.id);
        if (!existingLead) {
          return res.status(404).json({ message: "Lead not found" });
        }
        if (existingLead.assignedToUserId !== currentUser.id) {
          return res.status(403).json({ error: "You can only update your assigned leads" });
        }
      }
      
      const validatedData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, validatedData);
      res.json(lead);
    } catch (error) {
      console.error("Lead update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user;
      
      // Check if user can delete leads
      if (!['ADMIN', 'SALES_MANAGER'].includes(currentUser.role)) {
        return res.status(403).json({ error: "Insufficient permissions to delete leads" });
      }
      
      await storage.deleteLead(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Lead deletion error:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Opportunities API
  app.get("/api/opportunities", async (req, res) => {
    try {
      const { leadId } = req.query;
      let opportunities;
      if (leadId) {
        opportunities = await storage.getOpportunitiesByLead(leadId as string);
      } else {
        opportunities = await storage.getAllOpportunities();
      }
      res.json(opportunities);
    } catch (error) {
      console.error("Opportunities fetch error:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const validatedData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(validatedData);
      res.status(201).json(opportunity);
    } catch (error) {
      console.error("Opportunity creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid opportunity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });

  app.put("/api/opportunities/:id", async (req, res) => {
    try {
      const validatedData = insertOpportunitySchema.partial().parse(req.body);
      const opportunity = await storage.updateOpportunity(req.params.id, validatedData);
      res.json(opportunity);
    } catch (error) {
      console.error("Opportunity update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid opportunity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update opportunity" });
    }
  });

  // Quotations API
  app.get("/api/quotations", async (req, res) => {
    try {
      const { opportunityId } = req.query;
      let quotations;
      if (opportunityId) {
        quotations = await storage.getQuotationsByOpportunity(opportunityId as string);
      } else {
        quotations = await storage.getAllQuotations();
      }
      res.json(quotations);
    } catch (error) {
      console.error("Quotations fetch error:", error);
      res.status(500).json({ message: "Failed to fetch quotations" });
    }
  });

  app.post("/api/quotations", async (req, res) => {
    try {
      const validatedData = insertQuotationSchema.parse(req.body);
      const quotation = await storage.createQuotation(validatedData);
      res.status(201).json(quotation);
    } catch (error) {
      console.error("Quotation creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quotation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quotation" });
    }
  });

  app.put("/api/quotations/:id", async (req, res) => {
    try {
      const validatedData = insertQuotationSchema.partial().parse(req.body);
      const quotation = await storage.updateQuotation(req.params.id, validatedData);
      res.json(quotation);
    } catch (error) {
      console.error("Quotation update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quotation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update quotation" });
    }
  });

  // Sales Orders API
  app.get("/api/sales-orders", async (req, res) => {
    try {
      const { quotationId } = req.query;
      let salesOrders;
      if (quotationId) {
        salesOrders = await storage.getSalesOrdersByQuotation(quotationId as string);
      } else {
        salesOrders = await storage.getAllSalesOrders();
      }
      res.json(salesOrders);
    } catch (error) {
      console.error("Sales orders fetch error:", error);
      res.status(500).json({ message: "Failed to fetch sales orders" });
    }
  });

  app.post("/api/sales-orders", async (req, res) => {
    try {
      const validatedData = insertSalesOrderSchema.parse(req.body);
      const salesOrder = await storage.createSalesOrder(validatedData);
      res.status(201).json(salesOrder);
    } catch (error) {
      console.error("Sales order creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sales order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sales order" });
    }
  });

  app.put("/api/sales-orders/:id", async (req, res) => {
    try {
      const validatedData = insertSalesOrderSchema.partial().parse(req.body);
      const salesOrder = await storage.updateSalesOrder(req.params.id, validatedData);
      res.json(salesOrder);
    } catch (error) {
      console.error("Sales order update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sales order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sales order" });
    }
  });

  // Delivery Plans API
  app.get("/api/delivery-plans", async (req, res) => {
    try {
      const { salesOrderId } = req.query;
      let deliveryPlans;
      if (salesOrderId) {
        deliveryPlans = await storage.getDeliveryPlansBySalesOrder(salesOrderId as string);
      } else {
        deliveryPlans = await storage.getAllDeliveryPlans();
      }
      res.json(deliveryPlans);
    } catch (error) {
      console.error("Delivery plans fetch error:", error);
      res.status(500).json({ message: "Failed to fetch delivery plans" });
    }
  });

  app.post("/api/delivery-plans", async (req, res) => {
    try {
      const validatedData = insertDeliveryPlanSchema.parse(req.body);
      const deliveryPlan = await storage.createDeliveryPlan(validatedData);
      res.status(201).json(deliveryPlan);
    } catch (error) {
      console.error("Delivery plan creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid delivery plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create delivery plan" });
    }
  });

  app.put("/api/delivery-plans/:id", async (req, res) => {
    try {
      const validatedData = insertDeliveryPlanSchema.partial().parse(req.body);
      const deliveryPlan = await storage.updateDeliveryPlan(req.params.id, validatedData);
      res.json(deliveryPlan);
    } catch (error) {
      console.error("Delivery plan update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid delivery plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update delivery plan" });
    }
  });

  // Dispatches API
  app.get("/api/dispatches", async (req, res) => {
    try {
      const { deliveryPlanId } = req.query;
      let dispatches;
      if (deliveryPlanId) {
        dispatches = await storage.getDispatchesByDeliveryPlan(deliveryPlanId as string);
      } else {
        dispatches = await storage.getAllDispatches();
      }
      res.json(dispatches);
    } catch (error) {
      console.error("Dispatches fetch error:", error);
      res.status(500).json({ message: "Failed to fetch dispatches" });
    }
  });

  app.post("/api/dispatches", async (req, res) => {
    try {
      const validatedData = insertDispatchSchema.parse(req.body);
      const dispatch = await storage.createDispatch(validatedData);
      res.status(201).json(dispatch);
    } catch (error) {
      console.error("Dispatch creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dispatch data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dispatch" });
    }
  });

  app.put("/api/dispatches/:id", async (req, res) => {
    try {
      const validatedData = insertDispatchSchema.partial().parse(req.body);
      const dispatch = await storage.updateDispatch(req.params.id, validatedData);
      res.json(dispatch);
    } catch (error) {
      console.error("Dispatch update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dispatch data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update dispatch" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
