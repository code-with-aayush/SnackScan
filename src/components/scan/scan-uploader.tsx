'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function ScanUploader() {
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const router = useRouter();

  const handleFileChange = (file: File | null) => {
    if (file) {
      setLoading(true);
      // Simulate API call for OCR and AI analysis
      setTimeout(() => {
        // In a real app, the ID would come from the created scan record
        const mockScanId = "chips-123";
        router.push(`/scan/${mockScanId}`);
      }, 2000);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">Analyzing your product...</p>
        <p className="text-sm text-muted-foreground">This may take a moment.</p>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 ${
        dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => handleFileChange(e.target.files ? e.target.files[0] : null)}
      />
      <div className="flex flex-col items-center">
        <UploadCloud className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 font-semibold">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-muted-foreground">
          PNG, JPG, or GIF (max. 10MB)
        </p>
      </div>
    </div>
  );
}
