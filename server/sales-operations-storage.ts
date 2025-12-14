// Sales Operations Storage Methods
// This file contains the storage methods for the sales operations module

import { db } from "./db";
import { 
  invoiceCompanies, invoiceParties, invoiceProducts, invoiceTransporters,
  salesInvoices, salesInvoiceItems, salesInvoiceTaxes,
  purchaseInvoices, purchaseInvoiceItems,
  // paymentTransactions, invoiceTermsConditions, stockLedger, // TODO: Add these tables to schema
  type InsertInvoiceCompany as InsertCompany, type InvoiceCompany as Company,
  type InsertInvoiceParty as InsertParty, type InvoiceParty as Party,
  type InsertInvoiceProduct as InsertProduct, type InvoiceProduct as Product,
  type InsertInvoiceTransporter as InsertTransporter, type InvoiceTransporter as Transporter,
  type InsertSalesInvoice, type SalesInvoice,
  type InsertSalesInvoiceItem, type SalesInvoiceItem,
  type InsertPurchaseInvoice, type PurchaseInvoice,
  type InsertPurchaseInvoiceItem, type PurchaseInvoiceItem,
  // type InsertPaymentTransaction, type PaymentTransaction, // TODO: Add these types to schema
  // type InsertStockLedgerEntry, type StockLedgerEntry // TODO: Add these types to schema
} from "@shared/schema";
import { eq, desc, and, sql, sum } from "drizzle-orm";

// Company Management
export async function createCompany(data: InsertCompany): Promise<Company> {
  const [company] = await db.insert(invoiceCompanies).values(data).returning();
  return company;
}

export async function getCompany(): Promise<Company | null> {
  const company = await db.select().from(invoiceCompanies).limit(1);
  return company[0] || null;
}

export async function updateCompany(id: string, data: Partial<InsertCompany>): Promise<Company> {
  const [company] = await db
    .update(invoiceCompanies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoiceCompanies.id, id))
    .returning();
  return company;
}

// Party (Customer/Supplier) Management
export async function createParty(data: InsertParty): Promise<Party> {
  const [party] = await db.insert(invoiceParties).values(data).returning();
  return party;
}

export async function getAllParties(): Promise<Party[]> {
  return await db.select().from(invoiceParties).where(eq(invoiceParties.isActive, true)).orderBy(desc(invoiceParties.createdAt));
}

export async function getPartiesByType(partyType: string): Promise<Party[]> {
  return await db
    .select()
    .from(invoiceParties)
    .where(and(eq(invoiceParties.isActive, true), eq(invoiceParties.partyType, partyType as any)))
    .orderBy(invoiceParties.partyName);
}

export async function getPartyById(id: string): Promise<Party | null> {
  const party = await db.select().from(invoiceParties).where(eq(invoiceParties.id, id)).limit(1);
  return party[0] || null;
}

export async function updateParty(id: string, data: Partial<InsertParty>): Promise<Party> {
  const [party] = await db
    .update(invoiceParties)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoiceParties.id, id))
    .returning();
  return party;
}

export async function deleteParty(id: string): Promise<void> {
  await db.update(invoiceParties).set({ isActive: false }).where(eq(invoiceParties.id, id));
}

// Helper function to get state code from state name
function getStateCode(stateName: string | null | undefined): string {
  if (!stateName) return '00';
  const stateMap: { [key: string]: string } = {
    'ANDHRA PRADESH': '37', 'ARUNACHAL PRADESH': '12', 'ASSAM': '18', 'BIHAR': '10',
    'CHHATTISGARH': '22', 'GOA': '30', 'GUJARAT': '24', 'HARYANA': '06',
    'HIMACHAL PRADESH': '02', 'JHARKHAND': '20', 'KARNATAKA': '29', 'KERALA': '32',
    'MADHYA PRADESH': '23', 'MAHARASHTRA': '27', 'MANIPUR': '14', 'MEGHALAYA': '17',
    'MIZORAM': '15', 'NAGALAND': '13', 'ODISHA': '21', 'PUNJAB': '03',
    'RAJASTHAN': '08', 'SIKKIM': '11', 'TAMIL NADU': '33', 'TELANGANA': '36',
    'TRIPURA': '16', 'UTTAR PRADESH': '09', 'UTTARAKHAND': '05', 'UTTRAKHNAD': '05',
    'WEST BENGAL': '19', 'DELHI': '07', 'JAMMU AND KASHMIR': '01', 'LADAKH': '38'
  };
  return stateMap[stateName.toUpperCase()] || '00';
}

