'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import { Calendar, Users, TrendingUp, ChevronRight, ExternalLink, Zap, Shield, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DrawEligibility {
    id: string;
    draw_date: string;
    draw_type: string;
    min_crs: number;
    invitations_issued: number;
    draw_round: string | null;
    source_url: string | null;
    eligible_clients: Array<{ urn: string; full_name: string; crs_score: number }>;
    near_eligible_clients: Array<{ urn: string; full_name: string; crs_score: number }>;
    eligible_count: number;
    near_eligible_count: number;
}

const DRAW_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Express Entry': { bg: 'bg-brand-100', text: 'text-brand-700', border: 'border-brand-200' },
    'French Language': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'STEM': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    'Healthcare': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    'Trade': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    'PNP': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
};

export function DrawCalendar() {
    const { session } = useSession();
    const [expandedDraw, setExpandedDraw] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['ircc-draws'],
        queryFn: async () => {
            const res = await fetch('/api/agency/draws', {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            const json = await res.json();
            return json as { draws: DrawEligibility[]; total_clients: number };
        },
        enabled: !!session,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const draws = data?.draws || [];
    const totalClients = data?.total_clients || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-brand-300" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">IRCC Draw Calendar</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Express Entry & Category-Based Selection · {totalClients} clients with CRS data
                        </p>
                    </div>
                </div>
                <a
                    href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-widest transition-all"
                >
                    <ExternalLink className="w-3 h-3" />
                    IRCC Source
                </a>
            </div>

            {/* Summary Cards */}
            {draws.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-brand-900 text-white p-5 rounded-2xl relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full" />
                        <p className="text-[9px] font-black text-brand-300 uppercase tracking-widest mb-1">Latest Draw CRS</p>
                        <p className="text-3xl font-black">{draws[0]?.min_crs}</p>
                        <p className="text-[10px] text-brand-400 mt-1 font-bold">{draws[0]?.draw_type}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Eligible Now</p>
                        <p className="text-3xl font-black text-emerald-700">{draws[0]?.eligible_count || 0}</p>
                        <p className="text-[10px] text-emerald-600 mt-1 font-bold">clients ready for latest draw</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Within 50 Pts</p>
                        <p className="text-3xl font-black text-amber-700">{draws[0]?.near_eligible_count || 0}</p>
                        <p className="text-[10px] text-amber-600 mt-1 font-bold">clients close to threshold</p>
                    </div>
                </div>
            )}

            {/* Draw List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : draws.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-black text-slate-400">No Draw Data Available</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {draws.map((draw, idx) => {
                        const typeStyle = DRAW_TYPE_COLORS[draw.draw_type] || DRAW_TYPE_COLORS['Express Entry'];
                        const isExpanded = expandedDraw === draw.id;
                        const isLatest = idx === 0;

                        return (
                            <motion.div
                                key={draw.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className={cn(
                                    "bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer hover:border-brand-200",
                                    isLatest ? "border-brand-200 shadow-md shadow-brand-50" : "border-gray-100"
                                )}
                                onClick={() => setExpandedDraw(isExpanded ? null : draw.id)}
                            >
                                <div className="p-4 flex items-center gap-4">
                                    {/* Date */}
                                    <div className="w-14 text-center shrink-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">
                                            {format(new Date(draw.draw_date), 'MMM')}
                                        </p>
                                        <p className="text-2xl font-black text-slate-900 leading-none">
                                            {format(new Date(draw.draw_date), 'd')}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-400">
                                            {format(new Date(draw.draw_date), 'yyyy')}
                                        </p>
                                    </div>

                                    <div className="w-px h-10 bg-slate-100 shrink-0" />

                                    {/* Draw Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={cn("text-[8px] font-black border px-2 py-0.5 rounded-lg", typeStyle.bg, typeStyle.text, typeStyle.border)}>
                                                {draw.draw_type}
                                            </Badge>
                                            {isLatest && (
                                                <Badge className="text-[8px] font-black bg-brand-600 text-white border-none px-2 py-0.5 rounded-lg">
                                                    LATEST
                                                </Badge>
                                            )}
                                            {draw.draw_round && (
                                                <span className="text-[9px] font-bold text-slate-400">{draw.draw_round}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <span className="text-[10px] font-black text-slate-700">
                                                Min CRS: <span className="text-brand-600">{draw.min_crs}</span>
                                            </span>
                                            <span className="text-[10px] font-black text-slate-500">
                                                {draw.invitations_issued.toLocaleString()} invited
                                            </span>
                                        </div>
                                    </div>

                                    {/* Eligibility Indicators */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {draw.eligible_count > 0 && (
                                            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-xl">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-700">{draw.eligible_count} Eligible</span>
                                            </div>
                                        )}
                                        {draw.near_eligible_count > 0 && (
                                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-xl">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                <span className="text-[10px] font-black text-amber-700">{draw.near_eligible_count} Near</span>
                                            </div>
                                        )}
                                        <ChevronRight className={cn("w-4 h-4 text-slate-300 transition-transform", isExpanded && "rotate-90")} />
                                    </div>
                                </div>

                                {/* Expanded: Client List */}
                                {isExpanded && (draw.eligible_clients.length > 0 || draw.near_eligible_clients.length > 0) && (
                                    <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-3">
                                        {draw.eligible_clients.length > 0 && (
                                            <div>
                                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <Shield className="w-3 h-3" /> Eligible Clients (CRS ≥ {draw.min_crs})
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {draw.eligible_clients.map(c => (
                                                        <div key={c.urn} className="flex items-center gap-1.5 bg-white border border-emerald-100 rounded-xl px-2.5 py-1.5">
                                                            <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center">
                                                                <span className="text-[8px] font-black text-emerald-700">{c.full_name?.charAt(0)}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-700">{c.full_name}</span>
                                                            <span className="text-[9px] font-black text-emerald-600">CRS {c.crs_score}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {draw.near_eligible_clients.length > 0 && (
                                            <div>
                                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <Zap className="w-3 h-3" /> Close to Threshold (within 50 pts)
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {draw.near_eligible_clients.map(c => (
                                                        <div key={c.urn} className="flex items-center gap-1.5 bg-white border border-amber-100 rounded-xl px-2.5 py-1.5">
                                                            <div className="w-4 h-4 rounded bg-amber-100 flex items-center justify-center">
                                                                <span className="text-[8px] font-black text-amber-700">{c.full_name?.charAt(0)}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-700">{c.full_name}</span>
                                                            <span className="text-[9px] font-black text-amber-600">CRS {c.crs_score} ({draw.min_crs - c.crs_score} pts away)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {draw.eligible_clients.length === 0 && draw.near_eligible_clients.length === 0 && (
                                            <p className="text-[10px] text-slate-400 font-bold italic">No clients in your pool match this draw's criteria.</p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
