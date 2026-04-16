'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import {
    Mail, FileText, CheckCircle2, XCircle, MessageSquare,
    RotateCcw, BookOpen, User, Eye, Activity, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityLog {
    id: string;
    action_type: string;
    description: string;
    metadata: any;
    created_at: string;
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    email_sent: { icon: Mail, color: 'bg-blue-100 text-blue-600', label: 'Email Sent' },
    doc_requested: { icon: FileText, color: 'bg-amber-100 text-amber-600', label: 'Docs Requested' },
    doc_approved: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600', label: 'Doc Approved' },
    doc_rejected: { icon: XCircle, color: 'bg-red-100 text-red-600', label: 'Doc Rejected' },
    msg_sent: { icon: MessageSquare, color: 'bg-brand-100 text-brand-600', label: 'Message Sent' },
    status_changed: { icon: RotateCcw, color: 'bg-slate-100 text-slate-600', label: 'Status Changed' },
    note_pushed: { icon: BookOpen, color: 'bg-purple-100 text-purple-600', label: 'Note Published' },
    profile_updated: { icon: User, color: 'bg-indigo-100 text-indigo-600', label: 'Profile Updated' },
    portal_viewed: { icon: Eye, color: 'bg-slate-100 text-slate-500', label: 'Portal Viewed' },
};

const FILTER_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'email_sent', label: 'Emails' },
    { key: 'doc_', label: 'Documents' },
    { key: 'message_sent', label: 'Messages' },
    { key: 'status_changed', label: 'Status' },
];

interface ClientActivityLogProps {
    clientUrn: string;
}

export function ClientActivityLog({ clientUrn }: ClientActivityLogProps) {
    const { session } = useSession();
    const [activeFilter, setActiveFilter] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['agency-activity', clientUrn],
        queryFn: async () => {
            const res = await fetch(`/api/agency/activity/${clientUrn}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            const json = await res.json();
            return json.activity as ActivityLog[];
        },
        enabled: !!clientUrn && !!session,
    });

    const logs = data || [];
    const filtered = activeFilter === 'all'
        ? logs
        : logs.filter(l => l.action_type.startsWith(activeFilter));

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Activity className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Activity Log</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{logs.length} events recorded</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        const csv = ['Timestamp,Action,Description', ...logs.map(l =>
                            `"${format(new Date(l.created_at), 'yyyy-MM-dd HH:mm')}","${l.action_type}","${l.description.replace(/"/g, "'")}"`)
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `activity-log-${clientUrn}.csv`;
                        a.click();
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
                >
                    <Download className="w-3 h-3" />
                    Export CSV
                </button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 flex-wrap">
                {FILTER_OPTIONS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        className={cn(
                            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                            activeFilter === f.key
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="max-h-[480px] overflow-y-auto scrollbar-none pr-1">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-400">
                        <Activity className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Parsing Event Stream...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Activity className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-tight">No Activity Logged</p>
                        <p className="text-[11px] text-slate-400 mt-1">Actions on this candidate will appear here.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-5 top-2 bottom-2 w-[2px] bg-slate-100/50" />
                        <div className="space-y-3">
                            {filtered.map(log => {
                                const cfg = ACTION_CONFIG[log.action_type] || ACTION_CONFIG.profile_updated;
                                const Icon = cfg.icon;
                                return (
                                    <div key={log.id} className="flex gap-4 relative">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 border-[3px] border-white shadow-sm ring-1 ring-slate-100", cfg.color)}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 hover:border-brand-100 hover:shadow-sm transition-all group">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-[11px] font-bold text-slate-800 leading-tight flex-1">{log.description}</p>
                                                <div className="text-right shrink-0">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-70 group-hover:opacity-100">
                                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: false })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider", cfg.color)}>
                                                    {cfg.label}
                                                </span>
                                                <span className="text-[9px] text-slate-300 font-bold">
                                                    {format(new Date(log.created_at), 'MMM d, HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