// Sync supplier from suppliers master to invoice_parties
export async function syncSupplierToInvoiceParties(supplier: any): Promise<Party> {
  // Check if supplier already exists in invoice_parties by name
  const existing = await db
    .select()
    .from(invoiceParties)
    .where(and(
      eq(invoiceParties.partyName, supplier.supplierName || supplier.supplier_name),
      eq(invoiceParties.partyType, 'SUPPLIER')
    ))
    .limit(1);

  const state = supplier.registeredAddressState || supplier.registered_address_state || supplier.state || 'N/A';
  const partyData = {
    partyName: supplier.supplierName || supplier.supplier_name || 'Unknown',
    partyType: 'SUPPLIER' as const,
    billingAddress: [
      supplier.registeredAddressStreet || supplier.registered_address_street,
      supplier.registeredAddressCity || supplier.registered_address_city,
      state
    ].filter(Boolean).join(', ') || 'N/A',
    city: supplier.registeredAddressCity || supplier.registered_address_city || supplier.city || 'N/A',
    state: state,
    stateCode: getStateCode(state),
    pincode: supplier.registeredAddressPostalCode || supplier.registered_address_postal_code || supplier.pincode || '000000',
    gstin: supplier.gstin || supplier.taxId || supplier.tax_id || null,
    pan: supplier.pan || null,
    contactPerson: supplier.contactPersonName || supplier.contact_person_name || null,
    contactNumber: supplier.contactPhone || supplier.contact_phone || supplier.contactPersonMobile || null,
    email: supplier.contactEmail || supplier.contact_email || supplier.contactPersonEmail || null,
    creditDays: supplier.paymentTerms || supplier.payment_terms || 30,
    isActive: true
  };

  if (existing.length > 0) {
    // Update existing
    const [party] = await db
      .update(invoiceParties)
      .set({ ...partyData, updatedAt: new Date() })
      .where(eq(invoiceParties.id, existing[0].id))
      .returning();
    return party;
  } else {
    // Create new
    const [party] = await db.insert(invoiceParties).values(partyData).returning();
    return party;
  }
}

// Product Management
export async function createProduct(data: InsertProduct): Promise<Product> {
  const [product] = await db.insert(invoiceProducts).values(data).returning();
  return product;
}

export async function getAllProducts(): Promise<Product[]> {
  return await db.select().from(invoiceProducts).where(eq(invoiceProducts.isActive, true)).orderBy(invoiceProducts.productName);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await db.select().from(invoiceProducts).where(eq(invoiceProducts.id, id)).limit(1);
  return product[0] || null;
}

export async function updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product> {
  const [product] = await db
    .update(invoiceProducts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoiceProducts.id, id))
    .returning();
  return product;
}

export async function updateProductStock(id: string, quantity: number, type: 'IN' | 'OUT'): Promise<Product> {
  const product = await getProductById(id);
  if (!product) throw new Error('Product not found');
  
  const currentStock = parseFloat(product.currentStock?.toString() || '0');
  const newStock = type === 'IN' ? currentStock + quantity : currentStock - quantity;
  
  return await updateProduct(id, { currentStock: newStock });
}

export async function deleteProduct(id: string): Promise<void> {
  await db.update(invoiceProducts).set({ isActive: false }).where(eq(invoiceProducts.id, id));
}

// Transporter Management
export async function createTransporter(data: InsertTransporter): Promise<Transporter> {
  const [transporter] = await db.insert(invoiceTransporters).values(data).returning();
  return transporter;
}

export async function getAllTransporters(): Promise<Transporter[]> {
  return await db.select().from(invoiceTransporters).where(eq(invoiceTransporters.isActive, true)).orderBy(invoiceTransporters.transporterName);
}

