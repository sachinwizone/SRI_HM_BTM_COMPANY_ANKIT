# Bulk Upload API Documentation

## Base URL
```
/api/bulk-upload
```

## Authentication
All bulk upload endpoints require authentication via `sessionToken` cookie.

## Endpoints

### 1. Upload Sales Invoices

**Endpoint:** `POST /api/bulk-upload/sales-invoices`

**Headers:**
```
Content-Type: multipart/form-data
Cookie: sessionToken=<your_session_token>
```

**Request Body:**
```
form-data:
  file: <CSV file>
```

**CSV Columns:**

| Column | Type | Required | Format | Description |
|--------|------|----------|--------|-------------|
| invoiceNumber | String | Yes | Unique | Invoice identifier |
| invoiceDate | String | Yes | YYYY-MM-DD | Invoice date |
| salesOrderNumber | String | Yes | Numeric | Related sales order |
| customerId | String | Yes | Numeric | Customer/client ID |
| totalInvoiceAmount | String | Yes | Decimal | Total invoice amount |
| placeOfSupply | String | No | Text | Supply location |
| dueDate | String | No | YYYY-MM-DD | Payment due date |
| destination | String | No | Text | Delivery destination |
| dispatchFrom | String | No | Text | Dispatch location |
| paymentTerms | String | No | Text | Payment terms/conditions |
| subtotalAmount | String | No | Decimal | Before tax amount |
| cgstAmount | String | No | Decimal | Central GST |
| sgstAmount | String | No | Decimal | State GST |
| igstAmount | String | No | Decimal | Integrated GST |

**Response Success (200):**
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
      }
    ]
  }
}
```

**Response Error (400):**
```json
{
  "error": "No file uploaded"
}
```

**Response Error (500):**
```json
{
  "error": "Bulk upload failed",
  "details": "Error message details"
}
```

---

### 2. Upload Purchase Invoices

**Endpoint:** `POST /api/bulk-upload/purchase-invoices`

**Headers:**
```
Content-Type: multipart/form-data
Cookie: sessionToken=<your_session_token>
```

**Request Body:**
```
form-data:
  file: <CSV file>
```

**CSV Columns:**

| Column | Type | Required | Format | Description |
|--------|------|----------|--------|-------------|
| invoiceNumber | String | Yes | Unique | Invoice identifier |
| invoiceDate | String | Yes | YYYY-MM-DD | Invoice date |
| supplierId | String | Yes | Numeric | Supplier/vendor ID |
| totalInvoiceAmount | String | Yes | Decimal | Total invoice amount |
| invoiceType | String | No | Text | TAX_INVOICE, DEBIT_NOTE, etc. |
| placeOfSupply | String | No | Text | Supply location |
| dueDate | String | No | YYYY-MM-DD | Payment due date |
| paymentTerms | String | No | Text | Payment terms/conditions |
| subtotalAmount | String | No | Decimal | Before tax amount |
| cgstAmount | String | No | Decimal | Central GST |
| sgstAmount | String | No | Decimal | State GST |
| igstAmount | String | No | Decimal | Integrated GST |

**Response Success (200):**
```json
{
  "summary": {
    "success": 30,
    "failed": 0,
    "total": 30,
    "errors": []
  }
}
```

---

### 3. Upload Leads

**Endpoint:** `POST /api/bulk-upload/leads`

**Headers:**
```
Content-Type: multipart/form-data
Cookie: sessionToken=<your_session_token>
```

**Request Body:**
```
form-data:
  file: <CSV file>
```

**CSV Columns:**

| Column | Type | Required | Format | Description |
|--------|------|----------|--------|-------------|
| companyName | String | Yes | Text | Company/lead name |
| email | String | Yes | Email | Valid email address |
| phone | String | Yes | Phone | 10+ digit phone number |
| contactPerson | String | No | Text | Primary contact name |
| city | String | No | Text | City location |
| state | String | No | Text | State/province |
| leadSource | String | No | Text | WEB, REFERRAL, CALL, etc. |
| status | String | No | Text | NEW, QUALIFIED, CONVERTED, etc. |
| estimatedValue | String | No | Decimal | Potential deal value |
| notes | String | No | Text | Additional notes |

**Response Success (200):**
```json
{
  "summary": {
    "success": 25,
    "failed": 1,
    "total": 26,
    "errors": [
      {
        "row": 15,
        "message": "email must be valid; phone must be at least 10 digits"
      }
    ]
  }
}
```

---

### 4. Upload Clients

**Endpoint:** `POST /api/bulk-upload/clients`

**Headers:**
```
Content-Type: multipart/form-data
Cookie: sessionToken=<your_session_token>
```

**Request Body:**
```
form-data:
  file: <CSV file>
```

**CSV Columns:**

| Column | Type | Required | Format | Description |
|--------|------|----------|--------|-------------|
| clientName | String | Yes | Text | Client/company name |
| email | String | Yes | Email | Valid email address |
| phone | String | Yes | Phone | 10+ digit phone number |
| clientType | String | No | Text | RETAIL, WHOLESALE, etc. |
| gstNo | String | No | Text | GST registration number |
| panNo | String | No | Text | PAN/Tax ID |
| address | String | No | Text | Full address |
| city | String | No | Text | City |
| state | String | No | Text | State/province |
| pinCode | String | No | Text | Postal code |
| country | String | No | Text | Country (default: India) |
| paymentTerms | String | No | Text | Credit terms |
| creditLimit | String | No | Decimal | Credit limit amount |

**Response Success (200):**
```json
{
  "summary": {
    "success": 50,
    "failed": 0,
    "total": 50,
    "errors": []
  }
}
```

---

## Example Requests

### Using curl

```bash
# Upload sales invoices
curl -X POST http://localhost:5000/api/bulk-upload/sales-invoices \
  -H "Cookie: sessionToken=your_token" \
  -F "file=@sales_invoices.csv"

