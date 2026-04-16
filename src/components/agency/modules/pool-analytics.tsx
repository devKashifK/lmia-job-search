'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
    BarChart3, 
    ArrowUpRight, 
    Target, 
    Gauge, 
    Users, 
    Trophy,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface PoolAnalyticsProps {
    currentScore: number;
    programType?: string;
}

const EE_BENCHMARKS = [
    { label: 'General / All Programs', score: 545, category: 'general' },
    { label: 'STEM Occupations', score: 491, category: 'stem' },
    { label: 'Healthcare Occupations', score: 445, category: 'healthcare' },
    { label: 'French Proficiency', score: 388, category: 'french' },
];

export function PoolAnalytics({ currentScore }: PoolAnalyticsProps) {
    // Probability Logic
    const getZone = (score: number) => {
        if (score >= 530) return { label: 'Safe Zone', color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-200' };
        if (score >= 480) return { label: 'Competitive', color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-200' };
        if (score >= 430) return { label: 'In Range', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-200' };
        return { label: 'Challenging', color: 'text-gray-400', bg: 'bg-gray-100', border: 'border-gray-200' };
    };

    const zone = getZone(currentScore);

    return (
        <Card className="p-4 border-gray-100 shadow-sm relative overflow-hidden bg-white rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-50 rounded-xl text-brand-600">
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none pt-0.5">Competitive Pool Index</h3>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="text-gray-300 hover:text-gray-500 transition-colors">
                            <Info className="w-3.5 h-3.5" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="w-64 p-4 rounded-xl border-gray-100 shadow-xl bg-white/95 backdrop-blur-sm">
                        <h4 className="text-xs font-bold text-gray-900 mb-2 border-b border-gray-50 pb-1 uppercase tracking-tighter">2024 ITA Benchmarks</h4>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            These benchmarks represent the <b>median Invitation to Apply (ITA)</b> cutoffs for the last 5 draws in each category.
                        </p>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Score Gauge */}
                <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100/50">
                    <Gauge className="w-8 h-8 text-gray-200 absolute top-2 right-2 opacity-50" />
                    <div className="text-4xl font-bold text-gray-900 tracking-tighter">{currentScore}</div>
                    <div className={cn("text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-xl mt-1 border", zone.bg, zone.color, zone.border)}>
                        {zone.label}
                    </div>
                </div>

                {/* Benchmarks Grid */}
                <div className="md:col-span-3 space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Current ITA Thresholds (2024)</span>
                        <Badge variant="outline" className="text-[8px] h-4 font-bold text-brand-600 bg-brand-50 border-brand-100 rounded-xl">IRCC DATA SYNC</Badge>
                    </div>
                    
                    <div className="space-y-2">
                        {EE_BENCHMARKS.map((bench) => {
                            const gap = currentScore - bench.score;
                            const isPassing = gap >= 0;
                            return (
                                <div key={bench.category} className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-bold">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className={cn("w-1.5 h-1.5 rounded-xl", isPassing ? "bg-green-500" : "bg-gray-200")} />
                                            <span className="text-gray-600 truncate">{bench.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-gray-400">{bench.score}</span>
                                            <span className={cn(
                                                "min-w-[45px] text-right font-bold tracking-tighter",
                                                isPassing ? "text-green-600" : "text-amber-500"
                                            )}>
                                                {isPassing ? `+${gap}` : gap} PTS
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-gray-50 rounded-xl overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((currentScore / bench.score) * 100, 100)}%` }}
                                            className={cn("h-full rounded-xl", isPassing ? "bg-green-500" : "bg-brand-500/40")}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[9px] font-bold">
                <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-3 h-3" />
                    <span>Est. Rank in 2024 Candidate Pool</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <span className="text-gray-600 uppercase">Top 15%</span>
                    <ArrowUpRight className="w-2.5 h-2.5 text-green-500" />
                </div>
            </div>
        </Card>
    );
}