export async function getTransporterById(id: string): Promise<Transporter | null> {
  const transporter = await db.select().from(invoiceTransporters).where(eq(invoiceTransporters.id, id)).limit(1);
  return transporter[0] || null;
}

export async function updateTransporter(id: string, data: Partial<InsertTransporter>): Promise<Transporter> {
  const [transporter] = await db
    .update(invoiceTransporters)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(invoiceTransporters.id, id))
    .returning();
  return transporter;
}

export async function deleteTransporter(id: string): Promise<void> {
  await db.update(invoiceTransporters).set({ isActive: false }).where(eq(invoiceTransporters.id, id));
}

// Sales Invoice Management
export async function createSalesInvoice(invoiceData: InsertSalesInvoice, itemsData: InsertSalesInvoiceItem[]): Promise<{ invoice: SalesInvoice; items: SalesInvoiceItem[] }> {
  return await db.transaction(async (tx) => {
    // Create the invoice
    const [invoice] = await tx.insert(salesInvoices).values(invoiceData).returning();
    
    // Create invoice items
    const itemsWithInvoiceId = itemsData.map((item, index) => ({
      ...item,
      invoiceId: invoice.id,
      lineNumber: index + 1
    }));
    
    const items = await tx.insert(salesInvoiceItems).values(itemsWithInvoiceId).returning();
    
    // Update stock for each item
    for (const item of items) {
      await updateProductStock(item.productId, parseFloat(item.quantity.toString()), 'OUT');
      
      // Create stock ledger entry
      // TODO: Uncomment when stockLedger table is added to schema
      /*
      await tx.insert(stockLedger).values({
        productId: item.productId,
        transactionDate: invoice.invoiceDate,
        transactionType: 'SALE',
        referenceNumber: invoice.invoiceNumber,
        quantityOut: parseFloat(item.quantity.toString()),
        balanceQuantity: 0, // Will be calculated
        rate: parseFloat(item.ratePerUnit.toString()),
        value: parseFloat(item.totalAmount.toString()),
        createdBy: invoice.createdBy
      });
      */
    }
    
    return { invoice, items };
  });
}

export async function getAllSalesInvoices(): Promise<SalesInvoice[]> {
  return await db.select().from(salesInvoices).orderBy(desc(salesInvoices.createdAt));
}

export async function getSalesInvoiceById(id: string): Promise<SalesInvoice | null> {
  const invoice = await db.select().from(salesInvoices).where(eq(salesInvoices.id, id)).limit(1);
  return invoice[0] || null;
}

export async function getSalesInvoiceWithItems(id: string): Promise<{ invoice: SalesInvoice; items: SalesInvoiceItem[] } | null> {
  const invoice = await getSalesInvoiceById(id);
  if (!invoice) return null;
  
  const items = await db.select().from(salesInvoiceItems).where(eq(salesInvoiceItems.invoiceId, id));
  return { invoice, items };
}

export async function updateSalesInvoice(id: string, data: Partial<InsertSalesInvoice>): Promise<SalesInvoice> {
  const [invoice] = await db
    .update(salesInvoices)
    .set({ ...data, modifiedAt: new Date() })
    .where(eq(salesInvoices.id, id))
    .returning();
  return invoice;
}

export async function deleteSalesInvoice(id: string): Promise<void> {
  await db.delete(salesInvoices).where(eq(salesInvoices.id, id));
}

