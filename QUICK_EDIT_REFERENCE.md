# Quick Reference: Pending Orders Features

## 🎯 Quick Start (30 seconds)

### Using Filters
1. Go to **Pending Orders** page
2. Open **Advanced Filters** card
3. Type in any filter field
4. Results update instantly
5. Click **Clear All Filters** to reset

### Editing Invoice Numbers
1. Find the invoice you want to correct
2. **Click on the invoice number** (blue badge)
3. Edit the number in the input box
4. Press **Enter** to save OR click **✓ button**
5. Done! Data updates automatically

---

## 🔍 Filter Examples

### Find a Specific Sales Order
```
Sales Order No: SRIHM-SO/338/25-26
→ Shows only that sales order and its invoices
```

### Find All Orders for a Customer
```
Customer: Raj Corporation
→ Shows all pending orders for Raj Corporation
```

### Find Orders with Large Pending Amounts
```
Total Amount: 50000
→ Shows orders with amount matching "50000"
```

### Find Orders with Specific Invoice
```
Invoice: INV/2024/001
→ Shows orders linked to this invoice number
```

### Find Orders with Remaining Qty
```
Remaining Qty: 100
→ Shows orders with remaining qty matching "100"
```

---

## ✏️ Quick Edit Workflow

### Example: Correct an Invoice Number

**Scenario:** Invoice "INV/2024/001" should be "INV/2024/042"

**Steps:**
1. **Click** on the blue badge showing "INV/2024/001"
2. An input field appears with the current number
3. **Clear** the field and type "INV/2024/042"
4. **Press Enter** on keyboard
5. **Success!** Invoice is updated and page refreshes

**Alternative:** Instead of Enter, click the green **✓** button

**Cancel:** Press **Esc** key or click red **✗** button

---

## 📊 Understanding the Dashboard

### Summary Card (Top)
```
Total Sales Orders:  45
Total Pending Qty:   12,500
Pending Amount:      ₹2,50,000
Pending Orders:      18
```
Updates in real-time as you filter

### Filter Badge
```
3 active
```
Shows how many filters are currently applied

### Result Counter
```
Showing 12 of 45 orders
```
Shows filtered vs. total orders

---

## 🎨 Color Guide

| Color | Meaning |
|-------|---------|
| 🟢 Green Row | Fully invoiced - all qty received |
| 🟠 Orange Row | Pending - still waiting for invoices |
| 🔵 Blue Badge | Invoice number - click to edit |
| ✏️ Edit Icon | Appears on hover - ready to edit |

---

## ⌨️ Keyboard Shortcuts

### While Editing Invoice Number
| Key | Action |
|-----|--------|
| **Enter** | Save the new invoice number |
| **Escape** | Cancel edit without saving |
| **Tab** | Move to next field (if applicable) |

---

## 💾 Exporting Data

### Export Filtered Results to CSV
1. Apply filters if needed
2. Click **Export CSV** button (top right)
3. File downloads automatically
4. Opens in Excel/Sheets

### CSV Contains
- Sales Order Number
- Customer Name
- Invoice Numbers
- SO Qty
- Invoiced Qty
- Remaining Qty
- Total SO Amount
- Total Invoice Amount

---

## ⚠️ Important Notes

### What Gets Updated
✅ Invoice number in the database
✅ All related calculations
✅ Pending orders list
❌ Invoice date (not changed)
❌ Invoice items (not changed)
❌ Invoice amounts (not changed)

### What You Need to Know
- Changes are **permanent** once saved
- System **prevents duplicate** invoice numbers
- All changes are **logged** with timestamp
- Multiple users can work simultaneously
- **No manual approval** needed

---

## 🚨 Common Issues & Solutions

### Issue: "Invoice not found"
**Cause:** Old invoice number doesn't exist for this SO
**Fix:** Verify the sales order number and invoice number are correct

### Issue: "Invoice number already exists"
**Cause:** New number is already used in same sales order
**Fix:** Use a different invoice number that doesn't exist yet

### Issue: Edit field won't appear
**Cause:** Click might not be on the invoice badge
**Fix:** Make sure to click directly on the blue badge, not the row

### Issue: Changes not saving
**Cause:** Network issue or permission denied
**Fix:** Check internet connection, try again, contact admin if persists

---

## 📈 Performance Tips

### For Large Datasets (1000+ orders)
1. Use **Sales Order No** filter for precise search
2. Apply **Customer** filter to narrow down
3. Use **Remaining Qty** filter for pending items
4. Export to CSV for offline analysis

### For Better Performance
- Clear unused filters regularly
- Avoid very broad searches
- Use specific terms when possible
- Refresh page if table seems slow

---

## 🔐 Permissions

You need **Sales Operations** access to:
- ✅ View pending orders
- ✅ View invoices
- ✅ Edit invoice numbers
- ✅ Export data

Contact your administrator if you don't have access.

---

## 📞 Support

### Common Questions

**Q: Can I undo an edit?**
A: No automatic undo, but you can edit it again to the correct number

**Q: Will this affect other reports?**
A: Only the invoice number changes - all amounts and dates stay same

**Q: Can I edit multiple invoices at once?**
A: Currently one at a time - edit each invoice individually

**Q: What if I make a mistake?**
A: Simply edit the invoice number again to the correct one

**Q: Are edits logged somewhere?**
A: Yes, server logs contain all changes with timestamp

---

## 🎓 Learning Path

### Beginner (Just Started)
1. Read "Filter Examples" section above
2. Try filtering by one field
3. Combine filters for better results

### Intermediate (Comfortable)
1. Try quick editing an invoice
2. Use multiple filters together
3. Export filtered results

### Advanced (Power User)
1. Combine complex filters
2. Batch correct multiple invoices
3. Export and analyze data offline
4. Train others on the features

---

## ✅ Checklist: Before You Edit

- [ ] You've identified the **correct sales order**
- [ ] You've found the **correct old invoice number**
- [ ] You know the **correct new invoice number**
- [ ] New number doesn't already exist in the system
- [ ] You have **backup/notes** of old number (just in case)
- [ ] You're **confident** this is the right correction

---

## 📝 Logging & Audit

Every invoice number change is logged:
- ✅ What changed (old → new number)
- ✅ Which sales order it belongs to
- ✅ Who made the change (your username)
- ✅ When it happened (timestamp)
- ✅ Success or failure status

Check with admin for detailed audit logs.

---

## 🚀 Tips & Tricks

### Faster Searching
- Use **Ctrl+F** to search within filtered table
- Combine multiple filters for precision
- Use space in searches for exact phrase

### Batch Operations
- Filter for a customer
- Note multiple invoices to correct
- Edit them one by one (can't batch edit yet)

### Data Analysis
- Export filtered data
- Open in Excel for analysis
- Create reports from export

### Organization
- Filter by date range using SO number patterns
- Group by customer for correction batches
- Sort columns for pattern identification

---

Last Updated: 2025-01-20
Version: 1.0
Status: Production Ready

