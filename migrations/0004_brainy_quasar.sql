CREATE TABLE "tracking_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracking_id" varchar NOT NULL,
	"status" "tracking_status" NOT NULL,
	"location" text NOT NULL,
	"notes" text,
	"estimated_arrival" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar
);
--> statement-breakpoint
ALTER TABLE "tracking_logs" ADD CONSTRAINT "tracking_logs_tracking_id_client_tracking_id_fk" FOREIGN KEY ("tracking_id") REFERENCES "public"."client_tracking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_logs" ADD CONSTRAINT "tracking_logs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;