// Purchase Invoice Management
export async function createPurchaseInvoice(invoiceData: InsertPurchaseInvoice, itemsData: InsertPurchaseInvoiceItem[]): Promise<{ invoice: PurchaseInvoice; items: PurchaseInvoiceItem[] }> {
  return await db.transaction(async (tx) => {
    // Convert date strings to Date objects before insert
    const processedInvoiceData = {
      ...invoiceData,
      invoiceDate: invoiceData.invoiceDate instanceof Date 
        ? invoiceData.invoiceDate 
        : new Date(invoiceData.invoiceDate as any),
      supplierInvoiceDate: invoiceData.supplierInvoiceDate instanceof Date 
        ? invoiceData.supplierInvoiceDate 
        : new Date(invoiceData.supplierInvoiceDate as any),
      dueDate: invoiceData.dueDate 
        ? (invoiceData.dueDate instanceof Date ? invoiceData.dueDate : new Date(invoiceData.dueDate as any))
        : null
    };
    
    // Remove any undefined/null date that would cause issues
    if (!processedInvoiceData.dueDate) {
      delete (processedInvoiceData as any).dueDate;
    }
    
    console.log('Processed invoice data for insert:', JSON.stringify(processedInvoiceData, null, 2));
    
    // Create the invoice
    const [invoice] = await tx.insert(purchaseInvoices).values(processedInvoiceData).returning();
    
    // Create invoice items
    const itemsWithInvoiceId = itemsData.map((item, index) => ({
      ...item,
      invoiceId: invoice.id,
      lineNumber: index + 1
    }));
    
    const items = await tx.insert(purchaseInvoiceItems).values(itemsWithInvoiceId).returning();
    
    // Update stock for each item (only if productId exists)
    for (const item of items) {
      if (item.productId) {
        try {
          await updateProductStock(item.productId, parseFloat(item.quantity.toString()), 'IN');
          
          // Create stock ledger entry
          // TODO: Uncomment when stockLedger table is added to schema
          /*
          await tx.insert(stockLedger).values({
            productId: item.productId,
            transactionDate: invoice.invoiceDate,
            transactionType: 'PURCHASE',
            referenceNumber: invoice.invoiceNumber,
            quantityIn: parseFloat(item.quantity.toString()),
            balanceQuantity: 0, // Will be calculated
            rate: parseFloat(item.ratePerUnit.toString()),
            value: parseFloat(item.totalAmount.toString()),
            createdBy: invoice.createdBy
          });
          */
        } catch (error) {
          console.error('Error updating stock for product:', item.productId, error);
          // Continue with other items
        }
      }
    }
    
    return { invoice, items };
  });
}

export async function getAllPurchaseInvoices(): Promise<PurchaseInvoice[]> {
  return await db.select().from(purchaseInvoices).orderBy(desc(purchaseInvoices.createdAt));
}

export async function getPurchaseInvoiceById(id: string): Promise<PurchaseInvoice | null> {
  const invoice = await db.select().from(purchaseInvoices).where(eq(purchaseInvoices.id, id)).limit(1);
  return invoice[0] || null;
}

export async function getPurchaseInvoiceWithItems(id: string): Promise<{ invoice: PurchaseInvoice; items: PurchaseInvoiceItem[] } | null> {
  const invoice = await getPurchaseInvoiceById(id);
  if (!invoice) return null;
  
  const items = await db.select().from(purchaseInvoiceItems).where(eq(purchaseInvoiceItems.invoiceId, id));
  return { invoice, items };
}

export async function updatePurchaseInvoice(id: string, data: Partial<InsertPurchaseInvoice>): Promise<PurchaseInvoice> {
  const [invoice] = await db
    .update(purchaseInvoices)
    .set({ ...data, modifiedAt: new Date() })
    .where(eq(purchaseInvoices.id, id))
    .returning();
  return invoice;
}

export async function deletePurchaseInvoice(id: string): Promise<void> {
  await db.delete(purchaseInvoices).where(eq(purchaseInvoices.id, id));
}

// Payment Management
export async function createPayment(data: InsertPaymentTransaction): Promise<PaymentTransaction> {
  return await db.transaction(async (tx) => {
    const [payment] = await tx.insert(paymentTransactions).values(data).returning();
    
    // Update invoice payment status
    if (data.invoiceId) {
      const invoice = await getSalesInvoiceById(data.invoiceId);
      if (invoice) {
        const totalPaid = await getTotalPaymentsForInvoice(data.invoiceId);
        const newStatus = totalPaid >= parseFloat(invoice.totalInvoiceAmount.toString()) ? 'PAID' : 'PARTIAL';
        await updateSalesInvoice(data.invoiceId, { paymentStatus: newStatus });
      }
    }
    
    if (data.purchaseInvoiceId) {
      const invoice = await getPurchaseInvoiceById(data.purchaseInvoiceId);
      if (invoice) {
        const totalPaid = await getTotalPaymentsForPurchaseInvoice(data.purchaseInvoiceId);
        const newStatus = totalPaid >= parseFloat(invoice.totalInvoiceAmount.toString()) ? 'PAID' : 'PARTIAL';
        await updatePurchaseInvoice(data.purchaseInvoiceId, { paymentStatus: newStatus });
      }
    }
    
    return payment;
  });
}

