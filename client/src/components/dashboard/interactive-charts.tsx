import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieIcon, Activity } from "lucide-react";

// Sample data - in real app this would come from API
const salesData = [
  { month: "Jan", revenue: 45000, orders: 120, profit: 12000 },
  { month: "Feb", revenue: 52000, orders: 145, profit: 15600 },
  { month: "Mar", revenue: 48000, orders: 130, profit: 14400 },
  { month: "Apr", revenue: 61000, orders: 165, profit: 18300 },
  { month: "May", revenue: 55000, orders: 150, profit: 16500 },
  { month: "Jun", revenue: 67000, orders: 180, profit: 20100 }
];

const clientData = [
  { name: "ALFA", value: 35, color: "#3B82F6" },
  { name: "BETA", value: 28, color: "#10B981" },
  { name: "GAMMA", value: 25, color: "#F59E0B" },
  { name: "DELTA", value: 12, color: "#EF4444" }
];

const taskData = [
  { day: "Mon", completed: 45, pending: 12, overdue: 3 },
  { day: "Tue", completed: 52, pending: 8, overdue: 2 },
  { day: "Wed", completed: 38, pending: 15, overdue: 5 },
  { day: "Thu", completed: 61, pending: 10, overdue: 1 },
  { day: "Fri", completed: 55, pending: 18, overdue: 4 },
  { day: "Sat", completed: 33, pending: 6, overdue: 2 },
  { day: "Sun", completed: 28, pending: 4, overdue: 1 }
];

interface InteractiveChartsProps {
  timeRange?: string;
}

export function InteractiveCharts({ timeRange = "30d" }: InteractiveChartsProps) {
  const [activeChart, setActiveChart] = useState("revenue");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const getChartData = () => {
    switch (selectedMetric) {
      case "orders":
        return salesData.map(d => ({ ...d, value: d.orders }));
      case "profit":
        return salesData.map(d => ({ ...d, value: d.profit }));
      default:
        return salesData.map(d => ({ ...d, value: d.revenue }));
    }
  };

  const formatValue = (value: number) => {
    if (selectedMetric === "orders") return value.toString();
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const getTrend = () => {
    const data = getChartData();
    const current = data[data.length - 1]?.value || 0;
    const previous = data[data.length - 2]?.value || 0;
    const change = ((current - previous) / previous) * 100;
    return { change, isPositive: change > 0 };
  };

  const trend = getTrend();

  return (
    <div className="space-y-6">
      {/* Revenue Trends Chart */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">Performance Analytics</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {selectedMetric}
              </Badge>
              <div className="flex items-center space-x-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(trend.change).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="profit">Profit</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={formatValue}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-blue-600">
                            {selectedMetric}: {formatValue(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorGradient)"
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart Type Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Distribution Pie Chart */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieIcon className="h-5 w-5" />
              <span>Client Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {clientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{payload[0].name}</p>
                            <p style={{ color: payload[0].color }}>
                              {payload[0].value}% of clients
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {clientData.map((item) => (
                <Badge key={item.name} variant="outline" className="flex items-center space-x-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}: {item.value}%</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Performance Bar Chart */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Weekly Task Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium mb-2">{label}</p>
                            {payload.map((item, index) => (
                              <p key={index} style={{ color: item.color }}>
                                {item.name}: {item.value}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="overdue" fill="#EF4444" name="Overdue" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}