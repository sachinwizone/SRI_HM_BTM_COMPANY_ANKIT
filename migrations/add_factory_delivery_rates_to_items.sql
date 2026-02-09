-- Add factory_rate and delivery_rate columns to quotation_items table
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS factory_rate numeric(15,2);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS delivery_rate numeric(15,2);

-- Make the original rate field nullable for backward compatibility
ALTER TABLE quotation_items ALTER COLUMN rate DROP NOT NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotation_items_factory_rate ON quotation_items(factory_rate);
CREATE INDEX IF NOT EXISTS idx_quotation_items_delivery_rate ON quotation_items(delivery_rate);
