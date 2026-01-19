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

export default function CompanyLedger() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
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

  // Fetch all invoices
  const { data: salesInvoices = [], isLoading: salesLoading } = useQuery<any[]>({
    queryKey: ['/api/sales-operations/sales-invoices'],
    queryFn: async () => {
      const response = await fetch('/api/sales-operations/sales-invoices');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  // Fetch invoice payments
  const { data: invoicePayments = {} } = useQuery<any>({
    queryKey: ['invoice-payments', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return {};
      
      const companyInvoices = salesInvoices.filter(inv => inv.customerId === selectedCustomerId);
      const paymentsMap: any = {};

      // Fetch payments for each invoice
      for (const invoice of companyInvoices) {
        try {
          const response = await fetch(`/api/sales-operations/invoices/${invoice.id}/payments`);
          if (response.ok) {
            const payments = await response.json();
            paymentsMap[invoice.id] = Array.isArray(payments) ? payments : [];
          }
        } catch (error) {
          console.error(`Error fetching payments for invoice ${invoice.id}:`, error);
          paymentsMap[invoice.id] = [];
        }
      }

      return paymentsMap;
    },
    enabled: !!selectedCustomerId && salesInvoices.length > 0,
    staleTime: 0, // Always refetch
  });

  // Mutation to record payment
  const recordPaymentMutation = useMutation({
    mutationFn: async (data: { invoiceId: string; amount: number; paymentDate: string; paymentMode: string; referenceNumber: string }) => {
      const response = await fetch('/api/sales-operations/record-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to record payment');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Payment recorded successfully!' });
      queryClient.invalidateQueries({ queryKey: ['invoice-payments'] });
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

  // Get unique companies/customers
  const companies = useMemo(() => {
    const unique = new Map();
    salesInvoices.forEach(inv => {
      if (inv.customerId && !unique.has(inv.customerId)) {
        unique.set(inv.customerId, {
          id: inv.customerId,
          name: inv.customerName || 'Unknown',
        });
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [salesInvoices]);

  // Get ledger entries for selected company
  const ledgerData = useMemo(() => {
    if (!selectedCustomerId) return null;

    const companyInvoices = salesInvoices.filter(inv => inv.customerId === selectedCustomerId);
    const customerName = companyInvoices[0]?.customerName || 'Unknown';

    // Create ledger entries - each invoice becomes a debit, and each payment becomes a separate credit
    const entries: any[] = [];

    companyInvoices.forEach(inv => {
      // Add invoice as debit (ensure it has a valid date)
      const invoiceAmount = parseFloat(inv.totalInvoiceAmount || 0);
      const invoiceDate = inv.invoiceDate ? new Date(inv.invoiceDate) : new Date(0); // Use epoch if no date

      entries.push({
        id: `${inv.id}-invoice`,
        date: invoiceDate,
        invoiceNumber: inv.invoiceNumber,
        description: `Invoice ${inv.invoiceNumber}`,
        debit: invoiceAmount,
        credit: 0,
        type: 'invoice',
        invoiceId: inv.id,
      });

      // Add each individual payment as separate credit
      const payments = Array.isArray(invoicePayments[inv.id]) ? invoicePayments[inv.id] : [];
      if (payments && payments.length > 0) {
        payments.forEach((payment: any) => {
          const paymentAmount = parseFloat(payment.paymentAmount || 0);
          entries.push({
            id: payment.id,
            date: new Date(payment.paymentDate),
            invoiceNumber: inv.invoiceNumber,
            description: `Payment received for ${inv.invoiceNumber}`,
            debit: 0,
            credit: paymentAmount,
            type: 'payment',
            invoiceId: inv.id,
            paymentMode: payment.paymentMode || null,
            referenceNumber: payment.referenceNumber || null,
          });
        });
      }
    });

    // Sort by date (chronological order - oldest to newest)
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance after sorting by date
    let balance = 0;
    entries.forEach(entry => {
      balance += (entry.debit - entry.credit);
      entry.runningBalance = balance;
    });

    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
    const totalBalance = totalDebit - totalCredit;
    const overdueAmount = companyInvoices
      .filter(inv => inv.dueDate && new Date(inv.dueDate) < new Date() && (inv.paymentStatus !== 'PAID'))
      .reduce((sum, inv) => sum + (parseFloat(inv.totalInvoiceAmount || 0) - parseFloat(inv.paidAmount || 0)), 0);

    return {
      customerId: selectedCustomerId,
      customerName,
      totalDebit,
      totalCredit,
      totalBalance,
      overdueAmount,
      entries,
      overdueCount: companyInvoices.filter(inv => inv.dueDate && new Date(inv.dueDate) < new Date() && (inv.paymentStatus !== 'PAID')).length,
    };
  }, [selectedCustomerId, salesInvoices, invoicePayments]);

  const handleExportCSV = () => {
    if (!ledgerData) {
      toast({ title: '❌ No data to export', variant: 'destructive' });
      return;
    }

    // Create CSV content
    let csvContent = "Date,Invoice No,Description,Type,Debit (Invoice),Credit (Payment),Running Balance\n";
    
    ledgerData.entries.forEach(entry => {
      const date = format(entry.date, 'dd-MMM-yyyy');
      const debit = entry.debit > 0 ? entry.debit : '';
      const credit = entry.credit > 0 ? entry.credit : '';
      const balance = entry.runningBalance;
      csvContent += `"${date}","${entry.invoiceNumber}","${entry.description}","${entry.type}","${debit}","${credit}","${balance}"\n`;
    });

    // Add totals row
    csvContent += `"","TOTAL","","","${ledgerData.totalDebit}","${ledgerData.totalCredit}","${ledgerData.totalBalance}"\n`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${ledgerData.customerName}-Ledger-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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

    // Prepare data for Excel
    const excelData = [
      [ledgerData.customerName, '', '', '', '', '', ''],
      ['Complete Ledger Report', '', '', '', '', '', ''],
      [format(new Date(), 'dd-MMM-yyyy'), '', '', '', '', '', ''],
      [],
      ['Date', 'Invoice No', 'Description', 'Type', 'Debit (Invoice)', 'Credit (Payment)', 'Running Balance'],
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

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
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
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
    XLSX.writeFile(wb, `${ledgerData.customerName}-Ledger-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({ title: '✅ Ledger exported to Excel successfully!' });
  };

  const handleExportPDF = () => {
    if (!ledgerData) {
      toast({ title: '❌ No data to export', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 8; // Reduced margin for better page usage
    let yPosition = 10;

    // ===== SECTION 1: HEADER WITH LOGO AND COMPANY INFO =====
    const logoSize = 20;
    
    // Add company logo on LEFT
    try {
      // Use the company logo from public folder
      const logoPath = '/logo.jpg';
      doc.addImage(logoPath, 'JPEG', margin, yPosition, logoSize, logoSize);
    } catch (error) {
      console.log('Could not load company logo:', error);
    }

    // Company name on RIGHT (RED, bold, larger)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(192, 0, 0);
    doc.text('M/S. SRI HM BITUMEN CO', pageWidth - margin - 2, yPosition + 2, { align: 'right' });

    // Company details - structured layout, right aligned
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const detailsStartY = yPosition + 7;
    const rightX = pageWidth - margin - 2;
    
    // Line 1: Dag No & Patta No
    doc.text('Dag No. 1071, Patta No. 264', rightX, detailsStartY, { align: 'right' });
    
    // Line 2: Address Part 1
    doc.text('C/O M/S. SRI HM BITUMEN CO, Mikirpara, Chakardaigaon', rightX, detailsStartY + 2.5, { align: 'right', maxWidth: 100 });
    
    // Line 3: Address Part 2
    doc.text('Mouza-Ramcharani, Guwahati, Kamrup Metropolitan, Assam, 781035', rightX, detailsStartY + 5, { align: 'right', maxWidth: 100 });
    
    // Line 4: UDYAM & IEC
    doc.text('UDYAM: AS-03-0045787  |  Import-Export Code: CGMPP6536N', rightX, detailsStartY + 7.5, { align: 'right', maxWidth: 100 });
    
    // Line 5: LEI & GST
    doc.text('LEI CODE: 3358002WWBK6HVV37D19  |  GSTIN/UIN: 18CGMPP6536N2ZG', rightX, detailsStartY + 10, { align: 'right', maxWidth: 100 });
    
    // Line 6: State & Contact
    doc.text('State Name: Assam, Code: 18  |  Contact: 8453059698', rightX, detailsStartY + 12.5, { align: 'right', maxWidth: 100 });

    yPosition = detailsStartY + 15;

    // ===== SECTION 2: RED SEPARATOR LINE =====
    doc.setDrawColor(192, 0, 0);
    doc.setLineWidth(2);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 3;

    // ===== SECTION 3: TITLE BOX WITH RED LEFT BORDER - FULL WIDTH =====
    const boxHeight = 10;
    const boxWidth = pageWidth - (margin * 2); // Full width minus margins
    const boxX = margin;
    const boxY = yPosition;

    // Light gray background
    doc.setFillColor(245, 245, 245);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');

    // Gray border
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.rect(boxX, boxY, boxWidth, boxHeight);

    // Red left border (thick)
    doc.setDrawColor(192, 0, 0);
    doc.setLineWidth(3);
    doc.line(boxX, boxY, boxX, boxY + boxHeight);

    // Title text - larger and bold
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Complete Ledger Report', boxX + 3, boxY + 2.8);

    // Customer and generation info - larger with better spacing
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(`Customer: ${ledgerData.customerName}  |  Generated on: ${format(new Date(), 'dd-MMM-yyyy HH:mm')}`, boxX + 3, boxY + 6.5);

    yPosition = boxY + boxHeight + 3;

    // ===== SECTION 4: PREPARE TABLE DATA =====
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

    // Add totals row
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

    // ===== SECTION 5: ADD TABLE - FULL WIDTH =====
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
        fillColor: [65, 130, 215],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineColor: [65, 130, 215],
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
        0: { halign: 'center' }, // Date
        1: { halign: 'center' }, // Invoice No
        2: { halign: 'left' },   // Description
        3: { halign: 'center' }, // Type
        4: { halign: 'right' },  // Debit
        5: { halign: 'right' },  // Credit
        6: { halign: 'center' }, // Source
        7: { halign: 'center' }, // Ref No
        8: { halign: 'right' },  // Balance
      },
      didDrawPage: (data: any) => {
        // Add page numbers and footer at bottom
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
        // Style totals row
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [235, 235, 235];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.lineColor = [140, 140, 140];
          data.cell.styles.lineWidth = 0.5;
        }
      },
    });

    doc.save(`${ledgerData.customerName}-Ledger-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({ title: '✅ Ledger exported to PDF successfully!' });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Customer Ledger</h1>
                <p className="text-sm text-gray-500">View all invoices and payment history by company</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Company Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Company</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a company..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Ledger Content */}
        {ledgerData && (
          <>
            {/* Customer Header */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-900">{ledgerData.customerName}</CardTitle>
                <p className="text-sm text-blue-700 mt-1">Customer ID: {ledgerData.customerId}</p>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Invoiced</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(ledgerData.totalDebit)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(ledgerData.totalCredit)}
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
                  <CardTitle className="text-green-900">Record Payment/Credit</CardTitle>
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
                              const invoice = salesInvoices.find(inv => inv.id === entry.invoiceId);
                              const outstanding = parseFloat(invoice?.totalInvoiceAmount || 0) - parseFloat(invoice?.paidAmount || 0);
                              return (
                                <SelectItem key={entry.id} value={entry.invoiceId}>
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
                  <CardTitle>Complete Ledger</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{ledgerData.customerName}</p>
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
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Debit (Invoice)</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Credit (Payment)</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Source</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ref No</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerData.entries.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            No transactions found for this company
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
                                {entry.type === 'invoice' ? (
                                  <a
                                    href={`/invoice-management?invoiceId=${entry.invoiceId}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {entry.invoiceNumber}
                                  </a>
                                ) : (
                                  <span className="text-gray-700">{entry.invoiceNumber}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{entry.description}</td>
                              <td className="px-4 py-3 text-sm">
                                <Badge className={entry.type === 'payment' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                  {entry.type === 'payment' ? '💳 Payment' : '📄 Invoice'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                                {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
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
                            <td colSpan={6} className="px-4 py-3 text-sm">
                              TOTAL
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

            {/* Overdue Invoices Alert */}
            {ledgerData.overdueCount > 0 && (
              <Card className="mt-6 border-red-300 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900">⚠️ Overdue Invoices ({ledgerData.overdueCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ledgerData.entries
                      .filter(e => e.isOverdue)
                      .map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                          <div>
                            <p className="font-semibold text-gray-900">{entry.invoiceNumber}</p>
                            <p className="text-sm text-gray-600">
                              Due: {entry.dueDate && format(entry.dueDate, 'dd MMM yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{formatCurrency(entry.balance)}</p>
                            <p className="text-xs text-gray-500">{entry.status}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!selectedCustomerId && !ledgerData && (
          <Card className="text-center py-12">
            <CardContent>
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Select a company to view their ledger</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
