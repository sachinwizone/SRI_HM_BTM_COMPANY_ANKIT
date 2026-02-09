# Quotation Factory Rate and Delivery Rate Fix

## Problem Identified
The quotation system had a single "Rate" column for items, but the business requirement was to support TWO optional rate columns:
1. Factory Rate - ✓
2. Delivery Rate - ✓

Users needed to be able to fill either factory rate OR delivery rate (or both), and when generating a sales order PDF, only the filled rate should be shown.

## Solution Implemented

### 1. Database Schema Changes
**File: `shared/schema.ts` (lines 1363-1376)**
- Added `factoryRate: decimal("factory_rate", { precision: 15, scale: 2 })` to quotationItems table
- Added `deliveryRate: decimal("delivery_rate", { precision: 15, scale: 2 })` to quotationItems table
- Made original `rate` field nullable for backward compatibility
- Created migration file: `migrations/add_factory_delivery_rates_to_items.sql`

### 2. Frontend Form Updates  
**File: `client/src/pages/sales-operations.tsx`**

#### State Management (lines ~2623):
- Updated quotationItems state initialization to include both `factoryRate` and `deliveryRate` fields

#### Item Update Logic (lines ~2767-2787):
- Modified `updateQuotationItem()` function to handle both rate fields
- Amount calculation now uses: `factoryRate || deliveryRate || rate || 0`
- Auto-populated amounts based on the active rate

#### Form UI (lines ~4008-4090):
- Replaced single "Rate" column with two columns:
  - Factory Rate (₹)
  - Delivery Rate (₹)
- Updated grid layout from 12 columns to 14 columns for better spacing
- Both rate inputs show placeholder text indicating which rate to fill

#### Form Data Submission (lines ~2905-2916):
- Updated items mapping to send both `factoryRate` and `deliveryRate` to API
- Includes legacy `rate` field for backward compatibility

### 3. Server-Side API Updates
**File: `server/routes.ts`**

#### Create Quotation Endpoint (lines ~3906-3908):
- Added handling for `factoryRate` and `deliveryRate` in quotation item creation
- Stores both rates if provided

#### Update Quotation Endpoint (lines ~3960-3962):
- Added same handling for `factoryRate` and `deliveryRate` in item updates

#### Sales Order Creation (lines ~4115-4125):
- Updated logic to use active rate: `factoryRate || deliveryRate || rate`
- Ensures sales orders reflect the correct rate based on what was filled in quotation

### 4. PDF Generation Updates  
**File: `client/src/components/quotation-template.tsx`**

#### Interface Update (lines ~1-50):
- Updated QuotationData item interface to include optional `factoryRate` and `deliveryRate`
- Made `rate` optional since it might be empty now

#### PDF Rendering (lines ~505-507):
- Updated rate display logic to show: `factoryRate || deliveryRate || rate || 0`
- Only shows the rate that was actually filled

#### Data Preparation (lines ~3514-3527):
- Updated item transformation for PDF to include both rate fields
- Passes factoryRate and deliveryRate to PDF generator

### 5. Form Loading on Edit  
**File: `client/src/pages/sales-operations.tsx` (lines ~3103-3109)**
- Updated `handleEditQuotation()` to properly load both rate fields when editing existing quotations

## Validation Schema Updates
**File: `shared/schema.ts` (lines ~1627-1650)**
- Updated `insertQuotationItemSchema` to include optional fields:
  - `factoryRate`
  - `deliveryRate`
- Made `unitPrice` and `totalPrice` optional to handle both rate types

## Database Migration
**File: `migrations/add_factory_delivery_rates_to_items.sql`**
```sql
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS factory_rate numeric(15,2);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS delivery_rate numeric(15,2);
ALTER TABLE quotation_items ALTER COLUMN rate DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotation_items_factory_rate ON quotation_items(factory_rate);
CREATE INDEX IF NOT EXISTS idx_quotation_items_delivery_rate ON quotation_items(delivery_rate);
```

## How It Works Now

### Creating/Editing Quotation:
1. User sees two optional columns: "Factory Rate" and "Delivery Rate"
2. User can fill either or both (recommendation: only fill one)
3. Amount is auto-calculated based on the filled rate
4. Both rates are sent to server

### Server Processing:
- Both rates are stored in the database
- When creating sales order, the server uses: factoryRate if filled, otherwise deliveryRate, otherwise legacy rate field

### PDF Generation:
- PDF shows only the rate that was filled
- If factory rate is filled, shows factory rate
- If only delivery rate is filled, shows delivery rate
- Logo and layout remain unchanged

### Backward Compatibility:
- Existing quotations with only the legacy `rate` field continue to work
- New quotations can use the two-column system
- Amount calculations work for both old and new data

## Testing Checklist
- [ ] Quotations load without error
- [ ] Can create quotation with factory rate only
- [ ] Can create quotation with delivery rate only
- [ ] Can create quotation with both rates (shows factory rate in PDF)
- [ ] Amounts auto-calculate correctly
- [ ] PDF shows correct rate based on what was filled
- [ ] Sales order shows correct rate
- [ ] Editing existing quotation preserves and displays both rates
- [ ] WhatsApp message shows correct rate
