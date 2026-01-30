import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface UploadStatus {
  success: number;
  failed: number;
  total: number;
  errors: { row: number; message: string }[];
}

export default function BulkUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('sales-invoice');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filePreview, setFilePreview] = useState<any[] | null>(null);

  // Mutation for sales invoice bulk upload
  const uploadSalesInvoicesMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const res = await fetch('/api/bulk-upload/sales-invoices', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        const contentType = res.headers.get('content-type');
        const responseText = await res.text();
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response:', responseText);
          throw new Error(`Server returned ${res.status}: ${res.statusText}. Response: ${responseText.substring(0, 200)}`);
        }
        
        const data = JSON.parse(responseText);
        if (!res.ok) throw new Error(data.error || 'Failed to upload sales invoices');
        return data;
      } catch (error: any) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setUploadStatus(data.summary);
      if (data.summary.failed === 0) {
        toast({
          title: 'Success',
          description: `${data.summary.success} sales invoices uploaded successfully`
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `${data.summary.success} succeeded, ${data.summary.failed} failed`
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/sales-invoices'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation for purchase invoice bulk upload
  const uploadPurchaseInvoicesMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const res = await fetch('/api/bulk-upload/purchase-invoices', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        const contentType = res.headers.get('content-type');
        const responseText = await res.text();
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response:', responseText);
          throw new Error(`Server returned ${res.status}: ${res.statusText}. Response: ${responseText.substring(0, 200)}`);
        }
        
        const data = JSON.parse(responseText);
        if (!res.ok) throw new Error(data.error || 'Failed to upload purchase invoices');
        return data;
      } catch (error: any) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setUploadStatus(data.summary);
      if (data.summary.failed === 0) {
        toast({
          title: 'Success',
          description: `${data.summary.success} purchase invoices uploaded successfully`
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `${data.summary.success} succeeded, ${data.summary.failed} failed`
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/purchase-invoices'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation for leads bulk upload
  const uploadLeadsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const res = await fetch('/api/bulk-upload/leads', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        // Check if response is actually JSON
        const contentType = res.headers.get('content-type');
        const responseText = await res.text();
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response:', responseText);
          throw new Error(`Server returned ${res.status}: ${res.statusText}. Response: ${responseText.substring(0, 200)}`);
        }
        
        const data = JSON.parse(responseText);
        
        if (!res.ok) {
          throw new Error(data.error || `Upload failed with status ${res.status}`);
        }
        
        return data;
      } catch (error: any) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setUploadStatus(data.summary);
      if (data.summary.failed === 0) {
        toast({
          title: 'Success',
          description: `${data.summary.success} leads uploaded successfully`
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `${data.summary.success} succeeded, ${data.summary.failed} failed`
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation for clients bulk upload
  const uploadClientsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const res = await fetch('/api/bulk-upload/clients', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        const contentType = res.headers.get('content-type');
        const responseText = await res.text();
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response:', responseText);
          throw new Error(`Server returned ${res.status}: ${res.statusText}. Response: ${responseText.substring(0, 200)}`);
        }
        
        const data = JSON.parse(responseText);
        if (!res.ok) throw new Error(data.error || 'Failed to upload clients');
        return data;
      } catch (error: any) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setUploadStatus(data.summary);
      if (data.summary.failed === 0) {
        toast({
          title: 'Success',
          description: `${data.summary.success} clients uploaded successfully`
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `${data.summary.success} succeeded, ${data.summary.failed} failed`
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/sales-operations/clients'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Download template
  const downloadTemplate = (type: string) => {
    const templates: Record<string, { headers: string[]; sample: Record<string, any> }> = {
      'sales-invoice': {
        headers: [
          'invoiceNumber',
          'invoiceDate',
          'invoiceType',
          'financialYear',
          'customerId',
          'placeOfSupply',
          'placeOfSupplyStateCode',
          'buyerOrderNumber',
          'buyerOrderDate',
          'deliveryNoteNumber',
          'salesOrderNumber',
          'paymentTerms',
          'paymentMode',
          'dueDate',
          'subtotalAmount',
          'cgstAmount',
          'sgstAmount',
          'igstAmount',
          'otherCharges',
          'roundOff',
          'totalInvoiceAmount',
          'transporterName',
          'vehicleNumber'
        ],
        sample: {
          invoiceNumber: 'SRIHM/001/25-26',
          invoiceDate: '2026-01-30',
          invoiceType: 'TAX_INVOICE',
          financialYear: '2025-2026',
          customerId: 'customer-id-here',
          placeOfSupply: 'Assam',
          placeOfSupplyStateCode: '18',
          buyerOrderNumber: 'ORD/001',
          buyerOrderDate: '2026-01-25',
          deliveryNoteNumber: 'DN/001',
          salesOrderNumber: 'SO/001',
          paymentTerms: '30 Days Credit',
          paymentMode: 'NEFT',
          dueDate: '2026-02-28',
          subtotalAmount: '10000.00',
          cgstAmount: '900.00',
          sgstAmount: '900.00',
          igstAmount: '0.00',
          otherCharges: '0.00',
          roundOff: '0.00',
          totalInvoiceAmount: '11800.00',
          transporterName: 'ABC Transport',
          vehicleNumber: 'MH-01-AB-1234'
        }
      },
      'purchase-invoice': {
        headers: [
          'invoiceNumber',
          'invoiceDate',
          'invoiceType',
          'financialYear',
          'supplierId',
          'supplierInvoiceNumber',
          'supplierInvoiceDate',
          'grnNumber',
          'placeOfSupply',
          'placeOfSupplyStateCode',
          'paymentTerms',
          'paymentMode',
          'dueDate',
          'subtotalAmount',
          'cgstAmount',
          'sgstAmount',
          'igstAmount',
          'otherCharges',
          'roundOff',
          'totalInvoiceAmount'
        ],
        sample: {
          invoiceNumber: 'SUPP/001/25-26',
          invoiceDate: '2026-01-30',
          invoiceType: 'TAX_INVOICE',
          financialYear: '2025-2026',
          supplierId: 'supplier-id-here',
          supplierInvoiceNumber: 'SUP-INV-001',
          supplierInvoiceDate: '2026-01-30',
          grnNumber: 'GRN/001',
          placeOfSupply: 'Assam',
          placeOfSupplyStateCode: '18',
          paymentTerms: '30 Days Credit',
          paymentMode: 'NEFT',
          dueDate: '2026-02-28',
          subtotalAmount: '50000.00',
          cgstAmount: '4500.00',
          sgstAmount: '4500.00',
          igstAmount: '0.00',
          otherCharges: '0.00',
          roundOff: '0.00',
          totalInvoiceAmount: '59000.00'
        }
      },
      'leads': {
        headers: [
          'leadNumber',
          'companyName',
          'contactPersonName',
          'mobileNumber',
          'email',
          'leadSource',
          'leadStatus',
          'interestedProducts',
          'primarySalesPersonId',
          'notes'
        ],
        sample: {
          leadNumber: 'LEAD/001/25-26',
          companyName: 'ABC Corporation',
          contactPersonName: 'John Doe',
          mobileNumber: '9876543210',
          email: 'john@abc.com',
          leadSource: 'WEBSITE',
          leadStatus: 'NEW',
          interestedProducts: 'Product1, Product2',
          primarySalesPersonId: 'user-id-here',
          notes: 'Interested in bulk orders'
        }
      },
      'clients': {
        headers: [
          'name',
          'category',
          'contactPersonName',
          'mobileNumber',
          'email',
          'billingAddressLine',
          'billingCity',
          'billingPincode',
          'billingState',
          'billingCountry',
          'gstNumber',
          'panNumber',
          'paymentTerms',
          'creditLimit'
        ],
        sample: {
          name: 'XYZ Industries',
          category: 'RETAIL',
          contactPersonName: 'Jane Smith',
          mobileNumber: '9876543210',
          email: 'contact@xyz.com',
          billingAddressLine: '123 Main Street',
          billingCity: 'Pune',
          billingPincode: '411001',
          billingState: 'Maharashtra',
          billingCountry: 'India',
          gstNumber: '27AAPCU9603R1Z0',
          panNumber: 'AAAPA5055K',
          paymentTerms: '30',
          creditLimit: '500000'
        }
      }
    };

    const template = templates[type];
    if (!template) return;

    const csvContent = [
      template.headers.join(','),
      Object.values(template.sample).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Template Downloaded',
      description: `${type} template is ready to use`
    });
  };

  // Handle file selection and preview
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        const row: Record<string, any> = {};
        headers.forEach((header, idx) => {
          row[header.trim()] = values[idx]?.trim() || '';
        });
        return row;
      }).filter(row => Object.values(row).some(v => v !== ''));

      setFilePreview(preview);
      
      toast({
        title: 'File Preview',
        description: `${preview.length} rows ready to upload`
      });
    };
    reader.readAsText(file);
  };

  // Handle file upload
  const handleUpload = async (type: string) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file first',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      switch (type) {
        case 'sales-invoice':
          await uploadSalesInvoicesMutation.mutateAsync(formData);
          break;
        case 'purchase-invoice':
          await uploadPurchaseInvoicesMutation.mutateAsync(formData);
          break;
        case 'leads':
          await uploadLeadsMutation.mutateAsync(formData);
          break;
        case 'clients':
          await uploadClientsMutation.mutateAsync(formData);
          break;
      }
    } finally {
      setIsUploading(false);
      fileInputRef.current!.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Upload</h1>
        <p className="text-gray-600 mt-1">Upload multiple records at once with CSV templates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales-invoice">Sales Invoices</TabsTrigger>
          <TabsTrigger value="purchase-invoice">Purchase Invoices</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        {/* Sales Invoice Upload */}
        <TabsContent value="sales-invoice">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Sales Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Template Download */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">Get Template</h3>
                      <p className="text-sm text-blue-800">Download CSV template with required columns</p>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => downloadTemplate('sales-invoice')}
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </Button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'sales-invoice')}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your CSV file here</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </div>

                {/* File Preview */}
                {filePreview && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Preview ({filePreview.length} rows)</h3>
                    <div className="overflow-x-auto text-sm">
                      <table className="w-full">
                        <thead className="bg-gray-200">
                          <tr>
                            {Object.keys(filePreview[0] || {}).map((key) => (
                              <th key={key} className="px-2 py-1 text-left">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filePreview.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="border-b">
                              {Object.values(row).map((val: any, vidx) => (
                                <td key={vidx} className="px-2 py-1">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Upload Status */}
                {uploadStatus && (
                  <div className={`border rounded-lg p-4 ${uploadStatus.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">{uploadStatus.success} Success</span>
                      </div>
                      {uploadStatus.failed > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold">{uploadStatus.failed} Failed</span>
                        </div>
                      )}
                    </div>
                    {uploadStatus.errors.length > 0 && (
                      <div className="mt-3 bg-white rounded p-2 max-h-40 overflow-y-auto text-sm">
                        {uploadStatus.errors.slice(0, 10).map((error, idx) => (
                          <div key={idx} className="text-red-700 mb-1">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  onClick={() => handleUpload('sales-invoice')}
                  disabled={!filePreview || isUploading}
                  className="w-full gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Sales Invoices
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Invoice Upload */}
        <TabsContent value="purchase-invoice">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Purchase Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-900">Get Template</h3>
                      <p className="text-sm text-green-800">Download CSV template with required columns</p>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => downloadTemplate('purchase-invoice')}
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </Button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'purchase-invoice')}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your CSV file here</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </div>

                {filePreview && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Preview ({filePreview.length} rows)</h3>
                    <div className="overflow-x-auto text-sm">
                      <table className="w-full">
                        <thead className="bg-gray-200">
                          <tr>
                            {Object.keys(filePreview[0] || {}).map((key) => (
                              <th key={key} className="px-2 py-1 text-left">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filePreview.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="border-b">
                              {Object.values(row).map((val: any, vidx) => (
                                <td key={vidx} className="px-2 py-1">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {uploadStatus && (
                  <div className={`border rounded-lg p-4 ${uploadStatus.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">{uploadStatus.success} Success</span>
                      </div>
                      {uploadStatus.failed > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold">{uploadStatus.failed} Failed</span>
                        </div>
                      )}
                    </div>
                    {uploadStatus.errors.length > 0 && (
                      <div className="mt-3 bg-white rounded p-2 max-h-40 overflow-y-auto text-sm">
                        {uploadStatus.errors.slice(0, 10).map((error, idx) => (
                          <div key={idx} className="text-red-700 mb-1">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => handleUpload('purchase-invoice')}
                  disabled={!filePreview || isUploading}
                  className="w-full gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Purchase Invoices
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Upload */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-900">Get Template</h3>
                      <p className="text-sm text-purple-800">Download CSV template with required columns</p>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => downloadTemplate('leads')}
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </Button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'leads')}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your CSV file here</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </div>

                {filePreview && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Preview ({filePreview.length} rows)</h3>
                    <div className="overflow-x-auto text-sm">
                      <table className="w-full">
                        <thead className="bg-gray-200">
                          <tr>
                            {Object.keys(filePreview[0] || {}).map((key) => (
                              <th key={key} className="px-2 py-1 text-left">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filePreview.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="border-b">
                              {Object.values(row).map((val: any, vidx) => (
                                <td key={vidx} className="px-2 py-1">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {uploadStatus && (
                  <div className={`border rounded-lg p-4 ${uploadStatus.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">{uploadStatus.success} Success</span>
                      </div>
                      {uploadStatus.failed > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold">{uploadStatus.failed} Failed</span>
                        </div>
                      )}
                    </div>
                    {uploadStatus.errors.length > 0 && (
                      <div className="mt-3 bg-white rounded p-2 max-h-40 overflow-y-auto text-sm">
                        {uploadStatus.errors.slice(0, 10).map((error, idx) => (
                          <div key={idx} className="text-red-700 mb-1">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => handleUpload('leads')}
                  disabled={!filePreview || isUploading}
                  className="w-full gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Leads
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Upload */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-orange-900">Get Template</h3>
                      <p className="text-sm text-orange-800">Download CSV template with required columns</p>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => downloadTemplate('clients')}
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </Button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'clients')}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your CSV file here</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                </div>

                {filePreview && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Preview ({filePreview.length} rows)</h3>
                    <div className="overflow-x-auto text-sm">
                      <table className="w-full">
                        <thead className="bg-gray-200">
                          <tr>
                            {Object.keys(filePreview[0] || {}).map((key) => (
                              <th key={key} className="px-2 py-1 text-left">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filePreview.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="border-b">
                              {Object.values(row).map((val: any, vidx) => (
                                <td key={vidx} className="px-2 py-1">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {uploadStatus && (
                  <div className={`border rounded-lg p-4 ${uploadStatus.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">{uploadStatus.success} Success</span>
                      </div>
                      {uploadStatus.failed > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold">{uploadStatus.failed} Failed</span>
                        </div>
                      )}
                    </div>
                    {uploadStatus.errors.length > 0 && (
                      <div className="mt-3 bg-white rounded p-2 max-h-40 overflow-y-auto text-sm">
                        {uploadStatus.errors.slice(0, 10).map((error, idx) => (
                          <div key={idx} className="text-red-700 mb-1">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => handleUpload('clients')}
                  disabled={!filePreview || isUploading}
                  className="w-full gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Clients
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">CSV Format Requirements</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>First row must contain headers</li>
                <li>Comma-separated values (.csv)</li>
                <li>UTF-8 encoding recommended</li>
                <li>Required fields cannot be empty</li>
                <li>Max 5000 rows per file</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Validation Rules</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Email must be valid format</li>
                <li>Phone numbers: digits only</li>
                <li>Amounts must be positive numbers</li>
                <li>Dates: YYYY-MM-DD format</li>
                <li>Duplicates will be skipped</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
