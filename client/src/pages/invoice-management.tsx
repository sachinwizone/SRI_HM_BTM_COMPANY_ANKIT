import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FileText, 
  ShoppingCart, 
  Package, 
  Receipt, 
  TrendingUp,
  Plus,
  Eye,
  ArrowLeft,
  Trash2,
  Printer,
  Download,
  RefreshCw,
  IndianRupee
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrintableTaxInvoice } from '@/components/PrintableTaxInvoice';

type ViewMode = 'main' | 'sales-form' | 'purchase-form' | 'sales-list' | 'purchase-list';

interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  type: 'sales' | 'purchase';
  customerSupplier: string;
  amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  dueDate: string;
}

// Mock data for demonstration
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNo: 'SI-001/2025',
    date: '2025-11-01',
    type: 'sales',
    customerSupplier: 'RAMKRISHNA TRADERS',
    amount: 125000.00,
    status: 'pending',
    dueDate: '2025-12-01'
  },
  {
    id: '2',
    invoiceNo: 'PI-002/2025', 
    date: '2025-11-02',
    type: 'purchase',
    customerSupplier: 'M/S.SRI HM BITUMEN CO',
    amount: 89500.00,
    status: 'paid',
    dueDate: '2025-12-02'
  }
];

// Purchase Invoice Form Component (based on your HTML template)
const PurchaseInvoiceForm = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch suppliers directly from Suppliers Master - LIVE auto-sync
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<any[]>({
    queryKey: ['/api/suppliers'],
  });

  // Fetch products from database
  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['/api/product-master'],
  });

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<{ [key: number]: string }>({});
  const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    ewayBill: '',
    ackNo: '',
    ackDate: '',
    supplierId: '',
    supplierName: '',
    supplierGSTIN: '',
    supplierAddress: '',
    supplierState: '',
    supplierStateCode: '',
    supplierContact: '',
    buyerName: 'RAMKRISHNA TRADERS',
    buyerGSTIN: '18BCWPP7863H1ZL',
    buyerAddress: 'Business Address, Guwahati, Assam',
    buyerState: 'Assam',
    buyerStateCode: '18',
    transporter: '',
    vehicleNo: '',
    lrNo: '',
    placeOfLoading: '',
    destination: '',
    distance: '',
    items: [{
      id: 1,
      description: '',
      hsn: '',
      quantity: 1,
      unit: '',
      rate: 0,
      amount: 0,
      transitInsurance: 0,
      totalAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      taxableAmount: 0
    }],
    insurance: 0,
    freight: 0,
    otherCharges: 0,
    paymentTerms: '30 DAYS CREDIT',
    dueDate: '',
    remarks: ''
  });

  // No auto-generation for purchase invoice - manual entry required

  // Handle supplier selection and auto-fill (from Suppliers Master)
  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    const supplier = suppliers.find(s => s.id === supplierId);
    
    if (supplier) {
      // Build full address from Suppliers Master data
      const addressParts = [
        supplier.registeredAddressStreet,
        supplier.registeredAddressCity,
        supplier.registeredAddressState,
        supplier.registeredAddressPostalCode
      ].filter(Boolean);
      
      const fullAddress = addressParts.join(', ') || supplier.billingAddressStreet || 'N/A';
      
      setFormData(prev => ({
        ...prev,
        supplierId: supplier.id,
        supplierName: supplier.supplierName || '',
        supplierGSTIN: supplier.gstin || supplier.taxId || '',
        supplierAddress: fullAddress,
        supplierState: supplier.registeredAddressState || '',
        supplierStateCode: getStateCode(supplier.registeredAddressState) || '',
        supplierContact: supplier.contactPhone || ''
      }));
    }
  };
  
  // Helper function to get state code
  const getStateCode = (stateName: string | null | undefined): string => {
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
  };

  // Handle product selection and auto-fill
  const handleProductChange = (productId: string, itemIndex: number) => {
    setSelectedProductIds(prev => ({ ...prev, [itemIndex]: productId }));
    const product = products.find(p => p.id === productId);
    
    if (product) {
      const newItems = [...formData.items];
      // Map common unit values to valid enum values
      let unit = product.unit || 'DRUM';
      const unitMap: { [key: string]: string } = {
        'MT': 'TON', 'METRIC TON': 'TON', 'KGS': 'KG', 'KILOGRAM': 'KG',
        'LTR': 'LITRE', 'LITRES': 'LITRE', 'PCS': 'PIECE', 'NOS': 'PIECE'
      };
      unit = unitMap[unit.toUpperCase()] || unit.toUpperCase();
      
      const quantity = newItems[itemIndex].quantity;
      const rate = parseFloat(product.rate || '0');
      const amount = quantity * rate;
      const taxRate = parseFloat(product.taxRate || '18');
      const transitInsurance = newItems[itemIndex].transitInsurance || 0;
      const totalAmount = amount + transitInsurance;
      const taxAmount = (totalAmount * taxRate) / 100;
      const taxableAmount = totalAmount + taxAmount;
      
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        description: product.name || product.description || '',
        hsn: product.hsnCode || '',
        unit: unit,
        rate: rate,
        taxRate: taxRate,
        amount: amount,
        totalAmount: totalAmount,
        taxAmount: taxAmount,
        taxableAmount: taxableAmount
      };
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  // Add new item row
  const addItem = () => {
    const newItemId = formData.items.length + 1;
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: newItemId,
          description: '',
          hsn: '',
          quantity: 1,
          unit: 'DRUM',
          rate: 0,
          amount: 0,
          taxRate: 18,
          transitInsurance: 0,
          totalAmount: 0,
          taxAmount: 0,
          taxableAmount: 0
        }
      ]
    }));
  };

  // Remove item row
  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      // Also remove the selected product for this index
      const newSelectedProductIds = { ...selectedProductIds };
      delete newSelectedProductIds[index];
      // Re-index the remaining selected products
      const reindexedProductIds: { [key: number]: string } = {};
      Object.keys(newSelectedProductIds).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          reindexedProductIds[keyNum - 1] = newSelectedProductIds[keyNum];
        } else {
          reindexedProductIds[keyNum] = newSelectedProductIds[keyNum];
        }
      });
      setSelectedProductIds(reindexedProductIds);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const calculateTotals = () => {
    let subtotal = 0; // Sum of base amounts (Qty × Rate)
    let totalTaxAmount = 0;
    
    // Calculate for each item
    formData.items.forEach(item => {
      // For purchase invoice, we need to sum the base amounts + transit insurance
      subtotal += (item.totalAmount || 0); // This is Amount + Transit Insurance
      totalTaxAmount += (item.taxAmount || 0); // This is the tax on totalAmount
    });
    
    // Add additional charges to subtotal
    const additionalCharges = formData.insurance + formData.freight + formData.otherCharges;
    const taxableAmount = subtotal + additionalCharges;
    
    // Split tax into CGST and SGST
    const totalCgst = totalTaxAmount / 2;
    const totalSgst = totalTaxAmount / 2;
    
    // Final total = Taxable Amount + Total Tax
    const totalBeforeRound = taxableAmount + totalTaxAmount;
    const roundedTotal = Math.round(totalBeforeRound);
    const roundOff = roundedTotal - totalBeforeRound;

    return {
      taxableAmount: taxableAmount,
      cgstAmount: totalCgst,
      sgstAmount: totalSgst,
      igstAmount: 0,
      roundOff,
      totalAmount: roundedTotal
    };
  };

  const totals = calculateTotals();

  // Mutation for saving invoice
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('=== CLIENT: Sending invoice data ===');
      console.log('Invoice:', JSON.stringify(data.invoice, null, 2));
      console.log('Items:', JSON.stringify(data.items, null, 2));
      
      const response = await fetch('/api/sales-operations/purchase-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response (raw):', errorText);
        
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        console.error('Server error response (parsed):', errorData);
        throw new Error(errorData.error || `Server error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Invoice saved successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/purchase-invoices'] });
      toast({
        title: "Success!",
        description: "Purchase Invoice saved successfully!",
      });
      // Reset form or go back
      setTimeout(() => onBack(), 1500);
    },
    onError: (error: any) => {
      console.error('=== CLIENT: Save invoice error ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast({
        title: "Error",
        description: error.message || "Failed to save purchase invoice",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!');
    
    // Validate required fields
    if (!formData.supplierId) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.invoiceNo) {
      toast({
        title: "Validation Error",
        description: "Please enter invoice number",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate financial year (Apr-Mar)
    const invoiceDate = new Date(formData.invoiceDate);
    const year = invoiceDate.getFullYear();
    const month = invoiceDate.getMonth();
    const financialYear = month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    
    // Prepare invoice data
    const invoiceData = {
      invoice: {
        invoiceNumber: formData.invoiceNo,
        invoiceDate: formData.invoiceDate, // Keep as string, server will convert
        financialYear: financialYear,
        
        // Required supplier fields
        supplierId: formData.supplierId,
        supplierInvoiceNumber: formData.invoiceNo, // Use same as invoice number
        supplierInvoiceDate: formData.invoiceDate, // Keep as string
        placeOfSupply: formData.supplierState || 'Assam',
        placeOfSupplyStateCode: formData.supplierStateCode || '18',
        
        // Payment terms
        paymentTerms: formData.paymentTerms || '30 Days Credit',
        dueDate: formData.dueDate || null,
        
        // Amounts
        subtotalAmount: totals.taxableAmount,
        cgstAmount: totals.cgstAmount,
        sgstAmount: totals.sgstAmount,
        igstAmount: totals.igstAmount || 0,
        otherCharges: formData.otherCharges || 0,
        roundOff: totals.roundOff,
        totalInvoiceAmount: totals.totalAmount,
        
        // Status
        invoiceStatus: 'DRAFT',
        paymentStatus: 'PENDING'
      },
      items: formData.items.map((item, index) => {
        const taxRate = item.taxRate || 0;
        const cgstRate = taxRate / 2;
        const sgstRate = taxRate / 2;
        const cgstAmount = (item.amount * cgstRate) / 100;
        const sgstAmount = (item.amount * sgstRate) / 100;
        
        return {
          productId: null, // Will be handled by backend
          productName: item.description,
          productDescription: item.description,
          hsnSacCode: item.hsn,
          quantity: item.quantity,
          unitOfMeasurement: item.unit,
          ratePerUnit: item.rate,
          grossAmount: item.amount,
          discountPercentage: 0,
          discountAmount: 0,
          taxableAmount: item.amount,
          cgstRate: cgstRate,
          cgstAmount: cgstAmount,
          sgstRate: sgstRate,
          sgstAmount: sgstAmount,
          igstRate: 0,
          igstAmount: 0,
          totalAmount: item.amount + cgstAmount + sgstAmount
        };
      })
    };
    
    console.log('=== CLIENT: Prepared invoice data ===');
    console.log('Invoice:', invoiceData.invoice);
    console.log('Invoice Date Type:', typeof invoiceData.invoice.invoiceDate);
    console.log('Due Date:', invoiceData.invoice.dueDate);
    console.log('Due Date Type:', typeof invoiceData.invoice.dueDate);
    console.log('Items:', invoiceData.items);
    saveMutation.mutate(invoiceData);
  };

  // Prepare invoice data for printable component
  const getPrintableInvoiceData = () => ({
    invoiceNo: formData.invoiceNo,
    invoiceDate: formData.invoiceDate,
    ewayBill: formData.ewayBill,
    ackNo: formData.ackNo,
    ackDate: formData.ackDate,
    paymentTerms: formData.paymentTerms,
    consigneeName: formData.buyerName,
    consigneeAddress: formData.buyerAddress,
    consigneeGSTIN: formData.buyerGSTIN,
    consigneeState: formData.buyerState,
    consigneeStateCode: formData.buyerStateCode,
    buyerName: formData.buyerName,
    buyerAddress: formData.buyerAddress,
    buyerGSTIN: formData.buyerGSTIN,
    buyerState: formData.buyerState,
    buyerStateCode: formData.buyerStateCode,
    dispatchedThrough: formData.transporter,
    vesselFlightNo: formData.vehicleNo,
    cityPortOfLoading: formData.placeOfLoading,
    destination: formData.destination,
    lrRrNo: formData.lrNo,
    vehicleNo: formData.vehicleNo,
    transporter: formData.transporter,
    items: formData.items,
    transitInsurance: formData.insurance,
    freight: formData.freight,
    otherCharges: formData.otherCharges,
    taxableAmount: totals.taxableAmount,
    cgstAmount: totals.cgstAmount,
    sgstAmount: totals.sgstAmount,
    igstAmount: totals.igstAmount,
    roundOff: totals.roundOff,
    totalAmount: totals.totalAmount,
    remarks: formData.remarks
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 5mm;
            size: A4;
          }
        }
        .print-section {
          display: none;
        }
        @media print {
          .print-section {
            display: block;
          }
        }
      `}</style>

      {/* Printable Invoice Format - Hidden on screen, shown on print */}
      <div className="print-section">
        <PrintableTaxInvoice invoiceData={getPrintableInvoiceData()} />
      </div>

      {/* Screen View - Form */}
      <div className="max-w-6xl mx-auto no-print">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoice Management
          </Button>
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Package className="w-8 h-8 mr-3" />
              Purchase Invoice Entry Form
            </h1>
            <p className="text-green-100">Enter all invoice details accurately</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number * <span className="text-xs text-blue-600">(Manual Entry)</span></label>
                  <input
                    type="text"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    placeholder="Enter invoice number (e.g., SRIHM/01/25-26)"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Way Bill No.</label>
                  <input
                    type="text"
                    value={formData.ewayBill}
                    onChange={(e) => setFormData(prev => ({ ...prev, ewayBill: e.target.value }))}
                    placeholder="e.g., 891596274939"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              {/* e-Invoice Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ack No.</label>
                  <input
                    type="text"
                    value={formData.ackNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, ackNo: e.target.value }))}
                    placeholder="e.g., 182521022856527"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ack Date</label>
                  <input
                    type="date"
                    value={formData.ackDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, ackDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Details */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Supplier Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                  <Select 
                    value={selectedSupplierId}
                    onValueChange={handleSupplierChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliersLoading ? (
                        <SelectItem value="loading" disabled>Loading suppliers...</SelectItem>
                      ) : suppliers.length === 0 ? (
                        <SelectItem value="no-suppliers" disabled>No suppliers found - Add in Suppliers Master</SelectItem>
                      ) : (
                        suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.supplierName}{supplier.gstin ? ` - ${supplier.gstin}` : (supplier.taxId ? ` - ${supplier.taxId}` : '')}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={formData.supplierGSTIN}
                    placeholder="e.g., 18CGMPP6536N2ZG (Optional)"
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.supplierAddress}
                  placeholder="Complete address"
                  readOnly
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Items / Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-green-500 text-white">
                      <th className="border border-gray-300 p-2 text-left">Description</th>
                      <th className="border border-gray-300 p-2 text-left">HSN/SAC</th>
                      <th className="border border-gray-300 p-2 text-left">Qty</th>
                      <th className="border border-gray-300 p-2 text-left">Unit</th>
                      <th className="border border-gray-300 p-2 text-left">Rate</th>
                      <th className="border border-gray-300 p-2 text-left">Amount</th>
                      <th className="border border-gray-300 p-2 text-left">Tax %</th>
                      <th className="border border-gray-300 p-2 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 p-2">
                          <Select 
                            value={selectedProductIds[index] || ''}
                            onValueChange={(productId) => handleProductChange(productId, index)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productsLoading ? (
                                <SelectItem value="loading" disabled>Loading products...</SelectItem>
                              ) : products.length === 0 ? (
                                <SelectItem value="no-products" disabled>No products found</SelectItem>
                              ) : (
                                products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name || product.description} - {product.productCode}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={item.hsn}
                            readOnly
                            className="w-full p-1 border border-gray-200 rounded bg-gray-50"
                            placeholder="HSN Code"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              const quantity = parseFloat(e.target.value) || 0;
                              newItems[index].quantity = quantity;
                              // Calculate amount
                              newItems[index].amount = quantity * newItems[index].rate;
                              // Calculate total amount (Amount + Transit Insurance)
                              newItems[index].totalAmount = newItems[index].amount + (newItems[index].transitInsurance || 0);
                              // Calculate tax amount
                              newItems[index].taxAmount = (newItems[index].totalAmount * newItems[index].taxRate) / 100;
                              // Calculate taxable amount
                              newItems[index].taxableAmount = newItems[index].totalAmount + newItems[index].taxAmount;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <select
                            value={item.unit}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].unit = e.target.value;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded bg-white"
                          >
                            <option value="DRUM">DRUM</option>
                            <option value="KG">KG</option>
                            <option value="TON">TON (MT)</option>
                            <option value="LITRE">LITRE</option>
                            <option value="PIECE">PIECE</option>
                            <option value="METER">METER</option>
                            <option value="BOX">BOX</option>
                          </select>
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              const rate = parseFloat(e.target.value) || 0;
                              newItems[index].rate = rate;
                              // Calculate amount
                              newItems[index].amount = newItems[index].quantity * rate;
                              // Calculate total amount (Amount + Transit Insurance)
                              newItems[index].totalAmount = newItems[index].amount + (newItems[index].transitInsurance || 0);
                              // Calculate tax amount
                              newItems[index].taxAmount = (newItems[index].totalAmount * newItems[index].taxRate) / 100;
                              // Calculate taxable amount
                              newItems[index].taxableAmount = newItems[index].totalAmount + newItems[index].taxAmount;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 font-medium">
                          ₹{item.amount.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              const taxRate = parseFloat(e.target.value) || 0;
                              newItems[index].taxRate = taxRate;
                              // Recalculate tax amount
                              newItems[index].taxAmount = (newItems[index].totalAmount * taxRate) / 100;
                              // Recalculate taxable amount
                              newItems[index].taxableAmount = newItems[index].totalAmount + newItems[index].taxAmount;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={addItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-green-600">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Taxable Amount:</span>
                  <span className="font-semibold">₹ {totals.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CGST Amount:</span>
                  <span className="font-semibold">₹ {totals.cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">SGST Amount:</span>
                  <span className="font-semibold">₹ {totals.sgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                  <span>Total Invoice Amount:</span>
                  <span>₹ {totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-center gap-4 pb-6">
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? '⏳ Saving...' : '💾 Save Purchase Invoice'}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()} className="px-8 py-3 text-lg">
              🖨️ Print Preview
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sales Invoice Form Component
const SalesInvoiceForm = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch clients from Client Master
  const { data: clients = [], isLoading: clientsLoading } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  // Fetch products from Product Master
  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['/api/product-master'],
  });

  // Debug logging
  useEffect(() => {
    console.log('=== SALES FORM DEBUG ===');
    console.log('Clients loaded:', clients.length, 'Loading:', clientsLoading);
    console.log('Clients data:', clients);
    console.log('Products loaded:', products.length, 'Loading:', productsLoading);
    console.log('Products data:', products);
  }, [clients, products, clientsLoading, productsLoading]);

  // Helper function to map unit values to valid enum values
  const mapUnitToEnum = (unit: string): string => {
    const unitMap: { [key: string]: string } = {
      'PCS': 'PIECE',
      'PC': 'PIECE',
      'PIECE': 'PIECE',
      'MT': 'TON',
      'TON': 'TON',
      'DRUM': 'DRUM',
      'KG': 'KG',
      'LITRE': 'LITRE',
      'LITER': 'LITRE',
      'L': 'LITRE',
      'METER': 'METER',
      'M': 'METER',
      'BOX': 'BOX',
      '': 'PIECE' // Default to PIECE if empty
    };
    return unitMap[unit.toUpperCase()] || 'PIECE';
  };

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<{ [key: number]: string }>({});
  const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    ewayBillNo: '',
    ewayBillExpiryDate: '',
    customerId: '',
    customerName: '',
    customerGSTIN: '',
    customerAddress: '',
    items: [{
      id: 1,
      description: '',
      hsn: '',
      unit: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      taxRate: 18,
      transitInsurance: 0,
      totalAmount: 0,
      taxAmount: 0,
      taxableAmount: 0
    }]
  });

  // Auto-generate sales order number on form load
  useEffect(() => {
    const fetchNextSalesOrderNumber = async () => {
      try {
        const res = await fetch('/api/sales-operations/next-invoice-number?type=SALES', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, invoiceNo: data.invoiceNumber }));
        }
      } catch (error) {
        console.error('Failed to fetch next sales order number:', error);
      }
    };
    fetchNextSalesOrderNumber();
  }, []);

  // Handle client selection and auto-fill
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    
    if (client) {
      // Build full address
      const addressParts = [
        client.billing_address_line || client.address,
        client.billing_city || client.city,
        client.billing_state || client.state,
        client.billing_pincode || client.pincode
      ].filter(Boolean);
      
      const fullAddress = addressParts.join(', ') || 'N/A';
      
      setFormData(prev => ({
        ...prev,
        customerId: client.id,
        customerName: client.name || client.clientName || client.companyName || '',
        customerGSTIN: client.gst_number || client.gstin || '',
        customerAddress: fullAddress
      }));
    }
  };

  // Handle product selection and auto-fill
  const handleProductChange = (productId: string, index: number) => {
    setSelectedProductIds(prev => ({ ...prev, [index]: productId }));
    const product = products.find(p => p.id === productId);
    
    if (product) {
      const newItems = [...formData.items];
      const quantity = newItems[index].quantity;
      const rate = product.rate || product.sellingPrice || 0;
      const amount = rate * quantity;
      const taxRate = product.gstRate || product.gst_rate || 18; // Auto-populate tax rate from product
      const transitInsurance = newItems[index].transitInsurance || 0;
      const totalAmount = amount + transitInsurance;
      const taxAmount = (totalAmount * taxRate) / 100;
      const taxableAmount = totalAmount + taxAmount;
      
      newItems[index] = {
        ...newItems[index],
        description: product.name || product.productName || '',
        hsn: product.hsnCode || product.hsn_code || '',
        unit: product.unit || 'MT',
        rate: rate,
        amount: amount,
        taxRate: taxRate,
        totalAmount: totalAmount,
        taxAmount: taxAmount,
        taxableAmount: taxableAmount
      };
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  // Add new item row
  const addSalesItem = () => {
    const newItemId = formData.items.length + 1;
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: newItemId,
          description: '',
          hsn: '',
          unit: '',
          quantity: 1,
          rate: 0,
          amount: 0,
          taxRate: 18,
          transitInsurance: 0,
          totalAmount: 0,
          taxAmount: 0,
          taxableAmount: 0
        }
      ]
    }));
  };

  // Remove item row
  const removeSalesItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
      
      // Clean up selectedProductIds and reindex
      const newSelectedProductIds = { ...selectedProductIds };
      delete newSelectedProductIds[index];
      
      // Reindex remaining product IDs
      const reindexedProductIds: { [key: number]: string } = {};
      Object.keys(newSelectedProductIds).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexedProductIds[oldIndex - 1] = newSelectedProductIds[oldIndex];
        } else {
          reindexedProductIds[oldIndex] = newSelectedProductIds[oldIndex];
        }
      });
      
      setSelectedProductIds(reindexedProductIds);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0; // Sum of base amounts + transit insurance
    let totalTax = 0;
    
    formData.items.forEach(item => {
      // For sales invoice: sum the totalAmount (Amount + Transit Insurance)
      subtotal += item.totalAmount || 0;
      totalTax += item.taxAmount || 0;
    });
    
    const cgstAmount = totalTax / 2; // Half of total tax is CGST
    const sgstAmount = totalTax / 2; // Half of total tax is SGST
    
    // Total = Subtotal + Tax
    const totalBeforeRound = subtotal + totalTax;
    const roundedTotal = Math.round(totalBeforeRound);

    return {
      taxableAmount: subtotal, // This is the amount before tax
      cgstAmount,
      sgstAmount,
      totalAmount: roundedTotal // This includes tax
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('=== STARTING FORM SUBMISSION ===');
      console.log('Form Data:', formData);
      console.log('Selected Product IDs:', selectedProductIds);
      
      // Validate required fields
      if (!formData.customerId) {
        throw new Error('Please select a customer');
      }
      if (!formData.invoiceNo) {
        throw new Error('Invoice number is required');
      }
      if (!formData.invoiceDate) {
        throw new Error('Invoice date is required');
      }
      if (formData.items.length === 0) {
        throw new Error('At least one item is required');
      }
      
      console.log('Basic validation passed');
      
      // Prepare invoice data
      const invoice = {
        invoiceNumber: formData.invoiceNo,
        invoiceDate: formData.invoiceDate, // Keep as string, backend will handle
        invoiceType: 'TAX_INVOICE',
        customerId: formData.customerId,
        placeOfSupply: formData.customerAddress || 'N/A',
        placeOfSupplyStateCode: '00',
        ewayBillNumber: formData.ewayBillNo || null,
        ewayBillValidUpto: formData.ewayBillExpiryDate || null, // Keep as string
        dueDate: formData.dueDate || null, // Keep as string
        paymentTerms: '30 Days Credit',
        subtotalAmount: totals.taxableAmount.toFixed(2),
        cgstAmount: totals.cgstAmount.toFixed(2),
        sgstAmount: totals.sgstAmount.toFixed(2),
        igstAmount: '0',
        totalInvoiceAmount: totals.totalAmount.toFixed(2),
        remainingBalance: totals.totalAmount.toFixed(2),
        invoiceStatus: 'SUBMITTED', // Valid: DRAFT, SUBMITTED, CANCELLED
        paymentStatus: 'PENDING'
      };

      // Prepare items data
      const items = formData.items.map((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const rate = Number(item.rate) || 0;
        const amount = Number(item.amount) || 0;
        const productId = selectedProductIds[index];
        
        console.log(`Processing item ${index + 1}:`, {
          productId,
          description: item.description,
          hsn: item.hsn,
          unit: item.unit,
          quantity,
          rate,
          amount
        });
        
        // Validate required fields
        if (!productId) {
          throw new Error(`Product not selected for item ${index + 1}`);
        }
        if (!item.description) {
          throw new Error(`Product name is required for item ${index + 1}`);
        }
        if (!item.hsn) {
          throw new Error(`HSN/SAC code is required for item ${index + 1}`);
        }
        if (quantity <= 0) {
          throw new Error(`Quantity must be greater than 0 for item ${index + 1}`);
        }
        if (rate <= 0) {
          throw new Error(`Rate must be greater than 0 for item ${index + 1}`);
        }
        
        // Validate and map unit of measurement
        const mappedUnit = mapUnitToEnum(item.unit || '');
        console.log(`Mapped unit for item ${index + 1}: ${item.unit} → ${mappedUnit}`);
        
        return {
          productId: productId,
          productName: item.description,
          productDescription: item.description,
          hsnSacCode: item.hsn,
          quantity: quantity.toString(),
          unitOfMeasurement: mappedUnit,
          ratePerUnit: rate.toFixed(2),
          grossAmount: amount.toFixed(2),
          discountPercentage: '0',
          discountAmount: '0',
          taxableAmount: amount.toFixed(2),
          cgstRate: '9.00',
          cgstAmount: ((amount * 9) / 100).toFixed(2),
          sgstRate: '9.00',
          sgstAmount: ((amount * 9) / 100).toFixed(2),
          igstRate: '0',
          igstAmount: '0',
          totalAmount: (amount * 1.18).toFixed(2)
        };
      });

      console.log('Prepared invoice data:', JSON.stringify(invoice, null, 2));
      console.log('Prepared items data:', JSON.stringify(items, null, 2));

      const response = await fetch('/api/sales-operations/sales-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invoice, items })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Failed to create invoice';
        try {
          const error = await response.json();
          console.error('Server error response:', error);
          errorMessage = error.error || error.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, get text
          const errorText = await response.text();
          console.error('Server error (non-JSON):', errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Invoice created successfully:', result);

      toast({
        title: 'Success',
        description: 'Sales invoice created successfully!',
      });

      // Reset form and go back
      onBack();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        invoice: {
          customerId: formData.customerId,
          invoiceNo: formData.invoiceNo,
          itemsCount: formData.items.length
        }
      });
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to create sales invoice',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoice Management
          </Button>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3" />
              Sales Invoice Entry Form
            </h1>
            <p className="text-blue-100">Create and manage sales invoices</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sales Invoice Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sales Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Order Number * <span className="text-xs text-green-600">(Auto-generated)</span></label>
                  <input
                    type="text"
                    value={formData.invoiceNo}
                    placeholder="Auto-generated (e.g., SO-001/2025)"
                    required
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Date *</label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-way Bill Number</label>
                  <input
                    type="text"
                    value={formData.ewayBillNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, ewayBillNo: e.target.value }))}
                    placeholder="Enter E-way Bill Number"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-way Bill Expiry Date</label>
                  <input
                    type="date"
                    value={formData.ewayBillExpiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, ewayBillExpiryDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer *</label>
                  <Select 
                    value={selectedClientId}
                    onValueChange={handleClientChange}
                  >
                    <SelectTrigger className="w-full" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
                      <SelectValue placeholder="Select Customer from Client Master" />
                    </SelectTrigger>
                    <SelectContent className="bg-white" style={{ backgroundColor: '#ffffff' }}>
                      {clientsLoading ? (
                        <SelectItem value="loading" disabled style={{ color: '#6B7280', backgroundColor: '#FEE2E2' }}>Loading customers...</SelectItem>
                      ) : clients.length === 0 ? (
                        <SelectItem value="no-clients" disabled style={{ color: '#DC2626', backgroundColor: '#FEE2E2' }}>No customers found - Add in Client Master</SelectItem>
                      ) : (
                        clients.map((client) => (
                          <SelectItem 
                            key={client.id} 
                            value={client.id} 
                            style={{ 
                              color: '#000000',
                              backgroundColor: '#ffffff',
                              fontWeight: 'bold'
                            }}
                          >
                            {client.name || client.clientName || client.companyName || 'Unnamed Client'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Auto-filled from selection"
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={formData.customerGSTIN}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerGSTIN: e.target.value }))}
                  placeholder="Auto-filled from selection"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.customerAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="Auto-filled from selection"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoice Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-500 text-white">
                      <th className="border border-gray-300 p-2 text-left">Product/Description</th>
                      <th className="border border-gray-300 p-2 text-left">HSN/SAC</th>
                      <th className="border border-gray-300 p-2 text-left">Unit</th>
                      <th className="border border-gray-300 p-2 text-left">Qty</th>
                      <th className="border border-gray-300 p-2 text-left">Rate</th>
                      <th className="border border-gray-300 p-2 text-left">Amount</th>
                      <th className="border border-gray-300 p-2 text-left">Tax Rate %</th>
                      <th className="border border-gray-300 p-2 text-left">Transit Insurance</th>
                      <th className="border border-gray-300 p-2 text-left">Total Amount</th>
                      <th className="border border-gray-300 p-2 text-left">Tax Amount</th>
                      <th className="border border-gray-300 p-2 text-left">Taxable Amount</th>
                      <th className="border border-gray-300 p-2 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 p-2">
                          <Select
                            value={selectedProductIds[index] || ''}
                            onValueChange={(value) => handleProductChange(value, index)}
                          >
                            <SelectTrigger className="w-full mb-1" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
                              <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent className="bg-white max-h-[300px]" style={{ backgroundColor: '#ffffff' }}>
                              {productsLoading ? (
                                <SelectItem value="loading" disabled style={{ color: '#6B7280' }}>Loading products...</SelectItem>
                              ) : products.length === 0 ? (
                                <SelectItem value="no-products" disabled style={{ color: '#DC2626' }}>No products - Add in Product Master</SelectItem>
                              ) : (
                                products.map((product) => (
                                  <SelectItem key={product.id} value={product.id} style={{ color: '#111827' }}>
                                    {product.name || product.productName || 'Unnamed Product'}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            placeholder="Or type manually"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].hsn = e.target.value;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            placeholder="HSN/SAC"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].unit = e.target.value;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            placeholder="Unit"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              const quantity = parseFloat(e.target.value) || 0;
                              newItems[index].quantity = quantity;
                              // Calculate amount
                              newItems[index].amount = quantity * newItems[index].rate;
                              // Calculate total amount (Amount + Transit Insurance)
                              newItems[index].totalAmount = newItems[index].amount + newItems[index].transitInsurance;
                              // Calculate tax amount
                              newItems[index].taxAmount = (newItems[index].totalAmount * newItems[index].taxRate) / 100;
                              // Calculate taxable amount
                              newItems[index].taxableAmount = newItems[index].totalAmount + newItems[index].taxAmount;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              const rate = parseFloat(e.target.value) || 0;
                              newItems[index].rate = rate;
                              // Calculate amount
                              newItems[index].amount = newItems[index].quantity * rate;
                              // Calculate total amount (Amount + Transit Insurance)
                              newItems[index].totalAmount = newItems[index].amount + newItems[index].transitInsurance;
                              // Calculate tax amount
                              newItems[index].taxAmount = (newItems[index].totalAmount * newItems[index].taxRate) / 100;
                              // Calculate taxable amount
                              newItems[index].taxableAmount = newItems[index].totalAmount + newItems[index].taxAmount;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 font-medium">
                          ₹{item.amount.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            value={item.taxRate}
                            readOnly
                            className="w-full p-1 border border-gray-200 rounded bg-gray-50"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            value={item.transitInsurance}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              const transitInsurance = parseFloat(e.target.value) || 0;
                              newItems[index].transitInsurance = transitInsurance;
                              // Calculate total amount (Amount + Transit Insurance)
                              newItems[index].totalAmount = newItems[index].amount + transitInsurance;
                              // Calculate tax amount
                              newItems[index].taxAmount = (newItems[index].totalAmount * newItems[index].taxRate) / 100;
                              // Calculate taxable amount
                              newItems[index].taxableAmount = newItems[index].totalAmount + newItems[index].taxAmount;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 font-medium">
                          ₹{item.totalAmount.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2 font-medium">
                          ₹{item.taxAmount.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2 font-medium">
                          ₹{item.taxableAmount.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => removeSalesItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={addSalesItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-blue-600">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Taxable Amount:</span>
                  <span className="font-semibold">₹ {totals.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CGST Amount:</span>
                  <span className="font-semibold">₹ {totals.cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">SGST Amount:</span>
                  <span className="font-semibold">₹ {totals.sgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-600 border-t pt-2">
                  <span>Total Invoice Amount:</span>
                  <span>₹ {totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-center gap-4 pb-6">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
              💾 Save Sales Invoice
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()} className="px-8 py-3 text-lg">
              🖨️ Print Preview
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Invoice List View Component
interface InvoiceListViewProps {
  invoices: Invoice[];
  type: 'sales' | 'purchase';
  onCreateNew: () => void;
}

const InvoiceListView: React.FC<InvoiceListViewProps> = ({ invoices, type, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerSupplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'sales' ? 'All Sales Invoices' : 'All Purchase Invoices'}
          </h2>
          <p className="text-gray-600">Manage and track your {type} invoices</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create New {type === 'sales' ? 'Sales' : 'Purchase'} Invoice</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Invoice No.</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    {type === 'sales' ? 'Customer' : 'Supplier'}
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Due Date</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {invoice.invoiceNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.customerSupplier}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₹{invoice.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invoices.filter(inv => inv.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invoices.filter(inv => inv.status === 'overdue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Invoice Management Component
const InvoiceManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedType, setSelectedType] = useState<'sales' | 'purchase' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for view/delete dialogs
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewDialogLoading, setViewDialogLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; type: 'sales' | 'purchase'; invoiceNumber: string } | null>(null);
  
  // State for status change dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [invoiceToUpdateStatus, setInvoiceToUpdateStatus] = useState<{ id: string; type: 'sales' | 'purchase'; invoiceNumber: string; currentStatus: string } | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  // State for payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [invoiceToPayment, setInvoiceToPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  // State for filters
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');

  // State for E-way Bill details dialog
  const [ewayBillDialogOpen, setEwayBillDialogOpen] = useState(false);
  const [ewayBillFilteredInvoices, setEwayBillFilteredInvoices] = useState<any[]>([]);
  const [ewayBillDialogTitle, setEwayBillDialogTitle] = useState<string>('');

  // Debug: Monitor viewDialogOpen state
  useEffect(() => {
    console.log('📊 viewDialogOpen state changed:', viewDialogOpen);
  }, [viewDialogOpen]);

  useEffect(() => {
    console.log('📊 selectedInvoice state changed:', selectedInvoice?.invoiceNumber || 'null');
  }, [selectedInvoice]);

  // Fetch real sales invoices
  const { data: salesInvoices = [], isLoading: salesLoading } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/sales-invoices'],
  });

  // Fetch real purchase invoices
  const { data: purchaseInvoices = [], isLoading: purchaseLoading } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/purchase-invoices'],
  });

  // Delete mutations
  const deleteSalesInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sales-operations/sales-invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete invoice');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/sales-invoices'] });
      toast({ title: 'Invoice Deleted', description: 'Sales invoice deleted successfully' });
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete invoice', variant: 'destructive' });
    }
  });

  const deletePurchaseInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sales-operations/purchase-invoices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete invoice');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/purchase-invoices'] });
      toast({ title: 'Invoice Deleted', description: 'Purchase invoice deleted successfully' });
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete invoice', variant: 'destructive' });
    }
  });

  // Status update mutations
  const updateSalesStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/sales-operations/sales-invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/sales-invoices'] });
      toast({ title: 'Status Updated', description: 'Invoice status updated successfully' });
      setStatusDialogOpen(false);
      setInvoiceToUpdateStatus(null);
      setNewStatus('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  });

  const updatePurchaseStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/sales-operations/purchase-invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/purchase-invoices'] });
      toast({ title: 'Status Updated', description: 'Invoice status updated successfully' });
      setStatusDialogOpen(false);
      setInvoiceToUpdateStatus(null);
      setNewStatus('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  });

  // Payment mutation for recording payments
  const recordPaymentMutation = useMutation({
    mutationFn: async ({ id, paidAmount, type }: { id: string; paidAmount: number; type: 'sales' | 'purchase' }) => {
      const endpoint = type === 'purchase' 
        ? `/api/sales-operations/purchase-invoices/${id}` 
        : `/api/sales-operations/sales-invoices/${id}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidAmount: paidAmount.toFixed(2) })
      });
      if (!res.ok) throw new Error('Failed to record payment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/sales-invoices'] });
      toast({ title: 'Payment Recorded', description: 'Payment has been recorded successfully' });
      setPaymentDialogOpen(false);
      setInvoiceToPayment(null);
      setPaymentAmount('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to record payment', variant: 'destructive' });
    }
  });

  // Status change mutation
  const statusChangeMutation = useMutation({
    mutationFn: async ({ id, paymentStatus, type }: { id: string; paymentStatus: string; type: 'sales' | 'purchase' }) => {
      const endpoint = type === 'purchase' 
        ? `/api/sales-operations/purchase-invoices/${id}/status`
        : `/api/sales-operations/sales-invoices/${id}/status`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/sales-invoices'] });
      toast({ title: 'Status Updated', description: 'Payment status has been updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  });

  // Handle status change
  const handleStatusChange = (invoiceId: string, newStatus: string, type: 'sales' | 'purchase') => {
    statusChangeMutation.mutate({ id: invoiceId, paymentStatus: newStatus, type });
  };

  // Handle View Invoice
  const handleViewInvoice = async (invoice: any, invoiceType?: 'sales' | 'purchase') => {
    // Determine type from parameter or by checking fields
    const type = invoiceType || (invoice.customerId ? 'sales' : 'purchase');
    console.log('🔍 Opening invoice view:', { id: invoice.id, type, invoice });
    
    // First set the invoice data
    setSelectedInvoice(invoice);
    console.log('✅ selectedInvoice set:', invoice.invoiceNumber);
    
    // Then set loading state
    setViewDialogLoading(true);
    console.log('✅ viewDialogLoading set to true');
    
    // Finally open the dialog
    setViewDialogOpen(true);
    console.log('✅ viewDialogOpen set to true');
    
    // Log state immediately after
    setTimeout(() => {
      console.log('📊 State check after 100ms:', { viewDialogOpen, selectedInvoice: selectedInvoice?.invoiceNumber });
    }, 100);
    
    // Fetch full invoice details including items
    try {
      const endpoint = type === 'sales'
        ? `/api/sales-operations/sales-invoices/${invoice.id}`
        : `/api/sales-operations/purchase-invoices/${invoice.id}`;
      
      console.log('📡 Fetching from:', endpoint);
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Full invoice loaded - RAW DATA:', data);
        
        // Handle nested structure: { invoice: {...}, items: [...] } or flat structure
        const fullInvoice = data.invoice ? { ...data.invoice, items: data.items } : data;
        
        console.log('✅ Processed invoice:', fullInvoice);
        console.log('🔍 Customer/Supplier data:', {
          customerName: fullInvoice.customerName,
          supplierName: fullInvoice.supplierName,
          customerAddress: fullInvoice.customerAddress,
          supplierAddress: fullInvoice.supplierAddress,
          customerGstin: fullInvoice.customerGstin,
          supplierGstin: fullInvoice.supplierGstin,
          customerId: fullInvoice.customerId,
          supplierId: fullInvoice.supplierId
        });
        console.log('🔍 Amount data:', {
          subtotalAmount: fullInvoice.subtotalAmount,
          cgstAmount: fullInvoice.cgstAmount,
          sgstAmount: fullInvoice.sgstAmount,
          igstAmount: fullInvoice.igstAmount,
          totalInvoiceAmount: fullInvoice.totalInvoiceAmount
        });
        console.log('🔍 Date fields:', {
          invoiceNumber: fullInvoice.invoiceNumber,
          invoiceDate: fullInvoice.invoiceDate,
          dueDate: fullInvoice.dueDate,
          paymentStatus: fullInvoice.paymentStatus
        });
        setSelectedInvoice(fullInvoice);
      } else {
        console.log('⚠️ Could not fetch full details, using list data. Status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching invoice details:', error);
    } finally {
      setViewDialogLoading(false);
      console.log('✅ viewDialogLoading set to false');
    }
  };

  // Handle E-way Bill Details Click
  const handleEwayBillClick = (filterType: 'today' | 'tomorrow' | 'thisWeek' | 'thisMonth' | 'thisYear', invoices: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(today);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const yearEnd = new Date(today);
    yearEnd.setFullYear(yearEnd.getFullYear() + 1);

    let filtered: any[] = [];
    let title = '';

    switch (filterType) {
      case 'today':
        filtered = invoices.filter(inv => {
          if (!inv.ewayBillValidUpto) return false;
          const expiryDate = new Date(inv.ewayBillValidUpto);
          expiryDate.setHours(0, 0, 0, 0);
          return expiryDate.getTime() === today.getTime();
        });
        title = 'E-way Bills Expiring Today';
        break;
      case 'tomorrow':
        filtered = invoices.filter(inv => {
          if (!inv.ewayBillValidUpto) return false;
          const expiryDate = new Date(inv.ewayBillValidUpto);
          expiryDate.setHours(0, 0, 0, 0);
          return expiryDate.getTime() === tomorrow.getTime();
        });
        title = 'E-way Bills Expiring Tomorrow';
        break;
      case 'thisWeek':
        filtered = invoices.filter(inv => {
          if (!inv.ewayBillValidUpto) return false;
          const expiryDate = new Date(inv.ewayBillValidUpto);
          return expiryDate >= today && expiryDate <= weekEnd;
        });
        title = 'E-way Bills Expiring This Week';
        break;
      case 'thisMonth':
        filtered = invoices.filter(inv => {
          if (!inv.ewayBillValidUpto) return false;
          const expiryDate = new Date(inv.ewayBillValidUpto);
          return expiryDate >= today && expiryDate <= monthEnd;
        });
        title = 'E-way Bills Expiring This Month';
        break;
      case 'thisYear':
        filtered = invoices.filter(inv => {
          if (!inv.ewayBillValidUpto) return false;
          const expiryDate = new Date(inv.ewayBillValidUpto);
          return expiryDate >= today && expiryDate <= yearEnd;
        });
        title = 'E-way Bills Expiring This Year';
        break;
    }

    setEwayBillFilteredInvoices(filtered);
    setEwayBillDialogTitle(title);
    setEwayBillDialogOpen(true);
  };

  // Handle Delete Invoice
  const handleDeleteClick = (invoice: any, type: 'sales' | 'purchase') => {
    setInvoiceToDelete({ id: invoice.id, type, invoiceNumber: invoice.invoiceNumber });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!invoiceToDelete) return;
    if (invoiceToDelete.type === 'sales') {
      deleteSalesInvoiceMutation.mutate(invoiceToDelete.id);
    } else {
      deletePurchaseInvoiceMutation.mutate(invoiceToDelete.id);
    }
  };

  // Handle Status Change
  const handleStatusClick = (invoice: any, type: 'sales' | 'purchase') => {
    setInvoiceToUpdateStatus({ 
      id: invoice.id, 
      type, 
      invoiceNumber: invoice.invoiceNumber,
      currentStatus: invoice.paymentStatus || invoice.status || 'PENDING'
    });
    setNewStatus(invoice.paymentStatus || invoice.status || 'PENDING');
    setStatusDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (!invoiceToUpdateStatus || !newStatus) return;
    if (invoiceToUpdateStatus.type === 'sales') {
      updateSalesStatusMutation.mutate({ id: invoiceToUpdateStatus.id, status: newStatus });
    } else {
      updatePurchaseStatusMutation.mutate({ id: invoiceToUpdateStatus.id, status: newStatus });
    }
  };

  // Handle Record Payment
  const handleRecordPayment = (invoice: any, type: 'sales' | 'purchase') => {
    setInvoiceToPayment({ ...invoice, type });
    const currentPaid = parseFloat(invoice.paidAmount || 0);
    setPaymentAmount(currentPaid.toFixed(2));
    setPaymentDialogOpen(true);
  };

  const confirmPayment = () => {
    if (!invoiceToPayment || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount < 0) {
      toast({ title: 'Error', description: 'Please enter a valid payment amount', variant: 'destructive' });
      return;
    }
    recordPaymentMutation.mutate({ 
      id: invoiceToPayment.id, 
      paidAmount: amount, 
      type: invoiceToPayment.type 
    });
  };

  // Handle Print/PDF Invoice with Professional Tax Invoice Format
  const handlePrintInvoice = (invoice: any, type: 'sales' | 'purchase') => {
    // Import and use the printTaxInvoice utility
    import('@/utils/printInvoice').then(({ printTaxInvoice }) => {
      printTaxInvoice(invoice, type, (msg) => {
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      });
    }).catch((err) => {
      console.error('Failed to load print utility:', err);
      toast({ title: 'Error', description: 'Failed to load print functionality', variant: 'destructive' });
    });
  };

  const isLoading = salesLoading || purchaseLoading;

  // Calculate stats from real data
  const salesStats = {
    total: salesInvoices.length,
    amount: salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalInvoiceAmount || 0), 0),
    pending: salesInvoices.filter(inv => inv.status && inv.status.toLowerCase() === 'pending').length,
    overdue: salesInvoices.filter(inv => {
      if (!inv.dueDate) return false;
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return dueDate < today && inv.status?.toLowerCase() !== 'paid';
    }).length,
  };

  const purchaseStats = {
    total: purchaseInvoices.length,
    amount: purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalInvoiceAmount || 0), 0),
    pending: purchaseInvoices.filter(inv => inv.status && inv.status.toLowerCase() === 'pending').length,
    overdue: purchaseInvoices.filter(inv => {
      if (!inv.dueDate) return false;
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return dueDate < today && inv.status?.toLowerCase() !== 'paid';
    }).length,
  };

  // Handle invoice type selection
  const handleTypeSelection = (type: 'sales' | 'purchase') => {
    setSelectedType(type);
    if (type === 'sales') {
      setViewMode('sales-form');
    } else {
      setViewMode('purchase-form');
    }
  };

  // Reset to main view
  const handleBackToMain = () => {
    setViewMode('main');
    setSelectedType(null);
  };

  // Render all dialogs at component level (before conditional returns)
  const renderDialogs = () => (
    <>
      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => {
        setViewDialogOpen(open);
        if (!open) {
          setTimeout(() => setSelectedInvoice(null), 200);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {viewDialogLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3">Loading invoice details...</span>
            </div>
          ) : selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Invoice Information</h3>
                  <p><strong>Invoice No:</strong> {selectedInvoice.invoiceNumber}</p>
                  <p><strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                  <p><strong>Status:</strong> <Badge className={
                    (selectedInvoice.paymentStatus || selectedInvoice.status) === 'PAID' ? 'bg-green-100 text-green-800' :
                    (selectedInvoice.paymentStatus || selectedInvoice.status) === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>{selectedInvoice.paymentStatus || selectedInvoice.status || 'PENDING'}</Badge></p>
                  <p><strong>Due Date:</strong> {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">{selectedInvoice.customerName ? 'Customer' : 'Supplier'} Details</h3>
                  <p><strong>Name:</strong> {selectedInvoice.customerName || selectedInvoice.supplierName || 'N/A'}</p>
                  <p><strong>GSTIN:</strong> {selectedInvoice.customerGstin || selectedInvoice.supplierGstin || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedInvoice.customerAddress || selectedInvoice.supplierAddress || 'N/A'}</p>
                  <p><strong>State:</strong> {selectedInvoice.customerState || selectedInvoice.supplierState || 'N/A'}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Amount Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Taxable Amount:</p>
                    <p className="text-right">₹{parseFloat(selectedInvoice.subtotalAmount || selectedInvoice.totalTaxableAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p>CGST:</p>
                    <p className="text-right">₹{parseFloat(selectedInvoice.cgstAmount || selectedInvoice.totalCgst || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p>SGST:</p>
                    <p className="text-right">₹{parseFloat(selectedInvoice.sgstAmount || selectedInvoice.totalSgst || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p>IGST:</p>
                    <p className="text-right">₹{parseFloat(selectedInvoice.igstAmount || selectedInvoice.totalIgst || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p className="font-bold border-t pt-2">Total Amount:</p>
                    <p className="text-right font-bold border-t pt-2">₹{parseFloat(selectedInvoice.totalInvoiceAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                <Button onClick={() => handlePrintInvoice(selectedInvoice, selectedInvoice.customerName ? 'sales' : 'purchase')}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print / PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice <strong>{invoiceToDelete?.invoiceNumber}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInvoiceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* E-way Bill Details Dialog */}
      <Dialog open={ewayBillDialogOpen} onOpenChange={setEwayBillDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-500" />
              {ewayBillDialogTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {ewayBillFilteredInvoices.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No invoices found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Invoice No</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">E-way Bill No</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Expiry Date</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ewayBillFilteredInvoices.map((invoice) => {
                      const expiryDate = invoice.ewayBillValidUpto ? new Date(invoice.ewayBillValidUpto) : null;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                      
                      let urgencyColor = 'text-gray-600';
                      if (daysUntilExpiry !== null) {
                        if (daysUntilExpiry === 0) urgencyColor = 'text-red-600 font-bold';
                        else if (daysUntilExpiry === 1) urgencyColor = 'text-orange-600 font-bold';
                        else if (daysUntilExpiry <= 7) urgencyColor = 'text-yellow-600 font-semibold';
                        else if (daysUntilExpiry <= 30) urgencyColor = 'text-blue-600';
                      }

                      return (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-3">{invoice.customerName || 'N/A'}</td>
                          <td className="px-4 py-3">{invoice.ewayBillNumber || 'N/A'}</td>
                          <td className={`px-4 py-3 ${urgencyColor}`}>
                            {expiryDate ? expiryDate.toLocaleDateString('en-IN') : 'N/A'}
                            {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                              <span className="ml-2 text-xs">
                                ({daysUntilExpiry === 0 ? 'Today' : daysUntilExpiry === 1 ? 'Tomorrow' : `${daysUntilExpiry} days`})
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            ₹{parseFloat(invoice.totalInvoiceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEwayBillDialogOpen(false);
                                handleViewInvoice(invoice, 'sales');
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setEwayBillDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  if (viewMode === 'purchase-form') {
    return (
      <>
        {renderDialogs()}
        <PurchaseInvoiceForm onBack={handleBackToMain} />
      </>
    );
  }

  if (viewMode === 'sales-form') {
    return (
      <>
        {renderDialogs()}
        <SalesInvoiceForm onBack={handleBackToMain} />
      </>
    );
  }

  if (viewMode === 'sales-list') {
    // Calculate summary stats for sales invoices
    const totalAmount = salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalInvoiceAmount || 0), 0);
    const paidAmountTotal = salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.paidAmount || 0), 0);
    const overdueAmount = salesInvoices.filter(inv => {
      if (!inv.dueDate) return false;
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return dueDate < today && inv.paymentStatus !== 'PAID';
    }).reduce((sum, inv) => sum + parseFloat(inv.remainingBalance || inv.totalInvoiceAmount || 0), 0);

    // Calculate E-way Bill Expiry Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(today);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const yearEnd = new Date(today);
    yearEnd.setFullYear(yearEnd.getFullYear() + 1);

    const ewayBillStats = {
      today: salesInvoices.filter(inv => {
        if (!inv.ewayBillValidUpto) return false;
        const expiryDate = new Date(inv.ewayBillValidUpto);
        expiryDate.setHours(0, 0, 0, 0);
        return expiryDate.getTime() === today.getTime();
      }).length,
      tomorrow: salesInvoices.filter(inv => {
        if (!inv.ewayBillValidUpto) return false;
        const expiryDate = new Date(inv.ewayBillValidUpto);
        expiryDate.setHours(0, 0, 0, 0);
        return expiryDate.getTime() === tomorrow.getTime();
      }).length,
      thisWeek: salesInvoices.filter(inv => {
        if (!inv.ewayBillValidUpto) return false;
        const expiryDate = new Date(inv.ewayBillValidUpto);
        return expiryDate >= today && expiryDate <= weekEnd;
      }).length,
      thisMonth: salesInvoices.filter(inv => {
        if (!inv.ewayBillValidUpto) return false;
        const expiryDate = new Date(inv.ewayBillValidUpto);
        return expiryDate >= today && expiryDate <= monthEnd;
      }).length,
      thisYear: salesInvoices.filter(inv => {
        if (!inv.ewayBillValidUpto) return false;
        const expiryDate = new Date(inv.ewayBillValidUpto);
        return expiryDate >= today && expiryDate <= yearEnd;
      }).length,
    };

    // Get unique customers for filter
    const uniqueCustomers = Array.from(new Set(salesInvoices.map(inv => inv.customerName).filter(Boolean)));

    // Filtered invoices
    const filteredInvoices = salesInvoices.filter(inv => {
      const matchesCustomer = supplierFilter === 'all' || inv.customerName === supplierFilter;
      const matchesSearch = !invoiceSearch || 
        (inv.invoiceNumber?.toLowerCase().includes(invoiceSearch.toLowerCase()));
      return matchesCustomer && matchesSearch;
    });

    return (
      <>
        {renderDialogs()}
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setViewMode('main')} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">All Sales Invoices</h1>
          </div>
          <Button onClick={() => handleTypeSelection('sales')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Sales Invoice
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{paidAmountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{overdueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Package className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">E-way Bill Expiry</p>
                  <Receipt className="w-6 h-6 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <button 
                    onClick={() => ewayBillStats.today > 0 && handleEwayBillClick('today', salesInvoices)}
                    className={`flex justify-between items-center w-full hover:bg-gray-50 rounded px-2 py-1 transition-colors ${ewayBillStats.today > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                    disabled={ewayBillStats.today === 0}
                  >
                    <span className="text-xs text-gray-600">Today:</span>
                    <span className={`text-sm font-bold ${ewayBillStats.today > 0 ? 'text-red-600 hover:underline' : 'text-gray-400'}`}>
                      {ewayBillStats.today}
                    </span>
                  </button>
                  <button 
                    onClick={() => ewayBillStats.tomorrow > 0 && handleEwayBillClick('tomorrow', salesInvoices)}
                    className={`flex justify-between items-center w-full hover:bg-gray-50 rounded px-2 py-1 transition-colors ${ewayBillStats.tomorrow > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                    disabled={ewayBillStats.tomorrow === 0}
                  >
                    <span className="text-xs text-gray-600">Tomorrow:</span>
                    <span className={`text-sm font-bold ${ewayBillStats.tomorrow > 0 ? 'text-orange-600 hover:underline' : 'text-gray-400'}`}>
                      {ewayBillStats.tomorrow}
                    </span>
                  </button>
                  <button 
                    onClick={() => ewayBillStats.thisWeek > 0 && handleEwayBillClick('thisWeek', salesInvoices)}
                    className={`flex justify-between items-center w-full hover:bg-gray-50 rounded px-2 py-1 transition-colors ${ewayBillStats.thisWeek > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                    disabled={ewayBillStats.thisWeek === 0}
                  >
                    <span className="text-xs text-gray-600">This Week:</span>
                    <span className={`text-sm font-semibold ${ewayBillStats.thisWeek > 0 ? 'text-yellow-600 hover:underline' : 'text-gray-400'}`}>
                      {ewayBillStats.thisWeek}
                    </span>
                  </button>
                  <button 
                    onClick={() => ewayBillStats.thisMonth > 0 && handleEwayBillClick('thisMonth', salesInvoices)}
                    className={`flex justify-between items-center w-full hover:bg-gray-50 rounded px-2 py-1 transition-colors ${ewayBillStats.thisMonth > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                    disabled={ewayBillStats.thisMonth === 0}
                  >
                    <span className="text-xs text-gray-600">This Month:</span>
                    <span className={`text-sm font-semibold ${ewayBillStats.thisMonth > 0 ? 'text-blue-600 hover:underline' : 'text-gray-400'}`}>
                      {ewayBillStats.thisMonth}
                    </span>
                  </button>
                  <button 
                    onClick={() => ewayBillStats.thisYear > 0 && handleEwayBillClick('thisYear', salesInvoices)}
                    className={`flex justify-between items-center w-full hover:bg-gray-50 rounded px-2 py-1 transition-colors ${ewayBillStats.thisYear > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                    disabled={ewayBillStats.thisYear === 0}
                  >
                    <span className="text-xs text-gray-600">This Year:</span>
                    <span className={`text-sm font-semibold ${ewayBillStats.thisYear > 0 ? 'text-green-600 hover:underline' : 'text-gray-400'}`}>
                      {ewayBillStats.thisYear}
                    </span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by invoice number..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filter by customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {uniqueCustomers.map(customer => (
                    <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No sales invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.customerName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{parseFloat(invoice.totalInvoiceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={
                            (invoice.paymentStatus || invoice.status) === 'PAID' ? 'bg-green-100 text-green-800' :
                            (invoice.paymentStatus || invoice.status) === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            (invoice.paymentStatus || invoice.status) === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {invoice.paymentStatus || invoice.status || 'PENDING'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2 items-center">
                            <Select
                              value={invoice.paymentStatus || invoice.status || 'PENDING'}
                              onValueChange={(value) => handleStatusChange(invoice.id, value, 'sales')}
                            >
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PARTIAL">Partial</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewInvoice(invoice, 'sales')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintInvoice(invoice, 'sales')}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteClick(invoice, 'sales')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  if (viewMode === 'purchase-list') {
    // Calculate summary stats for purchase invoices
    const totalAmount = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalInvoiceAmount || 0), 0);
    const paidAmountTotal = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.paidAmount || 0), 0);
    const overdueAmount = purchaseInvoices.filter(inv => {
      if (!inv.dueDate) return false;
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return dueDate < today && inv.paymentStatus !== 'PAID';
    }).reduce((sum, inv) => sum + parseFloat(inv.remainingBalance || inv.totalInvoiceAmount || 0), 0);

    // Get unique suppliers for filter
    const uniqueSuppliers = Array.from(new Set(purchaseInvoices.map(inv => inv.supplierName).filter(Boolean)));

    // Filtered invoices
    const filteredInvoices = purchaseInvoices.filter(inv => {
      const matchesSupplier = supplierFilter === 'all' || inv.supplierName === supplierFilter;
      const matchesSearch = !invoiceSearch || 
        (inv.invoiceNumber?.toLowerCase().includes(invoiceSearch.toLowerCase()));
      return matchesSupplier && matchesSearch;
    });

    return (
      <>
        {renderDialogs()}
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setViewMode('main')} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">All Purchase Invoices</h1>
          </div>
          <Button onClick={() => handleTypeSelection('purchase')} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Purchase Invoice
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{purchaseInvoices.length} invoices</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{paidAmountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{purchaseInvoices.filter(inv => inv.paymentStatus === 'PAID').length} paid invoices</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{overdueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{purchaseInvoices.filter(inv => {
                    if (!inv.dueDate) return false;
                    return new Date(inv.dueDate) < new Date() && inv.paymentStatus !== 'PAID';
                  }).length} overdue invoices</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Party (Supplier):</label>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {uniqueSuppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Invoice No:</label>
                <input 
                  type="text" 
                  placeholder="Search invoice number..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md w-[200px] focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {(supplierFilter !== 'all' || invoiceSearch) && (
                <Button variant="outline" size="sm" onClick={() => { setSupplierFilter('all'); setInvoiceSearch(''); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Invoices List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-50 border-b">
                    <th className="p-3 text-left font-semibold text-gray-700">Invoice No</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Supplier</th>
                    <th className="p-3 text-left font-semibold text-gray-700">GSTIN</th>
                    <th className="p-3 text-right font-semibold text-gray-700">Amount</th>
                    <th className="p-3 text-right font-semibold text-gray-700">Paid</th>
                    <th className="p-3 text-right font-semibold text-gray-700">Balance</th>
                    <th className="p-3 text-center font-semibold text-gray-700">Status</th>
                    <th className="p-3 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseLoading ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-gray-500">
                        Loading invoices...
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-gray-500">
                        No purchase invoices found. Create your first invoice!
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const totalAmt = parseFloat(invoice.totalInvoiceAmount || 0);
                      const paidAmt = parseFloat(invoice.paidAmount || 0);
                      const remainingAmt = parseFloat(invoice.remainingBalance || (totalAmt - paidAmt));
                      const isFullyPaid = remainingAmt <= 0;

                      return (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <span className="font-medium text-green-600">{invoice.invoiceNumber}</span>
                          </td>
                          <td className="p-3 text-gray-700">
                            {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN') : 'N/A'}
                          </td>
                          <td className="p-3 text-gray-700">{invoice.supplierName || 'N/A'}</td>
                          <td className="p-3 text-gray-700 font-mono text-sm">{invoice.supplierGstin || 'N/A'}</td>
                          <td className="p-3 text-right font-semibold text-gray-900">
                            ₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-semibold text-green-600">
                            ₹{paidAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {isFullyPaid ? (
                              <span className="text-green-600">₹0.00</span>
                            ) : (
                              <span className="text-red-600">₹{remainingAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <Badge 
                              variant={
                                isFullyPaid ? 'default' :
                                invoice.paymentStatus === 'PAID' ? 'default' : 
                                invoice.paymentStatus === 'PENDING' ? 'secondary' : 
                                'destructive'
                              }
                              className={
                                isFullyPaid ? 'bg-green-100 text-green-800' :
                                invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                invoice.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                invoice.paymentStatus === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                                invoice.paymentStatus === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                invoice.paymentStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {isFullyPaid ? 'PAID' : (invoice.paymentStatus || 'PENDING')}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center gap-2 items-center">
                              <Select
                                value={isFullyPaid ? 'PAID' : (invoice.paymentStatus || 'PENDING')}
                                onValueChange={(value) => handleStatusChange(invoice.id, value, 'purchase')}
                              >
                                <SelectTrigger className="w-28 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">Pending</SelectItem>
                                  <SelectItem value="PARTIAL">Partial</SelectItem>
                                  <SelectItem value="PAID">Paid</SelectItem>
                                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm" title="View Invoice" onClick={() => handleViewInvoice(invoice, 'purchase')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!isFullyPaid && (
                                <Button variant="outline" size="sm" title="Record Payment" className="text-green-600 hover:bg-green-50" onClick={() => handleRecordPayment(invoice, 'purchase')}>
                                  <IndianRupee className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm" title="Print/PDF Invoice" onClick={() => handlePrintInvoice(invoice, 'purchase')}>
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" title="Delete Invoice" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(invoice, 'purchase')}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <>
        {renderDialogs()}
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Receipt className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
              <p className="text-gray-600">Loading invoice data...</p>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {renderDialogs()}
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Receipt className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <p className="text-gray-600">Manage your purchase invoices</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{purchaseStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{purchaseStats.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {purchaseStats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {purchaseStats.overdue}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Invoice Section - Separate Sales & Purchase Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Invoice Card */}
        <Card className="shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <ShoppingCart className="w-8 h-8" />
              Sales Invoice
            </CardTitle>
            <p className="text-blue-100 text-sm mt-1">Create and manage customer sales invoices</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Sales Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{salesStats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{salesStats.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{salesStats.pending}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{salesStats.overdue}</p>
              </div>
            </div>

            {/* Sales Actions */}
            <div className="space-y-3 pt-4 border-t">
              <Button 
                onClick={() => handleTypeSelection('sales')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Sales Invoice
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-6 text-lg"
                onClick={() => setViewMode('sales-list')}
                size="lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                View All Sales Invoices
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Invoice Card */}
        <Card className="shadow-lg border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Package className="w-8 h-8" />
              Purchase Invoice
            </CardTitle>
            <p className="text-green-100 text-sm mt-1">Create and manage supplier purchase invoices</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Purchase Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-green-600">{purchaseStats.total}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">₹{purchaseStats.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{purchaseStats.pending}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{purchaseStats.overdue}</p>
              </div>
            </div>

            {/* Purchase Actions */}
            <div className="space-y-3 pt-4 border-t">
              <Button 
                onClick={() => handleTypeSelection('purchase')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Purchase Invoice
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-green-300 text-green-700 hover:bg-green-50 py-6 text-lg"
                onClick={() => setViewMode('purchase-list')}
                size="lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                View All Purchase Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default InvoiceManagement;
