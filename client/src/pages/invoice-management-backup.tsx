import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusIcon, FileTextIcon, PackageIcon } from 'lucide-react';

export default function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState('sales-invoice');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createInvoiceType, setCreateInvoiceType] = useState('sales');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-1">
            Sales invoices, purchase invoices, e-invoice, and GST management
          </p>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Invoices</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Purchase Invoices</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">₹2,45,000</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-lg">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">GST Returns</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-lg">📄</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 pt-6">
            <button
              onClick={() => setActiveTab('sales-invoice')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sales-invoice'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sales Invoice
            </button>
            <button
              onClick={() => setActiveTab('purchase-invoice')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'purchase-invoice'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Purchase Invoice
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'sales-invoice' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Sales Invoice Management</h2>
                  <p className="text-gray-600 text-sm mt-1">Create sales invoices, generate e-invoices, and manage customer billing</p>
                </div>
                <Button 
                  onClick={() => { 
                    setCreateInvoiceType('sales'); 
                    setShowCreateDialog(true); 
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Sales Invoice
                </Button>
              </div>
              
              {/* Sales Invoice Content */}
              <div className="space-y-6">
                {/* Quick Actions for Sales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800">Tax Invoice</h3>
                    <p className="text-sm text-green-600">Create GST compliant tax invoice</p>
                    <Button 
                      className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      onClick={() => {
                        setCreateInvoiceType('tax');
                        setShowCreateDialog(true);
                      }}
                    >
                      Create
                    </Button>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800">e-Invoice</h3>
                    <p className="text-sm text-blue-600">Generate IRN and QR code</p>
                    <Button 
                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      onClick={() => {
                        setCreateInvoiceType('e-invoice');
                        setShowCreateDialog(true);
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-800">e-Way Bill</h3>
                    <p className="text-sm text-purple-600">Generate transportation bill</p>
                    <Button 
                      className="mt-2 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                      onClick={() => {
                        setCreateInvoiceType('e-waybill');
                        setShowCreateDialog(true);
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Recent Sales Invoices */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Recent Sales Invoices</h3>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded border flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">INV/2024-25/001</h4>
                        <p className="text-sm text-gray-600">Customer: ABC Industries Ltd | Amount: ₹1,25,000 | Date: 15/10/2024</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">INV/2024-25/002</h4>
                        <p className="text-sm text-gray-600">Customer: XYZ Corp | Amount: ₹85,000 | Date: 18/10/2024</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Pending</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">INV/2024-25/003</h4>
                        <p className="text-sm text-gray-600">Customer: PQR Enterprises | Amount: ₹2,15,000 | Date: 22/10/2024</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">e-Invoice Generated</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales Reports Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Sales Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Today's Sales:</span>
                        <span className="font-medium">₹45,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month:</span>
                        <span className="font-medium">₹12,50,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Outstanding:</span>
                        <span className="font-medium text-orange-600">₹2,45,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">GST Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">CGST Collected:</span>
                        <span className="font-medium">₹1,12,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SGST Collected:</span>
                        <span className="font-medium">₹1,12,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IGST Collected:</span>
                        <span className="font-medium">₹45,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchase-invoice' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Purchase Invoice Management</h2>
                  <p className="text-gray-600 text-sm mt-1">Record purchase invoices, manage vendor payments, and track inventory</p>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    setCreateInvoiceType('purchase');
                    setShowCreateDialog(true);
                  }}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Purchase Invoice
                </Button>
              </div>
              
              {/* Purchase Invoice Content */}
              <div className="space-y-6">
                {/* Quick Actions for Purchase */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                    <h3 className="font-semibold text-indigo-800">Purchase Invoice</h3>
                    <p className="text-sm text-indigo-600">Record supplier invoice</p>
                    <Button 
                      className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                      onClick={() => {
                        setCreateInvoiceType('purchase');
                        setShowCreateDialog(true);
                      }}
                    >
                      Create
                    </Button>
                  </div>
                  <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                    <h3 className="font-semibold text-teal-800">GRN</h3>
                    <p className="text-sm text-teal-600">Goods Receipt Note</p>
                    <Button 
                      className="mt-2 bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
                      onClick={() => {
                        setCreateInvoiceType('grn');
                        setShowCreateDialog(true);
                      }}
                    >
                      Create
                    </Button>
                  </div>
                  <div className="bg-gradient-to-r from-rose-50 to-rose-100 p-4 rounded-lg border border-rose-200">
                    <h3 className="font-semibold text-rose-800">Purchase Return</h3>
                    <p className="text-sm text-rose-600">Return goods to supplier</p>
                    <Button 
                      className="mt-2 bg-rose-600 text-white px-3 py-1 rounded text-sm hover:bg-rose-700"
                      onClick={() => {
                        setCreateInvoiceType('return');
                        setShowCreateDialog(true);
                      }}
                    >
                      Create
                    </Button>
                  </div>
                </div>

                {/* Recent Purchase Invoices */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Recent Purchase Invoices</h3>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded border flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">PI/2024-25/001</h4>
                        <p className="text-sm text-gray-600">Supplier: Raw Materials Ltd | Amount: ₹75,000 | Date: 12/10/2024</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">PI/2024-25/002</h4>
                        <p className="text-sm text-gray-600">Supplier: Packaging Solutions | Amount: ₹32,000 | Date: 16/10/2024</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Pending</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">PI/2024-25/003</h4>
                        <p className="text-sm text-gray-600">Supplier: Transport Services | Amount: ₹18,500 | Date: 20/10/2024</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">GRN Created</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase Reports Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Purchase Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Today's Purchases:</span>
                        <span className="font-medium">₹28,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month:</span>
                        <span className="font-medium">₹8,75,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payables:</span>
                        <span className="font-medium text-red-600">₹1,85,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Input Tax Credit</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">CGST Available:</span>
                        <span className="font-medium">₹78,750</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SGST Available:</span>
                        <span className="font-medium">₹78,750</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IGST Available:</span>
                        <span className="font-medium">₹31,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <button 
            onClick={() => setActiveTab('sales-invoice')}
            className="h-20 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-lg">📊</span>
            <span className="text-sm">Sales Invoice</span>
          </button>
          <button 
            onClick={() => setActiveTab('purchase-invoice')}
            className="h-20 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-lg">📋</span>
            <span className="text-sm">Purchase Invoice</span>
          </button>
          <button 
            onClick={() => alert('e-Invoice functionality: Generate IRN (Invoice Reference Number) for GST compliance. Select an invoice to generate e-Invoice with QR code and digital signature.')}
            className="h-20 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-2"
          >
            <span className="text-lg">🧾</span>
            <span className="text-sm">e-Invoice</span>
          </button>
          <button 
            onClick={() => alert('e-Way Bill functionality: Generate e-Way Bill for goods transportation above ₹50,000. Required for interstate and intrastate movement of goods.')}
            className="h-20 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-all flex flex-col items-center justify-center gap-2"
          >
            <span className="text-lg">🚛</span>
            <span className="text-sm">e-Way Bill</span>
          </button>
          <button 
            onClick={() => alert('Payment functionality: Record payments against invoices. Supports Cash, Cheque, Bank Transfer, UPI, and other payment methods. Track outstanding balances.')}
            className="h-20 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-yellow-300 transition-all flex flex-col items-center justify-center gap-2"
          >
            <span className="text-lg">💰</span>
            <span className="text-sm">Payment</span>
          </button>
          <button 
            onClick={() => alert('Reports functionality: Generate GST Returns (GSTR-1, GSTR-3B), Sales Summary, Purchase Analysis, Payment Reports, and Tax Compliance reports.')}
            className="h-20 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-all flex flex-col items-center justify-center gap-2"
          >
            <span className="text-lg">📈</span>
            <span className="text-sm">Reports</span>
          </button>
        </div>
      </div>

      {/* Create Invoice Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">
                {createInvoiceType === 'sales' && 'Create New Sales Invoice'}
                {createInvoiceType === 'tax' && 'Create Tax Invoice'}
                {createInvoiceType === 'e-invoice' && 'Generate e-Invoice'}
                {createInvoiceType === 'e-waybill' && 'Generate e-Way Bill'}
                {createInvoiceType === 'purchase' && 'Create Purchase Invoice'}
                {createInvoiceType === 'grn' && 'Create Goods Receipt Note'}
                {createInvoiceType === 'return' && 'Create Purchase Return'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Customer/Supplier Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="party">
                    {createInvoiceType === 'sales' || createInvoiceType === 'tax' || createInvoiceType === 'e-invoice' || createInvoiceType === 'e-waybill' ? 'Customer' : 'Supplier'}
                  </Label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select {createInvoiceType === 'sales' || createInvoiceType === 'tax' || createInvoiceType === 'e-invoice' || createInvoiceType === 'e-waybill' ? 'Customer' : 'Supplier'}</option>
                    <option value="abc-industries">ABC Industries Ltd</option>
                    <option value="xyz-corp">XYZ Corporation</option>
                    <option value="raw-materials">Raw Materials Ltd</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input type="date" id="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input 
                    id="invoice-number" 
                    placeholder={createInvoiceType === 'sales' ? 'INV/2024-25/XXX' : 'PI/2024-25/XXX'} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="reference">Reference</Label>
                  <Input id="reference" placeholder="Purchase Order / Reference" />
                </div>
              </div>

              {/* Items Section */}
              <div>
                <Label>Items</Label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 border-r">Item</th>
                        <th className="text-left p-3 border-r">Qty</th>
                        <th className="text-left p-3 border-r">Rate</th>
                        <th className="text-left p-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 border-r">
                          <Input placeholder="Select or enter item" />
                        </td>
                        <td className="p-3 border-r">
                          <Input type="number" placeholder="0" className="w-20" />
                        </td>
                        <td className="p-3 border-r">
                          <Input type="number" placeholder="0.00" className="w-24" />
                        </td>
                        <td className="p-3">
                          <span className="font-medium">₹0.00</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Button className="mt-2 text-sm" variant="outline">
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18% GST):</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert(`${createInvoiceType} invoice created successfully!`);
                setShowCreateDialog(false);
              }}>
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}