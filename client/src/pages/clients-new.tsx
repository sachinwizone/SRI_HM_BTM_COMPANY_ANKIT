import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Building2, User, MapPin, FileText, CreditCard, Upload, File, X, Check, Home } from "lucide-react";
import { clients, insertClientSchema, type Client, type InsertClient } from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";

const clientFormSchema = createInsertSchema(clients);

interface FileUploadState {
  gstCertificate?: File;
  panCopy?: File;
  cancelledCheque?: File;
  agreement?: File;
  poRateContract?: File;
}

export default function ClientsNew() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadState>({});
  const [emailInput, setEmailInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<InsertClient>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      companyName: "",
      companyType: "PVT_LTD",
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
      incorporationDate: "",
      contactPersonName: "",
      mobileNumber: "",
      email: "",
      paymentTerms: 30,
      creditLimit: "",
      bankInterestApplicable: "FROM_DUE_DATE",
      interestPercent: "",
      poRequired: false,
      invoicingEmails: [],
      shippingAddresses: [],
    },
  });

  // Fetch clients
  const { data: clientsData = [], isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Add/Update client mutation
  const clientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
      const method = editingClient ? "PATCH" : "POST";
      return await apiRequest(url, { method, body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ 
        title: "Success!", 
        description: `Client ${editingClient ? "updated" : "created"} successfully.`,
        variant: "default"
      });
      setIsFormOpen(false);
      form.reset();
      setUploadedFiles({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/clients/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ 
        title: "Success!", 
        description: "Client deleted successfully.",
        variant: "default"
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

  const onSubmit = (data: InsertClient) => {
    clientMutation.mutate(data);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      companyName: client.companyName || "",
      companyType: client.companyType || "PVT_LTD",
      category: client.category || "ALFA",
      billingAddressLine: client.billingAddressLine || "",
      billingCity: client.billingCity || "",
      billingPincode: client.billingPincode || "",
      billingState: client.billingState || "",
      billingCountry: client.billingCountry || "India",
      gstNumber: client.gstNumber || "",
      panNumber: client.panNumber || "",
      msmeNumber: client.msmeNumber || "",
      incorporationCertNumber: client.incorporationCertNumber || "",
      incorporationDate: client.incorporationDate || "",
      contactPersonName: client.contactPersonName || "",
      mobileNumber: client.mobileNumber || "",
      email: client.email || "",
      paymentTerms: client.paymentTerms || 30,
      creditLimit: client.creditLimit || "",
      bankInterestApplicable: client.bankInterestApplicable || "FROM_DUE_DATE",
      interestPercent: client.interestPercent || "",
      poRequired: client.poRequired || false,
      invoicingEmails: client.invoicingEmails || [],
      shippingAddresses: client.shippingAddresses || [],
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingClient(null);
    form.reset();
    setUploadedFiles({});
    setIsFormOpen(true);
  };

  const handleFileUpload = (documentType: string, file: File | null) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: file || undefined
    }));
  };

  const addInvoicingEmail = () => {
    if (emailInput.trim() && emailInput.includes("@")) {
      const currentEmails = form.getValues("invoicingEmails") || [];
      if (!currentEmails.includes(emailInput.trim())) {
        form.setValue("invoicingEmails", [...currentEmails, emailInput.trim()]);
        setEmailInput("");
      }
    }
  };

  const removeInvoicingEmail = (index: number) => {
    const currentEmails = form.getValues("invoicingEmails") || [];
    form.setValue("invoicingEmails", currentEmails.filter((_, i) => i !== index));
  };

  const addShippingAddress = () => {
    const currentAddresses = form.getValues("shippingAddresses") || [];
    form.setValue("shippingAddresses", [
      ...currentAddresses,
      {
        addressLine: "",
        city: "",
        pincode: "",
        state: "",
        country: "India",
        unloadingFacility: "NONE"
      }
    ]);
  };

  const removeShippingAddress = (index: number) => {
    const currentAddresses = form.getValues("shippingAddresses") || [];
    form.setValue("shippingAddresses", currentAddresses.filter((_, i) => i !== index));
  };

  const renderFileUpload = (
    documentType: string,
    label: string,
    acceptedTypes: string = ".pdf,.jpg,.jpeg,.png,.doc,.docx"
  ) => {
    const file = uploadedFiles[documentType as keyof typeof uploadedFiles];
    const isUploaded = !!file;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {isUploaded && (
            <div className="flex items-center gap-1 text-emerald-600">
              <Check className="h-4 w-4" />
              <span className="text-xs">Uploaded</span>
            </div>
          )}
        </div>
        
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white/70">
          <input
            type="file"
            accept={acceptedTypes}
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              handleFileUpload(documentType, selectedFile);
            }}
            className="hidden"
            id={`upload-${documentType}`}
          />
          
          {!isUploaded ? (
            <label
              htmlFor={`upload-${documentType}`}
              className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm">Click to upload {label}</span>
              <span className="text-xs text-gray-400">PDF, JPG, PNG, DOC (max 10MB)</span>
            </label>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileUpload(documentType, null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const unloadingFacilityOptions = [
    { value: "NONE", label: "None" },
    { value: "CRANE", label: "Crane" },
    { value: "FORKLIFT", label: "Forklift" },
    { value: "MANUAL", label: "Manual" },
    { value: "CONVEYOR", label: "Conveyor" },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">Manage your client information and relationships</p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Clients List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientsData.map((client: Client) => (
          <Card key={client.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow border-0 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.companyName}</h3>
                    <p className="text-sm text-gray-600">{client.contactPersonName}</p>
                  </div>
                </div>
                <Badge 
                  variant={client.category === 'ALFA' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {client.category}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{client.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{client.billingCity || 'No city'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>₹{client.creditLimit || 'No limit'}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(client.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientsData.length === 0 && (
        <Card className="bg-white shadow-lg rounded-xl">
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clients Yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first client</p>
            <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Client Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-50">
          <DialogHeader className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-blue-100">
            <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              {editingClient ? "Edit Client" : "Add New Client"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 1. Company Details */}
              <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 shadow-sm">
                <CardHeader className="pb-4 bg-white/80 rounded-t-lg border-b border-rose-100">
                  <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-white/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Company Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter company name" 
                              className="bg-white border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
                              {...field}
                              value={field.value || ""} 
                            />
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
                          <FormLabel className="text-gray-700 font-medium">Company Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "PVT_LTD"}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-rose-200 focus:border-rose-400 focus:ring-rose-400/20">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PVT_LTD">Private Limited</SelectItem>
                              <SelectItem value="PUBLIC_LTD">Public Limited</SelectItem>
                              <SelectItem value="LLP">Limited Liability Partnership</SelectItem>
                              <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                              <SelectItem value="SOLE_PROPRIETORSHIP">Sole Proprietorship</SelectItem>
                              <SelectItem value="TRUST">Trust</SelectItem>
                              <SelectItem value="SOCIETY">Society</SelectItem>
                              <SelectItem value="NGO">NGO</SelectItem>
                              <SelectItem value="HUF">Hindu Undivided Family</SelectItem>
                              <SelectItem value="OTHERS">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="incorporationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Incorporation Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              className="bg-white border-rose-200 focus:border-rose-400 focus:ring-rose-400/20"
                              {...field} 
                              value={field.value || ""} 
                            />
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
                          <FormLabel className="text-gray-700 font-medium">Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "ALFA"}>
                            <FormControl>
                              <SelectTrigger className="bg-white border-rose-200 focus:border-rose-400 focus:ring-rose-400/20">
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
                </CardContent>
              </Card>

              {/* 2. Address Information */}
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-sm">
                <CardHeader className="pb-4 bg-white/80 rounded-t-lg border-b border-blue-100">
                  <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-white/50">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <Home className="h-4 w-4 text-blue-600" />
                      Billing Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="billingAddressLine"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-gray-700 font-medium">Address Line</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter billing address"
                                className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                {...field}
                                value={field.value || ""} 
                              />
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
                            <FormLabel className="text-gray-700 font-medium">City</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter city"
                                className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                {...field}
                                value={field.value || ""} 
                              />
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
                            <FormLabel className="text-gray-700 font-medium">Pincode</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter pincode"
                                className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                {...field}
                                value={field.value || ""} 
                              />
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
                            <FormLabel className="text-gray-700 font-medium">State</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter state"
                                className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                {...field}
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="billingCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Country</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter country"
                                className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                {...field}
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Shipping Addresses */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Shipping Addresses
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addShippingAddress}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </div>

                    {form.watch("shippingAddresses")?.map((_, index) => (
                      <div key={index} className="bg-blue-50/50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-gray-700">Address {index + 1}</h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeShippingAddress(index)}
                            className="text-red-600 hover:bg-red-50"
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
                                <FormLabel>Address Line</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter shipping address"
                                    className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                    {...field} 
                                    value={field.value || ""}
                                  />
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
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter city"
                                    className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                    {...field} 
                                    value={field.value || ""}
                                  />
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
                                <FormLabel>Pincode</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter pincode"
                                    className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.state`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter state"
                                    className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                    {...field} 
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.country`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter country"
                                    className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                                    {...field} 
                                    value={field.value || "India"}
                                  />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value || "NONE"}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20">
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
                  </div>
                </CardContent>
              </Card>

              {/* 3. Legal & Compliance */}
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-sm">
                <CardHeader className="pb-4 bg-white/80 rounded-t-lg border-b border-emerald-100">
                  <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    Legal & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-white/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="gstNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">GST Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter GST number"
                              className="bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                              {...field}
                              value={field.value || ""} 
                            />
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
                          <FormLabel className="text-gray-700 font-medium">PAN Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter PAN number"
                              className="bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                              {...field}
                              value={field.value || ""} 
                            />
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
                          <FormLabel className="text-gray-700 font-medium">MSME / Udyam Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter MSME number"
                              className="bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                              {...field}
                              value={field.value || ""} 
                            />
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
                          <FormLabel className="text-gray-700 font-medium">Incorporation Certificate Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter certificate number"
                              className="bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                              {...field}
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 4. Contact Information */}
              <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 shadow-sm">
                <CardHeader className="pb-4 bg-white/80 rounded-t-lg border-b border-purple-100">
                  <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-violet-400 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-white/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="contactPersonName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Contact Person Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter contact person name"
                              className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
                              {...field}
                              value={field.value || ""} 
                            />
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
                          <FormLabel className="text-gray-700 font-medium">Mobile Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter mobile number"
                              className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
                              {...field}
                              value={field.value || ""} 
                            />
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
                          <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter email address"
                              className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400/20"
                              {...field}
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 5. Commercial & Finance */}
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm">
                <CardHeader className="pb-4 bg-white/80 rounded-t-lg border-b border-amber-100">
                  <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    Commercial & Finance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-white/50">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-amber-600" />
                      Payment & Credit Terms
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="paymentTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Payment Terms (Days) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter payment terms"
                                className="bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
                                {...field}
                                value={field.value || ""}
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
                            <FormLabel className="text-gray-700 font-medium">Credit Limit (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="Enter credit limit"
                                className="bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-600" />
                      Interest Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="bankInterestApplicable"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Interest Applicable From</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "FROM_DUE_DATE"}>
                              <FormControl>
                                <SelectTrigger className="bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-400/20">
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
                            <FormLabel className="text-gray-700 font-medium">Interest Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                placeholder="Enter interest percentage"
                                className="bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-600" />
                      Order Requirements
                    </h4>
                    <div className="bg-amber-50/50 p-4 rounded-lg">
                      <FormField
                        control={form.control}
                        name="poRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
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

                  <div>
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-amber-600" />
                      Invoicing Configuration
                    </h4>
                    <div className="space-y-3">
                      <FormLabel className="text-gray-700 font-medium">Invoicing Email(s)</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          className="bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
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
                          className="border-amber-300 text-amber-600 hover:bg-amber-50"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
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

              {/* 6. Documents Upload */}
              <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 shadow-sm">
                <CardHeader className="pb-4 bg-white/80 rounded-t-lg border-b border-indigo-100">
                  <CardTitle className="flex items-center gap-3 text-lg text-gray-800">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    Documents Upload (Checklist)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 bg-white/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFileUpload("gstCertificate", "GST Certificate")}
                    {renderFileUpload("panCopy", "PAN Copy")}
                    {renderFileUpload("cancelledCheque", "Cancelled Cheque")}
                    {renderFileUpload("agreement", "Agreement")}
                    {renderFileUpload("poRateContract", "PO / Rate Contract")}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={clientMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
                >
                  {clientMutation.isPending ? "Saving..." : (editingClient ? "Update Client" : "Create Client")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}