import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkingFileUploadProps {
  documentType: string;
  label: string;
  clientId?: string;
  onUploadComplete: (documentType: string, success: boolean, fileUrl?: string) => void;
}

export function WorkingFileUpload({ documentType, label, clientId, onUploadComplete }: WorkingFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`=== STARTING UPLOAD ===`);
    console.log(`Upload for ${label}:`, file.name);
    console.log(`Client ID passed to component:`, clientId);
    console.log(`Document Type:`, documentType);
    
    setIsUploading(true);
    setFileName(file.name);
    setUploadSuccess(false);

    try {
      // Validate file
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new Error('Invalid file type. Please upload PDF, Word documents, or images only.');
      }

      if (file.size > 10485760) { // 10MB
        throw new Error('File size must be less than 10MB');
      }

      console.log('=== VALIDATION PASSED ===');
      
      // Always use client-specific upload when clientId is available
      if (!clientId) {
        console.error('❌ NO CLIENT ID PROVIDED!');
        throw new Error('Client ID is required for document upload');
      }
      
      const uploadEndpoint = '/api/clients/documents/upload';
      console.log('✅ Using upload endpoint:', uploadEndpoint);
      console.log('✅ Request body:', { clientId, documentType });
      
      const requestBody = { clientId, documentType };
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get upload URL: ${response.status} ${errorText}`);
      }

      const { uploadURL } = await response.json();
      console.log('2. Got upload URL, uploading file...');
      console.log('Upload URL:', uploadURL.substring(0, 100) + '...');

      // Upload file to storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      console.log('3. Upload response status:', uploadResponse.status);

      if (uploadResponse.ok) {
        console.log('✅ Upload successful!');
        
        // If we have a clientId, associate the document with the client
        if (clientId) {
          try {
            console.log('3. Associating document with client...');
            const documentTypeKebab = documentType.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
            
            const associateResponse = await fetch(`/api/clients/${clientId}/documents/${documentTypeKebab}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ documentURL: uploadURL }),
            });
            
            if (!associateResponse.ok) {
              console.warn('Failed to associate document with client, but upload was successful');
            } else {
              console.log('✅ Document associated with client!');
            }
          } catch (error) {
            console.warn('Failed to associate document with client:', error);
          }
        }
        
        setUploadSuccess(true);
        onUploadComplete(documentType, true, uploadURL);
        toast({
          title: "Success",
          description: `${label} uploaded successfully`,
        });
      } else {
        let errorText = 'Upload failed';
        try {
          errorText = await uploadResponse.text();
        } catch (e) {
          errorText = `HTTP ${uploadResponse.status} ${uploadResponse.statusText}`;
        }
        throw new Error(errorText);
      }

    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadSuccess(false);
      onUploadComplete(documentType, false);
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
    
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.gif"
        onChange={handleFileUpload}
        className="hidden"
        id={`file-${documentType}`}
        disabled={isUploading}
      />
      
      {uploadSuccess ? (
        <div className="space-y-2">
          <Check className="h-8 w-8 text-green-600 mx-auto" />
          <p className="text-sm font-medium text-green-600">{label} Uploaded</p>
          <p className="text-xs text-gray-500">{fileName}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => document.getElementById(`file-${documentType}`)?.click()}
          >
            Replace File
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className={`h-8 w-8 mx-auto ${isUploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {isUploading ? (
            <p className="text-xs text-blue-600">Uploading {fileName}...</p>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => document.getElementById(`file-${documentType}`)?.click()}
            >
              Choose File
            </Button>
          )}
          <p className="text-xs text-gray-400">PDF, JPG, PNG, DOC (max 10MB)</p>
        </div>
      )}
    </div>
  );
}