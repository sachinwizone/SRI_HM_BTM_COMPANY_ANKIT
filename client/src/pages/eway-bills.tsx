import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Truck, FileText, Search, Plus, RefreshCw, Download, Globe, User, Lock, Eye, Home, BarChart3, Settings, Bell, MapPin, Calendar, Printer } from "lucide-react";

export default function ewaybillsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({
    gstin: "",
    username: "",
    password: "",
    captcha: ""
  });

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [newEwayBill, setNewEwayBill] = useState({
    documentType: "",
    documentNumber: "",
    documentDate: "",
    fromGstin: "",
    fromTradeName: "",
    fromAddress: "",
    fromPincode: "",
    fromState: "",
    toGstin: "",
    toTradeName: "",
    toAddress: "",
    toPincode: "",
    toState: "",
    transporterGstin: "",
    transporterName: "",
    vehicleNumber: "",
    transportMode: "",
    distance: "",
    totalValue: "",
    totalTaxableAmount: "",
    cgstAmount: "",
    sgstAmount: "",
    igstAmount: "",
    cessAmount: "",
    otherAmount: "",
    totalInvoiceValue: "",
    itemDescription: "",
    hsnCode: "",
    quantity: "",
    unit: "",
    rate: "",
    taxableValue: ""
  });

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
    // Internal login - no external redirect
    if (credentials.username && credentials.password && credentials.captcha) {
      setIsLoggedIn(true);
      setCurrentPage("dashboard");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCredentials({ gstin: "", username: "", password: "", captcha: "" });
    setCurrentPage("dashboard");
  };

  const generateEwayBill = () => {
    // Generate E-way bill number
    const ewayBillNumber = "EWB" + Date.now().toString().slice(-10);
    
    // Add to existing bills (simulate creation)
    const newBill = {
      id: "EWB" + (eWayBills.length + 1).toString().padStart(3, '0'),
      ewayBillNo: ewayBillNumber,
      documentNo: newEwayBill.documentNumber,
      fromGstin: newEwayBill.fromGstin,
      toGstin: newEwayBill.toGstin,
      transporterGstin: newEwayBill.transporterGstin,
      vehicleNo: newEwayBill.vehicleNumber,
      status: "ACTIVE",
      validUpto: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
      distance: newEwayBill.distance + " KM",
      value: parseFloat(newEwayBill.totalInvoiceValue) || 0
    };
    
    eWayBills.push(newBill);
    setCurrentPage("view-bills");
    
    // Reset form
    setNewEwayBill({
      documentType: "",
      documentNumber: "",
      documentDate: "",
      fromGstin: "",
      fromTradeName: "",
      fromAddress: "",
      fromPincode: "",
      fromState: "",
      toGstin: "",
      toTradeName: "",
      toAddress: "",
      toPincode: "",
      toState: "",
      transporterGstin: "",
      transporterName: "",
      vehicleNumber: "",
      transportMode: "",
      distance: "",
      totalValue: "",
      totalTaxableAmount: "",
      cgstAmount: "",
      sgstAmount: "",
      igstAmount: "",
      cessAmount: "",
      otherAmount: "",
      totalInvoiceValue: "",
      itemDescription: "",
      hsnCode: "",
      quantity: "",
      unit: "",
      rate: "",
      taxableValue: ""
    });
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
                        value={credentials.captcha}
                        onChange={(e) => setCredentials(prev => ({ ...prev, captcha: e.target.value }))}
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
                    className="text-blue-600 hover:text-blue-800"
                    data-testid="link-new-registration"
                  >
                    New Registration ?
                  </button>
                  <button 
                    type="button" 
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

                {/* Note about internal system */}
                <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-blue-50 rounded">
                  Internal E-way Bill Management System - All data captured and managed locally
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar - Government Portal Style */}
      <div className="bg-blue-600 text-white p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Globe className="w-6 h-6" />
            <span className="font-semibold">E-Waybill System - Government of India</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {credentials.username}</span>
            <Button onClick={handleLogout} variant="outline" size="sm" className="bg-white text-blue-600 border-white hover:bg-gray-100" data-testid="button-logout">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-blue-500 text-white p-2">
        <div className="flex gap-6">
          <button 
            onClick={() => setCurrentPage("dashboard")}
            className={`flex items-center gap-2 px-3 py-2 rounded ${currentPage === "dashboard" ? "bg-blue-700" : "hover:bg-blue-600"}`}
            data-testid="nav-dashboard"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage("generate")}
            className={`flex items-center gap-2 px-3 py-2 rounded ${currentPage === "generate" ? "bg-blue-700" : "hover:bg-blue-600"}`}
            data-testid="nav-generate"
          >
            <Plus className="w-4 h-4" />
            Generate E-way Bill
          </button>
          <button 
            onClick={() => setCurrentPage("view-bills")}
            className={`flex items-center gap-2 px-3 py-2 rounded ${currentPage === "view-bills" ? "bg-blue-700" : "hover:bg-blue-600"}`}
            data-testid="nav-view-bills"
          >
            <FileText className="w-4 h-4" />
            View E-way Bills
          </button>
          <button 
            onClick={() => setCurrentPage("track")}
            className={`flex items-center gap-2 px-3 py-2 rounded ${currentPage === "track" ? "bg-blue-700" : "hover:bg-blue-600"}`}
            data-testid="nav-track"
          >
            <MapPin className="w-4 h-4" />
            Track E-way Bill
          </button>
          <button 
            onClick={() => setCurrentPage("reports")}
            className={`flex items-center gap-2 px-3 py-2 rounded ${currentPage === "reports" ? "bg-blue-700" : "hover:bg-blue-600"}`}
            data-testid="nav-reports"
          >
            <BarChart3 className="w-4 h-4" />
            Reports
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {currentPage === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">E-way Bill Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{eWayBills.filter(b => b.status === "ACTIVE").length}</div>
                  <div className="text-sm text-gray-600">Active E-way Bills</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{eWayBills.length}</div>
                  <div className="text-sm text-gray-600">Total Generated</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{eWayBills.filter(b => b.status === "EXPIRED").length}</div>
                  <div className="text-sm text-gray-600">Expired</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">₹{eWayBills.reduce((sum, bill) => sum + bill.value, 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Recent E-way Bills</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eWayBills.slice(0, 5).map((bill) => (
                      <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{bill.ewayBillNo}</div>
                          <div className="text-sm text-gray-600">{bill.documentNo}</div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(bill.status)}
                          <div className="text-sm text-gray-600">₹{bill.value.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button onClick={() => setCurrentPage("generate")} className="w-full justify-start bg-blue-600 hover:bg-blue-700" data-testid="quick-generate">
                      <Plus className="w-4 h-4 mr-2" />
                      Generate New E-way Bill
                    </Button>
                    <Button onClick={() => setCurrentPage("view-bills")} variant="outline" className="w-full justify-start" data-testid="quick-view">
                      <FileText className="w-4 h-4 mr-2" />
                      View All E-way Bills
                    </Button>
                    <Button onClick={() => setCurrentPage("track")} variant="outline" className="w-full justify-start" data-testid="quick-track">
                      <MapPin className="w-4 h-4 mr-2" />
                      Track E-way Bill
                    </Button>
                    <Button onClick={() => setCurrentPage("reports")} variant="outline" className="w-full justify-start" data-testid="quick-reports">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentPage === "generate" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Generate E-way Bill</h1>
            
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">E-way Bill Generation Form</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Document Details</h4>
                    <div>
                      <Label htmlFor="documentType">Document Type</Label>
                      <Select value={newEwayBill.documentType} onValueChange={(value) => setNewEwayBill(prev => ({ ...prev, documentType: value }))}>
                        <SelectTrigger data-testid="select-document-type">
                          <SelectValue placeholder="Select Document Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="delivery-challan">Delivery Challan</SelectItem>
                          <SelectItem value="bill-of-supply">Bill of Supply</SelectItem>
                          <SelectItem value="credit-note">Credit Note</SelectItem>
                          <SelectItem value="debit-note">Debit Note</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="documentNumber">Document Number</Label>
                      <Input 
                        id="documentNumber" 
                        value={newEwayBill.documentNumber}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, documentNumber: e.target.value }))}
                        placeholder="Enter Document Number" 
                        data-testid="input-document-number" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentDate">Document Date</Label>
                      <Input 
                        id="documentDate" 
                        type="date"
                        value={newEwayBill.documentDate}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, documentDate: e.target.value }))}
                        data-testid="input-document-date" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Supplier Details</h4>
                    <div>
                      <Label htmlFor="fromGstin">From GSTIN</Label>
                      <Input 
                        id="fromGstin" 
                        value={newEwayBill.fromGstin}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, fromGstin: e.target.value }))}
                        placeholder="Enter From GSTIN" 
                        data-testid="input-from-gstin" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromTradeName">From Trade Name</Label>
                      <Input 
                        id="fromTradeName" 
                        value={newEwayBill.fromTradeName}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, fromTradeName: e.target.value }))}
                        placeholder="Enter From Trade Name" 
                        data-testid="input-from-trade-name" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromAddress">From Address</Label>
                      <Textarea 
                        id="fromAddress" 
                        value={newEwayBill.fromAddress}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, fromAddress: e.target.value }))}
                        placeholder="Enter From Address" 
                        data-testid="textarea-from-address" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Recipient Details</h4>
                    <div>
                      <Label htmlFor="toGstin">To GSTIN</Label>
                      <Input 
                        id="toGstin" 
                        value={newEwayBill.toGstin}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, toGstin: e.target.value }))}
                        placeholder="Enter To GSTIN" 
                        data-testid="input-to-gstin" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="toTradeName">To Trade Name</Label>
                      <Input 
                        id="toTradeName" 
                        value={newEwayBill.toTradeName}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, toTradeName: e.target.value }))}
                        placeholder="Enter To Trade Name" 
                        data-testid="input-to-trade-name" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Transport Details</h4>
                    <div>
                      <Label htmlFor="transporterGstin">Transporter GSTIN</Label>
                      <Input 
                        id="transporterGstin" 
                        value={newEwayBill.transporterGstin}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, transporterGstin: e.target.value }))}
                        placeholder="Enter Transporter GSTIN" 
                        data-testid="input-transporter-gstin" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                      <Input 
                        id="vehicleNumber" 
                        value={newEwayBill.vehicleNumber}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                        placeholder="Enter Vehicle Number" 
                        data-testid="input-vehicle-number" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="distance">Distance (KM)</Label>
                      <Input 
                        id="distance" 
                        type="number"
                        value={newEwayBill.distance}
                        onChange={(e) => setNewEwayBill(prev => ({ ...prev, distance: e.target.value }))}
                        placeholder="Enter Distance" 
                        data-testid="input-distance" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div>
                    <Label htmlFor="totalTaxableAmount">Total Taxable Amount</Label>
                    <Input 
                      id="totalTaxableAmount" 
                      type="number"
                      value={newEwayBill.totalTaxableAmount}
                      onChange={(e) => setNewEwayBill(prev => ({ ...prev, totalTaxableAmount: e.target.value }))}
                      placeholder="Enter Taxable Amount" 
                      data-testid="input-taxable-amount" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="cgstAmount">CGST Amount</Label>
                    <Input 
                      id="cgstAmount" 
                      type="number"
                      value={newEwayBill.cgstAmount}
                      onChange={(e) => setNewEwayBill(prev => ({ ...prev, cgstAmount: e.target.value }))}
                      placeholder="Enter CGST Amount" 
                      data-testid="input-cgst-amount" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="sgstAmount">SGST Amount</Label>
                    <Input 
                      id="sgstAmount" 
                      type="number"
                      value={newEwayBill.sgstAmount}
                      onChange={(e) => setNewEwayBill(prev => ({ ...prev, sgstAmount: e.target.value }))}
                      placeholder="Enter SGST Amount" 
                      data-testid="input-sgst-amount" 
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Button onClick={generateEwayBill} className="bg-green-600 hover:bg-green-700" data-testid="button-generate-eway">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate E-way Bill
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPage("dashboard")} data-testid="button-cancel">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === "view-bills" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">View E-way Bills</h1>
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
            
            <Card>
              <CardContent className="p-0">
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
                            <Button variant="outline" size="sm" data-testid={`button-print-${bill.id}`}>
                              <Printer className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === "track" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Track E-way Bill</h1>
            
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Track E-way Bill Status</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trackEwayBillNo">E-way Bill Number</Label>
                    <Input id="trackEwayBillNo" placeholder="Enter E-way Bill Number" data-testid="input-track-eway-number" />
                  </div>
                  <div>
                    <Label htmlFor="trackDocumentNo">Document Number</Label>
                    <Input id="trackDocumentNo" placeholder="Enter Document Number" data-testid="input-track-document-number" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-track">
                    <MapPin className="w-4 h-4 mr-2" />
                    Track E-way Bill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === "reports" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">E-way Bill Reports</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{eWayBills.filter(b => b.status === "ACTIVE").length}</div>
                  <div className="text-sm text-gray-600">Active E-way Bills</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{eWayBills.length}</div>
                  <div className="text-sm text-gray-600">Generated This Month</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{eWayBills.filter(b => b.status === "EXPIRED").length}</div>
                  <div className="text-sm text-gray-600">Expiring Soon</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Export Reports</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportFromDate">From Date</Label>
                    <Input id="reportFromDate" type="date" data-testid="input-report-from-date" />
                  </div>
                  <div>
                    <Label htmlFor="reportToDate">To Date</Label>
                    <Input id="reportToDate" type="date" data-testid="input-report-to-date" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" data-testid="button-export-pdf">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" data-testid="button-export-excel">
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button variant="outline" data-testid="button-export-csv">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
