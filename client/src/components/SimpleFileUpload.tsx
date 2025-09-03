import { useState, useRef } from "react";
import { Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleFileUploadProps {
  documentType: string;
  onUploadComplete: (documentType: string, success: boolean) => void;
}

export function SimpleFileUpload({ documentType, onUploadComplete }: SimpleFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const testUploadStep = async (step: string, fn: () => Promise<any>) => {
    try {
      console.log(`🔄 Starting step: ${step}`);
      const result = await fn();
      console.log(`✅ Step completed: ${step}`, result);
      return result;
    } catch (error) {
      console.error(`❌ Step failed: ${step}`, error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'No message',
        stack: error instanceof Error ? error.stack : 'No stack',
        name: error instanceof Error ? error.name : 'No name',
        type: typeof error
      });
      throw error;
    }
  };

  const simpleUploadTest = async (file: File) => {
    console.log('=== SIMPLE UPLOAD TEST ===');
    console.log('File:', file.name, file.type, file.size);
    
    try {
      console.log('1. Getting upload URL...');
      const urlResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      
      console.log('1. URL Response status:', urlResponse.status);
      const urlData = await urlResponse.json();
      console.log('1. Upload URL received');
      
      console.log('2. Uploading file...');
      const uploadResponse = await fetch(urlData.uploadURL, {
        method: 'PUT',
        body: file
      });
      
      console.log('2. Upload status:', uploadResponse.status);
      console.log('2. Upload ok:', uploadResponse.ok);
      
      if (uploadResponse.ok) {
        console.log('✅ UPLOAD SUCCESS!');
        return true;
      } else {
        console.log('❌ UPLOAD FAILED');
        return false;
      }
    } catch (err) {
      console.log('❌ ERROR:', err);
      return false;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name);
    setIsUploading(true);
    setFileName(file.name);
    setUploadSuccess(false);

    // Simple validation
    const ext = file.name.toLowerCase().split('.').pop();
    if (!ext || !['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, Word documents, or images only",
        variant: "destructive"
      });
      setIsUploading(false);
      return;
    }

    if (file.size > 10485760) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      setIsUploading(false);
      return;
    }

    // Try the simple upload test
    const success = await simpleUploadTest(file);
    
    if (success) {
      setUploadSuccess(true);
      onUploadComplete(documentType, true);
      toast({
        title: "Success",
        description: `${getDisplayName(documentType)} uploaded successfully`,
      });
    } else {
      setUploadSuccess(false);
      onUploadComplete(documentType, false);
      toast({
        title: "Upload Failed",
        description: "Check console for error details",
        variant: "destructive"
      });
    }
    
    setIsUploading(false);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        {getDisplayName(documentType)}
      </label>
      
      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200
          ${uploadSuccess ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}
          ${isUploading ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/30' : ''}
          hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {uploadSuccess ? (
            <Check className="h-6 w-6 text-green-600" />
          ) : (
            <Upload className={`h-6 w-6 ${isUploading ? 'text-blue-600 animate-pulse' : 'text-blue-500'}`} />
          )}
          
          {isUploading ? (
            <div className="text-sm text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-1"></div>
              Uploading {fileName}...
            </div>
          ) : uploadSuccess ? (
            <div className="text-sm text-green-600 font-medium">
              ✓ {fileName} uploaded successfully
            </div>
          ) : (
            <div className="text-sm">
              <div className="font-medium text-blue-600">Click to upload {getDisplayName(documentType)}</div>
              <div className="text-xs text-gray-500 mt-1">PDF, Word, Images (max 10MB)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}