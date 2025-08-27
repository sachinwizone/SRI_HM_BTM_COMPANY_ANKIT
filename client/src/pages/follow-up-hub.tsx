import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckSquare, 
  PlayCircle, 
  XCircle, 
  Eye, 
  History,
  Plus,
  Target,
  TrendingUp,
  Users
} from "lucide-react";
import { useState } from "react";
import { format, parseISO, isToday, isTomorrow, isThisWeek, isThisMonth, isPast } from 'date-fns';

const followUpSchema = z.object({
  taskId: z.string().min(1, "Task is required"),
  followUpDate: z.string().min(1, "Follow-up date is required"),
  nextFollowUpDate: z.string().optional(),
  contactMethod: z.enum(["EMAIL", "PHONE", "WHATSAPP", "IN_PERSON", "VIDEO_CALL"]),
  remarks: z.string().min(1, "Follow-up notes are required"),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("PENDING")
});

export default function FollowUpHub() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  // Fetch follow-ups and tasks
  const { data: followUps = [], isLoading: followUpsLoading } = useQuery({
    queryKey: ['/api/follow-ups']
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks']
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users']
  });

  const form = useForm({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      taskId: "",
      followUpDate: "",
      nextFollowUpDate: "",
      contactMethod: "EMAIL",
      remarks: "",
      status: "PENDING"
    }
  });

  const addFollowUpMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/follow-ups'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Follow-up created successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create follow-up",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: any) => {
    addFollowUpMutation.mutate(data);
  };

  // Calculate follow-up schedule stats
  const getFollowUpScheduleStats = () => {
    const today = new Date();
    const stats = {
      overdue: 0,
      today: 0,
      tomorrow: 0,
      thisWeek: 0,
      thisMonth: 0
    };

    followUps.forEach((followUp: any) => {
      if (followUp.status === 'COMPLETED' || followUp.status === 'CANCELLED') return;
      
      const followUpDate = parseISO(followUp.followUpDate);
      
      if (isPast(followUpDate) && !isToday(followUpDate)) {
        stats.overdue++;
      } else if (isToday(followUpDate)) {
        stats.today++;
      } else if (isTomorrow(followUpDate)) {
        stats.tomorrow++;
      } else if (isThisWeek(followUpDate)) {
        stats.thisWeek++;
      } else if (isThisMonth(followUpDate)) {
        stats.thisMonth++;
      }
    });

    return stats;
  };

  // Calculate progress stats
  const getProgressStats = () => {
    const stats = {
      todo: 0,
      inProgress: 0,
      blocked: 0,
      review: 0,
      completed: 0
    };

    tasks.forEach((task: any) => {
      switch (task.status) {
        case 'TODO':
          stats.todo++;
          break;
        case 'IN_PROGRESS':
          stats.inProgress++;
          break;
        case 'BLOCKED':
          stats.blocked++;
          break;
        case 'REVIEW':
          stats.review++;
          break;
        case 'COMPLETED':
          stats.completed++;
          break;
        default:
          stats.todo++;
      }
    });

    return stats;
  };

  const scheduleStats = getFollowUpScheduleStats();
  const progressStats = getProgressStats();

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find((t: any) => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  const getUserName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}`.trim() || user.username : 'Unknown User';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Target className="mr-3 text-purple-500" size={32} />
            Follow-up Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage lead interactions and schedule communications
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <History size={16} className="mr-2" />
                History ({followUps.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <History size={20} className="mr-2 text-purple-500" />
                  Follow-up History
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {followUps.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No follow-ups found.</p>
                ) : (
                  followUps.map((followUp: any) => (
                    <div key={followUp.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
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
                          <Badge variant="outline">{followUp.contactMethod}</Badge>
                        </div>
                        <span className="text-sm text-gray-600">
                          by {getUserName(followUp.assignedUserId)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {getTaskTitle(followUp.taskId)}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        {followUp.remarks}
                      </p>
                      {followUp.nextFollowUpDate && (
                        <p className="text-xs text-blue-600">
                          Next follow-up: {format(parseISO(followUp.nextFollowUpDate), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center bg-purple-600 hover:bg-purple-700">
                <Plus size={16} className="mr-2" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Target size={20} className="mr-2 text-purple-500" />
                  Schedule New Follow-up
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="taskId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Task</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a task..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tasks.map((task: any) => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose how you'll contact them..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="EMAIL">Email</SelectItem>
                              <SelectItem value="PHONE">Phone Call</SelectItem>
                              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                              <SelectItem value="IN_PERSON">In Person</SelectItem>
                              <SelectItem value="VIDEO_CALL">Video Call</SelectItem>
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
                          <FormLabel>Next Follow-up Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="nextFollowUpDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Future Follow-up Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What did you discuss? What are the next steps? Add detailed notes here..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={addFollowUpMutation.isPending}>
                      <Target size={16} className="mr-2" />
                      {addFollowUpMutation.isPending ? "Adding..." : "Add Follow-up"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Follow-up Schedule Cards - First Row */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Follow-up Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {scheduleStats.overdue}
                  </p>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</p>
                  <p className="text-xs text-red-500 dark:text-red-400">Past due follow-ups</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {scheduleStats.today}
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Today</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400">Due today</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {scheduleStats.tomorrow}
                  </p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Tomorrow</p>
                  <p className="text-xs text-green-500 dark:text-green-400">Due tomorrow</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {scheduleStats.thisWeek}
                  </p>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">This Week</p>
                  <p className="text-xs text-purple-500 dark:text-purple-400">Due this week</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {scheduleStats.thisMonth}
                  </p>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">This Month</p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-400">Due this month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Cards - Second Row */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-gray-200 bg-gray-50 dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {progressStats.todo}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">To Do</p>
                </div>
                <CheckSquare className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {progressStats.inProgress}
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</p>
                </div>
                <PlayCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {progressStats.blocked}
                  </p>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Blocked</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {progressStats.review}
                  </p>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Review</p>
                </div>
                <Eye className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {progressStats.completed}
                  </p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}