# Upload leads
curl -X POST http://localhost:5000/api/bulk-upload/leads \
  -H "Cookie: sessionToken=your_token" \
  -F "file=@leads.csv"
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
const fileInput = document.getElementById('fileInput');
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/bulk-upload/sales-invoices', {
  method: 'POST',
  body: formData,
  credentials: 'include' // Include session cookie
});

const result = await response.json();
console.log('Upload result:', result.summary);
```

### Using Python/Requests

```python
import requests

with open('sales_invoices.csv', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'http://localhost:5000/api/bulk-upload/sales-invoices',
        files=files,
        cookies={'sessionToken': 'your_token'}
    )

result = response.json()
print(f"Success: {result['summary']['success']}")
print(f"Failed: {result['summary']['failed']}")
```

---

## Validation Rules

### Sales Invoices
- `invoiceNumber`: Required, must be unique
- `invoiceDate`: Required, format YYYY-MM-DD, valid date
- `salesOrderNumber`: Required, numeric, must exist
- `customerId`: Required, numeric, must exist
- `totalInvoiceAmount`: Required, positive decimal number

### Purchase Invoices
- `invoiceNumber`: Required, must be unique
- `invoiceDate`: Required, format YYYY-MM-DD, valid date
- `supplierId`: Required, numeric, must exist
- `totalInvoiceAmount`: Required, positive decimal number

### Leads
- `companyName`: Required, non-empty string
- `email`: Required, valid email format (contains @)
- `phone`: Required, 10+ digits when non-numeric chars removed

### Clients
- `clientName`: Required, non-empty string
- `email`: Required, valid email format (contains @)
- `phone`: Required, 10+ digits when non-numeric chars removed
- `creditLimit`: Optional, positive decimal if provided

---

## Error Codes

| HTTP Code | Status | Description |
|-----------|--------|-------------|
| 200 | OK | Upload completed, check summary for success/failed counts |
| 400 | Bad Request | No file uploaded or invalid file type |
| 401 | Unauthorized | Not authenticated or session expired |
| 413 | Payload Too Large | File exceeds 10MB limit |
| 415 | Unsupported Media Type | File is not CSV format |
| 500 | Server Error | Database or processing error |

---

## Data Insertion Details

### Transaction Handling
- Each row is processed independently
- Success or failure of one row doesn't affect others
- Database transaction is committed per row
- On error, that specific row is skipped and logged

### Default Values
- **Sales Invoices**:
  - `invoice_status`: "SUBMITTED"
  - `payment_status`: "PENDING"
  - `remaining_balance`: Set to total_invoice_amount

- **Purchase Invoices**:
  - `invoice_type`: "TAX_INVOICE" (if not provided)
  - `invoice_status`: "SUBMITTED"
  - `payment_status`: "PENDING"
  - `remaining_balance`: Set to total_invoice_amount

- **Leads**:
  - `lead_source`: "OTHER" (if not provided)
  - `status`: "NEW" (if not provided)
  - `created_at`: Current timestamp

- **Clients**:
  - `client_type`: "RETAIL" (if not provided)
  - `country`: "India" (if not provided)
  - `created_at`: Current timestamp

---

## Performance

- **Processing Speed**: ~1000 records per minute
- **File Size Limit**: 10 MB
- **Request Timeout**: 5 minutes
- **Maximum Batch**: No hard limit, but 1000+ records recommended to split into batches

---

## Logging

All bulk upload operations are logged with:
- Upload timestamp
- Data type (sales invoices, purchase invoices, etc.)
- Success count
- Failed count
- Sample errors (if any)

Example log:
```
✅ Sales invoices bulk upload: 45 success, 2 failed
❌ Bulk upload sales invoices error: Invalid date format
```

---

## Integration Notes

### Frontend Integration
The bulk upload uses React Query mutations:
```typescript
const uploadMutation = useMutation({
  mutationFn: async (formData: FormData) => {
    const res = await fetch('/api/bulk-upload/sales-invoices', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    return res.json();
  },
  onSuccess: (data) => {
    // Handle successful upload
  },
  onError: (error) => {
    // Handle upload error
  }
});
```

### Backend Integration
Endpoints are registered in `server/routes.ts`:
```typescript
import setupBulkUploadRoutes from "./bulk-upload-routes";

// In registerRoutes function:
setupBulkUploadRoutes(app);
```

---

## CSV Template Generation

Templates are embedded in the frontend component with sample data for each type:

- **Sales Invoice**: 3 sample rows with typical values
- **Purchase Invoice**: 3 sample rows with supplier data
- **Leads**: 3 sample rows with contact information
- **Clients**: 3 sample rows with complete profile data

Users can download these templates and use them as base for their bulk uploads.

---

**Last Updated**: January 2025
**API Version**: 1.0
