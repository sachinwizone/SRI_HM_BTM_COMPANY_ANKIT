import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema, type Client, type InsertClient } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, MapPin, FileText, Building, User, CreditCard, Truck, X, Upload, File, Check, Search, Calendar, Filter, Download, Trash2, Eye, Activity } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { Client360View } from "@/components/analytics/client-360-view";
import { DataTable } from "@/components/ui/data-table";
import { z } from "zod";

// Extended schema with multi-select communication preferences and shipping addresses
const extendedClientSchema = insertClientSchema.extend({
  communicationPreferences: z.array(z.enum(['EMAIL', 'WHATSAPP', 'PHONE', 'SMS'])).default([]),
  invoicingEmails: z.array(z.string().email()).default([]),
  shippingAddresses: z.array(z.object({
    addressLine: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    pincode: z.string().min(1, "Pincode is required"),
    contactPersonName: z.string().optional(),
    contactPersonMobile: z.string().optional(),
    deliveryAddressName: z.string().optional(),
    googleLatitude: z.number().optional(),
    googleLongitude: z.number().optional(),
    deliveryWindowFrom: z.string().optional(),
    deliveryWindowTo: z.string().optional(),
    unloadingFacility: z.enum(['PUMP', 'CRANE', 'MANUAL', 'OTHERS']).optional(),
  })).default([]),
});

type ExtendedClient = z.infer<typeof extendedClientSchema>;

const categoryColors = {
  ALFA: "bg-green-500 text-white border-green-600",
  BETA: "bg-yellow-500 text-white border-yellow-600", 
  GAMMA: "bg-orange-500 text-white border-orange-600",
  DELTA: "bg-red-500 text-white border-red-600",
};

const categoryLabels = {
  ALFA: "Alfa",
  BETA: "Beta", 
  GAMMA: "Gamma",
  DELTA: "Delta",
};

const companyTypeLabels = {
  PVT_LTD: "Pvt Ltd",
  PARTNERSHIP: "Partnership",
  PROPRIETOR: "Proprietor",
  GOVT: "Govt",
  OTHERS: "Others",
};

const communicationOptions = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'SMS', label: 'SMS' },
];

const unloadingFacilityOptions = [
  { value: 'PUMP', label: 'Pump' },
  { value: 'CRANE', label: 'Crane' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'OTHERS', label: 'Others' },
];

const indianStates = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
  { value: 'Ladakh', label: 'Ladakh' },
  { value: 'Lakshadweep', label: 'Lakshadweep' },
  { value: 'Puducherry', label: 'Puducherry' },
];

