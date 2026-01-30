# Bulk Upload - Quick Reference Card

## 🚀 Quick Start

### Access
URL: `/bulk-upload`

### Select Type
1. Sales Invoices
2. Purchase Invoices
3. Leads
4. Clients

### Upload Process
1. Click **Download Template** (optional)
2. Select CSV file
3. Review preview
4. Click **Upload**
5. Check results

---

## 📋 Required Fields by Type

| Sales Invoice | Purchase Invoice | Leads | Clients |
|---|---|---|---|
| invoiceNumber | invoiceNumber | companyName | clientName |
| invoiceDate | invoiceDate | email | email |
| salesOrderNumber | supplierId | phone | phone |
| customerId | totalInvoiceAmount | | |
| totalInvoiceAmount | | | |

---

## 📝 CSV Format

### Header Row (Required)
```csv
field1,field2,field3,field4
```

### Data Rows
```csv
value1,value2,value3,value4
```

### Rules
- ✅ First row = headers
- ✅ Dates: YYYY-MM-DD
- ✅ Numbers: Use . for decimals
- ✅ Text with commas: Use quotes "text, here"
- ✅ Empty optional fields: Leave blank

---

## ✅ Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| Email | Must contain @ | john@example.com |
| Phone | 10+ digits | 9876543210 |
| Date | YYYY-MM-DD | 2025-01-15 |
| Amount | Positive decimal | 50000.00 |
| Required | Cannot be empty | Must have value |

---

## 🔴 Common Errors

**"invoiceNumber is required"**
→ All rows need invoiceNumber

**"invoiceDate must be YYYY-MM-DD"**
→ Use format: 2025-01-15

**"email must be valid"**
→ Email needs @ symbol

**"phone must be at least 10 digits"**
→ Phone needs 10+ digits

---

## 📊 Response Format

### Success
```json
{
  "success": 45,
  "failed": 2,
  "total": 47,
  "errors": [{"row": 12, "message": "..."}]
}
```

### Meaning
- ✅ 45 records inserted
- ❌ 2 records failed
- 📝 Total: 47 records
- 📋 Errors shown per row

---

## ⚙️ API Endpoints

```
POST /api/bulk-upload/sales-invoices
POST /api/bulk-upload/purchase-invoices
POST /api/bulk-upload/leads
POST /api/bulk-upload/clients
```

All require:
- Authentication (sessionToken cookie)
- File upload (multipart/form-data)
- CSV file format

---

## 🎯 Tips & Tricks

1. **Test First**
   - Always try small batch first
   - Then scale up for larger uploads

2. **Download Template**
   - Use template as reference
   - Match column names exactly

3. **Prepare Data**
   - Open CSV in Excel/Sheets
   - Use formulas to validate dates
   - Check for duplicates

4. **Review Preview**
   - Always check first 5 rows
   - Verify column structure
   - Confirm data looks correct

5. **Handle Errors**
   - Check error messages
   - Fix in spreadsheet
   - Re-upload corrected file

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| Speed | ~1000 records/minute |
| Max Size | 10 MB |
| Max Records | ~50,000 |
| Timeout | 5 minutes |

---

## 🔒 Security

- ✅ Authentication required
- ✅ File size validated
- ✅ File type checked
- ✅ Input sanitized
- ✅ SQL injection prevented
- ✅ All data validated

---

## 📱 Browser Requirements

- ✅ Modern browser (Chrome, Firefox, Safari, Edge)
- ✅ JavaScript enabled
- ✅ Local file access
- ✅ Cookies enabled

---

## 🆘 Troubleshooting

**Upload fails with "No file selected"**
→ Select a CSV file before uploading

**All records show as failed**
→ Check CSV headers match template

**Some records fail, others succeed**
→ This is normal - fix errors and retry

**Can't download template**
→ Check browser file download settings

**Upload takes too long**
→ File too large or slow connection - try smaller batch

---

## 📚 Documentation Links

- **Full Guide:** BULK_UPLOAD_GUIDE.md
- **API Docs:** BULK_UPLOAD_API.md
- **Implementation:** BULK_UPLOAD_IMPLEMENTATION.md
- **Status:** BULK_UPLOAD_COMPLETE.md

---

## 🎓 Sample CSV Files

### Sales Invoice
```csv
invoiceNumber,invoiceDate,salesOrderNumber,customerId,totalInvoiceAmount
INV-001,2025-01-15,SO-001,CUST-001,50000.00
INV-002,2025-01-16,SO-002,CUST-002,75000.00
```

### Leads
```csv
companyName,email,phone
Tech Corp,john@tech.com,9876543210
Retail Co,jane@retail.com,9765432109
```

### Clients
```csv
clientName,email,phone,city
ABC Ltd,contact@abc.com,9876543210,Delhi
XYZ Inc,info@xyz.com,9765432109,Mumbai
```

---

## ✨ Features Included

- ✅ 4-tab interface
- ✅ Drag-drop upload
- ✅ CSV preview
- ✅ Template download
- ✅ Real-time validation
- ✅ Error reporting
- ✅ Status tracking
- ✅ Success notification

---

**Last Updated:** January 2025 | **Version:** 1.0
