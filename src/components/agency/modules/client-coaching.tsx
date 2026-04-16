'use client';

import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    Save,
    Loader2,
    LineChart,
    TrendingUp,
    Users,
    Eye,
    MessageSquareQuote,
    LayoutDashboard,
    Share2,
    Calendar,
    Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAgencyStrategy } from '@/hooks/use-agency-clients';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgencyClient } from '@/lib/api/agency';
import { Badge } from '@/components/ui/badge';

interface ClientCoachingProps {
    client: AgencyClient;
}

export function ClientCoaching({ client }: ClientCoachingProps) {
    const { strategy, updateStrategy, isLoading, isUpdating } = useAgencyStrategy(client.urn);
    const [notes, setNotes] = useState(strategy?.advisor_notes || '');
    const { toast } = useToast();

    useEffect(() => {
        if (strategy?.advisor_notes) {
            setNotes(strategy.advisor_notes);
        }
    }, [strategy?.advisor_notes]);

    const handleSave = async () => {
        try {
            await updateStrategy({ advisor_notes: notes });
            toast({
                title: 'Coaching note saved',
                description: 'This advice is now visible to the client on their portal.',
            });
        } catch (error: any) {
            // Error handled by hook
        }
    };

    const viewsCount = strategy?.engagement_stats?.views || 0;

    return (
        <div className="space-y-4 pb-12">
            {/* Compact Stats Bar */}
            <Card className="p-3 border-gray-100 shadow-sm bg-white">
                <div className="flex flex-wrap items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                            <Eye className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Portal Views</p>
                            <h3 className="text-xs font-black text-gray-900 tracking-tight">{viewsCount} Sessions</h3>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-gray-100 hidden md:block" />

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                            <h3 className="text-xs font-black text-gray-900 tracking-tight uppercase">{client.status || 'Active'}</h3>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-gray-100 hidden md:block" />

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Last Update</p>
                            <h3 className="text-xs font-black text-gray-900 tracking-tight">
                                {strategy?.updated_at ? new Date(strategy.updated_at).toLocaleDateString() : 'N/A'}
                            </h3>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Direct Editing Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card className="lg:col-span-8 p-5 border-gray-100 shadow-xl bg-white rounded-2xl relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-600 rounded-lg text-white shadow-md shadow-brand-500/10">
                                <MessageSquareQuote className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Advisor Coaching Hub</h3>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isUpdating}
                            size="sm"
                            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg h-8 px-4 font-bold text-[10px] uppercase tracking-wider gap-2"
                        >
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Push to Portal
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Personalized advice for the candidate..."
                                className="min-h-[220px] text-[13px] leading-relaxed p-4 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-brand-500 rounded-xl resize-none transition-all"
                            />
                            <div className="absolute bottom-3 right-3 text-[9px] font-black text-gray-300 pointer-events-none uppercase tracking-tighter">
                                Visible to Client
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-brand-50/50 rounded-lg border border-brand-100/30 text-brand-700">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <p className="text-[9px] font-bold leading-tight">
                                Mention specific resume gaps or industry focuses for 40% higher engagement.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Shared Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className="p-5 border-gray-100 shadow-sm bg-white rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Share2 className="w-3.5 h-3.5 text-brand-600" />
                                Client Access
                            </h4>
                            <Badge variant="outline" className="text-[9px] font-bold border-emerald-100 text-emerald-600 bg-emerald-50">PRIVATE LINK</Badge>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Access URL</p>
                            <div className="flex items-center justify-between gap-1.5 bg-white p-1 rounded-lg border border-gray-100">
                                <code className="text-[10px] px-1.5 font-bold text-brand-600 truncate flex-1">
                                    report/{client.urn}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-md hover:bg-brand-50 hover:text-brand-600 shrink-0"
                                    onClick={() => {
                                        const url = `${window.location.origin}/report/${client.urn}`;
                                        navigator.clipboard.writeText(url);
                                        toast({ title: 'URL Copied', description: 'Access link copied to clipboard.' });
                                    }}
                                >
                                    <Share2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                            Share this link with your client. They do not need to log in to see the report. Coaching notes are exclusive to this link.
                        </p>
                    </Card>

                    <Card className="p-4 border-gray-100 bg-slate-900 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-3.5 h-3.5 text-brand-400" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Quick Actions</span>
                        </div>
                        <div className="space-y-1.5">
                            <Button variant="outline" size="sm" className="w-full justify-start text-[10px] font-bold h-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg">
                                Generate Strategy Brief
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start text-[10px] font-bold h-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg">
                                Schedule Follow-up
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
