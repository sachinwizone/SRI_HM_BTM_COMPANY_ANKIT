import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  CheckCircle, 
  Clock, 
  DollarSign,
  FileText,
  PhoneCall,
  Calendar,
  Search,
  Download,
  Filter,
  Award,
  BarChart3,
  Percent,
  Star
} from "lucide-react";

interface UserPerformance {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  email: string;
  // Sales Metrics
  leadsGenerated: number;
  leadsConverted: number;
  conversionRate: number;
  salesRevenue: number;
  salesTarget: number;
  targetAchievement: number;
  // Task Management
  tasksAssigned: number;
  tasksCompleted: number;
  taskCompletionRate: number;
  overdueTasks: number;
  // Client Management
  clientsManaged: number;
  activeClients: number;
  newClientsAcquired: number;
  // Follow-ups
  followUpsScheduled: number;
  followUpsCompleted: number;
  followUpRate: number;
  // Overall Performance
  activityScore: number;
  performanceGrade: string;
  lastActivity: string;
}

export default function TeamPerformancePage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("activityScore");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch team performance data from API
  const { data: performanceResponse, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/team-performance', { timeRange, departmentFilter, roleFilter, sortBy, sortOrder }],
  });

  // Extract data from API response
  const performanceData: UserPerformance[] = ((performanceResponse as any)?.performanceData || [])
    .filter((user: UserPerformance) => {
      const matchesSearch = searchQuery === '' || 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

  // Get unique departments and roles for filters
  const departments = Array.from(new Set(performanceData.map(user => user.department)));
  const roles = Array.from(new Set(performanceData.map(user => user.role)));

  // Use summary stats from API or calculate defaults
  const summaryStats = (performanceResponse as any)?.summary || {
    totalUsers: 0,
    avgActivityScore: 0,
    totalRevenue: 0,
    totalLeads: 0,
    totalTasks: 0,
    topPerformers: 0,
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-500 text-white';
      case 'A': return 'bg-green-400 text-white';
      case 'B+': return 'bg-blue-500 text-white';
      case 'B': return 'bg-blue-400 text-white';
      case 'C+': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'SALES_MANAGER': return 'bg-purple-100 text-purple-800';
      case 'SALES_EXECUTIVE': return 'bg-blue-100 text-blue-800';
      case 'OPERATIONS': return 'bg-green-100 text-green-800';
      case 'MANAGER': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (performanceLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="team-performance-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Performance</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive view of team member performance across all functions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" data-testid="export-button">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Team</p>
                <p className="text-2xl font-bold">{summaryStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{summaryStats.avgActivityScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₹{(summaryStats.totalRevenue / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{summaryStats.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-cyan-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tasks Done</p>
                <p className="text-2xl font-bold">{summaryStats.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Top Performers</p>
                <p className="text-2xl font-bold">{summaryStats.topPerformers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activityScore">Activity Score</SelectItem>
                <SelectItem value="salesRevenue">Sales Revenue</SelectItem>
                <SelectItem value="conversionRate">Conversion Rate</SelectItem>
                <SelectItem value="taskCompletionRate">Task Completion</SelectItem>
                <SelectItem value="followUpRate">Follow-up Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance Data */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed" data-testid="tab-detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">Key Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Card View */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceData.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow duration-300" data-testid={`user-card-${user.id}`}>
                <CardContent className="p-6">
                  {/* User Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="font-medium text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getGradeColor(user.performanceGrade)} px-2 py-1 text-xs`}>
                          {user.performanceGrade}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-3">
                    {/* Activity Score */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Activity Score</span>
                        <span className="font-semibold text-gray-900">{user.activityScore}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(user.activityScore, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Task Completion */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Task Completion</span>
                        <span className="font-semibold text-gray-900">{user.taskCompletionRate}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${user.taskCompletionRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Sales Performance (if applicable) */}
                    {user.salesRevenue > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Target Achievement</span>
                          <span className="font-semibold text-gray-900">{user.targetAchievement}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(user.targetAchievement, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{user.leadsGenerated}</p>
                        <p className="text-xs text-gray-600">Leads</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{user.tasksCompleted}</p>
                        <p className="text-xs text-gray-600">Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{user.clientsManaged}</p>
                        <p className="text-xs text-gray-600">Clients</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{user.followUpsCompleted}</p>
                        <p className="text-xs text-gray-600">Follow-ups</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Detailed Table View */}
        <TabsContent value="detailed">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Activity Score</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50" data-testid={`user-row-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {getInitials(user.firstName, user.lastName)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleColor(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{user.activityScore}%</span>
                          {user.activityScore >= 80 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : user.activityScore >= 60 ? (
                            <Activity className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{user.tasksCompleted}/{user.tasksAssigned}</p>
                          <p className="text-sm text-gray-500">{user.taskCompletionRate}% completed</p>
                          {user.overdueTasks > 0 && (
                            <p className="text-xs text-red-500">{user.overdueTasks} overdue</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{user.leadsConverted}/{user.leadsGenerated}</p>
                          <p className="text-sm text-gray-500">{user.conversionRate}% conversion</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{user.activeClients}/{user.clientsManaged}</p>
                          <p className="text-sm text-gray-500">+{user.newClientsAcquired} new</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.salesRevenue > 0 ? (
                          <div>
                            <p className="font-semibold">₹{(user.salesRevenue / 100000).toFixed(1)}L</p>
                            <p className="text-sm text-gray-500">{user.targetAchievement}% of target</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getGradeColor(user.performanceGrade)} px-2 py-1`}>
                          {user.performanceGrade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Metrics Tab */}
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData
                    .sort((a, b) => b.activityScore - a.activityScore)
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                        </div>
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {getInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">{user.role.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{user.activityScore}%</p>
                          <Badge className={getGradeColor(user.performanceGrade)}>
                            {user.performanceGrade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance by Role */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Performance by Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roles.map(role => {
                    const roleUsers = performanceData.filter(user => user.role === role);
                    const avgScore = roleUsers.length > 0 
                      ? Math.round(roleUsers.reduce((sum, user) => sum + user.activityScore, 0) / roleUsers.length)
                      : 0;
                    
                    return (
                      <div key={role} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getRoleColor(role)}>
                              {role.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-gray-600">({roleUsers.length})</span>
                          </div>
                          <span className="font-semibold">{avgScore}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${avgScore}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}