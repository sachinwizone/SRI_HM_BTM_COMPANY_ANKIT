// Bulk Upload API Routes
// Handles CSV file uploads for sales invoices, purchase invoices, leads, and clients

import type { Express, Request, Response } from "express";
import { requireAuth } from "./auth";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { Readable } from "stream";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept any file - let's be lenient for CSV uploads
    console.log(`📁 File upload: ${file.originalname}, MIME: ${file.mimetype}`);
    cb(null, true);
  }
});

interface BulkUploadResult {
  success: number;
  failed: number;
  total: number;
  errors: { row: number; message: string }[];
}

// Helper function to parse CSV (handles quoted values properly)
async function parseCSV(buffer: Buffer): Promise<Record<string, any>[]> {
  const text = buffer.toString('utf-8');
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());
  console.log('📋 CSV Headers:', headers); // Log headers to see what columns are in the CSV
  
  const rows: Record<string, any>[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length > 0 && values.some(v => v && v.trim())) { // Skip empty rows
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = (values[index] || '').trim();
      });
      rows.push(row);
    }
  }

  return rows;
}

// Helper function to parse a single CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

// Validation helper
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone: string): boolean {
  const re = /^\d{10,}$/;
  return re.test(phone.replace(/\D/g, ''));
}

function validateAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0;
}

function validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(date).getTime());
}

