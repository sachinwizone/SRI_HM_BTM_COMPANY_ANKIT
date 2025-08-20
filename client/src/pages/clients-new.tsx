import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, MapPin, FileText, Building, User, CreditCard, X, Upload, File, Check, Mail, Phone, Star } from "lucide-react";
import { z } from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Hooks and Utils
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
// Simple client schema matching database structure
const clientSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  category: z.enum(["ALFA", "BETA", "GAMMA", "DELTA"]),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  gst_number: z.string().optional(),
  credit_limit: z.string().optional(),
  payment_terms: z.number().optional(),
  contact_person: z.string().optional(),
  interest_percent: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;
type Client = {
  id: string;
  name: string;
  category: "ALFA" | "BETA" | "GAMMA" | "DELTA";
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gst_number?: string | null;
  credit_limit?: string | null;
  payment_terms?: number | null;
  contact_person?: string | null;
  interest_percent?: string | null;
  created_at: Date;
};

const communicationOptions = [
  { value: 'EMAIL', label: '📧 Email', color: 'bg-blue-100 text-blue-800' },
  { value: 'WHATSAPP', label: '💬 WhatsApp', color: 'bg-green-100 text-green-800' },
  { value: 'PHONE', label: '📞 Phone', color: 'bg-purple-100 text-purple-800' },
  { value: 'SMS', label: '📱 SMS', color: 'bg-orange-100 text-orange-800' },
];

const unloadingFacilityOptions = [
  { value: 'PUMP', label: '🔧 Pump' },
  { value: 'CRANE', label: '🏗️ Crane' },
  { value: 'MANUAL', label: '👷 Manual' },
  { value: 'OTHERS', label: '📋 Others' },
];

