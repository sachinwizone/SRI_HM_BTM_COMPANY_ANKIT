-- Add delivery_rate column to quotations table
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS delivery_rate text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotations_delivery_rate ON quotations(delivery_rate);
