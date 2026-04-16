'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Trash2, 
    Plus, 
    RefreshCw,
    ShieldCheck,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgencyClients } from '@/hooks/use-agency-clients';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientChecklistProps {
    client: any;
}

type DocStatus = 'missing' | 'received' | 'verified';

interface ChecklistItem {
    id: string;
    label: string;
    description: string;
    status: DocStatus;
    required: boolean;
}

const TEMPLATES: Record<string, ChecklistItem[]> = {
    'express-entry': [
        { id: 'ee-1', label: 'Passport (Bio-page)', description: 'Valid for at least 6 months', status: 'missing', required: true },
        { id: 'ee-2', label: 'ECA Report', description: 'Educational Credential Assessment (WES, IQAS, etc.)', status: 'missing', required: true },
        { id: 'ee-3', label: 'Language Results', description: 'IELTS/CELPIP or TEF/TCF scores', status: 'missing', required: true },
        { id: 'ee-4', label: 'Reference Letters', description: 'Meeting NOC 2021 job duty requirements', status: 'missing', required: true },
        { id: 'ee-5', label: 'Proof of Funds', description: 'Bank statements or gift deeds', status: 'missing', required: true },
    ],
    'alberta-pnp': [
        { id: 'aa-1', label: 'Alberta Job Offer', description: 'Signed offer from an Alberta employer', status: 'missing', required: true },
        { id: 'aa-2', label: 'LMIA / WP Copy', description: 'Copy of valid work permit', status: 'missing', required: true },
        { id: 'aa-3', label: 'Birth Certificate', description: 'Standard identity document', status: 'missing', required: true },
    ],
    'study-permit': [
        { id: 'sp-1', label: 'Letter of Acceptance', description: 'DLI acceptance letter', status: 'missing', required: true },
        { id: 'sp-2', label: 'GIC Certificate', description: 'Guaranteed Investment Certificate', status: 'missing', required: true },
        { id: 'sp-3', label: 'Statement of Purpose', description: 'Detailed study plan', status: 'missing', required: true },
    ]
};

const STATUS_CONFIG: Record<DocStatus, { label: string; icon: any; color: string; bg: string }> = {
    missing:  { label: 'Missing',     icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
    received: { label: 'Received',    icon: Clock,       color: 'text-blue-500',  bg: 'bg-blue-50' },
    verified: { label: 'Verified',    icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
};

export function ClientChecklist({ client }: ClientChecklistProps) {
    const { updateClient } = useAgencyClients();
    const { toast } = useToast();
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [template, setTemplate] = useState('express-entry');

    useEffect(() => {
        const stored = client.extracted_data?.document_checklist;
        if (Array.isArray(stored) && stored.length > 0) {
            setItems(stored);
        } else {
            setItems(TEMPLATES['express-entry']);
        }
    }, [client.id]);

    const handleUpdateStatus = async (id: string, newStatus: DocStatus) => {
        const updated = items.map(item => item.id === id ? { ...item, status: newStatus } : item);
        setItems(updated);
        
        try {
            await updateClient({
                id: client.id,
                updates: {
                    extracted_data: {
                        ...(client.extracted_data || {}),
                        document_checklist: updated
                    }
                }
            });
        } catch (err) {
            console.error('Failed to update checklist:', err);
        }
    };

    const applyTemplate = async (key: string) => {
        const newItems = TEMPLATES[key] || [];
        setTemplate(key);
        setItems(newItems);
        
        try {
            await updateClient({
                id: client.id,
                updates: {
                    extracted_data: {
                        ...(client.extracted_data || {}),
                        document_checklist: newItems
                    }
                }
            });
            toast({ title: 'Template Applied', description: `Checklist reset for ${key.replace('-', ' ')}.` });
        } catch (err) {
            console.error('Failed to apply template:', err);
        }
    };

    const verifiedCount = items.filter(i => i.status === 'verified').length;
    const progress = items.length > 0 ? Math.round((verifiedCount / items.length) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar / Template Selector */}
            <div className="space-y-4">
                <Card className="p-4 border-gray-100 shadow-sm space-y-4 rounded-xl">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Template</h3>
                    <div className="space-y-1.5">
                        {Object.keys(TEMPLATES).map(key => (
                            <button
                                key={key}
                                onClick={() => applyTemplate(key)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all border",
                                    template === key 
                                        ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20" 
                                        : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                {key.replace('-', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </Card>

                <Card className="p-4 border-gray-100 shadow-sm bg-slate-900 text-white relative overflow-hidden rounded-xl">
                    <ShieldCheck className="absolute top-[-5px] right-[-5px] w-12 h-12 text-white/5" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60">Verification Progress</h3>
                    <div className="mt-4 flex items-end justify-between">
                        <div className="text-3xl font-bold">{progress}%</div>
                        <div className="text-[10px] font-bold opacity-60 pb-1">{verifiedCount} / {items.length} VERIFIED</div>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-white/10 rounded-xl overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-brand-400"
                        />
                    </div>
                </Card>
            </div>

            {/* Main Checklist */}
            <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Required Documents
                    </h3>
                </div>

                <div className="space-y-2">
                    <AnimatePresence initial={false}>
                        {items.map((item, idx) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn(
                                    "group bg-white border rounded-xl p-4 flex items-center justify-between gap-4 transition-all hover:shadow-md",
                                    item.status === 'verified' ? "border-green-100 bg-green-50/5" : "border-gray-100"
                                )}
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                        item.status === 'verified' ? "bg-green-50 border-green-100 text-green-600" : "bg-gray-50 border-gray-100 text-gray-300"
                                    )}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className={cn(
                                                "text-[11px] font-bold uppercase tracking-tight truncate",
                                                item.status === 'verified' ? "text-green-700" : "text-gray-900"
                                            )}>{item.label}</h4>
                                            {item.required && <Badge className="bg-slate-100 text-slate-400 text-[8px] h-3.5 px-1 font-bold rounded-xl">MANDATORY</Badge>}
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold tracking-tight truncate">{item.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {(Object.keys(STATUS_CONFIG) as DocStatus[]).map(status => {
                                        const Config = STATUS_CONFIG[status];
                                        const isActive = item.status === status;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateStatus(item.id, status)}
                                                className={cn(
                                                    "px-2 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-tight transition-all border",
                                                    isActive 
                                                        ? cn(Config.bg, Config.color, "border-current shadow-sm scale-110 z-10") 
                                                        : "bg-white border-transparent text-gray-300 hover:text-gray-400"
                                                )}
                                            >
                                                {status}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {items.length === 0 && (
                        <div className="py-20 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-xl mx-10">
                            <Search className="w-8 h-8 text-brand-100 mx-auto mb-3" />
                            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest leading-none">Checklist Empty</p>
                            <p className="text-[9px] text-gray-300 mt-2 max-w-[140px] mx-auto font-bold uppercase tracking-tighter">Apply a template to start tracking documents.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
