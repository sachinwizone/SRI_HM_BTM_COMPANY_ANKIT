import { useState, useRef } from "react";

interface FileUploadButtonProps {
  label: string;
  documentType: string;
  onFileSelected?: (file: File, documentType: string) => void;
}

export function FileUploadButton({ label, documentType, onFileSelected }: FileUploadButtonProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
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
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <button
        type="button"
        onClick={handleButtonClick}
        className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
      >
        {selectedFile ? (
          <>
            <span className="text-green-600">✓</span>
            {selectedFile.name}
          </>
        ) : (
          <>
            <span>📁</span>
            Click to upload {label.toLowerCase()}
          </>
        )}
      </button>
      
      {selectedFile && (
        <p className="text-sm text-green-600">
          File selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
        </p>
      )}
    </div>
  );
}