import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calculator, Package, User, Building2, Calendar, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Supplier, User as UserType, InsertPurchaseOrder, InsertPurchaseOrderItem, ProductMaster } from "@shared/schema";

// Comprehensive Purchase Order form schema
const purchaseOrderSchema = z.object({
  // 1. PO Identification
  poNumber: z.string().min(1, "PO Number is required"),
  poDate: z.string().min(1, "PO Date is required"),
  revisionNumber: z.number().min(0).default(0),
  status: z.enum(['OPEN', 'APPROVED', 'PARTIALLY_RECEIVED', 'CLOSED', 'CANCELLED']).default('OPEN'),
  
  // 2. Supplier Information
  supplierId: z.string().min(1, "Supplier is required"),
  supplierName: z.string().min(1, "Supplier name is required"),
  supplierContactPerson: z.string().optional(),
  supplierEmail: z.string().email().optional().or(z.literal("")),
  supplierPhone: z.string().optional(),
  
  // 3. Buyer / Internal Information
  buyerName: z.string().min(1, "Buyer name is required"),
  department: z.string().optional(),
  costCenter: z.string().optional(),
  approverName: z.string().optional(),
  
  // 4. Financial Information
  currency: z.string().default('INR'),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  
  // Additional Fields
  deliveryDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  
  // Line Items
  items: z.array(z.object({
    productMasterId: z.string().optional(),
    itemCode: z.string().min(1, "Item code is required"),
    itemDescription: z.string().min(1, "Item description is required"),
    productName: z.string().optional(),
    productFamily: z.string().optional(),
    productGrade: z.string().optional(),
    hsnCode: z.string().optional(),
    quantityOrdered: z.number().min(0.001, "Quantity must be greater than 0"),
    unitOfMeasure: z.string().min(1, "Unit of measure is required"),
    unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
  })).min(1, "At least one item is required")
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  onSubmit: (data: { purchaseOrder: InsertPurchaseOrder; items: InsertPurchaseOrderItem[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  existingPO?: any; // Existing purchase order data for edit mode
  existingItems?: any[]; // Existing items for edit mode
}

export function PurchaseOrderForm({ onSubmit, onCancel, isLoading = false, existingPO, existingItems }: PurchaseOrderFormProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Fetch suppliers for dropdown
  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  // Fetch users for buyer selection
  const { data: users } = useQuery<UserType[]>({
    queryKey: ['/api/users'],
  });

  // Fetch product masters for item selection
  const { data: productMasters } = useQuery<ProductMaster[]>({
    queryKey: ['/api/product-master'],
  });

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      poNumber: `PO-${Date.now()}`,
      poDate: new Date().toISOString().split('T')[0],
      revisionNumber: 0,
      status: 'OPEN',
      currency: 'INR',
      taxAmount: 0,
      discountAmount: 0,
      items: [{
        productMasterId: '',
        itemCode: '',
        itemDescription: '',
        productName: '',
        productFamily: '',
        productGrade: '',
        hsnCode: '',
        quantityOrdered: 1,
        unitOfMeasure: 'PCS',
        unitPrice: 0,
      }]
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // Load existing data when in edit mode
  useEffect(() => {
    if (existingPO && existingItems) {
      // Format date for form input
      const formattedDate = existingPO.poDate ? new Date(existingPO.poDate).toISOString().split('T')[0] : '';
      const formattedDeliveryDate = existingPO.deliveryDate ? new Date(existingPO.deliveryDate).toISOString().split('T')[0] : '';
      
      // Set form values from existing purchase order
      form.setValue("poNumber", existingPO.poNumber || '');
      form.setValue("poDate", formattedDate);
      form.setValue("revisionNumber", existingPO.revisionNumber || 0);
      form.setValue("status", existingPO.status || 'OPEN');
      form.setValue("supplierId", existingPO.supplierId || '');
      form.setValue("supplierName", existingPO.supplierName || '');
      form.setValue("supplierContactPerson", existingPO.supplierContactPerson || '');
      form.setValue("supplierEmail", existingPO.supplierEmail || '');
      form.setValue("supplierPhone", existingPO.supplierPhone || '');
      form.setValue("buyerName", existingPO.buyerName || '');
      form.setValue("department", existingPO.department || '');
      form.setValue("costCenter", existingPO.costCenter || '');
      form.setValue("approverName", existingPO.approverName || '');
      form.setValue("currency", existingPO.currency || 'INR');
      form.setValue("taxAmount", parseFloat(existingPO.taxAmount?.toString() || '0') || 0);
      form.setValue("discountAmount", parseFloat(existingPO.discountAmount?.toString() || '0') || 0);
      form.setValue("deliveryDate", formattedDeliveryDate);
      form.setValue("deliveryAddress", existingPO.deliveryAddress || '');
      form.setValue("notes", existingPO.notes || '');
      form.setValue("terms", existingPO.terms || '');

      // Load existing items
      if (existingItems && existingItems.length > 0) {
        const formattedItems = existingItems.map(item => ({
          productMasterId: item.productMasterId || '',
          itemCode: item.itemCode || '',
          itemDescription: item.itemDescription || '',
          productName: item.productName || '',
          productFamily: item.productFamily || '',
          productGrade: item.productGrade || '',
          hsnCode: item.hsnCode || '',
          quantityOrdered: item.quantityOrdered || 1,
          unitOfMeasure: item.unitOfMeasure || 'PCS',
          unitPrice: item.unitPrice || 0,
        }));
        replace(formattedItems);
      }

      // Set selected supplier if available
      if (existingPO.supplierId && suppliers) {
        const supplier = suppliers.find(s => s.id === existingPO.supplierId);
        if (supplier) {
          setSelectedSupplier(supplier);
        }
      }
    }
  }, [existingPO, existingItems, suppliers, form, replace]);

  const watchedItems = form.watch("items");
  
  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => {
    return sum + (item.quantityOrdered || 0) * (item.unitPrice || 0);
  }, 0);
  
  const taxAmount = parseFloat(form.watch("taxAmount")?.toString() || '0') || 0;
  const discountAmount = parseFloat(form.watch("discountAmount")?.toString() || '0') || 0;
  const totalAmount = subtotal + taxAmount - discountAmount;

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers?.find(s => s.id === supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
      form.setValue("supplierId", supplierId);
      form.setValue("supplierName", supplier.supplierName || supplier.name || '');
      form.setValue("supplierContactPerson", supplier.contactPersonName || '');
      form.setValue("supplierEmail", supplier.contactEmail || '');
      form.setValue("supplierPhone", supplier.contactPhone || supplier.contactPersonPhone || '');
    }
  };

  const addItem = () => {
    append({
      productMasterId: '',
      itemCode: '',
      itemDescription: '',
      productName: '',
      productFamily: '',
      productGrade: '',
      hsnCode: '',
      quantityOrdered: 1,
      unitOfMeasure: 'PCS',
      unitPrice: 0,
    });
  };

  const handleProductSelection = (index: number, productId: string) => {
    if (productId === "manual") {
      // Clear product master fields for manual entry
      form.setValue(`items.${index}.productMasterId`, '');
      form.setValue(`items.${index}.productName`, '');
      form.setValue(`items.${index}.productFamily`, '');
      form.setValue(`items.${index}.productGrade`, '');
      form.setValue(`items.${index}.hsnCode`, '');
      return;
    }

    const product = productMasters?.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productMasterId`, productId);
      form.setValue(`items.${index}.itemCode`, product.productCode);
      form.setValue(`items.${index}.itemDescription`, product.productName || '');
      form.setValue(`items.${index}.productName`, product.productName || '');
      form.setValue(`items.${index}.productFamily`, product.productFamily || '');
      form.setValue(`items.${index}.productGrade`, product.productGrade || '');
      form.setValue(`items.${index}.hsnCode`, product.hsnCode || '');
      form.setValue(`items.${index}.unitOfMeasure`, product.baseUnitOfMeasure || 'PCS');
      form.setValue(`items.${index}.unitPrice`, parseFloat(product.sellingPrice || '0'));
    }
  };

  const handleSubmit = (data: PurchaseOrderFormData) => {
    // Get current user (you may need to fetch this from auth context)
    const currentUser = users?.[0]; // For now, using first user
    
    const purchaseOrder: InsertPurchaseOrder = {
      poNumber: data.poNumber,
      orderDate: data.poDate, // Map poDate -> orderDate as string
      supplierId: data.supplierId,
      expectedDeliveryDate: data.deliveryDate || data.poDate, // Map deliveryDate -> expectedDeliveryDate
      status: data.status,
      currency: data.currency,
      subtotal: subtotal, // Use calculated subtotal as number
      taxAmount: data.taxAmount || 0, // Use number, not string
      discountAmount: data.discountAmount || 0, // Use number, not string
      totalAmount: totalAmount, // Use number, not string
      deliveryAddress: data.deliveryAddress,
      termsAndConditions: data.terms, // Map terms -> termsAndConditions
      internalNotes: data.notes, // Map notes -> internalNotes
    };

    const items: InsertPurchaseOrderItem[] = data.items.map(item => ({
      purchaseOrderId: '', // Will be filled by backend
      itemDescription: item.itemDescription, // Keep itemDescription as-is
      itemCode: item.itemCode,
      quantityOrdered: item.quantityOrdered, // Use number, not string
      unitOfMeasure: item.unitOfMeasure, // Keep unitOfMeasure as-is  
      unitPrice: item.unitPrice, // Use number, not string
      totalLineValue: item.quantityOrdered * item.unitPrice, // Keep totalLineValue as-is
      productMasterId: item.productMasterId || undefined,
      productName: item.productName,
      productFamily: item.productFamily,
      productGrade: item.productGrade,
      hsnCode: item.hsnCode,
    }));

    onSubmit({ purchaseOrder, items });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-6 w-6" />
                <span>Create Purchase Order</span>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* 1. PO Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>PO Identification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-po-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="poDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-po-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="revisionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revision Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-revision-number" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Status *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-po-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 2. Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Supplier Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select value={field.value} onValueChange={handleSupplierChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-supplier">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.supplierName || supplier.name} - {supplier.supplierCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedSupplier && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Contact Person</label>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.contactPersonName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.contactEmail || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.contactPhone || '-'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Buyer / Internal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Buyer / Internal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer/Requester Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-buyer-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department / Cost Center</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-department" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="costCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Center</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-cost-center" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="approverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approver Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-approver-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 4. Order Details / Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Order Details</span>
                </div>
                <Button type="button" onClick={addItem} size="sm" data-testid="button-add-item">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4 bg-gray-50/50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-lg">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productMasterId`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Select Product</FormLabel>
                          <Select value={field.value} onValueChange={(value) => handleProductSelection(index, value)}>
                            <FormControl>
                              <SelectTrigger data-testid={`select-product-${index}`}>
                                <SelectValue placeholder="Choose product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="manual">Manual Entry</SelectItem>
                              {productMasters?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.productCode} - {product.productName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemCode`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Item Code *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid={`input-item-code-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemDescription`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid={`input-item-description-${index}`} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantityOrdered`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Qty *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.001"
                              min="0.001"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid={`input-quantity-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitOfMeasure`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Unit *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid={`select-unit-${index}`}>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PCS">PCS</SelectItem>
                              <SelectItem value="KG">KG</SelectItem>
                              <SelectItem value="KL">KL</SelectItem>
                              <SelectItem value="LTR">LTR</SelectItem>
                              <SelectItem value="MTR">MTR</SelectItem>
                              <SelectItem value="BOX">BOX</SelectItem>
                              <SelectItem value="SET">SET</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Unit Price *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0.01"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid={`input-unit-price-${index}`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Product Master Details */}
                  {form.watch(`items.${index}.productMasterId`) && form.watch(`items.${index}.productMasterId`) !== "manual" && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-3 bg-blue-50 rounded-lg border">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productFamily`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Family</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-white/80" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.productGrade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-white/80" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.hsnCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HSN Code</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="bg-white/80" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Badge variant="secondary" className="mb-2">
                          <Package className="h-3 w-3 mr-1" />
                          Product Master Data
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      Line Total: ₹{((watchedItems[index]?.quantityOrdered || 0) * (watchedItems[index]?.unitPrice || 0)).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Financial Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-tax-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-discount-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col justify-end">
                  <label className="text-sm font-medium mb-2">Total Amount</label>
                  <div className="h-10 border rounded-md px-3 flex items-center font-semibold text-lg bg-muted">
                    ₹{totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-delivery-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="textarea-delivery-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="textarea-terms" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="textarea-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              data-testid="button-create-po"
            >
              {isLoading ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}