import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Building, Factory, Package, Building2, Pencil } from "lucide-react";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";
import { ProductMasterForm } from "@/components/ProductMasterForm";
import type { 
  CompanyProfile, 
  Branch,
  ProductMaster,
  Supplier,
  InsertSupplier
} from "@shared/schema";
import { 
  insertCompanyProfileSchema,
  insertBranchSchema
} from "@shared/schema";
import { z } from "zod";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState("company");

  const tabs = [
    { id: "company", label: "Company Profile", icon: Building },
    { id: "branches", label: "Branches", icon: Factory },
    { id: "products", label: "Product Master", icon: Package },
    { id: "suppliers", label: "Suppliers", icon: Building2 }
  ];

  return (
    <div className="space-y-6" data-testid="master-data-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Master Data Management</h1>
          <p className="text-muted-foreground" data-testid="page-description">
            Configure and manage all master data for your bitumen trading ERP system
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4" data-testid="master-data-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="company">
          <CompanyProfileForm />
        </TabsContent>

        <TabsContent value="branches">
          <BranchesSection />
        </TabsContent>

        <TabsContent value="products">
          <ProductMasterForm />
        </TabsContent>

        <TabsContent value="products">
          <ProductMasterSection />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersSection />
        </TabsContent>

      </Tabs>
    </div>
  );
}

function CompanyProfileSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: companyProfile, isLoading } = useQuery<CompanyProfile | null>({
    queryKey: ["/api/company-profile"],
    retry: false,
  });

  const form = useForm({
    resolver: zodResolver(insertCompanyProfileSchema),
    defaultValues: {
      legalName: "",
      tradeName: "",
      gstin: "",
      pan: "",
      cin: "",
      msmeNumber: "",
      primaryContactName: "",
      primaryContactMobile: "",
      primaryContactEmail: "",
      registeredAddressLine: "",
      corporateAddressLine: ""
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/company-profile", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-profile"] });
      toast({ title: "Company profile saved successfully" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to save company profile", variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card data-testid="company-profile-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Configure your company's basic information and legal details
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-edit-company">
              {companyProfile ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {companyProfile ? "Edit" : "Setup"} Company Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{companyProfile ? "Edit" : "Setup"} Company Profile</DialogTitle>
              <DialogDescription>
                Enter your company's legal and contact information
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-legal-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tradeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trade Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-trade-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gstin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-gstin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-pan" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-company"
                  >
                    {createMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      {companyProfile ? (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="company-profile-details">
            <div>
              <h4 className="font-medium">Legal Name</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-legal-name">
                {companyProfile.legalName}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Trade Name</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-trade-name">
                {companyProfile.tradeName || "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">GSTIN</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-gstin">
                {companyProfile.gstin || "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="font-medium">PAN</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-pan">
                {companyProfile.pan || "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <div className="text-center py-8" data-testid="company-profile-empty">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Company Profile Configured</h3>
            <p className="text-muted-foreground mb-4">
              Set up your company profile to get started with the ERP system
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function BranchesSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const { data: branches, isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
    retry: false,
  });

  const form = useForm({
    resolver: zodResolver(insertBranchSchema),
    defaultValues: {
      name: "",
      code: "",
      storageType: "BOTH",
      isActive: true
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/branches", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({ title: "Branch created successfully" });
      setIsDialogOpen(false);
      setEditingBranch(null);
    },
    onError: () => {
      toast({ title: "Failed to create branch", variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const openDialog = (branch?: Branch) => {
    setEditingBranch(branch || null);
    if (branch) {
      form.reset({
        name: branch.name,
        code: branch.code,
        storageType: branch.storageType || "BOTH",
        isActive: branch.isActive
      });
    } else {
      form.reset({ name: "", code: "", storageType: "BOTH", isActive: true });
    }
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card data-testid="branches-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Branches/Depots</CardTitle>
          <CardDescription>
            Manage your branch locations and depot configurations
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} data-testid="button-add-branch">
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBranch ? "Edit" : "Add"} Branch</DialogTitle>
              <DialogDescription>
                Configure branch location and storage details
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Name *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-branch-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Code *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-branch-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="storageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-storage-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BULK_TANK">Bulk Tank Only</SelectItem>
                          <SelectItem value="DRUMS">Drums Only</SelectItem>
                          <SelectItem value="BOTH">Both Bulk & Drums</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-branch"
                  >
                    {createMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {branches && branches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="branches-list">
            {branches.map((branch: Branch) => (
              <Card key={branch.id} className="hover:shadow-md transition-shadow" data-testid={`card-branch-${branch.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base" data-testid={`text-branch-name-${branch.id}`}>
                        {branch.name}
                      </CardTitle>
                      <CardDescription data-testid={`text-branch-code-${branch.id}`}>
                        Code: {branch.code}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(branch)}
                      data-testid={`button-edit-branch-${branch.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Type:</span>
                      <span data-testid={`text-storage-type-${branch.id}`}>
                        {branch.storageType}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span 
                        className={branch.isActive ? "text-green-600" : "text-red-600"}
                        data-testid={`text-branch-status-${branch.id}`}
                      >
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8" data-testid="branches-empty">
            <Factory className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Branches Configured</h3>
            <p className="text-muted-foreground mb-4">
              Add branches and depots to manage your locations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Placeholder sections for other tabs
function ProductMasterSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Master</CardTitle>
        <CardDescription>Manage bitumen grades, emulsions and product configurations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Product Master Coming Soon</h3>
          <p className="text-muted-foreground">
            Configure VG grades, emulsions, and other product specifications
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SuppliersSection() {
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create supplier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setShowForm(false);
      toast({ title: "Success", description: "Supplier created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create supplier", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertSupplier> }) => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update supplier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setShowForm(false);
      setSelectedSupplier(null);
      toast({ title: "Success", description: "Supplier updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update supplier", variant: "destructive" });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suppliers Master</CardTitle>
        <CardDescription>Comprehensive supplier information and payment terms management</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Building2 className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">Supplier Database</h3>
          </div>
          <Button onClick={() => { setShowForm(true); setSelectedSupplier(null); }} data-testid="button-add-supplier">
            <Plus className="h-4 w-4 mr-2" />
            Add New Supplier
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading suppliers...</p>
          </div>
        ) : !suppliers || suppliers.length === 0 ? (
          <div className="text-center py-8" data-testid="suppliers-empty">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Suppliers Found</h3>
            <p className="text-muted-foreground mb-4">
              Add your first supplier to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors" data-testid={`card-supplier-${supplier.id}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900" data-testid={`text-supplier-name-${supplier.id}`}>
                        {supplier.supplierName || supplier.name}
                      </h4>
                      <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {supplier.status || 'ACTIVE'}
                      </Badge>
                      <Badge variant="outline">{supplier.supplierType || 'VENDOR'}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Code</p>
                        <p>{supplier.supplierCode}</p>
                      </div>
                      <div>
                        <p className="font-medium">Contact</p>
                        <p>{supplier.contactPersonName || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p>{supplier.contactEmail || supplier.contactPersonEmail || '-'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Payment Terms</p>
                        <p>Net {supplier.paymentTerms || 30} days</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setSelectedSupplier(supplier); setShowForm(true); }}
                    data-testid={`button-edit-supplier-${supplier.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <SupplierForm 
            supplier={selectedSupplier}
            onSubmit={(data: InsertSupplier) => {
              if (selectedSupplier) {
                updateMutation.mutate({ id: selectedSupplier.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowForm(false); setSelectedSupplier(null); }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}

// SupplierForm component with comprehensive sections
function SupplierForm({ 
  supplier, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  supplier: Supplier | null;
  onSubmit: (data: InsertSupplier) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const { toast } = useToast();
  const [formStep, setFormStep] = useState("identification");

  // Form schema with all comprehensive fields - need z import
  const supplierFormSchema = z.object({
    supplierCode: z.string().min(1, "Supplier code is required"),
    supplierName: z.string().min(1, "Supplier name is required"),
    tradeName: z.string().optional(),
    supplierType: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'SERVICE_PROVIDER', 'CONTRACTOR', 'VENDOR', 'OTHERS']),
    status: z.string().default('ACTIVE'),
    contactPersonName: z.string().optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    contactPhone: z.string().optional(),
    fax: z.string().optional(),
    website: z.string().optional(),
    registeredAddressStreet: z.string().optional(),
    registeredAddressCity: z.string().optional(),
    registeredAddressState: z.string().optional(),
    registeredAddressCountry: z.string().default('India'),
    registeredAddressPostalCode: z.string().optional(),
    shippingAddressStreet: z.string().optional(),
    shippingAddressCity: z.string().optional(),
    shippingAddressState: z.string().optional(),
    shippingAddressCountry: z.string().optional(),
    shippingAddressPostalCode: z.string().optional(),
    billingAddressStreet: z.string().optional(),
    billingAddressCity: z.string().optional(),
    billingAddressState: z.string().optional(),
    billingAddressCountry: z.string().optional(),
    billingAddressPostalCode: z.string().optional(),
    taxId: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankName: z.string().optional(),
    bankBranch: z.string().optional(),
    swiftIbanCode: z.string().optional(),
    paymentTerms: z.number().min(1).default(30),
    preferredCurrency: z.string().default('INR'),
  });

  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      supplierCode: supplier?.supplierCode || '',
      supplierName: supplier?.supplierName || supplier?.name || '',
      tradeName: supplier?.tradeName || '',
      supplierType: supplier?.supplierType || 'VENDOR',
      status: supplier?.status || 'ACTIVE',
      contactPersonName: supplier?.contactPersonName || '',
      contactEmail: supplier?.contactEmail || supplier?.contactPersonEmail || '',
      contactPhone: supplier?.contactPhone || supplier?.contactPersonMobile || '',
      fax: supplier?.fax || '',
      website: supplier?.website || '',
      registeredAddressStreet: supplier?.registeredAddressStreet || supplier?.addressLine || '',
      registeredAddressCity: supplier?.registeredAddressCity || supplier?.city || '',
      registeredAddressState: supplier?.registeredAddressState || supplier?.state || '',
      registeredAddressCountry: supplier?.registeredAddressCountry || 'India',
      registeredAddressPostalCode: supplier?.registeredAddressPostalCode || supplier?.pincode || '',
      shippingAddressStreet: supplier?.shippingAddressStreet || '',
      shippingAddressCity: supplier?.shippingAddressCity || '',
      shippingAddressState: supplier?.shippingAddressState || '',
      shippingAddressCountry: supplier?.shippingAddressCountry || '',
      shippingAddressPostalCode: supplier?.shippingAddressPostalCode || '',
      billingAddressStreet: supplier?.billingAddressStreet || '',
      billingAddressCity: supplier?.billingAddressCity || '',
      billingAddressState: supplier?.billingAddressState || '',
      billingAddressCountry: supplier?.billingAddressCountry || '',
      billingAddressPostalCode: supplier?.billingAddressPostalCode || '',
      taxId: supplier?.taxId || supplier?.gstin || supplier?.pan || '',
      bankAccountNumber: supplier?.bankAccountNumber || '',
      bankName: supplier?.bankName || '',
      bankBranch: supplier?.bankBranch || '',
      swiftIbanCode: supplier?.swiftIbanCode || '',
      paymentTerms: supplier?.paymentTerms || 30,
      preferredCurrency: supplier?.preferredCurrency || 'INR',
    },
  });

  const handleSubmit = (data: z.infer<typeof supplierFormSchema>) => {
    onSubmit(data as InsertSupplier);
  };

  const formSteps = [
    { id: "identification", label: "General Info", icon: Building2 },
    { id: "contact", label: "Contact", icon: Plus },
    { id: "address", label: "Address", icon: Factory },
    { id: "financial", label: "Financial", icon: Package }
  ];

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-supplier-form">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
          </DialogTitle>
          <DialogDescription>
            Complete supplier master data with all required information organized by sections.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={formStep} onValueChange={setFormStep} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {formSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <TabsTrigger key={step.id} value={step.id} className="text-xs" data-testid={`tab-${step.id}`}>
                      <Icon className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{step.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Section 1: Identification & General Info */}
              <TabsContent value="identification" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplierCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Code (Unique) *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="SUP001" data-testid="input-supplier-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="supplierType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-supplier-type">
                              <SelectValue placeholder="Select supplier type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MANUFACTURER">Manufacturer</SelectItem>
                            <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                            <SelectItem value="SERVICE_PROVIDER">Service Provider</SelectItem>
                            <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                            <SelectItem value="VENDOR">Vendor</SelectItem>
                            <SelectItem value="OTHERS">Others</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name (Legal Name) *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABC Manufacturing Pvt Ltd" data-testid="input-supplier-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tradeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade/Brand Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ABC Brand (if different from legal name)" data-testid="input-trade-name" />
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
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Section 2: Contact Details */}
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPersonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" data-testid="input-contact-person" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+91 9876543210" data-testid="input-contact-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="contact@supplier.com" data-testid="input-contact-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fax (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="011-12345678" data-testid="input-fax" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.supplier.com" data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Section 3: Address Information */}
              <TabsContent value="address" className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Registered Address</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="registeredAddressStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123 Main Street, Building Name" data-testid="input-reg-street" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="registeredAddressCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Mumbai" data-testid="input-reg-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="registeredAddressState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Maharashtra" data-testid="input-reg-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="registeredAddressPostalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="400001" data-testid="input-reg-postal" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Shipping Address (if different)</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingAddressStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Same as registered or different address" data-testid="input-ship-street" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingAddressCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-ship-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shippingAddressState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-ship-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shippingAddressPostalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-ship-postal" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shippingAddressCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="India" data-testid="input-ship-country" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Section 4: Financial & Payment Details */}
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax ID / VAT / GST / PAN</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="22AAAAA0000A1Z5" data-testid="input-tax-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            <SelectItem value="GBP">GBP (British Pound)</SelectItem>
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
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1234567890" data-testid="input-bank-account" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="State Bank of India" data-testid="input-bank-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankBranch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Branch</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Main Branch" data-testid="input-bank-branch" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="swiftIbanCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SWIFT / IBAN Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="SBININBB123" data-testid="input-swift-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="30" 
                          onChange={e => field.onChange(parseInt(e.target.value) || 30)}
                          data-testid="input-payment-terms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-submit">
                {isLoading ? "Saving..." : supplier ? "Update Supplier" : "Create Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

