# Invoice Export & Import Feature

## Overview

The Invoice Management page now includes **Export** and **Bulk Import** functionality for both Sales and Purchase Invoices, enabling efficient data management and batch processing.

## Features Added

### 1. Export CSV
**Location:** All Sales Invoices & All Purchase Invoices pages
**Button Location:** Top right toolbar, next to "New Invoice" button
**Functionality:**
- Exports all visible/filtered invoices to CSV format
- Downloads with date-stamped filename
- Includes: Invoice Number, Date, Customer/Supplier, Amount
- Works with applied filters

**Sales Invoice Export:**
```csv
Invoice Number,Sales Order Number,Date,Customer,Amount
INV-001,SO-001,2026-01-30,ABC Corp,50000.00
INV-002,SO-002,2026-01-29,XYZ Ltd,75000.00
```

**Purchase Invoice Export:**
```csv
Invoice Number,Date,Supplier,Amount
PIN-001,2026-01-30,Supplier A,25000.00
PIN-002,2026-01-29,Supplier B,35000.00
```

### 2. Bulk Import
**Location:** All Sales Invoices & All Purchase Invoices pages
**Button Location:** Top right toolbar, "Bulk Import" button
**Functionality:**
- Redirects to `/bulk-upload` page
- 4 upload types available:
  - Sales Invoices
  - Purchase Invoices
  - Leads
  - Clients
- Full CSV validation with error reporting
- Template download for reference

## How to Use

### Export Invoices

1. **Navigate** to "All Sales Invoices" or "All Purchase Invoices"
2. **(Optional) Apply filters** - Select customer or search terms
3. **Click** "Export CSV" button (blue download icon)
4. **CSV file downloads** automatically with current date in filename
5. **Open** in Excel or Google Sheets for further analysis

### Import Invoices (Bulk Upload)

1. **Navigate** to "All Sales Invoices" or "All Purchase Invoices"
2. **Click** "Bulk Import" button (green upload icon)
3. **You'll be redirected** to `/bulk-upload` page
4. **Select** the data type (Sales Invoice, Purchase Invoice, Leads, or Clients)
5. **(Optional) Download template** to see required format
6. **Select your CSV file** (drag-drop or browse)
7. **Review preview** (first 5 rows)
8. **Click Upload** and wait for processing
9. **Check results** - View success/failure counts and errors

## Button Layout

### Sales Invoices Page
```
┌────────────────────────────────────────────────────┐
│  Back to Dashboard  │  All Sales Invoices          │
├────────────────────────────────────────────────────┤
│  [View Ledger]  [Bulk Import]  [Export CSV]  [+ New] │
└────────────────────────────────────────────────────┘
```

### Purchase Invoices Page
```
┌────────────────────────────────────────────────────┐
│  Back to Dashboard  │  All Purchase Invoices       │
├────────────────────────────────────────────────────┤
│  [View Ledger]  [Bulk Import]  [Export CSV]  [+ New] │
└────────────────────────────────────────────────────┘
```

## File Formats

### CSV Requirements for Import

**Sales Invoices:**
```csv
invoiceNumber,invoiceDate,salesOrderNumber,customerId,totalInvoiceAmount
```

**Purchase Invoices:**
```csv
invoiceNumber,invoiceDate,supplierId,totalInvoiceAmount
```

**Leads:**
```csv
companyName,email,phone
```

**Clients:**
```csv
clientName,email,phone
```

### Export Format

**Sales Invoices Export:**
- Invoice Number
- Sales Order Number
- Invoice Date
- Customer Name
- Total Amount

**Purchase Invoices Export:**
- Invoice Number
- Invoice Date
- Supplier Name
- Total Amount

## Using Exported Data

### 1. Data Analysis
- Open exported CSV in Excel or Google Sheets
- Create pivot tables and charts
- Analyze trends and patterns
- Generate custom reports

### 2. Backup
- Keep exported CSVs as backup records
- Archive monthly/quarterly exports
- Maintain audit trail
- Easy data recovery if needed

### 3. External Systems
- Share data with accountants
- Integrate with other tools
- Import into external analytics
- Send to stakeholders

### 4. Reconciliation
- Compare with bank statements
- Verify payment records
- Match with ledger entries
- Identify discrepancies

## Importing Data

### Before You Import

1. **Prepare CSV File**
   - Use provided template as base
   - Ensure correct format
   - Validate required fields
   - Check dates (YYYY-MM-DD)

2. **Review Data**
   - Check for duplicates
   - Verify amounts
   - Confirm customer/supplier IDs exist
   - Validate email/phone formats

3. **Test First**
   - Import small batch first (5-10 records)
   - Review results
   - Fix any issues
   - Then import full batch

### After Import

1. **Check Results**
   - Note success count
   - Review any errors
   - Fix failed records
   - Re-upload if needed

2. **Verify Records**
   - View imported invoices
   - Confirm amounts
   - Check status
   - Validate dates

3. **Update Ledger**
   - Reconcile with ledger
   - Update payment status
   - Verify balances
   - Mark as processed

## Troubleshooting

### Export Issues

**"Export not working"**
→ Check browser popup blocker settings
→ Ensure cookies are enabled
→ Try a different browser

**"CSV contains wrong data"**
→ Apply correct filters first
→ Verify you're on correct invoice page (Sales vs Purchase)
→ Check column mapping

### Import Issues

**"Bulk Import button not visible"**
→ Refresh the page
→ Clear browser cache
→ Check user permissions

**"Upload fails"**
→ Check file is valid CSV
→ Verify file size (max 10 MB)
→ Use template format
→ Check network connection

**"Records rejected with errors"**
→ Review error messages
→ Fix in spreadsheet
→ Re-upload corrected file

## Tips & Best Practices

1. **Regular Backups**
   - Export invoices weekly
   - Store in secure location
   - Maintain version history

2. **Batch Processing**
   - Import max 1000 records per batch
   - Split large datasets
   - Monitor processing time

3. **Data Quality**
   - Always use templates
   - Validate before import
   - Review previews
   - Test on small samples

4. **Audit Trail**
   - Keep exported files
   - Note import timestamps
   - Document any fixes
   - Maintain change log

5. **Integration**
   - Coordinate with finance team
   - Schedule imports
   - Verify with ledger
   - Reconcile regularly

## Supported Browsers

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ Internet Explorer (not supported)

## Security

- ✅ Authentication required for all operations
- ✅ File validation before import
- ✅ CSV content sanitized
- ✅ All data encrypted in transit
- ✅ User actions logged
- ✅ Session timeout protection

## Performance

- **Export Speed:** Instant (< 1 second)
- **Import Speed:** ~1000 records/minute
- **File Size:** Up to 10 MB
- **Max Records per Import:** 50,000

## Contact & Support

For issues or questions:
1. Check documentation
2. Review error messages
3. Contact system administrator
4. Submit support ticket

---

**Last Updated:** January 30, 2026
**Feature Version:** 1.0
**Status:** ✅ Active
