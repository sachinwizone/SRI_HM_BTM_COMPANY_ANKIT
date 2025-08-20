import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/ui/stats-card";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Target,
  Users,
  Calendar
} from "lucide-react";
import { format, subDays, isWithinInterval } from "date-fns";

export function TaskAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Filter tasks by time range
  const getDateRange = () => {
    const end = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const start = subDays(end, days);
    return { start, end };
  };

  const { start, end } = getDateRange();
  const filteredTasks = tasks.filter((task: any) => {
    const taskDate = new Date(task.createdAt);
    return isWithinInterval(taskDate, { start, end });
  });

  // Calculate metrics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t: any) => t.isCompleted).length;
  const overdueTasks = filteredTasks.filter((t: any) => 
    !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // User performance metrics
  const userPerformance = users.map((user: any) => {
    const userTasks = filteredTasks.filter((t: any) => t.assignedTo === user.id);
    const userCompleted = userTasks.filter((t: any) => t.isCompleted).length;
    const userTotal = userTasks.length;
    const userCompletionRate = userTotal > 0 ? (userCompleted / userTotal) * 100 : 0;

    return {
      user,
      totalTasks: userTotal,
      completedTasks: userCompleted,
      completionRate: userCompletionRate,
      overdueTasks: userTasks.filter((t: any) => 
        !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()
      ).length
    };
  }).sort((a, b) => b.completionRate - a.completionRate);

  // Task type distribution
  const taskTypes = filteredTasks.reduce((acc: any, task: any) => {
    acc[task.type] = (acc[task.type] || 0) + 1;
    return acc;
  }, {});

  // Priority distribution
  const priorityDistribution = filteredTasks.reduce((acc: any, task: any) => {
    acc[task.priority || 'MEDIUM'] = (acc[task.priority || 'MEDIUM'] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Task Performance Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive task metrics and team performance insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={totalTasks}
          icon={Target}
          description="Tasks in selected period"
          color="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
        />
        <StatsCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle}
          description="Successfully completed"
          trend={{ value: 12.5, isPositive: true }}
          color="text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
        />
        <StatsCard
          title="Overdue"
          value={overdueTasks}
          icon={AlertTriangle}
          description="Past due date"
          trend={{ value: -8.3, isPositive: true }}
          color="text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
        />
        <StatsCard
          title="Completion Rate"
          value={`${completionRate.toFixed(1)}%`}
          icon={TrendingUp}
          description="Overall success rate"
          trend={{ value: 5.2, isPositive: true }}
          color="text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
        />
      </div>

      {/* Task Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(taskTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {type.replace('_', ' ').toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{count as number}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${((count as number) / totalTasks) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(priorityDistribution).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${
                      priority === 'HIGH' ? 'border-red-500 text-red-700' :
                      priority === 'MEDIUM' ? 'border-yellow-500 text-yellow-700' :
                      'border-green-500 text-green-700'
                    }`}
                  >
                    {priority.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{count as number}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        priority === 'HIGH' ? 'bg-red-500' :
                        priority === 'MEDIUM' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${((count as number) / totalTasks) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userPerformance.slice(0, 10).map((userStats, index) => (
              <div key={userStats.user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {userStats.user.firstName} {userStats.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {userStats.totalTasks} tasks assigned
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {userStats.completedTasks}/{userStats.totalTasks} completed
                    </p>
                    <Progress 
                      value={userStats.completionRate} 
                      className="w-24 h-2"
                    />
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={userStats.completionRate >= 80 ? "default" : 
                              userStats.completionRate >= 60 ? "secondary" : "destructive"}
                    >
                      {userStats.completionRate.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  {userStats.overdueTasks > 0 && (
                    <Badge variant="destructive">
                      {userStats.overdueTasks} overdue
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}