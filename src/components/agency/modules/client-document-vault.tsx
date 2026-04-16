'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import {
    FileText, Upload, CheckCircle2, XCircle, Clock, Plus, Trash2,
    Download, Eye, FolderOpen, AlertCircle, ChevronDown, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Document {
    id: string;
    name: string;
    category: string;
    status: 'requested' | 'uploaded' | 'approved' | 'rejected';
    required: boolean;
    request_note: string | null;
    file_url: string | null;
    file_name: string | null;
    file_size: number | null;
    rejection_reason: string | null;
    uploaded_at: string | null;
    reviewed_at: string | null;
    created_at: string;
}

const DOCUMENT_PRESETS = [
    { name: 'Passport', category: 'identity' },
    { name: 'Work Permit', category: 'immigration' },
    { name: 'IELTS Certificate', category: 'language' },
    { name: 'Degree / Diploma', category: 'education' },
    { name: 'Reference Letter', category: 'employment' },
    { name: 'Job Offer Letter', category: 'employment' },
    { name: 'Police Clearance Certificate', category: 'identity' },
    { name: 'Medical Examination', category: 'immigration' },
];

const STATUS_CONFIG = {
    requested: { label: 'Awaiting Upload', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    uploaded: { label: 'Pending Review', icon: Eye, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200' },
};

const CATEGORY_COLORS: Record<string, string> = {
    identity: 'bg-purple-50 text-purple-700',
    language: 'bg-blue-50 text-blue-700',
    education: 'bg-indigo-50 text-indigo-700',
    employment: 'bg-amber-50 text-amber-700',
    immigration: 'bg-brand-50 text-brand-700',
    general: 'bg-slate-50 text-slate-600',
};

interface ClientDocumentVaultProps {
    clientUrn: string;
    clientName: string;
}

export function ClientDocumentVault({ clientUrn, clientName }: ClientDocumentVaultProps) {
    const { session } = useSession();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [showRequestForm, setShowRequestForm] = useState(false);
    const [newDocs, setNewDocs] = useState([{ name: '', category: 'general', required: true, request_note: '' }]);
    const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['agency-documents', clientUrn],
        queryFn: async () => {
            const res = await fetch(`/api/agency/documents/${clientUrn}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            const json = await res.json();
            return json.documents as Document[];
        },
        enabled: !!clientUrn && !!session,
        refetchInterval: 30000,
    });

    const requestMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/agency/documents/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ clientUrn, documents: newDocs.filter(d => d.name.trim()) }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agency-documents', clientUrn] });
            setShowRequestForm(false);
            setNewDocs([{ name: '', category: 'general', required: true, request_note: '' }]);
            toast({ title: 'Documents Requested', description: `Request sent to ${clientName}'s portal.` });
        },
        onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' })
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ documentId, action, rejectionReason }: { documentId: string; action: string; rejectionReason?: string }) => {
            const res = await fetch('/api/agency/documents/review', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ documentId, action, rejectionReason }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['agency-documents', clientUrn] });
            setRejectTarget(null);
            setRejectionReason('');
            toast({
                title: vars.action === 'approved' ? '✅ Document Approved' : '❌ Document Rejected',
                description: 'Status updated and logged.'
            });
        },
        onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' })
    });

    const deleteMutation = useMutation({
        mutationFn: async (documentId: string) => {
            const res = await fetch(`/api/agency/documents/delete?documentId=${documentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agency-documents', clientUrn] });
            setDeleteTarget(null);
            toast({ title: 'Request Deleted', description: 'The document request has been removed.' });
        },
        onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' })
    });

    const documents = data || [];
    const pendingCount = documents.filter(d => d.status === 'uploaded').length;
    const approvedCount = documents.filter(d => d.status === 'approved').length;
    const requestedCount = documents.filter(d => d.status === 'requested').length;

    return (
        <div className="space-y-5">
            {/* Header Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <FolderOpen className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Document Vault</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{documents.length} Total · {approvedCount} Approved · {pendingCount} Pending Review</p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowRequestForm(!showRequestForm)}
                    className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white"
                >
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Request Docs
                </Button>
            </div>

            {/* Stats Row */}
            {documents.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Awaiting Upload', count: requestedCount, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                        { label: 'Pending Review', count: pendingCount, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                        { label: 'Approved', count: approvedCount, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                    ].map(stat => (
                        <div key={stat.label} className={cn("p-3 rounded-xl border text-center", stat.bg)}>
                            <p className={cn("text-xl font-black", stat.color)}>{stat.count}</p>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wide">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Request Form */}
            <AnimatePresence>
                {showRequestForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4"
                    >
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quick Add from Presets</p>
                        <div className="flex flex-wrap gap-2">
                            {DOCUMENT_PRESETS.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => setNewDocs(prev => [...prev, { name: preset.name, category: preset.category, required: true, request_note: '' }])}
                                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-700 hover:border-brand-300 hover:bg-brand-50 transition-all"
                                >
                                    + {preset.name}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {newDocs.map((doc, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100">
                                    <Input
                                        value={doc.name}
                                        onChange={e => setNewDocs(prev => prev.map((d, j) => j === i ? { ...d, name: e.target.value } : d))}
                                        placeholder="Document name..."
                                        className="h-8 text-xs flex-1 border-slate-200"
                                    />
                                    <select
                                        value={doc.category}
                                        onChange={e => setNewDocs(prev => prev.map((d, j) => j === i ? { ...d, category: e.target.value } : d))}
                                        className="h-8 text-xs border border-slate-200 rounded-lg px-2 bg-white"
                                    >
                                        <option value="general">General</option>
                                        <option value="identity">Identity</option>
                                        <option value="language">Language</option>
                                        <option value="education">Education</option>
                                        <option value="employment">Employment</option>
                                        <option value="immigration">Immigration</option>
                                    </select>
                                    <button onClick={() => setNewDocs(prev => prev.filter((_, j) => j !== i))} className="p-1.5 text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setNewDocs(prev => [...prev, { name: '', category: 'general', required: true, request_note: '' }])}
                                className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 text-[10px] font-black text-slate-400 hover:border-brand-400 hover:text-brand-600 transition-all"
                            >
                                + Add Document
                            </button>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowRequestForm(false)} className="h-8 text-xs rounded-xl">Cancel</Button>
                            <Button
                                onClick={() => requestMutation.mutate()}
                                disabled={requestMutation.isPending || !newDocs.some(d => d.name.trim())}
                                className="h-8 text-xs rounded-xl bg-brand-600 hover:bg-brand-700 text-white"
                            >
                                {requestMutation.isPending ? 'Sending...' : `Send Request (${newDocs.filter(d => d.name.trim()).length})`}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document List */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-400">
                    <FolderOpen className="w-8 h-8 mx-auto mb-3 opacity-30 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Loading vault...</p>
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Shield className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-tight">Document Vault Empty</p>
                    <p className="text-[11px] text-slate-400 mt-1">Request documents from {clientName} to get started.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {documents.map(doc => {
                        const cfg = STATUS_CONFIG[doc.status];
                        const Icon = cfg.icon;
                        return (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-brand-100 transition-all"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{doc.name}</h4>
                                                {doc.required && <span className="text-[8px] font-black text-red-500 uppercase">Required</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-md capitalize", CATEGORY_COLORS[doc.category])}>
                                                    {doc.category}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold">
                                                    {format(new Date(doc.created_at), 'MMM d')}
                                                </span>
                                                {doc.file_name && (
                                                    <span className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">{doc.file_name}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge className={cn("text-[9px] font-black border rounded-lg px-2 py-1 gap-1.5", cfg.color)}>
                                            <Icon className="w-3 h-3" />
                                            {cfg.label}
                                        </Badge>

                                        {/* Actions for uploaded documents */}
                                        {doc.status === 'uploaded' && doc.file_url && (
                                            <div className="flex items-center gap-1.5">
                                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" className="h-8 w-8 p-0 rounded-xl border-slate-200 hover:bg-slate-50">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </Button>
                                                </a>
                                                <Button
                                                    onClick={() => reviewMutation.mutate({ documentId: doc.id, action: 'approved' })}
                                                    disabled={reviewMutation.isPending}
                                                    className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase"
                                                >
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => setRejectTarget({ id: doc.id, name: doc.name })}
                                                    className="h-8 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[9px] font-black uppercase"
                                                >
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}

                                        {/* Download for approved docs */}
                                        {doc.status === 'approved' && doc.file_url && (
                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" className="h-8 w-8 p-0 rounded-xl border-emerald-200 hover:bg-emerald-50">
                                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                                </Button>
                                            </a>
                                        )}
                                        <Button
                                            onClick={() => setDeleteTarget({ id: doc.id, name: doc.name })}
                                            variant="ghost"
                                            className="h-8 w-8 p-0 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {doc.status === 'rejected' && doc.rejection_reason && (
                                    <div className="mt-2 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
                                        <p className="text-[10px] font-bold text-red-600">Rejection reason: {doc.rejection_reason}</p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Rejection Modal */}
            <AnimatePresence>
                {rejectTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setRejectTarget(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">Reject Document</h3>
                                    <p className="text-[11px] text-gray-500">{rejectTarget.name}</p>
                                </div>
                            </div>
                            <textarea
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                placeholder="Reason for rejection (candidate will see this)..."
                                className="w-full h-24 p-3 text-sm border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-red-100 outline-none"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setRejectTarget(null)} className="rounded-xl">Cancel</Button>
                                <Button
                                    onClick={() => reviewMutation.mutate({ documentId: rejectTarget.id, action: 'rejected', rejectionReason })}
                                    disabled={reviewMutation.isPending}
                                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Confirm Rejection
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setDeleteTarget(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">Delete Request?</h3>
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                        This will permanently remove the request for <span className="font-bold text-slate-900">{deleteTarget.name}</span>. 
                                        If a file was uploaded, it will also be deleted from storage.
                                    </p>
                                </div>
                                <div className="flex w-full gap-2 pt-2">
                                    <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl">Cancel</Button>
                                    <Button
                                        onClick={() => deleteMutation.mutate(deleteTarget.id)}
                                        disabled={deleteMutation.isPending}
                                        className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest"
                                    >
                                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
