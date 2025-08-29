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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Users,
  Target,
  DollarSign,
  Calendar,
  Package,
  Eye,
  Download,
  MoreHorizontal,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Handshake,
  Trophy,
  X,
  AlertTriangle,
  Building2
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
  users?: any[];
  onLeadSaved: () => void;
}

function AddLeadDialog({ open, onOpenChange, lead, users, onLeadSaved }: AddLeadDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(
      insertLeadSchema
        .omit({ leadNumber: true })
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
      primarySalesPersonId: user?.id || "",
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
        interestedProducts: Array.isArray(lead.interestedProducts) ? lead.interestedProducts : [],
        estimatedValue: lead.estimatedValue || "",
        expectedCloseDate: lead.expectedCloseDate ? new Date(lead.expectedCloseDate).toISOString().split('T')[0] : "",
        notes: lead.notes || "",
        assignedToUserId: lead.assignedToUserId || user?.id || "",
        primarySalesPersonId: lead.primarySalesPersonId || user?.id || "",
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
        primarySalesPersonId: user?.id || "",
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

            <FormField
              control={form.control}
              name="primarySalesPersonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Sales Person</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales person" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(users as any[])?.filter((user: any) => 
                        user.role === 'SALES_MANAGER' || 
                        user.role === 'SALES_EXECUTIVE' || 
                        user.role === 'ADMIN'
                      ).map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.role.replace('_', ' ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

// Follow-up Dashboard Component
interface FollowUpData {
  id: string;
  leadId: string;
  followUpType: "CALL" | "EMAIL" | "MEETING" | "DEMO" | "PROPOSAL" | "FOLLOW_UP";
  remarks: string;
  followUpDate: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  outcome?: string;
  nextFollowUpDate?: string;
  completedAt?: string;
  assignedUserId: string;
  createdAt: string;
  lead?: any;
}

const followUpFormSchema = z.object({
  leadId: z.string().min(1, "Lead selection is required"),
  followUpType: z.enum(["CALL", "EMAIL", "MEETING", "DEMO", "PROPOSAL", "FOLLOW_UP"], {
    required_error: "Follow-up type is required",
  }),
  remarks: z.string().min(1, "Remarks are required"),
  followUpDate: z.string().min(1, "Follow-up date is required"),
  nextFollowUpDate: z.string().optional(),
  assignedUserId: z.string().min(1, "Assigned user is required"),
});

// New schema for lead-specific follow-up form
const leadFollowUpFormSchema = z.object({
  followUpType: z.enum(["CALL", "EMAIL", "MEETING", "DEMO", "PROPOSAL", "WHATSAPP"], {
    required_error: "Follow-up type is required",
  }),
  remarks: z.string().min(1, "Remarks are required"),
  followUpDate: z.string().min(1, "Follow-up date is required"),
  nextFollowUpDate: z.string().optional(),
});

type FollowUpFormData = z.infer<typeof followUpFormSchema>;
type LeadFollowUpFormData = z.infer<typeof leadFollowUpFormSchema>;

function FollowUpDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Fetch data
  const { data: leadFollowUps = [], isLoading } = useQuery<FollowUpData[]>({
    queryKey: ["/api/lead-follow-ups"],
    retry: false,
  });

  const { data: leads = [] } = useQuery<any[]>({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
    retry: false,
  });

  // Create mutation
  const createFollowUpMutation = useMutation({
    mutationFn: async (data: FollowUpFormData) => {
      return apiCall("/api/lead-follow-ups", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Follow-up created successfully" });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/lead-follow-ups"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create follow-up",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, outcome }: { id: string; status: string; outcome?: string }) => {
      return apiCall(`/api/lead-follow-ups/${id}`, "PUT", { status, outcome });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Follow-up updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/lead-follow-ups"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow-up",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: {
      followUpType: "CALL",
      followUpDate: new Date().toISOString().split("T")[0],
      assignedUserId: "",
    },
  });

  const onSubmit = (data: FollowUpFormData) => {
    createFollowUpMutation.mutate(data);
  };

  const handleStatusUpdate = (id: string, status: string) => {
    if (status === "COMPLETED") {
      const outcome = prompt("Enter follow-up outcome (optional):");
      updateStatusMutation.mutate({ id, status, outcome: outcome || undefined });
    } else {
      updateStatusMutation.mutate({ id, status });
    }
  };

  // Enhanced date filtering functions
  const getDateRange = (period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const startOfWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const endOfWeek = new Date(startOfWeek.getTime() + (6 * 24 * 60 * 60 * 1000));
    
    const startOfNextWeek = new Date(endOfWeek.getTime() + 24 * 60 * 60 * 1000);
    const endOfNextWeek = new Date(startOfNextWeek.getTime() + (6 * 24 * 60 * 60 * 1000));
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    switch (period) {
      case "today": return [today, today];
      case "tomorrow": return [tomorrow, tomorrow];
      case "this_week": return [startOfWeek, endOfWeek];
      case "next_week": return [startOfNextWeek, endOfNextWeek];
      case "this_month": return [startOfMonth, endOfMonth];
      default: return [null, null];
    }
  };

  const isDateInRange = (dateStr: string, start: Date, end: Date) => {
    const date = new Date(dateStr.split("T")[0]);
    return date >= start && date <= end;
  };

  // Enhanced Stats
  const stats = {
    total: leadFollowUps.length,
    overdue: leadFollowUps.filter(f => {
      const today = new Date().toISOString().split("T")[0];
      return f.followUpDate.split("T")[0] < today && f.status === "PENDING";
    }).length,
    today: leadFollowUps.filter(f => {
      const [start, end] = getDateRange("today");
      return start && end && isDateInRange(f.followUpDate, start, end) && f.status === "PENDING";
    }).length,
    tomorrow: leadFollowUps.filter(f => {
      const [start, end] = getDateRange("tomorrow");
      return start && end && isDateInRange(f.followUpDate, start, end) && f.status === "PENDING";
    }).length,
    thisWeek: leadFollowUps.filter(f => {
      const [start, end] = getDateRange("this_week");
      return start && end && isDateInRange(f.followUpDate, start, end) && f.status === "PENDING";
    }).length,
    nextWeek: leadFollowUps.filter(f => {
      const [start, end] = getDateRange("next_week");
      return start && end && isDateInRange(f.followUpDate, start, end) && f.status === "PENDING";
    }).length,
    thisMonth: leadFollowUps.filter(f => {
      const [start, end] = getDateRange("this_month");
      return start && end && isDateInRange(f.followUpDate, start, end) && f.status === "PENDING";
    }).length,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CALL": return <Phone className="h-4 w-4" />;
      case "EMAIL": return <Mail className="h-4 w-4" />;
      case "MEETING": return <Users className="h-4 w-4" />;
      case "DEMO": return <Users className="h-4 w-4" />;
      case "PROPOSAL": return <FileText className="h-4 w-4" />;
      case "FOLLOW_UP": return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };


  // Filter and sort follow-ups by date/time (most recent first)
  const filteredFollowUps = leadFollowUps.filter(followUp => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "pending") return followUp.status === "PENDING";
    if (selectedFilter === "completed") return followUp.status === "COMPLETED";
    
    const today = new Date().toISOString().split("T")[0];
    if (selectedFilter === "overdue") {
      return followUp.followUpDate.split("T")[0] < today && followUp.status === "PENDING";
    }
    
    if (["today", "tomorrow", "this_week", "next_week", "this_month"].includes(selectedFilter)) {
      const [start, end] = getDateRange(selectedFilter);
      if (start && end) {
        return isDateInRange(followUp.followUpDate, start, end) && followUp.status === "PENDING";
      }
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by follow-up date/time (most recent first)
    const dateA = new Date(a.followUpDate);
    const dateB = new Date(b.followUpDate);
    return dateB.getTime() - dateA.getTime();
  });

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading follow-ups...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Follow-up Management</h2>
          <p className="text-gray-600">Track and manage all lead follow-up activities</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Lead Follow-up</DialogTitle>
              <DialogDescription>
                Schedule a new follow-up activity for a lead
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="leadId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-lead">
                            <SelectValue placeholder="Select lead" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leads.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.companyName} - {lead.contactPersonName}
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
                  name="followUpType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CALL">📞 Call</SelectItem>
                          <SelectItem value="EMAIL">📧 Email</SelectItem>
                          <SelectItem value="MEETING">🤝 Meeting</SelectItem>
                          <SelectItem value="DEMO">💻 Demo</SelectItem>
                          <SelectItem value="PROPOSAL">📋 Proposal</SelectItem>
                          <SelectItem value="FOLLOW_UP">👥 Follow Up</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" data-testid="input-follow-up-date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-assigned-user">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.role})
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
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter follow-up remarks..."
                          data-testid="textarea-remarks"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFollowUpMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createFollowUpMutation.isPending ? "Creating..." : "Create Follow-up"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("overdue")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="stat-overdue">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Past due</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("today")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-today">{stats.today}</div>
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("tomorrow")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tomorrow</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-tomorrow">{stats.tomorrow}</div>
            <p className="text-xs text-muted-foreground">Due tomorrow</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("this_week")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="stat-this-week">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("next_week")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Week</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600" data-testid="stat-next-week">{stats.nextWeek}</div>
            <p className="text-xs text-muted-foreground">Next week</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("this_month")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="stat-this-month">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-4">
        {filteredFollowUps.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-ups found</h3>
              <p className="text-gray-600 text-center max-w-md">
                {selectedFilter === "all" 
                  ? "No lead follow-ups have been created yet. Create your first follow-up to get started."
                  : `No follow-ups match the "${selectedFilter}" filter.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFollowUps.slice(0, 5).map((followUp) => {
            const lead = leads.find(l => l.id === followUp.leadId);
            const assignedUser = users.find(u => u.id === followUp.assignedUserId);
            
            return (
              <Card key={followUp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        {getTypeIcon(followUp.followUpType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-base font-medium text-gray-900">
                            {lead?.companyName || "Unknown Lead"} - {lead?.contactPersonName}
                          </h3>
                          <Badge className={getStatusColor(followUp.status)}>
                            {followUp.status}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{followUp.remarks || followUp.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(followUp.followUpDate).toLocaleDateString()} at {new Date(followUp.followUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          {assignedUser && (
                            <div>
                              <strong>Assigned:</strong> {assignedUser.firstName} {assignedUser.lastName}
                            </div>
                          )}
                        </div>
                        
                        {/* Additional follow-up details */}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Type: {followUp.followUpType || followUp.type}
                          </span>
                          {followUp.outcome && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Outcome: {followUp.outcome}
                            </span>
                          )}
                          {followUp.nextFollowUpDate && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              Next: {new Date(followUp.nextFollowUpDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedLeadId(followUp.leadId);
                          setHistoryDialogOpen(true);
                        }}
                      >
                        📋 History
                      </Button>
                      
                      {followUp.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(followUp.id, "COMPLETED")}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        
        {filteredFollowUps.length > 5 && (
          <div className="text-center py-4">
            <Button variant="outline" onClick={() => setSelectedFilter("all")}>
              View All {filteredFollowUps.length} Follow-ups
            </Button>
          </div>
        )}
      </div>

      {/* Follow-up History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Follow-up History</DialogTitle>
            <DialogDescription>
              Complete history of follow-ups for {selectedLeadId ? leads.find(l => l.id === selectedLeadId)?.companyName : "this lead"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] space-y-4">
            {selectedLeadId && (
              <>
                {leadFollowUps
                  .filter(f => f.leadId === selectedLeadId)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((followUp) => {
                    const assignedUser = users.find(u => u.id === followUp.assignedUserId);
                    
                    return (
                      <Card key={followUp.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getTypeIcon(followUp.followUpType)}
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {followUp.followUpType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={getStatusColor(followUp.status)}>
                                    {followUp.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <div>Scheduled: {new Date(followUp.followUpDate).toLocaleDateString()} at {new Date(followUp.followUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <div>Created: {new Date(followUp.createdAt).toLocaleDateString()} at {new Date(followUp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              {followUp.completedAt && (
                                <div>Completed: {new Date(followUp.completedAt).toLocaleDateString()} at {new Date(followUp.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{followUp.remarks || followUp.description}</p>
                          
                          {followUp.outcome && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                              <p className="text-sm">
                                <strong className="text-green-800">Outcome:</strong> 
                                <span className="text-green-700 ml-1">{followUp.outcome}</span>
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            {assignedUser && (
                              <span>Assigned to: {assignedUser.firstName} {assignedUser.lastName}</span>
                            )}
                            {followUp.nextFollowUpDate && (
                              <span>Next follow-up: {new Date(followUp.nextFollowUpDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                
                {leadFollowUps.filter(f => f.leadId === selectedLeadId).length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-up history</h3>
                    <p className="text-gray-600">This lead has no follow-up activities yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(false)}
              data-testid="button-close-history"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Lead & CRM Management Component
// Helper function to get current local date/time in the correct format for datetime-local input
const getCurrentLocalDateTime = () => {
  const now = new Date();
  // Get the timezone offset and adjust for local time
  const timezoneOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
  const localTime = new Date(now.getTime() - timezoneOffset);
  return localTime.toISOString().slice(0, 16);
};

function LeadCRMSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("companyName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [activeFollowUpTab, setActiveFollowUpTab] = useState("create");
  const [followUpFilter, setFollowUpFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  // Update lead status mutation
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      return apiCall(`/api/leads/${leadId}`, "PUT", { leadStatus: status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead status",
        variant: "destructive",
      });
    },
  });

  // Form for lead-specific follow-up
  const leadFollowUpForm = useForm<LeadFollowUpFormData>({
    resolver: zodResolver(leadFollowUpFormSchema),
    defaultValues: {
      followUpType: "CALL",
      remarks: "",
      followUpDate: getCurrentLocalDateTime(), // Auto-fill current date/time
      nextFollowUpDate: "",
    },
  });

  // Create lead follow-up mutation
  const createLeadFollowUpMutation = useMutation({
    mutationFn: async (data: LeadFollowUpFormData & { leadId: string; assignedUserId: string }) => {
      return apiCall("/api/lead-follow-ups", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Follow-up scheduled successfully" });
      leadFollowUpForm.reset({
        followUpType: "CALL",
        remarks: "",
        followUpDate: getCurrentLocalDateTime(),
        nextFollowUpDate: "",
      });
      setActiveFollowUpTab("history");
      queryClient.invalidateQueries({ queryKey: ["/api/lead-follow-ups"] });
      if (selectedLead?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/lead-follow-ups", selectedLead.id] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create follow-up",
        variant: "destructive",
      });
    },
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
    retry: false,
  });

  // Query for lead follow-up history
  const { data: leadFollowUps = [], isLoading: isLoadingFollowUps } = useQuery<any[]>({
    queryKey: ["/api/lead-follow-ups", selectedLead?.id],
    queryFn: () => {
      if (!selectedLead?.id) return Promise.resolve([]);
      return apiCall(`/api/lead-follow-ups?leadId=${selectedLead.id}`, "GET");
    },
    enabled: !!selectedLead?.id && isFollowUpDialogOpen,
    retry: false,
  });

  const onLeadFollowUpSubmit = (data: LeadFollowUpFormData) => {
    if (!selectedLead) return;
    
    // Get current user ID (assuming first user for now, you might want to get from context)
    const currentUserId = users[0]?.id;
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "No user found for assignment",
        variant: "destructive",
      });
      return;
    }

    createLeadFollowUpMutation.mutate({
      ...data,
      leadId: selectedLead.id,
      assignedUserId: currentUserId,
    });
  };

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

  // Query for all follow-ups to show summary cards
  const { data: allFollowUps = [] } = useQuery<any[]>({
    queryKey: ["/api/lead-follow-ups"],
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

  // Helper functions for date filtering
  const getDateRanges = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfNextWeek = new Date(endOfWeek);
    startOfNextWeek.setDate(endOfWeek.getDate() + 1);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      today,
      tomorrow,
      tomorrowEnd: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 - 1),
      startOfWeek,
      endOfWeek,
      startOfNextWeek,
      endOfNextWeek,
      startOfMonth,
      endOfMonth
    };
  };

  const getFollowUpCounts = () => {
    const ranges = getDateRanges();
    
    return {
      overdue: allFollowUps.filter(f => {
        // Use nextFollowUpDate if available, otherwise use followUpDate
        const dateToCheck = f.nextFollowUpDate || f.followUpDate || f.createdAt;
        const followUpDate = new Date(dateToCheck);
        return followUpDate < ranges.today && f.status !== 'COMPLETED';
      }).length,
      
      today: allFollowUps.filter(f => {
        const dateToCheck = f.nextFollowUpDate || f.followUpDate || f.createdAt;
        const followUpDate = new Date(dateToCheck);
        return followUpDate >= ranges.today && followUpDate < ranges.tomorrow && f.status !== 'COMPLETED';
      }).length,
      
      tomorrow: allFollowUps.filter(f => {
        const dateToCheck = f.nextFollowUpDate || f.followUpDate || f.createdAt;
        const followUpDate = new Date(dateToCheck);
        return followUpDate >= ranges.tomorrow && followUpDate < ranges.tomorrowEnd && f.status !== 'COMPLETED';
      }).length,
      
      thisWeek: allFollowUps.filter(f => {
        const dateToCheck = f.nextFollowUpDate || f.followUpDate || f.createdAt;
        const followUpDate = new Date(dateToCheck);
        return followUpDate >= ranges.today && followUpDate <= ranges.endOfWeek && f.status !== 'COMPLETED';
      }).length,
      
      nextWeek: allFollowUps.filter(f => {
        const dateToCheck = f.nextFollowUpDate || f.followUpDate || f.createdAt;
        const followUpDate = new Date(dateToCheck);
        return followUpDate >= ranges.startOfNextWeek && followUpDate <= ranges.endOfNextWeek && f.status !== 'COMPLETED';
      }).length,
      
      thisMonth: allFollowUps.filter(f => {
        const dateToCheck = f.nextFollowUpDate || f.followUpDate || f.createdAt;
        const followUpDate = new Date(dateToCheck);
        return followUpDate >= ranges.startOfMonth && followUpDate <= ranges.endOfMonth && f.status !== 'COMPLETED';
      }).length
    };
  };

  const followUpCounts = getFollowUpCounts();

  // Filter leads by follow-up dates
  const getFilteredLeadsByFollowUp = (leads: Lead[]) => {
    if (followUpFilter === 'all') return leads;
    
    const ranges = getDateRanges();
    const leadsWithFollowUps = leads.filter(lead => {
      const leadFollowUps = allFollowUps.filter(f => f.leadId === lead.id && f.status !== 'COMPLETED');
      
      return leadFollowUps.some(f => {
        // Use nextFollowUpDate if available, otherwise use followUpDate
        const dateToCheck = f.nextFollowUpDate || f.followUpDate || f.createdAt;
        const followUpDate = new Date(dateToCheck);
        
        switch (followUpFilter) {
          case 'overdue':
            return followUpDate < ranges.today;
          case 'today':
            return followUpDate >= ranges.today && followUpDate < ranges.tomorrow;
          case 'tomorrow':
            return followUpDate >= ranges.tomorrow && followUpDate < ranges.tomorrowEnd;
          case 'thisWeek':
            return followUpDate >= ranges.today && followUpDate <= ranges.endOfWeek;
          case 'nextWeek':
            return followUpDate >= ranges.startOfNextWeek && followUpDate <= ranges.endOfNextWeek;
          case 'thisMonth':
            return followUpDate >= ranges.startOfMonth && followUpDate <= ranges.endOfMonth;
          default:
            return true;
        }
      });
    });
    
    return leadsWithFollowUps;
  };

  // Filter and sort leads
  const filteredLeads = leads?.filter(lead => {
    // Text search filter
    const matchesSearch = lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || lead.leadStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  const filteredAndSortedLeads = getFilteredLeadsByFollowUp(filteredLeads)
  .sort((a, b) => {
    let aValue = a[sortField as keyof Lead] as string;
    let bValue = b[sortField as keyof Lead] as string;
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  }) || [];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleStatusUpdate = (leadId: string, newStatus: string) => {
    updateLeadStatusMutation.mutate({ leadId, status: newStatus });
  };

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
        {/* Lead Status Cards */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {/* New */}
          <Card 
            className={`border-blue-200 bg-blue-50 cursor-pointer hover:shadow-md transition-shadow ${
              statusFilter === 'NEW' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter(statusFilter === 'NEW' ? 'all' : 'NEW')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {leads?.filter(lead => lead.leadStatus === 'NEW').length || 0}
                  </div>
                  <div className="text-sm text-blue-700">New</div>
                </div>
                <User className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Contacted */}
          <Card 
            className={`border-green-200 bg-green-50 cursor-pointer hover:shadow-md transition-shadow ${
              statusFilter === 'CONTACTED' ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => setStatusFilter(statusFilter === 'CONTACTED' ? 'all' : 'CONTACTED')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {leads?.filter(lead => lead.leadStatus === 'CONTACTED').length || 0}
                  </div>
                  <div className="text-sm text-green-700">Contacted</div>
                </div>
                <Phone className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Qualified */}
          <Card 
            className={`border-purple-200 bg-purple-50 cursor-pointer hover:shadow-md transition-shadow ${
              statusFilter === 'QUALIFIED' ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setStatusFilter(statusFilter === 'QUALIFIED' ? 'all' : 'QUALIFIED')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {leads?.filter(lead => lead.leadStatus === 'QUALIFIED').length || 0}
                  </div>
                  <div className="text-sm text-purple-700">Qualified</div>
                </div>
                <CheckCircle className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {/* Proposal */}
          <Card 
            className={`border-orange-200 bg-orange-50 cursor-pointer hover:shadow-md transition-shadow ${
              statusFilter === 'PROPOSAL' ? 'ring-2 ring-orange-500' : ''
            }`}
            onClick={() => setStatusFilter(statusFilter === 'PROPOSAL' ? 'all' : 'PROPOSAL')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {leads?.filter(lead => lead.leadStatus === 'PROPOSAL').length || 0}
                  </div>
                  <div className="text-sm text-orange-700">Proposal</div>
                </div>
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {/* Negotiation */}
          <Card 
            className={`border-yellow-200 bg-yellow-50 cursor-pointer hover:shadow-md transition-shadow ${
              statusFilter === 'NEGOTIATION' ? 'ring-2 ring-yellow-500' : ''
            }`}
            onClick={() => setStatusFilter(statusFilter === 'NEGOTIATION' ? 'all' : 'NEGOTIATION')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {leads?.filter(lead => lead.leadStatus === 'NEGOTIATION').length || 0}
                  </div>
                  <div className="text-sm text-yellow-700">Negotiation</div>
                </div>
                <Handshake className="h-5 w-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          {/* Closed Won */}
          <Card 
            className={`border-emerald-200 bg-emerald-50 cursor-pointer hover:shadow-md transition-shadow ${
              statusFilter === 'CLOSED_WON' ? 'ring-2 ring-emerald-500' : ''
            }`}
            onClick={() => setStatusFilter(statusFilter === 'CLOSED_WON' ? 'all' : 'CLOSED_WON')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {leads?.filter(lead => lead.leadStatus === 'CLOSED_WON').length || 0}
                  </div>
                  <div className="text-sm text-emerald-700">Won</div>
                </div>
                <Trophy className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          {/* Closed Lost */}
          <Card 
            className={`border-red-200 bg-red-50 cursor-pointer hover:shadow-md transition-shadow ${
              statusFilter === 'CLOSED_LOST' ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => setStatusFilter(statusFilter === 'CLOSED_LOST' ? 'all' : 'CLOSED_LOST')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {leads?.filter(lead => lead.leadStatus === 'CLOSED_LOST').length || 0}
                  </div>
                  <div className="text-sm text-red-700">Lost</div>
                </div>
                <X className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Follow-up Summary Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {/* Overdue */}
          <Card 
            className={`border-red-200 bg-red-50 cursor-pointer hover:shadow-md transition-shadow ${
              followUpFilter === 'overdue' ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => setFollowUpFilter(followUpFilter === 'overdue' ? 'all' : 'overdue')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {followUpCounts.overdue}
                  </div>
                  <div className="text-sm text-red-700">Past due</div>
                </div>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Today */}
          <Card 
            className={`border-blue-200 bg-blue-50 cursor-pointer hover:shadow-md transition-shadow ${
              followUpFilter === 'today' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setFollowUpFilter(followUpFilter === 'today' ? 'all' : 'today')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {followUpCounts.today}
                  </div>
                  <div className="text-sm text-blue-700">Due today</div>
                </div>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Tomorrow */}
          <Card 
            className={`border-green-200 bg-green-50 cursor-pointer hover:shadow-md transition-shadow ${
              followUpFilter === 'tomorrow' ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => setFollowUpFilter(followUpFilter === 'tomorrow' ? 'all' : 'tomorrow')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {followUpCounts.tomorrow}
                  </div>
                  <div className="text-sm text-green-700">Due tomorrow</div>
                </div>
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card 
            className={`border-purple-200 bg-purple-50 cursor-pointer hover:shadow-md transition-shadow ${
              followUpFilter === 'thisWeek' ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setFollowUpFilter(followUpFilter === 'thisWeek' ? 'all' : 'thisWeek')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {followUpCounts.thisWeek}
                  </div>
                  <div className="text-sm text-purple-700">This week</div>
                </div>
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {/* Next Week */}
          <Card 
            className={`border-indigo-200 bg-indigo-50 cursor-pointer hover:shadow-md transition-shadow ${
              followUpFilter === 'nextWeek' ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setFollowUpFilter(followUpFilter === 'nextWeek' ? 'all' : 'nextWeek')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {followUpCounts.nextWeek}
                  </div>
                  <div className="text-sm text-indigo-700">Next week</div>
                </div>
                <Calendar className="h-5 w-5 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card 
            className={`border-orange-200 bg-orange-50 cursor-pointer hover:shadow-md transition-shadow ${
              followUpFilter === 'thisMonth' ? 'ring-2 ring-orange-500' : ''
            }`}
            onClick={() => setFollowUpFilter(followUpFilter === 'thisMonth' ? 'all' : 'thisMonth')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {followUpCounts.thisMonth}
                  </div>
                  <div className="text-sm text-orange-700">This month</div>
                </div>
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Data Grid */}
        {filteredAndSortedLeads.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("companyName")}>
                    <div className="flex items-center gap-1">
                      Company Name
                      {sortField === "companyName" && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("contactPersonName")}>
                    <div className="flex items-center gap-1">
                      Contact Person
                      {sortField === "contactPersonName" && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("leadSource")}>
                    <div className="flex items-center gap-1">
                      Source
                      {sortField === "leadSource" && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("estimatedValue")}>
                    <div className="flex items-center gap-1">
                      Est. Value
                      {sortField === "estimatedValue" && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Next Follow-up</TableHead>
                  <TableHead>Primary Sales Person</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLeads.map((lead) => {
                  const SourceIcon = getSourceIcon(lead.leadSource);
                  return (
                    <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium" data-testid={`text-company-${lead.id}`}>
                          {lead.companyName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div data-testid={`text-contact-${lead.id}`}>
                          {lead.contactPersonName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {lead.mobileNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span data-testid={`text-mobile-${lead.id}`}>{lead.mobileNumber}</span>
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span data-testid={`text-email-${lead.id}`} className="truncate max-w-[150px]">
                                {lead.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <SourceIcon className="h-4 w-4 text-muted-foreground" />
                          <span data-testid={`text-source-${lead.id}`}>
                            {lead.leadSource.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.leadStatus}
                          onValueChange={(value) => handleStatusUpdate(lead.id, value)}
                          data-testid={`select-status-${lead.id}`}
                        >
                          <SelectTrigger className="w-auto min-w-[120px]">
                            <SelectValue>
                              <Badge className={getStatusColor(lead.leadStatus)}>
                                {lead.leadStatus.replace('_', ' ')}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">🆕 New</SelectItem>
                            <SelectItem value="CONTACTED">📞 Contacted</SelectItem>
                            <SelectItem value="QUALIFIED">✅ Qualified</SelectItem>
                            <SelectItem value="PROPOSAL">📋 Proposal</SelectItem>
                            <SelectItem value="NEGOTIATION">🤝 Negotiation</SelectItem>
                            <SelectItem value="CLOSED_WON">🎉 Closed Won</SelectItem>
                            <SelectItem value="CLOSED_LOST">❌ Closed Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {lead.estimatedValue && (
                          <div className="text-right font-medium" data-testid={`text-value-${lead.id}`}>
                            ₹{Number(lead.estimatedValue).toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          // Get the next follow-up for this lead
                          const leadFollowUps = allFollowUps.filter(f => f.leadId === lead.id && f.status !== 'COMPLETED');
                          if (leadFollowUps.length === 0) return <span className="text-muted-foreground text-sm">No follow-up</span>;
                          
                          // Find the next follow-up date
                          const nextFollowUp = leadFollowUps.reduce((earliest, current) => {
                            const currentDate = new Date(current.nextFollowUpDate || current.followUpDate || current.createdAt);
                            const earliestDate = new Date(earliest.nextFollowUpDate || earliest.followUpDate || earliest.createdAt);
                            return currentDate < earliestDate ? current : earliest;
                          });
                          
                          const nextDate = new Date(nextFollowUp.nextFollowUpDate || nextFollowUp.followUpDate || nextFollowUp.createdAt);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          const isOverdue = nextDate < today;
                          const isToday = nextDate.toDateString() === today.toDateString();
                          
                          return (
                            <div className="text-sm">
                              <div className={`font-medium ${isOverdue ? 'text-red-600' : isToday ? 'text-orange-600' : 'text-blue-600'}`}>
                                {nextDate.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {nextFollowUp.followUpType || nextFollowUp.type || 'FOLLOW_UP'}
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {lead.primarySalesPersonId ? 
                          (users as any[])?.find(u => u.id === lead.primarySalesPersonId)?.firstName + ' ' + 
                          (users as any[])?.find(u => u.id === lead.primarySalesPersonId)?.lastName 
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsFollowUpDialogOpen(true);
                            }}
                            data-testid={`button-followup-${lead.id}`}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingLead(lead);
                              setIsDialogOpen(true);
                            }}
                            data-testid={`button-edit-${lead.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={lead.leadStatus === 'QUALIFIED' ? "default" : "secondary"}
                            size="sm"
                            onClick={() => handleConvertToClient(lead)}
                            disabled={lead.leadStatus !== 'QUALIFIED' || convertToClientMutation.isPending}
                            data-testid={`button-convert-${lead.id}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12" data-testid="leads-empty">
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
        users={users}
        onLeadSaved={() => {
          setIsDialogOpen(false);
          setEditingLead(null);
          queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
        }}
      />

      {/* Lead Follow-up Dialog */}
      <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Follow-up Management</DialogTitle>
            <DialogDescription>
              Manage follow-ups for {selectedLead?.companyName || "this lead"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              {/* Lead Information Display */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Lead Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <div className="font-medium">{selectedLead.companyName}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Contact Person:</span>
                      <div className="font-medium">{selectedLead.contactPersonName}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <div className="font-medium">{selectedLead.mobileNumber || "N/A"}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <div className="font-medium">{selectedLead.emailId || "N/A"}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedLead.leadStatus)}>
                        {selectedLead.leadStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Estimated Value:</span>
                      <div className="font-medium">
                        {selectedLead.estimatedValue ? `₹${Number(selectedLead.estimatedValue).toLocaleString()}` : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for Create Follow-up and History */}
              <Tabs value={activeFollowUpTab} onValueChange={setActiveFollowUpTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Create Follow-up</TabsTrigger>
                  <TabsTrigger value="history">
                    History ({leadFollowUps.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                  {/* Follow-up Form */}
                  <Form {...leadFollowUpForm}>
                    <form onSubmit={leadFollowUpForm.handleSubmit(onLeadFollowUpSubmit)} className="space-y-4">
                      <FormField
                        control={leadFollowUpForm.control}
                        name="followUpType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-up Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select follow-up type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="CALL">📞 Call</SelectItem>
                                <SelectItem value="EMAIL">📧 Email</SelectItem>
                                <SelectItem value="MEETING">🤝 Meeting</SelectItem>
                                <SelectItem value="DEMO">💻 Demo</SelectItem>
                                <SelectItem value="PROPOSAL">📋 Proposal</SelectItem>
                                <SelectItem value="WHATSAPP">💬 WhatsApp</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={leadFollowUpForm.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                              <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter follow-up details or notes..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={leadFollowUpForm.control}
                        name="followUpDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-up Date & Time</FormLabel>
                            <FormControl>
                              <input
                                type="datetime-local"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={leadFollowUpForm.control}
                        name="nextFollowUpDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Next Follow-up Date (Optional)</FormLabel>
                            <FormControl>
                              <input
                                type="datetime-local"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsFollowUpDialogOpen(false);
                            setSelectedLead(null);
                            setActiveFollowUpTab("create");
                            leadFollowUpForm.reset({
                              followUpType: "CALL",
                              remarks: "",
                              followUpDate: getCurrentLocalDateTime(),
                              nextFollowUpDate: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createLeadFollowUpMutation.isPending}
                        >
                          {createLeadFollowUpMutation.isPending ? "Scheduling..." : "Schedule Follow-up"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  {/* Follow-up History */}
                  {isLoadingFollowUps ? (
                    <div className="text-center py-4">Loading follow-up history...</div>
                  ) : (
                    <div className="space-y-3">
                      {leadFollowUps.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No follow-ups yet</p>
                          <p className="text-sm">Switch to "Create Follow-up" tab to schedule the first follow-up</p>
                        </div>
                      ) : (
                        leadFollowUps
                          .sort((a, b) => new Date(b.followUpDate || b.createdAt).getTime() - new Date(a.followUpDate || a.createdAt).getTime())
                          .map((followUp) => (
                            <Card key={followUp.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-blue-50">
                                      {followUp.followUpType || followUp.type || 'FOLLOW_UP'}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      {new Date(followUp.followUpDate || followUp.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium">
                                    {followUp.remarks || followUp.description || 'No details provided'}
                                  </p>
                                  {followUp.nextFollowUpDate && (
                                    <p className="text-xs text-blue-600">
                                      Next follow-up: {new Date(followUp.nextFollowUpDate).toLocaleString()}
                                    </p>
                                  )}
                                  {followUp.assignedUser && (
                                    <p className="text-xs text-gray-500">
                                      Assigned to: {followUp.assignedUser.firstName} {followUp.assignedUser.lastName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Quotation System Component
function QuotationSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch leads data for quotation creation
  const { data: leads } = useQuery({
    queryKey: ["/api/leads"],
    enabled: true,
  });
  const [isQuotationDialogOpen, setIsQuotationDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [quotationItems, setQuotationItems] = useState([
    { productId: "", quantity: 0, unit: "", rate: 0, amount: 0 }
  ]);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientType, setClientType] = useState<"lead" | "client">("client");
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
    // Reset form when opening dialog
    setSelectedClient("");
    setClientType("client");
    setQuotationDate(new Date().toISOString().split('T')[0]);
    setValidUntil("");
    setPaymentTerms("");
    setDescription("");
    setQuotationItems([{ productId: "", quantity: 0, unit: "", rate: 0, amount: 0 }]);
    setIsQuotationDialogOpen(true);
  };

  const handleSaveQuotation = async () => {
    if (!selectedClient) {
      toast({
        title: "Error",
        description: `Please select a ${clientType === "client" ? "client" : "lead"}`,
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
      clientType: clientType, // Add client type to identify if it's lead or client
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

  // Helper function to get client/lead name for quotation display
  const getQuotationClientName = (quotation: any) => {
    if (quotation.clientType === "lead") {
      const lead = leads?.find((l: any) => l.id === quotation.clientId);
      return lead ? `${lead.companyName} - ${lead.contactPersonName}` : 'Unknown Lead';
    } else {
      const client = (clients as any[]).find((c: any) => c.id === quotation.clientId);
      return client?.name || 'Unknown Client';
    }
  };

  const handleDownloadPDF = async (quotation: any) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('QUOTATION', 105, 25, { align: 'center' });
    
    // Quotation details header
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Quotation No: ${quotation.quotationNumber}`, 20, 45);
    doc.text(`Date: ${new Date(quotation.quotationDate).toLocaleDateString()}`, 20, 52);
    doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 20, 59);
    
    // Client Details
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 20, 75);
    doc.setFont(undefined, 'normal');
    const clientName = getQuotationClientName(quotation);
    doc.text(clientName, 20, 82);
    
    // Prepared by
    doc.setFont(undefined, 'bold');
    doc.text('Prepared By:', 130, 75);
    doc.setFont(undefined, 'normal');
    const preparedBy = (users as any[]).find((u: any) => u.id === quotation.preparedByUserId);
    doc.text(preparedBy ? `${preparedBy.firstName} ${preparedBy.lastName}` : 'Admin', 130, 82);
    
    // Table Header
    const startY = 100;
    doc.setFont(undefined, 'bold');
    doc.text('Description', 20, startY);
    doc.text('Qty', 95, startY);
    doc.text('Unit', 115, startY);
    doc.text('Rate', 135, startY);
    doc.text('Amount', 165, startY);
    
    // Table line
    doc.line(20, startY + 2, 190, startY + 2);
    
    // Items
    doc.setFont(undefined, 'normal');
    let currentY = startY + 10;
    let subtotal = 0;
    
    if (quotation.items && quotation.items.length > 0) {
      quotation.items.forEach((item: any) => {
        const description = item.description || (products as any[]).find((p: any) => p.id === item.productId)?.name || 'Unknown Product';
        const quantity = item.quantity || 0;
        const unit = item.unit || 'Nos';
        const rate = parseFloat(item.unitPrice || item.rate || 0);
        const amount = parseFloat(item.totalPrice || item.amount || 0);
        
        // Handle long descriptions
        const descLines = doc.splitTextToSize(description, 70);
        doc.text(descLines, 20, currentY);
        doc.text(quantity.toString(), 95, currentY);
        doc.text(unit, 115, currentY);
        doc.text(`₹${rate.toFixed(2)}`, 135, currentY);
        doc.text(`₹${amount.toFixed(2)}`, 165, currentY);
        
        subtotal += amount;
        currentY += Math.max(descLines.length * 5, 8);
      });
    } else {
      doc.text('No items found', 20, currentY);
      currentY += 10;
    }
    
    // Totals section
    currentY += 10;
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
    
    const taxRate = 18;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;
    
    doc.text('Subtotal:', 130, currentY);
    doc.text(`₹${subtotal.toFixed(2)}`, 165, currentY);
    currentY += 7;
    
    doc.text(`Tax (${taxRate}% GST):`, 130, currentY);
    doc.text(`₹${taxAmount.toFixed(2)}`, 165, currentY);
    currentY += 7;
    
    doc.setFont(undefined, 'bold');
    doc.text('Grand Total:', 130, currentY);
    doc.text(`₹${grandTotal.toFixed(2)}`, 165, currentY);
    
    // Terms and conditions
    currentY += 20;
    doc.setFont(undefined, 'bold');
    doc.text('Terms & Conditions:', 20, currentY);
    doc.setFont(undefined, 'normal');
    currentY += 7;
    doc.text(`Payment Terms: ${quotation.paymentTerms || 30} days`, 20, currentY);
    currentY += 5;
    doc.text(`Delivery Terms: ${quotation.deliveryTerms || 'Standard delivery terms'}`, 20, currentY);
    
    if (quotation.specialInstructions) {
      currentY += 5;
      doc.text(`Special Instructions: ${quotation.specialInstructions}`, 20, currentY);
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text('Thank you for your business!', 105, pageHeight - 20, { align: 'center' });
    
    // Save the PDF
    doc.save(`${quotation.quotationNumber}.pdf`);

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
                        Client: {getQuotationClientName(quotation)}
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
            {/* Client Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Client Type</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="client"
                    checked={clientType === "client"}
                    onChange={(e) => {
                      setClientType(e.target.value as "lead" | "client");
                      setSelectedClient(""); // Reset selection when type changes
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Existing Client</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="lead"
                    checked={clientType === "lead"}
                    onChange={(e) => {
                      setClientType(e.target.value as "lead" | "client");
                      setSelectedClient(""); // Reset selection when type changes
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm">New Client (from Leads)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {clientType === "client" ? "Select Client" : "Select Lead"}
                </label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientType === "client" ? (
                      // Show existing clients from client management
                      (clients as any[]).length > 0 ? (
                        (clients as any[]).map((client: any) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-clients" disabled>
                          No clients available
                        </SelectItem>
                      )
                    ) : (
                      // Show leads from Lead & CRM management
                      leads && leads.length > 0 ? (
                        leads.map((lead: any) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.companyName} - {lead.contactPersonName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-leads" disabled>
                          No leads available
                        </SelectItem>
                      )
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
                    {getQuotationClientName(selectedQuotation)}
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
                      <div>{item.description || (products as any[]).find((p: any) => p.id === item.productId)?.name || 'Unknown Product'}</div>
                      <div>{item.quantity}</div>
                      <div>{item.unit}</div>
                      <div>₹{parseFloat(item.unitPrice || item.rate || 0).toFixed(2)}</div>
                      <div>₹{parseFloat(item.totalPrice || item.amount || 0).toFixed(2)}</div>
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