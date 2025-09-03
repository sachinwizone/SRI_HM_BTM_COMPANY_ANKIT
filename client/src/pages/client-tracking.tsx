import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, MapPin, Truck, Clock, Navigation } from "lucide-react";

export default function ClientTracking() {
  const [searchValue, setSearchValue] = useState("");
  const { data: trackingData, isLoading } = useQuery({
    queryKey: ["/api/client-tracking"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LOADING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: "In Transit",
      value: trackingData?.filter((t: any) => t.status === 'IN_TRANSIT').length || 0,
      icon: Truck,
      color: "text-success bg-success/10"
    },
    {
      title: "Loading",
      value: trackingData?.filter((t: any) => t.status === 'LOADING').length || 0,
      icon: Clock,
      color: "text-warning bg-warning/10"
    },
    {
      title: "Delivered Today",
      value: trackingData?.filter((t: any) => t.status === 'DELIVERED' && 
        new Date(t.lastUpdated).toDateString() === new Date().toDateString()).length || 0,
      icon: MapPin,
      color: "text-info bg-info/10"
    },
    {
      title: "Total Shipments",
      value: trackingData?.length || 0,
      icon: Navigation,
      color: "text-primary bg-primary/10"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Tracking</h1>
        <p className="text-gray-600 mt-1">Track vehicle locations and delivery timelines</p>
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

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Live Tracking</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  type="text" 
                  placeholder="Search by vehicle or location..." 
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
                Add Tracking
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tracking Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Current Location</th>
                  <th className="px-6 py-3">Destination</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Last Updated</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                    </tr>
                  ))
                ) : !trackingData || trackingData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>No tracking data available</p>
                      <p className="text-sm mt-2">Add vehicle tracking to get started</p>
                    </td>
                  </tr>
                ) : (
                  trackingData.map((tracking: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tracking.clientName || 'Client'}</div>
                        <div className="text-sm text-gray-500">Order: {tracking.orderId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tracking.vehicleNumber}</div>
                        <div className="text-sm text-gray-500">Driver: {tracking.driverName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="text-primary" size={16} />
                          <span className="text-gray-900">{tracking.currentLocation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{tracking.destinationLocation}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(tracking.status)}>
                          {tracking.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">
                          {new Date(tracking.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(tracking.lastUpdated).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="link" size="sm" className="text-primary">
                          <MapPin size={16} className="mr-1" />
                          Track
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}