export default function Clients() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{
    gstCertificate?: File;
    panCopy?: File;
    securityCheque?: File;
    aadharCard?: File;
    agreement?: File;
    poRateContract?: File;
  }>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["/api/clients", selectedCategory, searchTerm, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const url = `/api/clients${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch clients');
      return await response.json();
    },
  });

  const { data: clientStats = { ALFA: 0, BETA: 0, GAMMA: 0, DELTA: 0, total: 0 } } = useQuery({
    queryKey: ["/api/clients/stats"],
  });

  const salesUsers = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users", { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    },
  });

  const form = useForm<ExtendedClient>({
    resolver: zodResolver(extendedClientSchema),
    defaultValues: {
      name: "",
      category: "ALFA",
      billingAddressLine: "",
      billingCity: "",
      billingPincode: "",
      billingState: "",
      billingCountry: "India",
      gstNumber: "",
      panNumber: "",
      msmeNumber: "",
      incorporationCertNumber: "",
      incorporationDate: null,
      companyType: "PVT_LTD",
      contactPersonName: "",
      mobileNumber: "",
      email: "",
      communicationPreferences: [],
      paymentTerms: 30,
      creditLimit: "",
      interestPercent: "",
      bankInterestApplicable: "FROM_DUE_DATE",
      poRequired: false,
      invoicingEmails: [],
      primarySalesPersonId: null,
      gstCertificateUploaded: false,
      panCopyUploaded: false,
      securityChequeUploaded: false,
      aadharCardUploaded: false,
      agreementUploaded: false,
      poRateContractUploaded: false,
      shippingAddresses: [],
    },
  });

  const { fields: shippingFields, append: appendShipping, remove: removeShipping } = useFieldArray({
    control: form.control,
    name: "shippingAddresses",
  });

  const clientMutation = useMutation({
    mutationFn: async (data: ExtendedClient) => {
      // Separate shipping addresses from client data
      const { shippingAddresses, ...clientData } = data;
      
      if (editingClient) {
        const updatedClient = await apiRequest(`/api/clients/${editingClient.id}`, "PUT", clientData);
        return updatedClient;
      } else {
        const newClient = await apiRequest("/api/clients", "POST", clientData);
        return newClient;
      }
    },
    onSuccess: (client) => {
      // Set current client ID for document uploads
      setCurrentClientId(client.id);
      
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: `Client ${editingClient ? "updated" : "created"} successfully`,
      });
      
      // Don't close form immediately - allow document uploads
      if (!editingClient) {
        toast({
          title: "Next Step",
          description: "You can now upload documents for this client",
          variant: "default",
        });
      } else {
        setIsFormOpen(false);
        form.reset();
        setEditingClient(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      ...client,
      incorporationDate: client.incorporationDate ? new Date(client.incorporationDate) : null,
      communicationPreferences: (client.communicationPreferences || []) as any,
      invoicingEmails: client.invoicingEmails || [],
      shippingAddresses: [], // Will load separately
      // Handle null values for form fields
      billingAddressLine: client.billingAddressLine || "",
      billingCity: client.billingCity || "",
      billingPincode: client.billingPincode || "",
      billingState: client.billingState || "",
      billingCountry: client.billingCountry || "India",
      gstNumber: client.gstNumber || "",
      panNumber: client.panNumber || "",
      msmeNumber: client.msmeNumber || "",
      incorporationCertNumber: client.incorporationCertNumber || "",
      contactPersonName: client.contactPersonName || "",
      mobileNumber: client.mobileNumber || "",
      email: client.email || "",
      paymentTerms: client.paymentTerms || 30,
      creditLimit: client.creditLimit || "",
      companyType: client.companyType || "PVT_LTD",
      bankInterestApplicable: client.bankInterestApplicable || "FROM_DUE_DATE",
      interestPercent: client.interestPercent || "",
      poRequired: client.poRequired || false,
      primarySalesPersonId: client.primarySalesPersonId || null,
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingClient(null);
    form.reset({
      name: "",
      category: "ALFA",
      billingAddressLine: "",
      billingCity: "",
      billingPincode: "",
      billingState: "",
      billingCountry: "India",
      gstNumber: "",
      panNumber: "",
      msmeNumber: "",
      incorporationCertNumber: "",
      incorporationDate: null,
      companyType: "PVT_LTD",
      contactPersonName: "",
      mobileNumber: "",
      email: "",
      communicationPreferences: [],
      paymentTerms: 30,
      creditLimit: "",
      interestPercent: "",
      bankInterestApplicable: "FROM_DUE_DATE",
      poRequired: false,
      invoicingEmails: [],
      primarySalesPersonId: user?.id || null, // Default to current user
      gstCertificateUploaded: false,
      panCopyUploaded: false,
      securityChequeUploaded: false,
      aadharCardUploaded: false,
      agreementUploaded: false,
      poRateContractUploaded: false,
      shippingAddresses: [],
    });
    setUploadedFiles({});
    setIsFormOpen(true);
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  const exportToExcel = () => {
    import('xlsx').then((XLSX) => {
      import('file-saver').then((FileSaver) => {
        const exportData = (clients as Client[]).map((client: Client) => ({
          'Client Name': client.name,
          'Category': client.category,
          'Company Type': client.companyType,
          'Contact Person': client.contactPersonName || '',
          'Mobile': client.mobileNumber || '',
          'Email': client.email || '',
          'GST Number': client.gstNumber || '',
          'PAN Number': client.panNumber || '',
          'MSME Number': client.msmeNumber || '',
          'Billing Address': `${client.billingAddressLine || ''}, ${client.billingCity || ''}, ${client.billingPincode || ''}`,
          'Payment Terms (Days)': client.paymentTerms || '',
          'Credit Limit': client.creditLimit || '',
          'PO Required': client.poRequired ? 'Yes' : 'No',
          'Interest Rate %': client.interestPercent || '',
          'Created Date': client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '',
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clients');
        
        const fileName = `clients_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
      });
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients/stats"] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      setClientToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [currentClientId, setCurrentClientId] = useState<string | null>(null);

  const handleViewDocument = async (clientId: string, documentType: string) => {
    try {
      // Create a temporary link to open the document in a new tab
      const documentUrl = `/objects/uploads/${clientId}/${documentType}`;
      window.open(documentUrl, '_blank');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive",
      });
    }
  };

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("/api/clients/documents/upload", "POST", {});
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload parameters:", error);
      throw error;
    }
  };

  const handleDocumentUpload = async (documentType: string, result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (!result.successful || result.successful.length === 0) {
      toast({
        title: "Error",
        description: "File upload failed",
        variant: "destructive",
      });
      return;
    }

    const uploadedFile = result.successful[0];
    if (!uploadedFile.uploadURL || !currentClientId) {
      toast({
        title: "Error", 
        description: "Upload URL or client ID missing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert document type to API format
      const apiDocumentType = documentType
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');

      await apiRequest(`/api/clients/${currentClientId}/documents/${apiDocumentType}`, "PUT", {
        documentURL: uploadedFile.uploadURL,
      });

      // Update the form state
      form.setValue(`${documentType}Uploaded` as any, true);

      toast({
        title: "Success",
        description: `${documentType} uploaded successfully`,
      });

      // Refresh clients data to show updated status
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    } catch (error: any) {
      console.error("Failed to update document status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update document status",
        variant: "destructive",
      });
    }
  };

  const renderFileUpload = (documentType: string, label: string) => {
    const isUploaded = form.watch(`${documentType}Uploaded` as any);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          {isUploaded && (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-xs">Uploaded</span>
            </div>
          )}
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
          {!isUploaded ? (
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760} // 10MB
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={(result) => handleDocumentUpload(documentType, result)}
              buttonClassName="w-full h-24 border-none bg-transparent hover:bg-gray-50"
            >
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Upload className="h-8 w-8" />
                <span className="text-sm">Click to upload {label}</span>
                <span className="text-xs text-gray-400">PDF, JPG, PNG, DOC (max 10MB)</span>
              </div>
            </ObjectUploader>
          ) : (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <File className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">{label} uploaded successfully</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const addShippingAddress = () => {
    appendShipping({
      addressLine: "",
      city: "",
      pincode: "",
      contactPersonName: "",
      contactPersonMobile: "",
      deliveryAddressName: "",
      googleLatitude: undefined,
      googleLongitude: undefined,
      deliveryWindowFrom: "",
      deliveryWindowTo: "",
      unloadingFacility: "MANUAL",
    });
  };

  const addInvoicingEmail = () => {
    if (emailInput.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      const currentEmails = form.getValues("invoicingEmails");
      form.setValue("invoicingEmails", [...currentEmails, emailInput.trim()]);
      setEmailInput("");
    }
  };

  const removeInvoicingEmail = (index: number) => {
    const currentEmails = form.getValues("invoicingEmails");
    form.setValue("invoicingEmails", currentEmails.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading clients...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage your clients and their information</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="client-form-description">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
            </DialogHeader>
            <div id="client-form-description" className="sr-only">
              Form to create or edit client information including company details, contacts, and documents
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => clientMutation.mutate(data))} className="space-y-6">
                
                {/* Company & Compliance Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building className="h-5 w-5 text-blue-600" />
                      Company & Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Name *</FormLabel>
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
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ALFA">Alfa</SelectItem>
                                <SelectItem value="BETA">Beta</SelectItem>
                                <SelectItem value="GAMMA">Gamma</SelectItem>
                                <SelectItem value="DELTA">Delta</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Billing Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="billingAddressLine"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Address Line</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter billing address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billingCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billingPincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter pincode" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billingState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {indianStates.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
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
                          name="billingCountry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter GST number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="panNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PAN Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter PAN number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="msmeNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MSME / Udyam Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter MSME number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="incorporationCertNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Incorporation Certificate Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter certificate number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="incorporationDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Incorporation Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "PVT_LTD"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select company type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PVT_LTD">Pvt Ltd</SelectItem>
                                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                                <SelectItem value="PROPRIETOR">Proprietor</SelectItem>
                                <SelectItem value="GOVT">Govt</SelectItem>
                                <SelectItem value="OTHERS">Others</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Primary Contact Details Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-green-600" />
                      Primary Contact Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactPersonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact person name" {...field} />
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
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormLabel>Communication Preference</FormLabel>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {communicationOptions.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="communicationPreferences"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value as any)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || [];
                                      if (checked) {
                                        field.onChange([...value, option.value]);
                                      } else {
                                        field.onChange(value.filter((v) => v !== option.value));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Addresses Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      Shipping Addresses
                    </CardTitle>
                    <CardDescription>
                      Add multiple shipping addresses for this client
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shippingFields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Address {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeShipping(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.addressLine`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Address Line *</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter shipping address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.city`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter city" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.pincode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter pincode" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.contactPersonName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Person Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter contact person" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.contactPersonMobile`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Person Mobile</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter mobile number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.deliveryAddressName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Address / Project Site Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter project site name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.googleLocation`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Google Location / Maps Link</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter address or paste Google Maps link" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.deliveryWindowFrom`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Window From</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.deliveryWindowTo`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Window To</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.unloadingFacility`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unloading Facility</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select facility" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {unloadingFacilityOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
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
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addShippingAddress}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Shipping Address
                    </Button>
                  </CardContent>
                </Card>

                {/* Commercial & Finance Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      Commercial & Finance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Payment & Credit Terms */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          Payment & Credit Terms
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="paymentTerms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Terms (Days) *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Enter payment terms"
                                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 30)}
                                  />
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
                                <FormLabel>Credit Limit (₹)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="Enter credit limit"
                                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? e.target.value : null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Interest Configuration */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          Interest Configuration
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="bankInterestApplicable"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Interest Applicable From</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || "FROM_DUE_DATE"}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                      <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="FROM_DAY_1">From Day 1</SelectItem>
                                    <SelectItem value="FROM_DUE_DATE">From Due Date</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="interestPercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Interest Rate (%)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="Enter interest percentage"
                                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Order Requirements */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-orange-600" />
                          Order Requirements
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <FormField
                            control={form.control}
                            name="poRequired"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    Purchase Order Required
                                  </FormLabel>
                                  <p className="text-xs text-gray-500">
                                    Require PO before processing orders from this client
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                      {/* Invoicing Configuration */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <User className="h-4 w-4 text-green-600" />
                          Invoicing Configuration
                        </h4>
                        <div className="space-y-3">
                          <FormLabel>Invoicing Email(s)</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addInvoicingEmail();
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={addInvoicingEmail}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {form.watch("invoicingEmails")?.map((email, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {email}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-red-600" 
                                  onClick={() => removeInvoicingEmail(index)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                  </CardContent>
                </Card>

                {/* Sales Assignment Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-purple-600" />
                      Sales Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="primarySalesPersonId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Sales Person</FormLabel>
                          {user?.role === 'SALES_EXECUTIVE' ? (
                            // For Sales Executive: Show only their name (no dropdown)
                            <div className="p-3 bg-gray-50 border border-gray-300 rounded-md">
                              <span className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName} ({user.role})
                              </span>
                            </div>
                          ) : (
                            // For Admin and Sales Manager: Show dropdown
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                  <SelectValue placeholder="Select sales person" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {salesUsers.data?.filter(user => 
                                  user.role === 'SALES_MANAGER' || 
                                  user.role === 'SALES_EXECUTIVE' || 
                                  user.role === 'ADMIN'
                                ).map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Documents Upload Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      Documents Upload (Checklist)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderFileUpload("gstCertificate", "GST Certificate")}
                      {renderFileUpload("panCopy", "PAN Copy")}
                      {renderFileUpload("securityCheque", "Security Cheque")}
                      {renderFileUpload("aadharCard", "Aadhar Card")}
                      {renderFileUpload("agreement", "Agreement")}
                      {renderFileUpload("poRateContract", "PO / Rate Contract")}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={clientMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {clientMutation.isPending ? "Saving..." : (editingClient ? "Update Client" : "Create Client")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client Category Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {/* Total Clients Card */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
            selectedCategory === null 
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-2 ring-blue-400" 
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white opacity-70"
          }`}
          onClick={() => handleCategoryFilter(null)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.total}</div>
            <p className="text-blue-100 text-sm">All categories</p>
          </CardContent>
        </Card>

        {/* Alfa Category Card - Green */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
            selectedCategory === 'ALFA' 
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-500 ring-2 ring-green-400" 
              : "bg-gradient-to-r from-green-400 to-green-500 text-white border border-green-400 opacity-80"
          }`}
          onClick={() => handleCategoryFilter('ALFA')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Alfa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.ALFA}</div>
            <p className="text-green-100 text-sm">Priority clients</p>
          </CardContent>
        </Card>

        {/* Beta Category Card - Butter Yellow */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
            selectedCategory === 'BETA' 
              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border border-yellow-500 ring-2 ring-yellow-400" 
              : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border border-yellow-400 opacity-80"
          }`}
          onClick={() => handleCategoryFilter('BETA')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Beta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.BETA}</div>
            <p className="text-yellow-100 text-sm">Regular clients</p>
          </CardContent>
        </Card>

        {/* Gamma Category Card - Orange */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
            selectedCategory === 'GAMMA' 
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border border-orange-500 ring-2 ring-orange-400" 
              : "bg-gradient-to-r from-orange-400 to-orange-500 text-white border border-orange-400 opacity-80"
          }`}
          onClick={() => handleCategoryFilter('GAMMA')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Gamma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.GAMMA}</div>
            <p className="text-orange-100 text-sm">Standard clients</p>
          </CardContent>
        </Card>

        {/* Delta Category Card - Red */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
            selectedCategory === 'DELTA' 
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-500 ring-2 ring-red-400" 
              : "bg-gradient-to-r from-red-400 to-red-500 text-white border border-red-400 opacity-80"
          }`}
          onClick={() => handleCategoryFilter('DELTA')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Delta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.DELTA}</div>
            <p className="text-red-100 text-sm">New clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date From */}
            <div>
              <Input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date To */}
            <div>
              <Input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={exportToExcel}
                className="flex-1"
                disabled={clients.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory || searchTerm || dateFrom || dateTo) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {categoryLabels[selectedCategory as keyof typeof categoryLabels]}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedCategory(null)}
                  />
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              {dateFrom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  From: {dateFrom}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setDateFrom("")}
                  />
                </Badge>
              )}
              {dateTo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  To: {dateTo}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setDateTo("")}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Grid/Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Clients ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!clients || clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-500 text-center mb-4">
                Get started by adding your first client
              </p>
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Sales Person</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Credit Limit</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(clients as Client[]).map((client: Client) => (
                    <TableRow key={client.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">
                          {client.companyType && companyTypeLabels[client.companyType]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryColors[client.category]}>
                          {categoryLabels[client.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {client.contactPersonName && <div className="font-medium">{client.contactPersonName}</div>}
                          {client.mobileNumber && <div>{client.mobileNumber}</div>}
                          {client.email && <div className="text-gray-500">{client.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {client.primarySalesPersonId ? (
                            (() => {
                              const salesPerson = salesUsers.data?.find(user => user.id === client.primarySalesPersonId);
                              return salesPerson ? (
                                <div>
                                  <div className="font-medium">{salesPerson.firstName} {salesPerson.lastName}</div>
                                  <div className="text-gray-500">{salesPerson.role}</div>
                                </div>
                              ) : (
                                <div className="text-gray-400">Unknown User</div>
                              );
                            })()
                          ) : (
                            <div className="text-gray-400">Not Assigned</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {client.gstNumber && <div>GST: {client.gstNumber}</div>}
                          {client.panNumber && <div>PAN: {client.panNumber}</div>}
                          {client.msmeNumber && <div>MSME: {client.msmeNumber}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          {[
                            { key: 'gstCertificateUploaded', label: 'GST', field: client.gstCertificateUploaded, docType: 'gst-certificate' },
                            { key: 'panCopyUploaded', label: 'PAN', field: client.panCopyUploaded, docType: 'pan-copy' },
                            { key: 'securityChequeUploaded', label: 'SEC', field: client.securityChequeUploaded, docType: 'security-cheque' },
                            { key: 'aadharCardUploaded', label: 'ADH', field: client.aadharCardUploaded, docType: 'aadhar-card' },
                            { key: 'agreementUploaded', label: 'AGR', field: client.agreementUploaded, docType: 'agreement' },
                            { key: 'poRateContractUploaded', label: 'PO', field: client.poRateContractUploaded, docType: 'po-rate-contract' },
                          ].map(({ key, label, field, docType }) => (
                            <div key={key} className="flex items-center gap-1">
                              {field ? (
                                <>
                                  <Check className="h-3 w-3 text-green-600" />
                                  <button
                                    onClick={() => handleViewDocument(client.id, docType)}
                                    className="text-green-600 hover:text-green-800 hover:underline cursor-pointer"
                                    title={`View ${label} document`}
                                  >
                                    {label}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 text-red-500" />
                                  <span className="text-red-500">{label}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{client.paymentTerms} days</div>
                          <div className="text-gray-500">PO: {client.poRequired ? 'Required' : 'Not Required'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {client.creditLimit ? `₹${parseFloat(client.creditLimit).toLocaleString()}` : '-'}
                          {client.interestPercent && (
                            <div className="text-gray-500">{client.interestPercent}% interest</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setClientToDelete(client)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{client.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setClientToDelete(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(client.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}