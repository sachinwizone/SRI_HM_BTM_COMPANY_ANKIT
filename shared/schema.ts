import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const clientCategoryEnum = pgEnum('client_category', ['ALFA', 'BETA', 'GAMMA', 'DELTA']);
export const taskTypeEnum = pgEnum('task_type', ['ONE_TIME', 'RECURRING']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING_AGREEMENT', 'APPROVED', 'IN_PROGRESS', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'OVERDUE', 'PAID', 'PARTIAL']);
export const trackingStatusEnum = pgEnum('tracking_status', ['LOADING', 'IN_TRANSIT', 'DELIVERED']);
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'OPERATIONS']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default('SALES_EXECUTIVE'),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: clientCategoryEnum("category").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  gstNumber: text("gst_number"),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  paymentTerms: integer("payment_terms").default(30), // days
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Credit Agreements table
export const creditAgreements = pgTable("credit_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  agreementNumber: text("agreement_number").notNull().unique(),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }).notNull(),
  paymentTerms: integer("payment_terms").notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  signedAt: timestamp("signed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  salesPersonId: varchar("sales_person_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default('PENDING_AGREEMENT'),
  description: text("description"),
  creditAgreementRequired: boolean("credit_agreement_required").notNull().default(true),
  creditAgreementId: varchar("credit_agreement_id").references(() => creditAgreements.id),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: text("po_number").notNull().unique(),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  issuedAt: timestamp("issued_at").notNull().default(sql`now()`),
  validUntil: timestamp("valid_until"),
  terms: text("terms"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  orderId: varchar("order_id").references(() => orders.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull().default('PENDING'),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  remindersSent: integer("reminders_sent").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: taskTypeEnum("type").notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  clientId: varchar("client_id").references(() => clients.id),
  orderId: varchar("order_id").references(() => orders.id),
  isCompleted: boolean("is_completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  recurringInterval: integer("recurring_interval"), // days
  nextDueDate: timestamp("next_due_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// E-Way Bills table
export const ewayBills = pgTable("eway_bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ewayNumber: text("eway_number").notNull().unique(),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  vehicleNumber: text("vehicle_number").notNull(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone"),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isExtended: boolean("is_extended").notNull().default(false),
  extensionCount: integer("extension_count").default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Client Tracking table
export const clientTracking = pgTable("client_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  vehicleNumber: text("vehicle_number").notNull(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone"),
  currentLocation: text("current_location"),
  destinationLocation: text("destination_location"),
  distanceRemaining: integer("distance_remaining"), // km
  estimatedArrival: timestamp("estimated_arrival"),
  status: trackingStatusEnum("status").notNull().default('LOADING'),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Sales Rates table
export const salesRates = pgTable("sales_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  salesPersonId: varchar("sales_person_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  volume: decimal("volume", { precision: 15, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  tasks: many(tasks),
  salesRates: many(salesRates),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  orders: many(orders),
  payments: many(payments),
  creditAgreements: many(creditAgreements),
  tasks: many(tasks),
  clientTracking: many(clientTracking),
  salesRates: many(salesRates),
  purchaseOrders: many(purchaseOrders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, {
    fields: [orders.clientId],
    references: [clients.id],
  }),
  salesPerson: one(users, {
    fields: [orders.salesPersonId],
    references: [users.id],
  }),
  creditAgreement: one(creditAgreements, {
    fields: [orders.creditAgreementId],
    references: [creditAgreements.id],
  }),
  payments: many(payments),
  tasks: many(tasks),
  ewayBills: many(ewayBills),
  clientTracking: many(clientTracking),
  purchaseOrders: many(purchaseOrders),
}));

export const creditAgreementsRelations = relations(creditAgreements, ({ one, many }) => ({
  client: one(clients, {
    fields: [creditAgreements.clientId],
    references: [clients.id],
  }),
  orders: many(orders),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  client: one(clients, {
    fields: [payments.clientId],
    references: [clients.id],
  }),
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [tasks.clientId],
    references: [clients.id],
  }),
  order: one(orders, {
    fields: [tasks.orderId],
    references: [orders.id],
  }),
}));

export const ewayBillsRelations = relations(ewayBills, ({ one }) => ({
  order: one(orders, {
    fields: [ewayBills.orderId],
    references: [orders.id],
  }),
}));

export const clientTrackingRelations = relations(clientTracking, ({ one }) => ({
  client: one(clients, {
    fields: [clientTracking.clientId],
    references: [clients.id],
  }),
  order: one(orders, {
    fields: [clientTracking.orderId],
    references: [orders.id],
  }),
}));

export const salesRatesRelations = relations(salesRates, ({ one }) => ({
  client: one(clients, {
    fields: [salesRates.clientId],
    references: [clients.id],
  }),
  salesPerson: one(users, {
    fields: [salesRates.salesPersonId],
    references: [users.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  order: one(orders, {
    fields: [purchaseOrders.orderId],
    references: [orders.id],
  }),
  client: one(clients, {
    fields: [purchaseOrders.clientId],
    references: [clients.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertCreditAgreementSchema = createInsertSchema(creditAgreements).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertEwayBillSchema = createInsertSchema(ewayBills).omit({
  id: true,
  createdAt: true,
});

export const insertClientTrackingSchema = createInsertSchema(clientTracking).omit({
  id: true,
  createdAt: true,
});

export const insertSalesRateSchema = createInsertSchema(salesRates).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertCreditAgreement = z.infer<typeof insertCreditAgreementSchema>;
export type CreditAgreement = typeof creditAgreements.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertEwayBill = z.infer<typeof insertEwayBillSchema>;
export type EwayBill = typeof ewayBills.$inferSelect;

export type InsertClientTracking = z.infer<typeof insertClientTrackingSchema>;
export type ClientTracking = typeof clientTracking.$inferSelect;

export type InsertSalesRate = z.infer<typeof insertSalesRateSchema>;
export type SalesRate = typeof salesRates.$inferSelect;
