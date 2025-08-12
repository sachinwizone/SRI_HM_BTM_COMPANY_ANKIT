import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Database, RefreshCw, Settings, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTallyCompanySchema, type TallyCompany, type InsertTallyCompany } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TallyIntegrationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch Tally companies
  const { data: companies = [], isLoading } = useQuery<TallyCompany[]>({
    queryKey: ["/api/tally/companies"],
  });

  // Fetch sync status
  const { data: syncStatus = [] } = useQuery<any[]>({
    queryKey: ["/api/tally/sync/status"],
  });

  // Form for adding new company
  const form = useForm<InsertTallyCompany>({
    resolver: zodResolver(insertTallyCompanySchema),
    defaultValues: {
      name: "",
      externalId: "",
      apiKey: "",
    },
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (data: InsertTallyCompany) => 
      apiRequest("/api/tally/companies", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tally/companies"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Tally company has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add Tally company.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTallyCompany) => {
    // Generate a random API key if not provided
    if (!data.apiKey) {
      data.apiKey = `tally_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    createCompanyMutation.mutate(data);
  };

  const getLastSyncForCompany = (companyId: string) => {
    return syncStatus.find((status: any) => status.companyId === companyId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tally Integration</h1>
          <p className="text-muted-foreground">
            Manage Tally connections and sync accounting data with your business system.
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tally Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Tally Company</DialogTitle>
              <DialogDescription>
                Connect a new Tally company to sync accounting data.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="externalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Tally company identifier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                

                
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key (Auto-generated if empty)</FormLabel>
                      <FormControl>
                        <Input placeholder="Leave empty to auto-generate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createCompanyMutation.isPending}>
                    {createCompanyMutation.isPending ? "Adding..." : "Add Company"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="sync-status">Sync Status</TabsTrigger>
          <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="animate-pulse">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Tally Companies</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first Tally company to start syncing accounting data.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Company
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => {
                const lastSync = getLastSyncForCompany(company.id);
                return (
                  <Card key={company.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {company.name}
                        <Badge variant={lastSync ? "default" : "secondary"}>
                          {lastSync ? "Synced" : "Not Synced"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {company.externalId && `ID: ${company.externalId}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">API Key:</span>
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {company.apiKey.substring(0, 8)}...
                          </span>
                        </div>

                        {lastSync && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Sync:</span>
                            <span className="text-xs">
                              {new Date(lastSync.lastSync).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Settings className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Sync Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync-status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Status Overview</CardTitle>
              <CardDescription>
                Current synchronization status for all Tally entities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncStatus.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sync data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {syncStatus.map((status: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">{status.entity}</div>
                          <div className="text-sm text-muted-foreground">
                            Last sync: {new Date(status.lastSync).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="text-green-600">{status.totalAccepted}</span>
                          {" / "}
                          <span>{status.totalReceived}</span>
                          {" records"}
                        </div>
                        {status.totalFailed > 0 && (
                          <div className="text-sm text-red-600">
                            {status.totalFailed} failed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Logs</CardTitle>
              <CardDescription>
                Detailed synchronization logs and error information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a company to view detailed sync logs
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}