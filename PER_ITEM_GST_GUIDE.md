# Updated: Per-Item GST Calculation for Quotations

## New Behavior

The quotation system now applies GST **per-item** instead of a blanket 18% on all products:

- **Products WITHOUT "FREIGHT" in name** → Apply **18% GST**
- **Products WITH "FREIGHT" in name** → Apply **0% GST** (Non-taxable)
- **"Freight Charged" field** → Apply **0% GST** (Non-taxable)

---

## How It Works

### In the Form:
When you select items in the quotation items table:

```
Product Selection:
├─ BITUMEN (qty 12 × rate 50)    → Amount: ₹600  → GST: 18%  → Total: ₹708
└─ FREIGHT (qty 12 × rate 40)    → Amount: ₹480  → GST: 0%   → Total: ₹480

Form Display:
Subtotal: ₹600                    (Only BITUMEN, freight excluded)
Tax (18% GST): ₹108              (Only on BITUMEN)
Freight Charged (Non-GST): ₹480  (FREIGHT items)
─────────────────
Total: ₹1188                      (600 + 108 + 480)
```

### In the PDF:
The items table shows each item with its tax rate:

```
┌─────────────────────────────────────────────────────────┐
│ # │ Description │ Qty │ Unit │ Rate │ Amount │ GST% │ Total │
├─────────────────────────────────────────────────────────┤
│ 1 │ BITUMEN     │ 12  │ MT  │ 50   │ 600    │ 18%  │ 708   │
│ 2 │ FREIGHT     │ 12  │ MT  │ 40   │ 480    │ 0%   │ 480   │
├─────────────────────────────────────────────────────────┤
│                    SUMMARY                               │
│ Sub-Total:        ₹600                                   │
│ Tax Total (18%):  ₹108        (only on non-freight)      │
│ Freight (Non-GST):₹480                                   │
│ Grand Total:      ₹1188                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Examples

### Example 1: Only Products (No Freight Items)

**Items:**
- BITUMEN: 10 MT @ ₹100 = ₹1000

**Calculation:**
- Subtotal: ₹1000
- Tax (18%): ₹180
- **Total: ₹1180**

### Example 2: Mix of Products and Freight Items

**Items:**
- BITUMEN: 12 MT @ ₹50 = ₹600 (18% GST)
- FREIGHT: 12 MT @ ₹40 = ₹480 (0% GST)

**Calculation:**
- Subtotal: ₹600
- Tax (18%): ₹108
- Freight: ₹480
- **Total: ₹1188**

### Example 3: Products + Freight Charged Field

**Items:**
- BITUMEN: 1 MT @ ₹1000 = ₹1000 (18% GST)

**Freight Charged Field:** ₹200

**Calculation:**
- Subtotal (Product): ₹1000
- Tax (18%): ₹180
- Freight Charged: ₹200
- **Total: ₹1380**

### Example 4: Multiple Products with Multiple Freight Items

**Items:**
- BITUMEN: 10 MT @ ₹50 = ₹500 (18% GST)
- OIL: 5 MT @ ₹100 = ₹500 (18% GST)
- FREIGHT: 2 MT @ ₹50 = ₹100 (0% GST)
- DELIVERY: 2 MT @ ₹50 = ₹100 (0% GST)

**Calculation:**
- Product Subtotal: ₹1000 (BITUMEN + OIL)
- Tax (18%): ₹180 (only on ₹1000)
- Freight Items: ₹200 (FREIGHT + DELIVERY)
- **Total: ₹1380**

---

## Product Naming Convention

The system automatically detects freight items by checking if the product name contains "FREIGHT" (case-insensitive).

### Examples:
✅ **Items that will be treated as Non-GST (0%):**
- "FREIGHT"
- "FREIGHT CHARGES"
- "FREIGHT COST"
- "DELIVERY FREIGHT"
- "FREIGHT PER UNIT"
- "Freight Transport"

❌ **Items that will be treated as Normal (18%):**
- "BITUMEN"
- "CRUDE OIL"
- "PETROLEUM"
- "TRANSPORT" (doesn't contain "FREIGHT")
- "SHIPPING" (doesn't contain "FREIGHT")

---

## Form Updates

The quotation form now shows:

```
Subtotal: ₹XXXX
├─ Only includes non-freight items
└─ Excludes all items with "FREIGHT" in the name

Tax (18% GST): ₹XXXX
├─ Calculated only on non-freight items
└─ Freight items never contribute to tax

Freight Charged (Non-GST): ₹XXXX
├─ Sum of all freight items
└─ Plus the "Freight Charged" field value

Total: ₹XXXX
└─ Subtotal + Tax + Freight Charged
```

---

## PDF Changes

The PDF quotation now shows:

1. **Items Table**
   - Each item displays its actual GST rate (0% or 18%)
   - Freight items marked with 0%
   - Products marked with 18%

2. **Summary Section**
   - Shows breakdown by type:
     - Sub-Total (products only)
     - Tax Total (18%) - only on products
     - Freight (Non-GST) - all freight items
     - Grand Total

---

## Implementation Details

### Modified Files:
1. **client/src/pages/sales-operations.tsx**
   - `calculateTotals()` function: Now checks product name for "freight"
   - Items transformation for PDF: Applies per-item GST rate
   - Calculations exclude freight items from tax base

2. **client/src/components/quotation-template.tsx**
   - Table rendering: Shows correct GST% per item
   - Summary section: Recalculates totals properly

### Key Logic:
```javascript
isFreightProduct = productName.toLowerCase().includes("freight");

if (isFreightProduct) {
  gstRate = 0%;      // No tax on freight
  taxAmount = 0;
} else {
  gstRate = 18%;     // Tax on products
  taxAmount = amount × 0.18;
}
```

---

## Testing Checklist

When testing quotations:

- [ ] **Form Display**
  - [ ] Non-freight product alone shows 18% tax
  - [ ] Freight product shows 0% tax in total
  - [ ] Mixed items show correct subtotal (products only)
  - [ ] Tax shows only on products
  - [ ] Total = Subtotal + Tax + Freight

- [ ] **PDF Output**
  - [ ] Non-freight items show 18% in GST% column
  - [ ] Freight items show 0% in GST% column
  - [ ] Summary shows breakdown correctly

- [ ] **Edge Cases**
  - [ ] Only freight items: tax should be 0, total = freight amount
  - [ ] Only product items: tax should be (subtotal × 18%)
  - [ ] Mixed items: tax only on products

---

## Example Test Case

**Create Quotation with:**
1. BITUMEN: Qty 12, Rate ₹50 → Amount ₹600
2. FREIGHT: Qty 12, Rate ₹40 → Amount ₹480

**Expected Form Display:**
```
Subtotal: ₹600.00
Tax (18% GST): ₹108.00
Freight Charged (Non-GST): ₹480.00
Total: ₹1188.00
```

**Expected PDF Table:**
```
| 1 | BITUMEN | 12 | MT | 50 | 600 | 18% | 708 |
| 2 | FREIGHT | 12 | MT | 40 | 480 | 0%  | 480 |

SUMMARY:
Sub-Total: ₹600
Tax Total (18%): ₹108
Freight (Non-GST): ₹480
Grand Total: ₹1188
```

---

## Backward Compatibility

- Existing quotations continue to work as before
- New quotations automatically use per-item GST logic
- No data migration needed
