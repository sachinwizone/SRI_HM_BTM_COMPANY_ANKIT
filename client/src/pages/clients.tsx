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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, FileText, Building, User, CreditCard, X, Search, Calendar, Filter, Download, Trash2, Eye } from "lucide-react";
import { z } from "zod";

const categoryColors = {
  ALFA: "bg-green-500 text-white border-green-600",
  BETA: "bg-yellow-500 text-white border-yellow-600", 
  GAMMA: "bg-orange-500 text-white border-orange-600",
  DELTA: "bg-red-500 text-white border-red-600",
};

const categoryLabels = {
  ALFA: "Alpha",
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

export default function Clients() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["/api/clients", selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const url = `/api/clients${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch clients');
      return await response.json();
    },
  });

  const { data: clientStats = { ALFA: 0, BETA: 0, GAMMA: 0, DELTA: 0, total: 0 } } = useQuery({
    queryKey: ["/api/clients/stats"],
  });

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
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
      incorporationDate: undefined,
      companyType: "PVT_LTD",
      contactPersonName: "",
      mobileNumber: "",
      email: "",
      communicationPreferences: [],
      paymentTerms: 30,
      creditLimit: null,
      interestPercent: null,
      bankInterestApplicable: "FROM_DUE_DATE",
      poRequired: false,
      invoicingEmails: [],
      primarySalesPersonId: undefined,
      gstCertificateUploaded: false,
      panCopyUploaded: false,
      securityChequeUploaded: false,
      aadharCardUploaded: false,
      agreementUploaded: false,
      poRateContractUploaded: false,
    },
  });

  const clientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      if (editingClient) {
        return await apiRequest("PUT", `/api/clients/${editingClient.id}`, data);
      } else {
        return await apiRequest("POST", "/api/clients", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients/stats"] });
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

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      name: client.name,
      category: client.category,
      billingAddressLine: client.billingAddressLine || "",
      billingCity: client.billingCity || "",
      billingPincode: client.billingPincode || "",
      billingState: client.billingState || "",
      billingCountry: client.billingCountry || "India",
      gstNumber: client.gstNumber || "",
      panNumber: client.panNumber || "",
      msmeNumber: client.msmeNumber || "",
      incorporationCertNumber: client.incorporationCertNumber || "",
      incorporationDate: client.incorporationDate ? new Date(client.incorporationDate) : undefined,
      companyType: client.companyType || "PVT_LTD",
      contactPersonName: client.contactPersonName || "",
      mobileNumber: client.mobileNumber || "",
      email: client.email || "",
      communicationPreferences: (client.communicationPreferences || []) as any,
      paymentTerms: client.paymentTerms || 30,
      creditLimit: client.creditLimit,
      bankInterestApplicable: client.bankInterestApplicable || "FROM_DUE_DATE",
      interestPercent: client.interestPercent,
      poRequired: client.poRequired || false,
      invoicingEmails: client.invoicingEmails || [],
      primarySalesPersonId: client.primarySalesPersonId || undefined,
      gstCertificateUploaded: client.gstCertificateUploaded || false,
      panCopyUploaded: client.panCopyUploaded || false,
      securityChequeUploaded: client.securityChequeUploaded || false,
      aadharCardUploaded: client.aadharCardUploaded || false,
      agreementUploaded: client.agreementUploaded || false,
      poRateContractUploaded: client.poRateContractUploaded || false,
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingClient(null);
    form.reset();
    setIsFormOpen(true);
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

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchTerm("");
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
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-client">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => clientMutation.mutate(data))} className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} data-testid="input-company-name" />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ALFA">Alpha</SelectItem>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "PVT_LTD"} value={field.value || "PVT_LTD"}>
                            <FormControl>
                              <SelectTrigger data-testid="select-company-type">
                                <SelectValue placeholder="Select company type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PVT_LTD">Private Limited</SelectItem>
                              <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                              <SelectItem value="PROPRIETOR">Proprietorship</SelectItem>
                              <SelectItem value="GOVT">Government</SelectItem>
                              <SelectItem value="OTHERS">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gstNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Number</FormLabel>
                          <FormControl>
                            <Input placeholder="GST Number" {...field} value={field.value || ""} data-testid="input-gst-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                            <Textarea placeholder="Enter billing address" {...field} value={field.value || ""} data-testid="input-billing-address" />
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
                            <Input placeholder="Enter city" {...field} value={field.value || ""} data-testid="input-billing-city" />
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
                            <Input placeholder="Enter pincode" {...field} value={field.value || ""} data-testid="input-billing-pincode" />
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
                            <Input placeholder="Enter state" {...field} value={field.value || ""} data-testid="input-billing-state" />
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
                            <Input placeholder="Country" {...field} value={field.value || "India"} data-testid="input-billing-country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPersonName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact Person Name" {...field} value={field.value || ""} data-testid="input-contact-person" />
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
                            <Input placeholder="Mobile Number" {...field} value={field.value || ""} data-testid="input-mobile-number" />
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
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email Address" {...field} value={field.value || ""} data-testid="input-email" />
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
                            <Input placeholder="PAN Number" {...field} value={field.value || ""} data-testid="input-pan-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Commercial Terms</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Terms (Days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              {...field} 
                              value={field.value || 30}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                              data-testid="input-payment-terms"
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
                          <FormLabel>Credit Limit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Credit Limit" 
                              {...field} 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              data-testid="input-credit-limit"
                            />
                          </FormControl>
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
                              placeholder="Interest Rate" 
                              {...field} 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              data-testid="input-interest-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankInterestApplicable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Interest Applicable From</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "FROM_DUE_DATE"} value={field.value || "FROM_DUE_DATE"}>
                            <FormControl>
                              <SelectTrigger data-testid="select-bank-interest">
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
                      name="poRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-po-required"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>PO Required</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Check if Purchase Order is required for this client
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={clientMutation.isPending} data-testid="button-submit">
                    {clientMutation.isPending ? "Saving..." : editingClient ? "Update Client" : "Create Client"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(categoryLabels).map(([category, label]) => (
          <Card 
            key={category} 
            className={`cursor-pointer transition-all ${selectedCategory === category ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
            data-testid={`card-category-${category.toLowerCase()}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${categoryColors[category as keyof typeof categoryColors]?.split(' ')[0]}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid={`text-count-${category.toLowerCase()}`}>
                    {(clientStats as any)?.[category] || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-total-clients">
                  {(clientStats as any)?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-clients"
                />
              </div>
            </div>
            <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <Button variant="outline" onClick={exportToExcel} data-testid="button-export-excel">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>
            {clients.length} client{clients.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Commercial Terms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Building className="h-8 w-8" />
                      <p>No clients found</p>
                      <p className="text-sm">Add your first client to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client: Client) => (
                  <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium" data-testid={`text-client-name-${client.id}`}>{client.name}</div>
                        <div className="text-sm text-gray-500">{client.gstNumber || 'No GST'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[client.category as keyof typeof categoryColors]} data-testid={`badge-category-${client.id}`}>
                        {categoryLabels[client.category as keyof typeof categoryLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{client.contactPersonName || 'No contact person'}</div>
                        <div className="text-sm text-gray-500">{client.email || 'No email'}</div>
                        <div className="text-sm text-gray-500">{client.mobileNumber || 'No phone'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Terms: {client.paymentTerms || 30} days</div>
                        <div>Credit: {client.creditLimit ? `₹${Number(client.creditLimit).toLocaleString()}` : 'Not set'}</div>
                        {client.poRequired && <div className="text-blue-600">PO Required</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(client)}
                          data-testid={`button-edit-${client.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setClientToDelete(client)}
                              data-testid={`button-delete-${client.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
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
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => clientToDelete && deleteMutation.mutate(clientToDelete.id)}
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}