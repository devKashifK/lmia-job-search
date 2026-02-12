'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Medal,
    Award,
    Crown,
    Star,
    ShieldCheck,
    ArrowRight,
    Building2,
    Briefcase,
    TrendingUp
} from 'lucide-react';
import db from '@/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Tier Configuration
const TIERS = [




    {
        level: 0,
        name: 'Tier 0',
        icon: ShieldCheck,
        color: 'text-brand-400',
        bg: 'bg-brand-50/50',
        border: 'border-brand-50',
        gradient: 'from-brand-300 to-brand-400',
        shadow: 'shadow-brand-400/20',
        description: 'Standard'
    },
    {
        level: 1,
        name: 'Tier 1',
        icon: Award,
        color: 'text-brand-500',
        bg: 'bg-brand-50',
        border: 'border-brand-50',
        gradient: 'from-brand-400 to-brand-500',
        shadow: 'shadow-brand-500/20',
        description: 'Emerging'
    },
    {
        level: 2,
        name: 'Tier 2',
        icon: Medal,
        color: 'text-brand-600',
        bg: 'bg-brand-50',
        border: 'border-brand-100',
        gradient: 'from-brand-500 to-brand-600',
        shadow: 'shadow-brand-600/20',
        description: 'High Growth'
    },
    {
        level: 3,
        name: 'Tier 3',
        icon: Trophy,
        color: 'text-brand-700',
        bg: 'bg-brand-50',
        border: 'border-brand-100',
        gradient: 'from-brand-600 to-brand-700',
        shadow: 'shadow-brand-700/20',
        description: 'Top Performers'

    },
    {
        level: 4,
        name: 'Tier 4',
        icon: Crown,
        color: 'text-brand-900',
        bg: 'bg-brand-50',
        border: 'border-brand-200',
        gradient: 'from-brand-800 to-brand-900',
        shadow: 'shadow-brand-900/20',
        description: 'Elite Performers'
    },
];

export function CompanyTierList() {
    const [isLmia, setIsLmia] = useState(true);
    const router = useRouter();
    const tableName = isLmia ? 'lmia' : 'trending_job';

    const { data: tierData, isLoading } = useQuery({
        queryKey: ['company-tier-list', tableName],
        queryFn: async () => {
            // Fetch top companies for each tier
            const companiesByTier: Record<number, any[]> = {};

            // We'll run parallel queries for each tier to get the top performers
            // This is more efficient than fetching everything and filtering in JS
            const queries = TIERS.map(async (tier) => {
                const { data, error } = await db.rpc('get_companies_by_tier', {
                    p_tier: tier.level,
                    p_is_lmia: isLmia,
                    p_limit: 3
                });

                if (error) {
                    console.error('Error fetching tier companies:', error);
                    return { tier: tier.level, companies: [] };
                }

                // Map RPC result to component format
                const companies = (data || []).map((c: any) => ({
                    name: c.name,
                    count: c.count,
                    locations: c.locations || [],
                    roleCount: 0 // Not returned by RPC, but optional
                }));

                return {
                    tier: tier.level,
                    companies
                };
            });

            const results = await Promise.all(queries);

            results.forEach(res => {
                if (res.companies.length > 0) {
                    companiesByTier[res.tier] = res.companies;
                }
            });

            return companiesByTier;
        },
        staleTime: 1000 * 60 * 30 // 30 minutes
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-brand-600" />
                        Company Leaderboard
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Top performing companies ranked by hiring volume and tier.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setIsLmia(true)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                            isLmia
                                ? "bg-brand-600 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        LMIA Approved
                    </button>
                    <button
                        onClick={() => setIsLmia(false)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                            !isLmia
                                ? "bg-brand-600 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        Trending Jobs
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    // Skeleton Loading
                    [...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                    ))
                ) : (
                    TIERS.map((tier) => {
                        const companies = tierData?.[tier.level];
                        if (!companies) return null;

                        return (
                            <motion.div
                                key={tier.level}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className={cn(
                                    "relative overflow-hidden bg-white border rounded-2xl p-6 shadow-sm transition-all hover:shadow-md",
                                    tier.border
                                )}
                            >
                                {/* Tier Header */}
                                <div className={cn("absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b", tier.gradient)}></div>

                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Tier Info */}
                                    <div className="w-full lg:w-48 flex-shrink-0 flex flex-row lg:flex-col items-center lg:items-start gap-3 lg:gap-1">
                                        <div className={cn("p-2 rounded-lg", tier.bg, tier.color)}>
                                            <tier.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={cn("font-bold text-lg", tier.color)}>{tier.name}</h3>
                                            <p className="text-xs text-gray-500">{tier.description}</p>
                                        </div>
                                    </div>

                                    {/* Companies List */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {companies.map((company: any) => (
                                            <div
                                                key={company.name}
                                                onClick={() => router.push(`/analysis/${encodeURIComponent(company.name)}?t=${isLmia ? 'lmia' : 'hot_leads'}`)}
                                                className="group cursor-pointer bg-gray-50 hover:bg-white border border-gray-100 hover:border-brand-200 rounded-xl p-3 px-4 transition-all duration-200 hover:shadow-sm flex items-center justify-between"
                                            >
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                                                        {company.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" />
                                                            {company.locations[0] || 'Multiple Locations'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right pl-2">
                                                    <span className={cn(
                                                        "text-lg font-bold block leading-none",
                                                        "text-brand-600"
                                                    )}>
                                                        {company.count}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 uppercase font-medium">
                                                        {isLmia ? 'Approvals' : 'Openings'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
