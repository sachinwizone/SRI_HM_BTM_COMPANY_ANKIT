import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Search, CalendarDays, FileCheck, Save, X, Package, Truck, BarChart3, Calculator } from "lucide-react";
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
import { insertSalesSchema, type Sales, type InsertSales, type User, type Client, type Product, type Transporter, type ProductMaster } from "@shared/schema";

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
    quantity: z.number().min(0.001, "Quantity must be greater than 0"),
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
      taxAmount: 0,
      discountAmount: 0,
      items: [{
        productMasterId: "",
        itemCode: "",
        itemDescription: "",
        productFamily: "",
        productGrade: "",
        hsnCode: "",
        quantity: 1,
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

  // Add new item
  const addItem = () => {
    append({
      productMasterId: "",
      itemCode: "",
      itemDescription: "",
      productFamily: "",
      productGrade: "",
      hsnCode: "",
      quantity: 1,
      unit: "PCS",
      unitPrice: 0
    });
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
      // For now, convert billing format to legacy sales format
      // This maintains compatibility with existing backend
      const firstItem = data.items[0];
      
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
        
        // Calculate totals from line items
        grossWeight: "0",
        tareWeight: "0", 
        netWeight: firstItem?.quantity?.toString() || "0",
        entireWeight: "0",
        drumQuantity: Math.ceil(firstItem?.quantity || 1),
        perDrumWeight: "0",
        basicRate: firstItem?.unitPrice?.toString() || "0",
        gstPercent: "18",
        totalAmount: totalAmount.toFixed(2),
        basicRatePurchase: "0",
        productId: products.find(p => p.name === firstItem?.itemDescription)?.id || products[0]?.id || ""
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
      Object.keys(sales).forEach((key) => {
        const value = sales[key as keyof Sales];
        if (key === 'date' && value instanceof Date) {
          form.setValue(key as any, format(value, 'yyyy-MM-dd'));
        } else if (value !== null && value !== undefined) {
          form.setValue(key as any, value as any);
        }
      });
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
                          <div className="text-sm font-medium text-gray-900">
                            {client?.name || 'Unknown Client'}
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
                              onClick={() => handleOpenForm(sales)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(sales.id)}
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
                <CardContent className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4 bg-gray-50/50">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-lg">Item {index + 1}</h4>
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.productMasterId`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Select Product</FormLabel>
                              <Select value={field.value} onValueChange={(value) => handleProductSelection(index, value)}>
                                <FormControl>
                                  <SelectTrigger data-testid={`select-product-${index}`}>
                                    <SelectValue placeholder="Choose product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="manual">Manual Entry</SelectItem>
                                  {productMasters?.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.productCode} - {product.name}
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
                          name={`items.${index}.itemCode`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Item Code *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Auto-filled"
                                  data-testid={`input-item-code-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.itemDescription`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Description *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Auto-filled"
                                  data-testid={`input-description-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Qty *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.001"
                                  min="0"
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid={`input-quantity-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Unit *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid={`select-unit-${index}`}>
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

                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Unit Price *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid={`input-unit-price-${index}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Product Master Details */}
                      {watchedItems[index]?.productMasterId && watchedItems[index]?.productMasterId !== "manual" && (
                        <div className="bg-green-50 p-3 rounded border">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Family:</span>
                              <div>{watchedItems[index]?.productFamily || '-'}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Grade:</span>
                              <div>{watchedItems[index]?.productGrade || '-'}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">HSN Code:</span>
                              <div>{watchedItems[index]?.hsnCode || '-'}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="mt-2 bg-green-100 text-green-800">
                            Product Master Data
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          Line Total: ₹{((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}