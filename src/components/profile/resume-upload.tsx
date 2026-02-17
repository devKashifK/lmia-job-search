"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import db from "@/db";
import { useSession } from "@/hooks/use-session";
import { FileText, Upload, X, Loader2, Download, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
    currentResumeUrl?: string;
    onUploadComplete?: (url: string) => void;
    onAnalysisComplete?: (data: any) => void;
}

export function ResumeUpload({ currentResumeUrl, onUploadComplete, onAnalysisComplete }: ResumeUploadProps) {
    const { session } = useSession();
    const { toast } = useToast();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (!session?.user) return;

        // Validate file type (PDF or DOC/DOCX)
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            toast({
                variant: "destructive",
                title: "Invalid file type",
                description: "Please upload a PDF or Word document.",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "File too large",
                description: "Maximum file size is 5MB.",
            });
            return;
        }

        setIsUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}/resume-${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError, data } = await db.storage
                .from('resumes')
                .upload(fileName, file, {
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = db.storage
                .from('resumes')
                .getPublicUrl(fileName);

            // Update User Metadata
            const { error: updateError } = await db.auth.updateUser({
                data: {
                    resume_url: publicUrl,
                    resume_name: file.name, // Store original filename for display
                    resume_updated_at: new Date().toISOString(),
                }
            });

            if (updateError) throw updateError;

            toast({
                title: "Resume uploaded",
                description: "Your resume has been successfully uploaded.",
            });

            if (onUploadComplete) {
                onUploadComplete(publicUrl);
            }

        } catch (error: any) {
            console.error('Resume upload error:', error);
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: error.message || "Failed to upload resume. Please try again.",
            });
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAnalyze = async () => {
        if (!currentResumeUrl) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/analyze-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeUrl: currentResumeUrl }),
            });

            if (!response.ok) {
                throw new Error("Analysis failed");
            }

            const { data, error } = await response.json();

            if (error) throw new Error(error);

            toast({
                title: "Analysis Complete",
                description: "Please review the extracted data.",
            });

            if (onAnalysisComplete) {
                onAnalysisComplete(data);
            }

        } catch (error: any) {
            console.error("Analysis error:", error);
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: error.message || "Could not analyze resume.",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDelete = async () => {
        setIsUploading(true);
        try {
            const { error } = await db.auth.updateUser({
                data: {
                    resume_url: null,
                    resume_name: null,
                    resume_updated_at: null,
                }
            });

            if (error) throw error;

            toast({
                title: "Resume removed",
                description: "Your resume has been removed from your profile.",
            });

            if (onUploadComplete) onUploadComplete("");

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to remove resume.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">


            {!currentResumeUrl ? (
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 px-6 py-10 transition-colors text-center cursor-pointer",
                        isDragging ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-gray-400",
                        isUploading && "pointer-events-none opacity-50"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                        {isUploading ? (
                            <Loader2 className="h-6 w-6 text-brand-600 animate-spin" />
                        ) : (
                            <Upload className="h-6 w-6 text-gray-400" />
                        )}
                    </div>

                    <div className="space-y-1 text-center">
                        <p className="text-sm font-medium text-gray-900">
                            {isUploading ? "Uploading..." : "Click or drag file to upload"}
                        </p>
                        <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX (Max 5MB)
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-3 flex flex-col gap-3 group hover:border-brand-200 transition-colors relative">
                    {/* Top Row: File Info & Quick Actions */}
                    <div className="flex items-start justify-between gap-3 w-full">
                        <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate pr-2">
                                    {session?.user?.user_metadata?.resume_name || "Uploaded Resume"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {session?.user?.user_metadata?.resume_updated_at ? new Date(session.user.user_metadata.resume_updated_at).toLocaleDateString() : 'Recently'}
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions (Download/Delete) */}
                        <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-brand-600 rounded-lg" asChild>
                                <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer" download>
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                onClick={handleDelete}
                                disabled={isUploading}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Bottom Row: Primary Actions */}
                    <div className="flex items-center gap-2 w-full pt-2 border-t border-gray-50">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 gap-1.5 text-xs font-medium"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isAnalyzing}
                        >
                            <Upload className="h-3.5 w-3.5" />
                            Replace
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 text-brand-700 border-brand-200 bg-brand-50 hover:bg-brand-100 hover:text-brand-800 h-8 text-xs font-medium"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || isUploading}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Auto-Fill
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                disabled={isUploading}
            />
        </div >
    );
}
