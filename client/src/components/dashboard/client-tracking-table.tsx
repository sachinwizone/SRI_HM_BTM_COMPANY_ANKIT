import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";

export default function ClientTrackingTable() {
  const [showFilters, setShowFilters] = useState(false);
  const { data: trackingData, isLoading } = useQuery({
    queryKey: ['/api/client-tracking'],
  });

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'bg-success/10 text-success';
      case 'LOADING':
        return 'bg-warning/10 text-warning';
      case 'DELIVERED':
        return 'bg-info/10 text-info';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'LOADING':
        return 'Loading';
      case 'DELIVERED':
        return 'Delivered';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-4 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">Live Client Tracking</h3>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleFilterClick} data-testid="button-filter-tracking">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Filter'}
          </Button>
          <Link href="/client-tracking">
            <Button size="sm" data-testid="button-add-tracking">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Tracking
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600">Filter options: Status, Location, Date range</p>
            <p className="text-xs text-gray-500 mt-1">Advanced filtering available in the full Client Tracking page</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3">Client</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Current Location</th>
                <th className="pb-3">Delivery Timeline</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!trackingData || trackingData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No tracking data available
                  </td>
                </tr>
              ) : (
                trackingData.slice(0, 2).map((tracking, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {tracking.clientId?.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Client</p>
                          <p className="text-sm text-gray-500">Category</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">{tracking.vehicleNumber}</p>
                        <p className="text-sm text-gray-500">Driver: {tracking.driverName}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-primary" size={16} />
                        <div>
                          <p className="font-medium text-gray-900">{tracking.currentLocation}</p>
                          <p className="text-sm text-gray-500">
                            {tracking.distanceRemaining}km from destination
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {tracking.estimatedArrival 
                            ? new Date(tracking.estimatedArrival).toLocaleDateString()
                            : 'TBD'
                          }
                        </p>
                        <p className="text-sm text-gray-500">Expected delivery</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge className={getStatusColor(tracking.status)}>
                        {getStatusText(tracking.status)}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Link href={`/client-tracking?id=${tracking.id}`}>
                        <Button variant="link" size="sm" className="text-primary hover:text-primary/80" data-testid={`button-track-${index}`}>
                          <Eye size={16} className="mr-1" />
                          Track
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
