import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, Plus, MapPin, Truck, Clock, Navigation, Edit, History, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Tracking form schema
const trackingFormSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  clientName: z.string().optional(),
  orderId: z.string().min(1, "Order ID is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  driverName: z.string().min(1, "Driver name is required"),
  currentLocation: z.string().min(1, "Current location is required"),
  destinationLocation: z.string().min(1, "Destination is required"),
  // New fields with auto-fill capability - now supporting multiple products
  products: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string(),
  })).optional(),
  clientNumber: z.string().optional(),
  ewayBillNumber: z.string().optional(),
  status: z.enum(["LOADING", "IN_TRANSIT", "DELIVERED"]),
});

type TrackingFormData = z.infer<typeof trackingFormSchema>;

// Status update schema
const statusUpdateSchema = z.object({
  status: z.enum(["LOADING", "IN_TRANSIT", "DELIVERED"]),
  currentLocation: z.string().min(1, "Current location is required"),
  notes: z.string().optional(),
  estimatedArrival: z.string().optional(),
});

type StatusUpdateData = z.infer<typeof statusUpdateSchema>;

export default function ClientTracking() {
  const [searchValue, setSearchValue] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<any>(null);
  const [selectedOrderProducts, setSelectedOrderProducts] = useState<any[]>([]);
  const { toast } = useToast();

  const { data: trackingData = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/client-tracking"],
  });

  // Fetch clients for dropdown
  const { data: clients = [], isLoading: clientsLoading } = useQuery<any[]>({
    queryKey: ["/api/clients"],
  });

  // Fetch sales orders for dropdown
  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/sales-orders"],
  });

  // Fetch e-way bills for auto-fill
  const { data: ewayBills = [], isLoading: ewayBillsLoading } = useQuery<any[]>({
    queryKey: ["/api/eway-bills"],
  });

  // Form setup
  const form = useForm<TrackingFormData>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      clientId: "",
      clientName: "",
      orderId: "",
      vehicleNumber: "",
      driverName: "",
      currentLocation: "",
      destinationLocation: "",
      products: [],
      clientNumber: "",
      ewayBillNumber: "",
      status: "LOADING",
    },
  });

  // Status update form
  const statusForm = useForm<StatusUpdateData>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: "LOADING",
      currentLocation: "",
      notes: "",
      estimatedArrival: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TrackingFormData) => apiRequest("/api/client-tracking", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-tracking"] });
      toast({
        title: "Success",
        description: "Tracking entry added successfully.",
      });
      setIsAddDialogOpen(false);
      setSelectedOrderProducts([]);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tracking entry.",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ trackingId, data }: { trackingId: string; data: StatusUpdateData }) => 
      apiRequest(`/api/client-tracking/${trackingId}/status`, "PUT", data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-tracking"] });
      queryClient.invalidateQueries({ queryKey: [`/api/client-tracking/${variables.trackingId}/logs`] });
      
      const updateData = variables.data;
      toast({
        title: "✅ Status Updated Successfully",
        description: `Status: ${updateData.status} | Location: ${updateData.currentLocation}${updateData.notes ? ` | Notes: ${updateData.notes.substring(0, 50)}${updateData.notes.length > 50 ? '...' : ''}` : ''}`,
      });
      
      console.log("✅ Status update completed:", {
        status: updateData.status,
        location: updateData.currentLocation,
        notes: updateData.notes,
        estimatedArrival: updateData.estimatedArrival,
        timestamp: new Date().toISOString()
      });
      
      setIsTrackingDialogOpen(false);
      setSelectedTracking(null);
      statusForm.reset();
    },
    onError: (error: any) => {
      console.error("❌ Status update failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update tracking status.",
        variant: "destructive",
      });
    },
  });

  // Fetch tracking logs
  const logsQuery = useQuery({
    queryKey: [`/api/client-tracking/${selectedTracking?.id}/logs`],
    queryFn: () => fetch(`/api/client-tracking/${selectedTracking?.id}/logs`).then(res => res.json()),
    enabled: !!selectedTracking?.id,
    staleTime: 0, // Always refetch
    refetchOnWindowFocus: true,
  });
  
  const { data: trackingLogs = [], isLoading: logsLoading, refetch: refetchLogs } = logsQuery;

  // Debug log
  console.log('Selected Tracking ID:', selectedTracking?.id);
  console.log('Tracking Logs Data:', trackingLogs);
  console.log('Logs Loading:', logsLoading);

  // Ensure trackingLogs is an array for processing
  const logsArray = Array.isArray(trackingLogs) ? trackingLogs : [];

  // Refetch logs when selectedTracking changes
  useEffect(() => {
    if (selectedTracking?.id && isTrackingDialogOpen) {
      console.log('Refetching logs for tracking ID:', selectedTracking.id);
      refetchLogs();
    }
  }, [selectedTracking?.id, isTrackingDialogOpen]);

  const onSubmit = (data: TrackingFormData) => {
    console.log("Submitting tracking data:", data);
    const submissionData: any = {
      ...data,
      // Convert products array to JSON string for backend
      products: selectedOrderProducts.length > 0 ? JSON.stringify(selectedOrderProducts) : undefined,
    };
    createMutation.mutate(submissionData);
  };

  const onStatusUpdate = (data: StatusUpdateData) => {
    if (!selectedTracking) return;
    
    console.log("📋 Submitting status update:", {
      trackingId: selectedTracking.id,
      previousStatus: selectedTracking.status,
      newStatus: data.status,
      location: data.currentLocation,
      notes: data.notes || 'No notes provided',
      estimatedArrival: data.estimatedArrival || 'Not specified'
    });

    // Ensure notes are captured even if empty
    const updateData = {
      ...data,
      notes: data.notes?.trim() || `Status updated to ${data.status}`,
      estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival).toISOString() : undefined,
    };

    updateStatusMutation.mutate({ 
      trackingId: selectedTracking.id, 
      data: updateData
    });
  };

  const handleTrackingClick = (tracking: any) => {
    setSelectedTracking(tracking);
    statusForm.reset({
      status: tracking.status,
      currentLocation: tracking.currentLocation,
      notes: "",
      estimatedArrival: tracking.estimatedArrival ? 
        new Date(tracking.estimatedArrival).toISOString().slice(0, 16) : "",
    });
    setIsTrackingDialogOpen(true);
    
    // Force refetch tracking logs when dialog opens
    setTimeout(() => {
      if (tracking?.id) {
        refetchLogs();
      }
    }, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LOADING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: "In Transit",
      value: trackingData?.filter((t: any) => t.status === 'IN_TRANSIT').length || 0,
      icon: Truck,
      color: "text-success bg-success/10"
    },
    {
      title: "Loading",
      value: trackingData?.filter((t: any) => t.status === 'LOADING').length || 0,
      icon: Clock,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Delivered Today",
      value: trackingData?.filter((t: any) => t.status === 'DELIVERED' && 
        new Date(t.lastUpdated).toDateString() === new Date().toDateString()).length || 0,
      icon: MapPin,
      color: "text-info bg-info/10"
    },
    {
      title: "Total Shipments",
      value: trackingData?.length || 0,
      icon: Navigation,
      color: "text-primary bg-primary/10"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Tracking</h1>
        <p className="text-gray-600 mt-1">Track vehicle locations and delivery timelines</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className={`p-2 ${stat.color} rounded-lg`}>
                  <Icon size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Live Tracking</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  type="text" 
                  placeholder="Search by vehicle or location..." 
                  className="w-64 pl-10"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-tracking">
                <Plus size={16} className="mr-2" />
                Add Tracking
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tracking Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Product Info</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">E-way Bill</th>
                  <th className="px-6 py-3">Current Location</th>
                  <th className="px-6 py-3">Destination</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                    </tr>
                  ))
                ) : !trackingData || trackingData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No tracking data available</p>
                      <p className="text-sm mt-2">Add vehicle tracking to get started</p>
                    </td>
                  </tr>
                ) : (
                  trackingData.map((tracking: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tracking.clientName || 'Client'}</div>
                        <div className="text-sm text-gray-500">
                          Phone: {tracking.clientNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tracking.products && tracking.products.length > 0 ? (
                          <div className="space-y-1">
                            {tracking.products.map((product: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-xs text-gray-500">{product.quantity} {product.unit}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900">{tracking.productName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">Qty: {tracking.productQty || 'N/A'}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tracking.vehicleNumber}</div>
                        <div className="text-sm text-gray-500">Driver: {tracking.driverName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tracking.ewayBillNumber || 'N/A'}</div>
                        <div className="text-sm text-gray-500">E-way Bill</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="text-primary" size={16} />
                          <span className="text-gray-900">{tracking.currentLocation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{tracking.destinationLocation}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(tracking.status)}>
                          {tracking.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-primary"
                          onClick={() => handleTrackingClick(tracking)}
                        >
                          <MapPin size={16} className="mr-1" />
                          Track
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Tracking Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Tracking</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Row 1: Client and Order Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          const selectedClient = clients.find((client: any) => client.id === value);
                          if (selectedClient) {
                            form.setValue("clientName", selectedClient.name);
                            form.setValue("clientNumber", selectedClient.mobileNumber || "");
                          }
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client: any) => (
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
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order ID</FormLabel>
                      <Select 
                        onValueChange={async (value) => {
                          field.onChange(value);
                          const selectedOrder = orders.find((order: any) => order.id === value);
                          if (selectedOrder) {
                            // Fetch sales order items for this order
                            try {
                              const response = await fetch(`/api/sales-orders/${selectedOrder.id}/items`);
                              const orderItems = await response.json();
                              
                              // Store individual products for separate columns
                              if (orderItems && orderItems.length > 0) {
                                const products = orderItems.map((item: any) => ({
                                  name: item.description || 'Product Item',
                                  quantity: item.quantity || '0',
                                  unit: item.unit || 'Nos'
                                }));
                                
                                setSelectedOrderProducts(products);
                                form.setValue("products", products);
                              } else {
                                // Fallback to order details if no items found
                                const fallbackProduct = [{
                                  name: selectedOrder.productName || selectedOrder.description || "Product",
                                  quantity: selectedOrder.quantity || "1",
                                  unit: "Nos"
                                }];
                                setSelectedOrderProducts(fallbackProduct);
                                form.setValue("products", fallbackProduct);
                              }
                            } catch (error) {
                              console.error("Error fetching order items:", error);
                              // Fallback to order details
                              const fallbackProduct = [{
                                name: selectedOrder.productName || selectedOrder.description || "Product",
                                quantity: selectedOrder.quantity || "1",
                                unit: "Nos"
                              }];
                              setSelectedOrderProducts(fallbackProduct);
                              form.setValue("products", fallbackProduct);
                            }
                            
                            // Auto-fill client ID and select client if not already selected
                            if (!form.getValues("clientId") && selectedOrder.clientId) {
                              form.setValue("clientId", selectedOrder.clientId);
                              const orderClient = clients.find((client: any) => client.id === selectedOrder.clientId);
                              if (orderClient) {
                                form.setValue("clientName", orderClient.name);
                                form.setValue("clientNumber", orderClient.mobileNumber || orderClient.phoneNumber || "");
                              }
                            }
                            
                            // Auto-fill client number if available
                            const orderClient = clients.find((client: any) => client.id === selectedOrder.clientId);
                            if (orderClient) {
                              form.setValue("clientNumber", orderClient.mobileNumber || orderClient.phoneNumber || "");
                            }
                            
                            // Find related e-way bill for this order
                            const relatedEwayBill = ewayBills.find((eway: any) => eway.orderId === value);
                            if (relatedEwayBill) {
                              form.setValue("ewayBillNumber", relatedEwayBill.ewayNumber || "");
                            }
                          }
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-order-id">
                            <SelectValue placeholder="Select order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orders && orders.length > 0 ? (
                            orders.map((order: any) => {
                              // Find client name for display
                              const orderClient = clients.find((client: any) => client.id === order.clientId);
                              const clientName = orderClient ? orderClient.name : 'Unknown Client';
                              
                              return (
                                <SelectItem key={order.id} value={order.id}>
                                  {order.orderNumber} - {clientName}
                                </SelectItem>
                              );
                            })
                          ) : (
                            <div className="p-2 text-sm text-gray-500">
                              No sales orders available. Create a sales order first.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Auto-filled Product Information - Dynamic Columns */}
              {selectedOrderProducts.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Products (Auto-filled from Order)</h4>
                  <div className="grid gap-4">
                    {selectedOrderProducts.map((product, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Product {index + 1} Name</label>
                          <Input 
                            value={product.name}
                            placeholder="Product name" 
                            className="bg-white mt-1"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Quantity</label>
                          <Input 
                            value={product.quantity}
                            placeholder="Quantity" 
                            className="bg-white mt-1"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Unit</label>
                          <Input 
                            value={product.unit}
                            placeholder="Unit" 
                            className="bg-white mt-1"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Total</label>
                          <Input 
                            value={`${product.quantity} ${product.unit}`}
                            placeholder="Total" 
                            className="bg-white mt-1 font-semibold"
                            readOnly
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Row 3: Client Number */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="clientNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Number (Auto-fill)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Auto-filled from client" 
                          {...field} 
                          data-testid="input-client-number"
                          className="bg-gray-50"
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 4: E-way Bill and Vehicle Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="ewayBillNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-way Bill Number (Auto-fill)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Auto-filled from order" 
                          {...field} 
                          data-testid="input-eway-bill-number"
                          className="bg-gray-50"
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter vehicle number" {...field} data-testid="input-vehicle-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter driver name" {...field} data-testid="input-driver-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 5: Location and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="currentLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter current location" {...field} data-testid="input-current-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destinationLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter destination" {...field} data-testid="input-destination" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOADING">Loading</SelectItem>
                          <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedOrderProducts([]);
                    form.reset();
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? "Adding..." : "Add Tracking"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Tracking Status Update Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="text-primary" size={20} />
              <span>Live Tracking - {selectedTracking?.vehicleNumber}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Truck className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-semibold">{selectedTracking?.vehicleNumber}</p>
                      <p className="text-xs text-gray-500">Driver: {selectedTracking?.driverName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Status</p>
                      <Badge className={getStatusColor(selectedTracking?.status)}>
                        {selectedTracking?.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{selectedTracking?.currentLocation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Navigation className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-semibold">{selectedTracking?.destinationLocation}</p>
                      {selectedTracking?.estimatedArrival && (
                        <p className="text-xs text-gray-500">
                          ETA: {new Date(selectedTracking.estimatedArrival).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Information */}
            {selectedTracking?.products && selectedTracking.products.length > 0 ? (
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Truck size={18} className="text-primary" />
                    <span>Cargo Details</span>
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedTracking.products.map((product: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.quantity} {product.unit}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : selectedTracking?.productName && (
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Truck size={18} className="text-primary" />
                    <span>Cargo Details</span>
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-900">{selectedTracking.productName}</div>
                    <div className="text-sm text-gray-600">Qty: {selectedTracking.productQty}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Update Status Form */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold flex items-center space-x-2">
                  <Edit size={18} className="text-primary" />
                  <span>Update Status</span>
                </h3>
              </CardHeader>
              <CardContent>
                <Form {...statusForm}>
                  <form onSubmit={statusForm.handleSubmit(onStatusUpdate)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={statusForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="LOADING">Loading</SelectItem>
                                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={statusForm.control}
                        name="currentLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Update current location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={statusForm.control}
                      name="estimatedArrival"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Arrival (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={statusForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <span>Update Notes</span>
                            <Badge variant="secondary" className="text-xs">Recommended</Badge>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={`Add detailed notes for this ${statusForm.watch('status')?.toLowerCase()} update...
Examples:
• Loading: "Documents verified, cargo loaded successfully"
• In Transit: "Left warehouse at 2:30 PM, expected arrival by 6:00 PM"  
• Delivered: "Package delivered to warehouse manager, signed receipt obtained"`}
                              rows={4}
                              {...field}
                              className="resize-none"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-600 mt-1">
                            💡 Adding detailed notes helps track the delivery progress and any issues encountered.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Update Summary Preview */}
                    {(statusForm.watch('status') !== selectedTracking?.status || 
                      statusForm.watch('currentLocation') || 
                      statusForm.watch('notes') || 
                      statusForm.watch('estimatedArrival')) && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                          <AlertTriangle size={16} />
                          <span>Update Preview</span>
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Status:</span>
                            <span className="font-medium text-blue-900">
                              {selectedTracking?.status} → {statusForm.watch('status')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Location:</span>
                            <span className="font-medium text-blue-900">
                              {statusForm.watch('currentLocation') || selectedTracking?.currentLocation}
                            </span>
                          </div>
                          {statusForm.watch('notes') && (
                            <div className="pt-2 border-t border-blue-200">
                              <span className="text-blue-700">Notes:</span>
                              <p className="text-blue-900 mt-1 text-xs bg-white p-2 rounded border">
                                {statusForm.watch('notes')}
                              </p>
                            </div>
                          )}
                          {statusForm.watch('estimatedArrival') && (
                            <div className="flex justify-between">
                              <span className="text-blue-700">ETA:</span>
                              <span className="font-medium text-blue-900">
                                {new Date(statusForm.watch('estimatedArrival') || '').toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsTrackingDialogOpen(false);
                          setSelectedTracking(null);
                          statusForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateStatusMutation.isPending}
                        className="flex items-center space-x-2"
                      >
                        {updateStatusMutation.isPending ? (
                          <>
                            <Clock className="animate-spin" size={16} />
                            <span>Saving Update...</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={16} />
                            <span>Save & Update Status</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Tracking History/Logs - Enhanced Timeline View */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold flex items-center space-x-2">
                  <History size={18} className="text-primary" />
                  <span>Delivery Timeline</span>
                </h3>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading tracking timeline...</p>
                  </div>
                ) : logsArray.length > 0 ? (
                  <div className="relative bg-white">
                    {/* Current Overall Status Indicator */}
                    {selectedTracking && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`
                              w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs
                              ${selectedTracking.status === 'LOADING' ? 'bg-orange-500' : 
                                selectedTracking.status === 'IN_TRANSIT' ? 'bg-blue-500' : 
                                selectedTracking.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-500'}
                            `}>
                              {selectedTracking.status === 'LOADING' && '📦'}
                              {selectedTracking.status === 'IN_TRANSIT' && '🚚'}  
                              {selectedTracking.status === 'DELIVERED' && '✅'}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                Current Status: <span className={`
                                  ${selectedTracking.status === 'LOADING' ? 'text-orange-600' : 
                                    selectedTracking.status === 'IN_TRANSIT' ? 'text-blue-600' : 
                                    selectedTracking.status === 'DELIVERED' ? 'text-green-600' : 'text-gray-600'}
                                `}>
                                  {selectedTracking.status === 'LOADING' && 'LOADING'}
                                  {selectedTracking.status === 'IN_TRANSIT' && 'IN TRANSIT'}  
                                  {selectedTracking.status === 'DELIVERED' && 'DELIVERED'}
                                </span>
                              </h4>
                              <p className="text-sm text-gray-600">
                                Last Updated: {new Date(selectedTracking.updatedAt || selectedTracking.createdAt).toLocaleString('en-US')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">
                              Vehicle: {selectedTracking.vehicleNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {selectedTracking.currentLocation && `📍 ${selectedTracking.currentLocation}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Timeline Container with Sub-Updates */}
                    <div className="relative">
                      {/* Main Timeline Line */}
                      <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200 shadow-sm"></div>
                      
                      {/* Timeline Points with Grouped Sub-Updates */}
                      <div className="space-y-4 pt-4">
                        {(() => {
                          // Group logs by status to show sub-updates
                          const groupedLogs = logsArray.reduce((acc: any, log: any) => {
                            if (!acc[log.status]) {
                              acc[log.status] = [];
                            }
                            acc[log.status].push(log);
                            return acc;
                          }, {});
                          
                          // Sort logs within each status by timestamp (earliest first)
                          Object.keys(groupedLogs).forEach(status => {
                            groupedLogs[status].sort((a: any, b: any) => 
                              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                            );
                          });
                          
                          // Debug: Log grouped data to console
                          console.log('Grouped Logs:', groupedLogs);
                          console.log('Total tracking logs:', logsArray.length);
                          
                          const statusOrder = ['LOADING', 'IN_TRANSIT', 'DELIVERED'];
                          const orderedStatuses = statusOrder.filter(status => groupedLogs[status]);
                          
                          return orderedStatuses.map((status: string, statusIdx: number) => {
                            const isCurrentStatus = selectedTracking && status === selectedTracking.status;
                            
                            return (
                              <div key={status} className="relative">
                                {/* Main Status Timeline Dot */}
                                <div className="absolute left-6 flex items-center justify-center z-30">
                                  <div className={`
                                    w-5 h-5 rounded-full border-4 border-white shadow-lg relative
                                    ${status === 'LOADING' ? 'bg-orange-400' : 
                                      status === 'IN_TRANSIT' ? 'bg-blue-500' : 
                                      status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-400'}
                                    ${isCurrentStatus ? 'ring-4 ring-opacity-50' : ''}
                                    ${isCurrentStatus && status === 'LOADING' ? 'ring-orange-200' : ''}
                                    ${isCurrentStatus && status === 'IN_TRANSIT' ? 'ring-blue-200' : ''}
                                    ${isCurrentStatus && status === 'DELIVERED' ? 'ring-green-200' : ''}
                                  `}>
                                  {/* Pulse animation for latest status */}
                                  {statusIdx === orderedStatuses.length - 1 && (
                                    <div className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${
                                      status === 'LOADING' ? 'bg-orange-400' : 
                                      status === 'IN_TRANSIT' ? 'bg-blue-500' : 
                                      status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-400'
                                    }`}></div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Main Status Content */}
                              <div className="ml-20 pb-4">
                                {/* Status Header Card */}
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-md mb-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className={`
                                          inline-flex px-3 py-1 text-sm font-bold rounded-full
                                          ${status === 'LOADING' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                                            status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                                            status === 'DELIVERED' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800'}
                                        `}>
                                          {status === 'LOADING' && '📦 LOADING'}
                                          {status === 'IN_TRANSIT' && '🚚 IN TRANSIT'}  
                                          {status === 'DELIVERED' && '✅ DELIVERED'}
                                        </span>
                                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                                          {groupedLogs[status].length} update{groupedLogs[status].length > 1 ? 's' : ''}
                                        </span>
                                        {isCurrentStatus && (
                                          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                            CURRENT STATUS
                                          </span>
                                        )}
                                      </div>
                                      <h3 className="font-bold text-gray-900 text-lg">
                                        {status === 'LOADING' && 'Shipment Preparation Phase'}
                                        {status === 'IN_TRANSIT' && 'Transportation In Progress'} 
                                        {status === 'DELIVERED' && 'Delivery Completed'}
                                      </h3>
                                    </div>
                                    <div className="text-right text-sm">
                                      <div className="font-bold text-gray-900">
                                        {new Date(groupedLogs[status][groupedLogs[status].length - 1].createdAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </div>
                                      <div className="text-gray-500 text-xs font-medium">
                                        Latest Update
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Sub-Updates Timeline */}
                                <div className="relative ml-4">
                                  {/* Sub-Timeline Line */}
                                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                  
                                  {/* Sub-Updates */}
                                  <div className="space-y-3">
                                    {groupedLogs[status].map((log: any, logIdx: number) => (
                                      <div key={log.id || `${status}-${logIdx}`} className="relative">
                                        {/* Sub-Timeline Dot */}
                                        <div className="absolute left-2.5 flex items-center justify-center z-20">
                                          <div className={`
                                            w-3 h-3 rounded-full border-2 border-white shadow-sm
                                            ${logIdx === groupedLogs[status].length - 1 
                                              ? (status === 'LOADING' ? 'bg-orange-300' : 
                                                 status === 'IN_TRANSIT' ? 'bg-blue-300' : 'bg-green-300')
                                              : 'bg-gray-300'}
                                          `}>
                                          </div>
                                        </div>
                                        
                                        {/* Sub-Update Content */}
                                        <div className="ml-10 pb-2">
                                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 hover:bg-gray-100 transition-colors">
                                            {/* Timestamp */}
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="flex items-center space-x-2">
                                                <span className="bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded font-bold">
                                                  #{logIdx + 1}
                                                </span>
                                                <div className="text-xs text-gray-600 font-medium">
                                                  {new Date(log.createdAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                  })}
                                                </div>
                                              </div>
                                              {logIdx === groupedLogs[status].length - 1 && (
                                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                  Latest
                                                </span>
                                              )}
                                            </div>
                                            
                                            {/* Location */}
                                            <div className="flex items-center text-sm text-gray-700 mb-1">
                                              <MapPin size={12} className="mr-1.5 text-gray-500" />
                                              <span className="font-medium">{log.location?.toUpperCase() || 'UNKNOWN LOCATION'}</span>
                                            </div>
                                            
                                            {/* Notes/Remarks */}
                                            {log.notes && (
                                              <div className="text-xs text-gray-600 mt-2 p-2 bg-white border border-gray-200 rounded">
                                                <div className="flex items-start space-x-1">
                                                  <span className="text-gray-400 mt-0.5">💬</span>
                                                  <span>{log.notes}</span>
                                                </div>
                                              </div>
                                            )}
                                            
                                            {/* ETA if available */}
                                            {log.estimatedArrival && (
                                              <div className="mt-2 flex items-center text-xs text-blue-600">
                                                <Clock size={10} className="mr-1" />
                                                <span>ETA: {new Date(log.estimatedArrival).toLocaleString('en-US')}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Connection to Next Status */}
                              {statusIdx < orderedStatuses.length - 1 && (
                                <div className="ml-20 pb-4">
                                  <div className="flex items-center text-xs text-gray-400 space-x-2">
                                    <div className="flex-1 h-px bg-gray-300 opacity-50"></div>
                                    <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-500">⬇️</span>
                                    <div className="flex-1 h-px bg-gray-300 opacity-50"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                          })
                        })()}
                      </div>
                      
                      {/* Timeline End Cap */}
                      <div className="absolute left-8 bottom-0 w-0.5 h-4 bg-gradient-to-t from-transparent to-blue-200"></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <History size={32} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-700">No delivery timeline available</p>
                    <p className="text-sm text-gray-500 mt-1">Status updates will create a detailed timeline here</p>
                    <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-left">
                      <p><strong>Debug Info:</strong></p>
                      <p>Tracking ID: {selectedTracking?.id}</p>
                      <p>Logs Query: {logsQuery.isLoading ? 'Loading' : logsQuery.isError ? 'Error' : `${trackingLogs?.length || 0} logs`}</p>
                      <p>Error: {logsQuery.error?.message}</p>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
                      <p className="text-sm text-blue-700 font-medium">Timeline will show:</p>
                      <ul className="text-xs text-blue-600 mt-1 space-y-1">
                        <li>📦 Loading → Preparation & Documentation</li>
                        <li>🚛 In Transit → Route Progress & Updates</li>
                        <li>✅ Delivered → Final Confirmation</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}