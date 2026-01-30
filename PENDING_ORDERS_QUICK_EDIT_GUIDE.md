# Pending Orders - Quick Edit Feature Guide

## Overview

The Pending Orders page has been enhanced with two major features:

1. **Advanced Column Filtering** - Filter pending orders by any column with real-time updates
2. **Quick Edit Invoice Numbers** - Inline editing for invoice numbers to correct old data immediately

## Features

### 1. Advanced Column Filtering

All columns in the pending orders table are now filterable with real-time search:

#### Available Filters
- **Sales Order No** - Search by sales order number (e.g., "SRIHM-SO/338/25-26")
- **Customer** - Search by customer name (partial match supported)
- **Invoice** - Search by invoice number (supports multiple invoice numbers)
- **SO Qty** - Filter by sales order quantity
- **Invoiced Qty** - Filter by invoiced quantity
- **Remaining Qty** - Filter by pending/remaining quantity
- **Total Amount** - Filter by total sales amount in rupees

#### How to Use Filters
1. Click on the **Advanced Filters** card
2. Enter search text in any filter field
3. Results update **automatically** as you type
4. Multiple filters work together (AND logic)
5. Click **"Clear All Filters"** to reset all fields

#### Filter Examples
- Find all pending orders for "Raj Corporation": Type "Raj Corporation" in Customer field
- Find orders with remaining qty > 100: Type "100" in Remaining Qty field
- Find orders with pending amount: Type any amount in Total Amount field

#### Status Indicators
- **Active Filters Badge** - Shows count of active filters in the header
- **Results Counter** - Displays "Showing X of Y orders" at the bottom
- Shows **No orders match** message when filters return no results

---

### 2. Quick Edit Invoice Numbers

Correct invoice numbers for old data without creating new invoices.

#### Why This Feature?
- Old data may have incorrect invoice numbers that need correction
- Manual correction of invoices before they were properly linked
- Immediate correction without affecting other invoice data

#### How to Edit an Invoice Number

1. **Hover over an invoice number** in the table
   - You'll see an **edit icon** (pencil) appear
   - The badge will show a hover highlight

2. **Click on the invoice number** to start editing
   - The invoice field transforms into an editable input box
   - Current invoice number is pre-filled

3. **Enter the new invoice number**
   - Clear the old number and type the new one
   - Can use keyboard shortcuts:
     - **Enter** - Save the change
     - **Escape** - Cancel without saving

4. **Save or Cancel**
   - **Green checkmark (✓)** button - Save the change
   - **Red X** button - Cancel editing
   - Pressing **Enter** key also saves
   - Pressing **Escape** key also cancels

#### What Happens When You Save?
- The invoice number is updated in the database
- The pending orders list is automatically refreshed
- A success toast notification appears
- The invoice will now show under the correct number
- Quantities and amounts remain unchanged

#### Example Scenario
```
Sales Order: SRIHM-SO/338/25-26
Current Invoice: INV/2024/001 (INCORRECT)
New Invoice: INV/2024/042 (CORRECT)

Step 1: Hover over "INV/2024/001"
Step 2: Click on the badge
Step 3: Field becomes editable
Step 4: Clear and type "INV/2024/042"
Step 5: Press Enter or click Save
Step 6: Invoice number updated successfully!
```

---

## UI/UX Details

### Color Coding
- **Blue Badge** - Normal invoice number badge
- **Blue Hover** - Invoice ready to be edited
- **Green/Orange Rows** - Status indicators:
  - **Green Row** - Fully invoiced (no pending qty)
  - **Orange Row** - Partially invoiced (has pending qty)

### Summary Card
Shows real-time statistics:
- **Total Sales Orders** - Count of all pending orders
- **Total Pending Qty** - Sum of all remaining quantities
- **Pending Amount** - Total value of uninvoiced amounts
- **Pending Orders** - Count of orders with remaining qty > 0

### Status Messages
- **"Editing invoice number..."** - Shows when editing is in progress
- **"Click to edit invoice number"** - Tooltip on invoice badges
- **"Showing X of Y orders"** - Active filter count

---

## Backend API

### GET /api/sales-operations/pending-orders
**Purpose:** Fetch all pending orders with their invoice information

**Response Example:**
```json
[
  {
    "id": "order-123",
    "salesOrderNumber": "SRIHM-SO/338/25-26",
    "customerName": "Raj Corporation",
    "invoiceNumbers": "INV/2024/001, INV/2024/002",
    "totalSOQty": 1000.00,
    "totalInvoicedQty": 600.00,
    "totalPendingQty": 400.00,
    "totalSalesAmount": 50000.00,
    "totalInvoicedAmount": 30000.00,
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

### PATCH /api/sales-operations/update-invoice-number
**Purpose:** Update an invoice number for quick data correction

**Request:**
```json
{
  "salesOrderNumber": "SRIHM-SO/338/25-26",
  "oldInvoiceNumber": "INV/2024/001",
  "newInvoiceNumber": "INV/2024/042"
}
```

**Response (Success):**
```json
{
  "message": "Invoice number updated successfully",
  "invoiceId": "invoice-456",
  "oldInvoiceNumber": "INV/2024/001",
  "newInvoiceNumber": "INV/2024/042",
  "salesOrderNumber": "SRIHM-SO/338/25-26"
}
```

**Error Responses:**
- `400` - Missing required fields
- `404` - Invoice not found
- `409` - New invoice number already exists for this SO
- `500` - Server error

---

## Data Validation

### When Updating Invoice Numbers
1. **Duplicate Check** - Ensures new invoice number doesn't already exist for the same SO
2. **Existence Check** - Verifies old invoice number exists before updating
3. **Required Fields** - All three fields (SO number, old invoice, new invoice) are mandatory
4. **Empty Value Prevention** - System prevents saving empty invoice numbers

---

## Key Features Summary

| Feature | Benefit |
|---------|---------|
| Real-time Filtering | Instantly find orders without page reload |
| Multi-column Search | Filter by multiple criteria simultaneously |
| Quick Edit | Correct invoice numbers immediately |
| Visual Feedback | Hover hints and status indicators |
| Automatic Refresh | Data updates after saving changes |
| Error Handling | Clear error messages for all scenarios |
| CSV Export | Export filtered results with all details |

---

## Common Workflows

### Workflow 1: Find and Correct a Specific Invoice
1. Use **Sales Order No** filter to find the SO
2. Locate the incorrect invoice number
3. Click the invoice number badge
4. Enter the correct number
5. Press Enter to save

### Workflow 2: Find All Orders by Customer
1. Type customer name in **Customer** filter
2. View all their pending orders
3. Identify which invoices need correction
4. Correct each invoice as needed

### Workflow 3: Find Orders with Large Pending Amounts
1. Type amount in **Total Amount** filter
2. Results show matching orders
3. Quick edit invoices as needed
4. Export results if needed for records

---

## Performance Notes

- Filters are client-side (instant response)
- Inline edits are server-side persisted
- Data refreshes after each update
- Supports tables with thousands of rows

## Support

For issues:
- Check browser console (F12 → Console tab)
- Verify all required fields are filled in edit dialog
- Ensure entered invoice number is correct before saving
- Contact system admin for permission issues

