import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusIcon, FileTextIcon, ShoppingCartIcon, TruckIcon, PackageIcon, UsersIcon, BuildingIcon, ReceiptIcon, CreditCardIcon, BarChart3Icon } from 'lucide-react';

// Import sub-components (we'll create these next)
import InvoiceManagement from '@/components/InvoiceManagement';
import PurchaseManagement from '@/components/PurchaseManagement';
import MasterDataManagement from '@/components/MasterDataManagement';
import ReportsManagement from '@/components/ReportsManagement';

export default function SalesOperations() {
  const [activeTab, setActiveTab] = useState('invoices');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Operations</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive invoice management, purchase operations, and business reporting
          </p>
        </div>
        
        <div className="flex gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            GST Compliant
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            e-Invoice Ready
          </Badge>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sales Invoices</p>
                <p className="text-2xl font-bold">₹2,45,670</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Orders</p>
                <p className="text-2xl font-bold">₹1,88,420</p>
                <p className="text-xs text-red-600">-3% from last month</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCartIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold">₹67,890</p>
                <p className="text-xs text-yellow-600">15 invoices overdue</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Parties</p>
                <p className="text-2xl font-bold">147</p>
                <p className="text-xs text-blue-600">23 customers, 12 suppliers</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 px-6 pt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="invoices" className="flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  Invoice Management
                </TabsTrigger>
                <TabsTrigger value="purchase" className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-4 w-4" />
                  Purchase Management
                </TabsTrigger>
                <TabsTrigger value="master-data" className="flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4" />
                  Master Data
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart3Icon className="h-4 w-4" />
                  Reports & Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Invoice Management Tab */}
            <TabsContent value="invoices" className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Invoice Management</h2>
                  <p className="text-gray-600">Create, manage, and track sales invoices with GST compliance</p>
                </div>
                <Button className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Create Sales Invoice
                </Button>
              </div>
              <InvoiceManagement />
            </TabsContent>

            {/* Purchase Management Tab */}
            <TabsContent value="purchase" className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Purchase Management</h2>
                  <p className="text-gray-600">Handle purchase invoices, GRN, and supplier management</p>
                </div>
                <Button className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Create Purchase Invoice
                </Button>
              </div>
              <PurchaseManagement />
            </TabsContent>

            {/* Master Data Tab */}
            <TabsContent value="master-data" className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Master Data Management</h2>
                <p className="text-gray-600">Manage parties, products, transporters, and company details</p>
              </div>
              <MasterDataManagement />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
                <p className="text-gray-600">Generate comprehensive business reports and analytics</p>
              </div>
              <ReportsManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('invoices')}>
              <ReceiptIcon className="h-6 w-6" />
              <span className="text-sm">New Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('purchase')}>
              <PackageIcon className="h-6 w-6" />
              <span className="text-sm">Record Purchase</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('master-data')}>
              <UsersIcon className="h-6 w-6" />
              <span className="text-sm">Add Party</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('reports')}>
              <BarChart3Icon className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
