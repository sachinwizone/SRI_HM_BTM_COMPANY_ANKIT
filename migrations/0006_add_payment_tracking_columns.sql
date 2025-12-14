-- Add payment tracking columns to purchase_invoices table
ALTER TABLE purchase_invoices 
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15, 2) NOT NULL DEFAULT '0',
ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(15, 2) NOT NULL DEFAULT '0';

-- Update existing records: set remaining_balance equal to total_invoice_amount for all existing invoices
UPDATE purchase_invoices 
SET remaining_balance = total_invoice_amount 
WHERE remaining_balance = 0 AND paid_amount = 0;

-- Also add to sales_invoices table for consistency
ALTER TABLE sales_invoices 
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15, 2) NOT NULL DEFAULT '0',
ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(15, 2) NOT NULL DEFAULT '0';

-- Update existing sales records: set remaining_balance equal to total_invoice_amount
UPDATE sales_invoices 
SET remaining_balance = total_invoice_amount 
WHERE remaining_balance = 0 AND paid_amount = 0;
