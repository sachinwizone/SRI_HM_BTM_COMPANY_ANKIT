# Freight Charged - Non-GST PDF Fix

## Overview
When a user creates a quotation and enters a "Freight Charged" amount, the system now:
1. **Displays freight as a separate line item** in the PDF quotation items table
2. **Marks freight with 0% GST** instead of 18%
3. **Excludes freight from GST tax base** - only regular products have 18% GST applied
4. **Shows proper breakdown** in the PDF summary section

## Changes Made

### 1. **QuotationData Interface** (`client/src/components/quotation-template.tsx`)
Added new optional fields to items array:
- `isFreight?: boolean` - Flag to identify freight items
- `gstRate?: number` - Specific GST rate per item (0% for freight, 18% for others)

```tsx
items: Array<{
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  gstAmount?: number;
  totalAmount: number;
  isFreight?: boolean;      // NEW
  gstRate?: number;         // NEW
}>
```

### 2. **PDF Table Rendering** (`client/src/components/quotation-template.tsx`)
Updated the items table rendering to:
- Check if item has `isFreight: true`
- Display **0%** for freight items instead of hardcoded **18%**
- Keep other products showing **18% GST**

```tsx
const gstRate = item.isFreight ? '0%' : '18%';
const displayAmount = item.isFreight ? item.amount : item.amount;
const displayTotal = item.isFreight ? item.amount : item.totalAmount;
```

### 3. **Freight Item Addition** (`client/src/pages/sales-operations.tsx`)
When PDF is generated:
- Freight amount is **added as a separate item** to the items array
- Item description: `"FREIGHT CHARGED"`
- Marked with `isFreight: true` and `gstRate: 0`
- Not included in subtotal calculation for GST purposes

```tsx
if (freightAmount > 0) {
  items.push({
    description: 'FREIGHT CHARGED',
    quantity: 1,
    unit: 'Nos',
    rate: freightAmount,
    amount: freightAmount,
    gstRate: 0,
    gstAmount: 0,
    totalAmount: freightAmount,
    isFreight: true,
    id: 'freight-item'
  });
}
```

### 4. **Summary Section** (`client/src/components/quotation-template.tsx`)
Updated the PDF summary to show proper breakdown:

| Line Item | Calculation |
|-----------|------------|
| Sub-Total | Sum of all non-freight items |
| Freight (Non-GST) | Freight amount without tax |
| Tax Total (18%) | Only applied to non-freight items |
| Grand Total | Subtotal + Freight + Tax |

```tsx
const nonFreightItems = quotationData.items?.filter(item => !item.isFreight) || [];
const nonFreightSubtotal = nonFreightItems.reduce((sum, item) => sum + item.amount, 0);
const taxTotal = nonFreightSubtotal * 0.18;  // Tax only on non-freight items
const freightTotal = quotationData.items?.find(item => item.isFreight)?.amount || 0;
```

## How It Works - User Flow

### Creating a Quotation:
1. User creates a new quotation
2. Adds products/items (will have 18% GST)
3. Enters "Freight Charged (₹) - Non-GST" amount in the form

### PDF Generation:
1. All regular products are listed with **18% GST**
2. **Freight Charged row** appears in the table with **0% GST** 
3. Summary shows:
   - **Sub-Total**: Only products (excluding freight)
   - **Freight (Non-GST)**: Freight amount
   - **Tax Total (18%)**: Calculated only on products
   - **Grand Total**: Products + Freight + Tax

## Example Calculation

**User adds:**
- Product: 1000 MT at ₹40,000/MT = **₹40,000**
- Freight Charged: **₹5,000**

**PDF shows:**
- Sub-Total: ₹40,000
- Freight (Non-GST): ₹5,000
- Tax Total (18%): ₹7,200 (18% on ₹40,000 only)
- **Grand Total: ₹52,200**

In the items table:
| Item | Qty | Unit | Rate | Amount | GST% | Total |
|------|-----|------|------|--------|------|-------|
| Product | 1 | MT | 40000 | 40000 | 18% | 47200 |
| FREIGHT CHARGED | 1 | Nos | 5000 | 5000 | 0% | 5000 |

## Files Modified
1. ✅ `client/src/components/quotation-template.tsx` - Interface, table rendering, summary section
2. ✅ `client/src/pages/sales-operations.tsx` - Adding freight as item when generating PDF

## Testing
To verify the changes:
1. Create a new quotation
2. Add a product/item
3. Enter a freight charge amount
4. Download the PDF
5. Verify:
   - ✅ Freight appears as a row in the items table
   - ✅ Freight row shows **0% GST**
   - ✅ Other items show **18% GST**
   - ✅ Summary correctly separates freight with label "(Non-GST)"
   - ✅ Tax is only calculated on products, not freight
