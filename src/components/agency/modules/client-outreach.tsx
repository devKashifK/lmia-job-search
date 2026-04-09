'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAgencyClients } from '@/hooks/use-agency-clients';
import { useToast } from '@/hooks/use-toast';
import { 
    Building2, 
    Send, 
    PhoneCall, 
    Mail, 
    Plus, 
    Clock, 
    Trash2, 
    Loader2,
    MessageSquare,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientOutreachProps {
    client: any;
}

type OutreachType = 'email' | 'call' | 'submission' | 'fb_message' | 'other';

const TYPE_CONFIG: Record<OutreachType, { icon: any; color: string; bg: string }> = {
    email:      { icon: Mail,          color: 'text-blue-600',   bg: 'bg-blue-50' },
    call:       { icon: PhoneCall,     color: 'text-green-600',  bg: 'bg-green-50' },
    submission: { icon: Send,          color: 'text-purple-600', bg: 'bg-purple-50' },
    fb_message: { icon: MessageSquare, color: 'text-sky-600',    bg: 'bg-sky-50' },
    other:      { icon: Plus,          color: 'text-gray-600',   bg: 'bg-gray-50' },
};

export function ClientOutreach({ client }: ClientOutreachProps) {
    const { updateClient, isUpdating } = useAgencyClients();
    const { toast } = useToast();
    
    const [employer, setEmployer] = useState('');
    const [type, setType] = useState<OutreachType>('email');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const outreachLog = Array.isArray(client.outreach_log) ? client.outreach_log : [];

    const handleLogInteraction = async () => {
        if (!employer.trim()) {
            toast({ variant: 'destructive', title: 'Employer Required', description: 'Please enter the employer name.' });
            return;
        }

        setIsSaving(true);
        try {
            const newEntry = {
                id: Date.now().toString(),
                employer,
                type,
                notes,
                timestamp: new Date().toISOString(),
                recruiter_id: client.agency_id
            };

            const updatedLog = [newEntry, ...outreachLog];
            await updateClient({
                id: client.id,
                updates: { outreach_log: updatedLog }
            });

            setEmployer('');
            setNotes('');
            toast({ title: 'Interaction Logged', description: `Recorded ${type} to ${employer}.` });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Log Error', description: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    const removeEntry = async (id: string) => {
        const updatedLog = outreachLog.filter((entry: any) => entry.id !== id);
        try {
            await updateClient({
                id: client.id,
                updates: { outreach_log: updatedLog }
            });
        } catch (err) {
            console.error('Failed to remove outreach entry:', err);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Log Interaction Panel */}
            <Card className="p-5 border-gray-100 shadow-sm space-y-4 h-fit">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-brand-600" />
                        Log Interaction
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">Track your outreach efforts for this client.</p>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Employer / Company</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                            <Input 
                                placeholder="Amazon, Tesla, etc."
                                className="pl-9 h-9 text-[11px] font-medium rounded-xl border-gray-100"
                                value={employer}
                                onChange={(e) => setEmployer(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Interaction Type</label>
                        <div className="flex flex-wrap gap-2">
                            {(Object.keys(TYPE_CONFIG) as OutreachType[]).map((t) => {
                                const Config = TYPE_CONFIG[t];
                                const isActive = type === t;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                                            isActive 
                                                ? cn(Config.bg, Config.color, "border-current shadow-sm") 
                                                : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                                        )}
                                    >
                                        <Config.icon className="w-3 h-3" />
                                        {t.replace('_', ' ')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Outcome / Notes</label>
                        <Textarea 
                            placeholder="e.g. Sent resume, waiting for callback, interview scheduled for Tuesday..."
                            className="text-[11px] font-medium rounded-xl border-gray-100 bg-gray-50/30 min-h-[100px] resize-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <Button 
                        onClick={handleLogInteraction}
                        disabled={isSaving || !employer.trim()}
                        className="w-full h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-[11px] shadow-md shadow-brand-500/10 gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Save Interaction
                    </Button>
                </div>
            </Card>

            {/* Outreach History */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Interaction History</h3>
                    <Badge variant="outline" className="text-[9px] font-bold text-gray-400 h-5">
                        {outreachLog.length} Records
                    </Badge>
                </div>

                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {outreachLog.map((entry: any) => {
                            const Config = TYPE_CONFIG[entry.type as OutreachType] || TYPE_CONFIG.other;
                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4"
                                >
                                    <div className={cn("p-2.5 rounded-xl shrink-0", Config.bg, Config.color)}>
                                        <Config.icon className="w-4 h-4" />
                                    </div>

                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-[11px] font-black text-gray-900 uppercase truncate">
                                                {entry.employer}
                                            </h4>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {format(new Date(entry.timestamp), 'MMM dd, h:mm a')}
                                                </div>
                                                <button 
                                                    onClick={() => removeEntry(entry.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all rounded"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                                            <span className="uppercase text-[9px] font-black mr-2 opacity-50">{entry.type}:</span>
                                            {entry.notes || <span className="italic text-gray-300">No notes provided.</span>}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {outreachLog.length === 0 && (
                        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-2xl border border-dashed border-gray-100">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-gray-200" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider">No interactions logged</p>
                                <p className="text-[10px] text-gray-300 max-w-[200px] mt-1">Start logging your calls and submissions to track your recruitment funnel.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
