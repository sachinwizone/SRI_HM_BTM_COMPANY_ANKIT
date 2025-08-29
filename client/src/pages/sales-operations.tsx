import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Search,
  Phone, 
  Mail, 
  FileText, 
  CheckCircle, 
  Clock, 
  Truck, 
  MapPin,
  User,
  Target,
  DollarSign,
  Calendar,
  Package,
  Eye,
  Download,
  MoreHorizontal,
  Send,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { 
  Lead,
  Opportunity,
  Quotation,
  SalesOrder,
  DeliveryPlan,
  Dispatch
} from "@shared/schema";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";

export default function SalesOperationsPage() {
  const [activeTab, setActiveTab] = useState("leads");

  const tabs = [
    { id: "leads", label: "Lead & CRM", icon: User, description: "Lead tracking and opportunity management" },
    { id: "quotations", label: "Quotations", icon: FileText, description: "Multi-level approvals and pricing" },
    { id: "sales-orders", label: "Sales Orders", icon: CheckCircle, description: "Credit checks and inventory allocation" },
    { id: "delivery-planning", label: "Delivery Planning", icon: Calendar, description: "Route optimization and vehicle allocation" },
    { id: "dispatch", label: "Dispatch Management", icon: Truck, description: "Real-time tracking and delivery challans" }
  ];

  return (
    <div className="space-y-6" data-testid="sales-operations-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Sales Operations</h1>
          <p className="text-muted-foreground" data-testid="page-description">
            Complete sales pipeline management from leads to delivery
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5" data-testid="sales-operations-tabs">
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

        <TabsContent value="leads">
          <LeadCRMSection />
        </TabsContent>

        <TabsContent value="quotations">
          <QuotationSection />
        </TabsContent>

        <TabsContent value="sales-orders">
          <SalesOrderSection />
        </TabsContent>

        <TabsContent value="delivery-planning">
          <DeliveryPlanningSection />
        </TabsContent>

        <TabsContent value="dispatch">
          <DispatchManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add Lead Dialog Component
interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  onLeadSaved: () => void;
}

function AddLeadDialog({ open, onOpenChange, lead, onLeadSaved }: AddLeadDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(
      insertLeadSchema
        .omit({ id: true, leadNumber: true, createdAt: true, updatedAt: true })
        .extend({
          expectedCloseDate: z.string().optional(),
        })
    ),
    defaultValues: {
      companyName: "",
      contactPersonName: "",
      mobileNumber: "",
      email: "",
      leadSource: "WEBSITE",
      leadStatus: "NEW",
      interestedProducts: [],
      estimatedValue: "",
      expectedCloseDate: "",
      notes: "",
      assignedToUserId: user?.id || "",
    },
  });

  // Reset form when lead prop changes
  useEffect(() => {
    if (lead) {
      form.reset({
        companyName: lead.companyName || "",
        contactPersonName: lead.contactPersonName || "",
        mobileNumber: lead.mobileNumber || "",
        email: lead.email || "",
        leadSource: lead.leadSource || "WEBSITE",
        leadStatus: lead.leadStatus || "NEW",
        interestedProducts: lead.interestedProducts || [],
        estimatedValue: lead.estimatedValue || "",
        expectedCloseDate: lead.expectedCloseDate ? new Date(lead.expectedCloseDate).toISOString().split('T')[0] : "",
        notes: lead.notes || "",
        assignedToUserId: lead.assignedToUserId || user?.id || "",
      });
    } else {
      form.reset({
        companyName: "",
        contactPersonName: "",
        mobileNumber: "",
        email: "",
        leadSource: "WEBSITE",
        leadStatus: "NEW",
        interestedProducts: [],
        estimatedValue: "",
        expectedCloseDate: "",
        notes: "",
        assignedToUserId: user?.id || "",
      });
    }
  }, [lead, user?.id, form]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiCall("/api/leads", "POST", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Lead created successfully" });
      onLeadSaved();
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create lead",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiCall(`/api/leads/${lead?.id}`, "PUT", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Lead updated successfully" });
      onLeadSaved();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update lead",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: any) => {
    if (lead) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
          <DialogDescription>
            {lead ? "Update the lead information below." : "Fill in the details to create a new lead in the system."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter company name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPersonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter contact person name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter mobile number" />
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
                      <Input {...field} type="email" placeholder="Enter email address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="leadSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WEBSITE">Website</SelectItem>
                        <SelectItem value="PHONE">Phone</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="REFERRAL">Referral</SelectItem>
                        <SelectItem value="TRADE_SHOW">Trade Show</SelectItem>
                        <SelectItem value="ADVERTISEMENT">Advertisement</SelectItem>
                        <SelectItem value="COLD_CALL">Cold Call</SelectItem>
                        <SelectItem value="OTHERS">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leadStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                        <SelectItem value="QUALIFIED">Qualified</SelectItem>
                        <SelectItem value="PROPOSAL">Proposal</SelectItem>
                        <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                        <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                        <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
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
                name="estimatedValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Value (₹)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Enter estimated value" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedCloseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter additional notes..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : (lead ? "Update Lead" : "Add Lead")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Lead & CRM Management Component
function LeadCRMSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const convertToClientMutation = useMutation({
    mutationFn: async (lead: Lead) => {
      return apiCall("/api/leads/convert", "POST", { leadId: lead.id });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead converted to client successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert lead to client",
        variant: "destructive",
      });
    },
  });

  const handleConvertToClient = (lead: Lead) => {
    if (lead.leadStatus !== 'QUALIFIED') {
      toast({
        title: "Cannot Convert",
        description: "Lead must be qualified before conversion to client",
        variant: "destructive",
      });
      return;
    }
    convertToClientMutation.mutate(lead);
  };

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'NEW': 'bg-blue-100 text-blue-800',
      'CONTACTED': 'bg-yellow-100 text-yellow-800',
      'QUALIFIED': 'bg-green-100 text-green-800',
      'PROPOSAL': 'bg-purple-100 text-purple-800',
      'NEGOTIATION': 'bg-orange-100 text-orange-800',
      'CLOSED_WON': 'bg-green-100 text-green-800',
      'CLOSED_LOST': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      'PHONE': Phone,
      'EMAIL': Mail,
      'WEBSITE': Target,
      'REFERRAL': User
    };
    return icons[source as keyof typeof icons] || Target;
  };

  const filteredLeads = leads?.filter(lead => 
    lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading leads...</div>;
  }

  return (
    <Card data-testid="lead-crm-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lead & CRM Management
          </CardTitle>
          <CardDescription>
            Track prospects, manage relationships, and convert leads to opportunities
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
              data-testid="search-leads"
            />
          </div>
          <Button data-testid="button-add-lead" onClick={() => {
            setEditingLead(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="leads-list">
            {filteredLeads.map((lead) => {
              const SourceIcon = getSourceIcon(lead.leadSource);
              return (
                <Card key={lead.id} className="hover:shadow-md transition-shadow" data-testid={`card-lead-${lead.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base" data-testid={`text-company-${lead.id}`}>
                          {lead.companyName}
                        </CardTitle>
                        <CardDescription data-testid={`text-contact-${lead.id}`}>
                          {lead.contactPersonName}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(lead.leadStatus)} data-testid={`badge-status-${lead.id}`}>
                        {lead.leadStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <SourceIcon className="h-4 w-4 text-muted-foreground" />
                        <span data-testid={`text-source-${lead.id}`}>
                          {lead.leadSource.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {lead.mobileNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-mobile-${lead.id}`}>{lead.mobileNumber}</span>
                        </div>
                      )}
                      
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-email-${lead.id}`}>{lead.email}</span>
                        </div>
                      )}
                      
                      {lead.estimatedValue && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-value-${lead.id}`}>
                            ₹{Number(lead.estimatedValue).toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingLead(lead);
                            setIsDialogOpen(true);
                          }}
                          data-testid={`button-edit-lead-${lead.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvertToClient(lead)}
                          disabled={convertToClientMutation.isPending}
                          data-testid={`button-convert-${lead.id}`}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          {convertToClientMutation.isPending ? "Converting..." : "Convert"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8" data-testid="leads-empty">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Leads Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No leads match your search criteria" : "Start tracking prospects and building your sales pipeline"}
            </p>
          </div>
        )}
      </CardContent>
      
      {/* Lead Dialog */}
      <AddLeadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        lead={editingLead}
        onLeadSaved={() => {
          setIsDialogOpen(false);
          setEditingLead(null);
          queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
        }}
      />
    </Card>
  );
}

// Quotation System Component
function QuotationSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isQuotationDialogOpen, setIsQuotationDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [quotationItems, setQuotationItems] = useState([
    { productId: "", quantity: 0, unit: "", rate: 0, amount: 0 }
  ]);
  const [selectedClient, setSelectedClient] = useState("");
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [description, setDescription] = useState("");
  
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: quotations = [], refetch: refetchQuotations } = useQuery({
    queryKey: ["/api/quotations"],
    retry: false,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });

  // Status update mutation
  const updateQuotationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiCall(`/api/quotations/${id}`, "PUT", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      toast({
        title: "Success",
        description: "Quotation status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quotation status",
        variant: "destructive",
      });
    },
  });

  const createQuotationMutation = useMutation({
    mutationFn: async (quotationData: any) => {
      return apiCall("/api/quotations", "POST", quotationData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quotation created successfully",
      });
      setIsQuotationDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      // Reset form
      setQuotationItems([{ productId: "", quantity: 0, unit: "", rate: 0, amount: 0 }]);
      setSelectedClient("");
      setValidUntil("");
      setPaymentTerms("");
      setDescription("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quotation",
        variant: "destructive",
      });
    },
  });

  const updateQuotationItem = (index: number, field: string, value: any) => {
    const updatedItems = [...quotationItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : updatedItems[index].quantity;
      const rate = field === 'rate' ? parseFloat(value) || 0 : updatedItems[index].rate;
      updatedItems[index].amount = quantity * rate;
    }
    
    setQuotationItems(updatedItems);
  };

  const addQuotationItem = () => {
    setQuotationItems([...quotationItems, { productId: "", quantity: 0, unit: "", rate: 0, amount: 0 }]);
  };

  const removeQuotationItem = (index: number) => {
    if (quotationItems.length > 1) {
      setQuotationItems(quotationItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = quotationItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const totals = calculateTotals();

  const handleCreateQuotation = () => {
    setIsQuotationDialogOpen(true);
  };

  const handleSaveQuotation = async () => {
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    if (quotationItems.every(item => !item.productId)) {
      toast({
        title: "Error", 
        description: "Please add at least one product",
        variant: "destructive",
      });
      return;
    }

    const quotationData = {
      clientId: selectedClient,
      quotationDate: new Date(quotationDate).toISOString(),
      validUntil: validUntil ? new Date(validUntil).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: totals.total,
      discountPercentage: 0,
      discountAmount: 0,
      taxAmount: totals.tax,
      grandTotal: totals.total,
      paymentTerms: `${parseInt(paymentTerms) || 30}`,
      deliveryTerms: "Standard delivery terms",
      specialInstructions: description,
      preparedByUserId: user?.id || "system",
      approvalStatus: "PENDING",
      items: quotationItems.filter(item => item.productId && item.quantity > 0).map(item => ({
        productId: item.productId,
        description: (products as any[]).find((p: any) => p.id === item.productId)?.name || "Product",
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.rate,
        totalPrice: item.amount,
        taxRate: 18,
        taxAmount: item.amount * 0.18,
      }))
    };

    createQuotationMutation.mutate(quotationData);
  };

  const handleViewDetails = (quotation: any) => {
    setSelectedQuotation(quotation);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (quotationId: string, status: string) => {
    updateQuotationStatusMutation.mutate({ id: quotationId, status });
  };

  const handleDownloadPDF = (quotation: any) => {
    // Generate PDF content
    const pdfContent = `
QUOTATION: ${quotation.quotationNumber}

Client: ${(clients as any[]).find((c: any) => c.id === quotation.clientId)?.name || 'Unknown'}
Date: ${new Date(quotation.quotationDate).toLocaleDateString()}
Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}

Total Amount: ₹${parseFloat(quotation.totalAmount).toFixed(2)}
Tax Amount: ₹${parseFloat(quotation.taxAmount || 0).toFixed(2)}
Grand Total: ₹${parseFloat(quotation.grandTotal).toFixed(2)}

Payment Terms: ${quotation.paymentTerms} days
Delivery Terms: ${quotation.deliveryTerms || 'Standard'}

Status: ${quotation.status}
Approval Status: ${quotation.approvalStatus}
    `;

    // Create and download file
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quotation.quotationNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Success",
      description: "Quotation downloaded successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Quotation System
        </CardTitle>
        <CardDescription>Multi-level approvals, competitive pricing, and quote management</CardDescription>
      </CardHeader>
      <CardContent>
        {(quotations as any[]).length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                {(quotations as any[]).length} quotation{(quotations as any[]).length !== 1 ? 's' : ''} found
              </div>
              <Button onClick={handleCreateQuotation} data-testid="button-create-quotation">
                <Plus className="h-4 w-4 mr-2" />
                Create Quotation
              </Button>
            </div>
            
            <div className="space-y-3">
              {(quotations as any[]).map((quotation: any) => (
                <Card key={quotation.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={quotation.status === 'DRAFT' ? 'secondary' : quotation.status === 'SENT' ? 'outline' : quotation.status === 'ACCEPTED' ? 'default' : 'destructive'}>
                          {quotation.status}
                        </Badge>
                        <span className="font-medium">{quotation.quotationNumber}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Client: {(clients as any[]).find((c: any) => c.id === quotation.clientId)?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Date: {new Date(quotation.quotationDate).toLocaleDateString()}
                        {quotation.validUntil && ` • Valid until: ${new Date(quotation.validUntil).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <div className="font-bold">₹{parseFloat(quotation.totalAmount).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {quotation.paymentTerms} days
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(quotation)}
                          data-testid={`button-view-details-${quotation.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(quotation)}
                          data-testid={`button-download-${quotation.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" data-testid={`button-actions-${quotation.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {quotation.status === 'DRAFT' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(quotation.id, 'SENT')}>
                                <Send className="h-4 w-4 mr-2" />
                                Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {quotation.status === 'SENT' && (
                              <>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(quotation.id, 'ACCEPTED')}>
                                  <ThumbsUp className="h-4 w-4 mr-2" />
                                  Mark as Accepted
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(quotation.id, 'REJECTED')}>
                                  <ThumbsDown className="h-4 w-4 mr-2" />
                                  Mark as Rejected
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Quotation Management</h3>
            <p className="text-muted-foreground mb-4">
              Create professional quotes with multi-level approval workflow
            </p>
            <Button onClick={handleCreateQuotation} data-testid="button-create-quotation">
              <Plus className="h-4 w-4 mr-2" />
              Create Quotation
            </Button>
          </div>
        )}
      </CardContent>

      {/* Quotation Creation Dialog */}
      <Dialog open={isQuotationDialogOpen} onOpenChange={setIsQuotationDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
            <DialogDescription>
              Create a professional quotation with detailed pricing and terms
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Client</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {(clients as any[]).length > 0 ? (
                      (clients as any[]).map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-clients" disabled>
                        No clients available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Quotation Date</label>
                <Input 
                  type="date" 
                  value={quotationDate}
                  onChange={(e) => setQuotationDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Valid Until</label>
                <Input 
                  type="date" 
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Terms</label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="45">45 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description/Notes</label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quotation description and special terms..." 
                rows={3} 
              />
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Quotation Items</h4>
              <div className="grid grid-cols-12 gap-2 text-xs font-medium mb-2">
                <div className="col-span-3">Product/Service</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-2">Rate (₹)</div>
                <div className="col-span-2">Amount (₹)</div>
                <div className="col-span-1">Action</div>
              </div>
              
              {quotationItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-3">
                    <Select 
                      value={item.productId} 
                      onValueChange={(value) => updateQuotationItem(index, 'productId', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {(products as any[]).length > 0 ? (
                          (products as any[]).map((product: any) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-products" disabled>
                            No products available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input 
                      className="h-8" 
                      type="number"
                      value={item.quantity || ""} 
                      onChange={(e) => updateQuotationItem(index, 'quantity', e.target.value)}
                      placeholder="0" 
                    />
                  </div>
                  <div className="col-span-2">
                    <Select 
                      value={item.unit} 
                      onValueChange={(value) => updateQuotationItem(index, 'unit', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MT">MT</SelectItem>
                        <SelectItem value="KG">KG</SelectItem>
                        <SelectItem value="L">Liters</SelectItem>
                        <SelectItem value="TONS">Tons</SelectItem>
                        <SelectItem value="DRUMS">Drums</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input 
                      className="h-8" 
                      type="number"
                      step="0.01"
                      value={item.rate || ""} 
                      onChange={(e) => updateQuotationItem(index, 'rate', e.target.value)}
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      className="h-8" 
                      value={item.amount.toFixed(2)} 
                      readOnly 
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-1">
                    {quotationItems.length > 1 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => removeQuotationItem(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="mt-2" onClick={addQuotationItem}>
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Total items: {quotationItems.length}
              </div>
              <div className="text-right">
                <div className="text-sm">Subtotal: ₹{totals.subtotal.toFixed(2)}</div>
                <div className="text-sm">Tax (18% GST): ₹{totals.tax.toFixed(2)}</div>
                <div className="text-lg font-bold">Total: ₹{totals.total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsQuotationDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline">
              Save as Draft
            </Button>
            <Button 
              onClick={handleSaveQuotation}
              disabled={createQuotationMutation.isPending}
            >
              {createQuotationMutation.isPending ? "Creating..." : "Create Quotation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quotation Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
            <DialogDescription>
              Complete quotation information and status tracking
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quotation Number</label>
                  <p className="font-medium">{selectedQuotation.quotationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedQuotation.status === 'DRAFT' ? 'secondary' : selectedQuotation.status === 'SENT' ? 'outline' : selectedQuotation.status === 'ACCEPTED' ? 'default' : 'destructive'}>
                      {selectedQuotation.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="font-medium">
                    {(clients as any[]).find((c: any) => c.id === selectedQuotation.clientId)?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prepared By</label>
                  <p className="font-medium">
                    {(users as any[]).find((u: any) => u.id === selectedQuotation.preparedByUserId)?.name || 
                     (users as any[]).find((u: any) => u.id === selectedQuotation.preparedByUserId)?.username || 
                     'Unknown User'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quotation Date</label>
                  <p className="font-medium">{new Date(selectedQuotation.quotationDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valid Until</label>
                  <p className="font-medium">{new Date(selectedQuotation.validUntil).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm bg-muted p-3 rounded-md">{selectedQuotation.description || 'No description provided'}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Items</label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-5 gap-2 p-3 bg-muted text-xs font-medium">
                    <div>Product</div>
                    <div>Quantity</div>
                    <div>Unit</div>
                    <div>Rate</div>
                    <div>Amount</div>
                  </div>
                  {(selectedQuotation.items || []).map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-5 gap-2 p-3 border-t text-sm">
                      <div>{(products as any[]).find((p: any) => p.id === item.productId)?.name || 'Unknown Product'}</div>
                      <div>{item.quantity}</div>
                      <div>{item.unit}</div>
                      <div>₹{parseFloat(item.rate).toFixed(2)}</div>
                      <div>₹{parseFloat(item.amount).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(selectedQuotation.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Tax (18% GST):</span>
                  <span>₹{parseFloat(selectedQuotation.taxAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                  <span>Grand Total:</span>
                  <span>₹{parseFloat(selectedQuotation.grandTotal).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                  <p className="font-medium">{selectedQuotation.paymentTerms} days</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivery Terms</label>
                  <p className="font-medium">{selectedQuotation.deliveryTerms || 'Standard delivery'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedQuotation && (
              <>
                <Button variant="outline" onClick={() => handleDownloadPDF(selectedQuotation)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedQuotation.status === 'DRAFT' && (
                  <Button onClick={() => {
                    handleUpdateStatus(selectedQuotation.id, 'SENT');
                    setIsDetailsDialogOpen(false);
                  }}>
                    <Send className="h-4 w-4 mr-2" />
                    Send to Client
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Sales Orders Component
function SalesOrderSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Sales Orders
        </CardTitle>
        <CardDescription>Credit checks, inventory allocation, and order processing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Sales Order Management</h3>
          <p className="text-muted-foreground mb-4">
            Process orders with automated credit checks and inventory allocation
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Sales Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Delivery Planning Component
function DeliveryPlanningSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Delivery Planning
        </CardTitle>
        <CardDescription>Route optimization, vehicle allocation, and delivery scheduling</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Delivery Planning</h3>
          <p className="text-muted-foreground mb-4">
            Optimize routes and allocate vehicles for efficient deliveries
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Plan Delivery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Dispatch Management Component
function DispatchManagementSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Dispatch Management
        </CardTitle>
        <CardDescription>Real-time tracking, delivery challans, and logistics coordination</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Dispatch Management</h3>
          <p className="text-muted-foreground mb-4">
            Track vehicles in real-time and manage delivery documentation
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Dispatch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}