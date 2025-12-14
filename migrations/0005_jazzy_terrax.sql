CREATE TYPE "public"."freight_type" AS ENUM('PAID', 'TO_PAY', 'INCLUDED');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('DRAFT', 'SUBMITTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."invoice_type" AS ENUM('TAX_INVOICE', 'PROFORMA', 'CREDIT_NOTE', 'DEBIT_NOTE');--> statement-breakpoint
CREATE TYPE "public"."party_type" AS ENUM('CUSTOMER', 'SUPPLIER', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."payment_mode" AS ENUM('CASH', 'CHEQUE', 'NEFT', 'RTGS', 'UPI', 'CARD', 'ONLINE');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('SALE', 'PURCHASE', 'OPENING', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."unit_of_measurement" AS ENUM('DRUM', 'KG', 'LITRE', 'PIECE', 'METER', 'TON', 'BOX');--> statement-breakpoint
ALTER TYPE "public"."ta_status" ADD VALUE 'PROCESSING' BEFORE 'SETTLED';--> statement-breakpoint
CREATE TABLE "invoice_companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"state_code" text NOT NULL,
	"pincode" text NOT NULL,
	"gstin" text,
	"pan" text,
	"udyam_number" text,
	"import_export_code" text,
	"lei_code" text,
	"contact_number" text,
	"email" text,
	"bank_name" text,
	"bank_account_number" text,
	"bank_ifsc_code" text,
	"bank_branch" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_companies_gstin_unique" UNIQUE("gstin")
);
--> statement-breakpoint
CREATE TABLE "invoice_parties" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_name" text NOT NULL,
	"party_type" "party_type" NOT NULL,
	"billing_address" text NOT NULL,
	"shipping_address" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"state_code" text NOT NULL,
	"pincode" text NOT NULL,
	"gstin" text,
	"pan" text,
	"contact_person" text,
	"contact_number" text,
	"email" text,
	"credit_days" integer DEFAULT 0,
	"credit_limit" numeric(15, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_name" text NOT NULL,
	"product_description" text,
	"hsn_sac_code" text NOT NULL,
	"unit_of_measurement" "unit_of_measurement" NOT NULL,
	"gst_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"is_service" boolean DEFAULT false NOT NULL,
	"opening_stock" numeric(15, 3) DEFAULT '0',
	"current_stock" numeric(15, 3) DEFAULT '0',
	"minimum_stock_level" numeric(15, 3) DEFAULT '0',
	"purchase_rate" numeric(15, 2) DEFAULT '0',
	"sale_rate" numeric(15, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_transporters" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transporter_name" text NOT NULL,
	"transporter_gstin" text,
	"contact_number" text,
	"address" text,
	"vehicle_numbers" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_invoice_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" varchar NOT NULL,
	"line_number" integer NOT NULL,
	"product_id" varchar,
	"product_name" text NOT NULL,
	"product_description" text,
	"hsn_sac_code" text NOT NULL,
	"quantity" numeric(15, 3) NOT NULL,
	"unit_of_measurement" "unit_of_measurement" NOT NULL,
	"rate_per_unit" numeric(15, 2) NOT NULL,
	"gross_amount" numeric(15, 2) NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT '0',
	"discount_amount" numeric(15, 2) DEFAULT '0',
	"taxable_amount" numeric(15, 2) NOT NULL,
	"cgst_rate" numeric(5, 2) DEFAULT '0',
	"cgst_amount" numeric(15, 2) DEFAULT '0',
	"sgst_rate" numeric(5, 2) DEFAULT '0',
	"sgst_amount" numeric(15, 2) DEFAULT '0',
	"igst_rate" numeric(5, 2) DEFAULT '0',
	"igst_amount" numeric(15, 2) DEFAULT '0',
	"total_amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_date" timestamp NOT NULL,
	"invoice_type" "invoice_type" DEFAULT 'TAX_INVOICE' NOT NULL,
	"financial_year" text NOT NULL,
	"supplier_id" varchar NOT NULL,
	"supplier_invoice_number" text NOT NULL,
	"supplier_invoice_date" timestamp NOT NULL,
	"grn_number" text,
	"place_of_supply" text NOT NULL,
	"place_of_supply_state_code" text NOT NULL,
	"payment_terms" text DEFAULT '30 Days Credit' NOT NULL,
	"payment_mode" "payment_mode" DEFAULT 'NEFT',
	"due_date" timestamp,
	"subtotal_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"cgst_amount" numeric(15, 2) DEFAULT '0',
	"sgst_amount" numeric(15, 2) DEFAULT '0',
	"igst_amount" numeric(15, 2) DEFAULT '0',
	"other_charges" numeric(15, 2) DEFAULT '0',
	"round_off" numeric(15, 2) DEFAULT '0',
	"total_invoice_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_in_words" text,
	"invoice_status" "invoice_status" DEFAULT 'DRAFT' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_by" varchar,
	"modified_at" timestamp DEFAULT now(),
	CONSTRAINT "purchase_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "sales_invoice_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" varchar NOT NULL,
	"line_number" integer NOT NULL,
	"product_id" varchar NOT NULL,
	"product_name" text NOT NULL,
	"product_description" text,
	"hsn_sac_code" text NOT NULL,
	"quantity" numeric(15, 3) NOT NULL,
	"unit_of_measurement" "unit_of_measurement" NOT NULL,
	"rate_per_unit" numeric(15, 2) NOT NULL,
	"gross_amount" numeric(15, 2) NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT '0',
	"discount_amount" numeric(15, 2) DEFAULT '0',
	"taxable_amount" numeric(15, 2) NOT NULL,
	"cgst_rate" numeric(5, 2) DEFAULT '0',
	"cgst_amount" numeric(15, 2) DEFAULT '0',
	"sgst_rate" numeric(5, 2) DEFAULT '0',
	"sgst_amount" numeric(15, 2) DEFAULT '0',
	"igst_rate" numeric(5, 2) DEFAULT '0',
	"igst_amount" numeric(15, 2) DEFAULT '0',
	"total_amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_date" timestamp NOT NULL,
	"invoice_type" "invoice_type" DEFAULT 'TAX_INVOICE' NOT NULL,
	"financial_year" text NOT NULL,
	"customer_id" varchar NOT NULL,
	"billing_party_id" varchar,
	"shipping_party_id" varchar,
	"place_of_supply" text NOT NULL,
	"place_of_supply_state_code" text NOT NULL,
	"buyer_order_number" text,
	"buyer_order_date" timestamp,
	"delivery_note_number" text,
	"reference_number" text,
	"reference_date" timestamp,
	"irn_number" text,
	"irn_ack_number" text,
	"irn_ack_date" timestamp,
	"qr_code_data" text,
	"eway_bill_number" text,
	"eway_bill_date" timestamp,
	"eway_bill_valid_upto" timestamp,
	"eway_bill_distance" numeric(10, 2),
	"transaction_type" text,
	"supply_type" text,
	"transporter_id" varchar,
	"transporter_name" text,
	"vehicle_number" text,
	"lr_rr_number" text,
	"lr_rr_date" timestamp,
	"dispatch_from" text,
	"dispatch_city" text,
	"port_of_loading" text,
	"port_of_discharge" text,
	"destination" text,
	"freight_type" "freight_type" DEFAULT 'TO_PAY',
	"payment_terms" text DEFAULT '30 Days Credit' NOT NULL,
	"payment_mode" "payment_mode" DEFAULT 'NEFT',
	"due_date" timestamp,
	"interest_rate_after_due" numeric(5, 2) DEFAULT '0',
	"subtotal_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"cgst_amount" numeric(15, 2) DEFAULT '0',
	"sgst_amount" numeric(15, 2) DEFAULT '0',
	"igst_amount" numeric(15, 2) DEFAULT '0',
	"other_charges" numeric(15, 2) DEFAULT '0',
	"round_off" numeric(15, 2) DEFAULT '0',
	"total_invoice_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_in_words" text,
	"invoice_status" "invoice_status" DEFAULT 'DRAFT' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_by" varchar,
	"modified_at" timestamp DEFAULT now(),
	CONSTRAINT "sales_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "transporter_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD COLUMN "departure_location" text;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD COLUMN "tour_programme" text;--> statement-breakpoint
ALTER TABLE "tour_advances" ADD COLUMN "status_history" text;--> statement-breakpoint
ALTER TABLE "purchase_invoice_items" ADD CONSTRAINT "purchase_invoice_items_invoice_id_purchase_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."purchase_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_invoice_items" ADD CONSTRAINT "purchase_invoice_items_product_id_invoice_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."invoice_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_invoices" ADD CONSTRAINT "purchase_invoices_supplier_id_invoice_parties_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."invoice_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_invoices" ADD CONSTRAINT "purchase_invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_invoices" ADD CONSTRAINT "purchase_invoices_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoice_items" ADD CONSTRAINT "sales_invoice_items_invoice_id_sales_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."sales_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoice_items" ADD CONSTRAINT "sales_invoice_items_product_id_invoice_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."invoice_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_customer_id_invoice_parties_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."invoice_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_billing_party_id_invoice_parties_id_fk" FOREIGN KEY ("billing_party_id") REFERENCES "public"."invoice_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_shipping_party_id_invoice_parties_id_fk" FOREIGN KEY ("shipping_party_id") REFERENCES "public"."invoice_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_transporter_id_invoice_transporters_id_fk" FOREIGN KEY ("transporter_id") REFERENCES "public"."invoice_transporters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;