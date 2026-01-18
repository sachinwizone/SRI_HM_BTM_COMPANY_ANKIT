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
export const leadFollowUpTypeEnum = pgEnum("lead_follow_up_type", ["CALL", "EMAIL", "MEETING", "DEMO", "PROPOSAL", "FOLLOW_UP"]);
export const leadFollowUpPriorityEnum = pgEnum("lead_follow_up_priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]);
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
export const supplierTypeEnum = pgEnum('supplier_type', ['MANUFACTURER', 'DISTRIBUTOR', 'SERVICE_PROVIDER', 'CONTRACTOR', 'VENDOR', 'OTHERS']);

// Tour Advance (TA) Module Enums
export const travelModeEnum = pgEnum('travel_mode', ['AIR', 'TRAIN', 'CAR', 'BUS', 'OTHER']);
export const journeyPurposeEnum = pgEnum('journey_purpose', ['CLIENT_VISIT', 'PLANT_VISIT', 'PARTY_MEETING', 'DEPARTMENT_VISIT', 'OTHERS']);
export const taStatusEnum = pgEnum('ta_status', ['DRAFT', 'SUBMITTED', 'RECOMMENDED', 'APPROVED', 'REJECTED', 'PROCESSING', 'SETTLED']);

// Permissions System Enums
export const moduleEnum = pgEnum('module', [
  'DASHBOARD',
  'CLIENT_MANAGEMENT', 
  'CLIENT_TRACKING',
  'ORDER_WORKFLOW',
  'SALES',
  'SALES_OPERATIONS',
  'PURCHASE_ORDERS',
  'TASK_MANAGEMENT',
  'FOLLOW_UP_HUB',
  'LEAD_FOLLOW_UP_HUB',
  'CREDIT_PAYMENTS',
  'CREDIT_AGREEMENTS',
  'EWAY_BILLS',
  'SALES_RATES',
  'TEAM_PERFORMANCE',
  'TOUR_ADVANCE',
  'TA_REPORTS',
  'MASTER_DATA',
  'USER_MANAGEMENT',
  'PRICING'
]);
export const actionEnum = pgEnum('action', ['VIEW', 'ADD', 'EDIT', 'DELETE']);

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

// User Permissions table for granular access control
export const userPermissions = pgTable("user_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  module: moduleEnum("module").notNull(),
  action: actionEnum("action").notNull(),
  granted: boolean("granted").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  // Ensure unique permissions per user-module-action combination
  uniqueUserModuleAction: sql`UNIQUE(${table.userId}, ${table.module}, ${table.action})`
}));

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
  
  // Document URLs
  gstCertificateUrl: text("gst_certificate_url"),
  panCopyUrl: text("pan_copy_url"),
  securityChequeUrl: text("security_cheque_url"),
  aadharCardUrl: text("aadhar_card_url"),
  agreementUrl: text("agreement_url"),
  poRateContractUrl: text("po_rate_contract_url"),
  
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
  clientId: varchar("client_id").notNull(),
  agreementNumber: text("agreement_number").notNull().unique(),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }).notNull(),
  paymentTerms: integer("payment_terms").notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  signedAt: timestamp("signed_at"),
  expiresAt: timestamp("expires_at"),
  // Additional fields for credit agreement form
  customerName: text("customer_name"),
  date: timestamp("date"),
  location: text("location"),
  address: text("address"),
  pinCode: text("pin_code"),
  gstnNumber: text("gstn_number"),
  chequeNumbers: text("cheque_numbers"),
  bankName: text("bank_name"),
  branchName: text("branch_name"),
  accountHolder: text("account_holder"),
  accountNumber: text("account_number"),
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

