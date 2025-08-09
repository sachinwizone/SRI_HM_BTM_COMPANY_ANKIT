import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Users, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  Download,
  RotateCcw,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface TallyLedger {
  id: string;
  name: string;
  tallyGuid?: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  creditLimit?: string;
  category: 'ALFA' | 'BETA' | 'GAMMA' | 'DELTA';
  lastSynced?: string;
  createdAt: string;
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: string;
  totalRecords: number;
  syncedRecords: number;
  status: 'idle' | 'syncing' | 'error' | 'success';
}

export default function LedgersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch ledgers/clients from database
  const { data: ledgers = [], isLoading: ledgersLoading, error: ledgersError } = useQuery<TallyLedger[]>({
    queryKey: ['/api/clients'],
  });

  // Fetch sync status
  const { data: syncStatus, isLoading: statusLoading } = useQuery<SyncStatus>({
    queryKey: ['/api/tally-sync/sync/status'],
    refetchInterval: 5000,
  });

  // Simulate Tally ledgers sync
  const syncLedgers = useMutation({
    mutationFn: async () => {
      // Simulate receiving Tally ledger data
      const sampleTallyLedgers = [
        {
          name: "ABC Industries Pvt Ltd",
          guid: "abc-industries-001",
          address: "123 Industrial Area, Mumbai",
          phone: "+91-9876543210",
          email: "contact@abcindustries.com",
          gstNumber: "27ABCDE1234F1Z5",
          creditLimit: 500000
        },
        {
          name: "XYZ Trading Company",
          guid: "xyz-trading-002", 
          address: "456 Market Street, Delhi",
          phone: "+91-9876543211",
          email: "info@xyztrading.com",
          gstNumber: "07XYZAB5678G1H9",
          creditLimit: 300000
        },
        {
          name: "Quick Logistics Ltd",
          guid: "quick-logistics-003",
          address: "789 Transport Hub, Bangalore",
          phone: "+91-9876543212",
          email: "ops@quicklogistics.com", 
          gstNumber: "29QUICK1234L5M6",
          creditLimit: 750000
        }
      ];

      const response = await fetch('/api/tally-sync/sync/ledgers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ledgers: sampleTallyLedgers,
          companyGuid: 'wizone-network-001'
        })
      });

      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Success", 
        description: `Synced ${data.synced} ledgers from Tally ERP` 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to sync ledgers from Tally", 
        variant: "destructive" 
      });
    }
  });

  // Filter ledgers
  const filteredLedgers = ledgers.filter(ledger => {
    const matchesSearch = ledger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ledger.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ledger.phone?.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || ledger.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ALFA': return 'bg-red-100 text-red-800';
      case 'BETA': return 'bg-blue-100 text-blue-800';  
      case 'GAMMA': return 'bg-green-100 text-green-800';
      case 'DELTA': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return '₹0';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tally Ledgers</h1>
          <p className="text-muted-foreground">
            Manage client ledgers synced from Tally ERP
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => syncLedgers.mutate()}
            disabled={syncLedgers.isPending || !syncStatus?.isConnected}
            className="gap-2"
          >
            {syncLedgers.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Sync from Tally
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Alert className={syncStatus?.isConnected ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <Database className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            {syncStatus?.isConnected ? (
              <>✓ Connected to Tally ERP - Ready for sync</>
            ) : (
              <>⚠ Tally ERP disconnected - Start Windows app to sync</>
            )}
          </span>
          {syncStatus?.lastSync && (
            <span className="text-sm text-muted-foreground">
              Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
            </span>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="ledgers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ledgers">Ledger List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="ledgers" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, GST number, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'ALFA', 'BETA', 'GAMMA', 'DELTA'].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'All' : category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledgers List */}
          <div className="grid gap-4">
            {ledgersLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading ledgers...
                </CardContent>
              </Card>
            ) : ledgersError ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                  Error loading ledgers
                </CardContent>
              </Card>
            ) : filteredLedgers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Ledgers Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'No ledgers match your search criteria'
                      : 'No ledgers synced from Tally yet'
                    }
                  </p>
                  {!searchTerm && selectedCategory === 'all' && (
                    <Button 
                      onClick={() => syncLedgers.mutate()}
                      disabled={syncLedgers.isPending || !syncStatus?.isConnected}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Sync Ledgers from Tally
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredLedgers.map((ledger) => (
                <Card key={ledger.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{ledger.name}</h3>
                          <Badge className={getCategoryColor(ledger.category)}>
                            {ledger.category}
                          </Badge>
                          {ledger.tallyGuid && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Synced
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                          {ledger.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{ledger.address}</span>
                            </div>
                          )}
                          {ledger.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{ledger.phone}</span>
                            </div>
                          )}
                          {ledger.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{ledger.email}</span>
                            </div>
                          )}
                          {ledger.gstNumber && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                GST: {ledger.gstNumber}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold">
                          {formatCurrency(ledger.creditLimit)}
                        </div>
                        <div className="text-xs text-muted-foreground">Credit Limit</div>
                        {ledger.lastSynced && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(ledger.lastSynced).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ledgers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ledgers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Synced from Tally ERP
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Synced Today</CardTitle>
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ledgers.filter(l => l.lastSynced && 
                    new Date(l.lastSynced).toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated from Tally
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credit Limit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    ledgers.reduce((sum, l) => sum + (parseFloat(l.creditLimit || '0')), 0).toString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Combined credit limits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs">
                  {['ALFA', 'BETA', 'GAMMA', 'DELTA'].map(category => (
                    <div key={category} className="flex justify-between">
                      <span>{category}:</span>
                      <span className="font-medium">
                        {ledgers.filter(l => l.category === category).length}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}