export async function getTotalPaymentsForInvoice(invoiceId: string): Promise<number> {
  const result = await db
    .select({ total: sum(paymentTransactions.amountPaid) })
    .from(paymentTransactions)
    .where(eq(paymentTransactions.invoiceId, invoiceId));
  
  return parseFloat(result[0]?.total?.toString() || '0');
}

export async function getTotalPaymentsForPurchaseInvoice(purchaseInvoiceId: string): Promise<number> {
  const result = await db
    .select({ total: sum(paymentTransactions.amountPaid) })
    .from(paymentTransactions)
    .where(eq(paymentTransactions.purchaseInvoiceId, purchaseInvoiceId));
  
  return parseFloat(result[0]?.total?.toString() || '0');
}

// Stock Management
// TODO: Uncomment when stockLedger table is added to schema
/*
export async function getStockLedger(productId?: string): Promise<StockLedgerEntry[]> {
  let query = db.select().from(stockLedger);
  
  if (productId) {
    query = query.where(eq(stockLedger.productId, productId));
  }
  
  return await query.orderBy(desc(stockLedger.createdAt));
}
*/

export async function getLowStockProducts(): Promise<Product[]> {
  return await db
    .select()
    .from(invoiceProducts)
    .where(
      and(
        eq(invoiceProducts.isActive, true),
        sql`${invoiceProducts.currentStock} <= ${invoiceProducts.minimumStockLevel}`
      )
    );
}

// Reporting Functions
export async function getSalesReportByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
  return await db
    .select({
      invoiceNumber: salesInvoices.invoiceNumber,
      invoiceDate: salesInvoices.invoiceDate,
      customerName: sql`(SELECT party_name FROM invoiceParties WHERE id = ${salesInvoices.customerId})`,
      totalAmount: salesInvoices.totalInvoiceAmount,
      paymentStatus: salesInvoices.paymentStatus
    })
    .from(salesInvoices)
    .where(
      and(
        sql`${salesInvoices.invoiceDate} >= ${startDate}`,
        sql`${salesInvoices.invoiceDate} <= ${endDate}`
      )
    )
    .orderBy(desc(salesInvoices.invoiceDate));
}

export async function getPurchaseReportByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
  return await db
    .select({
      invoiceNumber: purchaseInvoices.invoiceNumber,
      invoiceDate: purchaseInvoices.invoiceDate,
      supplierName: sql`(SELECT party_name FROM invoiceParties WHERE id = ${purchaseInvoices.supplierId})`,
      totalAmount: purchaseInvoices.totalInvoiceAmount,
      paymentStatus: purchaseInvoices.paymentStatus
    })
    .from(purchaseInvoices)
    .where(
      and(
        sql`${purchaseInvoices.invoiceDate} >= ${startDate}`,
        sql`${purchaseInvoices.invoiceDate} <= ${endDate}`
      )
    )
    .orderBy(desc(purchaseInvoices.invoiceDate));
}

