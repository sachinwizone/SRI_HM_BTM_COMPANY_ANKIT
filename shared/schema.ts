import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const clientCategoryEnum = pgEnum('client_category', ['ALFA', 'BETA', 'GAMMA', 'DELTA']);
export const companyTypeEnum = pgEnum('company_type', ['PVT_LTD', 'PARTNERSHIP', 'PROPRIETOR', 'GOVT', 'OTHERS']);
export const communicationPreferenceEnum = pgEnum('communication_preference', ['EMAIL', 'WHATSAPP', 'PHONE', 'SMS']);
export const unloadingFacilityEnum = pgEnum('unloading_facility', ['PUMP', 'CRANE', 'MANUAL', 'OTHERS']);
export const bankInterestEnum = pgEnum('bank_interest', ['FROM_DAY_1', 'FROM_DUE_DATE']);
export const taskTypeEnum = pgEnum('task_type', ['ONE_TIME', 'RECURRING']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING_AGREEMENT', 'APPROVED', 'IN_PROGRESS', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'OVERDUE', 'PAID', 'PARTIAL']);
export const trackingStatusEnum = pgEnum('tracking_status', ['LOADING', 'IN_TRANSIT', 'DELIVERED']);
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'OPERATIONS']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['RECEIVING', 'OK', 'APPROVED', 'DELIVERED']);

// Users table (Simple authentication without Replit)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default('SALES_EXECUTIVE'),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// User Sessions table for login management
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Clients table - Match existing database structure
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: clientCategoryEnum("category").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  gst_number: text("gst_number"),
  credit_limit: decimal("credit_limit", { precision: 15, scale: 2 }),
  payment_terms: integer("payment_terms").default(30),
  contact_person: text("contact_person"),
  tally_guid: text("tally_guid"),
  last_synced: timestamp("last_synced"),
  interest_percent: decimal("interest_percent", { precision: 5, scale: 2 }),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
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

// Shipping Addresses table (Multi-entry for each client)
export const shippingAddresses = pgTable("shipping_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull(),
  pincode: text("pincode").notNull(),
  contactPersonName: text("contact_person_name"),
  contactPersonMobile: text("contact_person_mobile"),
  deliveryAddressName: text("delivery_address_name"), // Project Site Name
  googleLatitude: decimal("google_latitude", { precision: 10, scale: 8 }),
  googleLongitude: decimal("google_longitude", { precision: 11, scale: 8 }),
  deliveryWindowFrom: text("delivery_window_from"), // Time format: "09:00"
  deliveryWindowTo: text("delivery_window_to"), // Time format: "17:00"
  unloadingFacility: unloadingFacilityEnum("unloading_facility"),
  isActive: boolean("is_active").default(true),
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
  shippingAddresses: many(shippingAddresses),
}));

export const shippingAddressesRelations = relations(shippingAddresses, ({ one }) => ({
  client: one(clients, {
    fields: [shippingAddresses.clientId],
    references: [clients.id],
  }),
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
  updatedAt: true,
  lastLogin: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

// Login schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  created_at: true,
});

export const insertShippingAddressSchema = createInsertSchema(shippingAddresses).omit({
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
}).extend({
  dueDate: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(), 
  nextDueDate: z.string().optional().nullable()
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
export type UserSession = typeof userSessions.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertShippingAddress = z.infer<typeof insertShippingAddressSchema>;
export type ShippingAddress = typeof shippingAddresses.$inferSelect;

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

// Sales table
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().default(sql`now()`),
  salesOrderNumber: text("sales_order_number").notNull().unique(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  vehicleNumber: text("vehicle_number").notNull(),
  location: text("location").notNull(),
  transporterId: varchar("transporter_id").notNull().references(() => transporters.id),
  grossWeight: decimal("gross_weight", { precision: 10, scale: 2 }).notNull(),
  tareWeight: decimal("tare_weight", { precision: 10, scale: 2 }).notNull(), // stair weight
  netWeight: decimal("net_weight", { precision: 10, scale: 2 }).notNull(), // grossWeight - tareWeight
  entireWeight: decimal("entire_weight", { precision: 10, scale: 2 }).notNull(),
  drumQuantity: integer("drum_quantity").notNull(),
  perDrumWeight: decimal("per_drum_weight", { precision: 10, scale: 2 }).notNull(),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  basicRate: decimal("basic_rate", { precision: 15, scale: 2 }).notNull(),
  gstPercent: decimal("gst_percent", { precision: 5, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  basicRatePurchase: decimal("basic_rate_purchase", { precision: 15, scale: 2 }).notNull(),
  productId: varchar("product_id").notNull().references(() => products.id),
  salespersonId: varchar("salesperson_id").notNull().references(() => users.id),
  deliveryStatus: deliveryStatusEnum("delivery_status").notNull().default('RECEIVING'),
  deliveryChallanSigned: boolean("delivery_challan_signed").notNull().default(false),
  deliveryChallanSignedAt: timestamp("delivery_challan_signed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Sales insert schema
export const insertSalesSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.string(),
  deliveryChallanSignedAt: z.string().optional().nullable()
});

// Sales relations
export const salesRelations = relations(sales, ({ one }) => ({
  salesperson: one(users, {
    fields: [sales.salespersonId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [sales.clientId],
    references: [clients.id],
  }),
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
  transporter: one(transporters, {
    fields: [sales.transporterId],
    references: [transporters.id],
  }),
}));

// Sales types
export type InsertSales = z.infer<typeof insertSalesSchema>;
export type Sales = typeof sales.$inferSelect;

// Number Series table (Admin controlled)
export const numberSeries = pgTable("number_series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seriesType: text("series_type").notNull(), // 'SALES_ORDER' or 'INVOICE'
  prefix: text("prefix").notNull(), // e.g., 'SO', 'INV', 'ABC'
  currentNumber: integer("current_number").notNull().default(1),
  numberLength: integer("number_length").notNull().default(4), // padding zeros
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Transporters table
export const transporters = pgTable("transporters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  vehicleCapacity: text("vehicle_capacity"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  category: text("category"),
  description: text("description"),
  hsn_code: text("hsn_code"), // HSN/SAC code for GST
  unit: text("unit").notNull().default('KG'), // KG, LTR, PCS, etc.
  currentPrice: decimal("current_price", { precision: 15, scale: 2 }),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).notNull().default('18.00'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertNumberSeriesSchema = createInsertSchema(numberSeries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransporterSchema = createInsertSchema(transporters).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertNumberSeries = z.infer<typeof insertNumberSeriesSchema>;
export type NumberSeries = typeof numberSeries.$inferSelect;

export type InsertTransporter = z.infer<typeof insertTransporterSchema>;
export type Transporter = typeof transporters.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

