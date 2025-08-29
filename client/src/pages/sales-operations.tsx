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
  Package
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
      companyName: lead?.companyName || "",
      contactPersonName: lead?.contactPersonName || "",
      mobileNumber: lead?.mobileNumber || "",
      email: lead?.email || "",
      leadSource: lead?.leadSource || "WEBSITE",
      leadStatus: lead?.leadStatus || "NEW",
      interestedProducts: lead?.interestedProducts || [],
      estimatedValue: lead?.estimatedValue || "",
      expectedCloseDate: lead?.expectedCloseDate ? new Date(lead.expectedCloseDate).toISOString().split('T')[0] : "",
      notes: lead?.notes || "",
      assignedToUserId: lead?.assignedToUserId || user?.id || "",
    },
  });

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
          <Button data-testid="button-add-lead" onClick={() => setIsDialogOpen(true)}>
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
                          onClick={() => {/* Handle convert to opportunity */}}
                          data-testid={`button-convert-${lead.id}`}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Convert
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
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Quotation Management</h3>
          <p className="text-muted-foreground mb-4">
            Create professional quotes with multi-level approval workflow
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
        </div>
      </CardContent>
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