// Helper Functions
export async function generateInvoiceNumber(type: 'SALES' | 'PURCHASE', financialYear: string): Promise<string> {
  const table = type === 'SALES' ? salesInvoices : purchaseInvoices;
  
  // Get the short financial year format (e.g., "2025-2026" -> "25-26" OR "2025-26" -> "25-26")
  let shortFY = '';
  if (financialYear.includes('-')) {
    const fyParts = financialYear.split('-');
    if (fyParts.length === 2) {
      // Handle both "2025-2026" and "2025-26" formats
      const startYear = fyParts[0].slice(-2);
      const endYear = fyParts[1].length === 4 ? fyParts[1].slice(-2) : fyParts[1];
      shortFY = `${startYear}-${endYear}`;
    }
  }
  if (!shortFY) {
    shortFY = financialYear;
  }
  
  // Count all invoices for this financial year (match both full and short formats)
  const allInvoices = await db
    .select()
    .from(table)
    .orderBy(desc(table.createdAt));
  
  // Filter invoices by financial year (handle multiple formats)
  const fyInvoices = allInvoices.filter(inv => {
    const invFY = inv.financialYear || '';
    // Match both full (2025-2026) and short (2025-26) formats
    return invFY === financialYear || 
           invFY === `${financialYear.slice(0, 4)}-20${financialYear.slice(-2)}` ||
           invFY.slice(-5) === shortFY;
  });
  
  let nextNumber = 1;
  
  // Find the highest serial number used in this financial year
  for (const invoice of fyInvoices) {
    const invoiceNum = invoice.invoiceNumber || '';
    // Match the serial number from format SRIHM/XX/YY-YY
    const match = invoiceNum.match(/SRIHM\/(\d+)\//);
    if (match) {
      const serialNum = parseInt(match[1]);
      if (serialNum >= nextNumber) {
        nextNumber = serialNum + 1;
      }
    }
  }
  
  console.log(`Generating invoice number: Found ${fyInvoices.length} invoices for FY ${financialYear}, next serial: ${nextNumber}`);
  
  // Format: SRIHM/SERIAL/FY (e.g., SRIHM/01/25-26)
  return `SRIHM/${nextNumber.toString().padStart(2, '0')}/${shortFY}`;
}

export async function getCurrentFinancialYear(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Financial year in India runs from April to March
  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

export async function validateGSTIN(gstin: string): Promise<boolean> {
  // Basic GSTIN format validation: 15 characters, alphanumeric
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

// Get all sales invoices with their items for profit report
export async function getAllSalesInvoicesWithItems(): Promise<any[]> {
  const allInvoices = await db.select().from(salesInvoices).orderBy(desc(salesInvoices.invoiceDate));
  
  const invoicesWithItems = await Promise.all(
    allInvoices.map(async (invoice) => {
      const items = await db.select().from(salesInvoiceItems).where(eq(salesInvoiceItems.invoiceId, invoice.id));
      
      // Get customer details
      let customerName = 'N/A';
      let customerGstin = 'N/A';
      if (invoice.customerId) {
        const customer = await db.select().from(invoiceParties).where(eq(invoiceParties.id, invoice.customerId)).limit(1);
        if (customer.length > 0) {
          customerName = customer[0].partyName || customer[0].companyName || 'N/A';
          customerGstin = customer[0].gstin || 'N/A';
        }
      }
      
      return {
        ...invoice,
        customerName,
        customerGstin,
        items
      };
    })
  );
  
  return invoicesWithItems;
}

// Get all purchase invoices with their items for profit report
export async function getAllPurchaseInvoicesWithItems(): Promise<any[]> {
  const allInvoices = await db.select().from(purchaseInvoices).orderBy(desc(purchaseInvoices.invoiceDate));
  
  const invoicesWithItems = await Promise.all(
    allInvoices.map(async (invoice) => {
      const items = await db.select().from(purchaseInvoiceItems).where(eq(purchaseInvoiceItems.invoiceId, invoice.id));
      
      // Get supplier details
      let supplierName = 'N/A';
      let supplierGstin = 'N/A';
      if (invoice.supplierId) {
        const supplier = await db.select().from(invoiceParties).where(eq(invoiceParties.id, invoice.supplierId)).limit(1);
        if (supplier.length > 0) {
          supplierName = supplier[0].partyName || supplier[0].companyName || 'N/A';
          supplierGstin = supplier[0].gstin || 'N/A';
        }
      }
      
      return {
        ...invoice,
        supplierName,
        supplierGstin,
        items
      };
    })
  );
  
  return invoicesWithItems;
}
