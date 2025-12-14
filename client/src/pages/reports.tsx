import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Users, 
  Calculator,
  Plane,
  Receipt,
  Target,
  Download,
  Eye,
  Filter,
  ArrowLeft,
  CheckCircle,
  Trash2,
  Calendar,
  Award,
  IndianRupee,
  Phone,
  RefreshCw,
  Building,
  MapPin,
  Printer
} from 'lucide-react';

// Invoice Wise Profit Calculator Component
const InvoiceWiseProfitCalculator = ({ onBack }: { onBack: () => void }) => {
  const [selectedParty, setSelectedParty] = useState<string>('all');
  const [showPartyDetails, setShowPartyDetails] = useState<string | null>(null);
  const [invoiceType, setInvoiceType] = useState<'all' | 'sales' | 'purchase'>('all');
  
  // Fetch real data from APIs - invoices with items
  const { data: invoiceData, isLoading: invoicesLoading, error: invoicesError } = useQuery<any>({
    queryKey: ['/api/sales-operations/invoices-with-items'],
  });

  const { data: parties = [], isLoading: partiesLoading, error: partiesError } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/parties'],
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<any[]>({
    queryKey: ['/api/suppliers'],
  });

  // Fetch Sales module data for Party Payment & Interest Analysis
  const { data: salesOrders = [], isLoading: salesLoading } = useQuery<any[]>({
    queryKey: ['/api/sales'],
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const salesInvoices = invoiceData?.salesInvoices || [];
  const purchaseInvoices = invoiceData?.purchaseInvoices || [];
  
  const isLoading = invoicesLoading || partiesLoading || suppliersLoading || salesLoading || clientsLoading;

  // Process Sales module data for Party Payment & Interest Analysis (Sales Customers)
  const salesPartyAnalysis = useMemo(() => {
    if (!salesOrders.length || !clients.length) {
      return [];
    }

    // Group sales orders by client
    const clientMap = new Map();
    
    salesOrders.forEach((sale: any) => {
      const client = clients.find((c: any) => c.id === sale.clientId);
      const clientName = client?.companyName || client?.name || 'Unknown Client';
      
      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, {
          name: clientName,
          totalAmount: 0,
          invoiceCount: 0,
          pendingAmount: 0,
          paidAmount: 0,
          overdueDays: 0,
          invoices: []
        });
      }
      
      const clientData = clientMap.get(clientName);
      const saleAmount = parseFloat(sale.totalAmount || '0');
      clientData.totalAmount += saleAmount;
      clientData.invoiceCount += 1;
      
      // Check delivery/payment status
      const isPending = sale.deliveryStatus !== 'DELIVERED' || sale.deliveryStatus === 'RECEIVING' || sale.deliveryStatus === 'OK';
      
      if (isPending) {
        clientData.pendingAmount += saleAmount;
        
        // Calculate overdue days from sale date
        const saleDate = new Date(sale.date || sale.createdAt);
        const today = new Date();
        const dueDate = new Date(saleDate);
        dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms
        
        const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          clientData.overdueDays = Math.max(clientData.overdueDays, diffDays);
        }
      } else {
        clientData.paidAmount += saleAmount;
      }
      
      clientData.invoices.push({
        ...sale,
        clientName,
        status: isPending ? 'PENDING' : 'PAID'
      });
    });

    // Calculate interest for each client
    return Array.from(clientMap.values()).map(client => {
      const interestRate = 18; // 18% annual
      const perDayInterest = Math.floor((client.pendingAmount * interestRate / 365) / 100);
      const totalInterest = perDayInterest * client.overdueDays;

      return {
        name: client.name,
        invoiceCount: client.invoiceCount,
        totalAmount: client.totalAmount,
        pendingAmount: client.pendingAmount,
        paidAmount: client.paidAmount,
        overdueDays: client.overdueDays,
        interestRate: '18%',
        perDayInterest: perDayInterest,
        totalInterest: totalInterest,
        invoices: client.invoices
      };
    }).filter(client => client.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [salesOrders, clients]);

  // Process real data to match our report format
  const processedData = useMemo(() => {
    if (!salesInvoices.length && !purchaseInvoices.length) {
      return { 
        invoices: [], 
        parties: [], 
        summary: { 
          totalSalesValue: 0, 
          totalPurchaseCost: 0, 
          grossProfit: 0, 
          profitMargin: 0,
          totalSalesInvoices: 0,
          totalPurchaseInvoices: 0,
          pendingSalesAmount: 0,
          pendingPurchaseAmount: 0
        } 
      };
    }

    // Create invoice data from real sales invoices with items
    const salesInvoiceData = salesInvoices.map((sale: any) => {
      const saleAmount = parseFloat(sale.totalInvoiceAmount || '0');
      const taxableAmount = parseFloat(sale.subtotalAmount || '0');
      const cgst = parseFloat(sale.cgstAmount || '0');
      const sgst = parseFloat(sale.sgstAmount || '0');
      const igst = parseFloat(sale.igstAmount || '0');
      
      // Get items details
      const items = sale.items || [];
      const totalQty = items.reduce((sum: number, item: any) => sum + parseFloat(item.quantity || '0'), 0);
      const productNames = items.map((item: any) => item.productName).join(', ') || 'N/A';
      const avgRate = items.length > 0 
        ? items.reduce((sum: number, item: any) => sum + parseFloat(item.ratePerUnit || '0'), 0) / items.length
        : 0;

      return {
        type: 'SALES',
        date: new Date(sale.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        invoiceNo: sale.invoiceNumber,
        partyName: sale.customerName || 'N/A',
        gstin: sale.customerGstin || 'N/A',
        product: productNames,
        qty: totalQty.toFixed(2),
        unit: items[0]?.unitOfMeasurement || 'KG',
        rate: avgRate.toFixed(2),
        taxableAmount: taxableAmount,
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        totalAmount: saleAmount,
        status: sale.paymentStatus || 'PENDING',
        dueDate: sale.dueDate ? new Date(sale.dueDate).toLocaleDateString('en-IN') : 'N/A',
        paymentTerms: sale.paymentTerms || '30 Days',
        id: sale.id,
        items: items
      };
    });

    // Create invoice data from real purchase invoices with items
    const purchaseInvoiceData = purchaseInvoices.map((purchase: any) => {
      const purchaseAmount = parseFloat(purchase.totalInvoiceAmount || '0');
      const taxableAmount = parseFloat(purchase.subtotalAmount || '0');
      const cgst = parseFloat(purchase.cgstAmount || '0');
      const sgst = parseFloat(purchase.sgstAmount || '0');
      const igst = parseFloat(purchase.igstAmount || '0');
      
      // Get items details
      const items = purchase.items || [];
      const totalQty = items.reduce((sum: number, item: any) => sum + parseFloat(item.quantity || '0'), 0);
      const productNames = items.map((item: any) => item.productName).join(', ') || 'N/A';
      const avgRate = items.length > 0 
        ? items.reduce((sum: number, item: any) => sum + parseFloat(item.ratePerUnit || '0'), 0) / items.length
        : 0;

      return {
        type: 'PURCHASE',
        date: new Date(purchase.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        invoiceNo: purchase.invoiceNumber,
        partyName: purchase.supplierName || 'N/A',
        gstin: purchase.supplierGstin || 'N/A',
        product: productNames,
        qty: totalQty.toFixed(2),
        unit: items[0]?.unitOfMeasurement || 'KG',
        rate: avgRate.toFixed(2),
        taxableAmount: taxableAmount,
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        totalAmount: purchaseAmount,
        status: purchase.paymentStatus || 'PENDING',
        dueDate: purchase.dueDate ? new Date(purchase.dueDate).toLocaleDateString('en-IN') : 'N/A',
        paymentTerms: purchase.paymentTerms || '30 Days',
        supplierInvoiceNo: purchase.supplierInvoiceNumber || 'N/A',
        id: purchase.id,
        items: items
      };
    });

    // Combine all invoices
    const allInvoices = [...salesInvoiceData, ...purchaseInvoiceData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate summary from real data
    const totalSalesValue = salesInvoices.reduce((sum: number, invoice: any) => 
      sum + parseFloat(invoice.totalInvoiceAmount || '0'), 0);
    
    const totalPurchaseCost = purchaseInvoices.reduce((sum: number, invoice: any) => 
      sum + parseFloat(invoice.totalInvoiceAmount || '0'), 0);

    const grossProfit = totalSalesValue - totalPurchaseCost;
    const profitMargin = totalSalesValue > 0 ? ((grossProfit / totalSalesValue) * 100) : 0;

    // Pending amounts
    const pendingSalesAmount = salesInvoices
      .filter((inv: any) => inv.paymentStatus === 'PENDING' || inv.paymentStatus === 'PARTIAL')
      .reduce((sum: number, inv: any) => sum + parseFloat(inv.totalInvoiceAmount || '0'), 0);
    
    const pendingPurchaseAmount = purchaseInvoices
      .filter((inv: any) => inv.paymentStatus === 'PENDING' || inv.paymentStatus === 'PARTIAL')
      .reduce((sum: number, inv: any) => sum + parseFloat(inv.totalInvoiceAmount || '0'), 0);

    // Create party analysis data from sales invoices
    const partyMap = new Map();
    
    salesInvoices.forEach((invoice: any) => {
      const partyName = invoice.customerName || 'Unknown';
      if (!partyMap.has(partyName)) {
        partyMap.set(partyName, {
          name: partyName,
          totalAmount: 0,
          invoiceCount: 0,
          pendingAmount: 0,
          paidAmount: 0,
          overdueDays: 0,
          invoices: []
        });
      }
      
      const partyData = partyMap.get(partyName);
      const invoiceAmount = parseFloat(invoice.totalInvoiceAmount || '0');
      partyData.totalAmount += invoiceAmount;
      partyData.invoiceCount += 1;
      partyData.invoices.push(invoice);
      
      if (invoice.paymentStatus === 'PENDING' || invoice.paymentStatus === 'PARTIAL') {
        partyData.pendingAmount += invoiceAmount;
        
        // Calculate overdue days
        if (invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate);
          const today = new Date();
          const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            partyData.overdueDays = Math.max(partyData.overdueDays, diffDays);
          }
        }
      } else if (invoice.paymentStatus === 'PAID') {
        partyData.paidAmount += invoiceAmount;
      }
    });

    const partyAnalysis = Array.from(partyMap.values()).map(party => {
      const interestRate = 18; // 18% annual
      const perDayInterest = Math.floor((party.pendingAmount * interestRate / 365) / 100);
      const totalInterest = perDayInterest * party.overdueDays;

      return {
        name: party.name,
        invoiceCount: party.invoiceCount,
        totalAmount: party.totalAmount,
        pendingAmount: party.pendingAmount,
        paidAmount: party.paidAmount,
        overdueDays: party.overdueDays,
        interestRate: '18%',
        perDayInterest: perDayInterest,
        totalInterest: totalInterest,
        invoices: party.invoices
      };
    }).filter(party => party.totalAmount > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      invoices: allInvoices,
      salesInvoices: salesInvoiceData,
      purchaseInvoices: purchaseInvoiceData,
      parties: partyAnalysis,
      summary: {
        totalSalesValue,
        totalPurchaseCost,
        grossProfit,
        profitMargin,
        totalSalesInvoices: salesInvoices.length,
        totalPurchaseInvoices: purchaseInvoices.length,
        pendingSalesAmount,
        pendingPurchaseAmount
      }
    };
  }, [salesInvoices, purchaseInvoices, parties]);

  // Party list for dropdown (from real data)
  const partyList = ['All Parties', ...processedData.parties.map((party: any) => party.name)];

  // Get filtered data based on selected party and invoice type
  const getFilteredData = () => {
    let filteredInvoices = processedData.invoices;
    
    // Filter by invoice type
    if (invoiceType === 'sales') {
      filteredInvoices = processedData.salesInvoices || [];
    } else if (invoiceType === 'purchase') {
      filteredInvoices = processedData.purchaseInvoices || [];
    }
    
    // Filter by party
    if (selectedParty !== 'all') {
      filteredInvoices = filteredInvoices.filter((invoice: any) => invoice.partyName === selectedParty);
    }
    
    return {
      ...processedData,
      invoices: filteredInvoices
    };
  };

  const filteredData = getFilteredData();

  // Party details function
  const getPartyDetails = (partyName: string) => {
    const party = processedData.parties.find((p: any) => p.name === partyName);
    if (!party) return null;

    return {
      totalInvoices: party.invoiceCount,
      totalAmount: `₹${party.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      pendingAmount: `₹${party.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      paidAmount: `₹${party.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      overdueDays: party.overdueDays,
      totalInterest: `₹${party.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      invoices: party.invoices.map((invoice: any) => ({
        no: invoice.invoiceNumber,
        date: new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        product: invoice.items?.map((i: any) => i.productName).join(', ') || 'N/A',
        qty: invoice.items?.reduce((sum: number, i: any) => sum + parseFloat(i.quantity || '0'), 0).toFixed(2) || '0',
        amount: `₹${parseFloat(invoice.totalInvoiceAmount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        status: invoice.paymentStatus === 'PAID' ? 'Paid' : invoice.paymentStatus === 'PARTIAL' ? 'Partial' : 'Pending'
      }))
    };
  };

  const handlePartyClick = (partyName: string) => {
    setShowPartyDetails(partyName);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading invoice data...</div>
      </div>
    );
  }

  if (showPartyDetails) {
    const party = getPartyDetails(showPartyDetails);
    if (!party) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Party details not found</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="mb-4 flex gap-4">
          <Button variant="outline" onClick={() => setShowPartyDetails(null)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Report
          </Button>
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </div>

        <div className="bg-slate-700 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-light text-center mb-2">{showPartyDetails} - Detailed Analysis</h2>
          <p className="text-center text-slate-300">Complete Financial Analysis & Transaction History</p>
          <div className="text-center mt-4">
            <Badge className="bg-blue-600">Report Generated: {new Date().toLocaleDateString('en-IN')}</Badge>
          </div>
        </div>

        {/* Party Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{party.totalInvoices}</div>
              <div className="text-sm opacity-90">Total Invoices</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{party.totalAmount}</div>
              <div className="text-sm opacity-90">Total Business</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{party.paidAmount}</div>
              <div className="text-sm opacity-90">Paid Amount</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{party.pendingAmount}</div>
              <div className="text-sm opacity-90">Pending Amount</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{party.totalInterest}</div>
              <div className="text-sm opacity-90">Interest ({party.overdueDays} days)</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Invoice No.</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {party.invoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">No invoices found for this party</td>
                    </tr>
                  ) : (
                    party.invoices.map((invoice: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-blue-600">{invoice.no}</td>
                        <td className="p-3">{invoice.date}</td>
                        <td className="p-3">{invoice.product}</td>
                        <td className="p-3">{invoice.qty}</td>
                        <td className="p-3 text-right font-semibold">{invoice.amount}</td>
                        <td className="p-3 text-center">
                          <Badge className={
                            invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }>
                            {invoice.status}
                          </Badge>
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
        
        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Invoice Type:</label>
            <select 
              value={invoiceType} 
              onChange={(e) => setInvoiceType(e.target.value as 'all' | 'sales' | 'purchase')}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Invoices</option>
              <option value="sales">Sales Invoices</option>
              <option value="purchase">Purchase Invoices</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Party:</label>
            <select 
              value={selectedParty} 
              onChange={(e) => setSelectedParty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Parties</option>
              {partyList.slice(1).map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-700 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-light text-center mb-2">Invoice Wise Profit & Interest Calculator</h2>
        <p className="text-center text-slate-300">Complete Financial Analysis - Real-Time Data from Invoice Management</p>
        <div className="text-center mt-4">
          <Badge className="bg-green-600">Report Generated: {new Date().toLocaleDateString('en-IN')}</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">₹{processedData.summary.totalSalesValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="text-sm opacity-90">Total Sales Value ({processedData.summary.totalSalesInvoices} invoices)</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">₹{processedData.summary.totalPurchaseCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="text-sm opacity-90">Total Purchase Cost ({processedData.summary.totalPurchaseInvoices} invoices)</div>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-r ${processedData.summary.grossProfit >= 0 ? 'from-green-500 to-teal-600' : 'from-red-500 to-pink-600'} text-white`}>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">₹{processedData.summary.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className="text-sm opacity-90">Gross Profit/Loss</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{processedData.summary.profitMargin.toFixed(2)}%</div>
            <div className="text-sm opacity-90">Profit Margin</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Amounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold text-orange-600">₹{processedData.summary.pendingSalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <div className="text-sm text-gray-600">Pending Sales Receivables</div>
            </div>
            <Receipt className="w-8 h-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold text-red-600">₹{processedData.summary.pendingPurchaseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <div className="text-sm text-gray-600">Pending Purchase Payables</div>
            </div>
            <Receipt className="w-8 h-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Invoice Details Table */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Details ({filteredData.invoices.length} invoices)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <tr>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Invoice No.</th>
                  <th className="p-3 text-left">Party Name</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-right">Taxable</th>
                  <th className="p-3 text-right">GST</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-6 text-center text-gray-500">
                      No invoices found. Create invoices in Invoice Management to see data here.
                    </td>
                  </tr>
                ) : (
                  filteredData.invoices.map((invoice: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Badge className={invoice.type === 'SALES' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {invoice.type}
                        </Badge>
                      </td>
                      <td className="p-3">{invoice.date}</td>
                      <td className="p-3 font-medium text-blue-600">{invoice.invoiceNo}</td>
                      <td className="p-3">{invoice.partyName}</td>
                      <td className="p-3 max-w-[200px] truncate" title={invoice.product}>{invoice.product}</td>
                      <td className="p-3 text-right">{invoice.qty} {invoice.unit}</td>
                      <td className="p-3 text-right">₹{parseFloat(invoice.rate).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right">₹{invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">₹{(invoice.cgst + invoice.sgst + invoice.igst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right font-semibold">₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-center">
                        <Badge className={
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }>
                          {invoice.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Party Payment & Interest Analysis - Connected to Sales Module */}
      <Card className="border-2 border-green-500">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-700 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Party Payment & Interest Analysis (Sales Customers)
          </CardTitle>
          <CardDescription className="text-green-600">
            Data from Sales Module - Sales Orders linked to Clients
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="p-3 text-left">Party Name</th>
                  <th className="p-3 text-center">Invoices</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Pending</th>
                  <th className="p-3 text-center">Overdue Days</th>
                  <th className="p-3 text-center">Interest Rate</th>
                  <th className="p-3 text-right">Per Day Interest</th>
                  <th className="p-3 text-right">Total Interest</th>
                </tr>
              </thead>
              <tbody>
                {salesPartyAnalysis.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-10 h-10 text-gray-300" />
                        <p className="font-medium">No sales data available</p>
                        <p className="text-sm">Create sales orders in the Sales module to see party analysis.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  salesPartyAnalysis.map((party: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-green-50">
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                            {party.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-900 font-semibold">{party.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className="bg-blue-100 text-blue-700">{party.invoiceCount}</Badge>
                      </td>
                      <td className="p-3 text-right font-semibold text-gray-900">₹{party.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right text-green-600 font-medium">₹{party.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right text-orange-600 font-medium">₹{party.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-center">
                        {party.overdueDays > 0 ? (
                          <Badge className="bg-red-100 text-red-700">{party.overdueDays} days</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600">0 days</Badge>
                        )}
                      </td>
                      <td className="p-3 text-center">{party.interestRate}</td>
                      <td className="p-3 text-right text-orange-600">₹{party.perDayInterest.toLocaleString('en-IN')}/day</td>
                      <td className="p-3 text-right text-red-600 font-semibold">₹{party.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {salesPartyAnalysis.length > 0 && (
                <tfoot className="bg-green-100">
                  <tr className="font-bold">
                    <td className="p-3">Total ({salesPartyAnalysis.length} Parties)</td>
                    <td className="p-3 text-center">{salesPartyAnalysis.reduce((sum: number, p: any) => sum + p.invoiceCount, 0)}</td>
                    <td className="p-3 text-right">₹{salesPartyAnalysis.reduce((sum: number, p: any) => sum + p.totalAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right text-green-600">₹{salesPartyAnalysis.reduce((sum: number, p: any) => sum + p.paidAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right text-orange-600">₹{salesPartyAnalysis.reduce((sum: number, p: any) => sum + p.pendingAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right text-red-600">₹{salesPartyAnalysis.reduce((sum: number, p: any) => sum + p.totalInterest, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// TA Advance Sheet Component
const TAAdvanceSheet = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch all users from user management
  const { data: allUsers = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });
  
  // Filter users based on role: non-admin users see only themselves
  const users = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'ADMIN') {
      return allUsers;
    }
    // Non-admin users can only see themselves
    return allUsers.filter(u => u.id === user.id);
  }, [allUsers, user]);
  
  // State for employee selection
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);
  
  // Auto-select employee for non-admin users
  React.useEffect(() => {
    if (user && user.role !== 'ADMIN' && allUsers.length > 0 && !selectedEmployeeId) {
      const currentUserData = allUsers.find(u => u.id === user.id);
      if (currentUserData) {
        setSelectedEmployeeId(currentUserData.id);
        setSelectedEmployee(currentUserData);
      }
    }
  }, [user, allUsers, selectedEmployeeId]);
  
  // State for form fields
  const [advanceRequested, setAdvanceRequested] = React.useState<number>(0);
  const [sanctionedAmount, setSanctionedAmount] = React.useState<number>(0);
  const [receivedAmount, setReceivedAmount] = React.useState<number>(0);
  const [departureLocation, setDepartureLocation] = React.useState<string>('');
  const [destination, setDestination] = React.useState<string>('');
  const [modeOfTravel, setModeOfTravel] = React.useState<string>('CAR');
  const [purposeOfJourney, setPurposeOfJourney] = React.useState<string>('');
  const [tourProgramme, setTourProgramme] = React.useState<string>('');
  
  // State for date fields
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');
  
  // Handle employee selection
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    const employee = users.find(u => u.id === employeeId);
    setSelectedEmployee(employee || null);
  };

  // Calculate number of days
  const numberOfDays = React.useMemo(() => {
    if (!fromDate || !toDate) return 0;
    
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    // Calculate difference in milliseconds
    const diffTime = end.getTime() - start.getTime();
    // Convert to days and add 1 to include both start and end dates
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays > 0 ? diffDays : 0;
  }, [fromDate, toDate]);

  // Calculate total advance
  const totalAdvance = React.useMemo(() => {
    return advanceRequested + sanctionedAmount + receivedAmount;
  }, [advanceRequested, sanctionedAmount, receivedAmount]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMIT CLICKED ===');
    console.log('Form data:', {
      selectedEmployeeId,
      selectedEmployee,
      fromDate,
      toDate,
      numberOfDays,
      departureLocation,
      destination,
      modeOfTravel,
      purposeOfJourney,
      tourProgramme,
      advanceRequested,
      sanctionedAmount,
      receivedAmount
    });
    
    // Basic validation
    if (!fromDate || !toDate) {
      toast({
        title: "Missing Information",
        description: "Please select both From Date and To Date",
        variant: "destructive",
      });
      return;
    }

    if (numberOfDays <= 0) {
      toast({
        title: "Invalid Dates",
        description: "To Date must be after From Date",
        variant: "destructive",
      });
      return;
    }

    if (!destination) {
      toast({
        title: "Missing Information",
        description: "Please enter destination",
        variant: "destructive",
      });
      return;
    }

    if (!selectedEmployee) {
      toast({
        title: "Missing Information",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to submit TA Advance request",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Submitting TA Advance with data:', {
        user,
        destination,
        fromDate,
        toDate,
        numberOfDays,
        advanceRequested,
        sanctionedAmount,
      });

      // Submit data to backend with all required fields
      const response = await fetch('/api/tour-advances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Employee Details (required)
          employeeId: selectedEmployee.id,
          employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`.trim(),
          designation: selectedEmployee.designation || selectedEmployee.role || 'Employee',
          department: selectedEmployee.department || 'Not Specified',
          phoneNo: selectedEmployee.mobileNumber || '',
          employeeCode: selectedEmployee.employeeCode || '',
          
          // Tour Details (required)
          tourStartDate: fromDate,
          tourEndDate: toDate,
          numberOfDays: numberOfDays,
          departureLocation: departureLocation || '',
          mainDestination: destination,
          modeOfTravel: modeOfTravel,
          purposeOfJourney: purposeOfJourney ? [purposeOfJourney] : ['CLIENT_VISIT'],
          tourProgramme: tourProgramme || '',
          
          // Financial Details
          advanceRequired: true,
          advanceAmountRequested: parseFloat(String(advanceRequested)) || 0,
          sanctionAmountApproved: parseFloat(String(sanctionedAmount)) || 0,
          
          // Status
          status: 'DRAFT',
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to submit TA Advance request');
      }

      const result = await response.json();
      console.log('TA Advance submitted successfully:', result);

      // Invalidate tour advances query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tour-advances'] });

      // Show success message
      toast({
        title: "TA Advance Request Submitted",
        description: `Your request for ${numberOfDays} days with total advance of ₹${totalAdvance.toLocaleString('en-IN')} has been submitted successfully.`,
      });

      // Navigate back to reports after successful submission
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      console.error('Error submitting TA Advance:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit TA Advance request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-4">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
      </div>

      <div className="bg-slate-700 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-light text-center mb-2">TA Advance Sheet</h2>
        <p className="text-center text-slate-300">Travel Advance Request Form - Bitumen Business Division</p>
        <div className="text-center mt-4">
          <Badge className="bg-orange-600">Status: Pending Approval</Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee & Tour Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employee Name *</label>
              <Select 
                value={selectedEmployeeId}
                onValueChange={handleEmployeeChange}
                disabled={user?.role !== 'ADMIN'}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <SelectItem value="loading" disabled>Loading employees...</SelectItem>
                  ) : users.length === 0 ? (
                    <SelectItem value="no-users" disabled>No employees found</SelectItem>
                  ) : (
                    users.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} ({employee.role})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Employee ID</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md bg-gray-50" 
                placeholder="Auto-filled"
                value={selectedEmployee?.employeeCode || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Designation</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md bg-gray-50" 
                placeholder="Auto-filled"
                value={selectedEmployee?.designation || ''}
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md bg-gray-50" 
                placeholder="Auto-filled"
                value={selectedEmployee?.department || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone No.</label>
              <input 
                type="tel" 
                className="w-full p-2 border rounded-md bg-gray-50" 
                placeholder="Auto-filled"
                value={selectedEmployee?.mobileNumber || ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tour Programme</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[80px]" 
                placeholder="Enter tour program details"
                value={tourProgramme}
                onChange={(e) => setTourProgramme(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Travel Details & Purpose
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-md"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-md"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Days</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md bg-gray-50" 
                placeholder="Auto calc"
                value={numberOfDays > 0 ? `${numberOfDays} days` : 'Select dates'}
                readOnly
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md" 
                placeholder="Departure location"
                value={departureLocation}
                onChange={(e) => setDepartureLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To (Destination) *</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md" 
                placeholder="Main destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mode of Travel *</label>
              <Select value={modeOfTravel} onValueChange={setModeOfTravel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select mode of travel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIR">Flight/Air</SelectItem>
                  <SelectItem value="TRAIN">Train</SelectItem>
                  <SelectItem value="CAR">Car</SelectItem>
                  <SelectItem value="BUS">Bus</SelectItem>
                  <SelectItem value="OTHER">Other (Cab/Self Vehicle/Two Wheeler)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Purpose of Journey:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Client Visit', 'Plant Visit', 'Party Meeting', 'Dept Visit', 'Others'].map((purpose) => (
                <label key={purpose} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">{purpose}</span>
                </label>
              ))}
            </div>
            <textarea 
              className="w-full p-2 border rounded-md" 
              placeholder="If Others, Specify other purpose"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Financial Details & Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Advance Required (₹)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-md" 
                placeholder="Enter amount"
                value={advanceRequested || ''}
                onChange={(e) => setAdvanceRequested(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sanctioned Amount (₹)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-md" 
                placeholder="Enter sanctioned amount"
                value={sanctionedAmount || ''}
                onChange={(e) => setSanctionedAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Received Amount (₹)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-md" 
                placeholder="Amount received"
                value={receivedAmount || ''}
                onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <div className="text-lg font-semibold text-green-700">
              Total Advance: ₹{totalAdvance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-orange-50 p-4 rounded-md border-l-4 border-orange-400">
            <h4 className="font-semibold text-orange-800 mb-2">Important Notes</h4>
            <div className="space-y-2 text-sm text-orange-700">
              <p>• No maintenance charges or vehicle will be provided.</p>
              <p>• No advance paid by Authority if any uncertain issue occur at the time of tour.</p>
              <p>• Tour planning should be submit to accounts before one or two days from going to tour otherwise no TA advance will be sanctioned for another employee.</p>
              <p>• TA requests should be submitted by next day after coming from tour with bills.</p>
              <p>• TA advance should be adjusted before taking another tour advance otherwise no advance amount will be sanctioned for another employee.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          type="submit"
          onClick={(e) => {
            console.log('Button clicked!');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
        >
          Submit TA Advance Request
        </Button>
      </div>
      </form>
    </div>
  );
};

// TA Bill Report Component
const TABillReport = ({ onBack }: { onBack: () => void }) => {
  // Fetch real data from APIs
  const { data: tourAdvances = [], isLoading: tourLoading, error: tourError } = useQuery<any[]>({
    queryKey: ['/api/tour-advances'],
  });

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const { data: salesInvoices = [], isLoading: salesLoading, error: salesError } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/sales-invoices'],
  });

  const isLoading = tourLoading || usersLoading || salesLoading;

  // Add debug logging
  React.useEffect(() => {
    if (tourAdvances.length > 0) {
      console.log('=== TA BILL REPORT DEBUG ===');
      console.log('Total TA records:', tourAdvances.length);
      console.log('Sample TA data:', tourAdvances[0]);
      console.log('TA Statuses:', tourAdvances.map(ta => ta.status));
      console.log('Users count:', users.length);
    }
  }, [tourAdvances, users]);

  // Calculate real statistics from tour advance data
  const billStats = useMemo(() => {
    if (!tourAdvances.length || !users.length) {
      return {
        totalBillSubmissions: 0,
        approvalRate: 0,
        averageBillAmount: 0,
        totalLeadsGenerated: 0,
        totalBillAmount: 0,
        plantPartyVisits: 0,
        deptVisits: 0,
        newLeadsCreated: 0,
        convertsAndClosed: 0,
        perLeadCost: 0,
        totalSubmitted: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalPending: 0,
        submittedAmount: 0,
        approvedAmount: 0,
        rejectedAmount: 0,
        pendingAmount: 0
      };
    }

    // Filter by status - SUBMITTED and APPROVED TA requests
    const submittedBills = tourAdvances.filter(ta => 
      ta.status && ['SUBMITTED', 'RECOMMENDED', 'APPROVED', 'PROCESSING', 'SETTLED'].includes(ta.status)
    );
    
    const approvedBills = tourAdvances.filter(ta => 
      ta.status && ['APPROVED', 'PROCESSING', 'SETTLED'].includes(ta.status)
    );

    const rejectedBills = tourAdvances.filter(ta => 
      ta.status && ta.status === 'REJECTED'
    );

    const pendingBills = tourAdvances.filter(ta => 
      ta.status && ['DRAFT', 'SUBMITTED', 'RECOMMENDED'].includes(ta.status)
    );

    // Calculate amounts by status
    const submittedAmount = submittedBills.reduce((sum, ta) => {
      const advance = parseFloat(ta.advanceAmountRequested || '0');
      const sanctioned = parseFloat(ta.sanctionAmountApproved || '0');
      return sum + advance + sanctioned;
    }, 0);
    
    const approvedAmount = approvedBills.reduce((sum, ta) => {
      const advance = parseFloat(ta.advanceAmountRequested || '0');
      const sanctioned = parseFloat(ta.sanctionAmountApproved || '0');
      return sum + advance + sanctioned;
    }, 0);
    
    const rejectedAmount = rejectedBills.reduce((sum, ta) => {
      const advance = parseFloat(ta.advanceAmountRequested || '0');
      const sanctioned = parseFloat(ta.sanctionAmountApproved || '0');
      return sum + advance + sanctioned;
    }, 0);
    
    const pendingAmount = pendingBills.reduce((sum, ta) => {
      const advance = parseFloat(ta.advanceAmountRequested || '0');
      const sanctioned = parseFloat(ta.sanctionAmountApproved || '0');
      return sum + advance + sanctioned;
    }, 0);

    const totalAmount = submittedAmount;
    const avgAmount = submittedBills.length > 0 ? totalAmount / submittedBills.length : 0;
    const approvalRate = submittedBills.length > 0 ? (approvedBills.length / submittedBills.length) * 100 : 0;

    // Calculate leads from sales invoices
    const leadsGenerated = salesInvoices.length;
    const convertsAndClosed = salesInvoices.filter(invoice => 
      invoice.status && invoice.status.toLowerCase() === 'paid'
    ).length;

    // Calculate visits from tour advances (only submitted/approved)
    const plantPartyVisits = submittedBills.filter(ta => 
      ta.modeOfTravel && ['AIR', 'TRAIN', 'BUS'].includes(ta.modeOfTravel)
    ).length;

    const deptVisits = submittedBills.length - plantPartyVisits;

    const perLeadCost = approvedBills.length > 0 ? approvedAmount / approvedBills.length : 0;

    // Generate table data from submitted/approved tour advances
    const employeeData = users.map(user => {
      const userSubmittedTA = submittedBills.filter(ta => ta.employeeId === user.id);
      const userApprovedTA = approvedBills.filter(ta => ta.employeeId === user.id);
      const userSales = salesInvoices.filter(invoice => invoice.salesPersonId === user.id);
      
      if (userSubmittedTA.length === 0) return null;

      const totalBillAmount = userSubmittedTA.reduce((sum, ta) => {
        const advance = parseFloat(ta.advanceAmountRequested || '0');
        const sanctioned = parseFloat(ta.sanctionAmountApproved || '0');
        return sum + advance + sanctioned;
      }, 0);
      
      const userPlantVisits = userSubmittedTA.filter(ta => 
        ta.modeOfTravel && ['AIR', 'TRAIN', 'BUS'].includes(ta.modeOfTravel)
      ).length;
      
      const userDeptVisits = userSubmittedTA.length - userPlantVisits;
      
      const userLeads = userSales.length;
      const userConverted = userSales.filter(sale => 
        sale.status && sale.status.toLowerCase() === 'paid'
      ).length;
      
      const latestStatus = userSubmittedTA.length > 0 ? 
        userSubmittedTA[userSubmittedTA.length - 1].status || 'SUBMITTED' : 
        'SUBMITTED';

      return {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || `User ${user.id.substring(0, 8)}`,
        amount: totalBillAmount,
        plantVisits: userPlantVisits,
        deptVisits: userDeptVisits,
        leads: userLeads,
        converted: userConverted,
        status: latestStatus
      };
    }).filter(emp => emp !== null); // Only show employees with submitted TA

    return {
      totalBillSubmissions: submittedBills.length,
      approvalRate: Math.round(approvalRate * 10) / 10,
      averageBillAmount: Math.round(avgAmount),
      totalLeadsGenerated: leadsGenerated,
      totalBillAmount: totalAmount,
      plantPartyVisits: plantPartyVisits,
      deptVisits: deptVisits,
      newLeadsCreated: leadsGenerated,
      convertsAndClosed: convertsAndClosed,
      perLeadCost: Math.round(perLeadCost),
      totalSubmitted: submittedBills.length,
      totalApproved: approvedBills.length,
      totalRejected: rejectedBills.length,
      totalPending: pendingBills.length,
      submittedAmount: Math.round(submittedAmount),
      approvedAmount: Math.round(approvedAmount),
      rejectedAmount: Math.round(rejectedAmount),
      pendingAmount: Math.round(pendingAmount),
      employeeData
    };
  }, [tourAdvances, users, salesInvoices]);

  // Helper function to get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'SUBMITTED': return 'Submitted';
      case 'RECOMMENDED': return 'Recommended';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'PROCESSING': return 'Processing';
      case 'SETTLED': return 'Settled';
      default: return status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SETTLED':
        return 'bg-green-100 text-green-800';
      case 'SUBMITTED':
      case 'RECOMMENDED':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <div className="text-center py-8">Loading TA Bill Report data...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
      </div>

      <div className="bg-slate-700 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-light text-center mb-2">TA Bill Report</h2>
        <p className="text-center text-slate-300">Bitumen Business Division - Travel Allowance Billing & Expense Tracking</p>
        <div className="text-center mt-4">
          <Badge className="bg-blue-600">Report Period: November 2025</Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="bg-blue-600">TA Advance Form</Button>
        <Button className="bg-purple-600">Sales Person Report</Button>
        <Button className="bg-indigo-600">TA Bill Report</Button>
      </div>

      {/* Financial Overview */}
      <Card>
        <CardHeader className="bg-orange-50">
          <CardTitle className="text-orange-700 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Overview
          </CardTitle>
          <CardDescription>Comprehensive analysis of travel allowance expenditure and ROI across all field operations</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{billStats.totalBillSubmissions}</div>
              <div className="text-sm text-gray-600">Total Bill Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{billStats.approvalRate}%</div>
              <div className="text-sm text-gray-600">Approval Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">₹{billStats.averageBillAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Average Bill Amount</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{billStats.totalLeadsGenerated}</div>
              <div className="text-sm text-gray-600">Total Leads Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { value: `₹${billStats.totalBillAmount.toLocaleString()}`, label: 'TA Bill', color: 'from-purple-500 to-blue-600' },
          { value: billStats.plantPartyVisits.toString(), label: 'Plant/Party Visits', color: 'from-blue-500 to-indigo-600' },
          { value: billStats.deptVisits.toString(), label: 'Dept Visits', color: 'from-indigo-500 to-purple-600' },
          { value: billStats.newLeadsCreated.toString(), label: 'New Leads Create', color: 'from-green-500 to-teal-600' },
          { value: billStats.convertsAndClosed.toString(), label: 'Convert & Closed', color: 'from-teal-500 to-cyan-600' },
          { value: `₹${billStats.perLeadCost.toLocaleString()}`, label: 'Per Lead Cost', color: 'from-cyan-500 to-blue-600' }
        ].map((item, index) => (
          <Card key={index} className={`bg-gradient-to-r ${item.color} text-white`}>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold">{item.value}</div>
              <div className="text-xs opacity-90">{item.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Details Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Bill Amount</th>
                  <th className="p-3 text-left">Plant/Party Visits</th>
                  <th className="p-3 text-left">Dept Visits</th>
                  <th className="p-3 text-left">New Leads</th>
                  <th className="p-3 text-left">Convert & Closed</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {(billStats.employeeData || []).map((employee, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{employee.name}</td>
                    <td className="p-3">₹{employee.amount.toLocaleString()}</td>
                    <td className="p-3">{employee.plantVisits}</td>
                    <td className="p-3">{employee.deptVisits}</td>
                    <td className="p-3">{employee.leads}</td>
                    <td className="p-3">{employee.converted}</td>
                    <td className="p-3">
                      <Badge className={getStatusColor(employee.status)}>
                        {getStatusLabel(employee.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis & ROI Breakdown */}
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-700 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cost Analysis & ROI Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-lg font-bold text-green-600">₹{billStats.submittedAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Bills Submitted ({billStats.totalSubmitted})</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-lg font-bold text-blue-600">₹{billStats.approvedAmount.toLocaleString()} ({billStats.approvalRate}%)</div>
              <div className="text-sm text-gray-600">Approved Amount ({billStats.totalApproved})</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-lg font-bold text-orange-600">₹{billStats.rejectedAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Rejected Amount ({billStats.totalRejected})</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-lg font-bold text-purple-600">₹{billStats.pendingAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Pending Review ({billStats.totalPending})</div>
            </div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-lg font-bold text-green-700">Cost Per Lead (Approved Bills): ₹{billStats.perLeadCost.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Sales Person Performance Report Component
const SalesPersonPerformanceReport = ({ onBack }: { onBack: () => void }) => {
  // Fetch real data from leads and lead follow-ups
  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ['/api/leads'],
  });

  const { data: leadFollowUps = [], isLoading: followUpsLoading } = useQuery<any[]>({
    queryKey: ['/api/lead-follow-ups'],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const { data: salesOrders = [], isLoading: salesLoading } = useQuery<any[]>({
    queryKey: ['/api/sales'],
  });

  const isLoading = leadsLoading || followUpsLoading || usersLoading || salesLoading;

  // Process sales performance data from leads and follow-ups
  const performanceData = useMemo(() => {
    // Filter users to sales personnel (SALES_MANAGER, SALES_EXECUTIVE, ADMIN or sales-related roles)
    const salesPersonnel = users.filter((user: any) => 
      user.role === 'SALES_MANAGER' || 
      user.role === 'SALES_EXECUTIVE' || 
      user.role === 'ADMIN' ||
      user.department?.toLowerCase().includes('sales') || 
      user.designation?.toLowerCase().includes('sales')
    );

    // If no sales personnel found, include all active users
    const activeUsers = salesPersonnel.length > 0 ? salesPersonnel : users.filter((u: any) => u.isActive !== false);

    if (activeUsers.length === 0) {
      return { summary: {}, performers: [] };
    }

    // Calculate performance for each sales person based on leads and follow-ups
    const performanceMetrics = activeUsers.map((person: any) => {
      // Find leads assigned to this person
      const personLeads = leads.filter((lead: any) => 
        lead.assignedTo === person.id || 
        lead.createdBy === person.id ||
        lead.salesPersonId === person.id
      );

      // Find follow-ups by this person
      const personFollowUps = leadFollowUps.filter((followUp: any) => 
        followUp.assignedTo === person.id || 
        followUp.createdBy === person.id ||
        followUp.assignedUserId === person.id
      );

      // Find sales orders by this person
      const personSales = salesOrders.filter((order: any) => 
        order.salespersonId === person.id ||
        order.createdBy === person.id
      );

      // Calculate metrics
      const totalLeads = personLeads.length;
      
      // Count follow-ups by type
      const callFollowUps = personFollowUps.filter((f: any) => 
        f.followUpType === 'CALL' || f.type === 'CALL' || f.type === 'PHONE_CALL'
      ).length;
      
      const meetingFollowUps = personFollowUps.filter((f: any) => 
        f.followUpType === 'MEETING' || f.type === 'MEETING' || f.type === 'PHYSICAL_MEETING' || f.type === 'ONLINE_MEETING'
      ).length;
      
      const emailFollowUps = personFollowUps.filter((f: any) => 
        f.followUpType === 'EMAIL' || f.type === 'EMAIL'
      ).length;

      // Fresh calls = Total calls made (from follow-ups)
      const freshCalls = callFollowUps + totalLeads; // leads created + calls made
      
      // Follow-ups = All follow-up activities
      const totalFollowUps = personFollowUps.length;
      
      // Dept Visits = Meetings
      const deptVisits = meetingFollowUps;
      
      // Party Visits = Client visits (leads with status other than NEW)
      const partyVisits = personLeads.filter((lead: any) => 
        lead.leadStatus !== 'NEW' && lead.leadStatus !== 'QUALIFIED'
      ).length;
      
      // Conversions = Leads converted (CLOSED_WON) + Sales orders
      const conversions = personLeads.filter((lead: any) => 
        lead.leadStatus === 'CLOSED_WON' || lead.status === 'CONVERTED'
      ).length + personSales.length;

      // Total Sales Revenue
      const totalSales = personSales.reduce((sum: number, order: any) => 
        sum + parseFloat(order.totalAmount || 0), 0);

      // Conversion Rate
      const conversionRate = freshCalls > 0 ? (conversions / freshCalls * 100) : 0;

      // Determine performance level
      let performance = 'Below Average';
      if (conversionRate >= 20 || conversions >= 5) performance = 'Excellent';
      else if (conversionRate >= 15 || conversions >= 3) performance = 'Good';
      else if (conversionRate >= 10 || conversions >= 1) performance = 'Average';

      return {
        id: person.id,
        name: `${person.firstName || ''} ${person.lastName || ''}`.trim() || person.username || 'Unknown',
        designation: person.designation || person.role?.replace('_', ' ') || 'Sales Team',
        freshCalls,
        followUps: totalFollowUps,
        deptVisits,
        partyVisits,
        conversions,
        totalSales,
        conversionRate,
        performance,
        leadsAssigned: totalLeads,
        emailsSent: emailFollowUps
      };
    });

    // Calculate summary metrics
    const totalFreshCalls = performanceMetrics.reduce((sum, p) => sum + p.freshCalls, 0);
    const totalFollowUps = performanceMetrics.reduce((sum, p) => sum + p.followUps, 0);
    const totalDeptVisits = performanceMetrics.reduce((sum, p) => sum + p.deptVisits, 0);
    const totalPartyVisits = performanceMetrics.reduce((sum, p) => sum + p.partyVisits, 0);
    const totalConversions = performanceMetrics.reduce((sum, p) => sum + p.conversions, 0);
    const avgConversionRate = performanceMetrics.length > 0 ? 
      performanceMetrics.reduce((sum, p) => sum + p.conversionRate, 0) / performanceMetrics.length : 0;
    const totalRevenue = performanceMetrics.reduce((sum, p) => sum + p.totalSales, 0);
    const avgRevenuePerLead = totalFreshCalls > 0 ? totalRevenue / totalFreshCalls : 0;
    const excellentPerformers = performanceMetrics.filter(p => p.performance === 'Excellent').length;

    return {
      summary: {
        activeSalesPersonnel: performanceMetrics.length,
        totalFreshCalls,
        totalFollowUps,
        totalDeptVisits,
        totalPartyVisits,
        totalConversions,
        avgConversionRate,
        avgRevenuePerLead,
        excellentPerformers,
        totalRevenue
      },
      performers: performanceMetrics
    };
  }, [leads, leadFollowUps, users, salesOrders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">Loading sales performance data...</div>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Report Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Sales Team Performance Dashboard</h1>
          <p className="text-indigo-100 text-base md:text-lg">Comprehensive Sales Activity Analysis & Team Metrics</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Badge className="bg-white/20 text-white px-4 py-1.5">
              <Calendar className="w-4 h-4 inline mr-2" />
              Report Date: {currentDate}
            </Badge>
            <Badge className="bg-green-500 text-white px-4 py-1.5">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Live Data
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Active Team</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{performanceData.summary.activeSalesPersonnel || 0}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <Users className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-medium">Conversion Rate</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{performanceData.summary.avgConversionRate?.toFixed(1) || 0}%</p>
              </div>
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs font-medium">Avg Revenue/Lead</p>
                <p className="text-xl md:text-2xl font-bold mt-1">₹{Math.floor(performanceData.summary.avgRevenuePerLead || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <IndianRupee className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Top Performers</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{performanceData.summary.excellentPerformers || 0}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <Award className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-xs font-medium">Total Conversions</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{performanceData.summary.totalConversions || 0}</p>
              </div>
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Metrics */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg py-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BarChart3 className="h-5 w-5" />
            Activity Metrics Summary
          </CardTitle>
          <CardDescription className="text-slate-300 text-sm">
            Team-wide activity tracking across all sales channels
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { value: performanceData.summary.totalFreshCalls || 0, label: 'Fresh Calls', icon: Phone, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
              { value: performanceData.summary.totalFollowUps || 0, label: 'Follow-ups', icon: RefreshCw, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
              { value: performanceData.summary.totalDeptVisits || 0, label: 'Dept Visits', icon: Building, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
              { value: performanceData.summary.totalPartyVisits || 0, label: 'Party Visits', icon: MapPin, color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
              { value: performanceData.summary.totalConversions || 0, label: 'Closed Deals', icon: Target, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
            ].map((item, index) => (
              <div key={index} className={`${item.bgColor} border ${item.borderColor} rounded-xl p-4 text-center transition-all hover:scale-105 hover:shadow-md`}>
                <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full ${item.bgColor} ${item.color} mb-2`}>
                  <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className={`text-2xl md:text-3xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Individual Performance Details
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Detailed breakdown of each team member's performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-700">Sales Person</th>
                  <th className="p-4 text-center font-semibold text-gray-700">Fresh Calls</th>
                  <th className="p-4 text-center font-semibold text-gray-700">Follow-ups</th>
                  <th className="p-4 text-center font-semibold text-gray-700">Dept Visits</th>
                  <th className="p-4 text-center font-semibold text-gray-700">Party Visits</th>
                  <th className="p-4 text-center font-semibold text-gray-700">Conversions</th>
                  <th className="p-4 text-center font-semibold text-gray-700">Conversion %</th>
                  <th className="p-4 text-center font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {performanceData.performers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 text-gray-300" />
                        <p className="text-lg font-medium">No sales personnel data available</p>
                        <p className="text-sm">Add users with sales roles to see performance metrics</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  performanceData.performers.map((person: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {person.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{person.name}</div>
                            <div className="text-sm text-gray-500">{person.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">{person.freshCalls}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">{person.followUps}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">{person.deptVisits}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-medium">{person.partyVisits}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold">{person.conversions}</span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                person.conversionRate >= 15 ? 'bg-green-500' :
                                person.conversionRate >= 10 ? 'bg-yellow-500' :
                                person.conversionRate >= 5 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(person.conversionRate * 3, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-gray-700">{person.conversionRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className={`px-3 py-1 font-medium ${
                          person.performance === 'Excellent' ? 'bg-green-100 text-green-800 border border-green-300' :
                          person.performance === 'Good' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                          person.performance === 'Average' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {person.performance === 'Excellent' && '⭐ '}
                          {person.performance}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 py-4">
        <p>Data refreshes automatically • Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

// Pending TA Requests Component
const PendingTARequests = ({ onBack }: { onBack: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [viewingRequest, setViewingRequest] = React.useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string>('');
  const [newStatus, setNewStatus] = React.useState<string>('');
  const [statusRemark, setStatusRemark] = React.useState<string>('');
  
  // Fetch real tour advance data
  const { data: tourAdvances = [], isLoading, error: tourError } = useQuery<any[]>({
    queryKey: ['/api/tour-advances'],
  });

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  // Handle view details
  const handleViewDetails = (requestId: string) => {
    const advance = tourAdvances.find(ta => ta.id === requestId);
    if (advance) {
      const employee = users.find(user => user.id === advance.employeeId);
      setViewingRequest({ ...advance, employee });
      setIsViewDialogOpen(true);
    }
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/tour-advances/${requestId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete TA request');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tour-advances'] });
      toast({
        title: "TA Request Deleted",
        description: "The TA request has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the TA request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle delete with confirmation
  const handleDelete = (requestId: string, employeeName: string) => {
    if (confirm(`Are you sure you want to delete the TA request for ${employeeName}?`)) {
      deleteMutation.mutate(requestId);
    }
  };

  // Status change mutation
  const statusChangeMutation = useMutation({
    mutationFn: async ({ requestId, status, remark }: { requestId: string; status: string; remark: string }) => {
      const response = await fetch(`/api/tour-advances/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          remark,
          updatedBy: user?.id,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tour-advances'] });
      toast({
        title: "Status Updated",
        description: "The TA request status has been updated successfully.",
      });
      setIsStatusDialogOpen(false);
      setStatusRemark('');
      setNewStatus('');
      setSelectedRequestId('');
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update the status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle status change
  const handleStatusChange = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsStatusDialogOpen(true);
  };

  // Submit status change
  const handleSubmitStatusChange = () => {
    if (!newStatus) {
      toast({
        title: "Missing Information",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }
    if (!statusRemark.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a remark for the status change",
        variant: "destructive",
      });
      return;
    }
    statusChangeMutation.mutate({
      requestId: selectedRequestId,
      status: newStatus,
      remark: statusRemark,
    });
  };

  // Process real tour advance data - ONLY show TA Request Form submissions
  const pendingRequests = useMemo(() => {
    console.log('🔍 ALL Tour Advances from API:', tourAdvances);
    console.log('🔍 Total Tour Advances Count:', tourAdvances.length);
    
    if (!tourAdvances.length) {
      console.log('⚠️ No tour advances found in database');
      return [];
    }

    // Log each tour advance to debug
    tourAdvances.forEach((advance, index) => {
      console.log(`📋 Tour Advance ${index + 1}:`, {
        id: advance.id,
        status: advance.status,
        employeeName: advance.employeeName,
        tourProgramme: advance.tourProgramme,
        mainDestination: advance.mainDestination,
        createdAt: advance.createdAt,
        allFields: Object.keys(advance)
      });
    });

    // Show ALL tour advances for now (remove filters to debug)
    const allRequests = tourAdvances.map(advance => {
      const employee = users.find(user => user.id === advance.employeeId);
      const fullName = employee ? `${employee.firstName} ${employee.lastName}` : advance.employeeName;
      
      return {
        id: advance.id,
        employeeName: fullName || 'Unknown Employee',
        employeeId: advance.employeeCode || employee?.employeeCode || 'N/A',
        department: employee?.department || advance.department || 'N/A',
        tourProgram: advance.tourProgramme || advance.mainDestination || 'Business Trip',
        requestAmount: `₹${(advance.advanceAmountRequested || 0).toLocaleString()}`,
        requestDate: new Date(advance.createdAt || Date.now()).toLocaleDateString(),
        status: advance.status || 'DRAFT',
        priority: (advance.advanceAmountRequested || 0) > 25000 ? 'High' : 
                 (advance.advanceAmountRequested || 0) > 15000 ? 'Medium' : 'Low',
        expectedTravelDate: new Date(advance.tourStartDate || Date.now()).toLocaleDateString()
      };
    });
    
    console.log('✅ Total Processed TA Requests:', allRequests.length);
    console.log('✅ Processed TA Request submissions:', allRequests);
    return allRequests;
  }, [tourAdvances, users]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const highPriority = pendingRequests.filter(req => req.priority === 'High').length;
    const mediumPriority = pendingRequests.filter(req => req.priority === 'Medium').length;
    const underReview = pendingRequests.filter(req => req.status === 'Under Review').length;
    const totalAmount = pendingRequests.reduce((sum, req) => 
      sum + parseInt(req.requestAmount.replace(/[₹,]/g, '')), 0);

    return {
      highPriority,
      mediumPriority,
      lowPriority: pendingRequests.length - highPriority - mediumPriority,
      underReview,
      totalAmount
    };
  }, [pendingRequests]);

  if (isLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading TA requests data...</div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      case 'RECOMMENDED': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PROCESSING': return 'bg-orange-100 text-orange-800';
      case 'SETTLED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'SUBMITTED': return 'Submitted';
      case 'RECOMMENDED': return 'Recommended';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'PROCESSING': return 'Processing for Settlement';
      case 'SETTLED': return 'Payment Settled';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Reports
      </Button>

      <div className="bg-slate-700 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-light text-center mb-2">Pending TA Requests</h2>
        <p className="text-center text-slate-300">Travel Advance Requests Awaiting Approval</p>
        <div className="text-center mt-4">
          <Badge className="bg-orange-600">Total Pending: {pendingRequests.length} Requests</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{summaryStats.highPriority}</div>
            <div className="text-sm opacity-90">High Priority</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{summaryStats.mediumPriority}</div>
            <div className="text-sm opacity-90">Medium Priority</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">₹{summaryStats.totalAmount.toLocaleString()}</div>
            <div className="text-sm opacity-90">Total Amount</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{summaryStats.underReview}</div>
            <div className="text-sm opacity-90">Under Review</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pending TA Requests Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <tr>
                  <th className="p-3 text-left">Request ID</th>
                  <th className="p-3 text-left">Employee Name</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Tour Program</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Request Date</th>
                  <th className="p-3 text-left">Travel Date</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <p className="text-lg font-medium">No TA Request Forms Found</p>
                        <p className="text-sm">Submit a TA Advance Request form and it will appear here</p>
                        <p className="text-xs text-gray-400 mt-2">Only showing forms submitted through "TA Advance Request"</p>
                      </div>
                    </td>
                  </tr>
                ) : pendingRequests.map((request, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{request.id}</td>
                    <td className="p-3">
                      <div>
                        <button
                          onClick={() => handleViewDetails(request.id)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                        >
                          {request.employeeName}
                        </button>
                        <div className="text-sm text-gray-500">{request.employeeId}</div>
                      </div>
                    </td>
                    <td className="p-3">{request.department}</td>
                    <td className="p-3">{request.tourProgram}</td>
                    <td className="p-3 font-semibold text-green-600">{request.requestAmount}</td>
                    <td className="p-3">{request.requestDate}</td>
                    <td className="p-3">{request.expectedTravelDate}</td>
                    <td className="p-3">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => handleStatusChange(request.id)}
                          disabled={request.status === 'SETTLED' || user?.role !== 'ADMIN'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Change Status
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(request.id, request.employeeName)}
                          disabled={deleteMutation.isPending || request.status === 'SETTLED'}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Travel Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Travel Advance Request Details</DialogTitle>
            <DialogDescription>
              Complete information about the travel request
            </DialogDescription>
          </DialogHeader>
          
          {viewingRequest && (
            <div className="space-y-6">
              {/* Employee Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base font-semibold">Employee Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Employee Name</label>
                    <p className="text-sm font-medium text-gray-900">{viewingRequest.employeeName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Employee ID</label>
                    <p className="text-sm font-medium text-gray-900">{viewingRequest.employeeCode || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Designation</label>
                    <p className="text-sm font-medium text-gray-900">{viewingRequest.designation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Department</label>
                    <p className="text-sm font-medium text-gray-900">{viewingRequest.department || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone Number</label>
                    <p className="text-sm font-medium text-gray-900">{viewingRequest.phoneNo || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Travel Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Plane className="h-4 w-4 text-purple-600" />
                  <h3 className="text-base font-semibold">Travel Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">From Date</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(viewingRequest.tourStartDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">To Date</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(viewingRequest.tourEndDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Number of Days</label>
                    <p className="text-sm font-medium text-gray-900">{viewingRequest.numberOfDays || 0} days</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">From (Departure)</label>
                    <p className="text-sm font-medium text-gray-900">{viewingRequest.departureLocation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">To (Destination)</label>
                    <p className="text-sm font-medium text-gray-900">{viewingRequest.mainDestination || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Mode of Travel</label>
                    <p className="text-sm font-medium text-gray-900">{viewingRequest.modeOfTravel || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Current Status</label>
                    <Badge className={getStatusColor(viewingRequest.status)}>
                      {getStatusLabel(viewingRequest.status)}
                    </Badge>
                  </div>
                </div>
                {viewingRequest.tourProgramme && (
                  <div>
                    <label className="text-sm text-gray-500">Tour Programme</label>
                    <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md mt-1">
                      {viewingRequest.tourProgramme}
                    </p>
                  </div>
                )}
              </div>

              {/* Financial Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Receipt className="h-4 w-4 text-green-600" />
                  <h3 className="text-base font-semibold">Financial Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Advance Requested</label>
                    <p className="text-lg font-bold text-green-600">
                      ₹{(viewingRequest.advanceAmountRequested || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Sanctioned Amount</label>
                    <p className="text-lg font-bold text-blue-600">
                      ₹{(viewingRequest.sanctionAmountApproved || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Request Date</label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(viewingRequest.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Priority</label>
                    <Badge className={getPriorityColor(
                      (viewingRequest.advanceAmountRequested || 0) > 25000 ? 'High' : 
                      (viewingRequest.advanceAmountRequested || 0) > 15000 ? 'Medium' : 'Low'
                    )}>
                      {(viewingRequest.advanceAmountRequested || 0) > 25000 ? 'High' : 
                       (viewingRequest.advanceAmountRequested || 0) > 15000 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {viewingRequest.statusHistory && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <h3 className="text-base font-semibold">Status Update History</h3>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {(() => {
                      try {
                        const history = JSON.parse(viewingRequest.statusHistory);
                        return history.length > 0 ? (
                          history.map((entry: any, index: number) => {
                            // Find the user who made this update
                            const updatedByUser = users.find(u => u.id === entry.updatedBy);
                            const updatedByName = updatedByUser 
                              ? `${updatedByUser.firstName} ${updatedByUser.lastName}`.trim()
                              : entry.updatedBy || 'System';
                            
                            return (
                              <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <Badge className={getStatusColor(entry.status)}>
                                      {getStatusLabel(entry.status)}
                                    </Badge>
                                    {entry.previousStatus && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        from {getStatusLabel(entry.previousStatus)}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(entry.updatedAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-1">
                                  <span className="font-medium">Remark:</span> {entry.remark}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Updated by: <span className="font-medium text-gray-700">{updatedByName}</span>
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No status updates yet</p>
                        );
                      } catch (e) {
                        return <p className="text-sm text-gray-500 text-center py-4">No status history available</p>;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                setViewingRequest(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Request Status</DialogTitle>
            <DialogDescription>
              Update the status of this TA request and provide a remark.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status *</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="RECOMMENDED">Recommended</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PROCESSING">Processing for Settlement (Pending from Accounts Team)</SelectItem>
                  <SelectItem value="SETTLED">Payment Settled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Remark *</label>
              <textarea
                className="w-full p-3 border rounded-md min-h-[100px] resize-none"
                placeholder="Enter remark for status change (required)"
                value={statusRemark}
                onChange={(e) => setStatusRemark(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                This remark will be recorded in the history with timestamp and your user ID.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusDialogOpen(false);
                setStatusRemark('');
                setNewStatus('');
                setSelectedRequestId('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitStatusChange}
              disabled={statusChangeMutation.isPending || !newStatus || !statusRemark.trim()}
            >
              {statusChangeMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main Reports Component
const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch real invoice data for overview cards
  const { data: salesInvoices = [], error: salesError } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/sales-invoices'],
  });

  const { data: purchaseInvoices = [], error: purchaseError } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/purchase-invoices'],
  });

  const { data: tourAdvances = [] } = useQuery<any[]>({
    queryKey: ['/api/tour-advances'],
  });

  // Debug: Log the data to see what we're getting
  React.useEffect(() => {
    console.log('📊 Sales Invoices Data:', salesInvoices);
    console.log('📊 Purchase Invoices Data:', purchaseInvoices);
    console.log('📊 Tour Advances Data:', tourAdvances);
    console.log('📊 Tour Advances Count:', tourAdvances.length);
    
    if (salesInvoices.length > 0) {
      console.log('📊 Sample Sales Invoice:', salesInvoices[0]);
      console.log('📊 Total Invoice Amount Field:', salesInvoices[0].totalInvoiceAmount);
    }
    if (purchaseInvoices.length > 0) {
      console.log('📊 Sample Purchase Invoice:', purchaseInvoices[0]);
      console.log('📊 Total Invoice Amount Field:', purchaseInvoices[0].totalInvoiceAmount);
    }
    if (tourAdvances.length > 0) {
      console.log('📊 Sample Tour Advance:', tourAdvances[0]);
      console.log('📊 All Tour Advance Fields:', Object.keys(tourAdvances[0]));
    }
  }, [salesInvoices, purchaseInvoices, tourAdvances]);

  // Calculate overview statistics from real data
  const overviewStats = useMemo(() => {
    console.log('🔢 Calculating stats with:', { 
      salesCount: salesInvoices.length, 
      purchaseCount: purchaseInvoices.length 
    });

    // Calculate total sales amount from invoices
    const totalSalesAmount = salesInvoices.reduce((sum, invoice) => {
      const amount = parseFloat(invoice.totalInvoiceAmount || '0');
      console.log('💰 Sales Invoice Amount:', amount, 'from', invoice.totalInvoiceAmount);
      return sum + amount;
    }, 0);
    
    // Calculate total purchase amount from invoices
    const totalPurchaseAmount = purchaseInvoices.reduce((sum, invoice) => {
      const amount = parseFloat(invoice.totalInvoiceAmount || '0');
      console.log('💰 Purchase Invoice Amount:', amount, 'from', invoice.totalInvoiceAmount);
      return sum + amount;
    }, 0);
    
    console.log('💵 Final Totals:', { totalSalesAmount, totalPurchaseAmount });
    
    const totalProfit = totalSalesAmount - totalPurchaseAmount;
    
    // Calculate a simple conversion rate (paid invoices vs total invoices)
    const paidInvoices = salesInvoices.filter(invoice => 
      invoice.paymentStatus && invoice.paymentStatus.toLowerCase() === 'paid'
    ).length;
    const conversionRate = salesInvoices.length > 0 ? 
      Math.round((paidInvoices / salesInvoices.length) * 100) : 0;
    
    // Calculate pending TA requests - check various statuses
    const pendingTARequests = tourAdvances.filter(ta => {
      const status = ta.status ? ta.status.toLowerCase() : '';
      console.log('✈️ TA Status:', status, 'for', ta.employeeName);
      return status === 'pending' || status === 'submitted' || status === 'draft';
    }).length;
    
    console.log('✈️ Tour Advances Data:', tourAdvances);
    console.log('✈️ Tour Advances Count:', tourAdvances.length);
    console.log('✈️ Pending TA Requests:', pendingTARequests);
    
    // Calculate total TA bills amount - using correct field name
    const totalTABills = tourAdvances.reduce((sum, ta) => {
      // Try multiple possible field names for advance amount
      const amount = parseFloat(
        ta.advanceAmountRequested || 
        ta.sanctionAmountApproved || 
        ta.advanceAmount || 
        '0'
      );
      console.log('✈️ TA Amount:', amount, 'from TA:', ta.employeeName);
      return sum + amount;
    }, 0);
    
    console.log('✈️ Total TA Bills:', totalTABills);
    
    return {
      totalSales: totalSalesAmount,
      totalPurchases: totalPurchaseAmount,
      totalProfit,
      salesCount: salesInvoices.length,
      purchaseCount: purchaseInvoices.length,
      conversionRate,
      pendingTARequests,
      totalTABills,
    };
  }, [salesInvoices, purchaseInvoices, tourAdvances]);

  if (activeTab === 'profit-calculator') {
    return <InvoiceWiseProfitCalculator onBack={() => setActiveTab('overview')} />;
  }

  if (activeTab === 'ta-advance') {
    return <TAAdvanceSheet onBack={() => setActiveTab('overview')} />;
  }

  if (activeTab === 'ta-bill') {
    return <TABillReport onBack={() => setActiveTab('overview')} />;
  }

  if (activeTab === 'sales-performance') {
    return <SalesPersonPerformanceReport onBack={() => setActiveTab('overview')} />;
  }

  if (activeTab === 'pending-requests') {
    return <PendingTARequests onBack={() => setActiveTab('overview')} />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive business intelligence and reporting dashboard</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="travel" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Travel & TA
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Sales Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Reports */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('profit-calculator')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Invoice Wise Profit Calculator
                </CardTitle>
                <CardDescription>Track profit margins and interest calculations for all invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">₹{overviewStats.totalProfit.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Current Month Profit</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sales Performance */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('sales-performance')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Sales Person Performance Report
                </CardTitle>
                <CardDescription>Detailed analysis of sales team performance and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{overviewStats.conversionRate}%</div>
                    <div className="text-sm text-gray-600">Avg Conversion Rate</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* TA Advance */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('ta-advance')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-purple-600" />
                  TA Advance Request
                </CardTitle>
                <CardDescription>Create and manage travel advance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div 
                    className="cursor-pointer hover:bg-orange-50 p-2 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('pending-requests');
                    }}
                  >
                    <div className="text-2xl font-bold text-orange-600">{overviewStats.pendingTARequests}</div>
                    <div className="text-sm text-gray-600 hover:text-orange-600">
                      Pending Requests 👆 Click to view
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('ta-advance');
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* TA Bill Report */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('ta-bill')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-indigo-600" />
                  TA Bill Reports
                </CardTitle>
                <CardDescription>Track travel expenses and bill submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">₹{overviewStats.totalTABills.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total TA Bills</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Statistics */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{overviewStats.totalSales.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Sales Value</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {overviewStats.salesCount}
                  </div>
                  <div className="text-sm text-gray-600">Total Sales Invoices</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {overviewStats.purchaseCount}
                  </div>
                  <div className="text-sm text-gray-600">Purchase Invoices</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{overviewStats.totalProfit.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Gross Profit</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('profit-calculator')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Invoice Wise Profit Calculator
                </CardTitle>
                <CardDescription>Track profit margins and interest calculations for all invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">₹{overviewStats.totalProfit.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Current Month Profit</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Monthly Financial Summary
                </CardTitle>
                <CardDescription>Overall financial performance and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">₹1,58,280</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="travel" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('ta-advance')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-purple-600" />
                  TA Advance Request
                </CardTitle>
                <CardDescription>Create and manage travel advance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div 
                    className="cursor-pointer hover:bg-orange-50 p-2 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('pending-requests');
                    }}
                  >
                    <div className="text-2xl font-bold text-orange-600">9</div>
                    <div className="text-sm text-gray-600 hover:text-orange-600">
                      Pending Requests 👆 Click to view
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('ta-advance');
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('ta-bill')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-indigo-600" />
                  TA Bill Reports
                </CardTitle>
                <CardDescription>Track travel expenses and bill submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">₹1,50,000</div>
                    <div className="text-sm text-gray-600">Total TA Bills</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('sales-performance')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Sales Person Performance Report
              </CardTitle>
              <CardDescription>Detailed analysis of sales team performance and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-gray-600">Active Sales Staff</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">10%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">300</div>
                  <div className="text-sm text-gray-600">Total Follow-ups</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">3</div>
                  <div className="text-sm text-gray-600">Top Performers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-600">485</div>
                  <div className="text-sm text-gray-600">Fresh Calls</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;