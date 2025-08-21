import StatsCards from "@/components/dashboard/stats-cards";
import PaymentAlerts from "@/components/dashboard/payment-alerts";
import ClientCategories from "@/components/dashboard/client-categories";
import RecentOrders from "@/components/dashboard/recent-orders";
import TaskClassification from "@/components/dashboard/task-classification";
import ClientTrackingTable from "@/components/dashboard/client-tracking-table";
import SalesPerformance from "@/components/dashboard/sales-performance-fixed";
import QuickActions from "@/components/dashboard/quick-actions";
import { InteractiveCharts } from "@/components/dashboard/interactive-charts";
import { RealTimeNotifications } from "@/components/dashboard/real-time-notifications";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Filter, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Interactive Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName}. Here's what's happening today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
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
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <StatsCards />

      {/* Interactive Charts Section */}
      <InteractiveCharts timeRange={timeRange} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PaymentAlerts />
        <ClientCategories />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <RecentOrders />
        <TaskClassification />
        <ActivityFeed />
      </div>

      <ClientTrackingTable />

      <SalesPerformance />

      <QuickActions />
      
      {/* Real-time Notifications */}
      <RealTimeNotifications />
    </div>
  );
}
