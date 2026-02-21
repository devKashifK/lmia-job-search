"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import db from "@/db";

interface WageVisualizationProps {
    noc: string;
    province?: string;
    currentWage?: number; // Hourly wage
    title?: string;
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

export function WageVisualization({ noc, province, currentWage, title }: WageVisualizationProps) {
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
        return <Card className="p-6 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
        </Card>;
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
    let comparisonIcon = null;

    if (currentWage) {
        if (difference > 5) {
            comparisonText = `${difference.toFixed(0)}% Above Market Average`;
            comparisonColor = "text-green-600";
            comparisonIcon = <TrendingUp className="h-4 w-4" />;
        } else if (difference < -5) {
            comparisonText = `${Math.abs(difference).toFixed(0)}% Below Market Average`;
            comparisonColor = "text-red-600";
            comparisonIcon = <TrendingDown className="h-4 w-4" />;
        } else {
            comparisonText = "Market Average";
            comparisonColor = "text-yellow-600";
            comparisonIcon = <Minus className="h-4 w-4" />;
        }
    }

    return (
        <Card className="p-6 border-gray-100 shadow-sm bg-white overflow-hidden">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        Wage Analysis
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Based on {stats.sample_size} approved LMIA applications for NOC {noc} in {province || 'Canada'}.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Comparing <span className="font-medium text-gray-700">{title || 'this job'}</span> against market rates using {stats.sample_size} records.
                    </p>
                </div>
                {currentWage && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-sm font-medium ${comparisonColor}`}>
                        {comparisonIcon}
                        {comparisonText}
                    </div>
                )}
            </div>

            <div className="relative pt-12 pb-12 px-4">
                {/* Main Bar */}
                <div className="h-4 w-full relative rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
                    {/* Median Line */}
                    <div
                        className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-gray-800 z-10"
                        style={{ left: `${medianPos}%` }}
                    />
                </div>

                {/* Min Label (Below) */}
                <div className="absolute top-8 transform -translate-x-1/2 flex flex-col items-center" style={{ left: `${minPos}%` }}>
                    <div className="h-2 w-0.5 bg-gray-300 mb-1"></div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Entry</span>
                    <div className="text-sm font-semibold text-gray-700 font-mono">
                        ${stats.min_wage.toFixed(2)}
                    </div>
                </div>

                {/* Median Label (Above) */}
                <div className="absolute top-[-36px] transform -translate-x-1/2 flex flex-col items-center z-10" style={{ left: `${medianPos}%` }}>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Median</span>
                    <div className="bg-gray-900 text-white px-2 py-1 rounded-md text-sm font-mono shadow-md font-medium">
                        ${stats.median_wage.toFixed(2)}
                    </div>
                    <div className="h-3 w-0.5 bg-gray-900 mt-[-1px]"></div>
                </div>

                {/* Max Label (Below) */}
                <div className="absolute top-8 transform -translate-x-1/2 flex flex-col items-center" style={{ left: `${maxPos}%` }}>
                    <div className="h-2 w-0.5 bg-gray-300 mb-1"></div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Top</span>
                    <div className="text-sm font-semibold text-gray-700 font-mono">
                        ${stats.max_wage.toFixed(2)}
                    </div>
                </div>

                {/* Current Wage Marker (Overlay) */}
                {currentWage && (
                    <div
                        className="absolute top-1 transform -translate-x-1/2 flex flex-col items-center z-20 transition-all duration-1000 ease-out"
                        style={{ left: `${currentPos}%` }}
                    >
                        <div className={`h-6 w-6 rounded-full border-4 border-white shadow-lg flex items-center justify-center -mt-1 ${difference > 0 ? 'bg-green-500' : difference < 0 ? 'bg-red-500' : 'bg-yellow-500'
                            }`}>
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        </div>
                        <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm whitespace-nowrap ${difference > 0 ? 'bg-green-600' : difference < 0 ? 'bg-red-600' : 'bg-yellow-600'
                            }`}>
                            On Post: ${currentWage.toFixed(2)}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
