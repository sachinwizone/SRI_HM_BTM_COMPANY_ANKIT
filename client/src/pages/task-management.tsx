import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, CheckSquare, RotateCcw, Calendar, User } from "lucide-react";
import { useState } from "react";

export default function TaskManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");

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
    onError: () => {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Success", description: "Task updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "ONE_TIME",
      assignedTo: "",
      clientId: "",
      orderId: "",
      isCompleted: false,
      dueDate: "",
      recurringInterval: ""
    }
  });

  const onSubmit = (data: any) => {
    createTaskMutation.mutate({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      recurringInterval: data.type === 'RECURRING' && data.recurringInterval ? parseInt(data.recurringInterval) : null
    });
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ONE_TIME':
        return 'bg-blue-100 text-blue-800';
      case 'RECURRING':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (dueDate: string) => {
    if (!dueDate) return 'bg-gray-100 text-gray-800';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-red-100 text-red-800';
    if (diffDays <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const filteredTasks = selectedType === "all" 
    ? allTasks 
    : allTasks?.filter((task: any) => task.type === selectedType);

  const oneTimeCount = oneTimeTasks?.filter((task: any) => !task.isCompleted).length || 0;
  const recurringCount = recurringTasks?.filter((task: any) => !task.isCompleted).length || 0;
  const completedCount = allTasks?.filter((task: any) => task.isCompleted).length || 0;
  const overdueCount = allTasks?.filter((task: any) => 
    !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date()
  ).length || 0;

  const stats = [
    {
      title: "One-time Tasks",
      value: oneTimeCount,
      icon: CheckSquare,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Recurring Tasks",
      value: recurringCount,
      icon: RotateCcw,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Completed",
      value: completedCount,
      icon: CheckSquare,
      color: "text-success bg-success/10"
    },
    {
      title: "Overdue",
      value: overdueCount,
      icon: Calendar,
      color: "text-error bg-error/10"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Task Management" 
          subtitle="Organize and track one-time and recurring tasks"
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-center">
                      <div className={`p-2 ${stat.color} rounded-lg`}>
                        <Icon size={24} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Filters and Actions */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Task List</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        type="text" 
                        placeholder="Search tasks..." 
                        className="w-64 pl-10"
                      />
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
                                        {users?.map((user: any) => (
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
                                        {clients?.map((client: any) => (
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
                                        {orders?.map((order: any) => (
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
                </div>
              </CardHeader>
            </Card>

            {/* Tasks Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </th>
                        <th className="px-6 py-3">Task</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Assigned To</th>
                        <th className="px-6 py-3">Due Date</th>
                        <th className="px-6 py-3">Priority</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
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
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                            <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No tasks found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((task: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300"
                                checked={task.isCompleted}
                                onChange={() => toggleTaskCompletion(task.id, task.isCompleted)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className={`font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                  {task.title}
                                </p>
                                <p className="text-sm text-gray-500">{task.description}</p>
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
                                <span className="text-gray-900">
                                  {task.assignedTo ? 'Assigned' : 'Unassigned'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900">
                                {task.dueDate 
                                  ? new Date(task.dueDate).toLocaleDateString()
                                  : 'No due date'
                                }
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {task.dueDate && (
                                <Badge className={getPriorityColor(task.dueDate)}>
                                  {(() => {
                                    const diffDays = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                    if (diffDays < 0) return 'Overdue';
                                    if (diffDays <= 3) return 'Urgent';
                                    return 'Normal';
                                  })()}
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={task.isCompleted ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                                {task.isCompleted ? 'Completed' : 'Pending'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="link" size="sm">
                                  View
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
          </div>
        </main>
      </div>
    </div>
  );
}
