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
import { 
    Tabs, 
    TabsList, 
    TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  CloudUpload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ClientUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

type UploadMode = 'resumes' | 'csv';

export function ClientUploadDialog({ open, onOpenChange, onUploadSuccess }: ClientUploadDialogProps) {
  const [mode, setMode] = useState<UploadMode>('resumes');
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

    // Get the session to include the access token in headers for robust auth
    const { data: { session } } = await (await import('@/db')).default.auth.getSession();

    if (mode === 'csv') {
      // Handle CSV parsing and upload
      const file = files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const clients = lines.slice(1).filter(l => l.trim()).map(line => {
          const values = line.split(',').map(v => v.trim());
          const client: any = {};
          headers.forEach((header, i) => {
            if (header.includes('name')) client.fullName = values[i];
            else if (header.includes('email')) client.email = values[i];
            else if (header.includes('phone')) client.phone = values[i];
            else if (header.includes('title') || header.includes('position')) client.position = values[i];
            else if (header.includes('location')) client.location = values[i];
          });
          return client;
        });

        try {
          const response = await fetch('/api/agency/import-csv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({ clients }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Import failed');

          setUploadResults(data.records.map((r: any) => ({ success: true, fileName: r.urn, client: r })));
          onUploadSuccess();
          toast({ title: 'Import complete', description: `Successfully imported ${data.count} candidates.` });
        } catch (error: any) {
          toast({ variant: 'destructive', title: 'Import failed', description: error.message });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
      return;
    }

    // Existing Resume Upload Logic...
    const formData = new FormData();
    files.forEach(file => formData.append('resumes', file));

    try {
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

  const downloadTemplate = () => {
    const csvContent = "Full Name,Email,Phone,Position,Location\nJohn Doe,john@example.com,+1 234 567 890,Software Engineer,\"Toronto, ON\"\nJane Smith,jane@example.com,+1 987 654 321,Project Manager,\"Vancouver, BC\"";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "jobmaze_candidate_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Template Downloaded', description: 'Use this structure for your CSV import.' });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) reset();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Candidates</DialogTitle>
          <DialogDescription>
            Onboard new clients to your agency roster.
          </DialogDescription>
        </DialogHeader>

        {!uploadResults && (
          <Tabs value={mode} onValueChange={(val) => { setMode(val as UploadMode); setFiles([]); }} className="mb-2">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1 rounded-xl h-10 border border-gray-100">
              <TabsTrigger 
                value="resumes" 
                className="rounded-xl text-[10px] font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm transition-all"
              >
                Resumes
              </TabsTrigger>
              <TabsTrigger 
                value="csv" 
                className="rounded-xl text-[10px] font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm transition-all"
              >
                CSV Import
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

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
                multiple={mode === 'resumes'}
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={mode === 'resumes' ? ".pdf,.docx,.doc" : ".csv"}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-brand-50 rounded-xl">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400">
                  {mode === 'resumes' ? "PDF or DOCX up to 10MB each" : "CSV file with names and emails"}
                </p>
              </div>
            </div>

            {mode === 'csv' && files.length === 0 && (
              <div className="space-y-3">
                <div className="p-3 bg-brand-50 rounded-xl border border-brand-100/50 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <p className="text-[10px] font-bold text-brand-700 leading-normal">
                    Tip: Ensure your CSV has headers like "Full Name", "Email", and "Phone".
                    </p>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="w-full py-2 px-3 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-3 h-3" />
                  Download Example CSV Template
                </button>
              </div>
            )}

            {files.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
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
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
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
                    {mode === 'csv' ? 'Importing...' : 'Processing...'}
                  </>
                ) : (
                  mode === 'csv' ? `Import ${files.length} File` : `Process ${files.length} Resumes`
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
