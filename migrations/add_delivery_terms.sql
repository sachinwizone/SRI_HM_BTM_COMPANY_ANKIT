-- Add delivery_terms column to quotations and sales_orders tables
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS delivery_terms text;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS delivery_terms text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotations_delivery_terms ON quotations(delivery_terms);
CREATE INDEX IF NOT EXISTS idx_sales_orders_delivery_terms ON sales_orders(delivery_terms);
