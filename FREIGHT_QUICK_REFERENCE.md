# Quick Reference - Freight Charged Feature

## What Changed?

When users create quotations with **Freight Charged** amount, the PDF now shows:
- ✅ Freight as a separate line item in the quotation items table
- ✅ Freight marked as **0% GST** (not 18%)
- ✅ Clear summary showing "Freight (Non-GST)"
- ✅ Tax calculated only on products, not freight

---

## How to Test

### Step 1: Create Quotation
1. Go to Sales Operations → Quotations tab
2. Click "Create New Quotation"
3. Select a client
4. Add a product (e.g., Bitumen - 1 MT @ ₹40,000)
5. Enter **"Freight Charged (₹) - Non-GST": 5000**
6. Click "Save Quotation"

### Step 2: Download PDF
1. Find the quotation in the list
2. Click the download icon
3. Select format (Bitumen template recommended)

### Step 3: Verify PDF
Open the PDF and check:

```
QUOTATION ITEMS TABLE:
| # | Description | Qty | Unit | Rate | Amount | GST% | Total |
|----|-------|-----|------|------|--------|------|-------|
| 1 | BITUMEN | 1 | MT | 40000 | 40000 | 18% | 47200 |
| 2 | FREIGHT CHARGED | 1 | Nos | 5000 | 5000 | 0% | 5000 |  ← NEW!

SUMMARY:
Sub-Total: ₹40,000
Freight (Non-GST): ₹5,000  ← NEW!
Tax Total (18%): ₹7,200    (only on ₹40,000)
Grand Total: ₹52,200
```

---

## Expected Behavior

### Freight Row in Table
- **Description**: "FREIGHT CHARGED"
- **Quantity**: 1
- **Unit**: Nos
- **Rate**: The freight amount entered
- **Amount**: Same as rate
- **GST%**: **0%** ← (Not 18%)
- **Total**: Same as amount (no tax added)

### Tax Calculation
- **Tax Base**: Only products = ₹40,000
- **Tax Rate**: 18%
- **Tax Amount**: ₹7,200 (on products only)
- **Freight**: ₹5,000 (not taxed)
- **Total**: ₹52,200

---

## Common Scenarios

### Scenario 1: No Freight
**Input**: Product ₹100, Freight ₹0
**Output**: 
- Items table shows only product row
- No freight row appears in table
- Summary shows: Sub-Total ₹100, Tax ₹18, Total ₹118

### Scenario 2: With Freight
**Input**: Product ₹100, Freight ₹10
**Output**:
- Items table shows 2 rows: Product (18%) and Freight (0%)
- Summary shows: Sub-Total ₹100, Freight ₹10, Tax ₹18, Total ₹128

### Scenario 3: Multiple Products + Freight
**Input**: Product A ₹50, Product B ₹50, Freight ₹5
**Output**:
- Items table shows 3 rows: Product A (18%), Product B (18%), Freight (0%)
- Sub-Total: ₹100 (both products)
- Tax: ₹18 (on ₹100)
- Freight: ₹5 (not taxed)
- Total: ₹123

---

## Visual Indicators

### In Form
```
📋 Create New Quotation

Freight Charged (₹) - Non-GST: [5000]  ← Yellow background field
```

### In Table
```
| # | Description | Qty | Unit | Rate | Amount | GST% | Total |
|---|------|----|----|----|----|---|----|
|1 | BITUMEN | 1 | MT | 40000 | 40000 | 18% | 47200 |
|2 | FREIGHT CHARGED | 1 | Nos | 5000 | 5000 | 0% | 5000 | ← Note the 0%
```

### In Summary
```
Sub-Total (Products only):   ₹40,000
Freight (Non-GST):          ₹5,000   ← Clearly labeled "Non-GST"
Tax Total (18%):            ₹7,200   ← Only on products
──────────────────────────────────
Grand Total:                ₹52,200
```

---

## Frequently Asked Questions

**Q: Does freight get included in Sub-Total?**
A: No. Sub-Total shows only products. Freight is shown separately.

**Q: Is freight taxed?**
A: No. Freight is marked as 0% GST and is never taxed.

**Q: Can I change the freight tax rate?**
A: Currently it's hardcoded to 0% for freight items. This can be configured if needed.

**Q: What if I don't enter freight?**
A: No freight row appears in the PDF. The quotation shows only product items.

**Q: Does this work for all quotation formats?**
A: Yes. It works for Bitumen template and professional templates.

**Q: Can I edit freight after creating a quotation?**
A: Yes. Click Edit on the quotation and change the freight amount, then save.

**Q: Does this affect existing quotations?**
A: No. Existing quotations continue to work as before. Only new/updated quotations use this feature.

---

## Support Information

### If You See an Issue:
- **Issue**: Freight shows 18% GST instead of 0%
  - **Solution**: Clear cache and refresh browser, then download PDF again

- **Issue**: Freight row doesn't appear in table
  - **Solution**: Verify freight amount > 0 in the form

- **Issue**: Tax is calculated incorrectly
  - **Solution**: Verify freight is marked as 0% GST in table

### Where to Report Issues:
1. Note the exact quotation number
2. Check PDF content
3. Compare with expected output above
4. Report with screenshot

---

## Example Calculation Sheet

| Line Item | Amount | GST% | Tax | Notes |
|-----------|--------|------|-----|-------|
| Bitumen | ₹40,000 | 18% | ₹7,200 | Product - taxed |
| Freight | ₹5,000 | 0% | ₹0 | Freight - NOT taxed |
| **Total** | **₹52,200** | — | **₹7,200** | Sum of all |

**Formula**:
- Tax = Products Amount × 18%
- Grand Total = Products Amount + Freight Amount + Tax
- Freight is **never** included in tax calculation

---

## Files to Know About

- **PDF Template**: `client/src/components/quotation-template.tsx`
  - Contains the logic to show 0% GST for freight
  - Lines 280-310: Item table rendering
  - Lines 360-385: Summary calculation

- **Form Logic**: `client/src/pages/sales-operations.tsx`
  - Contains freight field in quotation form
  - Lines 3400-3425: Adds freight as item when generating PDF

- **User Field**: Quotation form shows "Freight Charged (₹) - Non-GST"
  - This is the input field for freight amount
  - No GST is automatically applied to this amount

---

## Key Takeaway

**Freight Charged is now properly handled as a Non-GST item in PDFs:**
- ✅ Shows as separate row in items table with 0% GST
- ✅ Excluded from tax calculation
- ✅ Clearly labeled in summary
- ✅ Transparent pricing for customers

The PDF now gives complete clarity about what is being charged and what is taxed.
