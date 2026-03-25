"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Info, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface WageVisualizationProps {
    noc: string;
    province?: string;
    currentWage?: number; // Hourly wage
    title?: string;
    onInfoClick?: () => void;
}

interface WageStats {
    min_wage: number;
    median_wage: number;
    max_wage: number;
    avg_wage: number;
    sample_size: number;
    province: string | null;
    noc_code: string;
}

export function WageVisualization({ noc, province, currentWage, title, onInfoClick }: WageVisualizationProps) {
    const [stats, setStats] = useState<WageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            if (!noc) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { getWageStats } = await import('@/lib/api/analytics');
                const data = await getWageStats(noc, province || null);

                setStats(data);
            } catch (err) {
                console.error("Failed to fetch wage stats:", err);
                setError("Could not load wage data");
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [noc, province]);

    if (loading) {
        return (
            <Card className="border-0 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between">
                        <Skeleton className="h-6 w-1/4 rounded-lg" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </CardContent>
            </Card>
        );
    }

    if (error || !stats || !stats.sample_size) {
        return null;
    }

    // Calculate position percentage for current wage
    const range = stats.max_wage - stats.min_wage;
    const safeRange = range > 0 ? range : 1;

    // Clamp current wage visually between min and max
    const chartMin = stats.min_wage * 0.9;
    const chartMax = stats.max_wage * 1.1;
    const chartRange = chartMax - chartMin;

    const getPercent = (value: number) => {
        return Math.max(0, Math.min(100, ((value - chartMin) / chartRange) * 100));
    };

    const currentPos = currentWage ? getPercent(currentWage) : null;
    const medianPos = getPercent(stats.median_wage);
    const minPos = getPercent(stats.min_wage);
    const maxPos = getPercent(stats.max_wage);

    const difference = currentWage ? ((currentWage - stats.median_wage) / stats.median_wage) * 100 : 0;

    let comparisonText = "";
    let comparisonColor = "";
    let comparisonBg = "";
    let comparisonIcon = null;

    if (currentWage) {
        if (difference > 5) {
            comparisonText = `${difference.toFixed(0)}% Above Average`;
            comparisonColor = "text-green-600";
            comparisonBg = "bg-green-50 border-green-100";
            comparisonIcon = <TrendingUp className="h-3.5 w-3.5" />;
        } else if (difference < -5) {
            comparisonText = `${Math.abs(difference).toFixed(0)}% Below Average`;
            comparisonColor = "text-red-600";
            comparisonBg = "bg-red-50 border-red-100";
            comparisonIcon = <TrendingDown className="h-3.5 w-3.5" />;
        } else {
            comparisonText = "Market Average";
            comparisonColor = "text-brand-600";
            comparisonBg = "bg-brand-50 border-brand-100";
            comparisonIcon = <Landmark className="h-3.5 w-3.5" />;
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-brand-50/50 rounded-2xl overflow-hidden group relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 opacity-50" />

                <CardContent className="p-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-10">
                        <div className="flex-1">
                            <h3 className="text-[10px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-[0.2em] translate-y-0.5">
                                Wage Analysis
                                {onInfoClick && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onInfoClick();
                                        }}
                                        className="p-1 hover:bg-brand-50 rounded-full transition-all group/info"
                                    >
                                        <Info className="h-3.5 w-3.5 text-gray-300 group-hover/info:text-brand-600 transition-colors" />
                                    </button>
                                )}
                            </h3>
                            <p className="text-xs font-semibold text-gray-900 mt-1 line-clamp-1">
                                Market Benchmarking
                            </p>
                        </div>

                        {currentWage && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm shrink-0",
                                    comparisonBg,
                                    comparisonColor
                                )}
                            >
                                {comparisonIcon}
                                {comparisonText}
                            </motion.div>
                        )}
                    </div>

                    <div className="relative pt-12 pb-14 px-4 sm:px-8">
                        {/* Background Track */}
                        <div className="h-3 w-full relative rounded-full bg-gray-100 ring-1 ring-gray-200/50 overflow-hidden shadow-inner">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 via-transparent to-gray-50/50" />
                            {/* Distribution Range Highlight */}
                            <div
                                className="absolute inset-y-0 bg-brand-500/10 opacity-50"
                                style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
                            />
                        </div>

                        {/* Median Line Indicator */}
                        <div
                            className="absolute top-10 bottom-10 w-0.5 bg-gray-900/10 z-0 transition-all duration-1000"
                            style={{ left: `${medianPos}%` }}
                        />

                        {/* Min Label */}
                        <div className="absolute bottom-4 transform -translate-x-1/2 flex flex-col items-center" style={{ left: `${minPos}%` }}>
                            <div className="h-2 w-px bg-gray-300 mb-1" />
                            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-tighter">Entry</span>
                            <span className="text-xs font-bold text-gray-700 font-mono">${stats.min_wage.toFixed(2)}</span>
                        </div>

                        {/* Median Display */}
                        <div className="absolute top-[-44px] transform -translate-x-1/2 flex flex-col items-center z-10" style={{ left: `${medianPos}%` }}>
                            <span className="text-[9px] uppercase font-black text-brand-600 tracking-widest mb-1.5">Market Median</span>
                            <div className="bg-white px-3 py-1.5 rounded-xl border border-brand-100 shadow-[0_4px_12px_rgba(25,118,210,0.1)] text-sm font-black text-brand-700 font-mono ring-1 ring-brand-50">
                                ${stats.median_wage.toFixed(2)}
                            </div>
                            <motion.div
                                animate={{ height: [12, 16, 12] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-1 bg-brand-500 rounded-full mt-0.5"
                            />
                        </div>

                        {/* Max Label */}
                        <div className="absolute bottom-4 transform -translate-x-1/2 flex flex-col items-center" style={{ left: `${maxPos}%` }}>
                            <div className="h-2 w-px bg-gray-300 mb-1" />
                            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-tighter">Top</span>
                            <span className="text-xs font-bold text-gray-700 font-mono">${stats.max_wage.toFixed(2)}</span>
                        </div>

                        {/* Current Wage Pin (Overlay) */}
                        <AnimatePresence>
                            {currentWage && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                                    className="absolute -top-1 transform -translate-x-1/2 flex flex-col items-center z-20 group/pin"
                                    style={{ left: `${currentPos}%` }}
                                >
                                    <div className={cn(
                                        "h-5 w-5 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all duration-300 group-hover/pin:scale-110",
                                        difference > 0 ? 'bg-green-500 shadow-green-200' : difference < -5 ? 'bg-red-500 shadow-red-200' : 'bg-brand-500 shadow-brand-200'
                                    )}>
                                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    </div>
                                    <div className={cn(
                                        "mt-2 px-2.5 py-1 rounded-lg text-[10px] font-black text-white shadow-lg whitespace-nowrap overflow-hidden relative",
                                        difference > 0 ? 'bg-green-600' : difference < -5 ? 'bg-red-600' : 'bg-brand-600'
                                    )}>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/pin:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                        On Position: ${currentWage.toFixed(2)}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
