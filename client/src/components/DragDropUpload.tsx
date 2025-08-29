import { useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DragDropUploadProps {
  documentType: string;
  onUploadComplete: (documentType: string, success: boolean) => void;
  disabled?: boolean;
}

export function DragDropUpload({ documentType, onUploadComplete, disabled }: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  const getDisplayName = (type: string) => {
    const names: Record<string, string> = {
      'gstCertificate': 'GST Certificate',
      'panCopy': 'PAN Copy',
      'securityCheque': 'Security Cheque',
      'aadharCard': 'Aadhar Card',
      'agreement': 'Agreement',
      'poRateContract': 'PO / Rate Contract'
    };
    return names[type] || type;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const uploadFile = async (file: File) => {
    if (disabled) return;
    
    setIsUploading(true);
    try {
      // Get upload URL
      const uploadResponse = await apiRequest('POST', '/api/objects/upload', {}) as any;
      
      // Upload file to object storage
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResult = await fetch(uploadResponse.uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (uploadResult.ok) {
        setUploadSuccess(true);
        onUploadComplete(documentType, true);
        toast({
          title: "Success",
          description: `${getDisplayName(documentType)} uploaded successfully`,
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadComplete(documentType, false);
      toast({
        title: "Error",
        description: `Failed to upload ${getDisplayName(documentType)}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setIsDragOver(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, Word documents, or images only",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10485760) { // 10MB
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      return;
    }

    await uploadFile(file);
  }, [disabled, isUploading, documentType, onUploadComplete, toast]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || disabled || isUploading) return;

    await uploadFile(files[0]);
  }, [disabled, isUploading]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {getDisplayName(documentType)}
      </label>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragOver && !disabled ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${uploadSuccess ? 'border-green-400 bg-green-50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:bg-gray-50'}
          ${isUploading ? 'border-blue-400 bg-blue-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && document.getElementById(`file-${documentType}`)?.click()}
      >
        <input
          id={`file-${documentType}`}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`h-6 w-6 ${uploadSuccess ? 'text-green-600' : isUploading ? 'text-blue-600' : 'text-gray-400'}`} />
          
          {isUploading ? (
            <div className="text-sm text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-1"></div>
              Uploading...
            </div>
          ) : uploadSuccess ? (
            <div className="text-sm text-green-600 font-medium">
              ✓ Uploaded Successfully
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {disabled ? (
                <span className="text-gray-400">Complete and save client details to enable document upload</span>
              ) : (
                <>
                  <span className="font-medium">Drop file here or click to browse</span>
                  <br />
                  <span className="text-xs text-gray-500">PDF, Word, Images (max 10MB)</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}