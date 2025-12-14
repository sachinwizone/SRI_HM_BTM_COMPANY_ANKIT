ALTER TABLE "client_tracking" ADD COLUMN "products" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "client_type" text DEFAULT 'client';