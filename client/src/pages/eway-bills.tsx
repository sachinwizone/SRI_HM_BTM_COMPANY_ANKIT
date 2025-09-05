import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, FileText, Search, Plus, RefreshCw, Download } from "lucide-react";

export default function ewaybillsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({
    gstin: "",
    username: "",
    password: ""
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Mock E-way bills data
  const eWayBills = [
    {
      id: "EWB001",
      ewayBillNo: "123456789012",
      documentNo: "INV-2024-001",
      fromGstin: "27AAACR0000A1Z5",
      toGstin: "33AAACR0000B2Y4",
      transporterGstin: "29AAACR0000C3X3",
      vehicleNo: "MH12AB1234",
      status: "ACTIVE",
      validUpto: "2024-01-15",
      distance: "250 KM",
      value: 125000
    },
    {
      id: "EWB002", 
      ewayBillNo: "123456789013",
      documentNo: "INV-2024-002",
      fromGstin: "27AAACR0000A1Z5",
      toGstin: "07AAACR0000D4W2",
      transporterGstin: "29AAACR0000C3X3",
      vehicleNo: "DL08CD5678",
      status: "EXPIRED",
      validUpto: "2024-01-10",
      distance: "180 KM",
      value: 87500
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    if (credentials.gstin && credentials.username && credentials.password) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCredentials({ gstin: "", username: "", password: "" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "EXPIRED":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E-way Bills</h1>
          <p className="text-gray-600 mt-1">E-way Bills management and tracking system</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">E-way Bill Portal Login</h3>
              <p className="text-gray-600">Enter your GST credentials to access E-way bills</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    type="text"
                    placeholder="Enter your GSTIN"
                    value={credentials.gstin}
                    onChange={(e) => setCredentials(prev => ({ ...prev, gstin: e.target.value }))}
                    data-testid="input-gstin"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    data-testid="input-username"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    data-testid="input-password"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-login"
                >
                  Login to E-way Bill Portal
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E-way Bills</h1>
          <p className="text-gray-600 mt-1">Manage and track your E-way bills</p>
        </div>
        <Button onClick={handleLogout} variant="outline" data-testid="button-logout">
          Logout
        </Button>
      </div>

      <Tabs defaultValue="ewayBills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ewayBills">E-way Bills</TabsTrigger>
          <TabsTrigger value="generate">Generate New</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="ewayBills" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">E-way Bills List</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search E-way bills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-ewayBills"
                    />
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-refresh">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-way Bill No.</TableHead>
                    <TableHead>Document No.</TableHead>
                    <TableHead>Vehicle No.</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valid Upto</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eWayBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.ewayBillNo}</TableCell>
                      <TableCell>{bill.documentNo}</TableCell>
                      <TableCell>{bill.vehicleNo}</TableCell>
                      <TableCell>{bill.distance}</TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell>{bill.validUpto}</TableCell>
                      <TableCell>₹{bill.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" data-testid={`button-view-${bill.id}`}>
                            <FileText className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-download-${bill.id}`}>
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Generate New E-way Bill</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fromGstin">From GSTIN</Label>
                    <Input id="fromGstin" placeholder="Enter From GSTIN" data-testid="input-from-gstin" />
                  </div>
                  <div>
                    <Label htmlFor="toGstin">To GSTIN</Label>
                    <Input id="toGstin" placeholder="Enter To GSTIN" data-testid="input-to-gstin" />
                  </div>
                  <div>
                    <Label htmlFor="transporterGstin">Transporter GSTIN</Label>
                    <Input id="transporterGstin" placeholder="Enter Transporter GSTIN" data-testid="input-transporter-gstin" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                    <Input id="vehicleNumber" placeholder="Enter Vehicle Number" data-testid="input-vehicle-number" />
                  </div>
                  <div>
                    <Label htmlFor="documentNumber">Document Number</Label>
                    <Input id="documentNumber" placeholder="Enter Invoice/Document Number" data-testid="input-document-number" />
                  </div>
                  <div>
                    <Label htmlFor="totalValue">Total Value</Label>
                    <Input id="totalValue" type="number" placeholder="Enter Total Value" data-testid="input-total-value" />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="bg-green-600 hover:bg-green-700" data-testid="button-generate-eway">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate E-way Bill
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">E-way Bill Reports</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Active E-way Bills</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">45</div>
                  <div className="text-sm text-gray-600">Completed This Month</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-sm text-gray-600">Expiring Soon</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" data-testid="button-export-pdf">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" data-testid="button-export-excel">
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
