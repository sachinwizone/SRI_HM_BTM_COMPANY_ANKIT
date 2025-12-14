import { db } from "./db.js";
import { users, clients, orders, tasks } from "./schema-sqlite.js";
import { eq, desc } from "drizzle-orm";

export class SimpleStorage {
  // Dashboard stats
  static async getDashboardStats(userId?: string) {
    const [clientCount] = await db.select({ count: users.id }).from(clients);
    const [orderCount] = await db.select({ count: users.id }).from(orders);
    const [taskCount] = await db.select({ count: users.id }).from(tasks);
    
    return {
      totalClients: clientCount?.count || 0,
      totalOrders: orderCount?.count || 0,
      totalTasks: taskCount?.count || 0,
      activeUsers: 1,
    };
  }

  // Client methods
  static async getAllClients() {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  static async getClient(id: string) {
    const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return client || null;
  }

  static async createClient(clientData: any) {
    const [client] = await db.insert(clients).values({
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();
    
    return client;
  }

  static async updateClient(id: string, updates: any) {
    const [client] = await db.update(clients)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(clients.id, id))
      .returning();
    
    return client || null;
  }

  static async deleteClient(id: string) {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Order methods
  static async getAllOrders() {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  static async getOrder(id: string) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return order || null;
  }

  static async createOrder(orderData: any) {
    const [order] = await db.insert(orders).values({
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();
    
    return order;
  }

  static async updateOrder(id: string, updates: any) {
    const [order] = await db.update(orders)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();
    
    return order || null;
  }

  // Task methods
  static async getAllTasks() {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  static async getTasksByUser(userId: string) {
    return await db.select().from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.createdAt));
  }

  static async createTask(taskData: any) {
    const [task] = await db.insert(tasks).values({
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();
    
    return task;
  }

  static async updateTask(id: string, updates: any) {
    const [task] = await db.update(tasks)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(tasks.id, id))
      .returning();
    
    return task || null;
  }

  static async deleteTask(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Placeholder methods for compatibility
  static async getFilteredClients(filters: any) {
    return await this.getAllClients();
  }

  static async getClientCategoryStats(userId?: string) {
    return {
      ALFA: 0,
      BETA: 0,
      GAMMA: 0,
      DELTA: 0,
    };
  }
}