import { 
  users, clients, orders, payments, tasks, ewayBills, clientTracking, 
  salesRates, creditAgreements, purchaseOrders,
  type User, type InsertUser, type Client, type InsertClient,
  type Order, type InsertOrder, type Payment, type InsertPayment,
  type Task, type InsertTask, type EwayBill, type InsertEwayBill,
  type ClientTracking, type InsertClientTracking, type SalesRate, type InsertSalesRate,
  type CreditAgreement, type InsertCreditAgreement, type PurchaseOrder, type InsertPurchaseOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte, count } from "drizzle-orm";

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
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;

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

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: string, updateClient: Partial<InsertClient>): Promise<Client> {
    const [client] = await db.update(clients).set(updateClient).where(eq(clients.id, id)).returning();
    return client;
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
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: string, updateTask: Partial<InsertTask>): Promise<Task> {
    const [task] = await db.update(tasks).set(updateTask).where(eq(tasks.id, id)).returning();
    return task;
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
}

export const storage = new DatabaseStorage();