// Purchase Orders table - Comprehensive PO Management
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // 1. PO Identification
  poNumber: text("po_number").notNull().unique(),
  poDate: timestamp("po_date").notNull().default(sql`now()`),
  revisionNumber: integer("revision_number").default(0),
  status: text("status").notNull().default('OPEN'), // OPEN, APPROVED, PARTIALLY_RECEIVED, CLOSED, CANCELLED
  
  // 2. Supplier Information
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  supplierName: text("supplier_name").notNull(),
  supplierContactPerson: text("supplier_contact_person"),
  supplierEmail: text("supplier_email"),
  supplierPhone: text("supplier_phone"),
  
  // 3. Buyer / Internal Information
  buyerName: text("buyer_name").notNull(),
  department: text("department"),
  costCenter: text("cost_center"),
  approverName: text("approver_name"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  
  // 4. Order Details & Financial
  currency: text("currency").notNull().default('INR'),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }),
  
  // Additional Fields
  deliveryDate: timestamp("delivery_date"),
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),
  terms: text("terms"),
  
  // Legacy fields for compatibility
  orderId: varchar("order_id").references(() => orders.id),
  clientId: varchar("client_id").references(() => clients.id),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  issuedAt: timestamp("issued_at"),
  validUntil: timestamp("valid_until"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Purchase Order Items table - Line items for each PO
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: varchar("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  
  // Item Details
  itemCode: text("item_code").notNull(),
  itemDescription: text("item_description").notNull(),
  quantityOrdered: decimal("quantity_ordered", { precision: 15, scale: 3 }).notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  totalLineValue: decimal("total_line_value", { precision: 15, scale: 2 }).notNull(),
  
  // Product Master Integration
  productMasterId: varchar("product_master_id"),
  productName: text("product_name"),
  productFamily: text("product_family"),
  productGrade: text("product_grade"),
  hsnCode: text("hsn_code"),
  
  // Additional item details
  deliveryDate: timestamp("delivery_date"),
  
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

// Lead Follow-ups table
export const leadFollowUps = pgTable("lead_follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  assignedUserId: varchar("assigned_user_id").notNull().references(() => users.id),
  followUpDate: timestamp("follow_up_date").notNull(),
  // Old columns for backward compatibility
  type: varchar("type").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").notNull().default('MEDIUM'),
  // New columns
  followUpType: leadFollowUpTypeEnum("follow_up_type").notNull().default('CALL'),
  remarks: text("remarks").notNull(),
  status: followUpStatusEnum("status").notNull().default('PENDING'),
  completedAt: timestamp("completed_at"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  outcome: text("outcome"), // Result of the follow-up
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
  orderId: varchar("order_id").notNull().references(() => salesOrders.id),
  vehicleNumber: text("vehicle_number").notNull(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone"),
  currentLocation: text("current_location"),
  destinationLocation: text("destination_location"),
  distanceRemaining: integer("distance_remaining"), // km
  estimatedArrival: timestamp("estimated_arrival"),
  // New fields for enhanced tracking
  productName: text("product_name"), // Auto-fill from order (legacy)
  productQty: text("product_qty"), // Auto-fill from order (legacy)
  products: text("products"), // JSON string of product array for multiple products
  clientNumber: text("client_number"), // Auto-fill from client mobile number
  ewayBillNumber: text("eway_bill_number"), // Auto-fill from eway bills
  status: trackingStatusEnum("status").notNull().default('LOADING'),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tracking Logs table for status history
export const trackingLogs = pgTable("tracking_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingId: varchar("tracking_id").notNull().references(() => clientTracking.id, { onDelete: 'cascade' }),
  status: trackingStatusEnum("status").notNull(),
  location: text("location").notNull(),
  notes: text("notes"),
  estimatedArrival: timestamp("estimated_arrival"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedBy: varchar("updated_by").references(() => users.id),
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
  permissions: many(userPermissions),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
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

export const clientTrackingRelations = relations(clientTracking, ({ one, many }) => ({
  client: one(clients, {
    fields: [clientTracking.clientId],
    references: [clients.id],
  }),
  order: one(salesOrders, {
    fields: [clientTracking.orderId],
    references: [salesOrders.id],
  }),
  logs: many(trackingLogs),
}));

export const trackingLogsRelations = relations(trackingLogs, ({ one }) => ({
  tracking: one(clientTracking, {
    fields: [trackingLogs.trackingId],
    references: [clientTracking.id],
  }),
  updatedBy: one(users, {
    fields: [trackingLogs.updatedBy],
    references: [users.id],
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

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  createdByUser: one(users, {
    fields: [purchaseOrders.createdBy],
    references: [users.id],
  }),
  items: many(purchaseOrderItems),
  
  // Legacy relations for compatibility
  order: one(orders, {
    fields: [purchaseOrders.orderId],
    references: [orders.id],
  }),
  client: one(clients, {
    fields: [purchaseOrders.clientId],
    references: [clients.id],
  }),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
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

export const insertClientSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  category: z.enum(['ALFA', 'BETA', 'GAMMA', 'DELTA', 'ALPHA']),
  billingAddressLine: z.string().nullable().optional().transform(val => val || ""),
  billingCity: z.string().nullable().optional().transform(val => val || ""),
  billingPincode: z.string().nullable().optional().transform(val => val || ""),
  billingState: z.string().nullable().optional().transform(val => val || ""),
  billingCountry: z.string().nullable().default('India').transform(val => val || 'India'),
  gstNumber: z.string().nullable().optional().transform(val => val || ""),
  panNumber: z.string().nullable().optional().transform(val => val || ""),
  msmeNumber: z.string().nullable().optional().transform(val => val || ""),
  incorporationCertNumber: z.string().nullable().optional().transform(val => val || ""),
  incorporationDate: z.union([z.string(), z.date(), z.null()]).optional().transform(val => {
    if (!val || val === null) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }),
  companyType: z.enum(['PVT_LTD', 'PARTNERSHIP', 'PROPRIETOR', 'GOVT', 'OTHERS']).nullable().optional(),
  contactPersonName: z.string().nullable().optional().transform(val => val || ""),
  mobileNumber: z.string().nullable().optional().transform(val => val || ""),
  email: z.string().nullable().optional().transform(val => val || "").pipe(z.string().email().optional().or(z.literal(""))),
  communicationPreferences: z.array(z.string()).optional(),
  paymentTerms: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null || val === "") return 30;
    return typeof val === 'string' ? parseInt(val) || 30 : val;
  }),
  creditLimit: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null || val === "") return undefined;
    return typeof val === 'string' ? val : val.toString();
  }),
  bankInterestApplicable: z.enum(['FROM_DAY_1', 'FROM_DUE_DATE']).optional(),
  interestPercent: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null || val === "") return undefined;
    return typeof val === 'string' ? val : val.toString();
  }),
  poRequired: z.boolean().default(false),
  invoicingEmails: z.array(z.string()).optional().nullable().transform(val => val || []),
  gstCertificateUploaded: z.boolean().default(false),
  panCopyUploaded: z.boolean().default(false),
  securityChequeUploaded: z.boolean().default(false),
  aadharCardUploaded: z.boolean().default(false),
  agreementUploaded: z.boolean().default(false),
  poRateContractUploaded: z.boolean().default(false),
  primarySalesPersonId: z.string().nullable().optional().transform(val => val || undefined),
  lastContactDate: z.union([z.string(), z.date()]).optional().transform(val => {
    if (!val) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }),
  nextFollowUpDate: z.union([z.string(), z.date()]).optional().transform(val => {
    if (!val) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
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

export const insertCreditAgreementSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  agreementNumber: z.string().min(1, "Agreement number is required"),
  creditLimit: z.any().transform(val => {
    if (!val) return 0;
    const num = parseFloat(String(val));
    return isNaN(num) ? 0 : num;
  }),
  paymentTerms: z.any().transform(val => {
    if (!val) return 30;
    const num = parseInt(String(val), 10);
    return isNaN(num) ? 30 : num;
  }),
  interestRate: z.any().optional().transform(val => {
    if (!val) return null;
    const num = parseFloat(String(val));
    return isNaN(num) ? null : num;
  }).nullable(),
  customerName: z.any().optional().nullable(),
  date: z.any().optional().nullable(),
  location: z.any().optional().nullable(),
  address: z.any().optional().nullable(),
  pinCode: z.any().optional().nullable(),
  gstnNumber: z.any().optional().nullable(),
  chequeNumbers: z.any().optional().nullable(),
  bankName: z.any().optional().nullable(),
  branchName: z.any().optional().nullable(),
  accountHolder: z.any().optional().nullable(),
  accountNumber: z.any().optional().nullable(),
}).passthrough(); // Allow additional fields

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseOrderSchema = z.object({
  poNumber: z.string(),
  supplierId: z.string(),
  orderDate: z.string(),
  expectedDeliveryDate: z.string(),
  status: z.string().optional(),
  currency: z.string().default("INR"),
  subtotal: z.number(),
  taxAmount: z.number().default(0),
  discountAmount: z.number().default(0),
  totalAmount: z.number(),
  deliveryAddress: z.string().optional(),
  termsAndConditions: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const insertPurchaseOrderItemSchema = z.object({
  purchaseOrderId: z.string(),
  itemCode: z.string(),
  itemDescription: z.string(),
  quantityOrdered: z.number(),
  unitOfMeasure: z.string(),
  unitPrice: z.number(),
  totalLineValue: z.number(),
  productMasterId: z.string().optional(),
  productName: z.string().optional(),
  productFamily: z.string().optional(),
  productGrade: z.string().optional(),
  hsnCode: z.string().optional(),
  deliveryDate: z.string().optional(),
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

export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;

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

// Tracking logs schema
export const insertTrackingLogSchema = createInsertSchema(trackingLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertTrackingLog = z.infer<typeof insertTrackingLogSchema>;
export type TrackingLog = typeof trackingLogs.$inferSelect;

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
  transporterId: varchar("transporter_id").references(() => transporters.id),
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
  productId: varchar("product_id").notNull().references(() => productMaster.id),
  salespersonId: varchar("salesperson_id").references(() => users.id),
  deliveryStatus: deliveryStatusEnum("delivery_status").notNull().default('RECEIVING'),
  deliveryChallanSigned: boolean("delivery_challan_signed").notNull().default(false),
  deliveryChallanSignedAt: timestamp("delivery_challan_signed_at"),
  notes: text("notes"), // Store aggregated item descriptions
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
  deliveryChallanSignedAt: z.string().optional().nullable(),
  // Allow empty strings for optional fields by transforming them
  vehicleNumber: z.string().transform(val => val || 'N/A'),
  location: z.string().transform(val => val || 'N/A'),
  salespersonId: z.string().optional().nullable().transform(val => val || null),
  transporterId: z.string().optional().transform(val => val || null),
  notes: z.string().optional().nullable(),
  // Make numeric fields accept strings and convert
  grossWeight: z.union([z.string(), z.number()]).transform(val => String(val || '0')),
  tareWeight: z.union([z.string(), z.number()]).transform(val => String(val || '0')),
  netWeight: z.union([z.string(), z.number()]).transform(val => String(val || '0')),
  entireWeight: z.union([z.string(), z.number()]).transform(val => String(val || '0')),
  drumQuantity: z.union([z.string(), z.number()]).transform(val => Number(val) || 0),
  perDrumWeight: z.union([z.string(), z.number()]).transform(val => String(val || '0')),
  basicRate: z.union([z.string(), z.number()]).transform(val => String(val || '0')),
  gstPercent: z.union([z.string(), z.number()]).transform(val => String(val || '18')),
  totalAmount: z.union([z.string(), z.number()]).transform(val => String(val || '0')),
  basicRatePurchase: z.union([z.string(), z.number()]).transform(val => String(val || '0')),
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
  product: one(productMaster, {
    fields: [sales.productId],
    references: [productMaster.id],
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
  totalQuantity: text("total_quantity"), // Total Quantity/KG/TON as text field
  rate: decimal("rate", { precision: 15, scale: 2 }), // Rate field
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }), // Total Amount field
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Suppliers Master - Enhanced with comprehensive supplier master data
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // 1. Identification & General Info
  supplierCode: text("supplier_code").unique().notNull(),
  supplierName: text("supplier_name").notNull(), // Legal Name
  tradeName: text("trade_name"), // Brand Name if different
  supplierType: supplierTypeEnum("supplier_type").notNull().default('VENDOR'),
  status: text("status").notNull().default('ACTIVE'), // ACTIVE/INACTIVE
  
  // 2. Contact Details
  contactPersonName: text("contact_person_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  fax: text("fax"),
  website: text("website"),
  
  // 3. Address Information
  registeredAddressStreet: text("registered_address_street"),
  registeredAddressCity: text("registered_address_city"),
  registeredAddressState: text("registered_address_state"),
  registeredAddressCountry: text("registered_address_country").default('India'),
  registeredAddressPostalCode: text("registered_address_postal_code"),
  
  shippingAddressStreet: text("shipping_address_street"),
  shippingAddressCity: text("shipping_address_city"),
  shippingAddressState: text("shipping_address_state"),
  shippingAddressCountry: text("shipping_address_country"),
  shippingAddressPostalCode: text("shipping_address_postal_code"),
  
  billingAddressStreet: text("billing_address_street"),
  billingAddressCity: text("billing_address_city"),
  billingAddressState: text("billing_address_state"),
  billingAddressCountry: text("billing_address_country"),
  billingAddressPostalCode: text("billing_address_postal_code"),
  
  // 4. Financial & Payment Details
  taxId: text("tax_id"), // Tax ID / VAT / GST / PAN
  bankAccountNumber: text("bank_account_number"),
  bankName: text("bank_name"),
  bankBranch: text("bank_branch"),
  swiftIbanCode: text("swift_iban_code"),
  paymentTerms: integer("payment_terms").default(30), // e.g., Net 30, Net 60
  preferredCurrency: text("preferred_currency").default('INR'),
  
  // Legacy fields for compatibility
  name: text("name"), // Keeping for backward compatibility
  gstin: text("gstin"), // Will be mapped to taxId
  pan: text("pan"), // Will be mapped to taxId
  addressLine: text("address_line"), // Will be mapped to registered address
  city: text("city"), // Will be mapped to registered city
  state: text("state"), // Will be mapped to registered state
  pincode: text("pincode"), // Will be mapped to registered postal code
  contactPersonMobile: text("contact_person_mobile"), // Will be mapped to contactPhone
  contactPersonEmail: text("contact_person_email"), // Will be mapped to contactEmail
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
  notes: text("notes"),
  assignedToUserId: varchar("assigned_to_user_id").references(() => users.id),
  primarySalesPersonId: varchar("primary_sales_person_id").references(() => users.id),
  clientId: varchar("client_id").references(() => clients.id), // Converted to client when qualified
  
  // Follow-up tracking fields
  lastFollowUpDate: timestamp("last_follow_up_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  followUpPriority: leadFollowUpPriorityEnum("follow_up_priority").default('MEDIUM'),
  
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
  clientType: text("client_type").default('client'), // Track if this was created from lead or client
  quotationDate: timestamp("quotation_date").notNull().default(sql`now()`),
  validUntil: timestamp("valid_until").notNull(),
  status: quotationStatusEnum("status").notNull().default('DRAFT'),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default('0'),
  taxAmount: decimal("tax_amount", { precision: 15, scale: 2 }).default('0'),
  freightCharged: decimal("freight_charged", { precision: 15, scale: 2 }).default('0'),
  grandTotal: decimal("grand_total", { precision: 15, scale: 2 }).notNull(),
  paymentTerms: text("payment_terms"),
  deliveryTerms: text("delivery_terms"),
  destination: text("destination"),
  loadingFrom: text("loading_from"),
  specialInstructions: text("special_instructions"),
  salesPersonId: varchar("sales_person_id").references(() => users.id),
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
  rate: decimal("rate", { precision: 15, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
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
  destination: text("destination"),
  loadingFrom: text("loading_from"),
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
});

export const insertLeadFollowUpSchema = createInsertSchema(leadFollowUps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  followUpDate: z.string().transform((val) => new Date(val)),
  nextFollowUpDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  completedAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  // Accept both lead status and follow-up status values
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST", "PENDING", "COMPLETED", "CANCELLED"]).optional(),
  // Optional follow-up status for the actual follow-up record
  followUpStatus: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
  // Make old columns optional since they're populated automatically
  type: z.string().optional(),
  description: z.string().optional(),
  priority: z.string().optional().default('MEDIUM'),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuotationSchema = z.object({
  opportunityId: z.string().optional(),
  clientId: z.string(),
  clientType: z.enum(['client', 'lead']).optional().default('client'), // Add clientType field
  quotationDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  validUntil: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'REVISED', 'ACCEPTED', 'REJECTED', 'EXPIRED']).default('DRAFT'),
  totalAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  discountPercentage: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  discountAmount: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  taxAmount: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  grandTotal: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  destination: z.string().optional(),
  loadingFrom: z.string().optional(),
  specialInstructions: z.string().optional(),
  preparedByUserId: z.string(),
  approvedByUserId: z.string().optional(),
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_REVISION']).default('PENDING'),
  approvalComments: z.string().optional(),
});

export const insertQuotationItemSchema = z.object({
  quotationId: z.string(),
  productId: z.string(),
  description: z.string().optional(),
  quantity: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  unit: z.string(),
  unitPrice: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  totalPrice: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  taxRate: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  taxAmount: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  deliveryDate: z.union([z.string(), z.date()]).optional().transform(val => {
    if (!val) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }),
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

export type InsertLeadFollowUp = z.infer<typeof insertLeadFollowUpSchema>;
export type LeadFollowUp = typeof leadFollowUps.$inferSelect;

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

// =============================================================================
// TOUR ADVANCE (TA) MODULE TABLES
// =============================================================================

// Tour Advance main table
export const tourAdvances = pgTable("tour_advances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Employee Details
  employeeId: varchar("employee_id").notNull().references(() => users.id),
  employeeCode: text("employee_code"),
  employeeName: text("employee_name").notNull(),
  designation: text("designation"),
  department: text("department"),
  phoneNo: text("phone_no"),
  
  // Tour Details
  tourStartDate: timestamp("tour_start_date").notNull(),
  tourEndDate: timestamp("tour_end_date").notNull(),
  numberOfDays: integer("number_of_days").notNull(),
  
  // Travel Details
  mainDestination: text("main_destination").notNull(),
  departureLocation: text("departure_location"),
  modeOfTravel: travelModeEnum("mode_of_travel").notNull(),
  vehicleNumber: text("vehicle_number"),
  purposeOfJourney: journeyPurposeEnum("purpose_of_journey").array(),
  purposeRemarks: text("purpose_remarks"),
  tourProgramme: text("tour_programme"),
  
  // Advance/Financials
  advanceRequired: boolean("advance_required").notNull().default(false),
  advanceAmountRequested: decimal("advance_amount_requested", { precision: 15, scale: 2 }),
  sanctionAmountApproved: decimal("sanction_amount_approved", { precision: 15, scale: 2 }),
  sanctionAuthority: text("sanction_authority"),
  
  // Approval Workflow
  submittedBy: varchar("submitted_by").notNull().references(() => users.id),
  recommendedBy: varchar("recommended_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  status: taStatusEnum("status").notNull().default('DRAFT'),
  dateOfApproval: timestamp("date_of_approval"),
  rejectionReason: text("rejection_reason"),
  
  // Additional fields for detailed TA form
  stateName: text("state_name"),
  partyVisit: text("party_visit"),
  salesPersonId: varchar("sales_person_id").references(() => users.id),
  purposeOfTrip: text("purpose_of_trip"),
  
  // Daily Expenses Tracking (JSON format)
  dailyExpenses: text("daily_expenses"),
  
  // Status History (JSON format) - Track all status changes
  statusHistory: text("status_history"), // Store as JSON string
  
  // Audit Fields
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  updatedBy: varchar("updated_by").references(() => users.id),
});

// Tour Segments table (for multi-row travel segments)
export const tourSegments = pgTable("tour_segments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourAdvanceId: varchar("tour_advance_id").notNull().references(() => tourAdvances.id, { onDelete: "cascade" }),
  
  segmentNumber: integer("segment_number").notNull(), // Order of segments
  departureDate: timestamp("departure_date").notNull(),
  departureTime: text("departure_time"), // Store as HH:MM string
  arrivalDate: timestamp("arrival_date").notNull(),
  arrivalTime: text("arrival_time"), // Store as HH:MM string
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// TA Expenses table (for daily expense tracking)
export const taExpenses = pgTable("ta_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourAdvanceId: varchar("tour_advance_id").notNull().references(() => tourAdvances.id, { onDelete: "cascade" }),
  
  expenseDate: timestamp("expense_date").notNull(),
  
  // Food and Accommodation Expenses
  personalCarKms: decimal("personal_car_kms", { precision: 10, scale: 2 }).default('0'),
  roomRent: decimal("room_rent", { precision: 10, scale: 2 }).default('0'),
  water: decimal("water", { precision: 10, scale: 2 }).default('0'),
  breakfast: decimal("breakfast", { precision: 10, scale: 2 }).default('0'),
  lunch: decimal("lunch", { precision: 10, scale: 2 }).default('0'),
  dinner: decimal("dinner", { precision: 10, scale: 2 }).default('0'),
  
  // Travel & Other Expenses
  usageRatePerKm: decimal("usage_rate_per_km", { precision: 10, scale: 2 }).default('0'),
  trainAirTicket: decimal("train_air_ticket", { precision: 10, scale: 2 }).default('0'),
  autoTaxi: decimal("auto_taxi", { precision: 10, scale: 2 }).default('0'),
  rentACar: decimal("rent_a_car", { precision: 10, scale: 2 }).default('0'),
  otherTransport: decimal("other_transport", { precision: 10, scale: 2 }).default('0'),
  telephone: decimal("telephone", { precision: 10, scale: 2 }).default('0'),
  tolls: decimal("tolls", { precision: 10, scale: 2 }).default('0'),
  parking: decimal("parking", { precision: 10, scale: 2 }).default('0'),
  dieselPetrol: decimal("diesel_petrol", { precision: 10, scale: 2 }).default('0'),
  other: decimal("other", { precision: 10, scale: 2 }).default('0'),
  
  // Calculated fields
  dailyTotal: decimal("daily_total", { precision: 10, scale: 2 }).default('0'),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Relations for Tour Advance module
export const tourAdvanceRelations = relations(tourAdvances, ({ one, many }) => ({
  employee: one(users, {
    fields: [tourAdvances.employeeId],
    references: [users.id],
    relationName: "tourAdvanceEmployee"
  }),
  submittedByUser: one(users, {
    fields: [tourAdvances.submittedBy],
    references: [users.id],
    relationName: "tourAdvanceSubmittedBy"
  }),
  recommendedByUser: one(users, {
    fields: [tourAdvances.recommendedBy],
    references: [users.id],
    relationName: "tourAdvanceRecommendedBy"
  }),
  approvedByUser: one(users, {
    fields: [tourAdvances.approvedBy],
    references: [users.id],
    relationName: "tourAdvanceApprovedBy"
  }),
  createdByUser: one(users, {
    fields: [tourAdvances.createdBy],
    references: [users.id],
    relationName: "tourAdvanceCreatedBy"
  }),
  segments: many(tourSegments),
  expenses: many(taExpenses),
  salesPerson: one(users, {
    fields: [tourAdvances.salesPersonId],
    references: [users.id],
    relationName: "tourAdvanceSalesPerson"
  })
}));

export const tourSegmentRelations = relations(tourSegments, ({ one }) => ({
  tourAdvance: one(tourAdvances, {
    fields: [tourSegments.tourAdvanceId],
    references: [tourAdvances.id]
  })
}));

export const taExpenseRelations = relations(taExpenses, ({ one }) => ({
  tourAdvance: one(tourAdvances, {
    fields: [taExpenses.tourAdvanceId],
    references: [tourAdvances.id]
  })
}));

// Insert schemas for Tour Advance
export const insertTourAdvanceSchema = createInsertSchema(tourAdvances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedBy: true,
  createdBy: true,
  updatedBy: true,
}).extend({
  tourStartDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  tourEndDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  numberOfDays: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val) || 0 : val || 0),
  advanceAmountRequested: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return undefined;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  sanctionAmountApproved: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return undefined;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  dailyExpenses: z.record(z.record(z.number())).optional().transform(val => {
    if (val == null) return undefined;
    return JSON.stringify(val);
  }),
});

export const insertTourSegmentSchema = createInsertSchema(tourSegments).omit({
  id: true,
  createdAt: true,
}).extend({
  departureDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  arrivalDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  segmentNumber: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val) || 0 : val || 0),
});

export const insertTAExpenseSchema = createInsertSchema(taExpenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  expenseDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
});

// Tour Advance Types
export type InsertTourAdvance = z.infer<typeof insertTourAdvanceSchema>;
export type TourAdvance = typeof tourAdvances.$inferSelect;

export type InsertTourSegment = z.infer<typeof insertTourSegmentSchema>;
export type TourSegment = typeof tourSegments.$inferSelect;

export type InsertTAExpense = z.infer<typeof insertTAExpenseSchema>;
export type TAExpense = typeof taExpenses.$inferSelect;

// User Permissions Schema and Types
export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;
export type UserPermission = typeof userPermissions.$inferSelect;

// ============ SALES OPERATIONS MODULE ADDITIONS ============
// Additional Enums for Invoice Management
export const partyTypeEnum = pgEnum('party_type', ['CUSTOMER', 'SUPPLIER', 'BOTH']);
export const invoiceTypeEnum = pgEnum('invoice_type', ['TAX_INVOICE', 'PROFORMA', 'CREDIT_NOTE', 'DEBIT_NOTE']);
export const unitOfMeasurementEnum = pgEnum('unit_of_measurement', ['DRUM', 'KG', 'LITRE', 'LTR', 'PIECE', 'PIECES', 'METER', 'TON', 'BOX', 'UNIT']);
export const freightTypeEnum = pgEnum('freight_type', ['PAID', 'TO_PAY', 'INCLUDED']);
export const paymentModeEnum = pgEnum('payment_mode', ['CASH', 'CHEQUE', 'NEFT', 'RTGS', 'UPI', 'CARD', 'ONLINE']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['DRAFT', 'SUBMITTED', 'CANCELLED']);
export const transactionTypeEnum = pgEnum('transaction_type', ['SALE', 'PURCHASE', 'OPENING', 'ADJUSTMENT']);

// 1. Companies (Your Company Details)
export const invoiceCompanies = pgTable("invoice_companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  stateCode: text("state_code").notNull(),
  pincode: text("pincode").notNull(),
  gstin: text("gstin").unique(),
  pan: text("pan"),
  udyamNumber: text("udyam_number"),
  importExportCode: text("import_export_code"),
  leiCode: text("lei_code"),
  contactNumber: text("contact_number"),
  email: text("email"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfscCode: text("bank_ifsc_code"),
  bankBranch: text("bank_branch"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// 2. Parties (Customers/Suppliers)
export const invoiceParties = pgTable("invoice_parties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partyName: text("party_name").notNull(),
  partyType: partyTypeEnum("party_type").notNull(),
  billingAddress: text("billing_address").notNull(),
  shippingAddress: text("shipping_address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  stateCode: text("state_code").notNull(),
  pincode: text("pincode").notNull(),
  gstin: text("gstin"),
  pan: text("pan"),
  contactPerson: text("contact_person"),
  contactNumber: text("contact_number"),
  email: text("email"),
  creditDays: integer("credit_days").default(0),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }).default('0'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// 3. Products Master
export const invoiceProducts = pgTable("invoice_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  productDescription: text("product_description"),
  hsnSacCode: text("hsn_sac_code").notNull(),
  unitOfMeasurement: unitOfMeasurementEnum("unit_of_measurement").notNull(),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).notNull().default('0'),
  isService: boolean("is_service").notNull().default(false),
  openingStock: decimal("opening_stock", { precision: 15, scale: 3 }).default('0'),
  currentStock: decimal("current_stock", { precision: 15, scale: 3 }).default('0'),
  minimumStockLevel: decimal("minimum_stock_level", { precision: 15, scale: 3 }).default('0'),
  purchaseRate: decimal("purchase_rate", { precision: 15, scale: 2 }).default('0'),
  saleRate: decimal("sale_rate", { precision: 15, scale: 2 }).default('0'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// 4. Transporters
export const invoiceTransporters = pgTable("invoice_transporters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transporterName: text("transporter_name").notNull(),
  transporterGstin: text("transporter_gstin"),
  contactNumber: text("contact_number"),
  address: text("address"),
  vehicleNumbers: text("vehicle_numbers"), // JSON array as text
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// 5. Sales Invoices (Main Invoice Header)
export const salesInvoices = pgTable("sales_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: timestamp("invoice_date").notNull(),
  invoiceType: invoiceTypeEnum("invoice_type").notNull().default('TAX_INVOICE'),
  financialYear: text("financial_year").notNull(),
  
  // Customer Details
  customerId: varchar("customer_id").notNull().references(() => invoiceParties.id),
  billingPartyId: varchar("billing_party_id").references(() => invoiceParties.id),
  shippingPartyId: varchar("shipping_party_id").references(() => invoiceParties.id),
  placeOfSupply: text("place_of_supply").notNull(),
  placeOfSupplyStateCode: text("place_of_supply_state_code").notNull(),
  
  // Document References
  buyerOrderNumber: text("buyer_order_number"),
  buyerOrderDate: timestamp("buyer_order_date"),
  deliveryNoteNumber: text("delivery_note_number"),
  referenceNumber: text("reference_number"),
  referenceDate: timestamp("reference_date"),
  
  // e-Invoice Details
  irnNumber: text("irn_number"),
  irnAckNumber: text("irn_ack_number"),
  irnAckDate: timestamp("irn_ack_date"),
  qrCodeData: text("qr_code_data"),
  
  // e-Way Bill Details
  ewayBillNumber: text("eway_bill_number"),
  ewayBillDate: timestamp("eway_bill_date"),
  ewayBillValidUpto: timestamp("eway_bill_valid_upto"),
  ewayBillDistance: decimal("eway_bill_distance", { precision: 10, scale: 2 }),
  transactionType: text("transaction_type"),
  supplyType: text("supply_type"),
  
  // Transportation
  transporterId: varchar("transporter_id").references(() => invoiceTransporters.id),
  transporterName: text("transporter_name"),
  vehicleNumber: text("vehicle_number"),
  salesOrderNumber: text("sales_order_number"),
  lrNumber: text("lr_number"),
  lrRrNumber: text("lr_rr_number"),
  lrRrDate: timestamp("lr_rr_date"),
  partyMobileNumber: text("party_mobile_number"),
  dispatchFrom: text("dispatch_from"),
  dispatchedThrough: text("dispatched_through"),
  dispatchCity: text("dispatch_city"),
  portOfLoading: text("port_of_loading"),
  portOfDischarge: text("port_of_discharge"),
  destination: text("destination"),
  freightType: freightTypeEnum("freight_type").default('TO_PAY'),
  
  // Payment Terms
  paymentTerms: text("payment_terms").notNull().default('30 Days Credit'),
  paymentMode: paymentModeEnum("payment_mode").default('NEFT'),
  dueDate: timestamp("due_date"),
  interestRateAfterDue: decimal("interest_rate_after_due", { precision: 5, scale: 2 }).default('0'),
  
  // Amounts
  subtotalAmount: decimal("subtotal_amount", { precision: 15, scale: 2 }).notNull().default('0'),
  cgstAmount: decimal("cgst_amount", { precision: 15, scale: 2 }).default('0'),
  sgstAmount: decimal("sgst_amount", { precision: 15, scale: 2 }).default('0'),
  igstAmount: decimal("igst_amount", { precision: 15, scale: 2 }).default('0'),
  otherCharges: decimal("other_charges", { precision: 15, scale: 2 }).default('0'),
  roundOff: decimal("round_off", { precision: 15, scale: 2 }).default('0'),
  totalInvoiceAmount: decimal("total_invoice_amount", { precision: 15, scale: 2 }).notNull().default('0'),
  totalInWords: text("total_in_words"),
  
  // Payment Tracking
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default('0'),
  remainingBalance: decimal("remaining_balance", { precision: 15, scale: 2 }).notNull().default('0'),
  
  // Status
  invoiceStatus: invoiceStatusEnum("invoice_status").notNull().default('DRAFT'),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default('PENDING'),
  
  // Audit
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  modifiedBy: varchar("modified_by").references(() => users.id),
  modifiedAt: timestamp("modified_at").default(sql`now()`),
});

// 6. Sales Invoice Items (Line Items)
export const salesInvoiceItems = pgTable("sales_invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => salesInvoices.id, { onDelete: 'cascade' }),
  lineNumber: integer("line_number").notNull(),
  productId: varchar("product_id").notNull().references(() => invoiceProducts.id),
  productName: text("product_name").notNull(),
  productDescription: text("product_description"),
  hsnSacCode: text("hsn_sac_code").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 3 }).notNull(),
  unitOfMeasurement: unitOfMeasurementEnum("unit_of_measurement").notNull(),
  ratePerUnit: decimal("rate_per_unit", { precision: 15, scale: 2 }).notNull(),
  grossAmount: decimal("gross_amount", { precision: 15, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default('0'),
  taxableAmount: decimal("taxable_amount", { precision: 15, scale: 2 }).notNull(),
  cgstRate: decimal("cgst_rate", { precision: 5, scale: 2 }).default('0'),
  cgstAmount: decimal("cgst_amount", { precision: 15, scale: 2 }).default('0'),
  sgstRate: decimal("sgst_rate", { precision: 5, scale: 2 }).default('0'),
  sgstAmount: decimal("sgst_amount", { precision: 15, scale: 2 }).default('0'),
  igstRate: decimal("igst_rate", { precision: 5, scale: 2 }).default('0'),
  igstAmount: decimal("igst_amount", { precision: 15, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Invoice Payments (Individual payment transactions)
export const invoicePayments = pgTable("invoice_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => salesInvoices.id, { onDelete: 'cascade' }),
  paymentAmount: decimal("payment_amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMode: text("payment_mode").default('CASH'), // CASH, CHEQUE, BANK_TRANSFER, etc.
  referenceNumber: text("reference_number"), // Cheque no, transaction ref, etc.
  remarks: text("remarks"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Purchase Invoice Payments (Individual payment transactions for purchase invoices)
export const purchaseInvoicePayments = pgTable("purchase_invoice_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull(),
  paymentAmount: decimal("payment_amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMode: text("payment_mode").default('CASH'), // CASH, CHEQUE, BANK_TRANSFER, etc.
  referenceNumber: text("reference_number"), // Cheque no, transaction ref, etc.
  remarks: text("remarks"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 7. Purchase Invoices 
export const purchaseInvoices = pgTable("purchase_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: timestamp("invoice_date").notNull(),
  invoiceType: invoiceTypeEnum("invoice_type").notNull().default('TAX_INVOICE'),
  financialYear: text("financial_year").notNull(),
  
  // Supplier Details
  supplierId: varchar("supplier_id").notNull().references(() => invoiceParties.id),
  supplierInvoiceNumber: text("supplier_invoice_number").notNull(),
  supplierInvoiceDate: timestamp("supplier_invoice_date").notNull(),
  grnNumber: text("grn_number"),
  placeOfSupply: text("place_of_supply").notNull(),
  placeOfSupplyStateCode: text("place_of_supply_state_code").notNull(),
  
  // Payment Terms
  paymentTerms: text("payment_terms").notNull().default('30 Days Credit'),
  paymentMode: paymentModeEnum("payment_mode").default('NEFT'),
  dueDate: timestamp("due_date"),
  
  // Amounts
  subtotalAmount: decimal("subtotal_amount", { precision: 15, scale: 2 }).notNull().default('0'),
  cgstAmount: decimal("cgst_amount", { precision: 15, scale: 2 }).default('0'),
  sgstAmount: decimal("sgst_amount", { precision: 15, scale: 2 }).default('0'),
  igstAmount: decimal("igst_amount", { precision: 15, scale: 2 }).default('0'),
  otherCharges: decimal("other_charges", { precision: 15, scale: 2 }).default('0'),
  roundOff: decimal("round_off", { precision: 15, scale: 2 }).default('0'),
  totalInvoiceAmount: decimal("total_invoice_amount", { precision: 15, scale: 2 }).notNull().default('0'),
  totalInWords: text("total_in_words"),
  
  // Payment Tracking
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default('0'),
  remainingBalance: decimal("remaining_balance", { precision: 15, scale: 2 }).notNull().default('0'),
  
  // Status
  invoiceStatus: invoiceStatusEnum("invoice_status").notNull().default('DRAFT'),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default('PENDING'),
  
  // Audit
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  modifiedBy: varchar("modified_by").references(() => users.id),
  modifiedAt: timestamp("modified_at").default(sql`now()`),
});

// 8. Purchase Invoice Items
export const purchaseInvoiceItems = pgTable("purchase_invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => purchaseInvoices.id, { onDelete: 'cascade' }),
  lineNumber: integer("line_number").notNull(),
  productId: varchar("product_id").references(() => invoiceProducts.id),
  productName: text("product_name").notNull(),
  productDescription: text("product_description"),
  hsnSacCode: text("hsn_sac_code").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 3 }).notNull(),
  unitOfMeasurement: unitOfMeasurementEnum("unit_of_measurement").notNull(),
  ratePerUnit: decimal("rate_per_unit", { precision: 15, scale: 2 }).notNull(),
  grossAmount: decimal("gross_amount", { precision: 15, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default('0'),
  taxableAmount: decimal("taxable_amount", { precision: 15, scale: 2 }).notNull(),
  cgstRate: decimal("cgst_rate", { precision: 5, scale: 2 }).default('0'),
  cgstAmount: decimal("cgst_amount", { precision: 15, scale: 2 }).default('0'),
  sgstRate: decimal("sgst_rate", { precision: 5, scale: 2 }).default('0'),
  sgstAmount: decimal("sgst_amount", { precision: 15, scale: 2 }).default('0'),
  igstRate: decimal("igst_rate", { precision: 5, scale: 2 }).default('0'),
  igstAmount: decimal("igst_amount", { precision: 15, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Schema validation for new tables
export const insertInvoiceCompanySchema = createInsertSchema(invoiceCompanies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoicePartySchema = createInsertSchema(invoiceParties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  creditDays: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseInt(val) || 0 : val;
  }),
  creditLimit: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
});

export const insertInvoiceProductSchema = createInsertSchema(invoiceProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  gstRate: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  openingStock: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  currentStock: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  minimumStockLevel: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  purchaseRate: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  saleRate: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
});

export const insertInvoiceTransporterSchema = createInsertSchema(invoiceTransporters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSalesInvoiceSchema = createInsertSchema(salesInvoices).omit({
  id: true,
  createdAt: true,
  modifiedAt: true,
}).extend({
  invoiceDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  buyerOrderDate: z.union([z.string(), z.date()]).optional().transform(val => {
    if (val == null) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }),
  referenceDate: z.union([z.string(), z.date()]).optional().transform(val => {
    if (val == null) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }),
  dueDate: z.union([z.string(), z.date()]).optional().transform(val => {
    if (val == null) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }),
});

export const insertPurchaseInvoiceSchema = createInsertSchema(purchaseInvoices).omit({
  id: true,
  createdAt: true,
  modifiedAt: true,
}).extend({
  invoiceDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  supplierInvoiceDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  dueDate: z.union([z.string(), z.date()]).optional().transform(val => {
    if (val == null) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }),
});

export const insertSalesInvoiceItemSchema = createInsertSchema(salesInvoiceItems).omit({
  id: true,
  createdAt: true,
}).extend({
  quantity: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  ratePerUnit: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  grossAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  discountPercentage: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val == null) return 0;
    return typeof val === 'string' ? parseFloat(val) || 0 : val;
  }),
  taxableAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  totalAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
});

export const insertPurchaseInvoiceItemSchema = createInsertSchema(purchaseInvoiceItems).omit({
  id: true,
  createdAt: true,
}).extend({
  quantity: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  ratePerUnit: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  grossAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  taxableAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
  totalAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val || 0),
});

// Types for new tables
export type InvoiceCompany = typeof invoiceCompanies.$inferSelect;
export type InsertInvoiceCompany = z.infer<typeof insertInvoiceCompanySchema>;

export type InvoiceParty = typeof invoiceParties.$inferSelect;
export type InsertInvoiceParty = z.infer<typeof insertInvoicePartySchema>;

export type InvoiceProduct = typeof invoiceProducts.$inferSelect;
export type InsertInvoiceProduct = z.infer<typeof insertInvoiceProductSchema>;

export type InvoiceTransporter = typeof invoiceTransporters.$inferSelect;
export type InsertInvoiceTransporter = z.infer<typeof insertInvoiceTransporterSchema>;

export type SalesInvoice = typeof salesInvoices.$inferSelect;
export type InsertSalesInvoice = z.infer<typeof insertSalesInvoiceSchema>;

export type SalesInvoiceItem = typeof salesInvoiceItems.$inferSelect;
export type InsertSalesInvoiceItem = z.infer<typeof insertSalesInvoiceItemSchema>;

export type PurchaseInvoice = typeof purchaseInvoices.$inferSelect;
export type InsertPurchaseInvoice = z.infer<typeof insertPurchaseInvoiceSchema>;

export type PurchaseInvoiceItem = typeof purchaseInvoiceItems.$inferSelect;
export type InsertPurchaseInvoiceItem = z.infer<typeof insertPurchaseInvoiceItemSchema>;
