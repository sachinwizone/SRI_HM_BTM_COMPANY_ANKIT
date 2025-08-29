
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, Users, Edit, Eye } from "lucide-react";
import { useState } from "react";

export default function ClientManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/clients', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({ title: "Success", description: "Client created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create client", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      category: "BETA",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
      creditLimit: "",
      paymentTerms: 30
    }
  });

  const onSubmit = (data: any) => {
    createClientMutation.mutate({
      ...data,
      creditLimit: data.creditLimit ? parseFloat(data.creditLimit) : null
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ALFA':
        return 'bg-green-100 text-green-800';
      case 'BETA':
        return 'bg-blue-100 text-blue-800';
      case 'GAMMA':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELTA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClients = selectedCategory === "all" 
    ? clients 
    : clients?.filter(client => client.category === selectedCategory);

  const categoryStats = [
    {
      name: "Alpha",
      count: stats?.clientCategories?.ALFA || 0,
      description: "Premium clients",
      color: "bg-green-500"
    },
    {
      name: "Beta", 
      count: stats?.clientCategories?.BETA || 0,
      description: "Standard clients",
      color: "bg-blue-500"
    },
    {
      name: "Gamma",
      count: stats?.clientCategories?.GAMMA || 0,
      description: "Regular clients", 
      color: "bg-yellow-500"
    },
    {
      name: "Delta",
      count: stats?.clientCategories?.DELTA || 0,
      description: "New clients",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
        <p className="text-gray-600 mt-1">Manage client information and categorization</p>
      </div>
      
      {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {categoryStats.map((category, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{category.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Filters and Actions */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Client Directory</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input 
                        type="text" 
                        placeholder="Search clients..." 
                        className="w-64 pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="ALFA">Alpha</SelectItem>
                        <SelectItem value="BETA">Beta</SelectItem>
                        <SelectItem value="GAMMA">Gamma</SelectItem>
                        <SelectItem value="DELTA">Delta</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter size={16} className="mr-2" />
                      Filter
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus size={16} className="mr-2" />
                          Add Client
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Client</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Client Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter client name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="ALFA">Alpha - Premium</SelectItem>
                                        <SelectItem value="BETA">Beta - Standard</SelectItem>
                                        <SelectItem value="GAMMA">Gamma - Regular</SelectItem>
                                        <SelectItem value="DELTA">Delta - New</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="client@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+91 98765 43210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Enter client address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="gstNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>GST Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="GST Number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="creditLimit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Credit Limit</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="paymentTerms"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Payment Terms (Days)</FormLabel>
                                    <FormControl>
                                      <Input type="number" placeholder="30" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createClientMutation.isPending}>
                                {createClientMutation.isPending ? "Creating..." : "Create Client"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Clients Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Contact</th>
                        <th className="px-6 py-3">Credit Limit</th>
                        <th className="px-6 py-3">Payment Terms</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                          </tr>
                        ))
                      ) : !filteredClients || filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>No clients found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map((client, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{client.name}</div>
                                <div className="text-sm text-gray-500">{client.gstNumber || 'No GST'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={getCategoryColor(client.category)}>
                                {client.category}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-gray-900">{client.email || 'No email'}</div>
                                <div className="text-sm text-gray-500">{client.phone || 'No phone'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">
                                {client.creditLimit ? `₹${parseInt(client.creditLimit).toLocaleString()}` : 'Not set'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900">{client.paymentTerms || 30} days</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit size={16} className="mr-1" />
                                  Edit
                                </Button>
                                <Button variant="link" size="sm">
                                  <Eye size={16} className="mr-1" />
                                  View
                                </Button>
                              </div>
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
