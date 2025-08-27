
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, CheckSquare, RotateCcw, Calendar, User, Edit3, Trash2, UserCheck, MessageCircle, Clock, ChevronDown, ChevronUp, History, X } from "lucide-react";
import { useState } from "react";
import { format, parseISO } from 'date-fns';

export default function TaskManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [editingTask, setEditingTask] = useState<any>(null);
  const [transferringTask, setTransferringTask] = useState<any>(null);
  const [followUpTask, setFollowUpTask] = useState<any>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Fetch data
  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: oneTimeTasks = [] } = useQuery({
    queryKey: ['/api/tasks', { type: 'ONE_TIME' }],
  });

  const { data: recurringTasks = [] } = useQuery({
    queryKey: ['/api/tasks', { type: 'RECURRING' }],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Fetch follow-ups data
  const { data: allFollowUps = [] } = useQuery({
    queryKey: ['/api/follow-ups'],
  });

  // Form schemas
  const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.enum(["ONE_TIME", "RECURRING"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "COMPLETED"]).default("TODO"),
    assignedTo: z.string().optional(),
    clientId: z.string().optional(),
    orderId: z.string().optional(),
    mobileNumber: z.string().optional(),
    isCompleted: z.boolean().default(false),
    dueDate: z.string().optional(),
    recurringInterval: z.string().optional()
  });

  const transferSchema = z.object({
    assignedTo: z.string().min(1, "Please select a user")
  });

  // Forms
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "ONE_TIME" as const,
      priority: "MEDIUM" as const,
      status: "TODO" as const,
      assignedTo: "",
      clientId: "",
      orderId: "",
      mobileNumber: "",
      isCompleted: false,
      dueDate: "",
      recurringInterval: ""
    }
  });

  const editForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "ONE_TIME" as const,
      priority: "MEDIUM" as const,
      status: "TODO" as const,
      assignedTo: "",
      clientId: "",
      orderId: "",
      mobileNumber: "",
      isCompleted: false,
      dueDate: "",
      recurringInterval: ""
    }
  });

  const transferForm = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      assignedTo: ""
    }
  });

  const followUpSchema = z.object({
    followUpDate: z.string().min(1, "Follow-up date is required"),
    remarks: z.string().min(1, "Remarks are required"),
    nextFollowUpDate: z.string().optional(),
  });

  const followUpForm = useForm({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      followUpDate: "",
      remarks: "",
      nextFollowUpDate: "",
    }
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/tasks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Success", description: "Task created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Task creation error:", error);
      const errorMsg = error?.message || "Failed to create task";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Success", description: "Task updated successfully" });
      setIsEditDialogOpen(false);
      setEditingTask(null);
    },
    onError: (error: any) => {
      console.error("Task update error:", error);
      const errorMsg = error?.message || "Failed to update task";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
  });

  const transferTaskMutation = useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string }) => {
      return await apiRequest('PUT', `/api/tasks/${id}`, { assignedTo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Success", description: "Task transferred successfully" });
      setIsTransferDialogOpen(false);
      setTransferringTask(null);
      transferForm.reset();
    },
    onError: (error: any) => {
      console.error("Task transfer error:", error);
      const errorMsg = error?.message || "Failed to transfer task";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Success", description: "Task deleted successfully" });
    },
    onError: (error: any) => {
      console.error("Task deletion error:", error);
      const errorMsg = error?.message || "Failed to delete task";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
  });

  const createFollowUpMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/follow-ups', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/follow-ups'] });
      toast({ title: "Success", description: "Follow-up created successfully" });
      setIsFollowUpDialogOpen(false);
      setFollowUpTask(null);
      followUpForm.reset();
    },
    onError: (error: any) => {
      console.error("Follow-up creation error:", error);
      const errorMsg = error?.message || "Failed to create follow-up";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
  });

  // Helper functions
  const processFormData = (data: z.infer<typeof formSchema>) => {
    return {
      title: data.title,
      description: data.description || null,
      type: data.type,
      priority: data.priority,
      status: data.status,
      assignedTo: data.assignedTo && data.assignedTo.trim() ? data.assignedTo : null,
      clientId: data.clientId && data.clientId.trim() ? data.clientId : null,
      orderId: data.orderId && data.orderId.trim() ? data.orderId : null,
      isCompleted: data.isCompleted,
      dueDate: data.dueDate && data.dueDate.trim() ? new Date(data.dueDate).toISOString() : null,
      recurringInterval: data.type === 'RECURRING' && data.recurringInterval && data.recurringInterval.trim() ? parseInt(data.recurringInterval) : null
    };
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const processedData = processFormData(data);
    createTaskMutation.mutate(processedData);
  };

  const onEditSubmit = (data: z.infer<typeof formSchema>) => {
    if (!editingTask) return;
    const processedData = processFormData(data);
    updateTaskMutation.mutate({ id: editingTask.id, data: processedData });
  };

  const onTransferSubmit = (data: z.infer<typeof transferSchema>) => {
    if (!transferringTask) return;
    transferTaskMutation.mutate({ id: transferringTask.id, assignedTo: data.assignedTo });
  };

  const onFollowUpSubmit = (data: z.infer<typeof followUpSchema>) => {
    if (!followUpTask) return;
    const processedData = {
      taskId: followUpTask.id,
      assignedUserId: followUpTask.assignedTo || (users as any[])[0]?.id,
      followUpDate: new Date(data.followUpDate).toISOString(),
      remarks: data.remarks,
      status: "PENDING",
      nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate).toISOString() : null,
    };
    createFollowUpMutation.mutate(processedData);
  };

  const openFollowUpDialog = (task: any) => {
    setFollowUpTask(task);
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    followUpForm.reset({
      followUpDate: now.toISOString().slice(0, 16),
      remarks: `Follow-up for task: ${task.title}`,
      nextFollowUpDate: tomorrow.toISOString().slice(0, 16),
    });
    setIsFollowUpDialogOpen(true);
  };

  const sendWhatsAppMessage = (task: any, user: any) => {
    if (!user?.mobileNumber) {
      toast({ 
        title: "Error", 
        description: "User mobile number not found", 
        variant: "destructive" 
      });
      return;
    }
    
    const message = `Hello ${user.firstName}, 

You have a follow-up for task: *${task.title}*

Description: ${task.description || 'No description'}
Priority: ${task.priority || 'MEDIUM'}
Status: ${task.status || 'TODO'}

Please provide an update on this task.

Thanks!`;
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = user.mobileNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({ 
      title: "WhatsApp Opened", 
      description: `Message template opened for ${user.firstName}` 
    });
  };

  // Toggle task expansion to show/hide follow-up history
  const toggleTaskExpansion = (taskId: string) => {
    const newExpandedTasks = new Set<string>();
    if (!expandedTasks.has(taskId)) {
      // Open only the clicked task, close all others
      newExpandedTasks.add(taskId);
    }
    // If clicking the same task that's already open, it will close (empty set)
    setExpandedTasks(newExpandedTasks);
  };

  // Get follow-ups for a specific task
  const getTaskFollowUps = (taskId: string) => {
    if (!allFollowUps) return [];
    return (allFollowUps as any[]).filter((followUp: any) => followUp.taskId === taskId)
      .sort((a: any, b: any) => new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime());
  };

  const toggleTaskCompletion = (taskId: string, isCompleted: boolean) => {
    updateTaskMutation.mutate({
      id: taskId,
      data: { 
        isCompleted: !isCompleted,
        completedAt: !isCompleted ? new Date().toISOString() : null
      }
    });
  };

  const openEditDialog = (task: any) => {
    setEditingTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || "",
      type: task.type,
      priority: task.priority || "MEDIUM",
      status: task.status || "TODO",
      assignedTo: task.assignedTo || "",
      clientId: task.clientId || "",
      orderId: task.orderId || "",
      mobileNumber: task.mobileNumber || "",
      isCompleted: task.isCompleted,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
      recurringInterval: task.recurringInterval ? task.recurringInterval.toString() : ""
    });
    setIsEditDialogOpen(true);
  };

  const openTransferDialog = (task: any) => {
    setTransferringTask(task);
    transferForm.reset({ assignedTo: "" });
    setIsTransferDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ONE_TIME':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'RECURRING':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (dueDate: string) => {
    if (!dueDate) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (diffDays <= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  };

  const getAssignedUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  };

  const filteredTasks = selectedType === "all" 
    ? allTasks 
    : allTasks.filter((task: any) => task.type === selectedType);

  const oneTimeCount = allTasks.filter((task: any) => task.type === 'ONE_TIME' && !task.isCompleted).length || 0;
  const recurringCount = allTasks.filter((task: any) => task.type === 'RECURRING' && !task.isCompleted).length || 0;
  const completedCount = allTasks.filter((task: any) => task.isCompleted).length || 0;
  const overdueCount = allTasks.filter((task: any) => 
    !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date()
  ).length || 0;

  const stats = [
    {
      title: "One-time Tasks",
      value: oneTimeCount,
      icon: CheckSquare,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
    },
    {
      title: "Recurring Tasks",
      value: recurringCount,
      icon: RotateCcw,
      color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
    },
    {
      title: "Completed",
      value: completedCount,
      icon: CheckSquare,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
    },
    {
      title: "Overdue",
      value: overdueCount,
      icon: Calendar,
      color: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-600 mt-1">Manage and track your team's tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <stat.icon size={20} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Controls */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input placeholder="Search tasks..." className="pl-10 w-64" />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Task Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ONE_TIME">One-time</SelectItem>
                        <SelectItem value="RECURRING">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter size={16} className="mr-2" />
                      Filter
                    </Button>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus size={16} className="mr-2" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                          Fill in the details below to create a new task for your team.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Task Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter task title" {...field} />
                                </FormControl>
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
                                  <Textarea placeholder="Enter task description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Task Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="ONE_TIME">One-time Task</SelectItem>
                                      <SelectItem value="RECURRING">Recurring Task</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="assignedTo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Assign To</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select user" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {users.map((user: any) => (
                                        <SelectItem key={user.id} value={user.id}>
                                          {user.firstName} {user.lastName}
                                        </SelectItem>
                                      ))}
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
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Priority</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormField
                              control={form.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="TODO">To Do</SelectItem>
                                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                      <SelectItem value="BLOCKED">Blocked</SelectItem>
                                      <SelectItem value="REVIEW">Review</SelectItem>
                                      <SelectItem value="COMPLETED">Completed</SelectItem>
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
                              name="dueDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Due Date</FormLabel>
                                  <FormControl>
                                    <Input type="datetime-local" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="recurringInterval"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Recurring Interval (Days)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="e.g., 7 for weekly" 
                                      {...field} 
                                      disabled={form.watch("type") !== "RECURRING"}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="clientId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Related Client (Optional)</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select client" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {clients.map((client: any) => (
                                        <SelectItem key={client.id} value={client.id}>
                                          {client.name}
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
                              name="orderId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Related Order (Optional)</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select order" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {orders.map((order: any) => (
                                        <SelectItem key={order.id} value={order.id}>
                                          {order.orderNumber}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="mobileNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mobile Number (WhatsApp)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="tel" 
                                    placeholder="e.g., +91 9876543210" 
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createTaskMutation.isPending}>
                              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Tasks Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th className="px-6 py-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </th>
                        <th className="px-6 py-3">Task</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Assigned To</th>
                        <th className="px-6 py-3">Due Date</th>
                        <th className="px-6 py-3">Priority</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                          </tr>
                        ))
                      ) : !filteredTasks || filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No tasks found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((task: any, index: number) => (
                          <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300"
                                checked={task.isCompleted}
                                onChange={() => toggleTaskCompletion(task.id, task.isCompleted)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className={`font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                    {task.title}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                                  {getTaskFollowUps(task.id).length > 0 && (
                                    <div 
                                      className="flex items-center mt-1 cursor-pointer hover:bg-blue-50 p-1 rounded" 
                                      onClick={() => toggleTaskExpansion(task.id)}
                                      title="Click to view follow-up history"
                                    >
                                      <History size={12} className="text-blue-500 mr-1" />
                                      <span className="text-xs text-blue-600">
                                        {getTaskFollowUps(task.id).length} follow-up{getTaskFollowUps(task.id).length !== 1 ? 's' : ''}
                                      </span>
                                      {expandedTasks.has(task.id) ? 
                                        <ChevronUp size={12} className="ml-1 text-blue-500" /> : 
                                        <ChevronDown size={12} className="ml-1 text-blue-500" />
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={getTypeColor(task.type)}>
                                {task.type === 'ONE_TIME' ? 'One-time' : 'Recurring'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <User size={16} className="text-gray-400" />
                                <span className="text-gray-900 dark:text-white">
                                  {getAssignedUserName(task.assignedTo)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900 dark:text-white">
                                {task.dueDate 
                                  ? new Date(task.dueDate).toLocaleDateString()
                                  : 'No due date'
                                }
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Select 
                                value={task.priority || 'MEDIUM'} 
                                onValueChange={(value) => updateTaskMutation.mutate({ 
                                  id: task.id, 
                                  data: { priority: value } 
                                })}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="LOW">
                                    <Badge className="bg-gray-100 text-gray-800">Low</Badge>
                                  </SelectItem>
                                  <SelectItem value="MEDIUM">
                                    <Badge className="bg-blue-100 text-blue-800">Medium</Badge>
                                  </SelectItem>
                                  <SelectItem value="HIGH">
                                    <Badge className="bg-orange-100 text-orange-800">High</Badge>
                                  </SelectItem>
                                  <SelectItem value="URGENT">
                                    <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-6 py-4">
                              <Select 
                                value={task.status || 'TODO'} 
                                onValueChange={(value) => updateTaskMutation.mutate({ 
                                  id: task.id, 
                                  data: { status: value, isCompleted: value === 'COMPLETED' } 
                                })}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TODO">
                                    <Badge className="bg-gray-100 text-gray-800">To Do</Badge>
                                  </SelectItem>
                                  <SelectItem value="IN_PROGRESS">
                                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                                  </SelectItem>
                                  <SelectItem value="BLOCKED">
                                    <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                                  </SelectItem>
                                  <SelectItem value="REVIEW">
                                    <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>
                                  </SelectItem>
                                  <SelectItem value="COMPLETED">
                                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(task)}
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                  title="Edit Task"
                                >
                                  <Edit3 size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openTransferDialog(task)}
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                  title="Transfer Task"
                                >
                                  <UserCheck size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openFollowUpDialog(task)}
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  title="Create Follow-up"
                                >
                                  <Clock size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const assignedUser = users?.find(u => u.id === task.assignedTo);
                                    if (assignedUser) {
                                      sendWhatsAppMessage(task, assignedUser);
                                    } else {
                                      toast({ title: "Error", description: "Assigned user not found", variant: "destructive" });
                                    }
                                  }}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                                  title="WhatsApp Message"
                                >
                                  <MessageCircle size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                  title="Delete Task"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </CardContent>
            </Card>

            {/* Follow-up History Section - Shows below table when task is expanded */}
            {Array.from(expandedTasks).map(taskId => {
              const task = filteredTasks.find((t: any) => t.id === taskId);
              if (!task) return null;
              
              return (
                <Card key={`followups-${taskId}`} className="mt-4">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <History size={20} className="text-blue-500 mr-3" />
                        Follow-up History for "{task.title}"
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTaskExpansion(taskId)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    {getTaskFollowUps(taskId).length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No follow-ups yet for this task.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {getTaskFollowUps(taskId).map((followUp: any) => {
                          const followUpUser = (users as any[])?.find((u: any) => u.id === followUp.assignedUserId);
                          return (
                            <div key={followUp.id} className="border-l-4 border-blue-200 pl-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-r-md">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Badge className={
                                    followUp.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    followUp.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }>
                                    {followUp.status}
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {format(parseISO(followUp.followUpDate), 'MMM dd, yyyy HH:mm')}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-600">
                                  by {followUpUser ? (followUpUser.firstName + ' ' + followUpUser.lastName).trim() || followUpUser.username : 'Unknown'}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-2">
                                {followUp.remarks}
                              </p>
                              {followUp.nextFollowUpDate && (
                                <p className="text-sm text-blue-600">
                                  Next follow-up: {format(parseISO(followUp.nextFollowUpDate), 'MMM dd, yyyy HH:mm')}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter task description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ONE_TIME">One-time Task</SelectItem>
                          <SelectItem value="RECURRING">Recurring Task</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="recurringInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurring Interval (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 7 for weekly" 
                          {...field} 
                          disabled={editForm.watch("type") !== "RECURRING"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number (WhatsApp)</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="e.g., +91 9876543210" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTaskMutation.isPending}>
                  {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Transfer Task Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Task</DialogTitle>
            <DialogDescription>
              Assign this task to a different user.
            </DialogDescription>
          </DialogHeader>
          <Form {...transferForm}>
            <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-4">
              <FormField
                control={transferForm.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={transferTaskMutation.isPending}>
                  {transferTaskMutation.isPending ? "Transferring..." : "Transfer Task"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Follow-up</DialogTitle>
            <DialogDescription>
              Schedule a follow-up for task: {followUpTask?.title}
            </DialogDescription>
          </DialogHeader>
          <Form {...followUpForm}>
            <form onSubmit={followUpForm.handleSubmit(onFollowUpSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={followUpForm.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Date & Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={followUpForm.control}
                  name="nextFollowUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Follow-up Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={followUpForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter follow-up details and notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsFollowUpDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createFollowUpMutation.isPending}>
                  {createFollowUpMutation.isPending ? "Creating..." : "Create Follow-up"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}