export default function ClientsNew() {
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
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      category: "BETA",
      email: "",
      phone: "",
      address: "",
      gst_number: "",
      credit_limit: "",
      payment_terms: 30,
      contact_person: "",
      interest_percent: "",
    },
  });



  const clientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
      const method = editingClient ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsFormOpen(false);
      setEditingClient(null);
      form.reset();
      setUploadedFiles({});
      toast({
        title: "Success",
        description: editingClient ? "Client updated successfully" : "Client created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save client",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      name: client.name,
      category: client.category,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      gst_number: client.gst_number || "",
      credit_limit: client.credit_limit || "",
      payment_terms: client.payment_terms || 30,
      contact_person: client.contact_person || "",
      interest_percent: client.interest_percent || "",
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {isUploaded && (
            <div className="flex items-center gap-2 text-emerald-600">
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium">Uploaded</span>
            </div>
          )}
        </div>
        
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-200 bg-gradient-to-br from-gray-50 to-white">
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
              className="cursor-pointer flex flex-col items-center gap-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <div className="p-3 bg-blue-100 rounded-full">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium">Click to upload {label}</span>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC (max 10MB)</p>
              </div>
            </label>
          ) : (
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <File className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFileUpload(documentType, null)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
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
            <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="client-form-description">
            <DialogHeader className="bg-gradient-to-r from-blue-50 to-purple-50 -m-6 p-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
              <p className="text-gray-600 mt-1">Complete client information form with all necessary details</p>
            </DialogHeader>
            <div id="client-form-description" className="sr-only">
              Form to create or edit client information including company details, contacts, and documents
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => clientMutation.mutate(data))} className="space-y-8">
                
                {/* Company Information Section */}
                <Card className="border-l-4 border-l-blue-400 shadow-lg bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30">
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-100/70 to-blue-50/50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-xl text-blue-900">
                      <div className="p-3 bg-blue-200 rounded-xl shadow-sm">
                        <Building className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-bold">Company Information</h3>
                        <p className="text-sm text-blue-600 font-normal">Basic company details and registration information</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                              <Building className="h-4 w-4 text-blue-600" />
                              Company Name *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter company name" 
                                className="border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white/90 shadow-sm" 
                                {...field} 
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
                            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-600" />
                              Client Category *
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white/90 shadow-sm">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ALFA">🌟 Alfa - Premium</SelectItem>
                                <SelectItem value="BETA">💼 Beta - Standard</SelectItem>
                                <SelectItem value="GAMMA">📈 Gamma - Growing</SelectItem>
                                <SelectItem value="DELTA">🔹 Delta - Basic</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4 bg-gradient-to-r from-gray-50/50 to-blue-50/30 p-4 rounded-xl">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        Address Information
                      </h4>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Complete Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter complete address" 
                                className="border-green-200 focus:border-green-400 focus:ring-green-300 bg-white/90 min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* GST & Registration Section */}
                <Card className="border-l-4 border-l-purple-400 shadow-lg bg-gradient-to-br from-purple-50/50 via-white to-purple-50/30">
                  <CardHeader className="pb-4 bg-gradient-to-r from-purple-100/70 to-purple-50/50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-xl text-purple-900">
                      <div className="p-3 bg-purple-200 rounded-xl shadow-sm">
                        <FileText className="h-6 w-6 text-purple-700" />
                      </div>
                      <div>
                        <h3 className="font-bold">GST & Registration</h3>
                        <p className="text-sm text-purple-600 font-normal">Tax registration details</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <FormField
                      control={form.control}
                      name="gst_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">GST Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter GST number" 
                              className="border-purple-200 focus:border-purple-400 focus:ring-purple-300 bg-white/90"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Contact Information Section */}
                <Card className="border-l-4 border-l-emerald-400 shadow-lg bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30">
                  <CardHeader className="pb-4 bg-gradient-to-r from-emerald-100/70 to-emerald-50/50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-xl text-emerald-900">
                      <div className="p-3 bg-emerald-200 rounded-xl shadow-sm">
                        <User className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="font-bold">Contact Information</h3>
                        <p className="text-sm text-emerald-600 font-normal">Primary contact details</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="contact_person"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                              <User className="h-4 w-4 text-emerald-600" />
                              Contact Person Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter contact person name" 
                                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-300 bg-white/90"
                                {...field} 
                              />
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
                            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                              <Phone className="h-4 w-4 text-emerald-600" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter phone number" 
                                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-300 bg-white/90"
                                {...field} 
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
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                              <Mail className="h-4 w-4 text-emerald-600" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter email address" 
                                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-300 bg-white/90"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Terms Section */}
                <Card className="border-l-4 border-l-orange-400 shadow-lg bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30">
                  <CardHeader className="pb-4 bg-gradient-to-r from-orange-100/70 to-orange-50/50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-xl text-orange-900">
                      <div className="p-3 bg-orange-200 rounded-xl shadow-sm">
                        <CreditCard className="h-6 w-6 text-orange-700" />
                      </div>
                      <div>
                        <h3 className="font-bold">Financial Terms</h3>
                        <p className="text-sm text-orange-600 font-normal">Payment terms and credit configuration</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="payment_terms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Payment Terms (Days)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter payment terms"
                                className="border-orange-200 focus:border-orange-400 focus:ring-orange-300 bg-white/90"
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
                        name="credit_limit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Credit Limit (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter credit limit"
                                className="border-orange-200 focus:border-orange-400 focus:ring-orange-300 bg-white/90"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="interest_percent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">Interest Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter interest percentage"
                                className="border-orange-200 focus:border-orange-400 focus:ring-orange-300 bg-white/90"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>



                <div className="flex justify-end gap-4 pt-6 border-t bg-gradient-to-r from-gray-50 to-blue-50 -mx-6 px-6 pb-6 rounded-b-lg">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="px-8">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={clientMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 shadow-lg"
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
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <Building className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first client</p>
              <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-600 to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {(clients as Client[]).map((client: Client) => (
              <Card key={client.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`
                            ${client.category === 'ALFA' ? 'bg-purple-100 text-purple-800' : ''}
                            ${client.category === 'BETA' ? 'bg-blue-100 text-blue-800' : ''}
                            ${client.category === 'GAMMA' ? 'bg-green-100 text-green-800' : ''}
                            ${client.category === 'DELTA' ? 'bg-orange-100 text-orange-800' : ''}
                          `}
                        >
                          {client.category}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">{client.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">{client.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600">
                            {client.payment_terms ? `${client.payment_terms} days` : 'No terms set'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(client)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
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