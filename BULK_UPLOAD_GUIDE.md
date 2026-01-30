# Bulk Upload Feature Guide

## Overview

The Bulk Upload feature allows you to import large amounts of data efficiently using CSV template files. This feature supports:

- **Sales Invoices** - Bulk import of sales invoice records
- **Purchase Invoices** - Bulk import of purchase invoice records
- **Leads** - Bulk import of CRM leads
- **Clients** - Bulk import of client/customer master data

## Access Bulk Upload

1. Navigate to the application menu
2. Look for **Sales Operations** → **Bulk Upload**
3. Or use the direct URL: `/bulk-upload`

## Features

### 1. Template Download
Each data type has a pre-configured CSV template with sample data:
- **Sales Invoice Template**: Download to see required fields
- **Purchase Invoice Template**: Download to see supplier-related fields
- **Leads Template**: Download with contact information format
- **Clients Template**: Download with complete client profile fields

### 2. File Selection
- Drag and drop CSV files onto the upload area
- Or click to browse and select files from your computer
- Supported format: `.csv` (Comma-Separated Values)
- Maximum file size: 10 MB

### 3. Data Preview
Before uploading:
- See a preview of the first 5 rows of your data
- Verify column headers match expected format
- Check data formatting and values

### 4. Upload Status
Real-time feedback during and after upload:
- **Success Count**: Number of records successfully imported
- **Failed Count**: Number of records that failed validation
- **Error Details**: Row-by-row error messages with specific issues
- **Download Error Report**: Option to download detailed error list

## Step-by-Step Usage

### Uploading Sales Invoices

1. **Click Sales Invoice Tab**
   - Shows sales invoice bulk upload interface

2. **Download Template** (Optional)
   ```
   Click "Download Template" button to get sample CSV file
   ```

3. **Prepare Your Data**
   - Use the template as reference
   - Required fields:
     - `invoiceNumber` - Unique invoice identifier
     - `invoiceDate` - Format: YYYY-MM-DD
     - `salesOrderNumber` - Link to sales order
     - `customerId` - Customer/client ID
     - `totalInvoiceAmount` - Total amount (positive number)
   
   - Optional fields:
     - `placeOfSupply` - Supply location
     - `dueDate` - Payment due date (YYYY-MM-DD)
     - `destination` - Delivery destination
     - `dispatchFrom` - Dispatch location
     - `paymentTerms` - Payment conditions
     - `subtotalAmount` - Before tax amount
     - `cgstAmount` - Central GST amount
     - `sgstAmount` - State GST amount
     - `igstAmount` - Integrated GST amount

4. **Select File**
   - Drag file onto upload area, or
   - Click "Select File" and browse to CSV

5. **Preview Data**
   - System shows first 5 rows
   - Verify headers and sample values

6. **Upload**
   - Click "Upload Invoices" button
   - Wait for processing to complete
   - Check success/error counts

### Uploading Purchase Invoices

1. **Click Purchase Invoice Tab**
2. **Prepare Data**
   - Required fields:
     - `invoiceNumber` - Unique invoice number
     - `invoiceDate` - Format: YYYY-MM-DD
     - `supplierId` - Supplier ID
     - `totalInvoiceAmount` - Total amount
   
   - Optional fields:
     - `invoiceType` - TAX_INVOICE, DEBIT_NOTE, etc.
     - `placeOfSupply` - Supply location
     - `dueDate` - Payment due date
     - `paymentTerms` - Payment conditions
     - `subtotalAmount`, `cgstAmount`, `sgstAmount`, `igstAmount` - Tax breakdown

3. **Select File** → **Preview** → **Upload**

### Uploading Leads

1. **Click Leads Tab**
2. **Prepare Data**
   - Required fields:
     - `companyName` - Company/lead name
     - `email` - Valid email address
     - `phone` - Phone number (10+ digits)
   
   - Optional fields:
     - `contactPerson` - Primary contact name
     - `city` - City location
     - `state` - State/province
     - `leadSource` - How you got the lead (WEB, REFERRAL, etc.)
     - `status` - NEW, QUALIFIED, CONVERTED, etc.
     - `estimatedValue` - Potential deal value
     - `notes` - Additional information

3. **Select File** → **Preview** → **Upload**

### Uploading Clients

1. **Click Clients Tab**
2. **Prepare Data**
   - Required fields:
     - `clientName` - Client/company name
     - `email` - Valid email address
     - `phone` - Phone number (10+ digits)
   
   - Optional fields:
     - `clientType` - RETAIL, WHOLESALE, DISTRIBUTOR, etc.
     - `gstNo` - GST registration number
     - `panNo` - PAN/Tax ID
     - `address` - Full address
     - `city`, `state`, `pinCode`, `country` - Location details
     - `paymentTerms` - Credit terms
     - `creditLimit` - Credit limit amount

3. **Select File** → **Preview** → **Upload**

## CSV Format Guidelines

### Header Row
The first row must contain column headers:
```csv
invoiceNumber,invoiceDate,salesOrderNumber,customerId,totalInvoiceAmount
```

