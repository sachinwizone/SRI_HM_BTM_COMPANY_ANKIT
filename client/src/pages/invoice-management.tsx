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
    irn: '',
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
      taxRate: 0
    }],
    insurance: 0,
    freight: 0,
    otherCharges: 0,
    paymentTerms: '30 DAYS CREDIT',
    dueDate: '',
    remarks: ''
  });

  // Auto-generate invoice number on form load
  useEffect(() => {
    const fetchNextInvoiceNumber = async () => {
      try {
        const res = await fetch('/api/sales-operations/next-invoice-number?type=PURCHASE', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, invoiceNo: data.invoiceNumber }));
        }
      } catch (error) {
        console.error('Failed to fetch next invoice number:', error);
      }
    };
    fetchNextInvoiceNumber();
  }, []);

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
      
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        description: product.name || product.description || '',
        hsn: product.hsnCode || '',
        unit: unit,
        rate: parseFloat(product.rate || '0'),
        taxRate: parseFloat(product.taxRate || '18'),
        amount: newItems[itemIndex].quantity * parseFloat(product.rate || '0')
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
          taxRate: 18
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
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    
    // Calculate tax for each item based on its tax rate
    formData.items.forEach(item => {
      totalTaxable += item.amount;
      const itemTaxRate = item.taxRate || 0;
      const cgstRate = itemTaxRate / 2; // Half of tax rate for CGST
      const sgstRate = itemTaxRate / 2; // Half of tax rate for SGST
      totalCgst += (item.amount * cgstRate) / 100;
      totalSgst += (item.amount * sgstRate) / 100;
    });
    
    totalTaxable += formData.insurance + formData.freight + formData.otherCharges;
    
    const totalBeforeRound = totalTaxable + totalCgst + totalSgst;
    const roundedTotal = Math.round(totalBeforeRound);
    const roundOff = roundedTotal - totalBeforeRound;

    return {
      taxableAmount: totalTaxable,
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
    irn: formData.irn,
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number * <span className="text-xs text-green-600">(Auto-generated)</span></label>
                  <input
                    type="text"
                    value={formData.invoiceNo}
                    placeholder="Auto-generated (e.g., SRIHM/01/25-26)"
                    required
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IRN (e-Invoice Reference)</label>
                  <input
                    type="text"
                    value={formData.irn}
                    onChange={(e) => setFormData(prev => ({ ...prev, irn: e.target.value }))}
                    placeholder="e.g., 5eb7b1812e2d81c97d2b1faaf3ef795e22160..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
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
                              newItems[index].quantity = parseFloat(e.target.value) || 0;
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
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
                              newItems[index].rate = parseFloat(e.target.value) || 0;
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
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
                              newItems[index].taxRate = parseFloat(e.target.value) || 0;
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
  const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    customerName: '',
    customerGSTIN: '',
    customerAddress: '',
    items: [{
      id: 1,
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      taxRate: 18
    }]
  });

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
          quantity: 1,
          rate: 0,
          amount: 0,
          taxRate: 18
        }
      ]
    }));
  };

  // Remove item row
  const removeSalesItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const calculateTotals = () => {
    let totalTaxable = 0;
    formData.items.forEach(item => {
      totalTaxable += item.amount;
    });
    
    const cgstAmount = (totalTaxable * 9) / 100;
    const sgstAmount = (totalTaxable * 9) / 100;
    const totalBeforeRound = totalTaxable + cgstAmount + sgstAmount;
    const roundedTotal = Math.round(totalBeforeRound);

    return {
      taxableAmount: totalTaxable,
      cgstAmount,
      sgstAmount,
      totalAmount: roundedTotal
    };
  };

  const totals = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceData = { ...formData, summary: totals };
    console.log('Sales Invoice Data:', invoiceData);
    alert('✅ Sales Invoice saved successfully!\n\nCheck the browser console (F12) to see the complete data.');
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
          {/* Invoice Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    placeholder="e.g., SI-001/2025"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="e.g., RAMKRISHNA TRADERS"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={formData.customerGSTIN}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerGSTIN: e.target.value }))}
                    placeholder="e.g., 18BCWPP7863H1ZL"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.customerAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="Complete customer address"
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
                      <th className="border border-gray-300 p-2 text-left">Description</th>
                      <th className="border border-gray-300 p-2 text-left">Qty</th>
                      <th className="border border-gray-300 p-2 text-left">Rate</th>
                      <th className="border border-gray-300 p-2 text-left">Amount</th>
                      <th className="border border-gray-300 p-2 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            placeholder="Item description"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].quantity = parseFloat(e.target.value) || 0;
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
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
                              newItems[index].rate = parseFloat(e.target.value) || 0;
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 font-medium">
                          ₹{item.amount.toFixed(2)}
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

  // Handle View Invoice
  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
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

  if (viewMode === 'purchase-form') {
    return <PurchaseInvoiceForm onBack={handleBackToMain} />;
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
                            <div className="flex justify-center gap-2">
                              <Button variant="outline" size="sm" title="View Invoice" onClick={() => handleViewInvoice(invoice)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!isFullyPaid && (
                                <Button variant="outline" size="sm" title="Record Payment" className="text-green-600 hover:bg-green-50" onClick={() => handleRecordPayment(invoice, 'purchase')}>
                                  <IndianRupee className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm" title="Change Status" className="text-blue-600 hover:bg-blue-50" onClick={() => handleStatusClick(invoice, 'purchase')}>
                                <RefreshCw className="w-4 h-4" />
                              </Button>
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

        {/* View Invoice Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Invoice Information</h3>
                    <p><strong>Invoice No:</strong> {selectedInvoice.invoiceNumber}</p>
                    <p><strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                    <p><strong>Status:</strong> <Badge className={
                      selectedInvoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      selectedInvoice.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      selectedInvoice.paymentStatus === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                      selectedInvoice.paymentStatus === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                      selectedInvoice.paymentStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>{selectedInvoice.paymentStatus || 'PENDING'}</Badge></p>
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
                      <p className="text-right">₹{parseFloat(selectedInvoice.totalTaxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <p>CGST:</p>
                      <p className="text-right">₹{parseFloat(selectedInvoice.totalCgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <p>SGST:</p>
                      <p className="text-right">₹{parseFloat(selectedInvoice.totalSgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <p>IGST:</p>
                      <p className="text-right">₹{parseFloat(selectedInvoice.totalIgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <p className="font-bold border-t pt-2">Total Amount:</p>
                      <p className="text-right font-bold border-t pt-2">₹{parseFloat(selectedInvoice.totalInvoiceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                  <Button onClick={() => handlePrintInvoice(selectedInvoice, 'purchase')}>
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

        {/* Status Change Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Invoice Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                Update status for invoice: <strong>{invoiceToUpdateStatus?.invoiceNumber}</strong>
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select New Status:</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="PAID">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Paid
                      </div>
                    </SelectItem>
                    <SelectItem value="PARTIAL">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Partial Payment
                      </div>
                    </SelectItem>
                    <SelectItem value="OVERDUE">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Overdue
                      </div>
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        Cancelled
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setStatusDialogOpen(false); setInvoiceToUpdateStatus(null); }}>
                  Cancel
                </Button>
                <Button onClick={confirmStatusChange} className="bg-blue-600 hover:bg-blue-700">
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-green-600" />
                Record Payment
              </DialogTitle>
            </DialogHeader>
            {invoiceToPayment && (
              <div className="space-y-4 py-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">
                    Invoice: <strong className="text-green-600">{invoiceToPayment.invoiceNumber}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Supplier: <strong>{invoiceToPayment.supplierName}</strong>
                  </p>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm">Total Amount:</span>
                    <span className="font-semibold">₹{parseFloat(invoiceToPayment.totalInvoiceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Already Paid:</span>
                    <span className="font-semibold text-green-600">₹{parseFloat(invoiceToPayment.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Remaining Balance:</span>
                    <span className="font-semibold text-red-600">₹{parseFloat(invoiceToPayment.remainingBalance || (parseFloat(invoiceToPayment.totalInvoiceAmount || 0) - parseFloat(invoiceToPayment.paidAmount || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Total Paid Amount (cumulative)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={parseFloat(invoiceToPayment.totalInvoiceAmount || 0)}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter total paid amount"
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter the total cumulative amount paid (not just this payment)
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setPaymentDialogOpen(false); setInvoiceToPayment(null); setPaymentAmount(''); }}>
                    Cancel
                  </Button>
                  <Button onClick={confirmPayment} className="bg-green-600 hover:bg-green-700">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Save Payment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
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
    );
  }

  return (
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

      {/* Create Invoice Section - Purchase Invoice Only */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Invoice</h2>
          <p className="text-gray-600">Create purchase invoices for supplier transactions</p>
        </div>

        <div className="flex justify-center max-w-xl mx-auto">
          {/* Purchase Invoice Button */}
          <button
            onClick={() => handleTypeSelection('purchase')}
            className="group relative p-8 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 w-full"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-green-500 group-hover:bg-green-600 p-6 rounded-full transition-colors duration-300">
                <Package className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Invoice</h3>
                <p className="text-sm text-gray-600">Create invoice for supplier purchases</p>
              </div>
              <div className="flex gap-4 text-sm">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {purchaseStats.total} Invoices
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  ₹{purchaseStats.amount.toLocaleString()}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('purchase-list');
                }}
              >
                View All Purchases
              </Button>
            </div>
          </button>
        </div>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Invoice Information</h3>
                  <p><strong>Invoice No:</strong> {selectedInvoice.invoiceNumber}</p>
                  <p><strong>Date:</strong> {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                  <p><strong>Status:</strong> <Badge className={
                    selectedInvoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    selectedInvoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>{selectedInvoice.status || 'PENDING'}</Badge></p>
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
                    <p className="text-right">₹{parseFloat(selectedInvoice.totalTaxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p>CGST:</p>
                    <p className="text-right">₹{parseFloat(selectedInvoice.totalCgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p>SGST:</p>
                    <p className="text-right">₹{parseFloat(selectedInvoice.totalSgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p>IGST:</p>
                    <p className="text-right">₹{parseFloat(selectedInvoice.totalIgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p className="font-bold border-t pt-2">Total Amount:</p>
                    <p className="text-right font-bold border-t pt-2">₹{parseFloat(selectedInvoice.totalInvoiceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
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
    </div>
  );
};

export default InvoiceManagement;
