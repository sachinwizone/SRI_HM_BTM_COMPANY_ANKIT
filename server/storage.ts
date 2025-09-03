import { 
  users, clients, orders, payments, tasks, ewayBills, clientTracking, 
  salesRates, creditAgreements, purchaseOrders, sales, numberSeries,
  transporters, products, shippingAddresses, followUps, leadFollowUps, clientAssignments,
  companyProfile, branches, productMaster, suppliers, banks, vehicles,
  leads, opportunities, quotations, quotationItems, salesOrders, salesOrderItems,
  deliveryPlans, dispatches, deliveryChallans,
  type User, type InsertUser, type Client, type InsertClient,
  type Order, type InsertOrder, type Payment, type InsertPayment,
  type Task, type InsertTask, type EwayBill, type InsertEwayBill,
  type ClientTracking, type InsertClientTracking, type SalesRate, type InsertSalesRate,
  type CreditAgreement, type InsertCreditAgreement, type PurchaseOrder, type InsertPurchaseOrder,
  type Sales, type InsertSales, type NumberSeries, type InsertNumberSeries,
  type Transporter, type InsertTransporter, type Product, type InsertProduct,
  type ShippingAddress, type InsertShippingAddress, type FollowUp, type InsertFollowUp,
  type LeadFollowUp, type InsertLeadFollowUp, type ClientAssignment, type InsertClientAssignment,
  type CompanyProfile, type InsertCompanyProfile, type Branch, type InsertBranch,
  type ProductMaster, type InsertProductMaster, type Supplier, type InsertSupplier,
  type Bank, type InsertBank, type Vehicle, type InsertVehicle,
  type Lead, type InsertLead, type Opportunity, type InsertOpportunity,
  type Quotation, type InsertQuotation, type QuotationItem, type InsertQuotationItem,
  type SalesOrder, type InsertSalesOrder, type SalesOrderItem, type InsertSalesOrderItem,
  type DeliveryPlan, type InsertDeliveryPlan, type Dispatch, type InsertDispatch,
  type DeliveryChallan, type InsertDeliveryChallan
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, count, or, ilike } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Clients
  getClient(id: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  getClientsByCategory(category: string): Promise<Client[]>;
  getFilteredClients(filters: { category?: string; search?: string; dateFrom?: string; dateTo?: string; assignedToUserId?: string }): Promise<Client[]>;
  getClientCategoryStats(assignedToUserId?: string): Promise<{ ALFA: number; BETA: number; GAMMA: number; DELTA: number; total: number }>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  // Shipping Addresses
  getShippingAddress(id: string): Promise<ShippingAddress | undefined>;
  getShippingAddressesByClient(clientId: string): Promise<ShippingAddress[]>;
  createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress>;
  updateShippingAddress(id: string, address: Partial<InsertShippingAddress>): Promise<ShippingAddress>;
  deleteShippingAddress(id: string): Promise<void>;

  // Client Assignments
  getClientAssignment(id: string): Promise<ClientAssignment | undefined>;
  getAllClientAssignments(): Promise<ClientAssignment[]>;
  getClientAssignmentsByClient(clientId: string): Promise<ClientAssignment[]>;
  getClientAssignmentsBySalesPerson(salesPersonId: string): Promise<ClientAssignment[]>;
  getActiveClientAssignmentsByClient(clientId: string): Promise<ClientAssignment[]>;
  getPrimaryClientAssignment(clientId: string): Promise<ClientAssignment | undefined>;
  getMyClients(salesPersonId: string): Promise<Client[]>;
  createClientAssignment(assignment: InsertClientAssignment): Promise<ClientAssignment>;
  updateClientAssignment(id: string, assignment: Partial<InsertClientAssignment>): Promise<ClientAssignment>;
  deleteClientAssignment(id: string): Promise<void>;
  assignClientToPrimarySalesPerson(clientId: string, salesPersonId: string, assignedBy: string): Promise<ClientAssignment>;
  bulkAssignClients(clientIds: string[], salesPersonId: string, assignedBy: string, assignmentType?: string): Promise<ClientAssignment[]>;
  transferClients(fromSalesPersonId: string, toSalesPersonId: string, assignedBy: string): Promise<ClientAssignment[]>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByClient(clientId: string): Promise<Order[]>;
  getOrdersBySalesPerson(salesPersonId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;

  // Purchase Orders
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrdersByClient(clientId: string): Promise<PurchaseOrder[]>;
  createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;

  // Credit Agreements
  getCreditAgreement(id: string): Promise<CreditAgreement | undefined>;
  getCreditAgreementsByClient(clientId: string): Promise<CreditAgreement[]>;
  getActiveCreditAgreementByClient(clientId: string): Promise<CreditAgreement | undefined>;
  createCreditAgreement(agreement: InsertCreditAgreement): Promise<CreditAgreement>;
  updateCreditAgreement(id: string, agreement: Partial<InsertCreditAgreement>): Promise<CreditAgreement>;

  // Payments
  getPayment(id: string): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByClient(clientId: string): Promise<Payment[]>;
  getOverduePayments(): Promise<Payment[]>;
  getPaymentsDueSoon(days: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksByType(type: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Follow-ups
  getFollowUp(id: string): Promise<FollowUp | undefined>;
  getFollowUpsByTask(taskId: string): Promise<FollowUp[]>;
  getFollowUpsByUser(userId: string): Promise<FollowUp[]>;
  createFollowUp(followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(id: string, followUp: Partial<InsertFollowUp>): Promise<FollowUp>;
  deleteFollowUp(id: string): Promise<void>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;

  // E-way Bills
  getEwayBill(id: string): Promise<EwayBill | undefined>;
  getAllEwayBills(): Promise<EwayBill[]>;
  getEwayBillsByOrder(orderId: string): Promise<EwayBill[]>;
  getExpiringEwayBills(days: number): Promise<EwayBill[]>;
  createEwayBill(ewayBill: InsertEwayBill): Promise<EwayBill>;
  updateEwayBill(id: string, ewayBill: Partial<InsertEwayBill>): Promise<EwayBill>;

  // Client Tracking
  getClientTracking(id: string): Promise<ClientTracking | undefined>;
  getAllClientTracking(): Promise<ClientTracking[]>;
  getClientTrackingByClient(clientId: string): Promise<ClientTracking[]>;
  createClientTracking(tracking: InsertClientTracking): Promise<ClientTracking>;
  updateClientTracking(id: string, tracking: Partial<InsertClientTracking>): Promise<ClientTracking>;

  // Sales Rates
  getSalesRate(id: string): Promise<SalesRate | undefined>;
  getSalesRatesByClient(clientId: string): Promise<SalesRate[]>;
  getSalesRatesByDateRange(clientId: string, startDate: Date, endDate: Date): Promise<SalesRate[]>;
  createSalesRate(salesRate: InsertSalesRate): Promise<SalesRate>;

  // Sales
  getSales(id: string): Promise<Sales | undefined>;
  getAllSales(): Promise<Sales[]>;
  getSalesBySalesperson(salespersonId: string): Promise<Sales[]>;
  getSalesByStatus(status: string): Promise<Sales[]>;
  createSales(sales: InsertSales): Promise<Sales>;
  updateSales(id: string, sales: Partial<InsertSales>): Promise<Sales>;
  deleteSales(id: string): Promise<void>;
  signDeliveryChallan(id: string): Promise<Sales>;

  // Number Series (Admin controlled)
  getNumberSeries(seriesType: string): Promise<NumberSeries | undefined>;
  getAllNumberSeries(): Promise<NumberSeries[]>;
  createNumberSeries(series: InsertNumberSeries): Promise<NumberSeries>;
  updateNumberSeries(id: string, series: Partial<InsertNumberSeries>): Promise<NumberSeries>;
  getNextNumber(seriesType: string): Promise<string>;

  // Transporters
  getTransporter(id: string): Promise<Transporter | undefined>;
  getAllTransporters(): Promise<Transporter[]>;
  createTransporter(transporter: InsertTransporter): Promise<Transporter>;
  updateTransporter(id: string, transporter: Partial<InsertTransporter>): Promise<Transporter>;

  // Products  
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    pendingPayments: string;
    activeClients: number;
    openTasks: number;
    inTransit: number;
    clientCategories: {
      ALFA: number;
      BETA: number;
      GAMMA: number;
      DELTA: number;
    };
  }>;

  // ==================== MASTER DATA ====================
  
  // Company Profile
  getCompanyProfile(): Promise<CompanyProfile | null>;
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  updateCompanyProfile(id: string, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile>;
  deleteCompanyProfile(id: string): Promise<void>;
  
  // Branches
  getBranch(id: string): Promise<Branch | undefined>;
  getAllBranches(): Promise<Branch[]>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch>;
  deleteBranch(id: string): Promise<void>;
  
  // Product Master
  getProductMaster(id: string): Promise<ProductMaster | undefined>;
  getAllProductMaster(): Promise<ProductMaster[]>;
  createProductMaster(product: InsertProductMaster): Promise<ProductMaster>;
  updateProductMaster(id: string, product: Partial<InsertProductMaster>): Promise<ProductMaster>;
  deleteProductMaster(id: string): Promise<void>;
  
  // Suppliers
  getSupplier(id: string): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  
  // Banks
  getBank(id: string): Promise<Bank | undefined>;
  getAllBanks(): Promise<Bank[]>;
  createBank(bank: InsertBank): Promise<Bank>;
  updateBank(id: string, bank: Partial<InsertBank>): Promise<Bank>;
  deleteBank(id: string): Promise<void>;
  
  // Vehicles
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getAllVehicles(): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;

  // ==================== SALES OPERATIONS ====================
  
  // Leads
  getLead(id: string): Promise<Lead | undefined>;
  getAllLeads(): Promise<Lead[]>;
  getLeadsByStatus(status: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  
  // Opportunities
  getOpportunity(id: string): Promise<Opportunity | undefined>;
  getAllOpportunities(): Promise<Opportunity[]>;
  getOpportunitiesByLead(leadId: string): Promise<Opportunity[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: string, opportunity: Partial<InsertOpportunity>): Promise<Opportunity>;
  
  // Quotations
  getQuotation(id: string): Promise<Quotation | undefined>;
  getAllQuotations(): Promise<Quotation[]>;
  getQuotationsByOpportunity(opportunityId: string): Promise<Quotation[]>;
  getQuotationsCount(): Promise<number>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: string, quotation: Partial<InsertQuotation>): Promise<Quotation>;
  deleteQuotation(id: string): Promise<void>;
  
  // Quotation Items
  getQuotationItem(id: string): Promise<QuotationItem | undefined>;
  getQuotationItemsByQuotation(quotationId: string): Promise<QuotationItem[]>;
  createQuotationItem(item: InsertQuotationItem): Promise<QuotationItem>;
  updateQuotationItem(id: string, item: Partial<InsertQuotationItem>): Promise<QuotationItem>;
  deleteQuotationItem(id: string): Promise<void>;
  
  // Sales Orders
  getSalesOrder(id: string): Promise<SalesOrder | undefined>;
  getAllSalesOrders(): Promise<SalesOrder[]>;
  getSalesOrdersByQuotation(quotationId: string): Promise<SalesOrder[]>;
  createSalesOrder(salesOrder: InsertSalesOrder): Promise<SalesOrder>;
  updateSalesOrder(id: string, salesOrder: Partial<InsertSalesOrder>): Promise<SalesOrder>;
  
  // Sales Order Items
  getSalesOrderItem(id: string): Promise<SalesOrderItem | undefined>;
  getSalesOrderItemsByOrder(salesOrderId: string): Promise<SalesOrderItem[]>;
  createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem>;
  updateSalesOrderItem(id: string, item: Partial<InsertSalesOrderItem>): Promise<SalesOrderItem>;
  deleteSalesOrderItem(id: string): Promise<void>;
  
  // Delivery Plans
  getDeliveryPlan(id: string): Promise<DeliveryPlan | undefined>;
  getAllDeliveryPlans(): Promise<DeliveryPlan[]>;
  getDeliveryPlansBySalesOrder(salesOrderId: string): Promise<DeliveryPlan[]>;
  createDeliveryPlan(plan: InsertDeliveryPlan): Promise<DeliveryPlan>;
  updateDeliveryPlan(id: string, plan: Partial<InsertDeliveryPlan>): Promise<DeliveryPlan>;
  
  // Dispatches
  getDispatch(id: string): Promise<Dispatch | undefined>;
  getAllDispatches(): Promise<Dispatch[]>;
  getDispatchesByDeliveryPlan(deliveryPlanId: string): Promise<Dispatch[]>;
  createDispatch(dispatch: InsertDispatch): Promise<Dispatch>;
  updateDispatch(id: string, dispatch: Partial<InsertDispatch>): Promise<Dispatch>;
  
  // Delivery Challans
  getDeliveryChallan(id: string): Promise<DeliveryChallan | undefined>;
  getDeliveryChallansbyDispatch(dispatchId: string): Promise<DeliveryChallan[]>;
  createDeliveryChallan(challan: InsertDeliveryChallan): Promise<DeliveryChallan>;
  updateDeliveryChallan(id: string, challan: Partial<InsertDeliveryChallan>): Promise<DeliveryChallan>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.firstName));
  }

  // Clients
  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(asc(clients.name));
  }

  async getClientsByCategory(category: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.category, category as any)).orderBy(asc(clients.name));
  }

  async getFilteredClients(filters: { category?: string; search?: string; dateFrom?: string; dateTo?: string; assignedToUserId?: string }): Promise<Client[]> {
    let query = db.select().from(clients);
    const conditions = [];

    // Category filter
    if (filters.category) {
      conditions.push(eq(clients.category, filters.category as any));
    }

    // Search filter (search in name, email, or mobile number)
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        sql`(LOWER(${clients.name}) LIKE ${searchTerm} OR 
             LOWER(${clients.email}) LIKE ${searchTerm} OR 
             LOWER(${clients.mobileNumber}) LIKE ${searchTerm})`
      );
    }

    // Date range filter (based on createdAt)
    if (filters.dateFrom) {
      conditions.push(gte(clients.createdAt, new Date(filters.dateFrom)));
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the full day
      conditions.push(lte(clients.createdAt, toDate));
    }

    // User assignment filter - only show clients assigned to the specified user
    if (filters.assignedToUserId) {
      conditions.push(eq(clients.primarySalesPersonId, filters.assignedToUserId));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(asc(clients.name));
  }

  async getClientCategoryStats(assignedToUserId?: string): Promise<{ ALFA: number; BETA: number; GAMMA: number; DELTA: number; total: number }> {
    let query = db.select({
      category: clients.category,
      count: sql<number>`count(*)::int`
    }).from(clients);

    // If assignedToUserId is provided, filter clients by assignment
    if (assignedToUserId) {
      query = query.where(eq(clients.primarySalesPersonId, assignedToUserId));
    }

    const results = await query.groupBy(clients.category);

    const stats = { ALFA: 0, BETA: 0, GAMMA: 0, DELTA: 0, total: 0 };
    
    results.forEach(result => {
      // Handle both ALFA and ALPHA as ALFA for compatibility
      const category = result.category === 'ALPHA' ? 'ALFA' : result.category;
      if (category in stats) {
        stats[category as keyof typeof stats] = result.count;
        stats.total += result.count;
      }
    });

    return stats;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: string, updateClient: Partial<InsertClient>): Promise<Client> {
    const [client] = await db.update(clients).set(updateClient).where(eq(clients.id, id)).returning();
    return client;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Client Assignments
  async getClientAssignment(id: string): Promise<ClientAssignment | undefined> {
    const [assignment] = await db.select().from(clientAssignments).where(eq(clientAssignments.id, id));
    return assignment || undefined;
  }

  async getAllClientAssignments(): Promise<ClientAssignment[]> {
    return await db.select().from(clientAssignments).orderBy(desc(clientAssignments.createdAt));
  }

  async getClientAssignmentsByClient(clientId: string): Promise<ClientAssignment[]> {
    return await db.select().from(clientAssignments)
      .where(eq(clientAssignments.clientId, clientId))
      .orderBy(desc(clientAssignments.createdAt));
  }

  async getClientAssignmentsBySalesPerson(salesPersonId: string): Promise<ClientAssignment[]> {
    return await db.select().from(clientAssignments)
      .where(eq(clientAssignments.salesPersonId, salesPersonId))
      .orderBy(desc(clientAssignments.createdAt));
  }

  async getActiveClientAssignmentsByClient(clientId: string): Promise<ClientAssignment[]> {
    return await db.select().from(clientAssignments)
      .where(and(eq(clientAssignments.clientId, clientId), eq(clientAssignments.isActive, true)))
      .orderBy(desc(clientAssignments.createdAt));
  }

  async getPrimaryClientAssignment(clientId: string): Promise<ClientAssignment | undefined> {
    const [assignment] = await db.select().from(clientAssignments)
      .where(and(
        eq(clientAssignments.clientId, clientId),
        eq(clientAssignments.assignmentType, 'PRIMARY'),
        eq(clientAssignments.isActive, true)
      ))
      .orderBy(desc(clientAssignments.createdAt));
    return assignment || undefined;
  }

  async getMyClients(salesPersonId: string): Promise<Client[]> {
    return await db.select({
      id: clients.id,
      name: clients.name,
      category: clients.category,
      email: clients.email,
      mobileNumber: clients.mobileNumber,
      billingCity: clients.billingCity,
      primarySalesPersonId: clients.primarySalesPersonId,
      lastContactDate: clients.lastContactDate,
      nextFollowUpDate: clients.nextFollowUpDate,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    })
    .from(clients)
    .innerJoin(clientAssignments, eq(clients.id, clientAssignments.clientId))
    .where(and(
      eq(clientAssignments.salesPersonId, salesPersonId),
      eq(clientAssignments.isActive, true)
    ))
    .orderBy(asc(clients.name));
  }

  async createClientAssignment(insertAssignment: InsertClientAssignment): Promise<ClientAssignment> {
    const [assignment] = await db.insert(clientAssignments).values(insertAssignment).returning();
    return assignment;
  }

  async updateClientAssignment(id: string, updateAssignment: Partial<InsertClientAssignment>): Promise<ClientAssignment> {
    const [assignment] = await db.update(clientAssignments)
      .set({ ...updateAssignment, updatedAt: sql`now()` })
      .where(eq(clientAssignments.id, id))
      .returning();
    return assignment;
  }

  async deleteClientAssignment(id: string): Promise<void> {
    await db.delete(clientAssignments).where(eq(clientAssignments.id, id));
  }

  async assignClientToPrimarySalesPerson(clientId: string, salesPersonId: string, assignedBy: string): Promise<ClientAssignment> {
    // First deactivate any existing primary assignments for this client
    await db.update(clientAssignments)
      .set({ isActive: false, updatedAt: sql`now()` })
      .where(and(
        eq(clientAssignments.clientId, clientId),
        eq(clientAssignments.assignmentType, 'PRIMARY')
      ));

    // Update the client's primary sales person
    await db.update(clients)
      .set({ primarySalesPersonId: salesPersonId, updatedAt: sql`now()` })
      .where(eq(clients.id, clientId));

    // Create new primary assignment
    const [assignment] = await db.insert(clientAssignments).values({
      clientId,
      salesPersonId,
      assignmentType: 'PRIMARY',
      assignedBy,
      isActive: true,
      notes: 'Assigned as primary sales person'
    }).returning();

    return assignment;
  }

  async bulkAssignClients(clientIds: string[], salesPersonId: string, assignedBy: string, assignmentType: string = 'PRIMARY'): Promise<ClientAssignment[]> {
    const assignments = clientIds.map(clientId => ({
      clientId,
      salesPersonId,
      assignmentType: assignmentType as any,
      assignedBy,
      isActive: true,
      notes: `Bulk assigned as ${assignmentType.toLowerCase()}`
    }));

    const results = await db.insert(clientAssignments).values(assignments).returning();

    // If assigning as primary, update client records
    if (assignmentType === 'PRIMARY') {
      await Promise.all(clientIds.map(clientId => 
        db.update(clients)
          .set({ primarySalesPersonId: salesPersonId, updatedAt: sql`now()` })
          .where(eq(clients.id, clientId))
      ));
    }

    return results;
  }

  async transferClients(fromSalesPersonId: string, toSalesPersonId: string, assignedBy: string): Promise<ClientAssignment[]> {
    // Get all active assignments for the source sales person
    const existingAssignments = await db.select().from(clientAssignments)
      .where(and(
        eq(clientAssignments.salesPersonId, fromSalesPersonId),
        eq(clientAssignments.isActive, true)
      ));

    // Deactivate existing assignments
    await db.update(clientAssignments)
      .set({ isActive: false, updatedAt: sql`now()` })
      .where(and(
        eq(clientAssignments.salesPersonId, fromSalesPersonId),
        eq(clientAssignments.isActive, true)
      ));

    // Create new assignments for the target sales person
    const newAssignments = existingAssignments.map(assignment => ({
      clientId: assignment.clientId,
      salesPersonId: toSalesPersonId,
      assignmentType: assignment.assignmentType,
      assignedBy,
      isActive: true,
      notes: `Transferred from sales person ${fromSalesPersonId}`
    }));

    const results = await db.insert(clientAssignments).values(newAssignments).returning();

    // Update primary sales person in client records for primary assignments
    const primaryClientIds = existingAssignments
      .filter(a => a.assignmentType === 'PRIMARY')
      .map(a => a.clientId);

    if (primaryClientIds.length > 0) {
      await Promise.all(primaryClientIds.map(clientId => 
        db.update(clients)
          .set({ primarySalesPersonId: toSalesPersonId, updatedAt: sql`now()` })
          .where(eq(clients.id, clientId))
      ));
    }

    return results;
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByClient(clientId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.clientId, clientId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersBySalesPerson(salesPersonId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.salesPersonId, salesPersonId)).orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrder(id: string, updateOrder: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db.update(orders).set({ ...updateOrder, updatedAt: sql`now()` }).where(eq(orders.id, id)).returning();
    return order;
  }

  // Purchase Orders
  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return po || undefined;
  }

  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrdersByClient(clientId: string): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).where(eq(purchaseOrders.clientId, clientId)).orderBy(desc(purchaseOrders.createdAt));
  }

  async createPurchaseOrder(insertPO: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [po] = await db.insert(purchaseOrders).values(insertPO).returning();
    return po;
  }

  // Credit Agreements
  async getCreditAgreement(id: string): Promise<CreditAgreement | undefined> {
    const [agreement] = await db.select().from(creditAgreements).where(eq(creditAgreements.id, id));
    return agreement || undefined;
  }

  async getCreditAgreementsByClient(clientId: string): Promise<CreditAgreement[]> {
    return await db.select().from(creditAgreements).where(eq(creditAgreements.clientId, clientId)).orderBy(desc(creditAgreements.createdAt));
  }

  async getActiveCreditAgreementByClient(clientId: string): Promise<CreditAgreement | undefined> {
    const [agreement] = await db.select().from(creditAgreements)
      .where(and(eq(creditAgreements.clientId, clientId), eq(creditAgreements.isActive, true)))
      .orderBy(desc(creditAgreements.createdAt));
    return agreement || undefined;
  }

  async createCreditAgreement(insertAgreement: InsertCreditAgreement): Promise<CreditAgreement> {
    const [agreement] = await db.insert(creditAgreements).values(insertAgreement).returning();
    return agreement;
  }

  async updateCreditAgreement(id: string, updateAgreement: Partial<InsertCreditAgreement>): Promise<CreditAgreement> {
    const [agreement] = await db.update(creditAgreements).set(updateAgreement).where(eq(creditAgreements.id, id)).returning();
    return agreement;
  }

  // Payments
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentsByClient(clientId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.clientId, clientId)).orderBy(desc(payments.createdAt));
  }

  async getOverduePayments(): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(and(
        eq(payments.status, 'PENDING'),
        lte(payments.dueDate, sql`now()`)
      ))
      .orderBy(asc(payments.dueDate));
  }

  async getPaymentsDueSoon(days: number): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(and(
        eq(payments.status, 'PENDING'),
        lte(payments.dueDate, sql`now() + interval '${days} days'`),
        gte(payments.dueDate, sql`now()`)
      ))
      .orderBy(asc(payments.dueDate));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePayment(id: string, updatePayment: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db.update(payments).set(updatePayment).where(eq(payments.id, id)).returning();
    return payment;
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByType(type: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.type, type as any)).orderBy(desc(tasks.createdAt));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const taskData = {
      ...insertTask,
      dueDate: insertTask.dueDate ? new Date(insertTask.dueDate) : null,
      completedAt: insertTask.completedAt ? new Date(insertTask.completedAt) : null,
      nextDueDate: insertTask.nextDueDate ? new Date(insertTask.nextDueDate) : null
    } as any;
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async updateTask(id: string, updateTask: Partial<InsertTask>): Promise<Task> {
    const taskData = {
      ...updateTask,
      dueDate: updateTask.dueDate ? new Date(updateTask.dueDate) : undefined,
      completedAt: updateTask.completedAt ? new Date(updateTask.completedAt) : undefined,
      nextDueDate: updateTask.nextDueDate ? new Date(updateTask.nextDueDate) : undefined
    } as any;
    
    // Remove undefined values
    Object.keys(taskData).forEach(key => (taskData as any)[key] === undefined && delete (taskData as any)[key]);
    
    const [task] = await db.update(tasks).set(taskData).where(eq(tasks.id, id)).returning();
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Follow-ups
  async getFollowUp(id: string): Promise<FollowUp | undefined> {
    const [followUp] = await db.select().from(followUps).where(eq(followUps.id, id));
    return followUp || undefined;
  }

  async getFollowUpsByTask(taskId: string): Promise<FollowUp[]> {
    return await db.select().from(followUps)
      .where(eq(followUps.taskId, taskId))
      .orderBy(desc(followUps.followUpDate));
  }

  async getFollowUpsByUser(userId: string): Promise<FollowUp[]> {
    return await db.select().from(followUps)
      .where(eq(followUps.assignedUserId, userId))
      .orderBy(desc(followUps.followUpDate));
  }

  async getAllFollowUps(): Promise<FollowUp[]> {
    return await db.select().from(followUps).orderBy(desc(followUps.createdAt));
  }

  async createFollowUp(insertFollowUp: InsertFollowUp): Promise<FollowUp> {
    const followUpData = {
      ...insertFollowUp,
      followUpDate: new Date(insertFollowUp.followUpDate),
      nextFollowUpDate: insertFollowUp.nextFollowUpDate ? new Date(insertFollowUp.nextFollowUpDate) : null,
      completedAt: insertFollowUp.completedAt ? new Date(insertFollowUp.completedAt) : null,
    } as any;
    
    const [followUp] = await db.insert(followUps).values(followUpData).returning();
    return followUp;
  }

  async updateFollowUp(id: string, updateFollowUp: Partial<InsertFollowUp>): Promise<FollowUp> {
    const followUpData = {
      ...updateFollowUp,
      followUpDate: updateFollowUp.followUpDate ? new Date(updateFollowUp.followUpDate) : undefined,
      nextFollowUpDate: updateFollowUp.nextFollowUpDate ? new Date(updateFollowUp.nextFollowUpDate) : undefined,
      completedAt: updateFollowUp.completedAt ? new Date(updateFollowUp.completedAt) : undefined,
      updatedAt: new Date()
    } as any;
    
    // Remove undefined values
    Object.keys(followUpData).forEach(key => (followUpData as any)[key] === undefined && delete (followUpData as any)[key]);
    
    const [followUp] = await db.update(followUps).set(followUpData).where(eq(followUps.id, id)).returning();
    return followUp;
  }

  async deleteFollowUp(id: string): Promise<void> {
    await db.delete(followUps).where(eq(followUps.id, id));
  }

  // Lead Follow-ups
  async getLeadFollowUp(id: string): Promise<LeadFollowUp | undefined> {
    const [leadFollowUp] = await db.select().from(leadFollowUps).where(eq(leadFollowUps.id, id));
    return leadFollowUp || undefined;
  }

  async getLeadFollowUpsByLead(leadId: string): Promise<LeadFollowUp[]> {
    return await db.select().from(leadFollowUps)
      .where(eq(leadFollowUps.leadId, leadId))
      .orderBy(desc(leadFollowUps.followUpDate));
  }

  async getLeadFollowUpsByUser(userId: string): Promise<LeadFollowUp[]> {
    return await db.select().from(leadFollowUps)
      .where(eq(leadFollowUps.assignedUserId, userId))
      .orderBy(desc(leadFollowUps.followUpDate));
  }

  async getAllLeadFollowUps(): Promise<LeadFollowUp[]> {
    return await db.select().from(leadFollowUps).orderBy(desc(leadFollowUps.createdAt));
  }

  async createLeadFollowUp(insertLeadFollowUp: InsertLeadFollowUp): Promise<LeadFollowUp> {
    const leadFollowUpData = {
      ...insertLeadFollowUp,
      followUpDate: new Date(insertLeadFollowUp.followUpDate),
      nextFollowUpDate: insertLeadFollowUp.nextFollowUpDate ? new Date(insertLeadFollowUp.nextFollowUpDate) : null,
      completedAt: insertLeadFollowUp.completedAt ? new Date(insertLeadFollowUp.completedAt) : null,
    } as any;
    
    const [leadFollowUp] = await db.insert(leadFollowUps).values(leadFollowUpData).returning();
    return leadFollowUp;
  }

  async updateLeadFollowUp(id: string, updateLeadFollowUp: Partial<InsertLeadFollowUp>): Promise<LeadFollowUp> {
    const leadFollowUpData = {
      ...updateLeadFollowUp,
      followUpDate: updateLeadFollowUp.followUpDate ? new Date(updateLeadFollowUp.followUpDate) : undefined,
      nextFollowUpDate: updateLeadFollowUp.nextFollowUpDate ? new Date(updateLeadFollowUp.nextFollowUpDate) : undefined,
      completedAt: updateLeadFollowUp.completedAt ? new Date(updateLeadFollowUp.completedAt) : undefined,
      updatedAt: new Date()
    } as any;
    
    // Remove undefined values
    Object.keys(leadFollowUpData).forEach(key => (leadFollowUpData as any)[key] === undefined && delete (leadFollowUpData as any)[key]);
    
    const [leadFollowUp] = await db.update(leadFollowUps).set(leadFollowUpData).where(eq(leadFollowUps.id, id)).returning();
    return leadFollowUp;
  }

  async deleteLeadFollowUp(id: string): Promise<void> {
    await db.delete(leadFollowUps).where(eq(leadFollowUps.id, id));
  }

  // E-way Bills
  async getEwayBill(id: string): Promise<EwayBill | undefined> {
    const [ewayBill] = await db.select().from(ewayBills).where(eq(ewayBills.id, id));
    return ewayBill || undefined;
  }

  async getAllEwayBills(): Promise<EwayBill[]> {
    return await db.select().from(ewayBills).orderBy(desc(ewayBills.createdAt));
  }

  async getEwayBillsByOrder(orderId: string): Promise<EwayBill[]> {
    return await db.select().from(ewayBills).where(eq(ewayBills.orderId, orderId)).orderBy(desc(ewayBills.createdAt));
  }

  async getExpiringEwayBills(days: number): Promise<EwayBill[]> {
    return await db.select().from(ewayBills)
      .where(lte(ewayBills.validUntil, sql`now() + interval '${days} days'`))
      .orderBy(asc(ewayBills.validUntil));
  }

  async createEwayBill(insertEwayBill: InsertEwayBill): Promise<EwayBill> {
    const [ewayBill] = await db.insert(ewayBills).values(insertEwayBill).returning();
    return ewayBill;
  }

  async updateEwayBill(id: string, updateEwayBill: Partial<InsertEwayBill>): Promise<EwayBill> {
    const [ewayBill] = await db.update(ewayBills).set(updateEwayBill).where(eq(ewayBills.id, id)).returning();
    return ewayBill;
  }

  // Client Tracking
  async getClientTracking(id: string): Promise<ClientTracking | undefined> {
    const [tracking] = await db.select().from(clientTracking).where(eq(clientTracking.id, id));
    return tracking || undefined;
  }

  async getAllClientTracking(): Promise<ClientTracking[]> {
    return await db.select().from(clientTracking).orderBy(desc(clientTracking.lastUpdated));
  }

  async getClientTrackingByClient(clientId: string): Promise<ClientTracking[]> {
    return await db.select().from(clientTracking).where(eq(clientTracking.clientId, clientId)).orderBy(desc(clientTracking.lastUpdated));
  }

  async createClientTracking(insertTracking: InsertClientTracking): Promise<ClientTracking> {
    const [tracking] = await db.insert(clientTracking).values(insertTracking).returning();
    return tracking;
  }

  async updateClientTracking(id: string, updateTracking: Partial<InsertClientTracking>): Promise<ClientTracking> {
    const [tracking] = await db.update(clientTracking).set({ ...updateTracking, lastUpdated: sql`now()` }).where(eq(clientTracking.id, id)).returning();
    return tracking;
  }

  // Sales Rates
  async getSalesRate(id: string): Promise<SalesRate | undefined> {
    const [salesRate] = await db.select().from(salesRates).where(eq(salesRates.id, id));
    return salesRate || undefined;
  }

  async getSalesRatesByClient(clientId: string): Promise<SalesRate[]> {
    return await db.select().from(salesRates).where(eq(salesRates.clientId, clientId)).orderBy(desc(salesRates.date));
  }

  async getSalesRatesByDateRange(clientId: string, startDate: Date, endDate: Date): Promise<SalesRate[]> {
    return await db.select().from(salesRates)
      .where(and(
        eq(salesRates.clientId, clientId),
        gte(salesRates.date, startDate),
        lte(salesRates.date, endDate)
      ))
      .orderBy(desc(salesRates.date));
  }

  async createSalesRate(insertSalesRate: InsertSalesRate): Promise<SalesRate> {
    const [salesRate] = await db.insert(salesRates).values(insertSalesRate).returning();
    return salesRate;
  }

  // Sales
  async getSales(id: string): Promise<Sales | undefined> {
    const [salesRecord] = await db.select().from(sales).where(eq(sales.id, id));
    return salesRecord || undefined;
  }

  async getAllSales(): Promise<Sales[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }

  async getSalesBySalesperson(salespersonId: string): Promise<Sales[]> {
    return await db.select().from(sales).where(eq(sales.salespersonId, salespersonId)).orderBy(desc(sales.createdAt));
  }

  async getSalesByStatus(status: string): Promise<Sales[]> {
    return await db.select().from(sales).where(eq(sales.deliveryStatus, status as any)).orderBy(desc(sales.createdAt));
  }

  async createSales(insertSales: InsertSales): Promise<Sales> {
    const salesData = {
      ...insertSales,
      date: insertSales.date ? new Date(insertSales.date) : new Date(),
      deliveryChallanSignedAt: insertSales.deliveryChallanSignedAt ? new Date(insertSales.deliveryChallanSignedAt) : null
    } as any;
    const [salesRecord] = await db.insert(sales).values(salesData).returning();
    return salesRecord;
  }

  async updateSales(id: string, updateSales: Partial<InsertSales>): Promise<Sales> {
    const salesData = {
      ...updateSales,
      date: updateSales.date ? new Date(updateSales.date) : undefined,
      deliveryChallanSignedAt: updateSales.deliveryChallanSignedAt ? new Date(updateSales.deliveryChallanSignedAt) : undefined,
      updatedAt: new Date()
    } as any;
    
    // Remove undefined values
    Object.keys(salesData).forEach(key => (salesData as any)[key] === undefined && delete (salesData as any)[key]);
    
    const [salesRecord] = await db.update(sales).set(salesData).where(eq(sales.id, id)).returning();
    return salesRecord;
  }

  async deleteSales(id: string): Promise<void> {
    await db.delete(sales).where(eq(sales.id, id));
  }

  async signDeliveryChallan(id: string): Promise<Sales> {
    const [salesRecord] = await db.update(sales)
      .set({ 
        deliveryChallanSigned: true, 
        deliveryChallanSignedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sales.id, id))
      .returning();
    return salesRecord;
  }

  // Number Series (Admin controlled)
  async getNumberSeries(seriesType: string): Promise<NumberSeries | undefined> {
    const [series] = await db.select().from(numberSeries)
      .where(and(eq(numberSeries.seriesType, seriesType), eq(numberSeries.isActive, true)));
    return series || undefined;
  }

  async getAllNumberSeries(): Promise<NumberSeries[]> {
    return await db.select().from(numberSeries).orderBy(desc(numberSeries.createdAt));
  }

  async createNumberSeries(insertSeries: InsertNumberSeries): Promise<NumberSeries> {
    const [series] = await db.insert(numberSeries).values(insertSeries).returning();
    return series;
  }

  async updateNumberSeries(id: string, updateSeries: Partial<InsertNumberSeries>): Promise<NumberSeries> {
    const [series] = await db.update(numberSeries)
      .set({ ...updateSeries, updatedAt: new Date() })
      .where(eq(numberSeries.id, id))
      .returning();
    return series;
  }

  async getNextNumber(seriesType: string): Promise<string> {
    const series = await this.getNumberSeries(seriesType);
    if (!series) {
      throw new Error(`Number series not found for type: ${seriesType}`);
    }

    // Generate the next number with padding
    const nextNumber = series.currentNumber;
    const paddedNumber = nextNumber.toString().padStart(series.numberLength, '0');
    const fullNumber = `${series.prefix}-${paddedNumber}`;

    // Update the current number for next time
    await db.update(numberSeries)
      .set({ 
        currentNumber: nextNumber + 1,
        updatedAt: new Date()
      })
      .where(eq(numberSeries.id, series.id));

    return fullNumber;
  }

  // Transporters
  async getTransporter(id: string): Promise<Transporter | undefined> {
    const [transporter] = await db.select().from(transporters).where(eq(transporters.id, id));
    return transporter || undefined;
  }

  async getAllTransporters(): Promise<Transporter[]> {
    return await db.select().from(transporters)
      .where(eq(transporters.isActive, true))
      .orderBy(asc(transporters.name));
  }

  async createTransporter(insertTransporter: InsertTransporter): Promise<Transporter> {
    const [transporter] = await db.insert(transporters).values(insertTransporter).returning();
    return transporter;
  }

  async updateTransporter(id: string, updateTransporter: Partial<InsertTransporter>): Promise<Transporter> {
    const [transporter] = await db.update(transporters)
      .set(updateTransporter)
      .where(eq(transporters.id, id))
      .returning();
    return transporter;
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.name));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, updateProduct: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products)
      .set(updateProduct)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  // Dashboard Stats
  async getDashboardStats(userId?: string) {
    // Base queries for filtering by user assignment
    const userFilter = userId ? eq(clients.primarySalesPersonId, userId) : undefined;
    
    // Pending payments for user's assigned clients
    let pendingPaymentsQuery = db.select({
      total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`
    }).from(payments);
    
    if (userId) {
      pendingPaymentsQuery = pendingPaymentsQuery
        .innerJoin(orders, eq(payments.orderId, orders.id))
        .innerJoin(clients, eq(orders.clientId, clients.id))
        .where(and(eq(payments.status, 'PENDING'), eq(clients.primarySalesPersonId, userId)));
    } else {
      pendingPaymentsQuery = pendingPaymentsQuery.where(eq(payments.status, 'PENDING'));
    }
    
    const [pendingPaymentsResult] = await pendingPaymentsQuery;

    // Active clients
    let activeClientsQuery = db.select({
      count: count()
    }).from(clients);
    
    if (userFilter) {
      activeClientsQuery = activeClientsQuery.where(userFilter);
    }
    
    const [activeClientsResult] = await activeClientsQuery;

    // Open tasks for user's assigned clients
    let openTasksQuery = db.select({
      count: count()
    }).from(tasks);
    
    if (userId) {
      openTasksQuery = openTasksQuery
        .innerJoin(clients, eq(tasks.clientId, clients.id))
        .where(and(eq(tasks.isCompleted, false), eq(clients.primarySalesPersonId, userId)));
    } else {
      openTasksQuery = openTasksQuery.where(eq(tasks.isCompleted, false));
    }
    
    const [openTasksResult] = await openTasksQuery;

    // In transit items for user's assigned clients
    let inTransitQuery = db.select({
      count: count()
    }).from(clientTracking);
    
    if (userId) {
      inTransitQuery = inTransitQuery
        .innerJoin(clients, eq(clientTracking.clientId, clients.id))
        .where(and(eq(clientTracking.status, 'IN_TRANSIT'), eq(clients.primarySalesPersonId, userId)));
    } else {
      inTransitQuery = inTransitQuery.where(eq(clientTracking.status, 'IN_TRANSIT'));
    }
    
    const [inTransitResult] = await inTransitQuery;

    // Category stats for user's assigned clients
    let categoryStatsQuery = db.select({
      category: clients.category,
      count: count()
    }).from(clients).groupBy(clients.category);
    
    if (userFilter) {
      categoryStatsQuery = categoryStatsQuery.where(userFilter);
    }
    
    const categoryStats = await categoryStatsQuery;

    const clientCategories = {
      ALFA: 0,
      BETA: 0,
      GAMMA: 0,
      DELTA: 0
    };

    categoryStats.forEach(stat => {
      clientCategories[stat.category] = stat.count;
    });

    return {
      pendingPayments: pendingPaymentsResult.total,
      activeClients: activeClientsResult.count,
      openTasks: openTasksResult.count,
      inTransit: inTransitResult.count,
      clientCategories
    };
  }

  // Shipping Addresses
  async getShippingAddress(id: string): Promise<ShippingAddress | undefined> {
    const [address] = await db
      .select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.id, id))
      .limit(1);
    return address;
  }

  async getShippingAddressesByClient(clientId: string): Promise<ShippingAddress[]> {
    return await db
      .select()
      .from(shippingAddresses)
      .where(and(eq(shippingAddresses.clientId, clientId), eq(shippingAddresses.isActive, true)))
      .orderBy(asc(shippingAddresses.createdAt));
  }

  async createShippingAddress(addressData: InsertShippingAddress): Promise<ShippingAddress> {
    const [address] = await db
      .insert(shippingAddresses)
      .values(addressData)
      .returning();
    return address;
  }

  async updateShippingAddress(id: string, addressData: Partial<InsertShippingAddress>): Promise<ShippingAddress> {
    const [address] = await db
      .update(shippingAddresses)
      .set(addressData)
      .where(eq(shippingAddresses.id, id))
      .returning();
    return address;
  }

  async deleteShippingAddress(id: string): Promise<void> {
    await db
      .update(shippingAddresses)
      .set({ isActive: false })
      .where(eq(shippingAddresses.id, id));
  }

  // ==================== MASTER DATA IMPLEMENTATIONS ====================
  
  // Company Profile
  async getCompanyProfile(): Promise<CompanyProfile | null> {
    const [profile] = await db.select().from(companyProfile).limit(1);
    return profile || null;
  }

  async createCompanyProfile(profileData: InsertCompanyProfile): Promise<CompanyProfile> {
    const [profile] = await db
      .insert(companyProfile)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateCompanyProfile(id: string, profileData: Partial<InsertCompanyProfile>): Promise<CompanyProfile> {
    const [profile] = await db
      .update(companyProfile)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(companyProfile.id, id))
      .returning();
    return profile;
  }

  async deleteCompanyProfile(id: string): Promise<void> {
    await db.delete(companyProfile).where(eq(companyProfile.id, id));
  }

  // Branches
  async getBranch(id: string): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch || undefined;
  }

  async getAllBranches(): Promise<Branch[]> {
    return await db
      .select()
      .from(branches)
      .orderBy(asc(branches.name));
  }

  async createBranch(branchData: InsertBranch): Promise<Branch> {
    const [branch] = await db
      .insert(branches)
      .values(branchData)
      .returning();
    return branch;
  }

  async updateBranch(id: string, branchData: Partial<InsertBranch>): Promise<Branch> {
    const [branch] = await db
      .update(branches)
      .set({ ...branchData, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return branch;
  }

  async deleteBranch(id: string): Promise<void> {
    await db.delete(branches).where(eq(branches.id, id));
  }

  // Product Master
  async getProductMaster(id: string): Promise<ProductMaster | undefined> {
    const [product] = await db.select().from(productMaster).where(eq(productMaster.id, id));
    return product || undefined;
  }

  async getAllProductMaster(): Promise<ProductMaster[]> {
    return await db
      .select()
      .from(productMaster)
      .orderBy(asc(productMaster.name));
  }

  async createProductMaster(productData: InsertProductMaster): Promise<ProductMaster> {
    const [product] = await db
      .insert(productMaster)
      .values(productData)
      .returning();
    return product;
  }

  async updateProductMaster(id: string, productData: Partial<InsertProductMaster>): Promise<ProductMaster> {
    const [product] = await db
      .update(productMaster)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(productMaster.id, id))
      .returning();
    return product;
  }

  async deleteProductMaster(id: string): Promise<void> {
    await db.delete(productMaster).where(eq(productMaster.id, id));
  }

  // Suppliers
  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers)
      .orderBy(asc(suppliers.name));
  }

  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db
      .insert(suppliers)
      .values(supplierData)
      .returning();
    return supplier;
  }

  async updateSupplier(id: string, supplierData: Partial<InsertSupplier>): Promise<Supplier> {
    const [supplier] = await db
      .update(suppliers)
      .set({ ...supplierData, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  // Banks
  async getBank(id: string): Promise<Bank | undefined> {
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank || undefined;
  }

  async getAllBanks(): Promise<Bank[]> {
    return await db
      .select()
      .from(banks)
      .orderBy(asc(banks.bankName));
  }

  async createBank(bankData: InsertBank): Promise<Bank> {
    const [bank] = await db
      .insert(banks)
      .values(bankData)
      .returning();
    return bank;
  }

  async updateBank(id: string, bankData: Partial<InsertBank>): Promise<Bank> {
    const [bank] = await db
      .update(banks)
      .set(bankData)
      .where(eq(banks.id, id))
      .returning();
    return bank;
  }

  async deleteBank(id: string): Promise<void> {
    await db.delete(banks).where(eq(banks.id, id));
  }

  // Vehicles
  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .orderBy(asc(vehicles.registrationNumber));
  }

  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(vehicleData)
      .returning();
    return vehicle;
  }

  async updateVehicle(id: string, vehicleData: Partial<InsertVehicle>): Promise<Vehicle> {
    const [vehicle] = await db
      .update(vehicles)
      .set({ ...vehicleData, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // ==================== SALES OPERATIONS IMPLEMENTATIONS ====================
  
  // Leads
  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async getAllLeads(): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.leadStatus, status))
      .orderBy(desc(leads.createdAt));
  }

  async createLead(leadData: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(leadData)
      .returning();
    return lead;
  }

  async updateLead(id: string, leadData: Partial<InsertLead>): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({ ...leadData, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  // User-specific lead methods for role-based access
  async getLeadsByUser(userId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.assignedToUserId, userId))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsByStatusAndUser(status: string, userId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(and(eq(leads.leadStatus, status), eq(leads.assignedToUserId, userId)))
      .orderBy(desc(leads.createdAt));
  }

  // Generate next lead number
  async generateNextLeadNumber(): Promise<string> {
    const [result] = await db
      .select({ count: count() })
      .from(leads);
    
    const nextNumber = (result.count || 0) + 1;
    return `LEAD-${String(nextNumber).padStart(4, '0')}`;
  }
  
  // Opportunities
  async getOpportunity(id: string): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity || undefined;
  }

  async getAllOpportunities(): Promise<Opportunity[]> {
    return await db
      .select()
      .from(opportunities)
      .orderBy(desc(opportunities.createdAt));
  }

  async getOpportunitiesByLead(leadId: string): Promise<Opportunity[]> {
    return await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.leadId, leadId))
      .orderBy(desc(opportunities.createdAt));
  }

  async createOpportunity(opportunityData: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await db
      .insert(opportunities)
      .values(opportunityData)
      .returning();
    return opportunity;
  }

  async updateOpportunity(id: string, opportunityData: Partial<InsertOpportunity>): Promise<Opportunity> {
    const [opportunity] = await db
      .update(opportunities)
      .set({ ...opportunityData, updatedAt: new Date() })
      .where(eq(opportunities.id, id))
      .returning();
    return opportunity;
  }
  
  // Quotations
  async getQuotation(id: string): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
    return quotation || undefined;
  }

  async getAllQuotations(): Promise<Quotation[]> {
    return await db
      .select()
      .from(quotations)
      .orderBy(desc(quotations.createdAt));
  }

  async getQuotationsByOpportunity(opportunityId: string): Promise<Quotation[]> {
    return await db
      .select()
      .from(quotations)
      .where(eq(quotations.opportunityId, opportunityId))
      .orderBy(desc(quotations.createdAt));
  }

  async getQuotationsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(quotations);
    return result[0]?.count || 0;
  }

  async createQuotation(quotationData: InsertQuotation): Promise<Quotation> {
    const [quotation] = await db
      .insert(quotations)
      .values(quotationData)
      .returning();
    return quotation;
  }

  async updateQuotation(id: string, quotationData: Partial<InsertQuotation>): Promise<Quotation> {
    const [quotation] = await db
      .update(quotations)
      .set({ ...quotationData, updatedAt: new Date() })
      .where(eq(quotations.id, id))
      .returning();
    return quotation;
  }

  async deleteQuotation(id: string): Promise<void> {
    // First delete related sales orders and their items
    const relatedSalesOrders = await db
      .select({ id: salesOrders.id })
      .from(salesOrders)
      .where(eq(salesOrders.quotationId, id));
    
    for (const salesOrder of relatedSalesOrders) {
      // Delete sales order items first
      await db.delete(salesOrderItems).where(eq(salesOrderItems.salesOrderId, salesOrder.id));
      // Then delete the sales order
      await db.delete(salesOrders).where(eq(salesOrders.id, salesOrder.id));
    }
    
    // Delete quotation items
    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
    
    // Finally delete the quotation
    await db.delete(quotations).where(eq(quotations.id, id));
  }
  
  // Quotation Items
  async getQuotationItem(id: string): Promise<QuotationItem | undefined> {
    const [item] = await db.select().from(quotationItems).where(eq(quotationItems.id, id));
    return item || undefined;
  }

  async getQuotationItemsByQuotation(quotationId: string): Promise<QuotationItem[]> {
    return await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId))
      .orderBy(asc(quotationItems.createdAt));
  }

  async createQuotationItem(itemData: InsertQuotationItem): Promise<QuotationItem> {
    const [item] = await db
      .insert(quotationItems)
      .values(itemData)
      .returning();
    return item;
  }

  async updateQuotationItem(id: string, itemData: Partial<InsertQuotationItem>): Promise<QuotationItem> {
    const [item] = await db
      .update(quotationItems)
      .set(itemData)
      .where(eq(quotationItems.id, id))
      .returning();
    return item;
  }

  async deleteQuotationItem(id: string): Promise<void> {
    await db.delete(quotationItems).where(eq(quotationItems.id, id));
  }
  
  // Sales Orders
  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    const [salesOrder] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
    return salesOrder || undefined;
  }

  async getAllSalesOrders(): Promise<SalesOrder[]> {
    return await db
      .select()
      .from(salesOrders)
      .orderBy(desc(salesOrders.createdAt));
  }

  async getSalesOrdersByQuotation(quotationId: string): Promise<SalesOrder[]> {
    return await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.quotationId, quotationId))
      .orderBy(desc(salesOrders.createdAt));
  }

  async createSalesOrder(salesOrderData: InsertSalesOrder): Promise<SalesOrder> {
    const [salesOrder] = await db
      .insert(salesOrders)
      .values(salesOrderData)
      .returning();
    return salesOrder;
  }

  async updateSalesOrder(id: string, salesOrderData: Partial<InsertSalesOrder>): Promise<SalesOrder> {
    const [salesOrder] = await db
      .update(salesOrders)
      .set({ ...salesOrderData, updatedAt: new Date() })
      .where(eq(salesOrders.id, id))
      .returning();
    return salesOrder;
  }
  
  // Sales Order Items
  async getSalesOrderItem(id: string): Promise<SalesOrderItem | undefined> {
    const [item] = await db.select().from(salesOrderItems).where(eq(salesOrderItems.id, id));
    return item || undefined;
  }

  async getSalesOrderItemsByOrder(salesOrderId: string): Promise<SalesOrderItem[]> {
    return await db
      .select()
      .from(salesOrderItems)
      .where(eq(salesOrderItems.salesOrderId, salesOrderId))
      .orderBy(asc(salesOrderItems.createdAt));
  }

  async createSalesOrderItem(itemData: InsertSalesOrderItem): Promise<SalesOrderItem> {
    const [item] = await db
      .insert(salesOrderItems)
      .values(itemData)
      .returning();
    return item;
  }

  async updateSalesOrderItem(id: string, itemData: Partial<InsertSalesOrderItem>): Promise<SalesOrderItem> {
    const [item] = await db
      .update(salesOrderItems)
      .set(itemData)
      .where(eq(salesOrderItems.id, id))
      .returning();
    return item;
  }

  async deleteSalesOrderItem(id: string): Promise<void> {
    await db.delete(salesOrderItems).where(eq(salesOrderItems.id, id));
  }
  
  // Delivery Plans
  async getDeliveryPlan(id: string): Promise<DeliveryPlan | undefined> {
    const [plan] = await db.select().from(deliveryPlans).where(eq(deliveryPlans.id, id));
    return plan || undefined;
  }

  async getAllDeliveryPlans(): Promise<DeliveryPlan[]> {
    return await db
      .select()
      .from(deliveryPlans)
      .orderBy(desc(deliveryPlans.createdAt));
  }

  async getDeliveryPlansBySalesOrder(salesOrderId: string): Promise<DeliveryPlan[]> {
    return await db
      .select()
      .from(deliveryPlans)
      .where(eq(deliveryPlans.salesOrderId, salesOrderId))
      .orderBy(desc(deliveryPlans.createdAt));
  }

  async createDeliveryPlan(planData: InsertDeliveryPlan): Promise<DeliveryPlan> {
    const [plan] = await db
      .insert(deliveryPlans)
      .values(planData)
      .returning();
    return plan;
  }

  async updateDeliveryPlan(id: string, planData: Partial<InsertDeliveryPlan>): Promise<DeliveryPlan> {
    const [plan] = await db
      .update(deliveryPlans)
      .set({ ...planData, updatedAt: new Date() })
      .where(eq(deliveryPlans.id, id))
      .returning();
    return plan;
  }
  
  // Dispatches
  async getDispatch(id: string): Promise<Dispatch | undefined> {
    const [dispatch] = await db.select().from(dispatches).where(eq(dispatches.id, id));
    return dispatch || undefined;
  }

  async getAllDispatches(): Promise<Dispatch[]> {
    return await db
      .select()
      .from(dispatches)
      .orderBy(desc(dispatches.createdAt));
  }

  async getDispatchesByDeliveryPlan(deliveryPlanId: string): Promise<Dispatch[]> {
    return await db
      .select()
      .from(dispatches)
      .where(eq(dispatches.deliveryPlanId, deliveryPlanId))
      .orderBy(desc(dispatches.createdAt));
  }

  async createDispatch(dispatchData: InsertDispatch): Promise<Dispatch> {
    const [dispatch] = await db
      .insert(dispatches)
      .values(dispatchData)
      .returning();
    return dispatch;
  }

  async updateDispatch(id: string, dispatchData: Partial<InsertDispatch>): Promise<Dispatch> {
    const [dispatch] = await db
      .update(dispatches)
      .set({ ...dispatchData, updatedAt: new Date() })
      .where(eq(dispatches.id, id))
      .returning();
    return dispatch;
  }
  
  // Delivery Challans
  async getDeliveryChallan(id: string): Promise<DeliveryChallan | undefined> {
    const [challan] = await db.select().from(deliveryChallans).where(eq(deliveryChallans.id, id));
    return challan || undefined;
  }

  async getDeliveryChallansbyDispatch(dispatchId: string): Promise<DeliveryChallan[]> {
    return await db
      .select()
      .from(deliveryChallans)
      .where(eq(deliveryChallans.dispatchId, dispatchId))
      .orderBy(asc(deliveryChallans.createdAt));
  }

  async createDeliveryChallan(challanData: InsertDeliveryChallan): Promise<DeliveryChallan> {
    const [challan] = await db
      .insert(deliveryChallans)
      .values(challanData)
      .returning();
    return challan;
  }

  async updateDeliveryChallan(id: string, challanData: Partial<InsertDeliveryChallan>): Promise<DeliveryChallan> {
    const [challan] = await db
      .update(deliveryChallans)
      .set(challanData)
      .where(eq(deliveryChallans.id, id))
      .returning();
    return challan;
  }
}

export const storage = new DatabaseStorage();

// Initialize bitumen products data
export async function initializeBitumenProducts() {
  const bitumenProducts = [
    { productCode: 'VG30-NE', name: 'BITUMEN VG-30 NON EMBOSSED (NE)', hsnCode: '27132000', productFamily: 'VG_BITUMEN', grade: 'VG-30', packaging: 'BULK', unit: 'MT' },
    { productCode: 'VG40', name: 'BITUMEN VG-40', hsnCode: '27132000', productFamily: 'VG_BITUMEN', grade: 'VG-40', packaging: 'BULK', unit: 'MT' },
    { productCode: 'JEY-60/70', name: 'BITUMEN JEY EMBOSSED 60/70', hsnCode: '27132000', productFamily: 'VG_BITUMEN', grade: '60/70', packaging: 'EMBOSSED', unit: 'MT' },
    { productCode: 'VG30-WAT', name: 'BITUMEN VG-30 WATANIYA EMBOSSED', hsnCode: '27132000', productFamily: 'VG_BITUMEN', grade: 'VG-30', packaging: 'EMBOSSED', unit: 'MT' },
    { productCode: 'VG30-PAR', name: 'BITUMEN VG-30 PARSARGAR EMBOSSED', hsnCode: '27132000', productFamily: 'VG_BITUMEN', grade: 'VG-30', packaging: 'EMBOSSED', unit: 'MT' },
    { productCode: 'VG10', name: 'BITUMEN VG-10', hsnCode: '27132000', productFamily: 'VG_BITUMEN', grade: 'VG-10', packaging: 'BULK', unit: 'MT' },
    { productCode: 'PEN-10/20', name: 'BITUMEN 10/20', hsnCode: '27132000', productFamily: 'VG_BITUMEN', grade: '10/20', packaging: 'BULK', unit: 'MT' },
    { productCode: 'PEN-30/40', name: 'BITUMEN 30/40', hsnCode: '27132000', productFamily: 'VG_BITUMEN', grade: '30/40', packaging: 'BULK', unit: 'MT' },
    { productCode: 'BULK-VG30', name: 'BULK BITUMEN VG-30', hsnCode: '27132000', productFamily: 'BULK', grade: 'VG-30', packaging: 'BULK', unit: 'MT' },
    { productCode: 'BULK-VG40', name: 'BULK BITUMEN VG-40', hsnCode: '27132000', productFamily: 'BULK', grade: 'VG-40', packaging: 'BULK', unit: 'MT' },
    { productCode: 'EMU-RS1', name: 'BITUMEN EMULSION RS-1', hsnCode: '27150000', productFamily: 'EMULSION', grade: 'RS-1', packaging: 'BULK', unit: 'KL' },
    { productCode: 'EMU-SS1', name: 'BITUMEN EMULSION SS-1', hsnCode: '27150000', productFamily: 'EMULSION', grade: 'SS-1', packaging: 'BULK', unit: 'KL' },
    { productCode: 'EMU-MS', name: 'BITUMEN EMULSION MS', hsnCode: '27150000', productFamily: 'EMULSION', grade: 'MS', packaging: 'BULK', unit: 'KL' },
    { productCode: 'EMU-COLD', name: 'BITUMEN EMULSION COLDMIX(ALL IN ONE)', hsnCode: '27150000', productFamily: 'EMULSION', grade: 'COLDMIX', packaging: 'BULK', unit: 'KL' },
    { productCode: 'FUEL-OIL', name: 'FUEL OIL', hsnCode: '27101950', productFamily: 'ACCESSORIES', grade: 'STANDARD', packaging: 'BULK', unit: 'KL' },
    { productCode: 'PVC-TANK', name: 'PVC TANK', hsnCode: '392310', productFamily: 'ACCESSORIES', grade: 'STANDARD', packaging: 'UNIT', unit: 'UNIT' }
  ];

  for (const product of bitumenProducts) {
    try {
      await storage.createProductMaster({
        ...product,
        description: `${product.name} - HSN: ${product.hsnCode}`,
        taxRate: product.hsnCode === '27132000' || product.hsnCode === '27150000' ? '5.00' : '18.00',
        densityFactor: product.unit === 'KL' ? '0.95' : null,
        drumsPerMT: product.packaging === 'EMBOSSED' ? 5 : null,
        minOrderQuantity: '1.00',
        isActive: true
      });
    } catch (error) {
      // Product might already exist, skip
      console.log(`Product ${product.productCode} might already exist:`, error.message);
    }
  }
}
