import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface BasicFileInputProps {
  label: string;
  documentType: string;
  onFileSelected?: (file: File, documentType: string) => void;
}

export function BasicFileInput({ label, documentType, onFileSelected }: BasicFileInputProps) {
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onFileSelected?.(file, documentType);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
        />
      </div>
      {selectedFileName && (
        <p className="text-sm text-green-600">Selected: {selectedFileName}</p>
      )}
    </div>
  );
}