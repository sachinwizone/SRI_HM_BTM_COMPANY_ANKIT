import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Search, CalendarDays, FileCheck, Save, X, Package, Truck, BarChart3, Calculator, Download, Printer } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SalesDashboard } from "@/components/analytics/sales-dashboard";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Hooks and Utils
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSalesSchema, type Sales, type InsertSales, type User, type Client, type Product, type Transporter, type ProductMaster, type CompanyProfile } from "@shared/schema";

const statusColors = {
  RECEIVING: "bg-orange-100 text-orange-800",
  OK: "bg-blue-100 text-blue-800", 
  APPROVED: "bg-green-100 text-green-800",
  DELIVERED: "bg-purple-100 text-purple-800"
};

// Billing format schema with line items
const billingFormSchema = z.object({
  // Basic Information
  date: z.string().min(1, "Date is required"),
  salesOrderNumber: z.string().min(1, "Sales Order Number is required"),
  invoiceNumber: z.string().min(1, "Invoice Number is required"),
  clientId: z.string().min(1, "Client is required"),
  salespersonId: z.string().optional(),
  deliveryStatus: z.enum(['RECEIVING', 'OK', 'APPROVED', 'DELIVERED']).default('RECEIVING'),
  
  // Transport Details (optional for billing)
  vehicleNumber: z.string().optional(),
  location: z.string().optional(),
  transporterId: z.string().optional(),
  transporterContactNumber: z.string().optional(),
  
  // Financial Information
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  
  // Billing Line Items
  items: z.array(z.object({
    productMasterId: z.string().optional(),
    itemCode: z.string().min(1, "Item code is required"),
    itemDescription: z.string().min(1, "Item description is required"),
    productFamily: z.string().optional(),
    productGrade: z.string().optional(),
    hsnCode: z.string().optional(),
    quantity: z.number().min(0, "Quantity cannot be negative"),
    unit: z.string().min(1, "Unit is required"),
    unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
  })).min(1, "At least one item is required")
});

type BillingFormData = z.infer<typeof billingFormSchema>;

