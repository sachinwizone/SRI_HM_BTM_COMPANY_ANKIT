import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileCheck } from "lucide-react";

interface BasicFileInputProps {
  label: string;
  documentType: string;
  onFileSelected?: (file: File, documentType: string) => void;
}

export function BasicFileInput({ label, documentType, onFileSelected }: BasicFileInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelected?.(file, documentType);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileChange}
          className="hidden"
          data-testid={`file-input-${documentType}`}
        />
        <Button 
          type="button"
          variant="outline" 
          className="w-full" 
          onClick={handleClick}
          data-testid={`upload-button-${documentType}`}
        >
          {selectedFile ? (
            <>
              <FileCheck className="w-4 h-4 mr-2 text-green-600" />
              {selectedFile.name}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Click to upload {label.toLowerCase()}
            </>
          )}
        </Button>
      </div>
      {selectedFile && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ File selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </p>
      )}
    </div>
  );
}