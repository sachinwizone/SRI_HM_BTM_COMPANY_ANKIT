import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  CreditCard, 
  Package, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Building
} from "lucide-react";
import { format } from "date-fns";

interface Client360ViewProps {
  clientId: string;
  onClose: () => void;
}

export function Client360View({ clientId, onClose }: Client360ViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: client } = useQuery({
    queryKey: ["/api/clients", clientId],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders", { clientId }],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/payments", { clientId }],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", { clientId }],
  });

  const { data: followUps = [] } = useQuery({
    queryKey: ["/api/follow-ups", { clientId }],
  });

  if (!client) {
    return <div className="p-6">Loading client details...</div>;
  }

  const totalOrderValue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount || 0), 0);
  const pendingPayments = payments.filter((p: any) => p.status === 'PENDING').length;
  const completedTasks = tasks.filter((t: any) => t.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{client.name}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`
                ${client.category === 'ALFA' ? 'border-green-500 text-green-700' : ''}
                ${client.category === 'BETA' ? 'border-yellow-500 text-yellow-700' : ''}
                ${client.category === 'GAMMA' ? 'border-orange-500 text-orange-700' : ''}
                ${client.category === 'DELTA' ? 'border-red-500 text-red-700' : ''}
              `}>
                {client.category}
              </Badge>
              <span className="text-sm text-muted-foreground">{client.companyType}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Order Value</p>
                <p className="text-2xl font-bold">₹{totalOrderValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{client.contactPersonName || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.mobileNumber || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{client.address || 'Not specified'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">GST Number:</span>
                  <p className="font-medium">{client.gstNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">PAN Number:</span>
                  <p className="font-medium">{client.panNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Company Type:</span>
                  <p className="font-medium">{client.companyType || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Credit Limit:</span>
                  <p className="font-medium">₹{parseFloat(client.creditLimit || '0').toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderDate ? format(new Date(order.orderDate), "MMM dd, yyyy") : "No date"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{parseFloat(order.totalAmount || 0).toLocaleString()}</p>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Payment #{payment.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.dueDate ? format(new Date(payment.dueDate), "MMM dd, yyyy") : "No due date"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{parseFloat(payment.amount || 0).toLocaleString()}</p>
                      <Badge variant={payment.status === 'PAID' ? 'default' : 'destructive'}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Related Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={task.isCompleted ? 'default' : 'secondary'}>
                        {task.isCompleted ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followUps.slice(0, 5).map((followUp: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        {followUp.followUpDate ? format(new Date(followUp.followUpDate), "MMM dd, yyyy") : "No date"}
                      </p>
                      <Badge variant="outline">{followUp.status}</Badge>
                    </div>
                    <p className="text-sm">{followUp.remarks}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}