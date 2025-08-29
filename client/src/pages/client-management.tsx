
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, Users, Edit, Eye, Upload, Download, FileText, Shield, CreditCard, Building, FileCheck, ScrollText } from "lucide-react";
import { useState } from "react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { DragDropUpload } from "@/components/DragDropUpload";

export default function ClientManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const form = useForm({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      category: "BETA",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
      creditLimit: "",
      paymentTerms: 30
    }
  });

  const handleDocumentUpload = (documentType: string, success: boolean) => {
    setDocumentUploads(prev => ({
      ...prev,
      [documentType]: success
    }));
  };

  const onSubmit = (data: any) => {
    createClientMutation.mutate({
      ...data,
      creditLimit: data.creditLimit ? parseFloat(data.creditLimit) : null,
      // Add document upload status
      gstCertificateUploaded: documentUploads.gstCertificate || false,
      panCopyUploaded: documentUploads.panCopy || false,
      securityChequeUploaded: documentUploads.securityCheque || false,
      aadharCardUploaded: documentUploads.aadharCard || false,
      agreementUploaded: documentUploads.agreement || false,
      poRateContractUploaded: documentUploads.poRateContract || false,
    });
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
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus size={16} className="mr-2" />
                          Add Client
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Client</DialogTitle>
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
                                name="phone"
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
                              name="address"
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
                            
                            {/* Document Upload Section */}
                            <div className="border-t pt-6 mt-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Documents Upload (Checklist)
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DragDropUpload
                                  documentType="gstCertificate"
                                  onUploadComplete={handleDocumentUpload}
                                />
                                <DragDropUpload
                                  documentType="panCopy"
                                  onUploadComplete={handleDocumentUpload}
                                />
                                <DragDropUpload
                                  documentType="securityCheque"
                                  onUploadComplete={handleDocumentUpload}
                                />
                                <DragDropUpload
                                  documentType="aadharCard"
                                  onUploadComplete={handleDocumentUpload}
                                />
                                <DragDropUpload
                                  documentType="agreement"
                                  onUploadComplete={handleDocumentUpload}
                                />
                                <DragDropUpload
                                  documentType="poRateContract"
                                  onUploadComplete={handleDocumentUpload}
                                />
                              </div>
                              <p className="text-sm text-gray-500 mt-3">
                                You can upload documents now or later after creating the client.
                              </p>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createClientMutation.isPending}>
                                {createClientMutation.isPending ? "Creating..." : "Create Client"}
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
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                          </tr>
                        ))
                      ) : !filteredClients || filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No clients found</p>
                          </td>
                        </tr>
                      ) : (
                        (filteredClients as any[]).map((client: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{client.name}</div>
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
                                <div className="text-sm text-gray-500">{client.phone || 'No phone'}</div>
                              </div>
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
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit size={16} className="mr-1" />
                                  Edit
                                </Button>
                                <Button variant="link" size="sm">
                                  <Eye size={16} className="mr-1" />
                                  View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Client Attachments Section */}
            <ClientAttachmentsSection />
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

  const handleGetUploadParameters = async () => {
    const response = await apiRequest('POST', '/api/objects/upload', {}) as any;
    return {
      method: 'PUT' as const,
      url: response.uploadURL,
    };
  };

  const handleUploadComplete = async (attachmentType: string, result: any) => {
    if (!selectedClientId) {
      toast({
        title: "Error",
        description: "Please select a client first",
        variant: "destructive"
      });
      return;
    }

    try {
      const uploadURL = result.successful[0]?.uploadURL;
      if (!uploadURL) {
        throw new Error("No upload URL found");
      }

      await apiRequest('PUT', `/api/clients/${selectedClientId}/attachments`, {
        attachmentType,
        fileURL: uploadURL
      });

      toast({
        title: "Success",
        description: `${getAttachmentDisplayName(attachmentType)} uploaded successfully`,
      });

      // Refresh clients data
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    } catch (error) {
      console.error("Upload completion error:", error);
      toast({
        title: "Error", 
        description: "Failed to save attachment",
        variant: "destructive"
      });
    }
  };

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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              // View file in browser
                              window.open(`/objects/uploads/${selectedClient.id}/${type}`, '_blank');
                            }}
                            data-testid={`button-view-${type}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              // Download file
                              const link = document.createElement('a');
                              link.href = `/objects/uploads/${selectedClient.id}/${type}`;
                              link.download = `${getAttachmentDisplayName(type)}_${selectedClient.name}`;
                              link.click();
                            }}
                            data-testid={`button-download-${type}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={10485760} // 10MB
                        onGetUploadParameters={handleGetUploadParameters}
                        onComplete={(result) => handleUploadComplete(type, result)}
                        buttonClassName="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {getAttachmentDisplayName(type)}
                      </ObjectUploader>
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
