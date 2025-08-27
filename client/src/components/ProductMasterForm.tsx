import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Package, Plus, Edit, Trash2, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Product Master form schema
const productMasterSchema = z.object({
  productCode: z.string().min(1, "Product code is required"),
  name: z.string().min(1, "Product name is required"),
  productFamily: z.string().min(1, "Product family is required"),
  grade: z.string().optional(),
  description: z.string().optional(),
  packaging: z.string().min(1, "Packaging is required"),
  unit: z.string().min(1, "Unit is required"),
  densityFactor: z.string().optional(),
  drumsPerMT: z.string().optional(),
  hsnCode: z.string().optional(),
  taxRate: z.string().optional(),
  batchTracking: z.boolean().optional(),
  shelfLifeDays: z.string().optional(),
  minOrderQuantity: z.string().optional(),
  maxOrderQuantity: z.string().optional(),
  reorderLevel: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductMasterFormData = z.infer<typeof productMasterSchema>;

export function ProductMasterForm() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductMasterFormData>({
    resolver: zodResolver(productMasterSchema),
    defaultValues: {
      productFamily: "VG_BITUMEN",
      packaging: "BULK",
      unit: "MT",
      taxRate: "5.00",
      batchTracking: false,
      isActive: true,
    },
  });

  // Fetch all products
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/product-master"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => {
      console.log("Creating product with data:", data);
      return apiRequest("POST", "/api/product-master", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/product-master"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({ title: "Error", description: `Failed to create product: ${error.message || 'Unknown error'}`, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      console.log("Updating product with data:", data);
      return apiRequest("PUT", `/api/product-master/${editingProduct.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/product-master"] });
      setDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({ title: "Error", description: `Failed to update product: ${error.message || 'Unknown error'}`, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return apiRequest("DELETE", `/api/product-master/${id}`, null);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/product-master"] });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({ title: "Error", description: `Failed to delete product: ${error.message || 'Unknown error'}`, variant: "destructive" });
    },
  });

  const onSubmit = (data: ProductMasterFormData) => {
    // Convert string values to numbers for numeric fields
    const processedData = {
      ...data,
      densityFactor: data.densityFactor ? parseFloat(data.densityFactor) : null,
      drumsPerMT: data.drumsPerMT ? parseInt(data.drumsPerMT) : null,
      taxRate: data.taxRate ? parseFloat(data.taxRate) : null,
      shelfLifeDays: data.shelfLifeDays ? parseInt(data.shelfLifeDays) : null,
      minOrderQuantity: data.minOrderQuantity ? parseFloat(data.minOrderQuantity) : null,
      maxOrderQuantity: data.maxOrderQuantity ? parseFloat(data.maxOrderQuantity) : null,
      reorderLevel: data.reorderLevel ? parseFloat(data.reorderLevel) : null,
    };

    if (editingProduct) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      ...product,
      densityFactor: product.densityFactor?.toString() || "",
      drumsPerMT: product.drumsPerMT?.toString() || "",
      taxRate: product.taxRate?.toString() || "",
      shelfLifeDays: product.shelfLifeDays?.toString() || "",
      minOrderQuantity: product.minOrderQuantity?.toString() || "",
      maxOrderQuantity: product.maxOrderQuantity?.toString() || "",
      reorderLevel: product.reorderLevel?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset({
      productFamily: "VG_BITUMEN",
      packaging: "BULK",
      unit: "MT",
      taxRate: "5.00",
      batchTracking: false,
      isActive: true,
    });
    setDialogOpen(true);
  };

  // Filter products based on search term
  const filteredProducts = products?.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="p-4">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Product Master</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <FormField
                    control={form.control}
                    name="productCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="VG30-NE" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="BITUMEN VG-30 NON EMBOSSED" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Family *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product family" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="VG_BITUMEN">VG Bitumen</SelectItem>
                            <SelectItem value="EMULSION">Emulsion</SelectItem>
                            <SelectItem value="BULK">Bulk</SelectItem>
                            <SelectItem value="ACCESSORIES">Accessories</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <Input placeholder="VG-30, RS-1, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packaging"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Packaging *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select packaging" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BULK">Bulk</SelectItem>
                            <SelectItem value="DRUM">Drum</SelectItem>
                            <SelectItem value="EMBOSSED">Embossed</SelectItem>
                            <SelectItem value="UNIT">Unit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MT">MT (Metric Ton)</SelectItem>
                            <SelectItem value="KL">KL (Kiloliter)</SelectItem>
                            <SelectItem value="DRUM">Drum</SelectItem>
                            <SelectItem value="UNIT">Unit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hsnCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HSN Code</FormLabel>
                        <FormControl>
                          <Input placeholder="27132000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input placeholder="5.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="densityFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Density Factor (MT to KL)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.95" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drumsPerMT"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drums per MT</FormLabel>
                        <FormControl>
                          <Input placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minOrderQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Order Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="1.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxOrderQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Order Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="1000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reorderLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reorder Level</FormLabel>
                        <FormControl>
                          <Input placeholder="10.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shelfLifeDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shelf Life (Days)</FormLabel>
                        <FormControl>
                          <Input placeholder="365" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Product description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="batchTracking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Batch Tracking</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable batch tracking for this product
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Product is active and available
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Product"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by product name, code, or HSN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>HSN Code</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.productCode}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.productFamily}</TableCell>
                    <TableCell>{product.grade || "-"}</TableCell>
                    <TableCell>{product.hsnCode || "-"}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{product.taxRate}%</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}