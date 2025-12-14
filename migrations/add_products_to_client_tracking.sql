-- Add products column to client_tracking table for multiple products support
ALTER TABLE client_tracking ADD COLUMN products TEXT;

-- Add comment for clarity
COMMENT ON COLUMN client_tracking.products IS 'JSON string containing array of products with name, quantity, and unit';