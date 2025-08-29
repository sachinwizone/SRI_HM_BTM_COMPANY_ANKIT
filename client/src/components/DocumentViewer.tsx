import { useState } from "react";
import { Download, Eye, X, FileText, Shield, CreditCard, Building, FileCheck, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface DocumentViewerProps {
  clientId: string;
  clientName: string;
  documents: {
    gstCertificateUrl?: string;
    panCopyUrl?: string;
    securityChequeUrl?: string;
    aadharCardUrl?: string;
    agreementUrl?: string;
    poRateContractUrl?: string;
    gstCertificateUploaded?: boolean;
    panCopyUploaded?: boolean;
    securityChequeUploaded?: boolean;
    aadharCardUploaded?: boolean;
    agreementUploaded?: boolean;
    poRateContractUploaded?: boolean;
  };
}

interface DocumentType {
  key: string;
  name: string;
  icon: React.ReactNode;
  urlKey: string;
  uploadedKey: string;
}

export function DocumentViewer({ clientId, clientName, documents }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  const documentTypes: DocumentType[] = [
    {
      key: "gstCertificate",
      name: "GST Certificate",
      icon: <FileText className="h-4 w-4" />,
      urlKey: "gstCertificateUrl",
      uploadedKey: "gstCertificateUploaded"
    },
    {
      key: "panCopy",
      name: "PAN Copy",
      icon: <CreditCard className="h-4 w-4" />,
      urlKey: "panCopyUrl",
      uploadedKey: "panCopyUploaded"
    },
    {
      key: "securityCheque",
      name: "Security Cheque",
      icon: <Shield className="h-4 w-4" />,
      urlKey: "securityChequeUrl",
      uploadedKey: "securityChequeUploaded"
    },
    {
      key: "aadharCard",
      name: "Aadhar Card",
      icon: <Building className="h-4 w-4" />,
      urlKey: "aadharCardUrl",
      uploadedKey: "aadharCardUploaded"
    },
    {
      key: "agreement",
      name: "Agreement",
      icon: <FileCheck className="h-4 w-4" />,
      urlKey: "agreementUrl",
      uploadedKey: "agreementUploaded"
    },
    {
      key: "poRateContract",
      name: "PO / Rate Contract",
      icon: <ScrollText className="h-4 w-4" />,
      urlKey: "poRateContractUrl",
      uploadedKey: "poRateContractUploaded"
    }
  ];

  const handleDownload = async (documentUrl: string, documentName: string) => {
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${clientName}_${documentName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handlePreview = (documentUrl: string, documentName: string) => {
    setPreviewUrl(documentUrl);
    setPreviewTitle(`${clientName} - ${documentName}`);
  };

  const uploadedCount = documentTypes.filter(doc => 
    documents[doc.uploadedKey as keyof typeof documents]
  ).length;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
        data-testid="button-view-documents"
      >
        <Eye className="h-4 w-4" />
        Documents ({uploadedCount}/6)
      </Button>

      {/* Documents List Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-documents">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents for {clientName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.map((docType) => {
              const isUploaded = documents[docType.uploadedKey as keyof typeof documents];
              const documentUrl = documents[docType.urlKey as keyof typeof documents] as string;
              
              return (
                <div
                  key={docType.key}
                  className={`border rounded-lg p-4 ${
                    isUploaded ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  data-testid={`document-${docType.key}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {docType.icon}
                      <span className="font-medium text-sm">{docType.name}</span>
                    </div>
                    <Badge 
                      variant={isUploaded ? "default" : "secondary"}
                      className={isUploaded ? "bg-green-600" : ""}
                    >
                      {isUploaded ? "Uploaded" : "Missing"}
                    </Badge>
                  </div>
                  
                  {isUploaded && documentUrl ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(documentUrl, docType.name)}
                        className="flex-1"
                        data-testid={`button-preview-${docType.key}`}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(documentUrl, docType.name)}
                        className="flex-1"
                        data-testid={`button-download-${docType.key}`}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Document not uploaded yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Click "Preview" to view documents in a new tab, or "Download" to save them locally.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="dialog-preview">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{previewTitle}</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewUrl(null)}
                data-testid="button-close-preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {previewUrl && (
            <div className="flex-1 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] border rounded"
                title="Document Preview"
                data-testid="iframe-document-preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}