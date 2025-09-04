import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PurchaseOrderForm } from "@/components/PurchaseOrderForm";
import { Plus, Package, Eye, Edit, Trash2, Calendar, DollarSign, FileText, Printer, Mail, MessageSquare, Download } from "lucide-react";
import type { PurchaseOrder, PurchaseOrderItem, InsertPurchaseOrder, InsertPurchaseOrderItem } from "@shared/schema";
import jsPDF from 'jspdf';

export default function PurchaseOrdersPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch purchase orders
  const { data: purchaseOrders, isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['/api/purchase-orders'],
  });

  // Fetch purchase order items for selected PO
  const { data: purchaseOrderItems, isLoading: itemsLoading } = useQuery<PurchaseOrderItem[]>({
    queryKey: [`/api/purchase-orders/${selectedPO?.id}/items`],
    enabled: !!selectedPO?.id,
  });

  // Create purchase order mutation
  const createMutation = useMutation({
    mutationFn: async (data: { purchaseOrder: InsertPurchaseOrder; items: InsertPurchaseOrderItem[] }) => {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create purchase order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      setShowForm(false);
      toast({ title: "Success", description: "Purchase order created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create purchase order", variant: "destructive" });
    }
  });

  // Update purchase order mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; purchaseOrder: InsertPurchaseOrder; items: InsertPurchaseOrderItem[] }) => {
      const response = await fetch(`/api/purchase-orders/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseOrder: data.purchaseOrder, items: data.items })
      });
      if (!response.ok) throw new Error('Failed to update purchase order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: [`/api/purchase-orders/${selectedPO?.id}/items`] });
      setShowEditForm(false);
      setShowDetails(false);
      toast({ title: "Success", description: "Purchase order updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update purchase order", variant: "destructive" });
    }
  });

  // Delete purchase order mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/purchase-orders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete purchase order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({ title: "Success", description: "Purchase order deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete purchase order", variant: "destructive" });
    }
  });

  // Status change mutation
  const statusChangeMutation = useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      const response = await fetch(`/api/purchase-orders/${data.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: data.status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({ title: "Success", description: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'OPEN': return 'secondary';
      case 'APPROVED': return 'default';
      case 'PARTIALLY_RECEIVED': return 'outline';
      case 'CLOSED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: string | number, currency: string = 'INR') => {
    // Convert to number first
    let num: number;
    if (typeof amount === 'string') {
      // Remove any quotes or non-numeric characters except decimal point and negative sign
      const cleanStr = amount.replace(/['"]/g, '').replace(/[^0-9.-]/g, '');
      num = parseFloat(cleanStr) || 0;
    } else {
      num = amount || 0;
    }
    
    if (isNaN(num)) {
      return currency === 'INR' ? 'Rs 0.00' : `${currency} 0.00`;
    }
    
    // Format to 2 decimal places
    const formatted = num.toFixed(2);
    const [integerPart, decimalPart] = formatted.split('.');
    
    // Add Indian-style comma separators
    let result = integerPart;
    if (integerPart.length > 3) {
      const lastThree = integerPart.slice(-3);
      const remaining = integerPart.slice(0, -3);
      result = remaining.replace(/(\d)(?=(\d{2})+$)/g, '$1,') + ',' + lastThree;
    }
    
    return currency === 'INR' ? `Rs ${result}.${decimalPart}` : `${currency} ${result}.${decimalPart}`;
  };

  // Professional PDF generation function
  const generatePDF = (po: PurchaseOrder, items: PurchaseOrderItem[] = []) => {
    const doc = new jsPDF();
    
    // Page margins
    const leftMargin = 20;
    const rightMargin = 190;
    const pageWidth = 210;
    
    // Header Section with Company Branding
    doc.setFillColor(41, 128, 185); // Blue header
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text('PURCHASE ORDER', leftMargin, 25);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // PO Header Information
    let yPos = 50;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`PO Number: ${po.poNumber}`, leftMargin, yPos);
    doc.text(`Date: ${formatDate(po.poDate)}`, 120, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Status: ${po.status}`, leftMargin, yPos);
    if (po.revisionNumber && po.revisionNumber > 0) {
      doc.text(`Revision: ${po.revisionNumber}`, 120, yPos);
    }
    
    // Vendor Information Box
    yPos += 20;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.rect(leftMargin, yPos, 80, 40); // Vendor box
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text('VENDOR', leftMargin + 2, yPos + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let vendorY = yPos + 15;
    doc.text(po.supplierName, leftMargin + 2, vendorY);
    if (po.supplierContactPerson) {
      vendorY += 5;
      doc.text(`Contact: ${po.supplierContactPerson}`, leftMargin + 2, vendorY);
    }
    if (po.supplierEmail) {
      vendorY += 5;
      doc.text(`Email: ${po.supplierEmail}`, leftMargin + 2, vendorY);
    }
    if (po.supplierPhone) {
      vendorY += 5;
      doc.text(`Phone: ${po.supplierPhone}`, leftMargin + 2, vendorY);
    }
    
    // Buyer Information Box
    doc.rect(110, yPos, 80, 40); // Buyer box
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text('BUYER', 112, yPos + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let buyerY = yPos + 15;
    doc.text(po.buyerName, 112, buyerY);
    if (po.department) {
      buyerY += 5;
      doc.text(`Department: ${po.department}`, 112, buyerY);
    }
    if (po.costCenter) {
      buyerY += 5;
      doc.text(`Cost Center: ${po.costCenter}`, 112, buyerY);
    }
    if (po.approverName) {
      buyerY += 5;
      doc.text(`Approver: ${po.approverName}`, 112, buyerY);
    }
    
    // Line Items Table
    yPos += 55;
    
    // Table Header with better styling - increased width for Total column
    const tableWidth = 210; // Further increased to accommodate full currency values
    doc.setFillColor(52, 73, 94); // Dark blue header
    doc.rect(leftMargin, yPos, tableWidth, 10, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(leftMargin, yPos, tableWidth, 10);
    
    doc.setTextColor(255, 255, 255); // White text for header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text('Item Code', leftMargin + 2, yPos + 7);
    doc.text('Description', leftMargin + 35, yPos + 7);
    doc.text('Qty', leftMargin + 88, yPos + 7);
    doc.text('Unit', leftMargin + 105, yPos + 7);
    doc.text('Unit Price', leftMargin + 125, yPos + 7);
    doc.text('Total', leftMargin + 170, yPos + 7); // Moved further right
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Table vertical lines - adjusted positions for wider table
    doc.line(leftMargin + 33, yPos, leftMargin + 33, yPos + 10);
    doc.line(leftMargin + 83, yPos, leftMargin + 83, yPos + 10);
    doc.line(leftMargin + 103, yPos, leftMargin + 103, yPos + 10);
    doc.line(leftMargin + 123, yPos, leftMargin + 123, yPos + 10);
    doc.line(leftMargin + 160, yPos, leftMargin + 160, yPos + 10); // Moved further right
    
    yPos += 10;
    
    // Table Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    let totalAmount = 0;
    
    if (items && items.length > 0) {
      items.forEach((item, index) => {
        const rowHeight = 8;
        
        // Alternate row background
        if (index % 2 === 1) {
          doc.setFillColor(248, 248, 248);
          doc.rect(leftMargin, yPos, 210, rowHeight, 'F'); // Further increased width
        }
        
        // Row border
        doc.setDrawColor(200, 200, 200);
        doc.rect(leftMargin, yPos, 210, rowHeight); // Further increased width
        
        // Cell data with proper alignment
        doc.setTextColor(0, 0, 0);
        doc.text(item.itemCode || '-', leftMargin + 2, yPos + 5);
        doc.text((item.itemDescription || '-').substring(0, 25), leftMargin + 35, yPos + 5);
        
        // Right-align numbers
        const qty = (item.quantityOrdered?.toString() || '0');
        const qtyWidth = doc.getTextWidth(qty);
        doc.text(qty, leftMargin + 100 - qtyWidth, yPos + 5);
        
        doc.text(item.unitOfMeasure || '-', leftMargin + 105, yPos + 5);
        
        const unitPrice = formatCurrency(item.unitPrice || 0, po.currency);
        const unitPriceWidth = doc.getTextWidth(unitPrice);
        doc.text(unitPrice, leftMargin + 157 - unitPriceWidth, yPos + 5); // Adjusted for wider table
        
        const total = formatCurrency(item.totalLineValue || 0, po.currency);
        const totalWidth = doc.getTextWidth(total);
        doc.text(total, leftMargin + 207 - totalWidth, yPos + 5); // Positioned within page bounds
        
        // Vertical lines - adjusted positions for wider table
        doc.line(leftMargin + 33, yPos, leftMargin + 33, yPos + rowHeight);
        doc.line(leftMargin + 83, yPos, leftMargin + 83, yPos + rowHeight);
        doc.line(leftMargin + 103, yPos, leftMargin + 103, yPos + rowHeight);
        doc.line(leftMargin + 123, yPos, leftMargin + 123, yPos + rowHeight);
        doc.line(leftMargin + 160, yPos, leftMargin + 160, yPos + rowHeight); // Moved further right
        
        totalAmount += parseFloat(item.totalLineValue?.toString() || '0');
        yPos += rowHeight;
      });
    } else {
      // Show "No items" row
      doc.setFillColor(248, 248, 248);
      doc.rect(leftMargin, yPos, 210, 8, 'F'); // Further increased width
      doc.setDrawColor(200, 200, 200);
      doc.rect(leftMargin, yPos, 210, 8); // Further increased width
      doc.text('No line items found', leftMargin + 95, yPos + 5); // Adjusted center position for wider table
      yPos += 8;
    }
    
    // Summary Section
    yPos += 15;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    
    // Summary box - make it wider to accommodate larger amounts
    const summaryBoxX = 120;
    const summaryBoxWidth = 80;
    const summaryBoxHeight = 30;
    doc.rect(summaryBoxX, yPos, summaryBoxWidth, summaryBoxHeight);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text('Order Summary', summaryBoxX + 2, yPos + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    yPos += 15;
    if (po.discountAmount && parseFloat(po.discountAmount.toString()) > 0) {
      doc.text('Discount:', summaryBoxX + 2, yPos);
      const discountText = formatCurrency(po.discountAmount, po.currency);
      const discountWidth = doc.getTextWidth(discountText);
      doc.text(discountText, summaryBoxX + summaryBoxWidth - discountWidth - 2, yPos);
      yPos += 5;
    }
    
    if (po.taxAmount && parseFloat(po.taxAmount.toString()) > 0) {
      doc.text('Tax:', summaryBoxX + 2, yPos);
      const taxText = formatCurrency(po.taxAmount, po.currency);
      const taxWidth = doc.getTextWidth(taxText);
      doc.text(taxText, summaryBoxX + summaryBoxWidth - taxWidth - 2, yPos);
      yPos += 5;
    }
    
    doc.setFont("helvetica", "bold");
    doc.text('Total Amount:', summaryBoxX + 2, yPos);
    const totalText = formatCurrency(po.totalAmount, po.currency);
    const totalWidth = doc.getTextWidth(totalText);
    doc.text(totalText, summaryBoxX + summaryBoxWidth - totalWidth - 2, yPos);
    
    // Footer
    yPos = 270;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer generated document and does not require signature.', leftMargin, yPos);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, leftMargin, yPos + 5);
    
    return doc;
  };

  // Generate and download PDF
  const handleDownloadPDF = () => {
    if (!selectedPO) return;
    const doc = generatePDF(selectedPO, purchaseOrderItems);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    doc.save(`PO_${selectedPO.poNumber}_${timestamp}.pdf`);
    toast({ title: "Success", description: "PDF downloaded successfully" });
  };

  // Print function
  const handlePrint = () => {
    if (!selectedPO) return;
    const doc = generatePDF(selectedPO, purchaseOrderItems);
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfURL, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    toast({ title: "Success", description: "Opening print dialog" });
  };

  // Email function
  const handleSendEmail = async () => {
    if (!selectedPO || !selectedPO.supplierEmail) {
      toast({ title: "Error", description: "Supplier email is required", variant: "destructive" });
      return;
    }
    
    setIsEmailSending(true);
    try {
      const doc = generatePDF(selectedPO, purchaseOrderItems);
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      
      const response = await fetch('/api/purchase-orders/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseOrderId: selectedPO.id,
          recipientEmail: selectedPO.supplierEmail,
          pdfData: pdfBase64
        })
      });
      
      if (!response.ok) throw new Error('Failed to send email');
      
      toast({ title: "Success", description: "Email sent successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
    } finally {
      setIsEmailSending(false);
    }
  };

  // WhatsApp sharing function
  const handleWhatsAppShare = () => {
    if (!selectedPO) return;
    const doc = generatePDF(selectedPO, purchaseOrderItems);
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);
    
    // Create download link and trigger download first
    const link = document.createElement('a');
    link.href = pdfURL;
    link.download = `PO_${selectedPO.poNumber}.pdf`;
    link.click();
    
    // Open WhatsApp with message
    const message = `Purchase Order ${selectedPO.poNumber} - Total: ${formatCurrency(selectedPO.totalAmount, selectedPO.currency)}. Please find the PDF attachment.`;
    const whatsappURL = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    
    toast({ title: "Success", description: "PDF downloaded. WhatsApp opened for sharing." });
  };

  return (
    <div className="space-y-6" data-testid="purchase-orders-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and supplier procurement
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="button-add-purchase-order">
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      {/* Purchase Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Purchase Orders</span>
          </CardTitle>
          <CardDescription>Track and manage all purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading purchase orders...</p>
            </div>
          ) : !purchaseOrders || purchaseOrders.length === 0 ? (
            <div className="text-center py-8" data-testid="purchase-orders-empty">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Purchase Orders Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first purchase order to get started
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors" data-testid={`card-purchase-order-${po.id}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <button
                          onClick={() => {
                            setSelectedPO(po);
                            setShowDetails(true);
                          }}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                          data-testid={`link-po-number-${po.id}`}
                        >
                          {po.poNumber}
                        </button>
                        <Badge variant={getStatusBadgeVariant(po.status)}>
                          {po.status.replace('_', ' ')}
                        </Badge>
                        {po.revisionNumber && po.revisionNumber > 0 && (
                          <Badge variant="outline">Rev. {po.revisionNumber}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Supplier</p>
                          <p>{po.supplierName}</p>
                        </div>
                        <div>
                          <p className="font-medium">PO Date</p>
                          <p>{formatDate(po.poDate)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Buyer</p>
                          <p>{po.buyerName}</p>
                        </div>
                        <div>
                          <p className="font-medium">Total Amount</p>
                          <p className="font-semibold text-lg">
                            {formatCurrency(po.totalAmount, po.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPO(po);
                          setShowDetails(true);
                        }}
                        data-testid={`button-view-po-${po.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPO(po);
                          setShowEditForm(true);
                        }}
                        data-testid={`button-edit-po-${po.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      {/* Status Change Quick Actions */}
                      {po.status === 'OPEN' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => statusChangeMutation.mutate({ id: po.id, status: 'APPROVED' })}
                          disabled={statusChangeMutation.isPending}
                          data-testid={`button-approve-po-${po.id}`}
                        >
                          Approve
                        </Button>
                      )}
                      
                      {po.status === 'APPROVED' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => statusChangeMutation.mutate({ id: po.id, status: 'CLOSED' })}
                          disabled={statusChangeMutation.isPending}
                          data-testid={`button-close-po-${po.id}`}
                        >
                          Close
                        </Button>
                      )}
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(po.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-po-${po.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Purchase Order Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Purchase Order</DialogTitle>
            <DialogDescription>
              Fill in the details to create a comprehensive purchase order
            </DialogDescription>
          </DialogHeader>
          <PurchaseOrderForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Purchase Order Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Purchase Order Details - {selectedPO?.poNumber}</span>
            </DialogTitle>
            <DialogDescription>
              Complete purchase order information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPO && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Purchase Order Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">PO Number</label>
                    <p className="text-sm">{selectedPO.poNumber}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">PO Date</label>
                    <p className="text-sm">{formatDate(selectedPO.poDate)}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Status</label>
                    <p className="text-sm">
                      <Badge variant={getStatusBadgeVariant(selectedPO.status)}>
                        {selectedPO.status.replace('_', ' ')}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Revision Number</label>
                    <p className="text-sm">{selectedPO.revisionNumber || 0}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Currency</label>
                    <p className="text-sm">{selectedPO.currency}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Total Amount</label>
                    <p className="text-lg font-semibold">
                      {formatCurrency(selectedPO.totalAmount, selectedPO.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supplier Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Supplier Name</label>
                    <p className="text-sm">{selectedPO.supplierName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Contact Person</label>
                    <p className="text-sm">{selectedPO.supplierContactPerson || '-'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Email</label>
                    <p className="text-sm">{selectedPO.supplierEmail || '-'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Phone</label>
                    <p className="text-sm">{selectedPO.supplierPhone || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Buyer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Buyer Name</label>
                    <p className="text-sm">{selectedPO.buyerName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Department</label>
                    <p className="text-sm">{selectedPO.department || '-'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Cost Center</label>
                    <p className="text-sm">{selectedPO.costCenter || '-'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Approver</label>
                    <p className="text-sm">{selectedPO.approverName || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {itemsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                      <span className="ml-2 text-sm text-muted-foreground">Loading line items...</span>
                    </div>
                  ) : !purchaseOrderItems || purchaseOrderItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No line items found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Item Code</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Description</th>
                            <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">Quantity</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Unit</th>
                            <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">Unit Price</th>
                            <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseOrderItems.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 px-4 py-2 text-sm">{item.itemCode}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm">{item.itemDescription}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-right">{item.quantityOrdered}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm">{item.unitOfMeasure}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-right">
                                {formatCurrency(item.unitPrice || 0, selectedPO.currency)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-right font-medium">
                                {formatCurrency(item.totalLineValue || 0, selectedPO.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => {
                        setShowDetails(false);
                        setShowEditForm(true);
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                      data-testid="button-edit-po-details"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Purchase Order
                    </Button>
                    
                    <Button 
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2"
                      data-testid="button-download-pdf"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                    
                    <Button 
                      onClick={handlePrint}
                      variant="outline"
                      className="flex items-center gap-2"
                      data-testid="button-print-po"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    
                    <Button 
                      onClick={handleSendEmail}
                      disabled={isEmailSending || !selectedPO.supplierEmail}
                      variant="outline"
                      className="flex items-center gap-2"
                      data-testid="button-send-email"
                    >
                      <Mail className="h-4 w-4" />
                      {isEmailSending ? "Sending..." : "Send Email"}
                    </Button>
                    
                    <Button 
                      onClick={handleWhatsAppShare}
                      variant="outline"
                      className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700"
                      data-testid="button-whatsapp-share"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Share on WhatsApp
                    </Button>
                  </div>
                  
                  {!selectedPO.supplierEmail && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Email button disabled - no supplier email address
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              {(selectedPO.deliveryDate || selectedPO.deliveryAddress || selectedPO.notes || selectedPO.terms) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPO.deliveryDate && (
                      <div>
                        <label className="font-medium text-sm text-muted-foreground">Expected Delivery Date</label>
                        <p className="text-sm">{formatDate(selectedPO.deliveryDate)}</p>
                      </div>
                    )}
                    {selectedPO.deliveryAddress && (
                      <div>
                        <label className="font-medium text-sm text-muted-foreground">Delivery Address</label>
                        <p className="text-sm">{selectedPO.deliveryAddress}</p>
                      </div>
                    )}
                    {selectedPO.terms && (
                      <div>
                        <label className="font-medium text-sm text-muted-foreground">Terms & Conditions</label>
                        <p className="text-sm">{selectedPO.terms}</p>
                      </div>
                    )}
                    {selectedPO.notes && (
                      <div>
                        <label className="font-medium text-sm text-muted-foreground">Internal Notes</label>
                        <p className="text-sm">{selectedPO.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Purchase Order Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order - {selectedPO?.poNumber}</DialogTitle>
            <DialogDescription>
              Update the purchase order details and line items
            </DialogDescription>
          </DialogHeader>
          {selectedPO && (
            <PurchaseOrderForm
              onSubmit={(data) => updateMutation.mutate({ 
                id: selectedPO.id, 
                purchaseOrder: data.purchaseOrder, 
                items: data.items 
              })}
              onCancel={() => setShowEditForm(false)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}