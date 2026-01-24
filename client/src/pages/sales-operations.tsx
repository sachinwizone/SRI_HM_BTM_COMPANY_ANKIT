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
  Building2,
  Trash2,
  MessageCircle
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
import { generateBitumenQuotationPDF } from "@/components/quotation-template";
import { generateBitumenSalesOrderPDF } from "@/components/sales-order-template";
import { printSalesOrder } from "@/utils/printInvoice";
import { SalesOrderLedger } from "@/components/SalesOrderLedger";

// Edit Sales Order Form Component
function EditSalesOrderForm({ salesOrder, onClose, onSave }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    status: salesOrder.status || 'DRAFT',
    creditCheckStatus: salesOrder.creditCheckStatus || 'PENDING',
    expectedDeliveryDate: salesOrder.expectedDeliveryDate || '',
    notes: salesOrder.notes || ''
  });

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/sales-orders/${salesOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sales order updated successfully."
        });
        onSave();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sales order.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Order Status</label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Credit Check Status</label>
          <Select value={formData.creditCheckStatus} onValueChange={(value) => setFormData({...formData, creditCheckStatus: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select credit status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Expected Delivery Date</label>
        <Input
          type="date"
          value={formData.expectedDeliveryDate}
          onChange={(e) => setFormData({...formData, expectedDeliveryDate: e.target.value})}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Add any notes..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

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
        interestedProducts: (Array.isArray(lead.interestedProducts) ? lead.interestedProducts : []) as any,
        estimatedValue: (lead as any).estimatedValue || "",
        expectedCloseDate: (lead as any).expectedCloseDate ? new Date((lead as any).expectedCloseDate).toISOString().split('T')[0] : "",
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
                        <SelectItem value="NEW" className="bg-blue-50 hover:bg-blue-100">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                            <span>New</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CONTACTED" className="bg-pink-50 hover:bg-pink-100">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                            <span>Contacted</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="QUALIFIED" className="bg-green-50 hover:bg-green-100">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Qualified</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PROPOSAL" className="bg-gray-50 hover:bg-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <span>Proposal</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="NEGOTIATION" className="bg-yellow-50 hover:bg-yellow-100">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Negotiation</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CLOSED_WON" className="bg-purple-50 hover:bg-purple-100">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span>Closed Won</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CLOSED_LOST" className="bg-red-50 hover:bg-red-100">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>Closed Lost</span>
                          </div>
                        </SelectItem>
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
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"], {
    required_error: "Follow-up status is required",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
    required_error: "Priority is required",
  }),
  assignedUserId: z.string().min(1, "Assigned user is required"),
  outcome: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
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
                          <SelectItem value="CALL">Call</SelectItem>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="MEETING">Meeting</SelectItem>
                          <SelectItem value="DEMO">Demo</SelectItem>
                          <SelectItem value="PROPOSAL">Proposal</SelectItem>
                          <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
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
                        
                        <p className="text-gray-700 mb-2">{followUp.remarks}</p>
                        
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
                            Type: {followUp.followUpType}
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
                        History
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
                          
                          <p className="text-gray-700 mb-3">{followUp.remarks || (followUp as any).description}</p>
                          
                          {followUp.outcome && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                              <p className="text-sm">
                                <strong className="text-green-800">Outcome:</strong> 
                                <span className="text-green-700 ml-1">{followUp.outcome}</span>
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="space-y-1">
                              {assignedUser && (
                                <div>Assigned to: {assignedUser.firstName} {assignedUser.lastName}</div>
                              )}
                              <div className="font-medium">
                                Updated by: {assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Unknown User'}
                              </div>
                            </div>
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
  const { user } = useAuth();
  
  // Debug: Log current user info
  console.log("Current user in LeadCRMSection:", user);
  
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
      status: "PENDING",
      priority: "MEDIUM",
      assignedUserId: "",
      outcome: "",
      reminderEnabled: false,
    },
  });

  // Create lead follow-up mutation
  const createLeadFollowUpMutation = useMutation({
    mutationFn: async (data: LeadFollowUpFormData & { leadId: string }) => {
      return apiCall("/api/lead-follow-ups", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Follow-up scheduled successfully" });
      leadFollowUpForm.reset({
        followUpType: "CALL",
        remarks: "",
        followUpDate: getCurrentLocalDateTime(),
        nextFollowUpDate: "",
        status: "PENDING",
        priority: "MEDIUM",
        assignedUserId: "",
        outcome: "",
        reminderEnabled: false,
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
    
    // Use the assigned user from the form, or default to current user
    if (!data.assignedUserId) {
      toast({
        title: "Error",
        description: "Please select a team member to assign this follow-up to",
        variant: "destructive",
      });
      return;
    }

    createLeadFollowUpMutation.mutate({
      ...data,
      leadId: selectedLead.id,
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

  const { data: leads, isLoading, error } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    retry: false,
    onError: (error: any) => {
      console.error("Failed to fetch leads:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load leads. Please check your permissions.",
        variant: "destructive"
      });
    }
  });

  // Log leads data for debugging
  console.log("Leads query result:", { leads, isLoading, error });
  console.log("Leads array:", leads);
  console.log("Leads length:", leads?.length);

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

  // Debug: Log filtering results
  console.log("Filtered leads:", filteredLeads);
  console.log("Filtered and sorted leads:", filteredAndSortedLeads);
  console.log("Follow-up filter:", followUpFilter);
  console.log("Status filter:", statusFilter);
  console.log("Search term:", searchTerm);

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
                        <span className="text-xs">{sortDirection === "asc" ? "Γåæ" : "Γåô"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("contactPersonName")}>
                    <div className="flex items-center gap-1">
                      Contact Person
                      {sortField === "contactPersonName" && (
                        <span className="text-xs">{sortDirection === "asc" ? "Γåæ" : "Γåô"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("leadSource")}>
                    <div className="flex items-center gap-1">
                      Source
                      {sortField === "leadSource" && (
                        <span className="text-xs">{sortDirection === "asc" ? "Γåæ" : "Γåô"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("estimatedValue")}>
                    <div className="flex items-center gap-1">
                      Est. Value
                      {sortField === "estimatedValue" && (
                        <span className="text-xs">{sortDirection === "asc" ? "Γåæ" : "Γåô"}</span>
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
                        <Button
                          variant="link"
                          className="font-medium text-left p-0 h-auto text-blue-600 hover:text-blue-800 hover:underline"
                          data-testid={`link-company-${lead.id}`}
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsFollowUpDialogOpen(true);
                          }}
                        >
                          {lead.companyName}
                        </Button>
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
                            <SelectItem value="NEW" className="bg-blue-50 hover:bg-blue-100">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                <span>New</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="CONTACTED" className="bg-pink-50 hover:bg-pink-100">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                <span>Contacted</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="QUALIFIED" className="bg-green-50 hover:bg-green-100">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Qualified</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="PROPOSAL" className="bg-gray-50 hover:bg-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                <span>Proposal</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="NEGOTIATION" className="bg-yellow-50 hover:bg-yellow-100">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span>Negotiation</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="CLOSED_WON" className="bg-purple-50 hover:bg-purple-100">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span>Closed Won</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="CLOSED_LOST" className="bg-red-50 hover:bg-red-100">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span>Closed Lost</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {(lead as any).estimatedValue && (
                          <div className="text-right font-medium" data-testid={`text-value-${lead.id}`}>
                            ₹{Number((lead as any).estimatedValue).toLocaleString()}
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
                                {nextFollowUp.followUpType || 'FOLLOW_UP'}
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
                                <SelectItem value="CALL">Call</SelectItem>
                                <SelectItem value="EMAIL">Email</SelectItem>
                                <SelectItem value="MEETING">Meeting</SelectItem>
                                <SelectItem value="DEMO">Demo</SelectItem>
                                <SelectItem value="PROPOSAL">Proposal</SelectItem>
                                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={leadFollowUpForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Follow-up Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="PENDING" className="bg-yellow-50 hover:bg-yellow-100">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                      <span>Pending</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="COMPLETED" className="bg-green-50 hover:bg-green-100">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span>Completed</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="CANCELLED" className="bg-red-50 hover:bg-red-100">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                      <span>Cancelled</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={leadFollowUpForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority / Urgency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="LOW">Low</SelectItem>
                                  <SelectItem value="MEDIUM">Medium</SelectItem>
                                  <SelectItem value="HIGH">High</SelectItem>
                                  <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={leadFollowUpForm.control}
                        name="assignedUserId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned To</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team member" />
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

                      <FormField
                        control={leadFollowUpForm.control}
                        name="outcome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Outcome of Last Follow-up (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="POSITIVE_RESPONSE">Positive Response</SelectItem>
                                <SelectItem value="NEEDS_MORE_INFO">Needs More Info</SelectItem>
                                <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                                <SelectItem value="CONVERTED">Converted</SelectItem>
                                <SelectItem value="NO_RESPONSE">No Response</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={leadFollowUpForm.control}
                        name="reminderEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value || false}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="h-4 w-4 rounded border border-primary text-primary shadow focus:ring-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Set Reminder / Notification</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Enable to get notified about this follow-up
                              </div>
                            </div>
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
                              status: "PENDING",
                              priority: "MEDIUM",
                              assignedUserId: "",
                              outcome: "",
                              reminderEnabled: false,
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
                                      {followUp.followUpType || 'FOLLOW_UP'}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      {new Date(followUp.followUpDate || followUp.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium">
                                    {followUp.remarks || 'No details provided'}
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
                                  <div className="mt-2 pt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                      <span className="font-medium">Updated by:</span> {(() => {
                                        const updatedUser = users.find(u => u.id === followUp.assignedUserId);
                                        return updatedUser ? `${updatedUser.firstName} ${updatedUser.lastName}` : 'Unknown User';
                                      })()}
                                    </p>
                                  </div>
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
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [quotationItems, setQuotationItems] = useState([
    { productId: "", quantity: 0, unit: "", rate: 0, amount: 0 }
  ]);
  const [selectedClient, setSelectedClient] = useState("");
  const [clientType, setClientType] = useState<"lead" | "client">("client");
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [customPaymentTerms, setCustomPaymentTerms] = useState("");
  const [description, setDescription] = useState("");
  const [salesPersonId, setSalesPersonId] = useState("");
  const [freightCharged, setFreightCharged] = useState<number>(0); // Keep for backward compatibility, always 0
  const [quotationData, setQuotationData] = useState({
    destination: "",
    loadingFrom: ""
  });
  
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/product-master"],
    retry: false,
  });

  const { data: quotations = [], refetch: refetchQuotations, error: quotationsError } = useQuery({
    queryKey: ["/api/quotations"],
    retry: false,
    onError: (error) => {
      console.error("🔴 QUOTATIONS FETCH ERROR:", error);
      alert("Failed to load quotations: " + error.message);
    },
    onSuccess: (data) => {
      console.log("✅ QUOTATIONS LOADED:", data?.length, "quotations");
    }
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
      setSalesPersonId("");
      setQuotationData({ destination: "", loadingFrom: "" });
      setEditingQuotationId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quotation",
        variant: "destructive",
      });
    },
  });

  const updateQuotationMutation = useMutation({
    mutationFn: async ({ id, ...quotationData }: any) => {
      return apiCall(`/api/quotations/${id}`, "PUT", quotationData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quotation updated successfully",
      });
      setIsQuotationDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      // Reset form
      setQuotationItems([{ productId: "", quantity: 0, unit: "", rate: 0, amount: 0 }]);
      setSelectedClient("");
      setValidUntil("");
      setPaymentTerms("");
      setDescription("");
      setQuotationData({ destination: "", loadingFrom: "" });
      setEditingQuotationId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quotation",
        variant: "destructive",
      });
    },
  });

  const updateQuotationItem = (index: number, field: string, value: any) => {
    const updatedItems = [...quotationItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-fill unit and rate when product is selected
    if (field === 'productId') {
      const selectedProduct = (products as any[]).find((p: any) => p.id === value);
      if (selectedProduct) {
        updatedItems[index].unit = selectedProduct.unit || "";
        updatedItems[index].rate = parseFloat(selectedProduct.rate) || 0;
        // Auto-calculate amount
        const quantity = updatedItems[index].quantity || 0;
        updatedItems[index].amount = quantity * (parseFloat(selectedProduct.rate) || 0);
      }
    }
    
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
    // Get product description for each item
    let productSubtotal = 0; // Items without FREIGHT
    let freightSubtotal = 0; // Items with FREIGHT
    let productTax = 0;      // Tax only on products

    quotationItems.forEach((item) => {
      const amount = parseFloat(String(item.amount || "0"));
      const productId = item.productId;
      
      // Find product name to check if it contains "FREIGHT"
      const productName = (products as any[])?.find((p: any) => p.id === productId)?.name || "";
      const isFreightProduct = productName.toLowerCase().includes("freight");

      if (isFreightProduct) {
        // Freight products: 0% GST
        freightSubtotal += amount;
      } else {
        // Regular products: 18% GST
        productSubtotal += amount;
        productTax += amount * 0.18;
      }
    });

    const freightAmount = 0; // Freight now handled via items, not separate field
    const total = productSubtotal + productTax + freightSubtotal + freightAmount;
    
    return { 
      subtotal: productSubtotal,        // Only products (without freight items)
      tax: productTax,                  // 18% tax only on products
      freight: freightSubtotal + freightAmount,  // All freight items combined
      total: total 
    };
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
    setSalesPersonId("");
    setQuotationItems([{ productId: "", quantity: 0, unit: "", rate: 0, amount: 0 }]);
    setEditingQuotationId(null); // Reset editing mode
    setIsQuotationDialogOpen(true);
  };

  const handleSaveQuotation = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a quotation",
        variant: "destructive",
      });
      return;
    }

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

    const freightAmount = 0; // Freight now handled via items, not separate field

    const quotationPayload = {
      clientId: selectedClient,
      clientType: clientType, // Add client type to identify if it's lead or client
      quotationDate: new Date(quotationDate).toISOString(),
      validUntil: validUntil ? new Date(validUntil).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: totals.subtotal,
      discountPercentage: 0,
      discountAmount: 0,
      taxAmount: totals.tax,
      salesPersonId: salesPersonId,
      freightCharged: 0, // Freight now handled via items
      grandTotal: totals.total,
      paymentTerms: paymentTerms === "Customer Option" ? customPaymentTerms : `${parseInt(paymentTerms) || 30}`,
      deliveryTerms: "Standard delivery terms",
      destination: quotationData.destination,
      loadingFrom: quotationData.loadingFrom,
      specialInstructions: description,
      preparedByUserId: user.id,
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

    if (editingQuotationId) {
      // Update existing quotation
      updateQuotationMutation.mutate({ id: editingQuotationId, ...quotationPayload });
    } else {
      // Create new quotation
      createQuotationMutation.mutate(quotationPayload);
    }
  };

  const handleViewDetails = (quotation: any) => {
    setSelectedQuotation(quotation);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (quotationId: string, status: string) => {
    updateQuotationStatusMutation.mutate({ id: quotationId, status });
  };

  // WhatsApp functionality for quotations
  const handleSendQuotationToWhatsApp = (quotation: any) => {
    try {
      // Get client details
      const client = (clients as any[])?.find((c: any) => c.id === quotation.clientId);
      
      if (!client?.mobileNumber) {
        toast({
          title: "Error",
          description: "Client mobile number not available. Please add it in client details.",
          variant: "destructive"
        });
        return;
      }

      // Validate and format phone number
      let phoneNumber = client.mobileNumber.replace(/\D/g, '');
      if (!phoneNumber.startsWith('91')) {
        phoneNumber = '91' + phoneNumber;
      }

      // Create message content
      const itemsText = quotation.items?.map((item: any) => 
        `• ${item.description || 'Product'}: ${item.quantity} ${item.unit} @ ₹${parseFloat(item.unitPrice || item.rate || 0).toFixed(2)}`
      ).join('\n') || '';

      const message = `Hi ${client.name}!

Your quotation is ready:

*QUOTATION ${quotation.quotationNumber}*
Date: ${new Date(quotation.quotationDate || quotation.createdAt).toLocaleDateString()}
Valid Until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'TBD'}

*ITEMS:*
${itemsText}

*TOTAL AMOUNT: Rs.${parseFloat(quotation.grandTotal || 0).toFixed(2)}*

Payment Terms: ${quotation.paymentTerms} days
Delivery Terms: ${quotation.deliveryTerms || 'Standard delivery'}

Thank you for your business!

*M/S SRI HM BITUMEN CO*
Phone: +91 8453059698
Email: info.srihmbitumen@gmail.com`;

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "WhatsApp Opened",
        description: `WhatsApp chat opened for ${client.name} with quotation details.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open WhatsApp. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Email functionality for quotations
  const handleSendQuotationToEmail = async (quotation: any) => {
    try {
      // Get client details and email
      const client = (clients as any[])?.find((c: any) => c.id === quotation.clientId);
      const clientEmail = client?.email;
      
      if (!clientEmail) {
        toast({
          title: "Error",
          description: "Client email not available. Please add it in client details.",
          variant: "destructive"
        });
        return;
      }

      try {
        // Download PDF first
        await handleDownloadPDF(quotation, 'bitumen');
        
        // Short delay to ensure PDF download starts
        setTimeout(() => {
          // Create Gmail compose URL with pre-filled data
          const subject = `Quotation ${quotation.quotationNumber} - M/S SRI HM BITUMEN CO`;
          const body = `Dear ${client.name},

Thank you for your inquiry! Please find the attached quotation for the following:

Quotation Number: ${quotation.quotationNumber}
Quotation Date: ${new Date(quotation.quotationDate || quotation.createdAt).toLocaleDateString()}
Valid Until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'TBD'}
Total Amount: Rs.${parseFloat(quotation.grandTotal || 0).toFixed(2)}

The detailed quotation document is attached to this email.

If you have any questions or need further clarification, please don't hesitate to contact us.

Best regards,
M/S SRI HM BITUMEN CO
Dag No: 1071, Patta No: 264, Mkirpara
Chakardaigaon, Mouza - Ramcharani
Guwahati, Assam - 781035

Phone: +91 8453059698
Email: info.srihmbitumen@gmail.com
GST: 18CGMPP6536N2ZG`;

          // Gmail compose URL
          const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          
          // Open Gmail compose in new tab
          window.open(gmailComposeUrl, '_blank');
          
          toast({
            title: "Gmail Opened",
            description: `Gmail compose opened for ${client.name}. Please attach the downloaded PDF file to the email.`,
          });
        }, 1000);
        
      } catch (pdfError) {
        // If PDF generation fails, still open Gmail
        const subject = `Quotation ${quotation.quotationNumber} - M/S SRI HM BITUMEN CO`;
        const body = `Dear ${client.name},

Thank you for your inquiry! Here are your quotation details:

Quotation Number: ${quotation.quotationNumber}
Quotation Date: ${new Date(quotation.quotationDate || quotation.createdAt).toLocaleDateString()}
Total Amount: Rs.${parseFloat(quotation.grandTotal || 0).toFixed(2)}

Best regards,
M/S SRI HM BITUMEN CO`;

        const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailComposeUrl, '_blank');
        
        toast({
          title: "Gmail Opened",
          description: `Gmail compose opened for ${client.name}. PDF generation failed - please create manually if needed.`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open Gmail. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditQuotation = (quotation: any) => {
    // Set up editing mode - populate form with existing quotation data
    setSelectedClient(quotation.clientId);
    setClientType(quotation.clientType);
    setPaymentTerms(quotation.paymentTerms.toString());
    setDescription(quotation.specialInstructions || "");
    setSalesPersonId(quotation.salesPersonId || "");
    setQuotationDate(quotation.quotationDate.split('T')[0]);
    setValidUntil(quotation.validUntil ? quotation.validUntil.split('T')[0] : "");
    setFreightCharged(parseFloat(quotation.freightCharged || 0));
    
    // Load existing quotation items
    const existingItems = quotation.items?.map((item: any) => ({
      productId: item.productId,
      quantity: parseFloat(item.quantity || 0),
      unit: item.unit || "Nos",
      rate: parseFloat(item.unitPrice || item.rate || 0),
      amount: parseFloat(item.totalPrice || item.amount || 0)
    })) || [];
    
    setQuotationItems(existingItems);
    setEditingQuotationId(quotation.id);
    setIsQuotationDialogOpen(true);
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (window.confirm("Are you sure you want to delete this quotation? This action cannot be undone.")) {
      try {
        await apiCall(`/api/quotations/${quotationId}`, 'DELETE');
        
        // Refresh quotations list
        queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
        
        toast({
          title: "Success",
          description: "Quotation deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete quotation",
          variant: "destructive"
        });
      }
    }
  };

  const handleGenerateSalesOrder = async (quotationId: string) => {
    try {
      const response = await apiCall(`/api/quotations/${quotationId}/generate-sales-order`, 'POST');
      
      toast({
        title: "Success",
        description: "Sales Order generated successfully",
      });
      
      // Refresh both quotations and sales orders
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales-orders'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sales order",
        variant: "destructive"
      });
    }
  };

  // Helper function to get client/lead name for quotation display
  const getQuotationClientName = (quotation: any) => {
    // Use the clientName field from API if available, otherwise fallback to lookup
    if (quotation.clientName && quotation.clientName !== 'Unknown') {
      return quotation.clientName;
    }
    
    // Fallback to lookup for older quotations
    if (quotation.clientType === "lead") {
      const lead = (leads as any[])?.find((l: any) => l.id === quotation.clientId);
      return lead ? `${lead.companyName} - ${lead.contactPersonName}` : 'Unknown Lead';
    } else {
      const client = (clients as any[])?.find((c: any) => c.id === quotation.clientId);
      return client?.name || 'Unknown Client';
    }
  };

  const generatePDFFormat = async (quotation: any, format: 'corporate' | 'professional' | 'advanced') => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Load company logo as base64
    let logoBase64 = '';
    try {
      const logoResponse = await fetch('/logo.jpg');
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
      }
    } catch (err) {
      console.error('Failed to load logo:', err);
    }
    
    // Page setup for professional printing
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (margin * 2);
    
    const clientName = getQuotationClientName(quotation);
    const preparedBy = (users as any[])?.find((u: any) => u.id === quotation.preparedByUserId);
    const preparedByName = preparedBy ? `${preparedBy.firstName} ${preparedBy.lastName}` : 'System Administrator';
    
    // Professional page border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (margin * 2) + 10);
    
    // Calculate totals from items
    let subtotal = 0;
    const validItems = quotation.items || [];
    validItems.forEach((item: any) => {
      subtotal += parseFloat(item.amount || item.totalPrice || 0);
    });
    
    const taxRate = 18;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;
    
    if (format === 'corporate') {
      // Corporate Format - Elegant and Minimal
      doc.setFillColor(0, 51, 102); // Dark blue header
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('QUOTATION', 105, 25, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Company info box with logo
      doc.setFillColor(245, 245, 245);
      doc.rect(15, 50, 180, 35, 'F');
      
      // Add logo if available
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 20, 55, 20, 20);
        } catch (error) {
          console.error('Failed to add logo to PDF:', error);
        }
      }
      
      // Company details with matching colors
      doc.setTextColor(230, 126, 34); // Orange color matching logo
      doc.setFont('helvetica', 'bold');
      doc.text('M/S SRI HM BITUMEN CO', logoBase64 ? 45 : 20, 62);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Dag No: 1071, Patta No: 264, Guwahati, Assam 781035', logoBase64 ? 45 : 20, 68);
      doc.text('GSTIN/UIN: 18CGMPP6536N2ZG', logoBase64 ? 45 : 20, 74);
      doc.text('Mobile: +91 8453059698 | Email: info.srihmbitumen@gmail.com', logoBase64 ? 45 : 20, 80);
      
    } else if (format === 'professional') {
      // Professional Format - Clean and Structured with company branding
      doc.setFillColor(230, 126, 34); // Orange header matching logo
      doc.rect(0, 0, 210, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('QUOTATION - M/S SRI HM BITUMEN CO', 105, 22, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      
      // Two-column layout for logo and company details
      doc.setFillColor(250, 250, 250);
      doc.rect(15, 45, 85, 40, 'F');
      doc.rect(110, 45, 85, 40, 'F');
      
      // Add logo to left column
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 20, 50, 25, 25);
        } catch (error) {
          console.error('Failed to add logo to PDF:', error);
        }
      }
      
      // Company details in right column
      doc.setTextColor(230, 126, 34);
      doc.setFont('helvetica', 'bold');
      doc.text('M/S SRI HM BITUMEN CO', 115, 55);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Dag No: 1071, Patta No: 264', 115, 62);
      doc.text('Guwahati, Assam 781035', 115, 67);
      doc.text('GSTIN: 18CGMPP6536N2ZG', 115, 72);
      doc.text('Mobile: +91 8453059698', 115, 77);
      
    } else {
      // Advanced Format - Feature Rich with Graphics and Company Branding
      doc.setFillColor(230, 126, 34); // Orange header matching logo
      doc.rect(0, 0, 210, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('QUOTATION', 105, 25, { align: 'center' });
      doc.setFontSize(12);
      doc.text('M/S SRI HM BITUMEN CO', 105, 35, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Quality & Service is our Specialty', 105, 42, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      
      // Add logo in top left corner
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 15, 12, 25, 25);
        } catch (error) {
          console.error('Failed to add logo to PDF:', error);
        }
      }
      
      // Decorative border with company color
      doc.setDrawColor(230, 126, 34);
      doc.setLineWidth(2);
      doc.rect(10, 10, 190, 277, 'S');
    }
    
    // Common content positioning based on format
    let startY = format === 'advanced' ? 60 : format === 'professional' ? 85 : 85;
    
    // Quotation details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation Details:', 20, startY + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quotation No: ${quotation.quotationNumber}`, 20, startY + 40);
    doc.text(`Date: ${new Date(quotation.quotationDate).toLocaleDateString('en-IN')}`, 20, startY + 47);
    doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString('en-IN')}`, 20, startY + 54);
    
    // Client and prepared by
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, startY + 70);
    doc.setFont('helvetica', 'normal');
    doc.text(clientName, 20, startY + 78);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Prepared By:', 110, startY + 70);
    doc.setFont('helvetica', 'normal');
    doc.text(preparedByName, 110, startY + 78);
    
    // Items table
    const tableStartY = startY + 95;
    
    // Table header with background
    doc.setFillColor(format === 'corporate' ? 230 : format === 'professional' ? 240 : 220, 
                     format === 'corporate' ? 230 : format === 'professional' ? 240 : 255, 
                     format === 'corporate' ? 230 : format === 'professional' ? 240 : 220);
    doc.rect(15, tableStartY - 5, 180, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, tableStartY);
    doc.text('Qty', 95, tableStartY);
    doc.text('Unit', 115, tableStartY);
    doc.text('Rate (Rs)', 135, tableStartY);
    doc.text('Amount (Rs)', 165, tableStartY);
    
    // Table border
    doc.line(15, tableStartY + 2, 195, tableStartY + 2);
    
    // Items
    doc.setFont('helvetica', 'normal');
    let currentY = tableStartY + 12;
    
    if (validItems.length > 0) {
      validItems.forEach((item: any, index: number) => {
        const description = item.description || (products as any[])?.find((p: any) => p.id === item.productId)?.name || 'Product Item';
        const quantity = item.quantity || 1;
        const unit = item.unit || 'Nos';
        const rate = parseFloat(item.unitPrice || item.rate || 0);
        const amount = parseFloat(item.totalPrice || item.amount || 0);
        
        // Alternating row colors for advanced format
        if (format === 'advanced' && index % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(15, currentY - 3, 180, 8, 'F');
        }
        
        const descLines = doc.splitTextToSize(description, 70);
        doc.text(descLines, 20, currentY);
        doc.text(quantity.toString(), 95, currentY);
        doc.text(unit, 115, currentY);
        doc.text(rate.toFixed(2), 135, currentY);
        doc.text(amount.toFixed(2), 165, currentY);
        
        currentY += Math.max(descLines.length * 5, 10);
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No items found in this quotation', 20, currentY);
      currentY += 15;
    }
    
    // Totals section with styling
    currentY += 10;
    doc.line(135, currentY, 195, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 135, currentY);
    doc.text(`Rs.${subtotal.toFixed(2)}`, 170, currentY);
    currentY += 8;
    
    doc.text(`Tax (${taxRate}% GST):`, 135, currentY);
    doc.text(`Rs.${taxAmount.toFixed(2)}`, 170, currentY);
    currentY += 8;
    
    // Grand total with highlight
    if (format === 'advanced') {
      doc.setFillColor(76, 175, 80);
      doc.rect(133, currentY - 3, 62, 10, 'F');
      doc.setTextColor(255, 255, 255);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 135, currentY);
    doc.text(`Rs.${grandTotal.toFixed(2)}`, 170, currentY);
    
    if (format === 'advanced') {
      doc.setTextColor(0, 0, 0);
    }
    
    // Terms and conditions
    currentY += 25;
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 8;
    
    const terms = [
      `Payment Terms: ${quotation.paymentTerms || 30} days`,
      `Delivery Terms: ${quotation.deliveryTerms || 'Standard delivery terms'}`,
      'Prices are subject to change without prior notice',
      'This quotation is valid for the period mentioned above'
    ];
    
    terms.forEach(term => {
      doc.text(`ΓÇó ${term}`, 22, currentY);
      currentY += 6;
    });
    
    if (quotation.specialInstructions) {
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Special Instructions:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      currentY += 6;
      doc.text(quotation.specialInstructions, 20, currentY);
    }
    
    // Footer (using existing pageHeight variable)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business! We look forward to serving you.', 105, pageHeight - 15, { align: 'center' });
    
    return doc;
  };

  const handleDownloadPDF = async (quotation: any, format: 'bitumen' | 'professional' | 'advanced' = 'bitumen') => {
    try {
      let doc;
      
      if (format === 'bitumen') {
        // Use the new bitumen template format
        const clientName = getQuotationClientName(quotation);
        const preparedBy = (users as any[])?.find((u: any) => u.id === quotation.preparedByUserId);
        const preparedByName = preparedBy ? `${preparedBy.firstName} ${preparedBy.lastName}` : 'System Administrator';
        
        // Get client details
        let clientDetails = { name: clientName, gstNumber: '', address: '', state: '', pinCode: '', mobileNumber: '', email: '' };
        if (quotation.clientType === "client") {
          const client = (clients as any[])?.find((c: any) => c.id === quotation.clientId);
          if (client) {
            clientDetails = {
              name: client.name,
              gstNumber: client.gstNumber || '',
              address: `${client.addressLine1 || ''} ${client.billingAddressLine || ''}`,
              state: client.state || client.billingState || '',
              pinCode: client.pinCode || client.billingPincode || '',
              mobileNumber: client.mobileNumber || '',
              email: client.email || ''
            };
          }
        } else {
          const lead = (leads as any[])?.find((l: any) => l.id === quotation.clientId);
          if (lead) {
            clientDetails = {
              name: `${lead.companyName} - ${lead.contactPersonName}`,
              gstNumber: '',
              address: '',
              state: '',
              pinCode: '',
              mobileNumber: lead.mobileNumber || '',
              email: lead.email || ''
            };
          }
        }

        // Transform items for the new template
        const items = (quotation.items || []).map((item: any) => {
          const description = item.description || (products as any[])?.find((p: any) => p.id === item.productId)?.name || 'Product Item';
          const amount = parseFloat(item.totalPrice || item.amount || 0);
          const isFreightItem = description.toLowerCase().includes('freight');
          
          // Apply GST based on whether it's a freight item
          const gstRate = isFreightItem ? 0 : 18;
          const gstAmount = isFreightItem ? 0 : (amount * 0.18);
          const totalAmount = amount + gstAmount;
          
          return {
            id: item.productId || '',
            description: description,
            quantity: parseFloat(item.quantity || 1),
            unit: item.unit || 'Nos',
            rate: parseFloat(item.unitPrice || item.rate || 0),
            amount: amount,
            gstRate: gstRate,
            gstAmount: gstAmount,
            totalAmount: totalAmount,
            isFreight: isFreightItem
          };
        });

        // Add freight from the freight charged field if present
        const freightAmount = parseFloat(quotation.freightCharged || 0);
        if (freightAmount > 0) {
          items.push({
            id: 'freight-item',
            description: 'FREIGHT CHARGED',
            quantity: 1,
            unit: 'Nos',
            rate: freightAmount,
            amount: freightAmount,
            gstRate: 0,
            gstAmount: 0,
            totalAmount: freightAmount,
            isFreight: true
          });
        }

        // Calculate totals: only apply GST to non-freight items
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.isFreight ? 0 : item.amount), 0);
        const taxAmount = items.reduce((sum: number, item: any) => sum + item.gstAmount, 0);
        const total = items.reduce((sum: number, item: any) => sum + item.totalAmount, 0);

        const quotationData = {
          quotationNumber: quotation.quotationNumber,
          quotationDate: new Date(quotation.quotationDate),
          validUntil: new Date(quotation.validUntil),
          deliveryTerms: quotation.deliveryTerms || 'With In 10 to 12 Days',
          paymentTerms: quotation.paymentTerms || '30 Days Credit',
          destination: quotation.destination || '',
          loadingFrom: quotation.loadingFrom || 'Kandla',
          client: clientDetails,
          items: items,
          salesPersonName: (() => {
            if (quotation.salesPersonId) {
              const salesPerson = (users as any[])?.find((u: any) => u.id === quotation.salesPersonId);
              if (salesPerson) {
                return `${salesPerson.firstName} ${salesPerson.lastName}`;
              }
            }
            return preparedByName;
          })(),
          description: quotation.description || quotation.specialInstructions || '',
          note: quotation.note || '',
          subtotal: subtotal,
          freight: freightAmount,
          gstAmount: taxAmount,
          total: total,
          companyDetails: {
            name: 'M/S SRI HM BITUMEN CO',
            address: 'Dag No : 1071, Patta No : 264, Mkirpara, Chakardaigaon\nMouza - Ramcharani, Guwahati, Assam - 781035',
            gstNumber: '18CGMPP6536N2ZG',
            mobile: '+91 8453059698',
            email: 'info.srihmbitumen@gmail.com',
            bankDetails: {
              bankName: 'State Bank of India',
              accountNumber: '40464693538',
              branch: 'Guwahati Branch',
              ifscCode: 'SBIN0040464'
            }
          }
        };

        doc = generateBitumenQuotationPDF({
          ...quotationData,
          id: quotation.id || '',
          gstAmount: taxAmount,
          validityPeriod: 30,
          client: {
            ...quotationData.client,
            id: quotation.clientId || ''
          }
        });
      } else {
        // Use legacy format for other options
        doc = await generatePDFFormat(quotation, format);
      }
      
      if (doc && typeof doc === 'object' && 'save' in doc) {
        (doc as any).save(`${quotation.quotationNumber}_${format}.pdf`);
      }
      
      toast({
        title: "Success",
        description: "Quotation downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
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
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Quotation #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Loading From</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(quotations as any[]).map((quotation: any) => (
                    <TableRow key={quotation.id}>
                      <TableCell>
                        <Badge variant={quotation.status === 'DRAFT' ? 'secondary' : quotation.status === 'SENT' ? 'outline' : quotation.status === 'ACCEPTED' ? 'default' : 'destructive'}>
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                      <TableCell>{getQuotationClientName(quotation)}</TableCell>
                      <TableCell>{new Date(quotation.quotationDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>{quotation.destination || '-'}</TableCell>
                      <TableCell>{quotation.loadingFrom || '-'}</TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{parseFloat(quotation.totalAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{quotation.paymentTerms} days</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
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
                            variant="default"
                            onClick={() => handleGenerateSalesOrder(quotation.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`button-generate-sales-order-${quotation.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Sales Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPDF(quotation, 'bitumen')}
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
                              <DropdownMenuItem onClick={() => handleEditQuotation(quotation)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Quotation
                              </DropdownMenuItem>
                              {quotation.status === 'ACCEPTED' && (
                                <DropdownMenuItem onClick={() => handleGenerateSalesOrder(quotation.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Generate Sales Order
                                </DropdownMenuItem>
                              )}
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteQuotation(quotation.id)} 
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Quotation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuotationId ? 'Edit Quotation' : 'Create New Quotation'}</DialogTitle>
            <DialogDescription>
              {editingQuotationId ? 'Update quotation details and pricing' : 'Create a professional quotation with detailed pricing and terms'}
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
                    disabled={editingQuotationId !== null}
                    className="text-blue-600"
                  />
                  <span className={`text-sm ${editingQuotationId ? 'text-gray-400' : ''}`}>Existing Client</span>
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
                    disabled={editingQuotationId !== null}
                    className="text-blue-600"
                  />
                  <span className={`text-sm ${editingQuotationId ? 'text-gray-400' : ''}`}>New Client (from Leads)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  {clientType === "client" ? "Select Client" : "Select Lead"}
                </label>
                <Select value={selectedClient} onValueChange={setSelectedClient} disabled={editingQuotationId !== null}>
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
                      Array.isArray(leads) && leads.length > 0 ? (
                        (leads as any[]).map((lead: any) => (
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
                    <SelectItem value="Customer Option">Customer Option</SelectItem>
                  </SelectContent>
                </Select>
                {paymentTerms === "Customer Option" && (
                  <div className="mt-2">
                    <Input 
                      type="text" 
                      value={customPaymentTerms}
                      onChange={(e) => setCustomPaymentTerms(e.target.value)}
                      placeholder="Enter custom payment terms"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Destination</label>
                <Input 
                  type="text" 
                  value={quotationData.destination || ''}
                  onChange={(e) => setQuotationData({...quotationData, destination: e.target.value})}
                  placeholder="Enter delivery destination"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Loading From</label>
                <Input 
                  type="text" 
                  value={quotationData.loadingFrom || ''}
                  onChange={(e) => setQuotationData({...quotationData, loadingFrom: e.target.value})}
                  placeholder="Enter loading point"
                />
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Sales Person</label>
              <Select value={salesPersonId} onValueChange={setSalesPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sales person" />
                </SelectTrigger>
                <SelectContent>
                  {(users as any[])?.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      value={parseFloat(String(item.amount || "0")).toFixed(2)} 
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
                        ├ù
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
                <div className="text-sm text-blue-600 font-medium">Freight Charged (Non-GST): ₹{totals.freight.toFixed(2)}</div>
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
              disabled={createQuotationMutation.isPending || updateQuotationMutation.isPending}
            >
              {editingQuotationId 
                ? (updateQuotationMutation.isPending ? "Updating..." : "Update Quotation")
                : (createQuotationMutation.isPending ? "Creating..." : "Create Quotation")
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quotation Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead className="text-xs font-medium w-[40%]">Product</TableHead>
                        <TableHead className="text-xs font-medium text-center w-[15%]">Qty</TableHead>
                        <TableHead className="text-xs font-medium text-center w-[15%]">Unit</TableHead>
                        <TableHead className="text-xs font-medium text-right w-[15%]">Rate</TableHead>
                        <TableHead className="text-xs font-medium text-right w-[15%]">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuotation.items && selectedQuotation.items.length > 0 ? (
                        selectedQuotation.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="text-sm truncate">{item.description || (products as any[]).find((p: any) => p.id === item.productId)?.name || 'Unknown Product'}</TableCell>
                            <TableCell className="text-sm text-center">{item.quantity}</TableCell>
                            <TableCell className="text-sm text-center">{item.unit}</TableCell>
                            <TableCell className="text-sm text-right">₹{parseFloat(item.rate || item.unitPrice || 0).toFixed(2)}</TableCell>
                            <TableCell className="text-sm text-right">₹{parseFloat(item.amount || item.totalPrice || 0).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                            No items found in this quotation
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">₹{parseFloat(selectedQuotation.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tax (18% GST):</span>
                  <span className="font-medium">₹{parseFloat(selectedQuotation.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                  <span>Grand Total:</span>
                  <span className="text-green-600">₹{parseFloat(selectedQuotation.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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

          <DialogFooter className="flex flex-wrap gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedQuotation && (
              <>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(selectedQuotation, 'bitumen')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendQuotationToWhatsApp(selectedQuotation)}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendQuotationToEmail(selectedQuotation)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                
                {selectedQuotation.status === 'DRAFT' && (
                  <Button size="sm" onClick={() => {
                    handleUpdateStatus(selectedQuotation.id, 'SENT');
                    setIsDetailsDialogOpen(false);
                  }}>
                    <Send className="h-4 w-4 mr-1" />
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
  const { data: salesOrders, isLoading } = useQuery({
    queryKey: ['/api/sales-orders'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: quotations } = useQuery({
    queryKey: ['/api/quotations'],
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLedgerDialogOpen, setIsLedgerDialogOpen] = useState(false);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<any>(null);
  const [salesOrderToDelete, setSalesOrderToDelete] = useState<any>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<string>('');

  // Delete mutation
  const deleteSalesOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sales-orders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete sales order');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-orders'] });
      toast({
        title: "Success",
        description: "Sales order deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSalesOrderToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sales order",
        variant: "destructive",
      });
    },
  });

  // Delete handler
  const handleDeleteSalesOrder = (salesOrder: any) => {
    // Check permissions
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SALES_MANAGER')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete this order.",
        variant: "destructive"
      });
      return;
    }
    
    setSalesOrderToDelete(salesOrder);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSalesOrder = () => {
    if (salesOrderToDelete) {
      deleteSalesOrderMutation.mutate(salesOrderToDelete.id);
    }
  };

  const getSalesOrderClientName = (salesOrder: any) => {
    const client = (clients as any[])?.find((c: any) => c.id === salesOrder.clientId);
    return client ? client.name : 'Unknown Client';
  };

  // WhatsApp functionality - Send to chat without downloading
  const handleSendToWhatsApp = async (salesOrder: any) => {
    try {
      setWhatsappStatus('');
      
      // Get client details and mobile number
      const client = (clients as any[])?.find((c: any) => c.id === salesOrder.clientId);
      const mobileNumber = client?.mobileNumber;
      
      if (!mobileNumber) {
        toast({
          title: "Error",
          description: "Client mobile number not available. Please add it.",
          variant: "destructive"
        });
        return;
      }
      
      // Format mobile number (add +91 if not present)
      let formattedNumber = mobileNumber.replace(/\D/g, ''); // Remove non-digits
      if (!formattedNumber.startsWith('91')) {
        formattedNumber = '91' + formattedNumber;
      }
      
      // Create WhatsApp message (NO PDF download)
      const clientName = getSalesOrderClientName(salesOrder);
      const message = `Hello ${clientName}! 

Sales Order Details:
Order Number: ${salesOrder.orderNumber}
Total Amount: Rs.${parseFloat(salesOrder.totalAmount || 0).toFixed(2)}
Status: ${salesOrder.status}

Thank you for your business!

Regards,
M/S SRI HM BITUMEN CO
Phone: +91 8453059698
Email: info.srihmbitumen@gmail.com`;
      
      // Open WhatsApp
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Show success message
      setWhatsappStatus(`WhatsApp chat opened for ${clientName} with order details.`);
      toast({
        title: "Success",
        description: `WhatsApp chat opened for ${clientName} with order details.`
      });
      
      // Clear status after 5 seconds
      setTimeout(() => setWhatsappStatus(''), 5000);
      
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to open WhatsApp. Please check the mobile number.",
        variant: "destructive"
      });
    }
  };

  // View functionality
  const handleViewSalesOrder = (salesOrder: any) => {
    setSelectedSalesOrder(salesOrder);
    setIsViewDialogOpen(true);
  };

  // Email functionality - Generate PDF and open Gmail compose
  const handleSendToEmail = async (salesOrder: any) => {
    try {
      // Get client details and email
      const client = (clients as any[])?.find((c: any) => c.id === salesOrder.clientId);
      const clientEmail = client?.email;
      
      if (!clientEmail) {
        toast({
          title: "Error",
          description: "Client email not available. Please add it in client details.",
          variant: "destructive"
        });
        return;
      }
      
      // Generate and download PDF first
      const quotation = (quotations as any[])?.find((q: any) => q.id === salesOrder.quotationId);
      
      try {
        await handleDownloadSalesOrderPDF(salesOrder);
        
        // Short delay to ensure PDF download starts
        setTimeout(() => {
          // Create Gmail compose URL with pre-filled data
          const subject = `Sales Order ${salesOrder.orderNumber} - M/S SRI HM BITUMEN CO`;
          const body = `Dear ${client.name},

Thank you for your business! Please find the attached sales order PDF for the following:

Order Number: ${salesOrder.orderNumber}
Order Date: ${new Date(salesOrder.orderDate || salesOrder.createdAt).toLocaleDateString()}
Total Amount: Rs.${parseFloat(salesOrder.totalAmount || 0).toFixed(2)}
Status: ${salesOrder.status}

The detailed sales order document is attached to this email.

If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
M/S SRI HM BITUMEN CO
Dag No: 1071, Patta No: 264, Mkirpara
Chakardaigaon, Mouza - Ramcharani
Guwahati, Assam - 781035

Phone: +91 8453059698
Email: info.srihmbitumen@gmail.com
GST: 18CGMPP6536N2ZG`;

          // Gmail compose URL
          const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          
          // Open Gmail compose in new tab
          window.open(gmailComposeUrl, '_blank');
          
          toast({
            title: "Gmail Opened",
            description: `Gmail compose opened for ${client.name}. Please attach the downloaded PDF file to the email.`,
          });
        }, 1000);
        
      } catch (pdfError) {
        // If PDF generation fails, still open Gmail
        const subject = `Sales Order ${salesOrder.orderNumber} - M/S SRI HM BITUMEN CO`;
        const body = `Dear ${client.name},

Thank you for your business! Here are your sales order details:

Order Number: ${salesOrder.orderNumber}
Order Date: ${new Date(salesOrder.orderDate || salesOrder.createdAt).toLocaleDateString()}
Total Amount: Rs.${parseFloat(salesOrder.totalAmount || 0).toFixed(2)}
Status: ${salesOrder.status}

Best regards,
M/S SRI HM BITUMEN CO`;

        const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailComposeUrl, '_blank');
        
        toast({
          title: "Gmail Opened",
          description: `Gmail compose opened for ${client.name}. PDF generation failed - please create manually if needed.`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open Gmail. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Edit functionality with permission check
  const handleEditSalesOrder = (salesOrder: any) => {
    // Check permissions
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SALES_MANAGER')) {
      toast({
        title: "Access Denied",
        description: "You don't have access to edit this order.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedSalesOrder(salesOrder);
    setIsEditDialogOpen(true);
  };

  const handleDownloadSalesOrderPDF = async (salesOrder: any) => {
    try {
      // Get related quotation for items
      const quotation = (quotations as any[])?.find((q: any) => q.id === salesOrder.quotationId);
      
      // Get client details
      const client = (clients as any[])?.find((c: any) => c.id === salesOrder.clientId);
      
      // Build invoice data for printSalesOrder (same format as Invoice Management)
      const invoiceData = {
        invoiceNumber: salesOrder.orderNumber,
        orderNumber: salesOrder.orderNumber,
        invoiceDate: salesOrder.orderDate || salesOrder.createdAt,
        orderDate: salesOrder.orderDate || salesOrder.createdAt,
        dueDate: salesOrder.expectedDeliveryDate,
        deliveryTerms: salesOrder.deliveryTerms || 'Within 15-20 Days',
        paymentTerms: quotation?.paymentTerms || salesOrder.paymentTerms || 'ADVANCE',
        destination: salesOrder.destination || '',
        dispatchFrom: salesOrder.loadingFrom || 'KANDLA',
        loadingFrom: salesOrder.loadingFrom || 'KANDLA',
        placeOfSupply: client?.billingState || client?.state || 'ASSAM',
        
        // Customer (Bill To) details
        customerName: client?.name || getSalesOrderClientName(salesOrder),
        customerGstin: client?.gstNumber || '',
        customerGSTIN: client?.gstNumber || '',
        customerAddress: `${client?.billingAddressLine || client?.addressLine1 || ''}, ${client?.billingCity || ''}, ${client?.billingState || client?.state || ''}, ${client?.billingCountry || 'India'}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ', '),
        customerState: client?.billingState || client?.state || '',
        customerPincode: client?.billingPincode || client?.pinCode || '',
        customerMobile: client?.mobileNumber || '',
        customerPhone: client?.mobileNumber || '',
        customerEmail: client?.email || '',
        partyMobileNumber: client?.mobileNumber || '',
        
        // Ship To details (same as Bill To)
        shipToName: client?.name || getSalesOrderClientName(salesOrder),
        shipToGstin: client?.gstNumber || '',
        shipToAddress: `${client?.billingAddressLine || client?.addressLine1 || ''}, ${client?.billingCity || ''}, ${client?.billingState || client?.state || ''}, ${client?.billingCountry || 'India'}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ', '),
        shipToState: client?.billingState || client?.state || '',
        shipToPincode: client?.billingPincode || client?.pinCode || '',
        shipToMobile: client?.mobileNumber || '',
        shipToEmail: client?.email || '',
        
        // Items from quotation
        items: (quotation?.items || []).map((item: any) => {
          const qty = parseFloat(item.quantity || 1);
          const rate = parseFloat(item.unitPrice || item.rate || 0);
          const amount = qty * rate;
          // Check if this is a freight item
          const productDescription = item.description || item.productName || 'Product Item';
          const isFreightItem = productDescription.toLowerCase().includes('freight');
          const gstRate = isFreightItem ? 0 : 18;
          const gstAmount = amount * (gstRate / 100);
          return {
            productName: productDescription,
            description: productDescription,
            quantity: qty,
            unitOfMeasurement: item.unit || 'MT',
            unit: item.unit || 'MT',
            ratePerUnit: rate,
            rate: rate,
            grossAmount: amount,
            taxableAmount: amount,
            cgstRate: isFreightItem ? 0 : 9,
            cgstAmount: gstAmount / 2,
            sgstRate: isFreightItem ? 0 : 9,
            sgstAmount: gstAmount / 2,
            totalAmount: amount + gstAmount,
            isFreight: isFreightItem,
            gstRate: gstRate
          };
        }),
        
        // Totals - only apply GST to non-freight items
        subtotalAmount: (quotation?.items || []).reduce((sum: number, item: any) => {
          const productDescription = item.description || item.productName || 'Product Item';
          const isFreightItem = productDescription.toLowerCase().includes('freight');
          // Only include non-freight items in subtotal
          if (isFreightItem) return sum;
          const qty = parseFloat(item.quantity || 1);
          const rate = parseFloat(item.unitPrice || item.rate || 0);
          return sum + (qty * rate);
        }, 0),
        cgstAmount: (quotation?.items || []).reduce((sum: number, item: any) => {
          const productDescription = item.description || item.productName || 'Product Item';
          const isFreightItem = productDescription.toLowerCase().includes('freight');
          // Only apply GST to non-freight items
          if (isFreightItem) return sum;
          const qty = parseFloat(item.quantity || 1);
          const rate = parseFloat(item.unitPrice || item.rate || 0);
          return sum + ((qty * rate) * 0.09);
        }, 0),
        sgstAmount: (quotation?.items || []).reduce((sum: number, item: any) => {
          const productDescription = item.description || item.productName || 'Product Item';
          const isFreightItem = productDescription.toLowerCase().includes('freight');
          // Only apply GST to non-freight items
          if (isFreightItem) return sum;
          const qty = parseFloat(item.quantity || 1);
          const rate = parseFloat(item.unitPrice || item.rate || 0);
          return sum + ((qty * rate) * 0.09);
        }, 0),
        totalInvoiceAmount: parseFloat(salesOrder.totalAmount || 0),
        freightCharges: parseFloat(quotation?.freightCharged || 0),
        transportCharges: parseFloat(quotation?.freightCharged || 0),
        
        salesPersonName: (() => {
          console.log('=== DEBUG SALES PERSON ===');
          console.log('Quotation:', quotation);
          console.log('Quotation salesPersonId:', quotation?.salesPersonId);
          console.log('Users available:', users);
          
          if (quotation?.salesPersonId && users && users.length > 0) {
            const salesPerson = users.find((u: any) => u.id === quotation.salesPersonId);
            console.log('Found sales person:', salesPerson);
            if (salesPerson) {
              const fullName = `${salesPerson.firstName || ''} ${salesPerson.lastName || ''}`.trim();
              console.log('Returning name:', fullName);
              return fullName;
            }
          }
          console.log('No sales person found, returning empty');
          return '';
        })(),
        description: quotation?.specialInstructions || salesOrder.notes || quotation?.description || ''
      };

      // Use the same print format as Invoice Management
      await printSalesOrder(invoiceData, (msg) => {
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate Sales Order PDF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Sales Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading sales orders...</div>
        </CardContent>
      </Card>
    );
  }

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
        {!salesOrders || (salesOrders as any[]).length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Sales Orders Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate sales orders from accepted quotations to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Loading From</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Credit Check</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(salesOrders as any[]).map((salesOrder: any) => (
                  <TableRow key={salesOrder.id}>
                    <TableCell>
                      <Badge variant={
                        salesOrder.status === 'DRAFT' ? 'secondary' : 
                        salesOrder.status === 'APPROVED' ? 'default' : 
                        salesOrder.status === 'COMPLETED' ? 'default' : 'outline'
                      }>
                        {salesOrder.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{salesOrder.orderNumber}</TableCell>
                    <TableCell>{getSalesOrderClientName(salesOrder)}</TableCell>
                    <TableCell>{new Date(salesOrder.orderDate || salesOrder.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {salesOrder.expectedDeliveryDate ? new Date(salesOrder.expectedDeliveryDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>{salesOrder.destination || '-'}</TableCell>
                    <TableCell>{salesOrder.loadingFrom || '-'}</TableCell>
                    <TableCell className="text-right font-bold">
                      ₹{parseFloat(salesOrder.totalAmount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        salesOrder.creditCheckStatus === 'APPROVED' ? 'default' : 
                        salesOrder.creditCheckStatus === 'PENDING' ? 'outline' : 'destructive'
                      }>
                        {salesOrder.creditCheckStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewSalesOrder(salesOrder)}
                          data-testid={`button-view-sales-order-${salesOrder.id}`}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendToEmail(salesOrder)}
                          data-testid={`button-email-sales-order-${salesOrder.id}`}
                          title="Send to Email"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSalesOrder(salesOrder);
                            setIsLedgerDialogOpen(true);
                          }}
                          data-testid={`button-ledger-sales-order-${salesOrder.id}`}
                          title="Company Ledger"
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSalesOrder(salesOrder)}
                          data-testid={`button-edit-sales-order-${salesOrder.id}`}
                          title="Edit Order"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendToWhatsApp(salesOrder)}
                          data-testid={`button-whatsapp-sales-order-${salesOrder.id}`}
                          title="Send to WhatsApp"
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSalesOrder(salesOrder)}
                          data-testid={`button-delete-sales-order-${salesOrder.id}`}
                          title="Delete Order"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* WhatsApp Status Message */}
        {whatsappStatus && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {whatsappStatus}
          </div>
        )}
      </CardContent>

      {/* View Sales Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sales Order Details</DialogTitle>
            <DialogDescription>
              Complete sales order information and status tracking
            </DialogDescription>
          </DialogHeader>
          
          {selectedSalesOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                  <p className="font-medium">{selectedSalesOrder.orderNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      selectedSalesOrder.status === 'DRAFT' ? 'secondary' : 
                      selectedSalesOrder.status === 'APPROVED' ? 'default' : 
                      selectedSalesOrder.status === 'COMPLETED' ? 'default' : 'outline'
                    }>
                      {selectedSalesOrder.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Credit Check</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      selectedSalesOrder.creditCheckStatus === 'APPROVED' ? 'default' : 
                      selectedSalesOrder.creditCheckStatus === 'PENDING' ? 'outline' : 'destructive'
                    }>
                      {selectedSalesOrder.creditCheckStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="font-medium">{getSalesOrderClientName(selectedSalesOrder)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                  <p className="font-medium">{new Date(selectedSalesOrder.orderDate || selectedSalesOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
                  <p className="font-medium">
                    {selectedSalesOrder.expectedDeliveryDate ? new Date(selectedSalesOrder.expectedDeliveryDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                  <p className="font-bold text-lg">₹{parseFloat(selectedSalesOrder.totalAmount || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Items from related quotation */}
              {(() => {
                const quotation = (quotations as any[])?.find((q: any) => q.id === selectedSalesOrder.quotationId);
                if (quotation?.items && quotation.items.length > 0) {
                  return (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Order Items</label>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-5 gap-2 p-3 bg-muted text-xs font-medium">
                          <div>Product</div>
                          <div>Quantity</div>
                          <div>Unit</div>
                          <div>Rate</div>
                          <div>Amount</div>
                        </div>
                        {quotation.items.map((item: any, index: number) => (
                          <div key={index} className="grid grid-cols-5 gap-2 p-3 border-t text-sm">
                            <div>{item.description || 'Product Item'}</div>
                            <div>{item.quantity}</div>
                            <div>{item.unit}</div>
                            <div>₹{parseFloat(item.unitPrice || item.rate || 0).toFixed(2)}</div>
                            <div>₹{parseFloat(item.totalPrice || item.amount || 0).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(selectedSalesOrder.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Tax (18% GST):</span>
                  <span>₹{(parseFloat(selectedSalesOrder.totalAmount || 0) * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                  <span>Grand Total:</span>
                  <span>₹{(parseFloat(selectedSalesOrder.totalAmount || 0) * 1.18).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedSalesOrder && (
              <Button 
                variant="outline"
                onClick={() => handleDownloadSalesOrderPDF(selectedSalesOrder)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sales Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sales Order</DialogTitle>
            <DialogDescription>
              Update sales order status and delivery information
            </DialogDescription>
          </DialogHeader>
          
          {selectedSalesOrder && (
            <EditSalesOrderForm 
              salesOrder={selectedSalesOrder} 
              onClose={() => setIsEditDialogOpen(false)}
              onSave={() => {
                setIsEditDialogOpen(false);
                // Refresh data
                queryClient.invalidateQueries({ queryKey: ['/api/sales-orders'] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Sales Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sales order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {salesOrderToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-medium">{salesOrderToDelete.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{getSalesOrderClientName(salesOrderToDelete)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">₹{parseFloat(salesOrderToDelete.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSalesOrderToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteSalesOrder}
              disabled={deleteSalesOrderMutation.isPending}
            >
              {deleteSalesOrderMutation.isPending ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Ledger Dialog */}
      <SalesOrderLedger
        salesOrderId={selectedSalesOrder?.id || ""}
        companyId={selectedSalesOrder?.clientId || ""}
        isOpen={isLedgerDialogOpen}
        onClose={() => {
          setIsLedgerDialogOpen(false);
          setSelectedSalesOrder(null);
        }}
      />
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
