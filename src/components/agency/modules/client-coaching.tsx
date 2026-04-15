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
        <div className="space-y-6 pb-20">
            {/* Header / Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-gray-100 shadow-sm bg-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Portal Engagement</p>
                            <h3 className="text-xl font-black text-gray-900 tracking-tighter">{viewsCount} Views</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-gray-100 shadow-sm bg-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Client Status</p>
                            <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">{client.status || 'Active'}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-gray-100 shadow-sm bg-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Last Interaction</p>
                            <h3 className="text-xl font-black text-gray-900 tracking-tighter">
                                {strategy?.updated_at ? new Date(strategy.updated_at).toLocaleDateString() : 'N/A'}
                            </h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Editing Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3 p-6 border-gray-100 shadow-xl bg-white rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                                <MessageSquareQuote className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-900 tracking-tight">Advisor Coaching Hub</h3>
                                <p className="text-xs text-gray-400 font-bold">Injected directly into the candidate's roadmap report.</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-10 px-6 font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-500/20 gap-2"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Push to Portal
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Write your personalized advice for this candidate here... Use this to guide them through the next steps of their job search."
                                className="min-h-[300px] text-sm leading-relaxed p-4 bg-gray-50 border-gray-100 focus:bg-white focus:border-brand-500 rounded-2xl resize-none transition-all"
                            />
                            <div className="absolute bottom-4 right-4 text-[10px] font-bold text-gray-300 pointer-events-none">
                                CLIENT VISIBLE
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl border border-brand-100/50 text-brand-700">
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <p className="text-[10px] font-bold leading-normal">
                                Pro-Tip: Candidates respond 40% better to personalized feedback. Mention specific resume gaps or industry focuses.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Preview / Guidelines */}
                <div className="lg:col-span-2 space-y-6">
                   */}

                    <Card className="p-6 border-gray-100 shadow-sm bg-white rounded-2xl space-y-4">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-brand-600" />
                            Client Access
                        </h4>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Public Access URL</p>
                            <div className="flex items-center justify-between gap-2">
                                <code className="text-[10px] bg-white px-2 py-1 rounded border border-gray-200 text-brand-700 truncate flex-1">
                                    report/{client.urn}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-brand-50 hove:text-brand-600"
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
                            Share this link with your client. They do not need to log in to see the report, but your coaching notes will be exclusive to this link.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
