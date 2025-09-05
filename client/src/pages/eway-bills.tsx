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
    // Redirect to actual government E-way Bill portal
    if (credentials.username && credentials.password) {
      // Open the official E-way Bill portal in the same window
      window.location.href = "https://ewaybillgst.gov.in/Login.aspx";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Government Emblem */}
              <div className="text-center mb-6">
                <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    GOI
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-700 mb-2">E - Waybill System</h1>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Field */}
                <div className="relative">
                  <div className="absolute left-0 top-0 w-12 h-12 bg-blue-400 flex items-center justify-center rounded-l">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="pl-14 h-12 border-2 border-blue-200 text-gray-600 placeholder-gray-400"
                    data-testid="input-username"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute left-0 top-0 w-12 h-12 bg-blue-400 flex items-center justify-center rounded-l">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-14 h-12 border-2 border-blue-200 text-gray-600 placeholder-gray-400"
                    data-testid="input-password"
                    required
                  />
                </div>

                {/* Captcha Field */}
                <div className="relative">
                  <div className="absolute left-0 top-0 w-12 h-12 bg-blue-400 flex items-center justify-center rounded-l">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter Captcha"
                        className="pl-14 h-12 border-2 border-blue-200 text-gray-600 placeholder-gray-400 rounded-r-none"
                        data-testid="input-captcha"
                        required
                      />
                    </div>
                    <div className="w-32 h-12 bg-gray-200 border-2 border-l-0 border-blue-200 flex items-center justify-center text-lg font-bold text-blue-800 rounded-r">
                      LF07LD
                    </div>
                    <button 
                      type="button" 
                      className="w-12 h-12 bg-blue-400 flex items-center justify-center border-2 border-l-0 border-blue-200 rounded-r"
                      data-testid="button-refresh-captcha"
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded"
                  data-testid="button-login"
                >
                  Login
                </Button>

                {/* Links */}
                <div className="flex justify-between text-sm pt-4">
                  <button 
                    type="button" 
                    onClick={() => window.open("https://ewaybillgst.gov.in/Registration.aspx", "_blank")}
                    className="text-blue-600 hover:text-blue-800"
                    data-testid="link-new-registration"
                  >
                    New Registration ?
                  </button>
                  <button 
                    type="button" 
                    onClick={() => window.open("https://ewaybillgst.gov.in/ForgotPassword.aspx", "_blank")}
                    className="text-blue-600 hover:text-blue-800"
                    data-testid="link-forgot-credentials"
                  >
                    Forgot Credentials ?
                  </button>
                </div>

                {/* Help Text */}
                <div className="text-center text-sm text-orange-600 pt-4">
                  If you are unable to Login, you can follow the steps given in this document.
                </div>

                {/* Note about portal connection */}
                <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-blue-50 rounded">
                  This will redirect you to the official Government E-way Bill portal (ewaybillgst.gov.in)
                </div>
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
