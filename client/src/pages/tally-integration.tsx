import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Database, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Server,
  Link,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TallyConfig {
  tallyUrl: string;
  companyName: string;
  webApiUrl: string;
  syncMode: 'realtime' | 'scheduled';
  syncInterval: number;
  autoStart: boolean;
  dataTypes: string[];
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: string;
  totalRecords: number;
  syncedRecords: number;
  errors: number;
  status: 'idle' | 'syncing' | 'error' | 'success';
}

interface TallyCompany {
  name: string;
  guid: string;
  startDate: string;
  endDate: string;
}

export default function TallyIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<TallyConfig>({
    tallyUrl: 'http://localhost:9000',
    companyName: '',
    webApiUrl: window.location.origin,
    syncMode: 'scheduled',
    syncInterval: 30,
    autoStart: false,
    dataTypes: ['ledgers', 'vouchers', 'stock']
  });

  const [testResults, setTestResults] = useState<{
    tally: boolean | null;
    webApi: boolean | null;
    company: boolean | null;
  }>({
    tally: null,
    webApi: null,
    company: null
  });

  // Fetch current sync status
  const { data: syncStatus, isLoading: statusLoading } = useQuery<SyncStatus>({
    queryKey: ['/api/tally-sync/sync/status'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch available companies from Tally
  const { data: companies, isLoading: companiesLoading } = useQuery<TallyCompany[]>({
    queryKey: ['/api/tally-sync/companies'],
    enabled: !!config.tallyUrl,
  });

  // Test Tally connection
  const testTallyConnection = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tally-sync/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: config.tallyUrl })
      });
      if (!response.ok) throw new Error('Connection failed');
      return response.json();
    },
    onSuccess: () => {
      setTestResults(prev => ({ ...prev, tally: true }));
      toast({ title: "Success", description: "Tally connection successful!" });
      queryClient.invalidateQueries({ queryKey: ['/api/tally-sync/companies'] });
    },
    onError: () => {
      setTestResults(prev => ({ ...prev, tally: false }));
      toast({ title: "Error", description: "Failed to connect to Tally ERP", variant: "destructive" });
    }
  });

  // Test Web API connection
  const testWebApiConnection = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tally-sync/health');
      if (!response.ok) throw new Error('API connection failed');
      return response.json();
    },
    onSuccess: () => {
      setTestResults(prev => ({ ...prev, webApi: true }));
      toast({ title: "Success", description: "Web API connection successful!" });
    },
    onError: () => {
      setTestResults(prev => ({ ...prev, webApi: false }));
      toast({ title: "Error", description: "Failed to connect to Web API", variant: "destructive" });
    }
  });

  // Test company access
  const testCompanyAccess = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tally-sync/test-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: config.tallyUrl,
          company: config.companyName 
        })
      });
      if (!response.ok) throw new Error('Company access failed');
      return response.json();
    },
    onSuccess: () => {
      setTestResults(prev => ({ ...prev, company: true }));
      toast({ title: "Success", description: "Company access verified!" });
    },
    onError: () => {
      setTestResults(prev => ({ ...prev, company: false }));
      toast({ title: "Error", description: "Failed to access company data", variant: "destructive" });
    }
  });

  // Save configuration
  const saveConfig = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tally-sync/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to save configuration');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Configuration saved successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
    }
  });

  // Start/Stop sync
  const toggleSync = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      const response = await fetch(`/api/tally-sync/sync/${action}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`Failed to ${action} sync`);
      return response.json();
    },
    onSuccess: (_, action) => {
      toast({ title: "Success", description: `Sync ${action === 'start' ? 'started' : 'stopped'} successfully!` });
      queryClient.invalidateQueries({ queryKey: ['/api/tally-sync/sync/status'] });
    },
    onError: (_, action) => {
      toast({ title: "Error", description: `Failed to ${action} sync`, variant: "destructive" });
    }
  });

  // Manual sync trigger
  const triggerManualSync = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tally-sync/sync/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataTypes: config.dataTypes })
      });
      if (!response.ok) throw new Error('Manual sync failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Manual sync started!" });
      queryClient.invalidateQueries({ queryKey: ['/api/tally-sync/sync/status'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start manual sync", variant: "destructive" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tally ERP Integration</h1>
          <p className="text-muted-foreground">
            Configure and manage Tally ERP data synchronization
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus && (
            <Badge variant={syncStatus.status === 'success' ? 'default' : 'secondary'}>
              <Activity className="h-3 w-3 mr-1" />
              {syncStatus.status}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="status">Sync Status</TabsTrigger>
          <TabsTrigger value="data-mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tally Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Tally ERP Settings
                </CardTitle>
                <CardDescription>
                  Configure connection to your Tally ERP system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tallyUrl">Tally Gateway URL</Label>
                  <Input
                    id="tallyUrl"
                    value={config.tallyUrl}
                    onChange={(e) => setConfig({ ...config, tallyUrl: e.target.value })}
                    placeholder="http://localhost:9000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Default Tally Gateway port is 9000
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Select
                    value={config.companyName}
                    onValueChange={(value) => setConfig({ ...config, companyName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company from Tally" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.guid} value={company.name}>
                          {company.name}
                        </SelectItem>
                      )) || (
                        <SelectItem value="no-companies" disabled>
                          Connect to Tally first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => testTallyConnection.mutate()}
                    disabled={testTallyConnection.isPending}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    {testTallyConnection.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Link className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  {testResults.tally !== null && (
                    <div className={`flex items-center ${testResults.tally ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.tally ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Web API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Web API Settings
                </CardTitle>
                <CardDescription>
                  Configure connection to business management system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webApiUrl">Web API URL</Label>
                  <Input
                    id="webApiUrl"
                    value={config.webApiUrl}
                    onChange={(e) => setConfig({ ...config, webApiUrl: e.target.value })}
                    placeholder="https://your-domain.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL of your business management system
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => testWebApiConnection.mutate()}
                    disabled={testWebApiConnection.isPending}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    {testWebApiConnection.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Server className="h-4 w-4 mr-2" />
                    )}
                    Test API
                  </Button>
                  {testResults.webApi !== null && (
                    <div className={`flex items-center ${testResults.webApi ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults.webApi ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Synchronization Settings
              </CardTitle>
              <CardDescription>
                Configure how and when data should be synchronized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sync Mode</Label>
                    <Select
                      value={config.syncMode}
                      onValueChange={(value: 'realtime' | 'scheduled') => 
                        setConfig({ ...config, syncMode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time Sync</SelectItem>
                        <SelectItem value="scheduled">Scheduled Sync</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.syncMode === 'scheduled' && (
                    <div className="space-y-2">
                      <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                      <Input
                        id="syncInterval"
                        type="number"
                        value={config.syncInterval}
                        onChange={(e) => setConfig({ ...config, syncInterval: parseInt(e.target.value) || 30 })}
                        min="5"
                        max="1440"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Types to Sync</Label>
                    <div className="space-y-2">
                      {[
                        { id: 'ledgers', label: 'Ledgers (Clients/Customers)' },
                        { id: 'vouchers', label: 'Vouchers (Sales/Purchase)' },
                        { id: 'stock', label: 'Stock Items' },
                        { id: 'payments', label: 'Payment Entries' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Switch
                            id={item.id}
                            checked={config.dataTypes.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setConfig({ 
                                  ...config, 
                                  dataTypes: [...config.dataTypes, item.id] 
                                });
                              } else {
                                setConfig({ 
                                  ...config, 
                                  dataTypes: config.dataTypes.filter(type => type !== item.id) 
                                });
                              }
                            }}
                          />
                          <Label htmlFor={item.id}>{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoStart"
                      checked={config.autoStart}
                      onCheckedChange={(checked) => setConfig({ ...config, autoStart: checked })}
                    />
                    <Label htmlFor="autoStart">Auto-start sync on application startup</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={() => saveConfig.mutate()}
                  disabled={saveConfig.isPending}
                  className="flex-1"
                >
                  {saveConfig.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Save Configuration
                </Button>
                
                {config.companyName && (
                  <Button
                    onClick={() => testCompanyAccess.mutate()}
                    disabled={testCompanyAccess.isPending}
                    variant="outline"
                  >
                    {testCompanyAccess.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Database className="h-4 w-4 mr-2" />
                    )}
                    Test Company Access
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tally ERP</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={syncStatus?.isConnected ? 'default' : 'destructive'}>
                        {syncStatus?.isConnected ? '🟢 Real Connection' : '🔴 Not Connected'}
                      </Badge>
                      {!syncStatus?.isConnected && (
                        <span className="text-xs text-muted-foreground">(Port 9000)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Web API</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sync Service</span>
                    <div className={`flex items-center gap-1 ${getStatusColor(syncStatus?.status || 'idle')}`}>
                      {getStatusIcon(syncStatus?.status || 'idle')}
                      <span className="text-sm capitalize">{syncStatus?.status || 'Idle'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sync Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Sync Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Records</span>
                    <span className="font-medium">{syncStatus?.totalRecords || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Synced Records</span>
                    <span className="font-medium">{syncStatus?.syncedRecords || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Errors</span>
                    <span className="font-medium text-red-600">{syncStatus?.errors || 0}</span>
                  </div>
                  {syncStatus && syncStatus.totalRecords > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((syncStatus.syncedRecords / syncStatus.totalRecords) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(syncStatus.syncedRecords / syncStatus.totalRecords) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Last Sync Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {syncStatus?.lastSync 
                      ? new Date(syncStatus.lastSync).toLocaleString()
                      : 'Never synchronized'
                    }
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleSync.mutate(syncStatus?.status === 'syncing' ? 'stop' : 'start')}
                      disabled={toggleSync.isPending}
                      size="sm"
                      className="flex-1"
                    >
                      {syncStatus?.status === 'syncing' ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Stop Sync
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Sync
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => triggerManualSync.mutate()}
                      disabled={triggerManualSync.isPending}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Progress Details */}
          {syncStatus?.status === 'syncing' && (
            <Card>
              <CardHeader>
                <CardTitle>Sync Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {config.dataTypes.map((dataType) => (
                    <div key={dataType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{dataType}</span>
                        <span className="text-sm text-muted-foreground">In Progress...</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data-mapping">
          <Card>
            <CardHeader>
              <CardTitle>Data Mapping Configuration</CardTitle>
              <CardDescription>
                Configure how Tally data maps to your business management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Data mapping configuration will be available in the next update. 
                  Currently using default field mappings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Sync Logs</CardTitle>
              <CardDescription>
                View detailed logs of synchronization activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sync logs viewer will be available in the next update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}