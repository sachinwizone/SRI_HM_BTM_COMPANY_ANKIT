import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ShoppingCart, 
  Package, 
  Receipt, 
  TrendingUp,
  Plus,
  Eye,
  ArrowLeft
} from 'lucide-react';

type ViewMode = 'main' | 'sales-form' | 'purchase-form';

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
  const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    ewayBill: '',
    irn: '',
    ackNo: '',
    ackDate: '',
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
      description: 'BITUMEN VG-30',
      hsn: '27132000',
      quantity: 1,
      unit: 'Drum',
      rate: 45000,
      amount: 45000,
      taxRate: 18
    }],
    insurance: 0,
    freight: 0,
    otherCharges: 0,
    paymentTerms: '30 DAYS CREDIT',
    dueDate: '',
    remarks: ''
  });

  const calculateTotals = () => {
    let totalTaxable = 0;
    formData.items.forEach(item => {
      totalTaxable += item.amount;
    });
    
    totalTaxable += formData.insurance + formData.freight + formData.otherCharges;
    
    const cgstAmount = (totalTaxable * 9) / 100; // 9% CGST
    const sgstAmount = (totalTaxable * 9) / 100; // 9% SGST
    const totalBeforeRound = totalTaxable + cgstAmount + sgstAmount;
    const roundedTotal = Math.round(totalBeforeRound);
    const roundOff = roundedTotal - totalBeforeRound;

    return {
      taxableAmount: totalTaxable,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      roundOff,
      totalAmount: roundedTotal
    };
  };

  const totals = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceData = { ...formData, summary: totals };
    console.log('Purchase Invoice Data:', invoiceData);
    alert('✅ Purchase Invoice saved successfully!\n\nCheck the browser console (F12) to see the complete data.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    placeholder="e.g., SRIHM/261/25-26"
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
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                    placeholder="e.g., M/S.SRI HM BITUMEN CO"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN *</label>
                  <input
                    type="text"
                    value={formData.supplierGSTIN}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierGSTIN: e.target.value }))}
                    placeholder="e.g., 18CGMPP6536N2ZG"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  value={formData.supplierAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierAddress: e.target.value }))}
                  placeholder="Complete address"
                  required
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                            type="text"
                            value={item.hsn}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].hsn = e.target.value;
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            className="w-full p-1 border border-gray-200 rounded"
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
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            <Button type="submit" className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg">
              💾 Save Purchase Invoice
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
                      </tr>
                    ))}
                  </tbody>
                </table>
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

// Main Invoice Management Component
const InvoiceManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [invoices] = useState<Invoice[]>(mockInvoices);

  const salesStats = {
    total: invoices.filter(inv => inv.type === 'sales').length,
    amount: invoices.filter(inv => inv.type === 'sales').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(inv => inv.type === 'sales' && inv.status === 'pending').length,
    overdue: invoices.filter(inv => inv.type === 'sales' && inv.status === 'overdue').length,
  };

  const purchaseStats = {
    total: invoices.filter(inv => inv.type === 'purchase').length,
    amount: invoices.filter(inv => inv.type === 'purchase').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(inv => inv.type === 'purchase' && inv.status === 'pending').length,
    overdue: invoices.filter(inv => inv.type === 'purchase' && inv.status === 'overdue').length,
  };

  if (viewMode === 'sales-form') {
    return <SalesInvoiceForm onBack={() => setViewMode('main')} />;
  }

  if (viewMode === 'purchase-form') {
    return <PurchaseInvoiceForm onBack={() => setViewMode('main')} />;
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
            <p className="text-gray-600">Manage your sales and purchase invoices</p>
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
                    ₹{invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
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
                    {invoices.filter(inv => inv.status === 'pending').length}
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
                    {invoices.filter(inv => inv.status === 'overdue').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Invoice Type Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Invoices */}
        <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <ShoppingCart className="w-6 h-6" />
              <span>Sales Invoices</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{salesStats.total}</p>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{salesStats.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {salesStats.pending} Pending
                </Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {salesStats.overdue} Overdue
                </Badge>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  onClick={() => setViewMode('sales-form')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Sales Invoice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full py-3"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Sales Invoices
                </Button>
              </div>

              {/* Recent Sales Invoices */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Recent Sales</h4>
                <div className="space-y-2">
                  {invoices
                    .filter(inv => inv.type === 'sales')
                    .slice(0, 2)
                    .map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{invoice.invoiceNo}</p>
                          <p className="text-xs text-gray-500">{invoice.customerSupplier}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">₹{invoice.amount.toLocaleString()}</p>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Invoices */}
        <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <Package className="w-6 h-6" />
              <span>Purchase Invoices</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{purchaseStats.total}</p>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{purchaseStats.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {purchaseStats.pending} Pending
                </Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {purchaseStats.overdue} Overdue
                </Badge>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  onClick={() => setViewMode('purchase-form')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Purchase Invoice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full py-3"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Purchase Invoices
                </Button>
              </div>

              {/* Recent Purchase Invoices */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Recent Purchases</h4>
                <div className="space-y-2">
                  {invoices
                    .filter(inv => inv.type === 'purchase')
                    .slice(0, 2)
                    .map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{invoice.invoiceNo}</p>
                          <p className="text-xs text-gray-500">{invoice.customerSupplier}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">₹{invoice.amount.toLocaleString()}</p>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceManagement;
