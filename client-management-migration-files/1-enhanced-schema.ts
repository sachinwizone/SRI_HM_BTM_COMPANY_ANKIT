import { sql } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  pgEnum,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'OPERATIONS']);
export const clientCategoryEnum = pgEnum('client_category', ['ALFA', 'BETA', 'GAMMA', 'DELTA']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID', 'OVERDUE', 'PARTIAL']);
export const taskStatusEnum = pgEnum('task_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const taskPriorityEnum = pgEnum('task_priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const billStatusEnum = pgEnum('bill_status', ['PENDING', 'GENERATED', 'SUBMITTED', 'CANCELLED']);
export const trackingStatusEnum = pgEnum('tracking_status', ['PICKUP_PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED']);
export const assignmentTypeEnum = pgEnum('assignment_type', ['PRIMARY', 'SECONDARY', 'BACKUP']);

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: roleEnum("role").notNull().default('SALES_EXECUTIVE'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Clients table with sales assignment fields
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: clientCategoryEnum("category").notNull(),
  email: varchar("email"),
  mobileNumber: varchar("mobile_number"),
  billingAddress: text("billing_address"),
  billingCity: varchar("billing_city"),
  billingState: varchar("billing_state"),
  billingPincode: varchar("billing_pincode"),
  gstNumber: varchar("gst_number"),
  panNumber: varchar("pan_number"),
  primarySalesPersonId: varchar("primary_sales_person_id").references(() => users.id),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client Assignments table (NEW)
export const clientAssignments = pgTable("client_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  salesPersonId: varchar("sales_person_id").notNull().references(() => users.id),
  assignmentType: assignmentTypeEnum("assignment_type").notNull().default('PRIMARY'),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shipping Addresses table
export const shippingAddresses = pgTable("shipping_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  contactPerson: varchar("contact_person").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  pincode: varchar("pincode").notNull(),
  phone: varchar("phone"),
  email: varchar("email"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Follow Ups table
export const followUps = pgTable("follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  followUpDate: timestamp("follow_up_date").notNull(),
  notes: text("notes"),
  completed: boolean("completed").default(false),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").unique().notNull(),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  salesPersonId: varchar("sales_person_id").references(() => users.id),
  orderDate: timestamp("order_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  productName: varchar("product_name").notNull(),
  quantity: decimal("quantity").notNull(),
  unit: varchar("unit").notNull(),
  rate: decimal("rate").notNull(),
  totalAmount: decimal("total_amount").notNull(),
  status: orderStatusEnum("status").notNull().default('PENDING'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: varchar("po_number").unique().notNull(),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  orderDate: timestamp("order_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  totalAmount: decimal("total_amount").notNull(),
  status: varchar("status").notNull().default('PENDING'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit Agreements table
export const creditAgreements = pgTable("credit_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  creditLimit: decimal("credit_limit").notNull(),
  paymentTerms: integer("payment_terms").notNull(),
  interestRate: decimal("interest_rate"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: varchar("payment_id").unique().notNull(),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  orderId: varchar("order_id").references(() => orders.id),
  amount: decimal("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").notNull().default('PENDING'),
  paymentMethod: varchar("payment_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to").notNull().references(() => users.id),
  clientId: varchar("client_id").references(() => clients.id),
  dueDate: timestamp("due_date"),
  status: taskStatusEnum("status").notNull().default('PENDING'),
  priority: taskPriorityEnum("priority").notNull().default('MEDIUM'),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// E-way Bills table
export const ewayBills = pgTable("eway_bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ewayBillNumber: varchar("eway_bill_number").unique().notNull(),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  vehicleNumber: varchar("vehicle_number").notNull(),
  transporterName: varchar("transporter_name").notNull(),
  transporterGst: varchar("transporter_gst"),
  distance: decimal("distance"),
  validUpto: timestamp("valid_upto").notNull(),
  status: billStatusEnum("status").notNull().default('PENDING'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client Tracking table
export const clientTracking = pgTable("client_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingId: varchar("tracking_id").unique().notNull(),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  orderId: varchar("order_id").references(() => orders.id),
  currentLocation: varchar("current_location"),
  status: trackingStatusEnum("status").notNull().default('PICKUP_PENDING'),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales Rates table
export const salesRates = pgTable("sales_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salesPersonId: varchar("sales_person_id").notNull().references(() => users.id),
  clientId: varchar("client_id").references(() => clients.id),
  productName: varchar("product_name").notNull(),
  rate: decimal("rate").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  validUpto: timestamp("valid_upto"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales table
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salesId: varchar("sales_id").unique().notNull(),
  salesPersonId: varchar("sales_person_id").notNull().references(() => users.id),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  orderId: varchar("order_id").references(() => orders.id),
  saleDate: timestamp("sale_date").notNull(),
  totalAmount: decimal("total_amount").notNull(),
  commission: decimal("commission"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Number Series table
export const numberSeries = pgTable("number_series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seriesName: varchar("series_name").unique().notNull(),
  prefix: varchar("prefix"),
  currentNumber: integer("current_number").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transporters table
export const transporters = pgTable("transporters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  contactPerson: varchar("contact_person"),
  mobile: varchar("mobile"),
  email: varchar("email"),
  address: text("address"),
  gstNumber: varchar("gst_number"),
  panNumber: varchar("pan_number"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  unit: varchar("unit").notNull(),
  rate: decimal("rate").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company Profile table
export const companyProfile = pgTable("company_profile", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name").notNull(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  gstNumber: varchar("gst_number"),
  panNumber: varchar("pan_number"),
  logo: varchar("logo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Branches table
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branchName: varchar("branch_name").notNull(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  phone: varchar("phone"),
  email: varchar("email"),
  managerId: varchar("manager_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product Master table
export const productMaster = pgTable("product_master", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productCode: varchar("product_code").unique().notNull(),
  productName: varchar("product_name").notNull(),
  category: varchar("category"),
  subCategory: varchar("sub_category"),
  unit: varchar("unit").notNull(),
  basePrice: decimal("base_price"),
  gstRate: decimal("gst_rate"),
  hsnCode: varchar("hsn_code"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierCode: varchar("supplier_code").unique().notNull(),
  name: varchar("name").notNull(),
  contactPerson: varchar("contact_person"),
  mobile: varchar("mobile"),
  email: varchar("email"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  gstNumber: varchar("gst_number"),
  panNumber: varchar("pan_number"),
  paymentTerms: integer("payment_terms"),
  creditLimit: decimal("credit_limit"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Banks table
export const banks = pgTable("banks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bankName: varchar("bank_name").notNull(),
  accountNumber: varchar("account_number").notNull(),
  accountHolderName: varchar("account_holder_name").notNull(),
  ifscCode: varchar("ifsc_code").notNull(),
  branchName: varchar("branch_name"),
  accountType: varchar("account_type"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleNumber: varchar("vehicle_number").unique().notNull(),
  vehicleType: varchar("vehicle_type").notNull(),
  driverName: varchar("driver_name"),
  driverMobile: varchar("driver_mobile"),
  capacity: decimal("capacity"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadSource: varchar("lead_source"),
  companyName: varchar("company_name").notNull(),
  contactPerson: varchar("contact_person"),
  mobile: varchar("mobile"),
  email: varchar("email"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  status: varchar("status").default('NEW'),
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Opportunities table
export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id),
  clientId: varchar("client_id").references(() => clients.id),
  opportunityName: varchar("opportunity_name").notNull(),
  expectedValue: decimal("expected_value"),
  probability: integer("probability"),
  expectedCloseDate: timestamp("expected_close_date"),
  stage: varchar("stage").default('QUALIFICATION'),
  assignedTo: varchar("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotations table
export const quotations = pgTable("quotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationNumber: varchar("quotation_number").unique().notNull(),
  clientId: varchar("client_id").references(() => clients.id),
  leadId: varchar("lead_id").references(() => leads.id),
  quotationDate: timestamp("quotation_date").notNull(),
  validUpto: timestamp("valid_upto"),
  totalAmount: decimal("total_amount"),
  status: varchar("status").default('DRAFT'),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotation Items table
export const quotationItems = pgTable("quotation_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationId: varchar("quotation_id").notNull().references(() => quotations.id, { onDelete: 'cascade' }),
  productId: varchar("product_id").references(() => productMaster.id),
  productName: varchar("product_name").notNull(),
  quantity: decimal("quantity").notNull(),
  unit: varchar("unit").notNull(),
  rate: decimal("rate").notNull(),
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales Orders table
export const salesOrders = pgTable("sales_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salesOrderNumber: varchar("sales_order_number").unique().notNull(),
  quotationId: varchar("quotation_id").references(() => quotations.id),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  salesOrderDate: timestamp("sales_order_date").notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  totalAmount: decimal("total_amount").notNull(),
  status: varchar("status").default('PENDING'),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales Order Items table
export const salesOrderItems = pgTable("sales_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salesOrderId: varchar("sales_order_id").notNull().references(() => salesOrders.id, { onDelete: 'cascade' }),
  productId: varchar("product_id").references(() => productMaster.id),
  productName: varchar("product_name").notNull(),
  quantity: decimal("quantity").notNull(),
  unit: varchar("unit").notNull(),
  rate: decimal("rate").notNull(),
  amount: decimal("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery Plans table
export const deliveryPlans = pgTable("delivery_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  salesOrderId: varchar("sales_order_id").notNull().references(() => salesOrders.id),
  plannedDate: timestamp("planned_date").notNull(),
  quantity: decimal("quantity").notNull(),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  driverName: varchar("driver_name"),
  status: varchar("status").default('PLANNED'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dispatches table
export const dispatches = pgTable("dispatches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dispatchNumber: varchar("dispatch_number").unique().notNull(),
  deliveryPlanId: varchar("delivery_plan_id").notNull().references(() => deliveryPlans.id),
  dispatchDate: timestamp("dispatch_date").notNull(),
  quantity: decimal("quantity").notNull(),
  vehicleNumber: varchar("vehicle_number").notNull(),
  driverName: varchar("driver_name"),
  status: varchar("status").default('DISPATCHED'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery Challans table
export const deliveryChallans = pgTable("delivery_challans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challanNumber: varchar("challan_number").unique().notNull(),
  dispatchId: varchar("dispatch_id").notNull().references(() => dispatches.id),
  challanDate: timestamp("challan_date").notNull(),
  deliveredQuantity: decimal("delivered_quantity"),
  receivedBy: varchar("received_by"),
  deliveryDate: timestamp("delivery_date"),
  status: varchar("status").default('PENDING'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedClients: many(clientAssignments),
  primaryClients: many(clients),
  assignedTasks: many(tasks),
  createdTasks: many(tasks),
  sales: many(sales),
  salesRates: many(salesRates),
  leads: many(leads),
  opportunities: many(opportunities),
  quotations: many(quotations),
  salesOrders: many(salesOrders),
  branches: many(branches),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  primarySalesPerson: one(users, {
    fields: [clients.primarySalesPersonId],
    references: [users.id]
  }),
  assignments: many(clientAssignments),
  shippingAddresses: many(shippingAddresses),
  followUps: many(followUps),
  orders: many(orders),
  purchaseOrders: many(purchaseOrders),
  creditAgreements: many(creditAgreements),
  payments: many(payments),
  tasks: many(tasks),
  clientTracking: many(clientTracking),
  salesRates: many(salesRates),
  sales: many(sales),
  opportunities: many(opportunities),
  quotations: many(quotations),
  salesOrders: many(salesOrders),
}));

export const clientAssignmentsRelations = relations(clientAssignments, ({ one }) => ({
  client: one(clients, {
    fields: [clientAssignments.clientId],
    references: [clients.id]
  }),
  salesPerson: one(users, {
    fields: [clientAssignments.salesPersonId],
    references: [users.id]
  }),
  assignedByUser: one(users, {
    fields: [clientAssignments.assignedBy],
    references: [users.id]
  }),
}));

export const shippingAddressesRelations = relations(shippingAddresses, ({ one }) => ({
  client: one(clients, {
    fields: [shippingAddresses.clientId],
    references: [clients.id]
  }),
}));

export const followUpsRelations = relations(followUps, ({ one }) => ({
  client: one(clients, {
    fields: [followUps.clientId],
    references: [clients.id]
  }),
  createdByUser: one(users, {
    fields: [followUps.createdBy],
    references: [users.id]
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, {
    fields: [orders.clientId],
    references: [clients.id]
  }),
  salesPerson: one(users, {
    fields: [orders.salesPersonId],
    references: [users.id]
  }),
  payments: many(payments),
  ewayBills: many(ewayBills),
  clientTracking: many(clientTracking),
  sales: many(sales),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one }) => ({
  client: one(clients, {
    fields: [purchaseOrders.clientId],
    references: [clients.id]
  }),
}));

export const creditAgreementsRelations = relations(creditAgreements, ({ one }) => ({
  client: one(clients, {
    fields: [creditAgreements.clientId],
    references: [clients.id]
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  client: one(clients, {
    fields: [payments.clientId],
    references: [clients.id]
  }),
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id]
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedToUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id]
  }),
  client: one(clients, {
    fields: [tasks.clientId],
    references: [clients.id]
  }),
  createdByUser: one(users, {
    fields: [tasks.createdBy],
    references: [users.id]
  }),
}));

export const ewayBillsRelations = relations(ewayBills, ({ one }) => ({
  order: one(orders, {
    fields: [ewayBills.orderId],
    references: [orders.id]
  }),
}));

export const clientTrackingRelations = relations(clientTracking, ({ one }) => ({
  client: one(clients, {
    fields: [clientTracking.clientId],
    references: [clients.id]
  }),
  order: one(orders, {
    fields: [clientTracking.orderId],
    references: [orders.id]
  }),
}));

export const salesRatesRelations = relations(salesRates, ({ one }) => ({
  salesPerson: one(users, {
    fields: [salesRates.salesPersonId],
    references: [users.id]
  }),
  client: one(clients, {
    fields: [salesRates.clientId],
    references: [clients.id]
  }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  salesPerson: one(users, {
    fields: [sales.salesPersonId],
    references: [users.id]
  }),
  client: one(clients, {
    fields: [sales.clientId],
    references: [clients.id]
  }),
  order: one(orders, {
    fields: [sales.orderId],
    references: [orders.id]
  }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignedToUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id]
  }),
  opportunities: many(opportunities),
  quotations: many(quotations),
}));

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  lead: one(leads, {
    fields: [opportunities.leadId],
    references: [leads.id]
  }),
  client: one(clients, {
    fields: [opportunities.clientId],
    references: [clients.id]
  }),
  assignedToUser: one(users, {
    fields: [opportunities.assignedTo],
    references: [users.id]
  }),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  client: one(clients, {
    fields: [quotations.clientId],
    references: [clients.id]
  }),
  lead: one(leads, {
    fields: [quotations.leadId],
    references: [leads.id]
  }),
  createdByUser: one(users, {
    fields: [quotations.createdBy],
    references: [users.id]
  }),
  items: many(quotationItems),
  salesOrders: many(salesOrders),
}));

export const quotationItemsRelations = relations(quotationItems, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationItems.quotationId],
    references: [quotations.id]
  }),
  product: one(productMaster, {
    fields: [quotationItems.productId],
    references: [productMaster.id]
  }),
}));

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
  quotation: one(quotations, {
    fields: [salesOrders.quotationId],
    references: [quotations.id]
  }),
  client: one(clients, {
    fields: [salesOrders.clientId],
    references: [clients.id]
  }),
  createdByUser: one(users, {
    fields: [salesOrders.createdBy],
    references: [users.id]
  }),
  items: many(salesOrderItems),
  deliveryPlans: many(deliveryPlans),
}));

export const salesOrderItemsRelations = relations(salesOrderItems, ({ one }) => ({
  salesOrder: one(salesOrders, {
    fields: [salesOrderItems.salesOrderId],
    references: [salesOrders.id]
  }),
  product: one(productMaster, {
    fields: [salesOrderItems.productId],
    references: [productMaster.id]
  }),
}));

export const deliveryPlansRelations = relations(deliveryPlans, ({ one, many }) => ({
  salesOrder: one(salesOrders, {
    fields: [deliveryPlans.salesOrderId],
    references: [salesOrders.id]
  }),
  vehicle: one(vehicles, {
    fields: [deliveryPlans.vehicleId],
    references: [vehicles.id]
  }),
  dispatches: many(dispatches),
}));

export const dispatchesRelations = relations(dispatches, ({ one, many }) => ({
  deliveryPlan: one(deliveryPlans, {
    fields: [dispatches.deliveryPlanId],
    references: [deliveryPlans.id]
  }),
  deliveryChallans: many(deliveryChallans),
}));

export const deliveryChallansRelations = relations(deliveryChallans, ({ one }) => ({
  dispatch: one(dispatches, {
    fields: [deliveryChallans.dispatchId],
    references: [dispatches.id]
  }),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  manager: one(users, {
    fields: [branches.managerId],
    references: [users.id]
  }),
}));

// Insert schemas for form validation
export const insertUserSchema = createInsertSchema(users);
export const insertClientSchema = createInsertSchema(clients);
export const insertClientAssignmentSchema = createInsertSchema(clientAssignments);
export const insertShippingAddressSchema = createInsertSchema(shippingAddresses);
export const insertFollowUpSchema = createInsertSchema(followUps);
export const insertOrderSchema = createInsertSchema(orders);
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders);
export const insertCreditAgreementSchema = createInsertSchema(creditAgreements);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertEwayBillSchema = createInsertSchema(ewayBills);
export const insertClientTrackingSchema = createInsertSchema(clientTracking);
export const insertSalesRateSchema = createInsertSchema(salesRates);
export const insertSalesSchema = createInsertSchema(sales);
export const insertNumberSeriesSchema = createInsertSchema(numberSeries);
export const insertTransporterSchema = createInsertSchema(transporters);
export const insertProductSchema = createInsertSchema(products);
export const insertCompanyProfileSchema = createInsertSchema(companyProfile);
export const insertBranchSchema = createInsertSchema(branches);
export const insertProductMasterSchema = createInsertSchema(productMaster);
export const insertSupplierSchema = createInsertSchema(suppliers);
export const insertBankSchema = createInsertSchema(banks);
export const insertVehicleSchema = createInsertSchema(vehicles);
export const insertLeadSchema = createInsertSchema(leads);
export const insertOpportunitySchema = createInsertSchema(opportunities);
export const insertQuotationSchema = createInsertSchema(quotations);
export const insertQuotationItemSchema = createInsertSchema(quotationItems);
export const insertSalesOrderSchema = createInsertSchema(salesOrders);
export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItems);
export const insertDeliveryPlanSchema = createInsertSchema(deliveryPlans);
export const insertDispatchSchema = createInsertSchema(dispatches);
export const insertDeliveryChallanSchema = createInsertSchema(deliveryChallans);

// Login and register schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Type exports for better TypeScript support
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;
export type ClientAssignment = typeof clientAssignments.$inferSelect;
export type InsertClientAssignment = typeof clientAssignments.$inferInsert;
export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertShippingAddress = typeof shippingAddresses.$inferInsert;
export type FollowUp = typeof followUps.$inferSelect;
export type InsertFollowUp = typeof followUps.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;
export type CreditAgreement = typeof creditAgreements.$inferSelect;
export type InsertCreditAgreement = typeof creditAgreements.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type EwayBill = typeof ewayBills.$inferSelect;
export type InsertEwayBill = typeof ewayBills.$inferInsert;
export type ClientTracking = typeof clientTracking.$inferSelect;
export type InsertClientTracking = typeof clientTracking.$inferInsert;
export type SalesRate = typeof salesRates.$inferSelect;
export type InsertSalesRate = typeof salesRates.$inferInsert;
export type Sales = typeof sales.$inferSelect;
export type InsertSales = typeof sales.$inferInsert;
export type NumberSeries = typeof numberSeries.$inferSelect;
export type InsertNumberSeries = typeof numberSeries.$inferInsert;
export type Transporter = typeof transporters.$inferSelect;
export type InsertTransporter = typeof transporters.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type CompanyProfile = typeof companyProfile.$inferSelect;
export type InsertCompanyProfile = typeof companyProfile.$inferInsert;
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = typeof branches.$inferInsert;
export type ProductMaster = typeof productMaster.$inferSelect;
export type InsertProductMaster = typeof productMaster.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;
export type Bank = typeof banks.$inferSelect;
export type InsertBank = typeof banks.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;
export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;
export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = typeof quotationItems.$inferInsert;
export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = typeof salesOrders.$inferInsert;
export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = typeof salesOrderItems.$inferInsert;
export type DeliveryPlan = typeof deliveryPlans.$inferSelect;
export type InsertDeliveryPlan = typeof deliveryPlans.$inferInsert;
export type Dispatch = typeof dispatches.$inferSelect;
export type InsertDispatch = typeof dispatches.$inferInsert;
export type DeliveryChallan = typeof deliveryChallans.$inferSelect;
export type InsertDeliveryChallan = typeof deliveryChallans.$inferInsert;