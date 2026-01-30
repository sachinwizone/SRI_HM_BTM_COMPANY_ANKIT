# Pending Orders Calculation - Root Cause Analysis & Fix

## Issue Summary
Invoice SRIHM/559/25-26 with qty 50 is not showing under sales order SRIHM-SO/338/25-26 with qty 100, so the remaining qty is not displaying as 50.

## Root Cause
The `sales_invoices` table has the `sales_order_number` field set to **NULL** for this invoice, which breaks the linkage between the invoice and the sales order.

### Database State:
```
Sales Order: SRIHM-SO/338/25-26
  - Customer: ABDUL MUNIM BARBHUIYA
  - Qty: 100
  - Amount: 9900.00
  
Invoice: SRIHM/559/25-26
  - Customer ID: e877b017-6059-4389-a698-49c44bd6eb49
  - sales_order_number: NULL  ❌ (This should be "SRIHM-SO/338/25-26")
  - Qty: 50
  - Amount: 5841.00
```

## The Fix
Run this SQL command to link the invoice to the sales order:

```sql
UPDATE sales_invoices 
SET sales_order_number = 'SRIHM-SO/338/25-26' 
WHERE invoice_number = 'SRIHM/559/25-26';
```

## Expected Result After Fix
Once the SQL is executed:
- Sales Order Qty: 100
- Invoiced Qty: 50
- **Remaining Qty: 50** ✅

## Affected Fields
The calculation logic in the API has been corrected to:
1. Sum ALL invoice amounts (not just the first one)
2. Calculate pending = Total SO Qty - Total Invoiced Qty
3. Show all invoices linked to each sales order (comma-separated)
4. Display remaining qty even if it's 0

## Next Steps
1. Execute the SQL UPDATE statement above
2. Refresh the Pending Orders page
3. The invoice should now appear under the correct sales order with remaining qty = 50

## Notes
- All invoices in the system currently have `sales_order_number = NULL`
- You may need to link multiple invoices to their corresponding sales orders
- The API is now ready to handle the correct data once the database is updated
