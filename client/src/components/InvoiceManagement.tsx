import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  FileTextIcon, 
  SearchIcon,
  CalendarIcon,
  IndianRupeeIcon,
  PrinterIcon,
  MailIcon,
  DownloadIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  hsnSacCode: string;
  quantity: number;
  unitOfMeasurement: string;
  ratePerUnit: number;
  grossAmount: number;
  discountPercentage: number;
  discountAmount: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceType: string;
  customerId: string;
  customerName?: string;
  placeOfSupply: string;
  subtotalAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalInvoiceAmount: number;
  invoiceStatus: string;
  paymentStatus: string;
  createdAt: Date;
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);

  // Invoice Form State
  const [invoiceData, setInvoiceData] = useState({
    invoiceType: 'TAX_INVOICE',
    customerId: '',
    placeOfSupply: '',
    placeOfSupplyStateCode: '',
    buyerOrderNumber: '',
    buyerOrderDate: '',
    paymentTerms: '30 Days Credit',
    paymentMode: 'NEFT',
    remarks: ''
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalAmount: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadInvoices();
    loadParties();
    loadProducts();
  }, []);

  // Calculate totals when items change
  useEffect(() => {
    calculateTotals();
  }, [invoiceItems]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sales-operations/sales-invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParties = async () => {
    try {
      const response = await fetch('/api/sales-operations/parties?type=CUSTOMER');
      if (response.ok) {
        const data = await response.json();
        setParties(data);
      }
    } catch (error) {
      console.error('Error loading parties:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/sales-operations/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    invoiceItems.forEach(item => {
      subtotal += item.taxableAmount;
      cgstAmount += item.cgstAmount;
      sgstAmount += item.sgstAmount;
      igstAmount += item.igstAmount;
    });

    const totalAmount = subtotal + cgstAmount + sgstAmount + igstAmount;

    setTotals({
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount
    });
  };

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      productId: '',
      productName: '',
      hsnSacCode: '',
      quantity: 1,
      unitOfMeasurement: 'PCS',
      ratePerUnit: 0,
      grossAmount: 0,
      discountPercentage: 0,
      discountAmount: 0,
      taxableAmount: 0,
      cgstRate: 9,
      cgstAmount: 0,
      sgstRate: 9,
      sgstAmount: 0,
      igstRate: 0,
      igstAmount: 0,
      totalAmount: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amounts when relevant fields change
    if (['quantity', 'ratePerUnit', 'discountPercentage', 'cgstRate', 'sgstRate', 'igstRate'].includes(field)) {
      const item = updatedItems[index];
      item.grossAmount = item.quantity * item.ratePerUnit;
      item.discountAmount = (item.grossAmount * item.discountPercentage) / 100;
      item.taxableAmount = item.grossAmount - item.discountAmount;
      item.cgstAmount = (item.taxableAmount * item.cgstRate) / 100;
      item.sgstAmount = (item.taxableAmount * item.sgstRate) / 100;
      item.igstAmount = (item.taxableAmount * item.igstRate) / 100;
      item.totalAmount = item.taxableAmount + item.cgstAmount + item.sgstAmount + item.igstAmount;
    }
    
    setInvoiceItems(updatedItems);
  };

  const removeInvoiceItem = (index: number) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateInvoiceItem(index, 'productId', productId);
      updateInvoiceItem(index, 'productName', product.productName);
      updateInvoiceItem(index, 'hsnSacCode', product.hsnSacCode);
      updateInvoiceItem(index, 'unitOfMeasurement', product.unitOfMeasurement);
      updateInvoiceItem(index, 'ratePerUnit', parseFloat(product.saleRate || '0'));
      updateInvoiceItem(index, 'cgstRate', parseFloat(product.gstRate || '0') / 2);
      updateInvoiceItem(index, 'sgstRate', parseFloat(product.gstRate || '0') / 2);
    }
  };

  const saveInvoice = async () => {
    setLoading(true);
    try {
      const invoicePayload = {
        ...invoiceData,
        invoiceDate: new Date(),
        subtotalAmount: totals.subtotal,
        cgstAmount: totals.cgstAmount,
        sgstAmount: totals.sgstAmount,
        igstAmount: totals.igstAmount,
        totalInvoiceAmount: totals.totalAmount,
        totalInWords: numberToWords(totals.totalAmount)
      };

      const response = await fetch('/api/sales-operations/sales-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: invoicePayload,
          items: invoiceItems
        }),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        resetForm();
        loadInvoices();
      } else {
        console.error('Error creating invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setInvoiceData({
      invoiceType: 'TAX_INVOICE',
      customerId: '',
      placeOfSupply: '',
      placeOfSupplyStateCode: '',
      buyerOrderNumber: '',
      buyerOrderDate: '',
      paymentTerms: '30 Days Credit',
      paymentMode: 'NEFT',
      remarks: ''
    });
    setInvoiceItems([]);
  };

  const numberToWords = (amount: number): string => {
    // Simplified number to words conversion
    return `Rupees ${amount.toLocaleString('en-IN')} Only`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'SUBMITTED': 'bg-blue-100 text-blue-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return <Badge className={statusColors[status as keyof typeof statusColors]}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PARTIAL': 'bg-orange-100 text-orange-800',
      'PAID': 'bg-green-100 text-green-800',
      'OVERDUE': 'bg-red-100 text-red-800'
    };
    return <Badge className={statusColors[status as keyof typeof statusColors]}>{status}</Badge>;
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Sales Invoice</DialogTitle>
                <DialogDescription>
                  Create a new GST-compliant sales invoice with automatic tax calculations
                </DialogDescription>
              </DialogHeader>
              
              {/* Invoice Form */}
              <div className="space-y-6">
                {/* Basic Invoice Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceType">Invoice Type</Label>
                    <Select value={invoiceData.invoiceType} onValueChange={(value) => setInvoiceData({...invoiceData, invoiceType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TAX_INVOICE">Tax Invoice</SelectItem>
                        <SelectItem value="PROFORMA">Proforma Invoice</SelectItem>
                        <SelectItem value="CREDIT_NOTE">Credit Note</SelectItem>
                        <SelectItem value="DEBIT_NOTE">Debit Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="customerId">Customer</Label>
                    <Select value={invoiceData.customerId} onValueChange={(value) => setInvoiceData({...invoiceData, customerId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map((party) => (
                          <SelectItem key={party.id} value={party.id}>
                            {party.partyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="placeOfSupply">Place of Supply</Label>
                    <Input
                      value={invoiceData.placeOfSupply}
                      onChange={(e) => setInvoiceData({...invoiceData, placeOfSupply: e.target.value})}
                      placeholder="Enter place of supply"
                    />
                  </div>
                </div>

                {/* Invoice Items */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Invoice Items</CardTitle>
                    <Button onClick={addInvoiceItem} size="sm" className="flex items-center gap-2">
                      <PlusIcon className="h-4 w-4" />
                      Add Item
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>HSN/SAC</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>UOM</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Discount%</TableHead>
                            <TableHead>Taxable</TableHead>
                            <TableHead>CGST</TableHead>
                            <TableHead>SGST</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceItems.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell className="min-w-[200px]">
                                <Select 
                                  value={item.productId} 
                                  onValueChange={(value) => handleProductSelect(index, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.productName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.hsnSacCode}
                                  onChange={(e) => updateInvoiceItem(index, 'hsnSacCode', e.target.value)}
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Select 
                                  value={item.unitOfMeasurement} 
                                  onValueChange={(value) => updateInvoiceItem(index, 'unitOfMeasurement', value)}
                                >
                                  <SelectTrigger className="w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PCS">PCS</SelectItem>
                                    <SelectItem value="KG">KG</SelectItem>
                                    <SelectItem value="LITRE">LITRE</SelectItem>
                                    <SelectItem value="DRUM">DRUM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.ratePerUnit}
                                  onChange={(e) => updateInvoiceItem(index, 'ratePerUnit', parseFloat(e.target.value) || 0)}
                                  className="w-24"
                                />
                              </TableCell>
                              <TableCell>₹{item.grossAmount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.discountPercentage}
                                  onChange={(e) => updateInvoiceItem(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>₹{item.taxableAmount.toFixed(2)}</TableCell>
                              <TableCell>₹{item.cgstAmount.toFixed(2)}</TableCell>
                              <TableCell>₹{item.sgstAmount.toFixed(2)}</TableCell>
                              <TableCell className="font-medium">₹{item.totalAmount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeInvoiceItem(index)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Totals */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <Label>Subtotal</Label>
                        <p className="font-medium">₹{totals.subtotal.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label>CGST</Label>
                        <p className="font-medium">₹{totals.cgstAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label>SGST</Label>
                        <p className="font-medium">₹{totals.sgstAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label>IGST</Label>
                        <p className="font-medium">₹{totals.igstAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label className="text-lg">Total Amount</Label>
                        <p className="font-bold text-lg">₹{totals.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveInvoice} disabled={loading || invoiceItems.length === 0}>
                    {loading ? 'Saving...' : 'Save Invoice'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{format(new Date(invoice.invoiceDate), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{invoice.customerName || 'N/A'}</TableCell>
                      <TableCell>₹{invoice.totalInvoiceAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{getStatusBadge(invoice.invoiceStatus)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(invoice.paymentStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <PrinterIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MailIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}