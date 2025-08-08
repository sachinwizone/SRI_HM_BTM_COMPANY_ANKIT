import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, Download, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TallyCompany {
  name: string;
  guid: string;
  startDate: string;
  endDate: string;
}

interface TallySyncStatus {
  isConnected: boolean;
  lastSync: string | null;
  syncedRecords: number;
  status: string;
}

export default function TallyIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  // Fetch Tally connection status
  const { data: tallyStatus, isLoading: statusLoading } = useQuery<TallySyncStatus>({
    queryKey: ['/api/tally-sync/sync/status'],
    refetchInterval: 5000
  });

  // Test Tally connection
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/tally-sync/test-connection', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://localhost:9000' })
      });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({ title: "Success", description: "Tally Gateway connection successful!" });
      } else {
        toast({ title: "Connection Failed", description: data.message, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ 
        title: "Connection Error", 
        description: "Cannot reach Tally Gateway. Ensure Tally is running with Gateway enabled on port 9000.",
        variant: "destructive" 
      });
    }
  });

  // Fetch companies from Tally
  const { data: companiesData, isLoading: companiesLoading, refetch: refetchCompanies } = useQuery<{companies: TallyCompany[]}>({
    queryKey: ['/api/tally-sync/companies'],
    enabled: false // Manual trigger only
  });

  // Refresh companies
  const refreshCompaniesMutation = useMutation({
    mutationFn: async () => {
      const result = await refetchCompanies();
      return result.data;
    },
    onSuccess: (data: any) => {
      if (data?.companies?.length > 0) {
        toast({ 
          title: "Companies Loaded", 
          description: `Found ${data.companies.length} companies in Tally` 
        });
      } else {
        toast({ 
          title: "No Companies", 
          description: "No companies found in Tally. Please load a company in Tally ERP.",
          variant: "destructive" 
        });
      }
    },
    onError: () => {
      toast({ 
        title: "Fetch Failed", 
        description: "Could not fetch companies from Tally Gateway.",
        variant: "destructive" 
      });
    }
  });

  // Sync real data
  const syncDataMutation = useMutation({
    mutationFn: async (companyName: string) => {
      return apiRequest(`/api/tally-sync/sync/real-data/${encodeURIComponent(companyName)}`, {
        method: 'POST',
        body: JSON.stringify({ dataTypes: ['ledgers', 'vouchers'] })
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tally-sync/sync/status'] });
      toast({ 
        title: "Sync Complete", 
        description: `Synced ${data.results?.processed || 0} records from ${selectedCompany}` 
      });
    },
    onError: () => {
      toast({ 
        title: "Sync Failed", 
        description: "Could not sync data from Tally.",
        variant: "destructive" 
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tally ERP Integration</h1>
          <p className="text-muted-foreground">
            Real-time data synchronization with your Tally ERP system
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(tallyStatus?.isConnected || false)}
            Connection Status
          </CardTitle>
          <CardDescription>
            Current status of Tally Gateway connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Tally Gateway</div>
              <div className="text-sm text-muted-foreground">http://localhost:9000</div>
            </div>
            <Badge variant={tallyStatus?.isConnected ? "default" : "secondary"}>
              {tallyStatus?.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Last Sync</div>
              <div className="text-sm text-muted-foreground">
                {tallyStatus?.lastSync ? new Date(tallyStatus.lastSync).toLocaleString() : "Never"}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{tallyStatus?.syncedRecords || 0}</div>
              <div className="text-sm text-muted-foreground">Records Synced</div>
            </div>
          </div>

          <Separator />
          
          <Button 
            onClick={() => testConnectionMutation.mutate()} 
            disabled={testConnectionMutation.isPending}
            className="w-full"
          >
            {testConnectionMutation.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-4 w-4" />
                Test Tally Connection
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Company Management */}
      <Card>
        <CardHeader>
          <CardTitle>Company Management</CardTitle>
          <CardDescription>
            Fetch and manage companies from your Tally ERP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => refreshCompaniesMutation.mutate()} 
            disabled={refreshCompaniesMutation.isPending}
            className="w-full"
          >
            {refreshCompaniesMutation.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Fetching Companies...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Refresh Companies from Tally
              </>
            )}
          </Button>

          {companiesData?.companies && companiesData.companies.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Available Companies:</h4>
              {companiesData.companies.map((company) => (
                <div 
                  key={company.guid}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCompany === company.name 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedCompany(company.name)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {company.startDate} to {company.endDate}
                      </div>
                    </div>
                    {selectedCompany === company.name && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Synchronization */}
      {selectedCompany && (
        <Card>
          <CardHeader>
            <CardTitle>Data Synchronization</CardTitle>
            <CardDescription>
              Sync real data from {selectedCompany} to cloud database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will sync ledgers (clients) and vouchers (payments) from your Tally company to the cloud database.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => syncDataMutation.mutate(selectedCompany)} 
              disabled={syncDataMutation.isPending}
              className="w-full"
              size="lg"
            >
              {syncDataMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Syncing Data from {selectedCompany}...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Real Data from {selectedCompany}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help & Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to enable Tally Gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="font-medium">1.</span>
              Open Tally ERP and load your company
            </li>
            <li className="flex gap-2">
              <span className="font-medium">2.</span>
              Press F12 → Advanced Configuration → Gateway Settings
            </li>
            <li className="flex gap-2">
              <span className="font-medium">3.</span>
              Enable Gateway and set port to 9000
            </li>
            <li className="flex gap-2">
              <span className="font-medium">4.</span>
              Keep Tally running and test the connection above
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}