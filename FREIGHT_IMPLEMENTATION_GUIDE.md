# Freight Charged (Non-GST) Implementation - Complete Guide

## Summary
The quotation system has been updated to properly handle **Freight Charged** amounts as **Non-GST items** in the PDF output. When a user creates a quotation with freight charges, the PDF will now:

1. ✅ Display freight as a separate line item in the quotation items table
2. ✅ Mark freight with **0% GST** instead of 18%
3. ✅ Exclude freight from GST tax calculation (tax only applies to products)
4. ✅ Show clear breakdown in the PDF summary section

---

## Technical Implementation

### 1. Data Model Changes

**File**: `client/src/components/quotation-template.tsx`

**Updated QuotationData Interface** (Lines 17-30):
```typescript
items: Array<{
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  gstAmount?: number;
  totalAmount: number;
  isFreight?: boolean;    // ← NEW: Flag to identify freight items
  gstRate?: number;        // ← NEW: Specific GST rate per item
}>;
```

**Purpose**: Allows each item to have its own GST rate, supporting both regular products (18%) and freight (0%).

---

### 2. PDF Table Rendering Changes

**File**: `client/src/components/quotation-template.tsx`

**Updated Table Row Rendering** (Lines 280-310):
```typescript
const gstRate = item.isFreight ? '0%' : '18%';
const displayAmount = item.isFreight ? item.amount : item.amount;
const displayTotal = item.isFreight ? item.amount : item.totalAmount;

// Display in table
safeAddText(gstRate, colPositions[6] + 2, currentY + 7);  // Shows 0% for freight
safeAddText(displayTotal.toFixed(0), colPositions[7] + 2, currentY + 7);
```

**What it does**:
- Checks if item is marked as `isFreight`
- Shows **0%** in the Tax% column for freight items
- Shows **18%** for regular product items
- Freight total amount doesn't include any tax

---

### 3. Summary Section Update

**File**: `client/src/components/quotation-template.tsx`

**Updated Summary Calculation** (Lines 360-385):
```typescript
// Calculate totals without freight (since freight is now in items)
const nonFreightItems = quotationData.items?.filter(item => !item.isFreight) || [];
const nonFreightSubtotal = nonFreightItems.reduce((sum, item) => sum + item.amount, 0);
const taxTotal = nonFreightSubtotal * 0.18;  // Tax only on products
const freightTotal = quotationData.items?.find(item => item.isFreight)?.amount || 0;

const summaryItems = [
  { label: 'Sub-Total', value: nonFreightSubtotal || 0 },
  { label: 'Freight (Non-GST)', value: freightTotal || 0 },           // ← NEW: Labeled as Non-GST
  { label: 'Tax Total (18%)', value: taxTotal || 0 },
  { label: 'Grand Total', value: quotationData.total || 0, isBold: true }
];
```

**What it does**:
- Separates freight items from regular items for calculation
- Applies GST only to non-freight items
- Labels freight clearly as "Freight (Non-GST)" in summary
- Maintains correct total: Subtotal + Freight + Tax

---

### 4. Freight Item Addition to Items Array

**File**: `client/src/pages/sales-operations.tsx`

**PDF Generation - Freight Item Addition** (Lines 3395-3412):
```typescript
// Add freight as a separate item if freight is charged
const freightAmount = parseFloat(quotation.freightCharged || 0);
if (freightAmount > 0) {
  items.push({
    description: 'FREIGHT CHARGED',
    quantity: 1,
    unit: 'Nos',
    rate: freightAmount,
    amount: freightAmount,
    gstRate: 0,                    // Explicitly 0% GST
    gstAmount: 0,                  // No tax amount
    totalAmount: freightAmount,    // Total = amount (no tax added)
    isFreight: true,               // Flag for special handling
    id: 'freight-item'
  });
}

// Calculate subtotal excluding freight
const subtotal = items.reduce((sum: number, item: any) => sum + (item.isFreight ? 0 : item.amount), 0);
const taxAmount = subtotal * 0.18;  // 18% GST on products only
const total = subtotal + taxAmount + freightAmount;  // Final total
```

**What it does**:
- Creates a special "FREIGHT CHARGED" item when freight amount > 0
- Marked with `isFreight: true` for special handling
- Sets `gstRate: 0` to indicate no tax
- Adds it to the items array, making it visible in the PDF table
- Recalculates subtotal to exclude freight from tax calculation

---

## User Workflow

### Creating a Quotation:
1. User enters products/items (will show 18% GST in table)
2. User enters "Freight Charged (₹) - Non-GST" amount in the form
3. User downloads PDF

