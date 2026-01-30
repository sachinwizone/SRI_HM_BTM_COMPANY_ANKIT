
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, Users, Edit, Eye, Upload, Download, FileText, Shield, CreditCard, Building, FileCheck, ScrollText, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { WorkingFileUpload } from "@/components/WorkingFileUpload";

export default function ClientManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [documentUploads, setDocumentUploads] = useState<Record<string, boolean>>({});

  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/clients', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({ title: "Success", description: "Client created successfully" });
      setIsDialogOpen(false);
      form.reset();
      setDocumentUploads({});
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create client", variant: "destructive" });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/clients/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({ title: "Success", description: "Client updated successfully" });
      setEditingClient(null);
      form.reset();
      setDocumentUploads({});
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update client", variant: "destructive" });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/clients/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({ title: "Success", description: "Client deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete client", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      category: "BETA",
      email: "",
      mobileNumber: "",
      billingAddressLine: "",
      gstNumber: "",
      creditLimit: 0,
      paymentTerms: 30
    }
  });

  const handleUploadComplete = (documentType: string, success: boolean, fileUrl?: string) => {
    setDocumentUploads(prev => ({
      ...prev,
      [documentType]: success
    }));
  };

  const onSubmit = (data: any) => {
    // Ensure creditLimit is within database bounds (max 13 digits before decimal)
    let creditLimit = data.creditLimit;
    if (creditLimit && creditLimit > 9999999999999) {
      creditLimit = 9999999999999; // Max safe value for precision 15,2
    }
    
    const clientData = {
      ...data,
      creditLimit: creditLimit || null,
      // Add document upload status
      gstCertificateUploaded: documentUploads.gstCertificate || false,
      panCopyUploaded: documentUploads.panCopy || false,
      securityChequeUploaded: documentUploads.securityCheque || false,
      aadharCardUploaded: documentUploads.aadharCard || false,
      agreementUploaded: documentUploads.agreement || false,
      poRateContractUploaded: documentUploads.poRateContract || false,
    };

    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, data: clientData });
    } else {
      createClientMutation.mutate(clientData);
    }
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    form.reset({
      name: client.name || "",
      category: client.category || "BETA",
      email: client.email || "",
      mobileNumber: client.mobileNumber || "",
      billingAddressLine: client.billingAddressLine || "",
      gstNumber: client.gstNumber || "",
      creditLimit: client.creditLimit || 0,
      paymentTerms: client.paymentTerms || 30
    });
    setIsDialogOpen(true);
  };

  const handleViewClient = (client: any) => {
    console.log('Viewing client:', client.name);
    console.log('Setting viewingClient to:', client);
    setViewingClient(client);
  };

  const handleDeleteClient = (client: any) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      deleteClientMutation.mutate(client.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    form.reset();
    setDocumentUploads({});
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ALFA':
        return 'bg-green-100 text-green-800';
      case 'BETA':
        return 'bg-blue-100 text-blue-800';
      case 'GAMMA':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELTA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClients = selectedCategory === "all" 
    ? clients 
    : (clients as any[])?.filter((client: any) => client.category === selectedCategory);

  const categoryStats = [
    {
      name: "Total Clients",
      count: Array.isArray(clients) ? clients.length : 0,
      description: "All categories",
      color: "bg-blue-600"
    },
    {
      name: "Alpha",
      count: (stats as any)?.clientCategories?.ALFA || 0,
      description: "Priority clients",
      color: "bg-green-500"
    },
    {
      name: "Beta", 
      count: (stats as any)?.clientCategories?.BETA || 0,
      description: "Regular clients",
      color: "bg-yellow-500"
    },
    {
      name: "Gamma",
      count: (stats as any)?.clientCategories?.GAMMA || 0,
      description: "Standard clients", 
      color: "bg-orange-500"
    },
    {
      name: "Delta",
      count: (stats as any)?.clientCategories?.DELTA || 0,
      description: "New clients",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="space-y-3 w-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 text-sm">Manage your clients and their information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Client Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter client name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="ALFA">Alpha - Premium</SelectItem>
                                        <SelectItem value="BETA">Beta - Standard</SelectItem>
                                        <SelectItem value="GAMMA">Gamma - Regular</SelectItem>
                                        <SelectItem value="DELTA">Delta - New</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="client@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+91 98765 43210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="billingAddressLine"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Enter client address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="gstNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>GST Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="GST Number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="creditLimit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Credit Limit</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="paymentTerms"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Payment Terms (Days)</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="30" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {/* Document Upload Section - Simplified */}
                            <div className="border-t pt-6 mt-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Documents Upload (Checklist)
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <WorkingFileUpload
                                  documentType="gstCertificate"
                                  label="GST Certificate"
                                  clientId={editingClient?.id}
                                  onUploadComplete={handleUploadComplete}
                                />
                                <WorkingFileUpload
                                  documentType="panCopy"
                                  label="PAN Copy"
                                  clientId={editingClient?.id}
                                  onUploadComplete={handleUploadComplete}
                                />
                                <WorkingFileUpload
                                  documentType="securityCheque"
                                  label="Security Cheque"
                                  clientId={editingClient?.id}
                                  onUploadComplete={handleUploadComplete}
                                />
                                <WorkingFileUpload
                                  documentType="aadharCard"
                                  label="Aadhar Card"
                                  clientId={editingClient?.id}
                                  onUploadComplete={handleUploadComplete}
                                />
                                <WorkingFileUpload
                                  documentType="agreement"
                                  label="Agreement"
                                  clientId={editingClient?.id}
                                  onUploadComplete={handleUploadComplete}
                                />
                                <WorkingFileUpload
                                  documentType="poRateContract"
                                  label="PO / Rate Contract"
                                  clientId={editingClient?.id}
                                  onUploadComplete={handleUploadComplete}
                                />
                              </div>
                              
                              <p className="text-sm text-gray-500 mt-3">
                                Upload documents for this client. Files are securely stored in cloud storage and can be managed after client creation.
                              </p>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createClientMutation.isPending || updateClientMutation.isPending}>
                                {createClientMutation.isPending || updateClientMutation.isPending 
                                  ? (editingClient ? "Updating..." : "Creating...") 
                                  : (editingClient ? "Update Client" : "Create Client")
                                }
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
      </div>

      {/* Category Stats - Full Width 5 Columns */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {categoryStats.map((category, index) => (
          <Card key={index} className={`${category.color} text-white`}>
            <CardContent className="p-3">
              <p className="text-sm font-medium opacity-90">{category.name}</p>
              <p className="text-xl font-bold">{category.count}</p>
              <p className="text-xs opacity-75">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Search & Filters</span>
            </div>
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <Input 
                  type="text" 
                  placeholder="Search clients..." 
                  className="pl-9 h-8 text-sm"
                />
              </div>
              <Input type="date" className="w-32 h-8 text-sm" placeholder="dd-mm-yyyy" />
              <Input type="date" className="w-32 h-8 text-sm" placeholder="dd-mm-yyyy" />
              <Button variant="outline" size="sm" className="h-8">
                <Download size={14} className="mr-1" />
                Export Excel
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Upload Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-gray-800">Bulk Operations</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 bg-green-100 border-green-400 text-green-700 hover:bg-green-200 font-medium">
                <Download size={14} className="mr-1" />
                Export CSV
              </Button>
              <a href="/bulk-upload">
                <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  <Upload size={14} className="mr-1" />
                  Import Clients
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="flex-1 min-w-0">
        <CardHeader className="py-2 px-3 border-b">
          <h3 className="text-base font-semibold">Clients ({Array.isArray(filteredClients) ? filteredClients.length : 0})</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-2 py-2 whitespace-nowrap">Client Name</th>
                  <th className="px-2 py-2 whitespace-nowrap">Category</th>
                  <th className="px-2 py-2 whitespace-nowrap">Contact</th>
                  <th className="px-2 py-2 whitespace-nowrap">Sales Person</th>
                  <th className="px-2 py-2 whitespace-nowrap">Compliance</th>
                  <th className="px-2 py-2 whitespace-nowrap">Documents</th>
                  <th className="px-2 py-2 whitespace-nowrap">Payment Terms</th>
                  <th className="px-2 py-2 whitespace-nowrap">Credit Limit</th>
                  <th className="px-2 py-2 whitespace-nowrap">Created</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div></td>
                      <td className="px-2 py-2"><div className="h-5 bg-gray-200 rounded w-14 animate-pulse"></div></td>
                      <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                      <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                      <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div></td>
                      <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></td>
                      <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></td>
                      <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div></td>
                      <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></td>
                      <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-6 animate-pulse"></div></td>
                    </tr>
                  ))
                ) : !filteredClients || (Array.isArray(filteredClients) && filteredClients.length === 0) ? (
                  <tr>
                    <td colSpan={10} className="px-2 py-8 text-center text-gray-500">
                      <Users className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <p>No clients found</p>
                    </td>
                  </tr>
                ) : (
                  (filteredClients as any[]).map((client: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-2">
                        <div>
                          <div 
                            onClick={() => handleViewClient(client)}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-sm"
                          >
                            {client.name}
                          </div>
                          <div className="text-xs text-gray-500">{client.companyType || 'Pvt Ltd'}</div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <Badge className={`${getCategoryColor(client.category)} text-xs px-2 py-0.5`}>
                          {client.category === 'ALFA' ? 'Alpha' : client.category}
                        </Badge>
                      </td>
                      <td className="px-2 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.contactPersonName || client.name}</div>
                          <div className="text-xs text-gray-500">{client.mobileNumber || '-'}</div>
                          <div className="text-xs text-gray-500 max-w-[180px] truncate">{client.email || '-'}</div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.salesPersonName || 'TANAY MONDAL'}</div>
                          <div className="text-xs text-gray-500">ADMIN</div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="text-xs text-gray-900">
                          {client.gstNumber ? <span>GST: {client.gstNumber}</span> : <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <DocumentStatus client={client} />
                      </td>
                      <td className="px-2 py-2">
                        <div className="text-sm text-gray-900">
                          {client.paymentTerms || 30} days
                          <div className="text-xs text-gray-500">{client.poRequired ? 'PO: Required' : 'PO: Not Required'}</div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {client.creditLimit ? `₹${parseInt(client.creditLimit).toLocaleString()}` : '-'}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="px-2 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => handleViewClient(client)}>
                              <Eye className="mr-2 h-3 w-3" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                              <Edit className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClient(client)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Client View Dialog */}
      {viewingClient && (
        <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[#dc322f]" />
                {viewingClient.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Category:</span>
                      <Badge className={`ml-2 ${getCategoryColor(viewingClient.category)}`}>
                        {viewingClient.category}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="ml-2">{viewingClient.email || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Phone:</span>
                      <span className="ml-2">{viewingClient.mobileNumber || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">GST Number:</span>
                      <span className="ml-2">{viewingClient.gstNumber || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Address Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Address Line:</span>
                      <span className="ml-2">{viewingClient.billingAddressLine || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">City:</span>
                      <span className="ml-2">{viewingClient.billingCity || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">State:</span>
                      <span className="ml-2">{viewingClient.billingState || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Pincode:</span>
                      <span className="ml-2">{viewingClient.billingPincode || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Financial Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Credit Limit:</span>
                      <span className="ml-2 font-semibold text-lg text-[#dc322f]">
                        {viewingClient.creditLimit ? `₹${parseInt(viewingClient.creditLimit).toLocaleString()}` : 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Payment Terms:</span>
                            <span className="ml-2">{viewingClient.paymentTerms || 30} days</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">PAN Number:</span>
                            <span className="ml-2">{viewingClient.panNumber || 'Not provided'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">MSME Number:</span>
                            <span className="ml-2">{viewingClient.msmeNumber || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#dc322f]" />
                        Document Downloads
                      </h4>
                      <ClientDocumentDownloads client={viewingClient} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => handleEditClient(viewingClient)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Client
                    </Button>
                    <Button onClick={() => setViewingClient(null)}>Close</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Client Attachments Section */}
            <ClientAttachmentsSection />
    </div>
  );
}

// Enhanced Document Downloads Component
function ClientDocumentDownloads({ client }: { client: any }) {
  const documents = [
    { key: 'gstCertificateUploaded', label: 'GST Certificate', type: 'gstCertificate', icon: FileText },
    { key: 'panCopyUploaded', label: 'PAN Copy', type: 'panCopy', icon: FileText },
    { key: 'securityChequeUploaded', label: 'Security Cheque', type: 'securityCheque', icon: FileText },
    { key: 'aadharCardUploaded', label: 'Aadhar Card', type: 'aadharCard', icon: FileText },
    { key: 'agreementUploaded', label: 'Agreement', type: 'agreement', icon: FileText },
    { key: 'poRateContractUploaded', label: 'PO / Rate Contract', type: 'poRateContract', icon: FileText }
  ];

  const handleDownloadDocument = async (documentType: string, docLabel: string) => {
    try {
      console.log(`Downloading document: ${documentType} for client: ${client.id}`);
      
      // First get the document URL from the API
      const response = await fetch(`/api/clients/${client.id}/documents/${documentType}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Got document URL: ${data.documentUrl}`);
        
        // Open in new tab for download
        const link = document.createElement('a');
        link.href = data.documentUrl;
        link.download = `${client.name}_${docLabel}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const errorData = await response.json();
        console.error('Document API error:', errorData);
        throw new Error(errorData.message || 'Document not found');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Document not available for download. Please re-upload the document.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((doc) => {
        const Icon = doc.icon;
        const isUploaded = client[doc.key];
        
        return (
          <div key={doc.key} className={`p-4 border rounded-lg ${isUploaded ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isUploaded ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-medium text-gray-900">{doc.label}</p>
                  <p className="text-xs text-gray-500">
                    {isUploaded ? 'Available' : 'Not uploaded'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isUploaded ? (
                  <>
                    <Badge className="bg-green-100 text-green-800 text-xs">Uploaded</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadDocument(doc.type, doc.label)}
                      className="text-[#dc322f] border-[#dc322f] hover:bg-[#dc322f] hover:text-white"
                      data-testid={`button-download-${doc.type}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary" className="text-xs">Missing</Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Document Status Component  
function DocumentStatus({ client }: { client: any }) {
  const documents = [
    { key: 'gstCertificateUploaded', label: 'GST', type: 'gstCertificate' },
    { key: 'panCopyUploaded', label: 'PAN', type: 'panCopy' },
    { key: 'securityChequeUploaded', label: 'SEC', type: 'securityCheque' },
    { key: 'aadharCardUploaded', label: 'ADH', type: 'aadharCard' },
    { key: 'agreementUploaded', label: 'AGR', type: 'agreement' },
    { key: 'poRateContractUploaded', label: 'PO', type: 'poRateContract' }
  ];

  const handleDownloadDocument = async (documentType: string, docLabel: string) => {
    try {
      // Direct download without opening a preview
      const documentUrl = `/objects/uploads/${client.id}/${documentType}`;
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = `${client.name}_${docLabel}_${documentType}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <div className="space-y-1">
      {documents.map((doc) => (
        <div key={doc.key} className="flex items-center justify-between text-xs">
          <span className="text-gray-600 w-8">{doc.label}:</span>
          {client[doc.key] ? (
            <div className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <button
                onClick={() => handleDownloadDocument(doc.type, doc.label)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title={`Download ${doc.label} document`}
              >
                <Download size={12} />
              </button>
            </div>
          ) : (
            <span className="text-red-600">✗</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Client Attachments Component
function ClientAttachmentsSection() {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });


  const getAttachmentDisplayName = (type: string) => {
    const names: Record<string, string> = {
      'gstCertificate': 'GST Certificate',
      'panCopy': 'PAN Copy',
      'securityCheque': 'Security Cheque',
      'aadharCard': 'Aadhar Card',
      'agreement': 'Agreement',
      'poRateContract': 'PO Rate Contract'
    };
    return names[type] || type;
  };

  const getAttachmentIcon = (type: string) => {
    const icons: Record<string, any> = {
      'gstCertificate': FileText,
      'panCopy': CreditCard,
      'securityCheque': Shield,
      'aadharCard': Building,
      'agreement': FileCheck,
      'poRateContract': ScrollText
    };
    return icons[type] || FileText;
  };

  const attachmentTypes = [
    'gstCertificate',
    'panCopy', 
    'securityCheque',
    'aadharCard',
    'agreement',
    'poRateContract'
  ];

  const selectedClient = (clients as any[])?.find((c: any) => c.id === selectedClientId);

  return (
    <Card className="mt-6">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Client Document Attachments
        </h3>
        <p className="text-gray-600">Upload and manage client documents (PDF, Word, Images)</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Client Selection */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Client:</label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose client to upload documents" />
              </SelectTrigger>
              <SelectContent>
                {(clients as any[])?.map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Attachment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attachmentTypes.map((type) => {
              const Icon = getAttachmentIcon(type);
              const isUploaded = selectedClient?.[`${type}Uploaded`];
              
              return (
                <Card key={type} className={`p-4 ${isUploaded ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-5 w-5 ${isUploaded ? 'text-green-600' : 'text-gray-400'}`} />
                    <h4 className="font-medium text-gray-900">{getAttachmentDisplayName(type)}</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {isUploaded ? (
                      <div className="space-y-2">
                        <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            // Direct download without preview
                            const link = document.createElement('a');
                            link.href = `/objects/uploads/${selectedClient.id}/${type}`;
                            link.download = `${getAttachmentDisplayName(type)}_${selectedClient.name}`;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          data-testid={`button-download-${type}`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download Document
                        </Button>
                      </div>
                    ) : (
                      <WorkingFileUpload
                        documentType={type}
                        label={getAttachmentDisplayName(type)}
                        clientId={selectedClientId}
                        onUploadComplete={(docType, success, fileUrl) => {
                          if (success && selectedClientId && fileUrl) {
                            // Update client with uploaded document
                            queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
                            toast({
                              title: "Success",
                              description: `${getAttachmentDisplayName(type)} uploaded successfully`,
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {!selectedClientId && (
            <div className="text-center py-8 text-gray-500">
              <Upload className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Select a client above to upload documents</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
