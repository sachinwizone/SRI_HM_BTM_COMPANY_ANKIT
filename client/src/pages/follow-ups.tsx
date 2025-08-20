import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MessageCircle, Clock, User, Search, Filter } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, parseISO } from "date-fns";

export default function FollowUps() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  // Fetch follow-ups
  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['/api/follow-ups'],
  });

  // Fetch users for name mapping
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch tasks for task details
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const getUserName = (userId: string) => {
    const user = (users as any[]).find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  const getTaskTitle = (taskId: string) => {
    const task = (tasks as any[]).find((t: any) => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  const filterFollowUps = (followUps: any[]) => {
    return (followUps as any[]).filter((followUp: any) => {
      // Search filter
      const matchesSearch = !searchTerm || 
        followUp.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTaskTitle(followUp.taskId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUserName(followUp.assignedUserId).toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || followUp.status === statusFilter;

      // Time filter
      let matchesTime = true;
      if (timeFilter !== "all") {
        const followUpDate = parseISO(followUp.followUpDate);
        switch (timeFilter) {
          case "today":
            matchesTime = isToday(followUpDate);
            break;
          case "tomorrow":
            matchesTime = isTomorrow(followUpDate);
            break;
          case "this-week":
            matchesTime = isThisWeek(followUpDate);
            break;
          case "this-month":
            matchesTime = isThisMonth(followUpDate);
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sendWhatsAppMessage = (followUp: any) => {
    const user = (users as any[]).find((u: any) => u.id === followUp.assignedUserId);
    if (!user?.mobileNumber) {
      toast({ 
        title: "Error", 
        description: "User mobile number not found", 
        variant: "destructive" 
      });
      return;
    }

    const message = `Hello ${user.firstName},

Follow-up reminder for: *${getTaskTitle(followUp.taskId)}*

Scheduled: ${format(parseISO(followUp.followUpDate), 'PPP p')}
Remarks: ${followUp.remarks}

Please provide an update.

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

  const filteredFollowUps = filterFollowUps(followUps as any[]);

  // Count follow-ups by time period
  const todayCount = (followUps as any[]).filter((f: any) => isToday(parseISO(f.followUpDate))).length;
  const tomorrowCount = (followUps as any[]).filter((f: any) => isTomorrow(parseISO(f.followUpDate))).length;
  const thisWeekCount = (followUps as any[]).filter((f: any) => isThisWeek(parseISO(f.followUpDate))).length;
  const thisMonthCount = (followUps as any[]).filter((f: any) => isThisMonth(parseISO(f.followUpDate))).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Follow-ups</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track task follow-ups</p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`cursor-pointer transition-all hover:shadow-md ${timeFilter === 'today' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setTimeFilter(timeFilter === 'today' ? 'all' : 'today')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-blue-600">{todayCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all hover:shadow-md ${timeFilter === 'tomorrow' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setTimeFilter(timeFilter === 'tomorrow' ? 'all' : 'tomorrow')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tomorrow</p>
                <p className="text-2xl font-bold text-green-600">{tomorrowCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all hover:shadow-md ${timeFilter === 'this-week' ? 'ring-2 ring-orange-500' : ''}`}
              onClick={() => setTimeFilter(timeFilter === 'this-week' ? 'all' : 'this-week')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-orange-600">{thisWeekCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all hover:shadow-md ${timeFilter === 'this-month' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setTimeFilter(timeFilter === 'this-month' ? 'all' : 'this-month')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-purple-600">{thisMonthCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search by task, user, or remarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups List */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up History ({filteredFollowUps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFollowUps.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No follow-ups found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFollowUps.map((followUp: any) => (
                <div key={followUp.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {getTaskTitle(followUp.taskId)}
                        </h3>
                        <Badge className={getStatusColor(followUp.status)}>
                          {followUp.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>{getUserName(followUp.assignedUserId)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{format(parseISO(followUp.followUpDate), 'PPP p')}</span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                          {followUp.remarks}
                        </p>
                        
                        {followUp.nextFollowUpDate && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <Clock size={14} />
                            <span>Next: {format(parseISO(followUp.nextFollowUpDate), 'PPP p')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendWhatsAppMessage(followUp)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <MessageCircle size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}