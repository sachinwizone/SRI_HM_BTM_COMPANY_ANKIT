import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/ui/stats-card";
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users,
  Download
} from "lucide-react";
import { format } from "date-fns";

export function SalesDashboard() {
  const [dateRange, setDateRange] = useState("30d");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: salesData = [] } = useQuery({
    queryKey: ["/api/sales", { dateRange, statusFilter }],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  // Calculate metrics
  const totalRevenue = salesData.reduce((sum: number, sale: any) => 
    sum + (parseFloat(sale.netWeight) * parseFloat(sale.rate || 0)), 0);
  
  const totalOrders = salesData.length;
  const uniqueClients = new Set(salesData.map((sale: any) => sale.clientId)).size;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statusCounts = salesData.reduce((acc: any, sale: any) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive sales performance metrics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
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
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="Total sales revenue"
          trend={{ value: 12.5, isPositive: true }}
          color="text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={Package}
          description="Number of sales orders"
          trend={{ value: 8.2, isPositive: true }}
          color="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
        />
        <StatsCard
          title="Active Clients"
          value={uniqueClients}
          icon={Users}
          description="Unique purchasing clients"
          trend={{ value: 15.3, isPositive: true }}
          color="text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
        />
        <StatsCard
          title="Avg Order Value"
          value={`₹${avgOrderValue.toLocaleString()}`}
          icon={TrendingUp}
          description="Average order value"
          trend={{ value: -2.1, isPositive: false }}
          color="text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
        />
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {status.toLowerCase()}
                </Badge>
                <span className="text-sm font-medium">{count as number}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesData.slice(0, 5).map((sale: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order #{sale.salesOrderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.date ? format(new Date(sale.date), "MMM dd, yyyy") : "No date"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{(parseFloat(sale.netWeight) * parseFloat(sale.rate || 0)).toLocaleString()}</p>
                  <Badge variant="outline" className="capitalize">
                    {sale.status?.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}