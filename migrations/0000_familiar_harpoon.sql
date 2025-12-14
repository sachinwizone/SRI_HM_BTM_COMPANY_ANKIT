CREATE TYPE "public"."action" AS ENUM('VIEW', 'ADD', 'EDIT', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_REVISION');--> statement-breakpoint
CREATE TYPE "public"."assignment_type" AS ENUM('PRIMARY', 'SECONDARY', 'BACKUP');--> statement-breakpoint
CREATE TYPE "public"."bank_interest" AS ENUM('FROM_DAY_1', 'FROM_DUE_DATE');--> statement-breakpoint
CREATE TYPE "public"."client_category" AS ENUM('ALFA', 'BETA', 'GAMMA', 'DELTA', 'ALPHA');--> statement-breakpoint
CREATE TYPE "public"."communication_preference" AS ENUM('EMAIL', 'WHATSAPP', 'PHONE', 'SMS');--> statement-breakpoint
CREATE TYPE "public"."company_type" AS ENUM('PVT_LTD', 'PARTNERSHIP', 'PROPRIETOR', 'GOVT', 'OTHERS');--> statement-breakpoint
CREATE TYPE "public"."credit_check_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_GUARANTEE');--> statement-breakpoint
CREATE TYPE "public"."delivery_plan_status" AS ENUM('PLANNED', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('RECEIVING', 'OK', 'APPROVED', 'DELIVERED');--> statement-breakpoint
CREATE TYPE "public"."dispatch_status" AS ENUM('PENDING', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED');--> statement-breakpoint
CREATE TYPE "public"."follow_up_status" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."journey_purpose" AS ENUM('CLIENT_VISIT', 'PLANT_VISIT', 'PARTY_MEETING', 'DEPARTMENT_VISIT', 'OTHERS');--> statement-breakpoint
CREATE TYPE "public"."lead_follow_up_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."lead_follow_up_type" AS ENUM('CALL', 'EMAIL', 'MEETING', 'DEMO', 'PROPOSAL', 'FOLLOW_UP');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'TRADE_SHOW', 'ADVERTISEMENT', 'COLD_CALL', 'OTHERS');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');--> statement-breakpoint
CREATE TYPE "public"."module" AS ENUM('DASHBOARD', 'CLIENT_MANAGEMENT', 'CLIENT_TRACKING', 'ORDER_WORKFLOW', 'SALES', 'SALES_OPERATIONS', 'PURCHASE_ORDERS', 'TASK_MANAGEMENT', 'FOLLOW_UP_HUB', 'LEAD_FOLLOW_UP_HUB', 'CREDIT_PAYMENTS', 'CREDIT_AGREEMENTS', 'EWAY_BILLS', 'SALES_RATES', 'TEAM_PERFORMANCE', 'TOUR_ADVANCE', 'TA_REPORTS', 'MASTER_DATA', 'USER_MANAGEMENT', 'PRICING');--> statement-breakpoint
CREATE TYPE "public"."opportunity_stage" AS ENUM('QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING_AGREEMENT', 'APPROVED', 'IN_PROGRESS', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'OVERDUE', 'PAID', 'PARTIAL');--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'REVISED', 'ACCEPTED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."sales_order_status" AS ENUM('DRAFT', 'PENDING_CREDIT_CHECK', 'APPROVED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."supplier_type" AS ENUM('MANUFACTURER', 'DISTRIBUTOR', 'SERVICE_PROVIDER', 'CONTRACTOR', 'VENDOR', 'OTHERS');--> statement-breakpoint
CREATE TYPE "public"."ta_status" AS ENUM('DRAFT', 'SUBMITTED', 'RECOMMENDED', 'APPROVED', 'REJECTED', 'SETTLED');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('ONE_TIME', 'RECURRING');--> statement-breakpoint
CREATE TYPE "public"."tracking_status" AS ENUM('LOADING', 'IN_TRANSIT', 'DELIVERED');--> statement-breakpoint
CREATE TYPE "public"."travel_mode" AS ENUM('AIR', 'TRAIN', 'CAR', 'BUS', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."unloading_facility" AS ENUM('PUMP', 'CRANE', 'MANUAL', 'OTHERS');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'OPERATIONS');--> statement-breakpoint
CREATE TABLE "banks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_name" text NOT NULL,
	"branch_name" text,
	"account_name" text NOT NULL,
	"account_number" text NOT NULL,
	"ifsc_code" text NOT NULL,
	"upi_id" text,
	"payment_narration_template" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"address_line" text,
	"city" text,
	"state" text,
	"pincode" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"contact_person_name" text,
	"contact_person_mobile" text,
	"contact_person_email" text,
	"storage_type" text,
	"bulk_capacity_kl" numeric(10, 2),
	"drum_capacity_count" integer,
	"working_hours" text,
	"holiday_calendar" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "branches_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "client_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"sales_person_id" varchar NOT NULL,
	"assignment_type" "assignment_type" DEFAULT 'PRIMARY' NOT NULL,
	"assigned_date" timestamp DEFAULT now() NOT NULL,
	"assigned_by" varchar NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"order_id" varchar NOT NULL,
	"vehicle_number" text NOT NULL,
	"driver_name" text NOT NULL,
	"driver_phone" text,
	"current_location" text,
	"destination_location" text,
	"distance_remaining" integer,
	"estimated_arrival" timestamp,
	"status" "tracking_status" DEFAULT 'LOADING' NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" "client_category" NOT NULL,
	"billing_address_line" text,
	"billing_city" text,
	"billing_pincode" text,
	"billing_state" text,
	"billing_country" text DEFAULT 'India',
	"gst_number" text,
	"pan_number" text,
	"msme_number" text,
	"incorporation_cert_number" text,
	"incorporation_date" timestamp,
	"company_type" "company_type",
	"contact_person_name" text,
	"mobile_number" text,
	"email" text,
	"communication_preferences" text[],
	"payment_terms" integer DEFAULT 30,
	"credit_limit" numeric(15, 2),
	"bank_interest_applicable" "bank_interest",
	"interest_percent" numeric(5, 2),
	"po_required" boolean DEFAULT false,
	"invoicing_emails" text[],
	"gst_certificate_uploaded" boolean DEFAULT false,
	"pan_copy_uploaded" boolean DEFAULT false,
	"security_cheque_uploaded" boolean DEFAULT false,
	"aadhar_card_uploaded" boolean DEFAULT false,
	"agreement_uploaded" boolean DEFAULT false,
	"po_rate_contract_uploaded" boolean DEFAULT false,
	"gst_certificate_url" text,
	"pan_copy_url" text,
	"security_cheque_url" text,
	"aadhar_card_url" text,
	"agreement_url" text,
	"po_rate_contract_url" text,
	"primary_sales_person_id" varchar,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_profile" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legal_name" text NOT NULL,
	"trade_name" text,
	"entity_type" text NOT NULL,
	"gstin" varchar(15),
	"gstin_state" text,
	"pan" varchar(10),
	"cin_registration_number" text,
	"year_of_incorporation" integer,
	"registered_address_line1" text NOT NULL,
	"registered_address_line2" text,
	"registered_city" text NOT NULL,
	"registered_state" text NOT NULL,
	"registered_pincode" varchar(6) NOT NULL,
	"corporate_address_line1" text,
	"corporate_address_line2" text,
	"corporate_city" text,
	"corporate_state" text,
	"corporate_pincode" varchar(6),
	"primary_contact_name" text NOT NULL,
	"primary_contact_designation" text,
	"primary_contact_mobile" varchar(10) NOT NULL,
	"primary_contact_email" text NOT NULL,
	"accounts_contact_name" text,
	"accounts_contact_mobile" varchar(10),
	"accounts_contact_email" text,
	"bank_name" text,
	"branch_name" text,
	"account_name" text,
	"account_number" text,
	"ifsc_code" varchar(11),
	"default_invoice_prefix" text DEFAULT 'INV',
	"office_working_hours" text,
	"godown_working_hours" text,
	"company_website_url" text,
	"company_logo" text,
	"whatsapp_business_number" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_agreements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"agreement_number" text NOT NULL,
	"credit_limit" numeric(15, 2) NOT NULL,
	"payment_terms" integer NOT NULL,
	"interest_rate" numeric(5, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"signed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_agreements_agreement_number_unique" UNIQUE("agreement_number")
);
--> statement-breakpoint
CREATE TABLE "delivery_challans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challan_number" text NOT NULL,
	"dispatch_id" varchar NOT NULL,
	"sales_order_id" varchar NOT NULL,
	"challan_date" timestamp DEFAULT now() NOT NULL,
	"customer_name" text NOT NULL,
	"customer_address" text NOT NULL,
	"vehicle_number" text NOT NULL,
	"driver_name" text NOT NULL,
	"total_quantity" numeric(15, 3) NOT NULL,
	"total_value" numeric(15, 2) NOT NULL,
	"remarks" text,
	"received_by_name" text,
	"received_by_signature" text,
	"delivery_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_challans_challan_number_unique" UNIQUE("challan_number")
);
--> statement-breakpoint
CREATE TABLE "delivery_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_number" text NOT NULL,
	"sales_order_id" varchar NOT NULL,
	"vehicle_id" varchar,
	"driver_id" varchar,
	"planned_date" timestamp NOT NULL,
	"estimated_departure_time" timestamp,
	"estimated_arrival_time" timestamp,
	"actual_departure_time" timestamp,
	"actual_arrival_time" timestamp,
	"status" "delivery_plan_status" DEFAULT 'PLANNED' NOT NULL,
	"route" text,
	"estimated_distance" numeric(10, 2),
	"estimated_fuel_cost" numeric(15, 2),
	"loading_point" text,
	"delivery_point" text,
	"special_instructions" text,
	"created_by_user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_plans_plan_number_unique" UNIQUE("plan_number")
);
--> statement-breakpoint
CREATE TABLE "dispatches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispatch_number" text NOT NULL,
	"delivery_plan_id" varchar NOT NULL,
	"sales_order_id" varchar NOT NULL,
	"vehicle_id" varchar NOT NULL,
	"driver_id" varchar NOT NULL,
	"status" "dispatch_status" DEFAULT 'PENDING' NOT NULL,
	"dispatch_date" timestamp DEFAULT now() NOT NULL,
	"loading_start_time" timestamp,
	"loading_end_time" timestamp,
	"departure_time" timestamp,
	"arrival_time" timestamp,
	"delivery_completion_time" timestamp,
	"current_location" text,
	"delivery_challan_number" text,
	"eway_bill_number" text,
	"vehicle_number" text NOT NULL,
	"driver_mobile" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dispatches_dispatch_number_unique" UNIQUE("dispatch_number")
);
--> statement-breakpoint
CREATE TABLE "eway_bills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eway_number" text NOT NULL,
	"order_id" varchar NOT NULL,
	"vehicle_number" text NOT NULL,
	"driver_name" text NOT NULL,
	"driver_phone" text,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"is_extended" boolean DEFAULT false NOT NULL,
	"extension_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "eway_bills_eway_number_unique" UNIQUE("eway_number")
);
--> statement-breakpoint
CREATE TABLE "follow_ups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar NOT NULL,
	"assigned_user_id" varchar NOT NULL,
	"follow_up_date" timestamp NOT NULL,
	"remarks" text NOT NULL,
	"status" "follow_up_status" DEFAULT 'PENDING' NOT NULL,
	"completed_at" timestamp,
	"next_follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "godown_addresses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_profile_id" varchar,
	"nickname" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"pincode" varchar(6) NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_follow_ups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" varchar NOT NULL,
	"assigned_user_id" varchar NOT NULL,
	"follow_up_date" timestamp NOT NULL,
	"type" varchar NOT NULL,
	"description" text NOT NULL,
	"priority" varchar DEFAULT 'MEDIUM' NOT NULL,
	"follow_up_type" "lead_follow_up_type" DEFAULT 'CALL' NOT NULL,
	"remarks" text NOT NULL,
	"status" "follow_up_status" DEFAULT 'PENDING' NOT NULL,
	"completed_at" timestamp,
	"next_follow_up_date" timestamp,
	"outcome" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_number" text NOT NULL,
	"company_name" text NOT NULL,
	"contact_person_name" text NOT NULL,
	"mobile_number" text,
	"email" text,
	"lead_source" "lead_source" NOT NULL,
	"lead_status" "lead_status" DEFAULT 'NEW' NOT NULL,
	"interested_products" text[],
	"notes" text,
	"assigned_to_user_id" varchar,
	"primary_sales_person_id" varchar,
	"client_id" varchar,
	"last_follow_up_date" timestamp,
	"next_follow_up_date" timestamp,
	"follow_up_priority" "lead_follow_up_priority" DEFAULT 'MEDIUM',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leads_lead_number_unique" UNIQUE("lead_number")
);
--> statement-breakpoint
CREATE TABLE "number_series" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_type" text NOT NULL,
	"prefix" text NOT NULL,
	"current_number" integer DEFAULT 1 NOT NULL,
	"number_length" integer DEFAULT 4 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_number" text NOT NULL,
	"lead_id" varchar,
	"client_id" varchar NOT NULL,
	"stage" "opportunity_stage" DEFAULT 'QUALIFICATION' NOT NULL,
	"estimated_value" numeric(15, 2) NOT NULL,
	"probability" integer DEFAULT 50 NOT NULL,
	"expected_close_date" timestamp NOT NULL,
	"products" text[],
	"requirements" text,
	"competitor_info" text,
	"assigned_to_user_id" varchar NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "opportunities_opportunity_number_unique" UNIQUE("opportunity_number")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"client_id" varchar NOT NULL,
	"sales_person_id" varchar NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"status" "order_status" DEFAULT 'PENDING_AGREEMENT' NOT NULL,
	"description" text,
	"credit_agreement_required" boolean DEFAULT true NOT NULL,
	"credit_agreement_id" varchar,
	"expected_delivery_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"order_id" varchar,
	"amount" numeric(15, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_at" timestamp,
	"reminders_sent" integer DEFAULT 0,
	"last_reminder_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plant_addresses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_profile_id" varchar,
	"nickname" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"pincode" varchar(6) NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_master" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_code" text NOT NULL,
	"product_family" text NOT NULL,
	"grade" text,
	"name" text NOT NULL,
	"description" text,
	"packaging" text NOT NULL,
	"unit" text DEFAULT 'MT' NOT NULL,
	"density_factor" numeric(5, 3),
	"drums_per_mt" integer,
	"hsn_code" text,
	"tax_rate" numeric(5, 2) DEFAULT '18.00',
	"batch_tracking" boolean DEFAULT false,
	"shelf_life_days" integer,
	"qc_parameters" text[],
	"min_order_quantity" numeric(10, 2),
	"max_order_quantity" numeric(10, 2),
	"reorder_level" numeric(10, 2),
	"total_quantity" text,
	"rate" numeric(15, 2),
	"total_amount" numeric(15, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_master_product_code_unique" UNIQUE("product_code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"description" text,
	"hsn_code" text,
	"unit" text DEFAULT 'KG' NOT NULL,
	"current_price" numeric(15, 2),
	"gst_rate" numeric(5, 2) DEFAULT '18.00' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" varchar NOT NULL,
	"item_code" text NOT NULL,
	"item_description" text NOT NULL,
	"quantity_ordered" numeric(15, 3) NOT NULL,
	"unit_of_measure" text NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"total_line_value" numeric(15, 2) NOT NULL,
	"product_master_id" varchar,
	"product_name" text,
	"product_family" text,
	"product_grade" text,
	"hsn_code" text,
	"delivery_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"po_number" text NOT NULL,
	"po_date" timestamp DEFAULT now() NOT NULL,
	"revision_number" integer DEFAULT 0,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"supplier_id" varchar NOT NULL,
	"supplier_name" text NOT NULL,
	"supplier_contact_person" text,
	"supplier_email" text,
	"supplier_phone" text,
	"buyer_name" text NOT NULL,
	"department" text,
	"cost_center" text,
	"approver_name" text,
	"created_by" varchar NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"tax_amount" numeric(15, 2),
	"discount_amount" numeric(15, 2),
	"delivery_date" timestamp,
	"delivery_address" text,
	"notes" text,
	"terms" text,
	"order_id" varchar,
	"client_id" varchar,
	"amount" numeric(15, 2),
	"issued_at" timestamp,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_orders_po_number_unique" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"description" text,
	"quantity" numeric(15, 3) NOT NULL,
	"unit" text NOT NULL,
	"rate" numeric(15, 2) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_number" text NOT NULL,
	"opportunity_id" varchar,
	"client_id" varchar NOT NULL,
	"quotation_date" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp NOT NULL,
	"status" "quotation_status" DEFAULT 'DRAFT' NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT '0',
	"discount_amount" numeric(15, 2) DEFAULT '0',
	"tax_amount" numeric(15, 2) DEFAULT '0',
	"grand_total" numeric(15, 2) NOT NULL,
	"payment_terms" text,
	"delivery_terms" text,
	"special_instructions" text,
	"prepared_by_user_id" varchar NOT NULL,
	"approved_by_user_id" varchar,
	"approval_status" "approval_status" DEFAULT 'PENDING' NOT NULL,
	"approval_comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quotations_quotation_number_unique" UNIQUE("quotation_number")
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"sales_order_number" text NOT NULL,
	"invoice_number" text NOT NULL,
	"vehicle_number" text NOT NULL,
	"location" text NOT NULL,
	"transporter_id" varchar NOT NULL,
	"gross_weight" numeric(10, 2) NOT NULL,
	"tare_weight" numeric(10, 2) NOT NULL,
	"net_weight" numeric(10, 2) NOT NULL,
	"entire_weight" numeric(10, 2) NOT NULL,
	"drum_quantity" integer NOT NULL,
	"per_drum_weight" numeric(10, 2) NOT NULL,
	"client_id" varchar NOT NULL,
	"basic_rate" numeric(15, 2) NOT NULL,
	"gst_percent" numeric(5, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"basic_rate_purchase" numeric(15, 2) NOT NULL,
	"product_id" varchar NOT NULL,
	"salesperson_id" varchar,
	"delivery_status" "delivery_status" DEFAULT 'RECEIVING' NOT NULL,
	"delivery_challan_signed" boolean DEFAULT false NOT NULL,
	"delivery_challan_signed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sales_sales_order_number_unique" UNIQUE("sales_order_number"),
	CONSTRAINT "sales_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sales_order_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"description" text,
	"quantity" numeric(15, 3) NOT NULL,
	"unit" text NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"total_price" numeric(15, 2) NOT NULL,
	"allocated_quantity" numeric(15, 3) DEFAULT '0',
	"delivered_quantity" numeric(15, 3) DEFAULT '0',
	"delivery_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"quotation_id" varchar,
	"client_id" varchar NOT NULL,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"expected_delivery_date" timestamp NOT NULL,
	"status" "sales_order_status" DEFAULT 'DRAFT' NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"advance_received" numeric(15, 2) DEFAULT '0',
	"credit_check_status" "credit_check_status" DEFAULT 'PENDING' NOT NULL,
	"credit_limit" numeric(15, 2),
	"payment_terms" text,
	"delivery_address" text,
	"special_instructions" text,
	"sales_person_id" varchar NOT NULL,
	"approved_by_user_id" varchar,
	"branch_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sales_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "sales_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"sales_person_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"volume" numeric(15, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_addresses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"address_line" text NOT NULL,
	"city" text NOT NULL,
	"pincode" text NOT NULL,
	"contact_person_name" text,
	"contact_person_mobile" text,
	"delivery_address_name" text,
	"google_location" text,
	"delivery_window_from" text,
	"delivery_window_to" text,
	"unloading_facility" "unloading_facility",
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_code" text NOT NULL,
	"supplier_name" text NOT NULL,
	"trade_name" text,
	"supplier_type" "supplier_type" DEFAULT 'VENDOR' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"contact_person_name" text,
	"contact_email" text,
	"contact_phone" text,
	"fax" text,
	"website" text,
	"registered_address_street" text,
	"registered_address_city" text,
	"registered_address_state" text,
	"registered_address_country" text DEFAULT 'India',
	"registered_address_postal_code" text,
	"shipping_address_street" text,
	"shipping_address_city" text,
	"shipping_address_state" text,
	"shipping_address_country" text,
	"shipping_address_postal_code" text,
	"billing_address_street" text,
	"billing_address_city" text,
	"billing_address_state" text,
	"billing_address_country" text,
	"billing_address_postal_code" text,
	"tax_id" text,
	"bank_account_number" text,
	"bank_name" text,
	"bank_branch" text,
	"swift_iban_code" text,
	"payment_terms" integer DEFAULT 30,
	"preferred_currency" text DEFAULT 'INR',
	"name" text,
	"gstin" text,
	"pan" text,
	"address_line" text,
	"city" text,
	"state" text,
	"pincode" text,
	"contact_person_mobile" text,
	"contact_person_email" text,
	"product_categories" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_supplier_code_unique" UNIQUE("supplier_code")
);
--> statement-breakpoint
CREATE TABLE "ta_expenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_advance_id" varchar NOT NULL,
	"expense_date" timestamp NOT NULL,
	"personal_car_kms" numeric(10, 2) DEFAULT '0',
	"room_rent" numeric(10, 2) DEFAULT '0',
	"water" numeric(10, 2) DEFAULT '0',
	"breakfast" numeric(10, 2) DEFAULT '0',
	"lunch" numeric(10, 2) DEFAULT '0',
	"dinner" numeric(10, 2) DEFAULT '0',
	"usage_rate_per_km" numeric(10, 2) DEFAULT '0',
	"train_air_ticket" numeric(10, 2) DEFAULT '0',
	"auto_taxi" numeric(10, 2) DEFAULT '0',
	"rent_a_car" numeric(10, 2) DEFAULT '0',
	"other_transport" numeric(10, 2) DEFAULT '0',
	"telephone" numeric(10, 2) DEFAULT '0',
	"tolls" numeric(10, 2) DEFAULT '0',
	"parking" numeric(10, 2) DEFAULT '0',
	"diesel_petrol" numeric(10, 2) DEFAULT '0',
	"other" numeric(10, 2) DEFAULT '0',
	"daily_total" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" "task_type" NOT NULL,
	"priority" "task_priority" DEFAULT 'MEDIUM' NOT NULL,
	"status" "task_status" DEFAULT 'TODO' NOT NULL,
	"assigned_to" varchar,
	"client_id" varchar,
	"order_id" varchar,
	"mobile_number" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"recurring_interval" integer,
	"next_due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_advances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" varchar NOT NULL,
	"employee_code" text,
	"employee_name" text NOT NULL,
	"designation" text,
	"department" text,
	"phone_no" text,
	"tour_start_date" timestamp NOT NULL,
	"tour_end_date" timestamp NOT NULL,
	"number_of_days" integer NOT NULL,
	"main_destination" text NOT NULL,
	"mode_of_travel" "travel_mode" NOT NULL,
	"vehicle_number" text,
	"purpose_of_journey" "journey_purpose"[],
	"purpose_remarks" text,
	"advance_required" boolean DEFAULT false NOT NULL,
	"advance_amount_requested" numeric(15, 2),
	"sanction_amount_approved" numeric(15, 2),
	"sanction_authority" text,
	"submitted_by" varchar NOT NULL,
	"recommended_by" varchar,
	"approved_by" varchar,
	"status" "ta_status" DEFAULT 'DRAFT' NOT NULL,
	"date_of_approval" timestamp,
	"rejection_reason" text,
	"state_name" text,
	"party_visit" text,
	"sales_person_id" varchar,
	"purpose_of_trip" text,
	"daily_expenses" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "tour_segments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_advance_id" varchar NOT NULL,
	"segment_number" integer NOT NULL,
	"departure_date" timestamp NOT NULL,
	"departure_time" text,
	"arrival_date" timestamp NOT NULL,
	"arrival_time" text,
	"from_location" text NOT NULL,
	"to_location" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transporters" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"phone" text,
	"email" text,
	"address" text,
	"vehicle_capacity" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transporters_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"module" "module" NOT NULL,
	"action" "action" NOT NULL,
	"granted" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"session_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"employee_code" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"mobile_number" text,
	"designation" text,
	"department" text,
	"role" "user_role" DEFAULT 'EMPLOYEE' NOT NULL,
	"approval_limit_amount" numeric(15, 2),
	"work_location" text,
	"branch_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_employee_code_unique" UNIQUE("employee_code"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_number" text NOT NULL,
	"vehicle_type" text,
	"capacity_kl" numeric(8, 2),
	"drum_capacity" integer,
	"transporter_id" varchar,
	"driver_name" text,
	"driver_mobile" text,
	"driver_license" text,
	"fitness_expiry_date" timestamp,
	"permit_expiry_date" timestamp,
	"insurance_expiry_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
ALTER TABLE "client_assignments" ADD CONSTRAINT "client_assignments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_assignments" ADD CONSTRAINT "client_assignments_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_assignments" ADD CONSTRAINT "client_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tracking" ADD CONSTRAINT "client_tracking_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_tracking" ADD CONSTRAINT "client_tracking_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_primary_sales_person_id_users_id_fk" FOREIGN KEY ("primary_sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_agreements" ADD CONSTRAINT "credit_agreements_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_challans" ADD CONSTRAINT "delivery_challans_dispatch_id_dispatches_id_fk" FOREIGN KEY ("dispatch_id") REFERENCES "public"."dispatches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_challans" ADD CONSTRAINT "delivery_challans_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_delivery_plan_id_delivery_plans_id_fk" FOREIGN KEY ("delivery_plan_id") REFERENCES "public"."delivery_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eway_bills" ADD CONSTRAINT "eway_bills_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "godown_addresses" ADD CONSTRAINT "godown_addresses_company_profile_id_company_profile_id_fk" FOREIGN KEY ("company_profile_id") REFERENCES "public"."company_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_follow_ups" ADD CONSTRAINT "lead_follow_ups_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_follow_ups" ADD CONSTRAINT "lead_follow_ups_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_primary_sales_person_id_users_id_fk" FOREIGN KEY ("primary_sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_credit_agreement_id_credit_agreements_id_fk" FOREIGN KEY ("credit_agreement_id") REFERENCES "public"."credit_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_addresses" ADD CONSTRAINT "plant_addresses_company_profile_id_company_profile_id_fk" FOREIGN KEY ("company_profile_id") REFERENCES "public"."company_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_product_id_product_master_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_prepared_by_user_id_users_id_fk" FOREIGN KEY ("prepared_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_transporter_id_transporters_id_fk" FOREIGN KEY ("transporter_id") REFERENCES "public"."transporters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_product_id_product_master_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_rates" ADD CONSTRAINT "sales_rates_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_rates" ADD CONSTRAINT "sales_rates_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_addresses" ADD CONSTRAINT "shipping_addresses_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ta_expenses" ADD CONSTRAINT "ta_expenses_tour_advance_id_tour_advances_id_fk" FOREIGN KEY ("tour_advance_id") REFERENCES "public"."tour_advances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD CONSTRAINT "tour_advances_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD CONSTRAINT "tour_advances_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD CONSTRAINT "tour_advances_recommended_by_users_id_fk" FOREIGN KEY ("recommended_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD CONSTRAINT "tour_advances_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD CONSTRAINT "tour_advances_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD CONSTRAINT "tour_advances_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD CONSTRAINT "tour_advances_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_segments" ADD CONSTRAINT "tour_segments_tour_advance_id_tour_advances_id_fk" FOREIGN KEY ("tour_advance_id") REFERENCES "public"."tour_advances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_transporter_id_transporters_id_fk" FOREIGN KEY ("transporter_id") REFERENCES "public"."transporters"("id") ON DELETE no action ON UPDATE no action;