### PDF Output:
```
┌─────────────────────────────────────────────────────┐
│ QUOTATION ITEMS TABLE                               │
├─────────────────────────────────────────────────────┤
│ # │ Description │ Qty │ Unit │ Rate │ Amount │ GST% │
├─────────────────────────────────────────────────────┤
│ 1 │ PRODUCT     │  1  │ MT  │40000 │ 40000 │ 18%  │
│ 2 │ FREIGHT     │  1  │ Nos │ 5000 │  5000 │ 0%   │ ← NEW
├─────────────────────────────────────────────────────┤
│                  SUMMARY                             │
│ Sub-Total:        ₹40,000                            │
│ Freight (Non-GST): ₹5,000 ← NEW Label               │
│ Tax Total (18%):  ₹7,200   (only on ₹40,000)        │
│ Grand Total:      ₹52,200                            │
└─────────────────────────────────────────────────────┘
```

---

## Tax Calculation Logic

### Before Update (WRONG):
- All items including freight applied 18% GST
- Freight was shown separately in summary, not in table
- Confusion about what was being taxed

### After Update (CORRECT):
```
Tax Base:      Only non-freight items = ₹40,000
Tax Rate:      18%
Tax Amount:    ₹40,000 × 18% = ₹7,200
Freight:       ₹5,000 (not taxed)
Grand Total:   ₹40,000 + ₹7,200 + ₹5,000 = ₹52,200
```

---

## Files Modified

### 1. `client/src/components/quotation-template.tsx`
- **Lines 17-30**: Updated QuotationData interface with `isFreight` and `gstRate` fields
- **Lines 280-310**: Modified table rendering to check `isFreight` flag and display appropriate GST%
- **Lines 360-385**: Updated summary section to separate freight from products for tax calculation

### 2. `client/src/pages/sales-operations.tsx`
- **Lines 3384-3410**: Updated items transformation to add `isFreight: false` to all products
- **Lines 3412-3425**: Added code to push freight as a separate item with `isFreight: true`
- **Lines 3427-3428**: Updated subtotal calculation to exclude freight from tax base

---

## Key Differences from Previous Version

| Aspect | Before | After |
|--------|--------|-------|
| Freight in items table | ❌ No | ✅ Yes |
| Freight GST% | 18% (wrong) | 0% (correct) |
| Tax label | "Tax Total" | "Tax Total (18%)" |
| Freight label | "Freight" | "Freight (Non-GST)" |
| Tax calculation | Included freight | Excludes freight |
| Transparency | Low | High |

---

## Testing Checklist

When testing the quotation PDF generation:

- [ ] **Items Table**
  - [ ] Regular products show 18% in Tax% column
  - [ ] FREIGHT CHARGED row shows 0% in Tax% column
  - [ ] FREIGHT CHARGED appears as a separate row item (not just in summary)

- [ ] **Summary Section**
  - [ ] Sub-Total shows sum of products only
  - [ ] Freight (Non-GST) shows freight amount
  - [ ] Tax Total (18%) = Sub-Total × 18% (freight not included)
  - [ ] Grand Total = Sub-Total + Freight + Tax Total

- [ ] **Calculation Verification**
  - [ ] Example: Product ₹100, Freight ₹10
  - [ ] Sub-Total: ₹100 ✓
  - [ ] Tax: ₹18 (18% on ₹100 only) ✓
  - [ ] Total: ₹128 (100 + 10 + 18) ✓

- [ ] **User Experience**
  - [ ] Form shows "Freight Charged (₹) - Non-GST" field
  - [ ] PDF properly displays freight as item
  - [ ] No duplicate freight entries in PDF

---

## Future Enhancements (Optional)

1. **Color Coding**: Highlight freight row with different color in PDF (e.g., light yellow)
2. **Footnote**: Add * to freight in table with footnote: "Non-taxable freight charges"
3. **Separate Freight Section**: Option to show freight in a dedicated section instead of items table
4. **Variable Tax Rates**: Support for different tax rates per item/category
5. **Freight Options**: Pre-defined freight rates (e.g., ₹10/MT, ₹20/MT) for quick selection

---

## Support Notes

- **Question**: How does this affect existing quotations?
  - **Answer**: Existing quotations will continue to work as before. The freight field remains optional.

- **Question**: Can I change tax rates per item?
  - **Answer**: Yes, the `gstRate` field in items supports this. Freight is hardcoded to 0%, products to 18%, but the system is extensible.

- **Question**: What if I don't enter a freight amount?
  - **Answer**: No freight item is added to the table. The quotation shows only product items.

- **Question**: Is there a limit on freight amount?
  - **Answer**: No, freight can be any positive amount. It's calculated as entered by user.

---

## Summary

The implementation properly separates **Freight Charged (Non-GST)** from regular products in the quotation PDF by:

1. Adding freight as a visible item row in the items table with 0% GST
2. Excluding freight from the tax calculation base
3. Clearly labeling freight as "Non-GST" in the summary
4. Providing complete transparency in the PDF about what is taxed and what isn't

This ensures customers see exactly what they're being charged for and which items have GST applied.
