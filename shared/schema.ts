import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const clientCategoryEnum = pgEnum('client_category', ['ALFA', 'BETA', 'GAMMA', 'DELTA', 'ALPHA']);
export const companyTypeEnum = pgEnum('company_type', ['PVT_LTD', 'PARTNERSHIP', 'PROPRIETOR', 'GOVT', 'OTHERS']);
export const communicationPreferenceEnum = pgEnum('communication_preference', ['EMAIL', 'WHATSAPP', 'PHONE', 'SMS']);
export const unloadingFacilityEnum = pgEnum('unloading_facility', ['PUMP', 'CRANE', 'MANUAL', 'OTHERS']);
export const followUpStatusEnum = pgEnum("follow_up_status", ["PENDING", "COMPLETED", "CANCELLED"]);
export const bankInterestEnum = pgEnum('bank_interest', ['FROM_DAY_1', 'FROM_DUE_DATE']);
export const taskTypeEnum = pgEnum('task_type', ['ONE_TIME', 'RECURRING']);
export const taskPriorityEnum = pgEnum('task_priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusEnum = pgEnum('task_status', ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING_AGREEMENT', 'APPROVED', 'IN_PROGRESS', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'OVERDUE', 'PAID', 'PARTIAL']);
export const trackingStatusEnum = pgEnum('tracking_status', ['LOADING', 'IN_TRANSIT', 'DELIVERED']);
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'OPERATIONS']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['RECEIVING', 'OK', 'APPROVED', 'DELIVERED']);

