-- Add client_type column to quotations table
ALTER TABLE quotations ADD COLUMN client_type TEXT DEFAULT 'client';

-- Add comment for clarity
COMMENT ON COLUMN quotations.client_type IS 'Tracks whether quotation was created from a lead or existing client';