import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Filter, AlertTriangle, Clock, CheckCircle } from "lucide-react";

export default function CreditPayments() {
  const [searchValue, setSearchValue] = useState("");
  const { data: allPayments, isLoading } = useQuery({
    queryKey: ['/api/payments'],
  });

  const { data: overduePayments } = useQuery({
    queryKey: ['/api/payments', { overdue: 'true' }],
  });

  const { data: dueSoonPayments } = useQuery({
    queryKey: ['/api/payments', { dueSoon: '7' }],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-success/10 text-success';
      case 'PENDING':
        return 'bg-warning/10 text-warning';
      case 'OVERDUE':
        return 'bg-error/10 text-error';
      case 'PARTIAL':
        return 'bg-info/10 text-info';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return CheckCircle;
      case 'PENDING':
        return Clock;
      case 'OVERDUE':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const stats = [
    {
      title: "Total Pending",
      value: `₹${allPayments?.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + parseInt(p.amount), 0).toLocaleString() || '0'}`,
      icon: Clock,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Overdue Payments",
      value: overduePayments?.length || 0,
      icon: AlertTriangle,
      color: "text-error bg-error/10"
    },
    {
      title: "Due This Week",
      value: dueSoonPayments?.length || 0,
      icon: Clock,
      color: "text-info bg-info/10"
    },
    {
      title: "Total Collected",
      value: `₹${allPayments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseInt(p.amount), 0).toLocaleString() || '0'}`,
      icon: CheckCircle,
      color: "text-success bg-success/10"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credit Payments</h1>
        <p className="text-gray-600 mt-1">Manage client payments and credit terms</p>
      </div>
      
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

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Management</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        type="text" 
                        placeholder="Search payments..." 
                        className="w-64 pl-10"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter size={16} className="mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Add Payment
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Payments Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Due Date</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Reminders Sent</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                          </tr>
                        ))
                      ) : !allPayments || allPayments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No payments found
                          </td>
                        </tr>
                      ) : (
                        allPayments.map((payment, index) => {
                          const StatusIcon = getStatusIcon(payment.status);
                          const isOverdue = new Date(payment.dueDate) < new Date() && payment.status === 'PENDING';
                          const actualStatus = isOverdue ? 'OVERDUE' : payment.status;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">Client</div>
                                <div className="text-sm text-gray-500">Payment #{payment.id.substring(0, 8)}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">
                                  ₹{parseInt(payment.amount).toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-900">
                                  {new Date(payment.dueDate).toLocaleDateString()}
                                </div>
                                {isOverdue && (
                                  <div className="text-xs text-error">
                                    Overdue by {Math.ceil((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={`${getStatusColor(actualStatus)} flex items-center w-fit`}>
                                  <StatusIcon size={12} className="mr-1" />
                                  {actualStatus}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-gray-900">{payment.remindersSent || 0}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    Send Reminder
                                  </Button>
                                  <Button variant="link" size="sm">
                                    View Details
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
    </div>
  );
}