// Sales Operations Enums
export const leadStatusEnum = pgEnum('lead_status', ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']);
export const leadSourceEnum = pgEnum('lead_source', ['WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'TRADE_SHOW', 'ADVERTISEMENT', 'COLD_CALL', 'OTHERS']);
export const opportunityStageEnum = pgEnum('opportunity_stage', ['QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']);
export const quotationStatusEnum = pgEnum('quotation_status', ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'REVISED', 'ACCEPTED', 'REJECTED', 'EXPIRED']);
export const salesOrderStatusEnum = pgEnum('sales_order_status', ['DRAFT', 'PENDING_CREDIT_CHECK', 'APPROVED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']);
export const deliveryPlanStatusEnum = pgEnum('delivery_plan_status', ['PLANNED', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']);
export const dispatchStatusEnum = pgEnum('dispatch_status', ['PENDING', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED']);
export const creditCheckStatusEnum = pgEnum('credit_check_status', ['PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_GUARANTEE']);
export const approvalStatusEnum = pgEnum('approval_status', ['PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_REVISION']);
export const assignmentTypeEnum = pgEnum('assignment_type', ['PRIMARY', 'SECONDARY', 'BACKUP']);

// Users table (Enhanced for ERP system)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  employeeCode: text("employee_code").unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  mobileNumber: text("mobile_number"),
  designation: text("designation"),
  department: text("department"),
  role: userRoleEnum("role").notNull().default('EMPLOYEE'),
  approvalLimitAmount: decimal("approval_limit_amount", { precision: 15, scale: 2 }),
  workLocation: text("work_location"),
  branchId: varchar("branch_id"), // Will reference branches table
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

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Company & Compliance
  name: text("name").notNull(),
  category: clientCategoryEnum("category").notNull(),
  billingAddressLine: text("billing_address_line"),
  billingCity: text("billing_city"),
  billingPincode: text("billing_pincode"),
  billingState: text("billing_state"),
  billingCountry: text("billing_country").default('India'),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  msmeNumber: text("msme_number"),
  incorporationCertNumber: text("incorporation_cert_number"),
  incorporationDate: timestamp("incorporation_date"),
  companyType: companyTypeEnum("company_type"),
  
  // Primary Contact Details
  contactPersonName: text("contact_person_name"),
  mobileNumber: text("mobile_number"),
  email: text("email"),
  communicationPreferences: text("communication_preferences").array(), // JSON array of preferences
  
  // Commercial & Finance
  paymentTerms: integer("payment_terms").default(30), // days
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  bankInterestApplicable: bankInterestEnum("bank_interest_applicable"),
  interestPercent: decimal("interest_percent", { precision: 5, scale: 2 }),
  poRequired: boolean("po_required").default(false),
  invoicingEmails: text("invoicing_emails").array(), // JSON array of emails
  
  // Documents Upload Status
  gstCertificateUploaded: boolean("gst_certificate_uploaded").default(false),
  panCopyUploaded: boolean("pan_copy_uploaded").default(false),
  securityChequeUploaded: boolean("security_cheque_uploaded").default(false),
  aadharCardUploaded: boolean("aadhar_card_uploaded").default(false),
  agreementUploaded: boolean("agreement_uploaded").default(false),
  poRateContractUploaded: boolean("po_rate_contract_uploaded").default(false),
  
  // Sales Assignment Fields
  primarySalesPersonId: varchar("primary_sales_person_id").references(() => users.id),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
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

// Client Assignments table
export const clientAssignments = pgTable("client_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  salesPersonId: varchar("sales_person_id").notNull().references(() => users.id),
  assignmentType: assignmentTypeEnum("assignment_type").notNull().default('PRIMARY'),
  assignedDate: timestamp("assigned_date").notNull().default(sql`now()`),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
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
  priority: taskPriorityEnum("priority").notNull().default('MEDIUM'),
  status: taskStatusEnum("status").notNull().default('TODO'),
  assignedTo: varchar("assigned_to").references(() => users.id),
  clientId: varchar("client_id").references(() => clients.id),
  orderId: varchar("order_id").references(() => orders.id),
  mobileNumber: text("mobile_number"), // Mobile number for WhatsApp redirection
  isCompleted: boolean("is_completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  recurringInterval: integer("recurring_interval"), // days
  nextDueDate: timestamp("next_due_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Follow-ups table
export const followUps = pgTable("follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  assignedUserId: varchar("assigned_user_id").notNull().references(() => users.id),
  followUpDate: timestamp("follow_up_date").notNull(),
  remarks: text("remarks").notNull(),
  status: followUpStatusEnum("status").notNull().default('PENDING'),
  completedAt: timestamp("completed_at"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
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
  googleLocation: text("google_location"), // Combined location field or Google Maps link
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
  clientAssignments: many(clientAssignments),
  assignedClientAssignments: many(clientAssignments, {
    relationName: "assignedBy"
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  orders: many(orders),
  payments: many(payments),
  creditAgreements: many(creditAgreements),
  tasks: many(tasks),
  clientTracking: many(clientTracking),
  salesRates: many(salesRates),
  purchaseOrders: many(purchaseOrders),
  shippingAddresses: many(shippingAddresses),
  clientAssignments: many(clientAssignments),
  primarySalesPerson: one(users, {
    fields: [clients.primarySalesPersonId],
    references: [users.id],
  }),
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

export const clientAssignmentsRelations = relations(clientAssignments, ({ one }) => ({
  client: one(clients, {
    fields: [clientAssignments.clientId],
    references: [clients.id],
  }),
  salesPerson: one(users, {
    fields: [clientAssignments.salesPersonId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [clientAssignments.assignedBy],
    references: [users.id],
    relationName: "assignedBy"
  }),
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

export const tasksRelations = relations(tasks, ({ one, many }) => ({
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
  followUps: many(followUps),
}));

export const followUpsRelations = relations(followUps, ({ one }) => ({
  task: one(tasks, {
    fields: [followUps.taskId],
    references: [tasks.id],
  }),
  assignedUser: one(users, {
    fields: [followUps.assignedUserId],
    references: [users.id],
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
  createdAt: true,
  updatedAt: true,
}).extend({
  incorporationDate: z.union([z.string(), z.date(), z.null()]).optional().nullable().transform(val => {
    if (!val || val === "") return null;
    if (typeof val === "string") {
      try {
        return new Date(val);
      } catch {
        return null;
      }
    }
    return val;
  }),
  creditLimit: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform(val => {
    if (!val || val === "") return null;
    if (typeof val === "string") {
      const num = parseFloat(val);
      return isNaN(num) ? null : num.toString();
    }
    return val;
  }),
  interestPercent: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform(val => {
    if (!val || val === "") return null;
    if (typeof val === "string") {
      const num = parseFloat(val);
      return isNaN(num) ? null : num.toString();
    }
    return val;
  }),
});

export const insertShippingAddressSchema = createInsertSchema(shippingAddresses).omit({
  id: true,
  createdAt: true,
});

export const insertClientAssignmentSchema = createInsertSchema(clientAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  followUpDate: z.string(),
  nextFollowUpDate: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
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
export type InsertClientAssignment = z.infer<typeof insertClientAssignmentSchema>;
export type ClientAssignment = typeof clientAssignments.$inferSelect;

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

export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type FollowUp = typeof followUps.$inferSelect;

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
  salespersonId: varchar("salesperson_id").references(() => users.id),
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

// ==================== ERP EXTENSION TABLES ====================

// Company Profile table
export const companyProfile = pgTable("company_profile", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // 1) Basic Information
  legalName: text("legal_name").notNull(),
  tradeName: text("trade_name"),
  entityType: text("entity_type").notNull(), // P Ltd / LLP / Proprietorship / Partnership / Others
  gstin: varchar("gstin", { length: 15 }),
  gstinState: text("gstin_state"), // Auto-derived from GSTIN
  pan: varchar("pan", { length: 10 }),
  cinRegistrationNumber: text("cin_registration_number"), // Only for P Ltd
  yearOfIncorporation: integer("year_of_incorporation"), // Only for P Ltd
  
  // 2) Addresses - Registered Office
  registeredAddressLine1: text("registered_address_line1").notNull(),
  registeredAddressLine2: text("registered_address_line2"),
  registeredCity: text("registered_city").notNull(),
  registeredState: text("registered_state").notNull(),
  registeredPincode: varchar("registered_pincode", { length: 6 }).notNull(),
  
  // Corporate Office (Optional)
  corporateAddressLine1: text("corporate_address_line1"),
  corporateAddressLine2: text("corporate_address_line2"),
  corporateCity: text("corporate_city"),
  corporateState: text("corporate_state"),
  corporatePincode: varchar("corporate_pincode", { length: 6 }),
  
  // 3) Contacts - Primary Contact Person
  primaryContactName: text("primary_contact_name").notNull(),
  primaryContactDesignation: text("primary_contact_designation"),
  primaryContactMobile: varchar("primary_contact_mobile", { length: 10 }).notNull(),
  primaryContactEmail: text("primary_contact_email").notNull(),
  
  // Accounts Contact
  accountsContactName: text("accounts_contact_name"),
  accountsContactMobile: varchar("accounts_contact_mobile", { length: 10 }),
  accountsContactEmail: text("accounts_contact_email"),
  
  // 4) Banking & Finance
  bankName: text("bank_name"),
  branchName: text("branch_name"),
  accountName: text("account_name"),
  accountNumber: text("account_number"),
  ifscCode: varchar("ifsc_code", { length: 11 }),
  
  // 5) Business Details
  defaultInvoicePrefix: text("default_invoice_prefix").default("INV"),
  officeWorkingHours: text("office_working_hours"), // Format: "09:00-18:00"
  godownWorkingHours: text("godown_working_hours"), // Format: "08:00-20:00"
  
  // 6) Digital Settings
  companyWebsiteUrl: text("company_website_url"),
  companyLogo: text("company_logo"), // File path/URL
  whatsappBusinessNumber: varchar("whatsapp_business_number", { length: 10 }),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Branches/Depots table
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").unique().notNull(),
  addressLine: text("address_line"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  contactPersonName: text("contact_person_name"),
  contactPersonMobile: text("contact_person_mobile"),
  contactPersonEmail: text("contact_person_email"),
  storageType: text("storage_type"), // BULK_TANK, DRUMS, BOTH
  bulkCapacityKL: decimal("bulk_capacity_kl", { precision: 10, scale: 2 }),
  drumCapacityCount: integer("drum_capacity_count"),
  workingHours: text("working_hours"),
  holidayCalendar: text("holiday_calendar").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Enhanced Product Master for Bitumen/Emulsion
export const productMaster = pgTable("product_master", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productCode: text("product_code").unique().notNull(),
  productFamily: text("product_family").notNull(), // VG_BITUMEN, EMULSION, BULK, ACCESSORIES
  grade: text("grade"), // VG-10, VG-30, CRS, SS, RS etc
  name: text("name").notNull(),
  description: text("description"),
  packaging: text("packaging").notNull(), // BULK, DRUM, EMBOSSED, ANY
  unit: text("unit").notNull().default('MT'), // MT, KL, DRUM, UNIT
  densityFactor: decimal("density_factor", { precision: 5, scale: 3 }), // MT to KL conversion
  drumsPerMT: integer("drums_per_mt"), // Drums to MT conversion
  hsnCode: text("hsn_code"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('18.00'),
  batchTracking: boolean("batch_tracking").default(false),
  shelfLifeDays: integer("shelf_life_days"),
  qcParameters: text("qc_parameters").array(), // JSON array of QC params
  minOrderQuantity: decimal("min_order_quantity", { precision: 10, scale: 2 }),
  maxOrderQuantity: decimal("max_order_quantity", { precision: 10, scale: 2 }),
  reorderLevel: decimal("reorder_level", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Suppliers Master
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierCode: text("supplier_code").unique().notNull(),
  name: text("name").notNull(),
  gstin: text("gstin"),
  pan: text("pan"),
  addressLine: text("address_line"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  contactPersonName: text("contact_person_name"),
  contactPersonMobile: text("contact_person_mobile"),
  contactPersonEmail: text("contact_person_email"),
  paymentTerms: integer("payment_terms").default(30), // days
  productCategories: text("product_categories").array(), // VG, EMULSION, ACCESSORIES
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Bank Master
export const banks = pgTable("banks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bankName: text("bank_name").notNull(),
  branchName: text("branch_name"),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  upiId: text("upi_id"),
  paymentNarrationTemplate: text("payment_narration_template"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Vehicle Master
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationNumber: text("registration_number").unique().notNull(),
  vehicleType: text("vehicle_type"), // BULK_TANKER, DRUM_TRUCK
  capacityKL: decimal("capacity_kl", { precision: 8, scale: 2 }),
  drumCapacity: integer("drum_capacity"),
  transporterId: varchar("transporter_id").references(() => transporters.id),
  driverName: text("driver_name"),
  driverMobile: text("driver_mobile"),
  driverLicense: text("driver_license"),
  fitnessExpiryDate: timestamp("fitness_expiry_date"),
  permitExpiryDate: timestamp("permit_expiry_date"),
  insuranceExpiryDate: timestamp("insurance_expiry_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Godown/Warehouse Addresses (Multiple)
export const godownAddresses = pgTable("godown_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyProfileId: varchar("company_profile_id").references(() => companyProfile.id),
  nickname: text("nickname").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: varchar("pincode", { length: 6 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Plant Addresses (Multiple) (Optional)
export const plantAddresses = pgTable("plant_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyProfileId: varchar("company_profile_id").references(() => companyProfile.id),
  nickname: text("nickname").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: varchar("pincode", { length: 6 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// ==================== SALES OPERATIONS TABLES ====================

// Leads & CRM
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadNumber: text("lead_number").notNull().unique(),
  companyName: text("company_name").notNull(),
  contactPersonName: text("contact_person_name").notNull(),
  mobileNumber: text("mobile_number"),
  email: text("email"),
  leadSource: leadSourceEnum("lead_source").notNull(),
  leadStatus: leadStatusEnum("lead_status").notNull().default('NEW'),
  interestedProducts: text("interested_products").array(),
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }),
  expectedCloseDate: timestamp("expected_close_date"),
  notes: text("notes"),
  assignedToUserId: varchar("assigned_to_user_id").references(() => users.id),
  clientId: varchar("client_id").references(() => clients.id), // Converted to client when qualified
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Opportunities (from qualified leads)
export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityNumber: text("opportunity_number").notNull().unique(),
  leadId: varchar("lead_id").references(() => leads.id),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  stage: opportunityStageEnum("stage").notNull().default('QUALIFICATION'),
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }).notNull(),
  probability: integer("probability").notNull().default(50), // Percentage
  expectedCloseDate: timestamp("expected_close_date").notNull(),
  products: text("products").array(), // Array of product IDs/names
  requirements: text("requirements"),
  competitorInfo: text("competitor_info"),
  assignedToUserId: varchar("assigned_to_user_id").notNull().references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Quotations with Multi-level Approvals
export const quotations = pgTable("quotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationNumber: text("quotation_number").notNull().unique(),
  opportunityId: varchar("opportunity_id").references(() => opportunities.id),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  quotationDate: timestamp("quotation_date").notNull().default(sql`now()`),
  validUntil: timestamp("valid_until").notNull(),
  status: quotationStatusEnum("status").notNull().default('DRAFT'),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default('0'),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default('0'),
  grandTotal: decimal("grand_total", { precision: 15, scale: 2 }).notNull(),
  paymentTerms: text("payment_terms"),
  deliveryTerms: text("delivery_terms"),
  specialInstructions: text("special_instructions"),
  preparedByUserId: varchar("prepared_by_user_id").notNull().references(() => users.id),
  approvedByUserId: varchar("approved_by_user_id").references(() => users.id),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default('PENDING'),
  approvalComments: text("approval_comments"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Quotation Line Items
export const quotationItems = pgTable("quotation_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationId: varchar("quotation_id").notNull().references(() => quotations.id),
  productId: varchar("product_id").notNull().references(() => productMaster.id),
  description: text("description"),
  quantity: decimal("quantity", { precision: 15, scale: 3 }).notNull(),
  unit: text("unit").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default('0'),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default('0'),
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Sales Orders with Credit Checks
export const salesOrders = pgTable("sales_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  quotationId: varchar("quotation_id").references(() => quotations.id),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  orderDate: timestamp("order_date").notNull().default(sql`now()`),
  expectedDeliveryDate: timestamp("expected_delivery_date").notNull(),
  status: salesOrderStatusEnum("status").notNull().default('DRAFT'),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  advanceReceived: decimal("advance_received", { precision: 15, scale: 2 }).default('0'),
  creditCheckStatus: creditCheckStatusEnum("credit_check_status").notNull().default('PENDING'),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  paymentTerms: text("payment_terms"),
  deliveryAddress: text("delivery_address"),
  specialInstructions: text("special_instructions"),
  salesPersonId: varchar("sales_person_id").notNull().references(() => users.id),
  approvedByUserId: varchar("approved_by_user_id").references(() => users.id),
  branchId: varchar("branch_id").references(() => branches.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Sales Order Line Items
export const salesOrderItems = pgTable("sales_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salesOrderId: varchar("sales_order_id").notNull().references(() => salesOrders.id),
  productId: varchar("product_id").notNull().references(() => productMaster.id),
  description: text("description"),
  quantity: decimal("quantity", { precision: 15, scale: 3 }).notNull(),
  unit: text("unit").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
  allocatedQuantity: decimal("allocated_quantity", { precision: 15, scale: 3 }).default('0'),
  deliveredQuantity: decimal("delivered_quantity", { precision: 15, scale: 3 }).default('0'),
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Delivery Planning with Route Optimization
export const deliveryPlans = pgTable("delivery_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planNumber: text("plan_number").notNull().unique(),
  salesOrderId: varchar("sales_order_id").notNull().references(() => salesOrders.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  driverId: varchar("driver_id").references(() => users.id),
  plannedDate: timestamp("planned_date").notNull(),
  estimatedDepartureTime: timestamp("estimated_departure_time"),
  estimatedArrivalTime: timestamp("estimated_arrival_time"),
  actualDepartureTime: timestamp("actual_departure_time"),
  actualArrivalTime: timestamp("actual_arrival_time"),
  status: deliveryPlanStatusEnum("status").notNull().default('PLANNED'),
  route: text("route"), // JSON string for route waypoints
  estimatedDistance: decimal("estimated_distance", { precision: 10, scale: 2 }),
  estimatedFuelCost: decimal("estimated_fuel_cost", { precision: 15, scale: 2 }),
  loadingPoint: text("loading_point"),
  deliveryPoint: text("delivery_point"),
  specialInstructions: text("special_instructions"),
  createdByUserId: varchar("created_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Dispatch Management with Real-time Tracking
export const dispatches = pgTable("dispatches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dispatchNumber: text("dispatch_number").notNull().unique(),
  deliveryPlanId: varchar("delivery_plan_id").notNull().references(() => deliveryPlans.id),
  salesOrderId: varchar("sales_order_id").notNull().references(() => salesOrders.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  driverId: varchar("driver_id").notNull().references(() => users.id),
  status: dispatchStatusEnum("status").notNull().default('PENDING'),
  dispatchDate: timestamp("dispatch_date").notNull().default(sql`now()`),
  loadingStartTime: timestamp("loading_start_time"),
  loadingEndTime: timestamp("loading_end_time"),
  departureTime: timestamp("departure_time"),
  arrivalTime: timestamp("arrival_time"),
  deliveryCompletionTime: timestamp("delivery_completion_time"),
  currentLocation: text("current_location"), // JSON lat/lng
  deliveryChallanNumber: text("delivery_challan_number"),
  ewayBillNumber: text("eway_bill_number"),
  vehicleNumber: text("vehicle_number").notNull(),
  driverMobile: text("driver_mobile"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Delivery Challans
export const deliveryChallans = pgTable("delivery_challans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challanNumber: text("challan_number").notNull().unique(),
  dispatchId: varchar("dispatch_id").notNull().references(() => dispatches.id),
  salesOrderId: varchar("sales_order_id").notNull().references(() => salesOrders.id),
  challanDate: timestamp("challan_date").notNull().default(sql`now()`),
  customerName: text("customer_name").notNull(),
  customerAddress: text("customer_address").notNull(),
  vehicleNumber: text("vehicle_number").notNull(),
  driverName: text("driver_name").notNull(),
  totalQuantity: decimal("total_quantity", { precision: 15, scale: 3 }).notNull(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull(),
  remarks: text("remarks"),
  receivedByName: text("received_by_name"),
  receivedBySignature: text("received_by_signature"), // Base64 image or file path
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas for new tables
export const insertCompanyProfileSchema = createInsertSchema(companyProfile).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductMasterSchema = createInsertSchema(productMaster).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBankSchema = createInsertSchema(banks).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGodownAddressSchema = createInsertSchema(godownAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlantAddressSchema = createInsertSchema(plantAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new tables
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type CompanyProfile = typeof companyProfile.$inferSelect;

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branches.$inferSelect;

export type InsertProductMaster = z.infer<typeof insertProductMasterSchema>;
export type ProductMaster = typeof productMaster.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertBank = z.infer<typeof insertBankSchema>;
export type Bank = typeof banks.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertGodownAddress = z.infer<typeof insertGodownAddressSchema>;
export type GodownAddress = typeof godownAddresses.$inferSelect;

export type InsertPlantAddress = z.infer<typeof insertPlantAddressSchema>;
export type PlantAddress = typeof plantAddresses.$inferSelect;

// Sales Operations Insert Schemas
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expectedCloseDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  estimatedValue: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return typeof val === "string" ? parseFloat(val) : val;
  }),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuotationItemSchema = createInsertSchema(quotationItems).omit({
  id: true,
  createdAt: true,
});

export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItems).omit({
  id: true,
  createdAt: true,
});

export const insertDeliveryPlanSchema = createInsertSchema(deliveryPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDispatchSchema = createInsertSchema(dispatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryChallanSchema = createInsertSchema(deliveryChallans).omit({
  id: true,
  createdAt: true,
});

// Sales Operations Types
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

export type InsertQuotationItem = z.infer<typeof insertQuotationItemSchema>;
export type QuotationItem = typeof quotationItems.$inferSelect;

export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;
export type SalesOrder = typeof salesOrders.$inferSelect;

export type InsertSalesOrderItem = z.infer<typeof insertSalesOrderItemSchema>;
export type SalesOrderItem = typeof salesOrderItems.$inferSelect;

export type InsertDeliveryPlan = z.infer<typeof insertDeliveryPlanSchema>;
export type DeliveryPlan = typeof deliveryPlans.$inferSelect;

export type InsertDispatch = z.infer<typeof insertDispatchSchema>;
export type Dispatch = typeof dispatches.$inferSelect;

export type InsertDeliveryChallan = z.infer<typeof insertDeliveryChallanSchema>;
export type DeliveryChallan = typeof deliveryChallans.$inferSelect;