export default function Sales() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<Sales | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isTransporterDialogOpen, setIsTransporterDialogOpen] = useState(false);
  const [newTransporterName, setNewTransporterName] = useState("");
  const [newTransporterContactNumber, setNewTransporterContactNumber] = useState("");
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data Fetching
  const { data: salesData = [], isLoading } = useQuery<Sales[]>({
    queryKey: ["/api/sales"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch Product Master for billing format
  const { data: productMasters = [] } = useQuery<ProductMaster[]>({
    queryKey: ["/api/product-master"],
  });

  const { data: transporters = [] } = useQuery<Transporter[]>({
    queryKey: ["/api/transporters"],
  });

  // Fetch Company Profile for PDF generation
  const { data: companyProfile } = useQuery<CompanyProfile>({
    queryKey: ["/api/company-profile"],
  });

  // Create Transporter Mutation
  const createTransporterMutation = useMutation({
    mutationFn: async (data: { name: string; contactNumber: string }) => {
      return await apiRequest("/api/transporters", "POST", data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transporters"] });
      setIsTransporterDialogOpen(false);
      setNewTransporterName("");
      setNewTransporterContactNumber("");
      toast({
        title: "Success",
        description: "Transporter created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form Setup - Updated for billing format
  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      salesOrderNumber: "",
      invoiceNumber: "",
      clientId: "",
      salespersonId: "",
      deliveryStatus: "RECEIVING",
      vehicleNumber: "",
      location: "",
      transporterId: "",
      transporterContactNumber: "",
      taxAmount: 0,
      discountAmount: 0,
      items: [{
        productMasterId: "",
        itemCode: "",
        itemDescription: "",
        productFamily: "",
        productGrade: "",
        hsnCode: "",
        quantity: 0,
        unit: "PCS",
        unitPrice: 0
      }]
    },
  });

  // Field array for managing billing items
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // Watch items for calculations
  const watchedItems = form.watch("items");

  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);
  
  const taxAmount = parseFloat(form.watch("taxAmount")?.toString() || '0') || 0;
  const discountAmount = parseFloat(form.watch("discountAmount")?.toString() || '0') || 0;
  const totalAmount = subtotal + taxAmount - discountAmount;

  // Preview PDF Function
  const previewPDF = (salesData: any, isFormData = false) => {
    const doc = generatePDFDocument(salesData, isFormData);
    const pdfOutput = doc.output('blob');
    setPdfBlob(pdfOutput);
    setIsPDFPreviewOpen(true);
  };

  // Generate and Download PDF
  const downloadPDF = (salesData: any, isFormData = false) => {
    const doc = generatePDFDocument(salesData, isFormData);
    const fileName = `Invoice_${salesData.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Helper function to generate PDF with real company data
  const generatePDFDocument = (salesData: any, isFormData = false) => {
    const doc = new jsPDF();
    const selectedClient = clients.find(c => c.id === salesData.clientId);
    const selectedTransporter = transporters.find(t => t.id === salesData.transporterId);
    
    // Company Header with real data
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("BUSINESS INVOICE", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(companyProfile?.legalName || "Your Company Name", 105, 30, { align: "center" });
    doc.text(companyProfile?.registeredAddressLine1 || "Company Address Line 1", 105, 37, { align: "center" });
    doc.text(companyProfile?.registeredAddressLine2 || "Company Address Line 2", 105, 44, { align: "center" });
    
    const contactLine = `Phone: ${companyProfile?.primaryContactMobile || '+91-XXXXXXXXXX'} | Email: ${companyProfile?.primaryContactEmail || 'company@email.com'}`;
    doc.text(contactLine, 105, 51, { align: "center" });
    
    // Line separator
    doc.line(20, 58, 190, 58);
    
    // Invoice Info Section
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${salesData.invoiceNumber}`, 20, 78);
    doc.text(`Sales Order: ${salesData.salesOrderNumber}`, 20, 85);
    doc.text(`Date: ${new Date(salesData.date).toLocaleDateString('en-IN')}`, 20, 92);
    doc.text(`Status: ${salesData.deliveryStatus}`, 20, 99);
    
    // Client Info Section
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 120, 70);
    doc.setFont("helvetica", "normal");
    doc.text(`${selectedClient?.name || 'N/A'}`, 120, 78);
    doc.text(`${selectedClient?.billingAddressLine || 'Address not available'}`, 120, 85);
    doc.text(`Contact: ${selectedClient?.contactPersonName || 'N/A'}`, 120, 92);
    doc.text(`Phone: ${selectedClient?.mobileNumber || 'N/A'}`, 120, 99);
    
    // Transport Details (if available)
    if (salesData.transporterId && selectedTransporter) {
      doc.setFont("helvetica", "bold");
      doc.text("Transport Details:", 20, 115);
      doc.setFont("helvetica", "normal");
      doc.text(`Transporter: ${selectedTransporter.name}`, 20, 123);
      doc.text(`Vehicle: ${salesData.vehicleNumber || 'N/A'}`, 20, 130);
      doc.text(`Location: ${salesData.location || 'N/A'}`, 20, 137);
    }
    
    // Items Table
    const tableStartY = salesData.transporterId ? 150 : 115;
    
    // Prepare table data
    let tableData;
    let totalsInfo;
    
    if (isFormData && salesData.items) {
      // Form data with items array
      tableData = salesData.items.map((item: any) => [
        item.itemCode || 'N/A',
        item.itemDescription || 'N/A',
        item.quantity || 0,
        item.unit || 'PCS',
        `₹${(item.unitPrice || 0).toFixed(2)}`,
        `₹${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}`
      ]);
      
      const subtotal = salesData.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity || 0) * (item.unitPrice || 0);
      }, 0);
      
      totalsInfo = {
        subtotal,
        tax: parseFloat(salesData.taxAmount?.toString() || '0') || 0,
        discount: parseFloat(salesData.discountAmount?.toString() || '0') || 0,
        total: subtotal + (parseFloat(salesData.taxAmount?.toString() || '0') || 0) - (parseFloat(salesData.discountAmount?.toString() || '0') || 0)
      };
    } else {
      // Legacy sales record
      tableData = [[
        salesData.productId || 'N/A',
        'Legacy Product',
        salesData.drumQuantity || 0,
        'PCS',
        `₹${parseFloat(salesData.basicRate?.toString() || '0').toFixed(2)}`,
        `₹${parseFloat(salesData.totalAmount?.toString() || '0').toFixed(2)}`
      ]];
      
      const totalAmount = parseFloat(salesData.totalAmount?.toString() || '0');
      const gstPercent = parseFloat(salesData.gstPercent?.toString() || '0');
      const basicAmount = totalAmount / (1 + gstPercent / 100);
      const gstAmount = totalAmount - basicAmount;
      
      totalsInfo = {
        subtotal: basicAmount,
        tax: gstAmount,
        discount: 0,
        total: totalAmount
      };
    }
    
    // Add table
    autoTable(doc, {
      startY: tableStartY,
      head: [['Item Code', 'Description', 'Qty', 'Unit', 'Rate', 'Amount']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 55 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    });
    
    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Totals Section
    const totalsX = 140;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal: ₹${totalsInfo.subtotal.toFixed(2)}`, totalsX, finalY);
    doc.text(`Tax: ₹${totalsInfo.tax.toFixed(2)}`, totalsX, finalY + 7);
    doc.text(`Discount: ₹${totalsInfo.discount.toFixed(2)}`, totalsX, finalY + 14);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ₹${totalsInfo.total.toFixed(2)}`, totalsX, finalY + 21);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your business!", 105, finalY + 40, { align: "center" });
    doc.text("This is a computer generated invoice.", 105, finalY + 47, { align: "center" });
    
    return doc;
  };
  
  // Updated PDF functions using the helper
  const generateInvoicePDFForSales = (salesRecord: Sales) => {
    downloadPDF(salesRecord, false);
  };
  
  const generateInvoicePDF = () => {
    const formData = form.getValues();
    downloadPDF(formData, true);
  };
  
  const previewInvoicePDF = () => {
    const formData = form.getValues();
    previewPDF(formData, true);
  };

  // Product selection handler
  const handleProductSelection = (index: number, productId: string) => {
    if (productId === "manual") {
      // Clear product fields for manual entry
      form.setValue(`items.${index}.productMasterId`, "");
      form.setValue(`items.${index}.itemCode`, "");
      form.setValue(`items.${index}.itemDescription`, "");
      form.setValue(`items.${index}.productFamily`, "");
      form.setValue(`items.${index}.productGrade`, "");
      form.setValue(`items.${index}.hsnCode`, "");
      form.setValue(`items.${index}.unit`, "PCS");
      form.setValue(`items.${index}.unitPrice`, 0);
      return;
    }

    const product = productMasters?.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productMasterId`, productId);
      form.setValue(`items.${index}.itemCode`, product.productCode || "");
      form.setValue(`items.${index}.itemDescription`, product.name || "");
      form.setValue(`items.${index}.productFamily`, product.productFamily || "");
      form.setValue(`items.${index}.productGrade`, product.grade || "");
      form.setValue(`items.${index}.hsnCode`, product.hsnCode || "");
      form.setValue(`items.${index}.unit`, product.unit || "PCS");
      form.setValue(`items.${index}.unitPrice`, parseFloat(product.rate?.toString() || '0') || 0);
    }
  };

  // Add new empty item
  const addItem = () => {
    append({
      productMasterId: "",
      itemCode: "",
      itemDescription: "",
      productFamily: "",
      productGrade: "",
      hsnCode: "",
      quantity: 0,
      unit: "PCS",
      unitPrice: 0
    });
  };

  // Add selected product to bill
  const addSelectedProductToBill = () => {
    const selectedProductId = selectedProduct;
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Please select a product first",
        variant: "destructive",
      });
      return;
    }

    const product = productMasters?.find(p => p.id === selectedProductId);
    if (product) {
      append({
        productMasterId: selectedProductId,
        itemCode: product.productCode || "",
        itemDescription: product.name || "",
        productFamily: product.productFamily || "",
        productGrade: product.grade || "",
        hsnCode: product.hsnCode || "",
        quantity: 0,
        unit: product.unit || "PCS",
        unitPrice: parseFloat(product.rate?.toString() || '0') || 0
      });
      
      // Reset the product selection
      setSelectedProduct("");
      
      toast({
        title: "Success",
        description: "Product added to bill",
      });
    }
  };

  // Generate auto numbers
  const generateNumbers = async () => {
    try {
      const [soResponse, invResponse] = await Promise.all([
        apiRequest("/api/number-series/next/SALES_ORDER", "POST"),
        apiRequest("/api/number-series/next/INVOICE", "POST")
      ]);
      
      const soData = await soResponse.json();
      const invData = await invResponse.json();
      
      form.setValue("salesOrderNumber", soData.nextNumber);
      form.setValue("invoiceNumber", invData.nextNumber);
    } catch (error) {
      console.error("Failed to generate numbers:", error);
    }
  };

  // CRUD Operations - Updated for billing format
  const salesMutation = useMutation({
    mutationFn: async (data: BillingFormData) => {
      // Convert billing format to legacy sales format
      // Aggregate all items into totals for backend compatibility
      const items = data.items || [];
      
      // Calculate aggregated values from all items
      const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalValue = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
      
      // Create combined description from all items
      const itemDescriptions = items
        .filter(item => item.itemDescription)
        .map(item => `${item.itemCode || ''} ${item.itemDescription || ''}`.trim())
        .join(', ');
      
      // Use first item for product reference, or find best match
      const firstItem = items[0];
      const productMatch = products.find(p => 
        items.some(item => item.itemDescription?.includes(p.name || ''))
      ) || products.find(p => p.name === firstItem?.itemDescription) || products[0];
      
      const legacyData = {
        date: data.date,
        salesOrderNumber: data.salesOrderNumber,
        invoiceNumber: data.invoiceNumber,
        clientId: data.clientId,
        salespersonId: data.salespersonId || "",
        deliveryStatus: data.deliveryStatus,
        vehicleNumber: data.vehicleNumber || "",
        location: data.location || "",
        transporterId: data.transporterId || transporters[0]?.id || "",
        
        // Aggregated values from all line items
        grossWeight: "0",
        tareWeight: "0", 
        netWeight: totalQuantity.toString(),
        entireWeight: "0",
        drumQuantity: Math.ceil(totalQuantity),
        perDrumWeight: totalQuantity > 0 ? (totalValue / totalQuantity).toFixed(2) : "0",
        basicRate: totalQuantity > 0 ? (totalValue / totalQuantity).toFixed(2) : "0",
        gstPercent: "18",
        totalAmount: totalAmount.toFixed(2),
        basicRatePurchase: "0",
        productId: productMatch?.id || "",
        // Store item descriptions for reference
        notes: `Items: ${itemDescriptions}`
      };

      if (editingSales) {
        return await apiRequest(`/api/sales/${editingSales.id}`, "PUT", legacyData);
      }
      return await apiRequest("/api/sales", "POST", legacyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      setIsFormOpen(false);
      setEditingSales(null);
      form.reset();
      toast({
        title: "Success",
        description: editingSales ? "Sales record updated successfully" : "Sales record created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (salesId: string) => {
      return await apiRequest(`/api/sales/${salesId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Success",
        description: "Sales record deleted successfully",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ salesId, newStatus }: { salesId: string; newStatus: string }) => {
      return await apiRequest(`/api/sales/${salesId}`, "PUT", { deliveryStatus: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Event Handlers
  const handleOpenForm = (sales?: Sales) => {
    if (sales) {
      setEditingSales(sales);
      // Set basic form values
      Object.keys(sales).forEach((key) => {
        const value = sales[key as keyof Sales];
        if (key === 'date' && value instanceof Date) {
          form.setValue(key as any, format(value, 'yyyy-MM-dd'));
        } else if (value !== null && value !== undefined && key !== 'items') {
          form.setValue(key as any, value as any);
        }
      });
      
      // For edit mode, create a dummy item from the sales data
      // Since old sales format doesn't have items array, we'll reconstruct it
      const legacyItem = {
        productMasterId: "",
        itemCode: sales.productId || "",
        itemDescription: "Legacy Item",
        productFamily: "",
        productGrade: "",
        hsnCode: "",
        quantity: sales.drumQuantity || 1,
        unit: "PCS",
        unitPrice: parseFloat(sales.basicRate?.toString() || '0') || 0
      };
      
      form.setValue("items", [legacyItem]);
    } else {
      setEditingSales(null);
      form.reset();
      generateNumbers();
    }
    setIsFormOpen(true);
  };

  const handleDelete = (salesId: string) => {
    if (window.confirm("Are you sure you want to delete this sales record?")) {
      deleteMutation.mutate(salesId);
    }
  };

  const handleStatusChange = (salesId: string, newStatus: string) => {
    updateStatusMutation.mutate({ salesId, newStatus });
  };

  // Filtering
  const filteredSales = salesData.filter((sales) => {
    const matchesSearch = 
      sales.salesOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sales.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sales.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || sales.deliveryStatus === statusFilter;
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const salesDate = new Date(sales.date);
      if (dateFrom) matchesDate = matchesDate && salesDate >= new Date(dateFrom);
      if (dateTo) matchesDate = matchesDate && salesDate <= new Date(dateTo);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: salesData.length,
    receiving: salesData.filter(s => s.deliveryStatus === 'RECEIVING').length,
    delivered: salesData.filter(s => s.deliveryStatus === 'DELIVERED').length,
    totalValue: salesData.reduce((sum, s) => sum + parseFloat(s.totalAmount || "0"), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-1">Interactive sales records with CRUD operations and data filters</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Sales Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Receiving</p>
                <p className="text-2xl font-bold text-orange-900">{stats.receiving}</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Delivered</p>
                <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
              </div>
              <Truck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Value</p>
                <p className="text-xl font-bold text-purple-900">₹{stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Sales Records
            <div className="flex items-center space-x-4 text-sm font-normal">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search sales records..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="RECEIVING">Receiving</SelectItem>
                  <SelectItem value="OK">OK</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filters */}
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  className="w-36"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From Date"
                />
                <span className="text-gray-400">to</span>
                <Input
                  type="date"
                  className="w-36"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To Date"
                />
              </div>
              
              {(dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Clear Dates
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Sales Order</th>
                  <th className="px-6 py-3">Invoice</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Net Weight</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                    </tr>
                  ))
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No sales records found</p>
                      <p className="text-sm mt-2">
                        {searchTerm || statusFilter !== "ALL" || dateFrom || dateTo
                          ? "Try adjusting your filters"
                          : "Create your first sales record to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sales) => {
                    const client = clients.find(c => c.id === sales.clientId);
                    const salesperson = users.find(u => u.id === sales.salespersonId);
                    
                    return (
                      <tr key={sales.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(sales.date), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-blue-600">
                            {sales.salesOrderNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {sales.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left font-medium"
                              onClick={() => {
                                if (client) {
                                  setSelectedClientForDetails(client);
                                  setIsClientDetailsOpen(true);
                                }
                              }}
                              title="View client details"
                            >
                              {client?.name || 'Unknown Client'}
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">
                            Sales: {salesperson ? `${salesperson.firstName} ${salesperson.lastName}`.trim() || salesperson.username : 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{sales.vehicleNumber}</div>
                          <div className="text-xs text-gray-500">{sales.location}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {parseFloat(sales.netWeight).toLocaleString()} kg
                          </div>
                          <div className="text-xs text-gray-500">
                            {sales.drumQuantity} drums
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            ₹{parseFloat(sales.totalAmount).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Select
                            value={sales.deliveryStatus}
                            onValueChange={(newStatus) => handleStatusChange(sales.id, newStatus)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="w-28 h-7 text-xs border-0 p-0 bg-transparent">
                              <Badge className={statusColors[sales.deliveryStatus]}>
                                {sales.deliveryStatus}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RECEIVING">
                                <Badge className={statusColors.RECEIVING}>RECEIVING</Badge>
                              </SelectItem>
                              <SelectItem value="OK">
                                <Badge className={statusColors.OK}>OK</Badge>
                              </SelectItem>
                              <SelectItem value="APPROVED">
                                <Badge className={statusColors.APPROVED}>APPROVED</Badge>
                              </SelectItem>
                              <SelectItem value="DELIVERED">
                                <Badge className={statusColors.DELIVERED}>DELIVERED</Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                previewPDF(sales, false);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              title="Preview Invoice"
                            >
                              <Package className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateInvoicePDFForSales(sales)}
                              className="text-green-600 hover:text-green-700"
                              title="Download PDF"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenForm(sales)}
                              title="Edit Record"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(sales.id)}
                              title="Delete Record"
                            >
                              <Trash2 className="h-3 w-3" />
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

      {/* Sales Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSales ? 'Edit Sales Record' : 'Create New Sales Record'}
            </DialogTitle>
            <DialogDescription>
              {editingSales ? 'Update the sales record information below.' : 'Fill in the details to create a new sales record.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => salesMutation.mutate(data))} className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliveryStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="RECEIVING">Receiving</SelectItem>
                                <SelectItem value="OK">OK</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="salesOrderNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sales Order Number</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-gray-100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Party Details</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="salespersonId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sales Person</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sales person" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.filter(user => ['SALES_MANAGER', 'SALES_EXECUTIVE'].includes(user.role)).map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {`${user.firstName} ${user.lastName}`.trim() || user.username}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Optional Fields */}
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Transport Details (Optional)</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="transporterId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transporter Name</FormLabel>
                              <Select onValueChange={(value) => {
                                field.onChange(value);
                                // Auto-fill contact number when transporter is selected
                                const selectedTransporter = transporters.find(t => t.id === value);
                                const contactNumber = selectedTransporter?.phone || "";
                                console.log("Selected transporter:", selectedTransporter, "Contact:", contactNumber);
                                form.setValue("transporterContactNumber", contactNumber);
                                // Force re-render by triggering form change
                                form.trigger("transporterContactNumber");
                              }} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select or search transporter" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <div className="border-b p-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setIsTransporterDialogOpen(true)}
                                      className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add New Transporter
                                    </Button>
                                  </div>
                                  {transporters.map((transporter) => (
                                    <SelectItem key={transporter.id} value={transporter.id}>
                                      {transporter.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="transporterContactNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Number</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  value={field.value || ""}
                                  placeholder="Auto-filled from transporter"
                                  readOnly
                                  className="bg-gray-100"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="vehicleNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Billing Line Items - Full Width */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5" />
                      <span>Order Line Items</span>
                    </div>
                    <Button type="button" onClick={addItem} size="sm" data-testid="button-add-item">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Selection Area */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Select Product to Add
                        </label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                          <SelectTrigger data-testid="select-product-new" className="mt-2">
                            <SelectValue placeholder="Choose product to add to bill" />
                          </SelectTrigger>
                          <SelectContent>
                            {productMasters?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.productCode} - {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button type="button" onClick={addSelectedProductToBill} size="default" className="w-full" data-testid="button-add-selected-product">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item to Bill
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Billing Table */}
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                          <th className="px-4 py-3 text-center">ITEM CODE</th>
                          <th className="px-4 py-3 text-center">DESCRIPTION</th>
                          <th className="px-4 py-3 text-center">QTY</th>
                          <th className="px-4 py-3 text-center">UNIT</th>
                          <th className="px-4 py-3 text-center">UNIT PRICE</th>
                          <th className="px-4 py-3 text-center">LINE TOTAL</th>
                          <th className="px-4 py-3 text-center">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fields.map((field, index) => (
                          <tr key={field.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <FormField
                                control={form.control}
                                name={`items.${index}.itemCode`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="Auto-filled"
                                        data-testid={`input-item-code-${index}`}
                                        className="text-center border-0 bg-transparent"
                                        readOnly
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <FormField
                                control={form.control}
                                name={`items.${index}.itemDescription`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="Auto-filled"
                                        data-testid={`input-description-${index}`}
                                        className="text-center border-0 bg-transparent"
                                        readOnly
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.001"
                                        min="0"
                                        value={field.value === 0 ? '' : field.value}
                                        onChange={e => {
                                          const value = e.target.value;
                                          if (value === '' || value === '0') {
                                            field.onChange(0);
                                          } else {
                                            const num = parseFloat(value);
                                            if (!isNaN(num)) {
                                              field.onChange(num);
                                            }
                                          }
                                        }}
                                        data-testid={`input-quantity-${index}`}
                                        className="text-center"
                                        placeholder="Enter quantity"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <FormField
                                control={form.control}
                                name={`items.${index}.unit`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid={`select-unit-${index}`} className="text-center">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="PCS">PCS</SelectItem>
                                        <SelectItem value="KG">KG</SelectItem>
                                        <SelectItem value="MT">MT</SelectItem>
                                        <SelectItem value="LTR">LTR</SelectItem>
                                        <SelectItem value="DRUM">DRUM</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <FormField
                                control={form.control}
                                name={`items.${index}.unitPrice`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={field.value === 0 ? '' : field.value}
                                        onChange={e => {
                                          const value = e.target.value;
                                          if (value === '' || value === '0') {
                                            field.onChange(0);
                                          } else {
                                            const num = parseFloat(value);
                                            if (!isNaN(num)) {
                                              field.onChange(num);
                                            }
                                          }
                                        }}
                                        data-testid={`input-unit-price-${index}`}
                                        className="text-center"
                                        placeholder="Enter price"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-gray-900 text-center">
                                ₹{((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  data-testid={`button-remove-item-${index}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taxAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-tax-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-discount-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-col justify-end">
                      <label className="text-sm font-medium mb-2">Total Amount</label>
                      <div className="h-10 border rounded-md px-3 flex items-center font-semibold text-lg bg-muted">
                        ₹{totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={previewInvoicePDF}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  data-testid="button-preview-pdf"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={generateInvoicePDF}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  data-testid="button-generate-pdf"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button 
                  type="submit" 
                  disabled={salesMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {salesMutation.isPending ? "Saving..." : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingSales ? 'Update' : 'Create'} Sales
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add New Transporter Dialog */}
      <Dialog open={isTransporterDialogOpen} onOpenChange={setIsTransporterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transporter</DialogTitle>
            <DialogDescription>
              Add a new transporter to use in your sales records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Transporter Name *</label>
              <Input
                value={newTransporterName}
                onChange={(e) => setNewTransporterName(e.target.value)}
                placeholder="Enter transporter name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Number</label>
              <Input
                value={newTransporterContactNumber}
                onChange={(e) => setNewTransporterContactNumber(e.target.value)}
                placeholder="Enter contact number"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTransporterDialogOpen(false);
                  setNewTransporterName("");
                  setNewTransporterContactNumber("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (newTransporterName.trim()) {
                    createTransporterMutation.mutate({
                      name: newTransporterName.trim(),
                      contactNumber: newTransporterContactNumber.trim()
                    });
                  }
                }}
                disabled={!newTransporterName.trim() || createTransporterMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createTransporterMutation.isPending ? "Creating..." : "Create Transporter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Modal */}
      <Dialog open={isPDFPreviewOpen} onOpenChange={setIsPDFPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Preview your invoice before downloading or printing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {pdfBlob && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Invoice Preview</h3>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (pdfBlob) {
                          const url = URL.createObjectURL(pdfBlob);
                          const printWindow = window.open(url, '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
                          if (printWindow) {
                            printWindow.document.title = 'Invoice - Print Layout';
                          }
                        }
                      }}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      Print Layout View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (pdfBlob) {
                          const url = URL.createObjectURL(pdfBlob);
                          const printWindow = window.open(url, '_blank');
                          if (printWindow) {
                            printWindow.onload = () => {
                              printWindow.print();
                            };
                          }
                        }
                      }}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Quick Print
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (pdfBlob) {
                          const url = URL.createObjectURL(pdfBlob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `Invoice_${new Date().toISOString().split('T')[0]}.pdf`;
                          link.click();
                          URL.revokeObjectURL(url);
                        }
                      }}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ height: '500px' }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="text-6xl text-blue-500">📄</div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Invoice Ready</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Your invoice has been generated successfully.<br/>
                          Use the buttons above to view, print, or download.
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (pdfBlob) {
                              const url = URL.createObjectURL(pdfBlob);
                              window.open(url, '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
                            }
                          }}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <FileCheck className="mr-2 h-4 w-4" />
                          Open Full View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Details Modal */}
      <Dialog open={isClientDetailsOpen} onOpenChange={setIsClientDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedClientForDetails?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClientForDetails && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedClientForDetails.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <Badge className={`mt-1 ${
                      selectedClientForDetails.category === 'ALFA' ? 'bg-green-100 text-green-800' :
                      selectedClientForDetails.category === 'BETA' ? 'bg-blue-100 text-blue-800' :
                      selectedClientForDetails.category === 'GAMMA' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedClientForDetails.category}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedClientForDetails.contactPersonName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedClientForDetails.mobileNumber || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedClientForDetails.email || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">GSTIN</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedClientForDetails.gstin || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">PAN Number</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedClientForDetails.panNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Registration Date</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedClientForDetails.createdAt ? new Date(selectedClientForDetails.createdAt).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Billing Address</label>
                    <div className="text-sm text-gray-900 mt-1 space-y-1">
                      <p>{selectedClientForDetails.billingAddressLine || 'Not specified'}</p>
                      <p>{selectedClientForDetails.billingCity || ''} {selectedClientForDetails.billingPincode || ''}</p>
                      <p>{selectedClientForDetails.billingState || ''}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Shipping Address</label>
                    <div className="text-sm text-gray-900 mt-1 space-y-1">
                      <p>{selectedClientForDetails.shippingAddressLine || 'Same as billing'}</p>
                      <p>{selectedClientForDetails.shippingCity || ''} {selectedClientForDetails.shippingPincode || ''}</p>
                      <p>{selectedClientForDetails.shippingState || ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Credit Limit</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedClientForDetails.creditLimit ? `₹${parseFloat(selectedClientForDetails.creditLimit.toString()).toLocaleString()}` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Terms</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedClientForDetails.paymentTerms || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Interest Rate</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedClientForDetails.interestPercent ? `${selectedClientForDetails.interestPercent}%` : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsClientDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}