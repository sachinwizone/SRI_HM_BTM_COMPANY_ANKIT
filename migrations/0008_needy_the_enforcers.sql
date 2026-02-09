ALTER TYPE "public"."unit_of_measurement" ADD VALUE 'LTR' BEFORE 'PIECE';--> statement-breakpoint
ALTER TYPE "public"."unit_of_measurement" ADD VALUE 'PIECES' BEFORE 'METER';--> statement-breakpoint
ALTER TYPE "public"."unit_of_measurement" ADD VALUE 'UNIT';--> statement-breakpoint
CREATE TABLE "purchase_invoice_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" varchar NOT NULL,
	"payment_amount" numeric(15, 2) NOT NULL,
	"payment_date" timestamp NOT NULL,
	"payment_mode" text DEFAULT 'CASH',
	"reference_number" text,
	"remarks" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quotation_items" ALTER COLUMN "rate" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD COLUMN "factory_rate" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "quotation_items" ADD COLUMN "delivery_rate" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "freight_charged" numeric(15, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "delivery_rate" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "sales_person_id" varchar;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD COLUMN "dispatched_through" text;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "delivery_terms" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;