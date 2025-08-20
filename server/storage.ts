import { 
  users, clients, orders, payments, tasks, ewayBills, clientTracking, 
  salesRates, creditAgreements, purchaseOrders, sales, numberSeries,
  transporters, products, shippingAddresses, followUps,
  type User, type InsertUser, type Client, type InsertClient,
  type Order, type InsertOrder, type Payment, type InsertPayment,
  type Task, type InsertTask, type EwayBill, type InsertEwayBill,
  type ClientTracking, type InsertClientTracking, type SalesRate, type InsertSalesRate,
  type CreditAgreement, type InsertCreditAgreement, type PurchaseOrder, type InsertPurchaseOrder,
  type Sales, type InsertSales, type NumberSeries, type InsertNumberSeries,
  type Transporter, type InsertTransporter, type Product, type InsertProduct,
  type ShippingAddress, type InsertShippingAddress, type FollowUp, type InsertFollowUp
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
  getFilteredClients(filters: { category?: string; search?: string; dateFrom?: string; dateTo?: string }): Promise<Client[]>;
  getClientCategoryStats(): Promise<{ ALFA: number; BETA: number; GAMMA: number; DELTA: number; total: number }>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  // Shipping Addresses
  getShippingAddress(id: string): Promise<ShippingAddress | undefined>;
  getShippingAddressesByClient(clientId: string): Promise<ShippingAddress[]>;
  createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress>;
  updateShippingAddress(id: string, address: Partial<InsertShippingAddress>): Promise<ShippingAddress>;
  deleteShippingAddress(id: string): Promise<void>;

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

  async getFilteredClients(filters: { category?: string; search?: string; dateFrom?: string; dateTo?: string }): Promise<Client[]> {
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

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(asc(clients.name));
  }

  async getClientCategoryStats(): Promise<{ ALFA: number; BETA: number; GAMMA: number; DELTA: number; total: number }> {
    const results = await db.select({
      category: clients.category,
      count: sql<number>`count(*)::int`
    }).from(clients).groupBy(clients.category);

    const stats = { ALFA: 0, BETA: 0, GAMMA: 0, DELTA: 0, total: 0 };
    
    results.forEach(result => {
      if (result.category in stats) {
        stats[result.category as keyof typeof stats] = result.count;
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
  async getDashboardStats() {
    const [pendingPaymentsResult] = await db.select({
      total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`
    }).from(payments).where(eq(payments.status, 'PENDING'));

    const [activeClientsResult] = await db.select({
      count: count()
    }).from(clients);

    const [openTasksResult] = await db.select({
      count: count()
    }).from(tasks).where(eq(tasks.isCompleted, false));

    const [inTransitResult] = await db.select({
      count: count()
    }).from(clientTracking).where(eq(clientTracking.status, 'IN_TRANSIT'));

    const categoryStats = await db.select({
      category: clients.category,
      count: count()
    }).from(clients).groupBy(clients.category);

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
}

export const storage = new DatabaseStorage();
