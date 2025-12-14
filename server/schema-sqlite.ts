import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - simplified for SQLite
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default('EMPLOYEE'), // 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'OPERATIONS', 'EMPLOYEE'
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  lastLogin: text("last_login"), // ISO string
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// User sessions table
export const userSessions = sqliteTable("user_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: text("expires_at").notNull(), // ISO string
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// Clients table - simplified
export const clients = sqliteTable("clients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  category: text("category").notNull().default('BETA'), // 'ALFA', 'BETA', 'GAMMA', 'DELTA'
  billingAddressLine: text("billing_address_line"),
  billingCity: text("billing_city"),
  billingPincode: text("billing_pincode"),
  billingState: text("billing_state"),
  billingCountry: text("billing_country").default('India'),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  contactPersonName: text("contact_person_name"),
  mobileNumber: text("mobile_number"),
  email: text("email"),
  paymentTerms: integer("payment_terms").default(30),
  creditLimit: real("credit_limit").default(0),
  primarySalesPersonId: text("primary_sales_person_id").references(() => users.id),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// Orders table - simplified
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNumber: text("order_number").notNull().unique(),
  clientId: text("client_id").notNull().references(() => clients.id),
  status: text("status").notNull().default('PENDING'), // 'PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  totalAmount: real("total_amount").notNull().default(0),
  notes: text("notes"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// Tasks table - simplified
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default('TODO'), // 'TODO', 'IN_PROGRESS', 'COMPLETED'
  priority: text("priority").notNull().default('MEDIUM'), // 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  assignedTo: text("assigned_to").references(() => users.id),
  clientId: text("client_id").references(() => clients.id),
  dueDate: text("due_date"), // ISO string
  completedAt: text("completed_at"), // ISO string
  createdBy: text("created_by").references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  orders: many(orders),
  tasks: many(tasks),
  sessions: many(userSessions),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  primarySalesPerson: one(users, {
    fields: [clients.primarySalesPersonId],
    references: [users.id],
  }),
  orders: many(orders),
  tasks: many(tasks),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  client: one(clients, {
    fields: [orders.clientId],
    references: [clients.id],
  }),
  createdByUser: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedToUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [tasks.clientId],
    references: [clients.id],
  }),
  createdByUser: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// Schema validation for inserts
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  role: z.enum(['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'OPERATIONS', 'EMPLOYEE']),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertClientSchema = createInsertSchema(clients, {
  email: z.string().email().optional().or(z.literal('')),
  category: z.enum(['ALFA', 'BETA', 'GAMMA', 'DELTA']),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks, {
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Export all tables for Drizzle Kit
export const schema = {
  users,
  userSessions,
  clients,
  orders,
  tasks,
  usersRelations,
  clientsRelations,
  ordersRelations,
  tasksRelations,
  userSessionsRelations,
};