'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Building2, 
    Sparkles, 
    History, 
    Target, 
    MapPin, 
    Trophy, 
    TrendingUp, 
    Zap, 
    Loader2,
    Lightbulb,
    CheckCircle2,
    Bell,
    Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEmployerStrategicInsights, EmployerStrategicInsights } from '@/lib/api/employer-intelligence';
import { cn } from '@/lib/utils';

interface EmployerInsightDialogProps {
    isOpen: boolean;
    onClose: () => void;
    employerName: string;
    nocCodes: string[];
    onPitch: (employer: string) => void;
}

export function EmployerInsightDialog({ isOpen, onClose, employerName, nocCodes, onPitch }: EmployerInsightDialogProps) {
    const [insights, setInsights] = useState<EmployerStrategicInsights | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && employerName) {
            async function fetchInsights() {
                setIsLoading(true);
                const data = await getEmployerStrategicInsights(employerName, nocCodes);
                setInsights(data);
                setIsLoading(false);
            }
            fetchInsights();
        }
    }, [isOpen, employerName, nocCodes]);

    const years = insights ? Object.keys(insights.yearly_distribution).sort((a, b) => b.localeCompare(a)) : [];
    const maxCount = insights ? Math.max(...Object.values(insights.yearly_distribution), 1) : 1;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden border-none bg-white text-gray-900 shadow-2xl rounded-xl">
                {/* Visual Header Sidebar Effect */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-600/5 to-transparent pointer-events-none" />
                
                <div className="relative p-5 space-y-4">
                    {/* Header Section */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-brand-600 rounded-xl shadow-sm">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <Badge variant="outline" className="text-[9px] font-bold border-brand-200 text-brand-600 bg-brand-50 px-2 py-0.5 uppercase tracking-widest">
                                    Strategic Intelligence
                                </Badge>
                                <div className="ml-auto bg-slate-900 px-1.5 py-0.5 rounded-xl flex items-center gap-1 shadow-sm border border-slate-800 scale-90">
                                    <span className="text-[9px] font-bold text-brand-500">{insights?.total_insights || 0}</span>
                                    <span className="text-[6px] font-bold text-slate-500 uppercase tracking-tighter">Hits</span>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight uppercase text-gray-900 leading-tight">{employerName}</h2>
                            <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                                <History className="w-3 h-3" /> Historical Recruitment DNA
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-10 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Synthesizing...</p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {/* Agentic Strategic Brief Card */}
                            <div className="bg-brand-600/[0.03] border-brand-500/10 p-4 rounded-xl border relative overflow-hidden group">
                                <div className="relative space-y-1.5">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-1 h-1 rounded-xl bg-brand-600 animate-pulse" />
                                        <h4 className="text-[9px] font-bold text-brand-600 uppercase tracking-widest">Agentic Insights Brief</h4>
                                    </div>
                                    <p className="text-[11px] text-gray-700 font-bold leading-relaxed pr-8">
                                        {insights?.strategic_brief || "Analyzing strategic fit..."}
                                    </p>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50/80 border border-gray-100 p-3 rounded-xl space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Trophy className="w-3 h-3 text-amber-500" />
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">LMIA</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{insights?.lmia_count || 0}</p>
                                </div>

                                <div className="bg-gray-50/80 border border-gray-100 p-3 rounded-xl space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="w-3 h-3 text-brand-600" />
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Live</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{insights?.trending_count || 0}</p>
                                </div>

                                <div className="bg-gray-50/80 border border-gray-100 p-3 rounded-xl space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Calculator className="w-3 h-3 text-blue-500" />
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Wage</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">${insights?.avg_wage?.toFixed(1) || '28.5'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Hiring Momentum Chart */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp className="w-3 h-3 text-brand-600" />
                                        <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Momentum</h3>
                                    </div>
                                    
                                    <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 h-[100px] flex flex-col justify-end gap-1.5">
                                        <div className="flex items-end justify-between h-full gap-1.5">
                                            {years.slice(0, 5).reverse().map(year => (
                                                <div key={year} className="flex-1 flex flex-col items-center gap-1 group">
                                                    <div className="relative w-full">
                                                        <div 
                                                            style={{ height: `${(insights!.yearly_distribution[year] / maxCount) * 100}%` }}
                                                            className="w-full bg-brand-600/70 rounded-t-sm group-hover:bg-brand-600 transition-colors shadow-sm min-h-[4px]"
                                                        />
                                                    </div>
                                                    <span className="text-[7px] font-bold text-gray-400 text-center">{year.toString().slice(-2)}</span>
                                                </div>
                                            ))}
                                            {years.length === 0 && (
                                                <div className="h-full w-full flex items-center justify-center italic text-gray-300 text-[9px]">No data</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Target Details */}
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <Bell className="w-3 h-3 text-amber-500" />
                                            <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Titles</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {insights?.top_titles.slice(0, 3).map((title, idx) => (
                                                <span key={idx} className="bg-white border border-gray-100 text-gray-800 px-2 py-0.5 text-[8px] font-bold rounded-xl uppercase shadow-sm">
                                                    {title}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <MapPin className="w-3 h-3 text-brand-600" />
                                            <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Hubs</h3>
                                        </div>
                                        <div className="space-y-1">
                                            {insights?.locations.slice(0, 2).map((loc, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                                                    <div className="w-1 h-1 rounded-xl bg-brand-600" />
                                                    {loc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="pt-2 flex gap-2">
                        <DialogClose asChild>
                            <Button 
                                variant="ghost" 
                                className="flex-1 bg-white border border-gray-100 text-gray-400 hover:text-gray-600 font-bold uppercase tracking-widest text-[9px] h-9 rounded-xl"
                            >
                                Dismiss
                            </Button>
                        </DialogClose>
                        <Button 
                            onClick={() => {
                                onPitch(employerName);
                                onClose();
                            }}
                            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold uppercase tracking-widest text-[9px] h-9 rounded-xl shadow-lg shadow-brand-500/20 group"
                        >
                            <Target className="w-3.5 h-3.5 mr-1.5 group-hover:scale-110 transition-transform" />
                            Initiate Pitch
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
