ALTER TABLE "client_tracking" DROP CONSTRAINT "client_tracking_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "client_tracking" ADD CONSTRAINT "client_tracking_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;