'use client';

import { useEffect, useState } from 'react';
import { AnalysisCard } from '@/components/ui/analysis-card';
import { Briefcase, Building2, TrendingUp } from 'lucide-react';

export default function MarketStats() {
    const [stats, setStats] = useState({
        jobs: 0,
        companies: 0,
        active: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const response = await fetch('/api/market-stats');
                if (!response.ok) throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error('Error loading market stats:', err);
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <AnalysisCard
                title="Total Active Jobs"
                backgroundIcon={<Briefcase className="w-12 h-12" />}
                loading={loading}
                delay={0.1}
            >
                <div className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
                    {stats.jobs.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">Across all industries</p>
            </AnalysisCard>

            <AnalysisCard
                title="LMIA Companies"
                backgroundIcon={<Building2 className="w-12 h-12" />}
                loading={loading}
                delay={0.2}
            >
                <div className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
                    {stats.companies.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">Approved employers</p>
            </AnalysisCard>

            <AnalysisCard
                title="Hiring Now"
                backgroundIcon={<TrendingUp className="w-12 h-12" />}
                loading={loading}
                delay={0.3}
            >
                <div className="text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
                    {stats.active.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 mt-1">In the last 30 days</p>
            </AnalysisCard>
        </div>
    );
}
