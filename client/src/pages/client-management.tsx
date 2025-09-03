
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
      return await apiRequest('POST', '/api/clients', data);
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
      return await apiRequest('PUT', `/api/clients/${id}`, data);
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
      return await apiRequest('DELETE', `/api/clients/${id}`);
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
      name: "Alpha",
      count: (stats as any)?.clientCategories?.ALFA || 0,
      description: "Premium clients",
      color: "bg-green-500"
    },
    {
      name: "Beta", 
      count: (stats as any)?.clientCategories?.BETA || 0,
      description: "Standard clients",
      color: "bg-blue-500"
    },
    {
      name: "Gamma",
      count: (stats as any)?.clientCategories?.GAMMA || 0,
      description: "Regular clients", 
      color: "bg-yellow-500"
    },
    {
      name: "Delta",
      count: (stats as any)?.clientCategories?.DELTA || 0,
      description: "New clients",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
        <p className="text-gray-600 mt-1">Manage client information and categorization</p>
      </div>
      
      {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {categoryStats.map((category, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{category.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Filters and Actions */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Client Directory</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        type="text" 
                        placeholder="Search clients..." 
                        className="w-64 pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="ALFA">Alpha</SelectItem>
                        <SelectItem value="BETA">Beta</SelectItem>
                        <SelectItem value="GAMMA">Gamma</SelectItem>
                        <SelectItem value="DELTA">Delta</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter size={16} className="mr-2" />
                      Filter
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus size={16} className="mr-2" />
                          Add Client
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
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
                </div>
              </CardHeader>
            </Card>

            {/* Clients Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Contact</th>
                        <th className="px-6 py-3">Documents</th>
                        <th className="px-6 py-3">Credit Limit</th>
                        <th className="px-6 py-3">Payment Terms</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                          </tr>
                        ))
                      ) : !filteredClients || (Array.isArray(filteredClients) && filteredClients.length === 0) ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No clients found</p>
                          </td>
                        </tr>
                      ) : (
                        (filteredClients as any[]).map((client: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <button
                                  onClick={() => handleViewClient(client)}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer bg-transparent border-none p-0 m-0"
                                  data-testid={`link-client-${client.id}`}
                                >
                                  {client.name}
                                </button>
                                <div className="text-sm text-gray-500">{client.gstNumber || 'No GST'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={getCategoryColor(client.category)}>
                                {client.category}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-gray-900">{client.email || 'No email'}</div>
                                <div className="text-sm text-gray-500">{client.mobileNumber || 'No phone'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <DocumentStatus client={client} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">
                                {client.creditLimit ? `₹${parseInt(client.creditLimit).toLocaleString()}` : 'Not set'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900">{client.paymentTerms || 30} days</div>
                            </td>
                            <td className="px-6 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleViewClient(client)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditClient(client)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Client
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClient(client)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Client
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
    { key: 'gstCertificateUploaded', label: 'GST Certificate', type: 'gst-certificate', icon: FileText },
    { key: 'panCopyUploaded', label: 'PAN Copy', type: 'pan-copy', icon: FileText },
    { key: 'securityChequeUploaded', label: 'Security Cheque', type: 'security-cheque', icon: FileText },
    { key: 'aadharCardUploaded', label: 'Aadhar Card', type: 'aadhar-card', icon: FileText },
    { key: 'agreementUploaded', label: 'Agreement', type: 'agreement', icon: FileText },
    { key: 'poRateContractUploaded', label: 'PO / Rate Contract', type: 'po-rate-contract', icon: FileText }
  ];

  const handleDownloadDocument = async (documentType: string, docLabel: string) => {
    try {
      // First try to get the document URL from the API
      const response = await fetch(`/api/clients/${client.id}/documents/${documentType}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Open in new tab for download
        window.open(data.documentUrl, '_blank');
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      // Show user-friendly error message
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
