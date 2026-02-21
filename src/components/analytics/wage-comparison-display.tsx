"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getWageStats } from "@/lib/api/analytics";

interface WageComparisonProps {
    noc: string;
    province?: string;
    currentWage: number;
}

export function WageComparisonDisplay({ noc, province, currentWage }: WageComparisonProps) {
    const [comparison, setComparison] = useState<{
        diff: number;
        median: number;
        loading: boolean;
    }>({ diff: 0, median: 0, loading: true });

    useEffect(() => {
        async function fetchStats() {
            if (!noc || !currentWage) return;

            try {
                const stats = await getWageStats(noc, province || null);

                if (!stats) return;

                const median = stats.median_wage;
                const diff = ((currentWage - median) / median) * 100;

                setComparison({
                    diff,
                    median,
                    loading: false
                });
            } catch (err) {
                console.error("Failed to fetch wage comparison", err);
            }
        }

        fetchStats();
    }, [noc, province, currentWage]);

    if (comparison.loading || !comparison.median) return null;

    const { diff } = comparison;
    const isPositive = diff > 5;
    const isNegative = diff < -5;

    return (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-50 text-green-700 border border-green-100' :
            isNegative ? 'bg-red-50 text-red-700 border border-red-100' :
                'bg-yellow-50 text-yellow-700 border border-yellow-100'
            }`} title={`Market Median: $${comparison.median}/hr`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> :
                isNegative ? <TrendingDown className="h-3 w-3" /> :
                    <Minus className="h-3 w-3" />}

            {isPositive ? `${diff.toFixed(0)}% Above Market` :
                isNegative ? `${Math.abs(diff).toFixed(0)}% Below Market` :
                    'Market Average'}
        </div>
    );
}
