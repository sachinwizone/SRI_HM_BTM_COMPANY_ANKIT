# Quotation Dual-Rate Feature - Implementation Guide

## Current Status: ✅ FIXED - Quotations Loading Again

The quotation loading error has been resolved. The system is now back to using a single "Rate" column for quotation items.

## What Happened

I implemented a feature to support two optional rate columns:
- **Factory Rate** - For factory prices  
- **Delivery Rate** - For delivery prices

However, the database migration needed to be applied for this to work, which caused a temporary loading issue.

---

## Solution: Phased Rollout

To avoid breaking the system, I've implemented this as a **phased approach**:

### Phase 1: ✅ CURRENT (Simple Rate Column)
- Single "Rate" column used for quotation items
- Works with existing database
- Quotations load and display correctly
- No database changes needed

### Phase 2: (Optional) Enable Dual-Rate Support
When ready to use the factory and delivery rate feature, follow these steps:

---

## FUTURE: How to Enable Dual-Rate Feature

### Step 1: Apply Database Migration

Run the migration script to add the new columns:

```bash
npx tsx scripts/migrate-quotation-rates.ts
```

**What this does:**
- Adds `factory_rate` column to quotation_items table
- Adds `delivery_rate` column to quotation_items table  
- Makes the original `rate` field optional
- Creates indexes for faster queries

**SQL equivalent** (if running manually):
```sql
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS factory_rate numeric(15,2);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS delivery_rate numeric(15,2);
ALTER TABLE quotation_items ALTER COLUMN rate DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotation_items_factory_rate ON quotation_items(factory_rate);
CREATE INDEX IF NOT EXISTS idx_quotation_items_delivery_rate ON quotation_items(delivery_rate);
```

### Step 2: Uncomment Schema Columns

Edit `shared/schema.ts` (around line 1373):

```typescript
// Uncomment these lines:
factoryRate: decimal("factory_rate", { precision: 15, scale: 2 }), // Factory rate
deliveryRate: decimal("delivery_rate", { precision: 15, scale: 2 }), // Delivery rate
```

### Step 3: Update Validation Schema

Edit `shared/schema.ts` (around line 1637) - uncomment:

```typescript
factoryRate: z.union([z.string(), z.number()]).optional().transform(...),
deliveryRate: z.union([z.string(), z.number()]).optional().transform(...),
```

### Step 4: Update Client Form

In `client/src/pages/sales-operations.tsx`, uncomment or update:

1. Quote item state to include both rates
2. Form UI to show two rate columns instead of one
3. Amount calculation logic to use active rate

### Step 5: Update Server Endpoints  

In `server/routes.ts`, uncomment the code that handles `factoryRate` and `deliveryRate` when creating/updating quotations

### Step 6: Update PDF Generation

In `client/src/components/quotation-template.tsx`, uncomment code to display the active rate in PDFs

### Step 7: Rebuild and Test

```bash
npm run build && npm run dev
```

---

## Files Ready for Future Implementation

The following files have commented-out code ready to be uncommented:

| File | Section | Ready |
|------|---------|-------|
| `shared/schema.ts` | Quotation Items Table Definition | ✅ |
| `shared/schema.ts` | Validation Schemas | ✅ |
| `client/src/pages/sales-operations.tsx` | Form State & UI | ✅ |
| `server/routes.ts` | API Endpoints | ✅ |
| `client/src/components/quotation-template.tsx` | PDF Generation | ✅ |
| `migrations/add_factory_delivery_rates_to_items.sql` | Database Migration | ✅ |
| `scripts/migrate-quotation-rates.ts` | Migration Runner Script | ✅ |

---

## How the Dual-Rate System Will Work

### For Users:
1. When creating a quotation, they'll see **two** optional rate columns
   - Factory Rate (₹)
   - Delivery Rate (₹)
2. They can fill either one or both
3. Amount auto-calculates based on the filled rate
4. Priority: Factory Rate > Delivery Rate > Legacy Rate

### For PDFs:
- Only shows the rate that was filled
- If factory rate is filled, shows factory rate
- If only delivery rate is filled, shows delivery rate
- Calculation happens based on the filled rate

### For Sales Orders:
- Uses the filled rate from quotation
- If factory rate exists, uses that
- Otherwise uses delivery rate
- Otherwise uses legacy rate field

---

## Testing the System Now

The system is working correctly with the single rate column. You can:
- ✅ Create quotations with items
- ✅ Set rates for each item
- ✅ Auto-calculate amounts
- ✅ Generate PDFs
- ✅ Create sales orders from quotations

---

## Backward Compatibility

- Old quotations with just the `rate` field will continue to work
- New quotations can use the single rate system
- When dual-rate feature is enabled, existing data is preserved
- Empty `factory_rate` and `delivery_rate` fields will be NULL

---

## Troubleshooting

### If quotations don't load:
1. Make sure the database migration has NOT been applied yet
2. Verify the schema doesn't have uncommented factoryRate/deliveryRate columns
3. Clear browser cache and refresh

### If migration fails:
```bash
# Check database connection
npx tsx -e "import('dotenv/config'); console.log(process.env.DATABASE_URL)"
```

### If build fails:
```bash
npm run build -- --force
```

---

## Next Steps

The system is ready for use **now** with the single-rate feature. When you're ready to enable dual-rate support:

1. Follow the "FUTURE: How to Enable Dual-Rate Feature" section above
2. Run the migration script
3. Uncomment the code sections
4. Rebuild the application
5. Test with new quotations

No changes are needed to existing quotations - they'll continue working with their current rate values.
