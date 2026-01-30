import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Edit2, Save, X, Filter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function PendingOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch pending orders data
  const { data: pendingOrders = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/pending-orders'],
  });

  // Filter state for all columns - enhanced
  const [filters, setFilters] = useState({
    salesOrderNo: '',
    customerName: '',
    invoiceNumbers: '',
    soQty: '',
    invoicedQty: '',
    remaining: '',
    totalAmount: '',
  });

  // Quick edit state for invoice numbers
  const [editingInvoice, setEditingInvoice] = useState<{ 
    rowIdx: number; 
    invoiceIdx: number; 
    value: string; 
    originalValue: string;
  } | null>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);

  // Mutation to update invoice number (for quick correction of old data)
  const updateInvoiceNumberMutation = useMutation({
    mutationFn: async ({ 
      salesOrderNumber, 
      oldInvoiceNumber, 
      newInvoiceNumber 
    }: { 
      salesOrderNumber: string; 
      oldInvoiceNumber: string; 
      newInvoiceNumber: string;
    }) => {
      const res = await fetch(`/api/sales-operations/update-invoice-number`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ salesOrderNumber, oldInvoiceNumber, newInvoiceNumber })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update invoice number');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: 'Success', 
        description: 'Invoice number updated successfully' 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/pending-orders'] });
      setEditingInvoice(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Enhanced filter logic - checks all filter fields
  const filteredOrders = useMemo(() => {
    return pendingOrders.filter((order: any) => {
      const matchSO = order.salesOrderNumber
        .toString()
        .toLowerCase()
        .includes(filters.salesOrderNo.toLowerCase());
      
      const matchCustomer = order.customerName
        .toLowerCase()
        .includes(filters.customerName.toLowerCase());
      
      const matchInvoices = order.invoiceNumbers
        .toLowerCase()
        .includes(filters.invoiceNumbers.toLowerCase());
      
      const matchSOQty = !filters.soQty || 
        order.totalSOQty.toFixed(2).includes(filters.soQty);
      
      const matchInvoicedQty = !filters.invoicedQty || 
        (order.totalInvoicedQty || 0).toFixed(2).includes(filters.invoicedQty);
      
      const matchRemaining = !filters.remaining || 
        order.totalPendingQty.toFixed(2).includes(filters.remaining);
      
      const matchAmount = !filters.totalAmount || 
        order.totalSalesAmount.toFixed(2).includes(filters.totalAmount);

      return matchSO && matchCustomer && matchInvoices && matchSOQty && 
             matchInvoicedQty && matchRemaining && matchAmount;
    });
  }, [pendingOrders, filters]);

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      salesOrderNo: '',
      customerName: '',
      invoiceNumbers: '',
      soQty: '',
      invoicedQty: '',
      remaining: '',
      totalAmount: '',
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  // Export to CSV with filtered data
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast({ title: 'Info', description: 'No data to export' });
      return;
    }

    const headers = [
      'Sales Order No',
      'Customer Name',
      'Invoice Numbers',
      'SO Qty',
      'Invoiced Qty',
      'Remaining Qty',
      'Total Sales Amount',
      'Total Invoice Amount'
    ];
    
    const data = filteredOrders.map((order: any) => [
      order.salesOrderNumber,
      order.customerName,
      order.invoiceNumbers,
      order.totalSOQty.toFixed(2),
      (order.totalInvoicedQty || 0).toFixed(2),
      order.totalPendingQty.toFixed(2),
      '₹' + order.totalSalesAmount.toFixed(2),
      '₹' + order.totalInvoicedAmount.toFixed(2)
    ]);

    const csv = [headers, ...data].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle saving invoice number correction
  const handleSaveInvoiceNumber = async () => {
    if (!editingInvoice) return;

    const order = filteredOrders[editingInvoice.rowIdx];
    const oldInvoiceNumber = order.invoiceNumbers.split(', ')[editingInvoice.invoiceIdx];

    if (editingInvoice.value === oldInvoiceNumber) {
      setEditingInvoice(null);
      return;
    }

    if (!editingInvoice.value.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Invoice number cannot be empty',
        variant: 'destructive'
      });
      return;
    }

    setSavingInvoice(true);
    await updateInvoiceNumberMutation.mutateAsync({
      salesOrderNumber: order.salesOrderNumber,
      oldInvoiceNumber: oldInvoiceNumber.trim(),
      newInvoiceNumber: editingInvoice.value.trim()
    });
    setSavingInvoice(false);
  };

  // Calculate totals
  const totals = filteredOrders.reduce(
    (acc: any, order: any) => ({
      soCount: acc.soCount + 1,
      pendingAmount: acc.pendingAmount + (order.totalSalesAmount - order.totalInvoicedAmount),
      totalPendingQty: acc.totalPendingQty + order.totalPendingQty,
    }),
    { soCount: 0, pendingAmount: 0, totalPendingQty: 0 }
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Orders</h1>
          <p className="text-gray-600 mt-1">Sales orders with remaining quantities not yet fully invoiced</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          variant="outline"
          className="gap-2"
          disabled={filteredOrders.length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Error loading pending orders. Please try again.
        </div>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Loading pending orders...</div>
          </CardContent>
        </Card>
      ) : pendingOrders.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No pending orders</p>
              <p className="text-sm mt-1">All sales orders have been fully invoiced</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales Orders</p>
                  <p className="text-2xl font-bold text-orange-600">{filteredOrders.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pending Qty</p>
                  <p className="text-2xl font-bold text-orange-600">{totals.totalPendingQty.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-orange-600">₹{totals.pendingAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-orange-600">{filteredOrders.filter((o: any) => o.totalPendingQty > 0).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Filter Inputs */}
          <Card className="border border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                </div>
                {hasActiveFilters && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {Object.values(filters).filter(v => v !== '').length} active
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Sales Order No</label>
                  <Input
                    placeholder="Search..."
                    value={filters.salesOrderNo}
                    onChange={(e) => setFilters({...filters, salesOrderNo: e.target.value})}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Customer</label>
                  <Input
                    placeholder="Search..."
                    value={filters.customerName}
                    onChange={(e) => setFilters({...filters, customerName: e.target.value})}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Invoice</label>
                  <Input
                    placeholder="Search..."
                    value={filters.invoiceNumbers}
                    onChange={(e) => setFilters({...filters, invoiceNumbers: e.target.value})}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">SO Qty</label>
                  <Input
                    placeholder="Search..."
                    value={filters.soQty}
                    onChange={(e) => setFilters({...filters, soQty: e.target.value})}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Invoiced Qty</label>
                  <Input
                    placeholder="Search..."
                    value={filters.invoicedQty}
                    onChange={(e) => setFilters({...filters, invoicedQty: e.target.value})}
                    className="text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Remaining Qty</label>
                  <Input
                    placeholder="Search..."
                    value={filters.remaining}
                    onChange={(e) => setFilters({...filters, remaining: e.target.value})}
                    className="text-sm h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                <div className="md:col-span-5"></div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Total Amount</label>
                  <Input
                    placeholder="Search..."
                    value={filters.totalAmount}
                    onChange={(e) => setFilters({...filters, totalAmount: e.target.value})}
                    className="text-sm h-8"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear All Filters
                  </Button>
                  <p className="text-xs text-gray-600 flex items-center">
                    Showing {filteredOrders.length} of {pendingOrders.length} orders
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Table with Quick Edit */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Orders Details ({filteredOrders.length})</CardTitle>
                <span className="text-xs text-gray-600">
                  Click invoice number to quickly edit/correct
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 border-b sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Sales Order No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Invoice Numbers</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">SO Qty</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Invoiced Qty</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Remaining</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Total SO Amount</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Invoice Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                          No orders match the selected filters
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order: any, rowIdx: number) => {
                        const isFullyInvoiced = order.totalPendingQty === 0;
                        const invoices = order.invoiceNumbers.split(', ');
                        
                        return (
                          <tr 
                            key={rowIdx} 
                            className={`border-b hover:bg-blue-50 transition-colors ${
                              isFullyInvoiced ? 'bg-green-50' : order.totalPendingQty > 0 ? 'bg-orange-50' : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-semibold text-blue-600">{order.salesOrderNumber}</td>
                            <td className="px-4 py-3 text-gray-700">{order.customerName}</td>
                            <td className="px-4 py-3 text-xs">
                              <div className="flex flex-wrap gap-1">
                                {invoices.map((inv: string, invIdx: number) => (
                                  <div key={invIdx} className="relative group">
                                    {editingInvoice?.rowIdx === rowIdx && editingInvoice?.invoiceIdx === invIdx ? (
                                      <div className="flex items-center gap-1 bg-white border-2 border-blue-500 rounded px-1 py-0.5">
                                        <Input
                                          autoFocus
                                          value={editingInvoice.value}
                                          onChange={(e) => setEditingInvoice({
                                            ...editingInvoice,
                                            value: e.target.value
                                          })}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveInvoiceNumber();
                                            if (e.key === 'Escape') setEditingInvoice(null);
                                          }}
                                          className="h-6 text-xs flex-1 p-1"
                                          placeholder="Enter new invoice number"
                                        />
                                        <button
                                          onClick={handleSaveInvoiceNumber}
                                          disabled={savingInvoice}
                                          className="text-green-600 hover:text-green-800 p-0.5"
                                          title="Save (Enter)"
                                        >
                                          <Save className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setEditingInvoice(null)}
                                          className="text-red-600 hover:text-red-800 p-0.5"
                                          title="Cancel (Esc)"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setEditingInvoice({
                                          rowIdx,
                                          invoiceIdx: invIdx,
                                          value: inv.trim(),
                                          originalValue: inv.trim()
                                        })}
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1 group relative"
                                        title="Click to edit invoice number"
                                      >
                                        <span>{inv}</span>
                                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">{order.totalSOQty.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{(order.totalInvoicedQty || 0).toFixed(2)}</td>
                            <td className={`px-4 py-3 text-right font-semibold ${
                              order.totalPendingQty > 0 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {order.totalPendingQty.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">₹{order.totalSalesAmount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-gray-700">₹{order.totalInvoicedAmount.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length > 0 && (
                <div className="mt-4 text-xs text-gray-600 flex items-center justify-between">
                  <span>Showing {filteredOrders.length} of {pendingOrders.length} orders</span>
                  {editingInvoice && (
                    <span className="text-blue-600 font-medium animate-pulse">
                      Editing invoice number... (Press Enter to save or Esc to cancel)
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
