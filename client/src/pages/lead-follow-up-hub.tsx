import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Phone, Mail, Users, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const followUpFormSchema = z.object({
  leadId: z.string().min(1, "Lead selection is required"),
  type: z.enum(["CALL", "EMAIL", "MEETING", "DEMO", "PROPOSAL"], {
    required_error: "Follow-up type is required",
  }),
  description: z.string().min(1, "Description is required"),
  followUpDate: z.string().min(1, "Follow-up date is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
    required_error: "Priority is required",
  }),
  nextFollowUpDate: z.string().optional(),
  assignedUserId: z.string().optional(),
});

type FollowUpFormData = z.infer<typeof followUpFormSchema>;

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  createdAt: string;
}

interface LeadFollowUp {
  id: string;
  leadId: string;
  type: "CALL" | "EMAIL" | "MEETING" | "DEMO" | "PROPOSAL";
  description: string;
  followUpDate: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  outcome?: string;
  nextFollowUpDate?: string;
  completedAt?: string;
  assignedUserId?: string;
  createdAt: string;
  lead?: Lead;
}

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "CALL": return <Phone className="h-4 w-4" />;
    case "EMAIL": return <Mail className="h-4 w-4" />;
    case "MEETING": return <Users className="h-4 w-4" />;
    case "DEMO": return <Users className="h-4 w-4" />;
    case "PROPOSAL": return <Users className="h-4 w-4" />;
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "URGENT": return "bg-red-100 text-red-800 border-red-200";
    case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
    case "MEDIUM": return "bg-blue-100 text-blue-800 border-blue-200";
    case "LOW": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function LeadFollowUpHub() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch lead follow-ups
  const { data: leadFollowUps = [], isLoading } = useQuery<LeadFollowUp[]>({
    queryKey: ["/api/lead-follow-ups"],
  });

  // Fetch leads for dropdown
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Create follow-up mutation
  const createFollowUpMutation = useMutation({
    mutationFn: async (data: FollowUpFormData) => {
      return apiRequest("/api/lead-follow-ups", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-follow-ups"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Lead follow-up created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create lead follow-up",
        variant: "destructive",
      });
    },
  });

  // Update follow-up status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, outcome }: { id: string; status: string; outcome?: string }) => {
      return apiRequest(`/api/lead-follow-ups/${id}`, "PUT", { 
        status, 
        outcome,
        completedAt: status === "COMPLETED" ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-follow-ups"] });
      toast({
        title: "Success",
        description: "Follow-up status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow-up status",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: {
      type: "CALL",
      priority: "MEDIUM",
      followUpDate: new Date().toISOString().split("T")[0],
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

  // Filter follow-ups
  const filteredFollowUps = leadFollowUps.filter(followUp => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "pending") return followUp.status === "PENDING";
    if (selectedFilter === "completed") return followUp.status === "COMPLETED";
    if (selectedFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      return followUp.followUpDate.split("T")[0] === today;
    }
    if (selectedFilter === "overdue") {
      const today = new Date().toISOString().split("T")[0];
      return followUp.followUpDate.split("T")[0] < today && followUp.status === "PENDING";
    }
    return true;
  });

  // Stats
  const stats = {
    total: leadFollowUps.length,
    pending: leadFollowUps.filter(f => f.status === "PENDING").length,
    completed: leadFollowUps.filter(f => f.status === "COMPLETED").length,
    overdue: leadFollowUps.filter(f => {
      const today = new Date().toISOString().split("T")[0];
      return f.followUpDate.split("T")[0] < today && f.status === "PENDING";
    }).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading lead follow-ups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="lead-follow-up-hub">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">Lead Follow-up Hub</h1>
          <p className="text-gray-600">Manage and track all lead follow-up activities</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-follow-up">
              <Plus className="h-4 w-4 mr-2" />
              Create Follow-up
            </Button>
          </DialogTrigger>
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
                              {lead.name} - {lead.company}
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
                  name="type"
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">🟢 Low</SelectItem>
                          <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                          <SelectItem value="HIGH">🟠 High</SelectItem>
                          <SelectItem value="URGENT">🔴 Urgent</SelectItem>
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
                  name="nextFollowUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Follow-up Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" data-testid="input-next-follow-up-date" {...field} />
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
                      <FormLabel>Assign To (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-assigned-user">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the follow-up activity..."
                          data-testid="textarea-description"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("all")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Follow-ups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("pending")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="stat-pending">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("completed")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-completed">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFilter("overdue")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="stat-overdue">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("all")}
          data-testid="filter-all"
        >
          All Follow-ups
        </Button>
        <Button
          variant={selectedFilter === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("today")}
          data-testid="filter-today"
        >
          Today
        </Button>
        <Button
          variant={selectedFilter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("pending")}
          data-testid="filter-pending"
        >
          Pending
        </Button>
        <Button
          variant={selectedFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("completed")}
          data-testid="filter-completed"
        >
          Completed
        </Button>
        <Button
          variant={selectedFilter === "overdue" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("overdue")}
          data-testid="filter-overdue"
        >
          Overdue
        </Button>
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
          filteredFollowUps.map((followUp) => {
            const lead = leads.find(l => l.id === followUp.leadId);
            const assignedUser = users.find(u => u.id === followUp.assignedUserId);
            
            return (
              <Card key={followUp.id} className="hover:shadow-md transition-shadow" data-testid={`follow-up-${followUp.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {getTypeIcon(followUp.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900" data-testid={`text-lead-name-${followUp.id}`}>
                            {lead?.name || "Unknown Lead"}
                          </h3>
                          <Badge className={getStatusColor(followUp.status)} data-testid={`status-${followUp.id}`}>
                            {followUp.status}
                          </Badge>
                          <Badge className={getPriorityColor(followUp.priority)} data-testid={`priority-${followUp.id}`}>
                            {followUp.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Company:</strong> {lead?.company || "N/A"}
                        </p>
                        
                        <p className="text-gray-700 mb-3" data-testid={`text-description-${followUp.id}`}>
                          {followUp.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span data-testid={`text-follow-up-date-${followUp.id}`}>
                              {format(new Date(followUp.followUpDate), "MMM dd, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          
                          {assignedUser && (
                            <div data-testid={`text-assigned-user-${followUp.id}`}>
                              <strong>Assigned:</strong> {assignedUser.firstName} {assignedUser.lastName}
                            </div>
                          )}
                          
                          {followUp.nextFollowUpDate && (
                            <div data-testid={`text-next-follow-up-${followUp.id}`}>
                              <strong>Next:</strong> {format(new Date(followUp.nextFollowUpDate), "MMM dd, yyyy")}
                            </div>
                          )}
                        </div>
                        
                        {followUp.outcome && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm">
                              <strong>Outcome:</strong> {followUp.outcome}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {followUp.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(followUp.id, "COMPLETED")}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-complete-${followUp.id}`}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(followUp.id, "CANCELLED")}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-cancel-${followUp.id}`}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {followUp.completedAt && (
                        <p className="text-xs text-gray-500">
                          Completed: {format(new Date(followUp.completedAt), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}