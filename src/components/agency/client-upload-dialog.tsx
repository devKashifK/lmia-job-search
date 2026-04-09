'use client';

import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  CloudUpload, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ClientUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

export function ClientUploadDialog({ open, onOpenChange, onUploadSuccess }: ClientUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadResults(null);

    const formData = new FormData();
    files.forEach(file => formData.append('resumes', file));

    try {
      // Get the session to include the access token in headers for robust auth
      const { data: { session } } = await (await import('@/db')).default.auth.getSession();
      
      const response = await fetch('/api/agency/upload-resumes', {
        method: 'POST',
        headers: {
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setUploadResults(data.results);
      onUploadSuccess();
      
      const successCount = data.results.filter((r: any) => r.success).length;
      toast({
        title: 'Upload complete',
        description: `Successfully processed ${successCount} out of ${files.length} resumes.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setUploadResults(null);
    setIsUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) reset();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Client Resumes</DialogTitle>
          <DialogDescription>
            Upload one or more resumes to automatically generate client cases.
          </DialogDescription>
        </DialogHeader>

        {!uploadResults ? (
          <div className="space-y-4 py-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-gray-50 hover:border-brand-300 group",
                files.length > 0 && "border-brand-200 bg-brand-50/20"
              )}
            >
              <input 
                type="file" 
                multiple 
                hidden 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-brand-50 rounded-full text-brand-600 group-hover:scale-110 transition-transform">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400">PDF or DOCX up to 10MB each</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <FileText className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-medium text-gray-600 flex-1 truncate">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 space-y-3">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Processing Results</h4>
            {uploadResults.map((res, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                {res.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{res.fileName}</p>
                  <p className={cn("text-[10px]", res.success ? "text-green-600" : "text-red-600")}>
                    {res.success ? `Created URN: ${res.client.urn}` : res.error}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {!uploadResults ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isUploading}>Cancel</Button>
              <Button 
                onClick={handleUpload} 
                disabled={files.length === 0 || isUploading}
                className="bg-brand-600 hover:bg-brand-700 text-white min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Process ${files.length} Resumes`
                )}
              </Button>
            </>
          ) : (
            <Button className="w-full bg-brand-600 text-white" onClick={() => onOpenChange(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
