import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema, type Client, type InsertClient } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Plus, Edit, MapPin, FileText, Building, User, CreditCard, Truck, X, Upload, File, Check } from "lucide-react";
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
  ALPHA: "bg-red-100 text-red-800 border-red-200",
  BETA: "bg-orange-100 text-orange-800 border-orange-200", 
  GAMMA: "bg-yellow-100 text-yellow-800 border-yellow-200",
  DELTA: "bg-green-100 text-green-800 border-green-200",
};

const categoryLabels = {
  ALPHA: "Alpha",
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

export default function Clients() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{
    gstCertificate?: File;
    panCopy?: File;
    cancelledCheque?: File;
    agreement?: File;
    poRateContract?: File;
  }>({});
  const { toast } = useToast();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const form = useForm<ExtendedClient>({
    resolver: zodResolver(extendedClientSchema),
    defaultValues: {
      name: "",
      category: "ALPHA",
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
      creditLimit: null,
      bankInterestApplicable: "FROM_DUE_DATE",
      poRequired: false,
      invoicingEmails: [],
      gstCertificateUploaded: false,
      panCopyUploaded: false,
      cancelledChequeUploaded: false,
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
        return await apiRequest("PUT", `/api/clients/${editingClient.id}`, clientData);
      } else {
        return await apiRequest("POST", "/api/clients", clientData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: `Client ${editingClient ? "updated" : "created"} successfully`,
      });
      setIsFormOpen(false);
      form.reset();
      setEditingClient(null);
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
      incorporationDate: client.incorporationDate ? new Date(client.incorporationDate).toISOString().split('T')[0] : "",
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
    
    // Update the form checkbox based on file upload
    form.setValue(`${documentType}Uploaded` as any, !!file);
  };

  const renderFileUpload = (
    documentType: string,
    label: string,
    acceptedTypes: string = ".pdf,.jpg,.jpeg,.png,.doc,.docx"
  ) => {
    const file = uploadedFiles[documentType as keyof typeof uploadedFiles];
    const isUploaded = !!file;

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
                <File className="h-5 w-5 text-blue-600" />
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
                >
                  <X className="h-4 w-4" />
                </Button>
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
              <form onSubmit={form.handleSubmit((data) => clientMutation.mutate(data))} className="space-y-8">
                
                {/* Company Information Section */}
                <Card className="border-l-4 border-l-blue-300 shadow-sm bg-gradient-to-r from-blue-50 to-white">
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-100/50 to-blue-50/30 rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-xl text-blue-800">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <Building className="h-6 w-6 text-blue-700" />
                      </div>
                      Company Information
                    </CardTitle>
                    <p className="text-sm text-blue-600 mt-1">Basic company details and registration information</p>
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
                                <SelectItem value="ALPHA">Alpha</SelectItem>
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
                              <FormControl>
                                <Input placeholder="Enter state" {...field} />
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
                            name={`shippingAddresses.${index}.googleLatitude`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Google Latitude</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="any"
                                    placeholder="Enter latitude" 
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`shippingAddresses.${index}.googleLongitude`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Google Longitude</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="any"
                                    placeholder="Enter longitude" 
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                      {renderFileUpload("cancelledCheque", "Cancelled Cheque")}
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

      {/* Client Grid */}
      <div className="grid gap-6">
        {!clients || clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-500 text-center mb-4">
                Get started by adding your first client
              </p>
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {(clients as Client[]).map((client: Client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{client.name}</h3>
                        <Badge className={categoryColors[client.category]}>
                          {categoryLabels[client.category]}
                        </Badge>
                        {client.companyType && (
                          <Badge variant="outline">
                            {companyTypeLabels[client.companyType]}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Contact:</span>
                          <div className="text-gray-900">
                            {client.contactPersonName && <div>{client.contactPersonName}</div>}
                            {client.mobileNumber && <div>{client.mobileNumber}</div>}
                            {client.email && <div>{client.email}</div>}
                          </div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-600">Compliance:</span>
                          <div className="text-gray-900">
                            {client.gstNumber && <div>GST: {client.gstNumber}</div>}
                            {client.panNumber && <div>PAN: {client.panNumber}</div>}
                            {client.msmeNumber && <div>MSME: {client.msmeNumber}</div>}
                          </div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-600">Finance:</span>
                          <div className="text-gray-900">
                            <div>Payment Terms: {client.paymentTerms} days</div>
                            {client.creditLimit && <div>Credit Limit: ₹{parseFloat(client.creditLimit).toLocaleString()}</div>}
                            <div>PO Required: {client.poRequired ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                      </div>

                      {client.communicationPreferences && client.communicationPreferences.length > 0 && (
                        <div className="mt-3">
                          <span className="font-medium text-gray-600 text-sm">Communication: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.communicationPreferences.map((pref) => (
                              <Badge key={pref} variant="secondary" className="text-xs">
                                {communicationOptions.find(opt => opt.value === pref)?.label || pref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(client)}
                      className="ml-4"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}