### Data Rows
Each subsequent row contains one record:
```csv
INV-001,2025-01-15,SO-001,CUST-001,50000.00
INV-002,2025-01-16,SO-002,CUST-002,75000.00
```

### Special Formatting

**Dates**
- Format: `YYYY-MM-DD`
- Example: `2025-01-15` (January 15, 2025)

**Numbers**
- Decimals: Use `.` (period) not `,` (comma)
- Example: `50000.50` not `50,000.50`
- Negative numbers use `-` prefix: `-1000.00`

**Text with Commas**
- Enclose in quotes:
  ```
  "Smith, John",john@example.com
  ```

**Empty Values**
- Leave blank for optional fields
- Do NOT include the value in quotes
- Example: `INV-001,,SO-001,CUST-001,50000`

### Sample CSV Files

**Sales Invoice Example:**
```csv
invoiceNumber,invoiceDate,salesOrderNumber,customerId,totalInvoiceAmount,placeOfSupply
INV-2025-001,2025-01-15,SO-001,CUST-ABC,50000.00,Delhi
INV-2025-002,2025-01-16,SO-002,CUST-XYZ,75000.00,Mumbai
```

**Purchase Invoice Example:**
```csv
invoiceNumber,invoiceDate,supplierId,totalInvoiceAmount,invoiceType
PO-INV-001,2025-01-15,SUP-123,25000.00,TAX_INVOICE
PO-INV-002,2025-01-16,SUP-456,35000.00,TAX_INVOICE
```

**Leads Example:**
```csv
companyName,contactPerson,email,phone,city,state
Tech Solutions,John Doe,john@techsol.com,9876543210,Bangalore,Karnataka
Retail Corp,Jane Smith,jane@retail.com,9765432109,Delhi,Delhi
```

**Clients Example:**
```csv
clientName,email,phone,gstNo,panNo,city,state
ABC Enterprises,contact@abc.com,9876543210,07AABCD1234F1Z0,AAAPD1234K,Delhi,Delhi
XYZ Industries,info@xyz.com,9765432109,27AABCT2534F1Z5,AABPX5678J,Mumbai,Maharashtra
```

## Error Handling

### Common Errors

**"invoiceNumber is required"**
- Make sure every row has a value in invoiceNumber column
- This field cannot be empty

**"invoiceDate must be YYYY-MM-DD"**
- Date format must be exactly: Year-Month-Day
- Examples: `2025-01-15`, `2024-12-31`
- Not: `15-01-2025` or `01/15/2025`

**"email must be valid"**
- Email must contain @ symbol
- Format: `username@domain.com`
- Examples: `john@company.com`, `sales@business.org`

**"phone must be at least 10 digits"**
- Phone number must have 10+ digits
- System removes non-numeric characters
- Examples: `9876543210`, `98 7654 3210`, `+91-9876543210`

**"totalInvoiceAmount must be a positive number"**
- Amount must be numeric (can include decimals)
- Must be greater than 0
- Examples: `50000`, `50000.00`, `50000.99`

### Response Format

After upload, you'll see:
```json
{
  "summary": {
    "success": 45,
    "failed": 2,
    "total": 47,
    "errors": [
      {
        "row": 12,
        "message": "invoiceDate must be YYYY-MM-DD"
      },
      {
        "row": 35,
        "message": "email must be valid"
      }
    ]
  }
}
```

## Troubleshooting

### Upload Fails with No File Selected Error
- Ensure file is selected before clicking Upload
- File must be in CSV format
- Check file size (max 10 MB)

### All Records Show as Failed
- Check CSV header row matches expected columns
- Verify data formatting (dates, numbers, emails)
- Ensure no special characters in required fields

### Some Records Failed but Others Succeeded
- This is normal - system processes all valid records
- Check the error list for specific issues
- Fix errors and re-upload failed records

### How to Fix and Re-upload

1. Download error report (if available)
2. Open your CSV file in spreadsheet application
3. Correct the rows mentioned in error report
4. Save as CSV format
5. Re-upload the corrected file

## Best Practices

1. **Test First**
   - Always download template first
   - Upload a small test batch (5-10 records)
   - Verify results before uploading large batches

2. **Data Validation**
   - Use spreadsheet formulas to validate dates
   - Check for duplicate invoice numbers before upload
   - Ensure all required fields are filled

3. **Backup**
   - Keep a copy of uploaded CSV for records
   - Export data before bulk changes for backup

4. **Batch Size**
   - Avoid uploading too many records at once (>1000)
   - For large datasets, split into multiple batches
   - Monitor system performance during uploads

5. **Documentation**
   - Document any custom fields in your CSV
   - Keep templates updated with new requirements
   - Note any mapping between old and new IDs

## Performance Considerations

- **Upload Speed**: Typically 100-500 records per minute
- **File Size**: 10 MB maximum per upload
- **Timeout**: 5 minutes per upload request
- **Concurrent**: Only one upload at a time per user

## Support & Help

For issues or questions:
1. Check the **Help** section in the bulk upload interface
2. Review error messages carefully
3. Download template to verify format
4. Contact system administrator if persistent issues

---

**Last Updated**: January 2025
**Version**: 1.0