export default function setupBulkUploadRoutes(app: Express) {
  console.log('🔧 Setting up Bulk Upload Routes...');
  
  // Test endpoint to verify routing is working
  app.get('/api/bulk-upload/test', (_req, res) => {
    console.log('✅ Test endpoint reached');
    res.json({ message: 'Bulk upload routes are working' });
  });
  
  // Bulk upload sales invoices
  app.post('/api/bulk-upload/sales-invoices', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const rows = await parseCSV(req.file.buffer);
      if (rows.length === 0) {
        return res.status(400).json({ error: 'CSV file is empty or invalid' });
      }

      const result: BulkUploadResult = {
        success: 0,
        failed: 0,
        total: rows.length,
        errors: []
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // Account for header

        try {
          // Safety check: reject if payment_status or invoice_status are in CSV
          if (row.paymentstatus || row.payment_status || row.invoicestatus || row.invoice_status) {
            result.failed++;
            result.errors.push({
              row: rowNum,
              message: 'ERROR: Do not include payment_status or invoice_status columns in CSV. These are auto-generated. Use the template from the "Get Template" button.'
            });
            continue;
          }

          // Normalize field names (handle both camelCase and snake_case)
          const invoiceNumber = row.invoicenumber || row.invoice_number || '';
          const invoiceDate = row.invoicedate || row.invoice_date || '';
          const invoiceType = row.invoicetype || row.invoice_type || 'TAX_INVOICE';
          const financialYear = row.financialyear || row.financial_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
          const salesOrderNumber = row.salesordernumber || row.sales_order_number || '';
          const customerId = row.customerid || row.customer_id || '';
          const placeOfSupply = row.placeofsupply || row.place_of_supply || '';
          const placeOfSupplyStateCode = row.placeofsupplystatecode || row.place_of_supply_state_code || '18';
          const buyerOrderNumber = row.buyerordernumber || row.buyer_order_number || '';
          const buyerOrderDate = row.buyerorderdate || row.buyer_order_date || '';
          const deliveryNoteNumber = row.deliverynotenumber || row.delivery_note_number || '';
          const ewayBillNumber = row.ewaybillnumber || row.eway_bill_number || '';
          const ewayBillDate = row.ewaybilldate || row.eway_bill_date || '';
          const vehicleNumber = row.vehiclenumber || row.vehicle_number || '';
          const lrNumber = row.lrnumber || row.lr_number || '';
          const lrRrNumber = row.lrrrnumber || row.lr_rr_number || '';
          const partyMobileNumber = row.partymobilenumber || row.party_mobile_number || '';
          const dispatchFrom = row.dispatchfrom || row.dispatch_from || '';
          const dispatchedThrough = row.dispatchedthrough || row.dispatched_through || '';
          const destination = row.destination || '';
          const dueDate = row.duedate || row.due_date || '';
          const paymentTerms = row.paymentterms || row.payment_terms || 'NET 30';
          const paymentMode = row.paymentmode || row.payment_mode || 'NEFT';
          const subtotalAmount = row.subtotalamount || row.subtotal_amount || '0';
          const cgstAmount = row.cgstamount || row.cgst_amount || '0';
          const sgstAmount = row.sgstamount || row.sgst_amount || '0';
          const igstAmount = row.igstamount || row.igst_amount || '0';
          const otherCharges = row.othercharges || row.other_charges || '0';
          const roundOff = row.roundoff || row.round_off || '0';
          const totalInvoiceAmount = row.totalinvoiceamount || row.total_invoice_amount || '0';

          // Validation
          const errors: string[] = [];

          if (!invoiceNumber) errors.push('invoiceNumber is required');
          if (!invoiceDate) errors.push('invoiceDate is required');
          if (invoiceDate && !validateDate(invoiceDate)) errors.push('invoiceDate must be YYYY-MM-DD');
          if (!salesOrderNumber) errors.push('salesOrderNumber is required');
          if (!customerId) errors.push('customerId is required');
          if (!totalInvoiceAmount) errors.push('totalInvoiceAmount is required');
          if (totalInvoiceAmount && !validateAmount(totalInvoiceAmount)) {
            errors.push('totalInvoiceAmount must be a positive number');
          }

          if (errors.length > 0) {
            result.failed++;
            result.errors.push({
              row: rowNum,
              message: errors.join('; ')
            });
            continue;
          }

          // Insert invoice
          await db.execute(sql`
            INSERT INTO sales_invoices (
              invoice_number,
              invoice_date,
              invoice_type,
              financial_year,
              sales_order_number,
              customer_id,
              place_of_supply,
              place_of_supply_state_code,
              buyer_order_number,
              buyer_order_date,
              delivery_note_number,
              eway_bill_number,
              eway_bill_date,
              vehicle_number,
              lr_number,
              lr_rr_number,
              party_mobile_number,
              dispatch_from,
              dispatched_through,
              destination,
              due_date,
              payment_terms,
              payment_mode,
              subtotal_amount,
              cgst_amount,
              sgst_amount,
              igst_amount,
              other_charges,
              round_off,
              total_invoice_amount,
              remaining_balance,
              invoice_status,
              payment_status
            ) VALUES (
              ${invoiceNumber},
              ${invoiceDate},
              ${invoiceType},
              ${financialYear},
              ${salesOrderNumber},
              ${customerId},
              ${placeOfSupply || null},
              ${placeOfSupplyStateCode},
              ${buyerOrderNumber || null},
              ${buyerOrderDate || null},
              ${deliveryNoteNumber || null},
              ${ewayBillNumber || null},
              ${ewayBillDate || null},
              ${vehicleNumber || null},
              ${lrNumber || null},
              ${lrRrNumber || null},
              ${partyMobileNumber || null},
              ${dispatchFrom || null},
              ${dispatchedThrough || null},
              ${destination || null},
              ${dueDate || null},
              ${paymentTerms},
              ${paymentMode},
              ${parseFloat(subtotalAmount) || 0},
              ${parseFloat(cgstAmount) || 0},
              ${parseFloat(sgstAmount) || 0},
              ${parseFloat(igstAmount) || 0},
              ${parseFloat(otherCharges) || 0},
              ${parseFloat(roundOff) || 0},
              ${parseFloat(totalInvoiceAmount)},
              ${parseFloat(totalInvoiceAmount)},
              'DRAFT',
              'PENDING'
            )
          `);

          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            row: rowNum,
            message: error.message || 'Failed to insert record'
          });
        }
      }

      console.log(`✅ Sales invoices bulk upload: ${result.success} success, ${result.failed} failed`);
      res.json({ summary: result });
    } catch (error: any) {
      console.error('❌ Bulk upload sales invoices error:', error);
      res.status(500).json({ error: 'Bulk upload failed', details: error.message });
    }
  });

  // Bulk upload purchase invoices
  app.post('/api/bulk-upload/purchase-invoices', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const rows = await parseCSV(req.file.buffer);
      if (rows.length === 0) {
        return res.status(400).json({ error: 'CSV file is empty or invalid' });
      }

      const result: BulkUploadResult = {
        success: 0,
        failed: 0,
        total: rows.length,
        errors: []
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;

        try {
          // Safety check: reject if payment_status or invoice_status are in CSV
          if (row.paymentstatus || row.payment_status || row.invoicestatus || row.invoice_status) {
            result.failed++;
            result.errors.push({
              row: rowNum,
              message: 'ERROR: Do not include payment_status or invoice_status columns in CSV. These are auto-generated. Use the template from the "Get Template" button.'
            });
            continue;
          }

          // Normalize field names
          const invoiceNumber = row.invoicenumber || row.invoice_number || '';
          const invoiceDate = row.invoicedate || row.invoice_date || '';
          const supplierId = row.supplierid || row.supplier_id || '';
          const placeOfSupply = row.placeofsupply || row.place_of_supply || '';
          const dueDate = row.duedate || row.due_date || '';
          const invoiceType = row.invoicetype || row.invoice_type || '';
          const paymentTerms = row.paymentterms || row.payment_terms || '';
          const subtotalAmount = row.subtotalamount || row.subtotal_amount || '0';
          const cgstAmount = row.cgstamount || row.cgst_amount || '0';
          const sgstAmount = row.sgstamount || row.sgst_amount || '0';
          const igstAmount = row.igstamount || row.igst_amount || '0';
          const totalInvoiceAmount = row.totalinvoiceamount || row.total_invoice_amount || '0';

          const errors: string[] = [];

          if (!invoiceNumber) errors.push('invoiceNumber is required');
          if (!invoiceDate) errors.push('invoiceDate is required');
          if (invoiceDate && !validateDate(invoiceDate)) errors.push('invoiceDate must be YYYY-MM-DD');
          if (!supplierId) errors.push('supplierId is required');
          if (!totalInvoiceAmount) errors.push('totalInvoiceAmount is required');
          if (totalInvoiceAmount && !validateAmount(totalInvoiceAmount)) {
            errors.push('totalInvoiceAmount must be a positive number');
          }

          if (errors.length > 0) {
            result.failed++;
            result.errors.push({
              row: rowNum,
              message: errors.join('; ')
            });
            continue;
          }

          // Insert purchase invoice
          await db.execute(sql`
            INSERT INTO purchase_invoices (
              invoice_number,
              invoice_date,
              supplier_id,
              place_of_supply,
              due_date,
              invoice_type,
              payment_terms,
              subtotal_amount,
              cgst_amount,
              sgst_amount,
              igst_amount,
              total_invoice_amount,
              remaining_balance,
              invoice_status,
              payment_status
            ) VALUES (
              ${invoiceNumber},
              ${invoiceDate},
              ${supplierId},
              ${placeOfSupply || null},
              ${dueDate || null},
              ${invoiceType || 'TAX_INVOICE'},
              ${paymentTerms || null},
              ${parseFloat(subtotalAmount) || 0},
              ${parseFloat(cgstAmount) || 0},
              ${parseFloat(sgstAmount) || 0},
              ${parseFloat(igstAmount) || 0},
              ${parseFloat(totalInvoiceAmount)},
              ${parseFloat(totalInvoiceAmount)},
              'SUBMITTED',
              'PENDING'
            )
          `);

          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            row: rowNum,
            message: error.message || 'Failed to insert record'
          });
        }
      }

      console.log(`✅ Purchase invoices bulk upload: ${result.success} success, ${result.failed} failed`);
      res.json({ summary: result });
    } catch (error: any) {
      console.error('❌ Bulk upload purchase invoices error:', error);
      res.status(500).json({ error: 'Bulk upload failed', details: error.message });
    }
  });
}
