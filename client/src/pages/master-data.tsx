import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { Plus, Edit, Building, Factory, Package, Building2 } from "lucide-react";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";
import { ProductMasterForm } from "@/components/ProductMasterForm";
import type { 
  CompanyProfile, 
  Branch,
  ProductMaster,
  Supplier
} from "@shared/schema";
import { 
  insertCompanyProfileSchema,
  insertBranchSchema
} from "@shared/schema";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suppliers</CardTitle>
        <CardDescription>Manage supplier information and payment terms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Supplier Management Coming Soon</h3>
          <p className="text-muted-foreground">
            Add and manage supplier contacts and payment terms
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

