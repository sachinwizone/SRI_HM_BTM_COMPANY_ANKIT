import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Download, Eye, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PurchaseLedger() {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [paymentSource, setPaymentSource] = useState<string>('CASH');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Fetch company profile
  const { data: companyProfile } = useQuery<any>({
    queryKey: ['/api/company-profile'],
    queryFn: async () => {
      const response = await fetch('/api/company-profile');
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Fetch all purchase invoices
  const { data: purchaseInvoices = [], isLoading: purchaseLoading } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/purchase-invoices'],
    queryFn: async () => {
      const response = await fetch('/api/sales-operations/purchase-invoices');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  // Fetch invoice payments
  const { data: invoicePayments = {} } = useQuery<any>({
    queryKey: ['purchase-invoice-payments', selectedSupplierId],
    queryFn: async () => {
      if (!selectedSupplierId) return {};
      
      const supplierInvoices = purchaseInvoices.filter(inv => inv.supplierId === selectedSupplierId || String(inv.supplierId) === selectedSupplierId);
      const paymentsMap: any = {};

      // Fetch payments for each invoice
      for (const invoice of supplierInvoices) {
        try {
          const response = await fetch(`/api/sales-operations/purchase-invoices/${invoice.id}/payments`);
          if (response.ok) {
            const payments = await response.json();
            paymentsMap[invoice.id] = Array.isArray(payments) ? payments : [];
          }
        } catch (error) {
          console.error(`Error fetching payments for purchase invoice ${invoice.id}:`, error);
          paymentsMap[invoice.id] = [];
        }
      }

      return paymentsMap;
    },
    enabled: !!selectedSupplierId && purchaseInvoices.length > 0,
    staleTime: 0,
  });

  // Mutation to record payment
  const recordPaymentMutation = useMutation({
    mutationFn: async (data: { invoiceId: string; amount: number; paymentDate: string; paymentMode: string; referenceNumber: string }) => {
      const response = await fetch('/api/sales-operations/purchase-invoices/record-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to record payment');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Payment recorded successfully!' });
      queryClient.invalidateQueries({ queryKey: ['purchase-invoice-payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/purchase-invoices'] });
      setPaymentAmount('');
      setSelectedInvoiceId('');
      setPaymentSource('CASH');
      setReferenceNumber('');
      setShowPaymentForm(false);
    },
    onError: () => {
      toast({ title: '❌ Failed to record payment', variant: 'destructive' });
    },
  });

  // Get unique suppliers
  const suppliers = useMemo(() => {
    const unique = new Map();
    purchaseInvoices.forEach(inv => {
      const supplierId = inv.supplierId || inv.supplier_id;
      if (supplierId && !unique.has(supplierId)) {
        unique.set(supplierId, {
          id: supplierId,
          name: inv.supplierName || inv.supplier_name || 'Unknown',
        });
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [purchaseInvoices]);

  // Get ledger entries for selected supplier
  const ledgerData = useMemo(() => {
    if (!selectedSupplierId) return null;

    const supplierInvoices = purchaseInvoices.filter(inv => 
      inv.supplierId === selectedSupplierId || String(inv.supplierId) === selectedSupplierId
    );
    const supplierName = supplierInvoices[0]?.supplierName || supplierInvoices[0]?.supplier_name || 'Unknown';

    // Create ledger entries - each invoice becomes a credit (we owe), and each payment becomes a debit (we paid)
    const entries: any[] = [];

    supplierInvoices.forEach(inv => {
      const invoiceAmount = parseFloat(inv.totalInvoiceAmount || inv.total_amount || 0);
      const invoiceDate = inv.invoiceDate || inv.invoice_date ? new Date(inv.invoiceDate || inv.invoice_date) : new Date(0);

      entries.push({
        id: `${inv.id}-invoice`,
        date: invoiceDate,
        invoiceNumber: inv.invoiceNumber || inv.invoice_number,
        description: `Purchase Invoice ${inv.invoiceNumber || inv.invoice_number}`,
        debit: 0,
        credit: invoiceAmount,
        type: 'invoice',
        invoiceId: inv.id,
      });

      // Add each individual payment as separate debit
      const payments = Array.isArray(invoicePayments[inv.id]) ? invoicePayments[inv.id] : [];
      if (payments && payments.length > 0) {
        payments.forEach((payment: any) => {
          const paymentAmt = parseFloat(payment.paymentAmount || payment.amount || 0);
          entries.push({
            id: payment.id,
            date: new Date(payment.paymentDate || payment.payment_date),
            invoiceNumber: inv.invoiceNumber || inv.invoice_number,
            description: `Payment made for ${inv.invoiceNumber || inv.invoice_number}`,
            debit: paymentAmt,
            credit: 0,
            type: 'payment',
            invoiceId: inv.id,
            paymentMode: payment.paymentMode || payment.payment_mode || null,
            referenceNumber: payment.referenceNumber || payment.reference_number || null,
          });
        });
      }
    });

    // Sort by date (chronological order - oldest to newest)
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance after sorting by date
    // For purchase: Credit = what we owe, Debit = what we paid
    // Balance = Credit - Debit (positive means we owe money)
    let balance = 0;
    entries.forEach(entry => {
      balance += (entry.credit - entry.debit);
      entry.runningBalance = balance;
    });

    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalBalance = totalCredit - totalDebit;
    const overdueAmount = supplierInvoices
      .filter(inv => inv.dueDate && new Date(inv.dueDate) < new Date() && (inv.paymentStatus !== 'PAID'))
      .reduce((sum, inv) => sum + (parseFloat(inv.totalInvoiceAmount || 0) - parseFloat(inv.paidAmount || 0)), 0);

    return {
      supplierId: selectedSupplierId,
      supplierName,
      totalCredit,
      totalDebit,
      totalBalance,
      overdueAmount,
      entries,
      overdueCount: supplierInvoices.filter(inv => inv.dueDate && new Date(inv.dueDate) < new Date() && (inv.paymentStatus !== 'PAID')).length,
    };
  }, [selectedSupplierId, purchaseInvoices, invoicePayments]);

  const handleExportCSV = () => {
    if (!ledgerData) {
      toast({ title: '❌ No data to export', variant: 'destructive' });
      return;
    }

    let csvContent = "Date,Invoice No,Description,Type,Debit (Payment),Credit (Invoice),Running Balance\n";
    
    ledgerData.entries.forEach(entry => {
      const date = format(entry.date, 'dd-MMM-yyyy');
      const debit = entry.debit > 0 ? entry.debit : '';
      const credit = entry.credit > 0 ? entry.credit : '';
      const balance = entry.runningBalance;
      csvContent += `"${date}","${entry.invoiceNumber}","${entry.description}","${entry.type}","${debit}","${credit}","${balance}"\n`;
    });

    csvContent += `"","TOTAL","","","${ledgerData.totalDebit}","${ledgerData.totalCredit}","${ledgerData.totalBalance}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${ledgerData.supplierName}-Purchase-Ledger-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: '✅ Ledger exported to CSV successfully!' });
  };

  const handleExportExcel = () => {
    if (!ledgerData) {
      toast({ title: '❌ No data to export', variant: 'destructive' });
      return;
    }

    const excelData = [
      [ledgerData.supplierName, '', '', '', '', '', ''],
      ['Purchase Ledger Report', '', '', '', '', '', ''],
      [format(new Date(), 'dd-MMM-yyyy'), '', '', '', '', '', ''],
      [],
      ['Date', 'Invoice No', 'Description', 'Type', 'Debit (Payment)', 'Credit (Invoice)', 'Running Balance'],
      ...ledgerData.entries.map(entry => [
        format(entry.date, 'dd-MMM-yyyy'),
        entry.invoiceNumber,
        entry.description,
        entry.type === 'invoice' ? 'Invoice' : 'Payment',
        entry.debit > 0 ? entry.debit : '',
        entry.credit > 0 ? entry.credit : '',
        entry.runningBalance,
      ]),
      [],
      ['TOTAL', '', '', '', ledgerData.totalDebit, ledgerData.totalCredit, ledgerData.totalBalance],
    ];

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    ws['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 30 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchase Ledger');
    XLSX.writeFile(wb, `${ledgerData.supplierName}-Purchase-Ledger-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({ title: '✅ Ledger exported to Excel successfully!' });
  };

  const handleExportPDF = () => {
    if (!ledgerData) {
      toast({ title: '❌ No data to export', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 8;
    let yPosition = 10;

    // Header
    const logoSize = 20;
    
    // Add company logo on LEFT
    try {
      // Use the company logo from public folder
      const logoPath = '/logo.jpg';
      doc.addImage(logoPath, 'JPEG', margin, yPosition, logoSize, logoSize);
    } catch (error) {
      console.log('Could not load company logo:', error);
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0);
    doc.text('M/S. SRI HM BITUMEN CO', pageWidth - margin - 2, yPosition + 2, { align: 'right' });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const detailsStartY = yPosition + 7;
    const rightX = pageWidth - margin - 2;
    
    doc.text('Dag No. 1071, Patta No. 264', rightX, detailsStartY, { align: 'right' });
    doc.text('C/O M/S. SRI HM BITUMEN CO, Mikirpara, Chakardaigaon', rightX, detailsStartY + 2.5, { align: 'right', maxWidth: 100 });
    doc.text('Mouza-Ramcharani, Guwahati, Kamrup Metropolitan, Assam, 781035', rightX, detailsStartY + 5, { align: 'right', maxWidth: 100 });
    doc.text('UDYAM: AS-03-0045787  |  Import-Export Code: CGMPP6536N', rightX, detailsStartY + 7.5, { align: 'right', maxWidth: 100 });
    doc.text('LEI CODE: 3358002WWBK6HVV37D19  |  GSTIN/UIN: 18CGMPP6536N2ZG', rightX, detailsStartY + 10, { align: 'right', maxWidth: 100 });
    doc.text('State Name: Assam, Code: 18  |  Contact: 8453059698', rightX, detailsStartY + 12.5, { align: 'right', maxWidth: 100 });

    yPosition = detailsStartY + 15;

    // Separator line
    doc.setDrawColor(0, 128, 0);
    doc.setLineWidth(2);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 3;

    // Title box
    const boxHeight = 10;
    const boxWidth = pageWidth - (margin * 2);
    const boxX = margin;
    const boxY = yPosition;

    doc.setFillColor(245, 245, 245);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.rect(boxX, boxY, boxWidth, boxHeight);

    doc.setDrawColor(0, 128, 0);
    doc.setLineWidth(3);
    doc.line(boxX, boxY, boxX, boxY + boxHeight);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Purchase Ledger Report', boxX + 3, boxY + 2.8);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(`Supplier: ${ledgerData.supplierName}  |  Generated on: ${format(new Date(), 'dd-MMM-yyyy HH:mm')}`, boxX + 3, boxY + 6.5);

    yPosition = boxY + boxHeight + 3;

    // Table data
    const tableData = ledgerData.entries.map(entry => [
      format(entry.date, 'dd-MMM-yyyy'),
      entry.invoiceNumber,
      entry.description.substring(0, 22),
      entry.type === 'invoice' ? 'Invoice' : 'Payment',
      entry.debit > 0 ? entry.debit.toFixed(2) : '-',
      entry.credit > 0 ? entry.credit.toFixed(2) : '-',
      entry.paymentMode || '-',
      entry.referenceNumber || '-',
      entry.runningBalance.toFixed(2),
    ]);

    tableData.push([
      '',
      '',
      'TOTAL',
      '',
      ledgerData.totalDebit.toFixed(2),
      ledgerData.totalCredit.toFixed(2),
      '',
      '',
      ledgerData.totalBalance.toFixed(2),
    ]);

    autoTable(doc, {
      head: [['Date', 'Invoice No', 'Description', 'Type', 'Debit', 'Credit', 'Source', 'Ref No', 'Balance']],
      body: tableData,
      startY: yPosition,
      margin: { left: margin, right: margin, bottom: 15 },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        textColor: [0, 0, 0],
        lineColor: [170, 170, 170],
        lineWidth: 0.4,
      },
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineColor: [34, 139, 34],
        lineWidth: 0.5,
      },
      bodyStyles: {
        lineColor: [170, 170, 170],
        lineWidth: 0.4,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 250],
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'left' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'right' },
      },
      didDrawPage: (data: any) => {
        const pageCount = doc.getNumberOfPages();
        const footerY = pageHeight - 8;
        
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110, 110, 110);
        doc.text('This is a computer-generated document and does not require a signature.', pageWidth / 2, footerY, { align: 'center' });
        doc.text('© 2026 M/S. SRI HM BITUMEN CO - All Rights Reserved', pageWidth / 2, footerY + 2, { align: 'center' });
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth / 2, footerY + 4, { align: 'center' });
      },
      willDrawCell: (data: any) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [235, 235, 235];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.lineColor = [140, 140, 140];
          data.cell.styles.lineWidth = 0.5;
        }
      },
    });

    doc.save(`${ledgerData.supplierName}-Purchase-Ledger-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: '✅ Ledger exported to PDF successfully!' });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Supplier Ledger</h1>
                <p className="text-sm text-gray-500">View all purchase invoices and payment history by supplier</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Supplier Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a supplier..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Ledger Content */}
        {ledgerData && (
          <>
            {/* Supplier Header */}
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-green-900">{ledgerData.supplierName}</CardTitle>
                <p className="text-sm text-green-700 mt-1">Supplier ID: {ledgerData.supplierId}</p>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Invoiced (We Owe)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(ledgerData.totalCredit)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(ledgerData.totalDebit)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Outstanding Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(ledgerData.totalBalance)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Overdue Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(ledgerData.overdueAmount)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Overdue Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{ledgerData.overdueCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            {!showPaymentForm && (
              <Button 
                onClick={() => setShowPaymentForm(true)}
                className="mb-6 bg-green-600 hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Record Payment</span>
              </Button>
            )}

            {showPaymentForm && (
              <Card className="mb-6 border-green-300 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">Record Payment to Supplier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Select Invoice</Label>
                      <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose invoice..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ledgerData?.entries
                            .filter(e => e.type === 'invoice')
                            .map(entry => {
                              const invoice = purchaseInvoices.find(inv => inv.id === entry.invoiceId);
                              const outstanding = parseFloat(invoice?.totalInvoiceAmount || 0) - parseFloat(invoice?.paidAmount || 0);
                              return (
                                <SelectItem key={entry.id} value={String(entry.invoiceId)}>
                                  {entry.invoiceNumber} (₹{outstanding.toFixed(2)} pending)
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Amount</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        className="border-green-300"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Date</Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="border-green-300"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Source</Label>
                      <Select value={paymentSource} onValueChange={setPaymentSource}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                          <SelectItem value="NEFT">NEFT</SelectItem>
                          <SelectItem value="RTGS">RTGS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Ref No</Label>
                      <Input
                        type="text"
                        placeholder="Cheque/Txn ID/Memo"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="border-green-300"
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <Button
                        onClick={() => {
                          if (!selectedInvoiceId || !paymentAmount) {
                            toast({ title: '⚠️ Please fill all fields' });
                            return;
                          }
                          recordPaymentMutation.mutate({
                            invoiceId: selectedInvoiceId,
                            amount: parseFloat(paymentAmount),
                            paymentDate,
                            paymentMode: paymentSource,
                            referenceNumber,
                          });
                        }}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={recordPaymentMutation.isPending}
                      >
                        {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPaymentForm(false);
                          setPaymentAmount('');
                          setSelectedInvoiceId('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ledger Table */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Complete Purchase Ledger</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{ledgerData.supplierName}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-2"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportCSV}>
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Export as CSV</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportExcel}>
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Export as Excel</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportPDF}>
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Export as PDF</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300 bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Debit (Payment)</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Credit (Invoice)</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Source</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ref No</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerData.entries.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            No transactions found for this supplier
                          </td>
                        </tr>
                      ) : (
                        <>
                          {ledgerData.entries.map((entry) => (
                            <tr
                              key={entry.id}
                              className={`border-b border-gray-200 hover:bg-gray-50 ${
                                entry.type === 'payment' ? 'bg-green-50' : ''
                              }`}
                            >
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {format(entry.date, 'dd MMM yyyy')}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold">
                                <span className="text-gray-700">{entry.invoiceNumber}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{entry.description}</td>
                              <td className="px-4 py-3 text-sm">
                                <Badge className={entry.type === 'payment' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                  {entry.type === 'payment' ? '💳 Payment' : '📄 Invoice'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                                {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                                {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-gray-600">
                                {entry.paymentMode ? (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {entry.paymentMode === 'CASH' ? 'Cash' :
                                     entry.paymentMode === 'CHEQUE' ? 'Cheque' :
                                     entry.paymentMode === 'UPI' ? 'UPI' :
                                     entry.paymentMode === 'BANK_TRANSFER' ? 'Bank Transfer' :
                                     entry.paymentMode === 'CREDIT_CARD' ? 'Credit Card' :
                                     entry.paymentMode === 'NEFT' ? 'NEFT' :
                                     entry.paymentMode === 'RTGS' ? 'RTGS' : entry.paymentMode}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-gray-600">
                                {entry.referenceNumber || '-'}
                              </td>
                              <td className={`px-4 py-3 text-sm text-right font-bold ${
                                entry.runningBalance > 0 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {formatCurrency(entry.runningBalance)}
                              </td>
                            </tr>
                          ))}
                          {/* Totals Row */}
                          <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
                            <td colSpan={4} className="px-4 py-3 text-sm">
                              TOTAL
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-green-600">
                              {formatCurrency(ledgerData.totalDebit)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-red-600">
                              {formatCurrency(ledgerData.totalCredit)}
                            </td>
                            <td colSpan={2} className="px-4 py-3 text-sm"></td>
                            <td className="px-4 py-3 text-sm text-right text-orange-600">
                              {formatCurrency(ledgerData.totalBalance)}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedSupplierId && !ledgerData && (
          <Card className="text-center py-12">
            <CardContent>
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Select a supplier to view their ledger</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
