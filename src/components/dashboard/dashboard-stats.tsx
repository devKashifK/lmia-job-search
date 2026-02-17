'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Bookmark, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCreditData } from '@/hooks/use-credits';
import { useSavedJobs } from '@/hooks/use-saved-jobs';
import Link from 'next/link';
import useMobile from '@/hooks/use-mobile';

export function DashboardStats() {
    const { isMobile } = useMobile();
    const { creditData, creditRemaining, isLoading: creditsLoading } = useCreditData();
    const { data: savedJobs, isLoading: savedJobsLoading } = useSavedJobs();

    const savedJobsCount = savedJobs?.length || 0;

    const stats = [
        {
            label: 'Credits',
            value: creditsLoading ? '...' : creditRemaining?.toLocaleString() || '0',
            subtext: 'Available',
            icon: CreditCard,
            color: 'text-brand-600',
            bg: 'bg-brand-50/50',
            border: 'hover:border-brand-200',
            href: '/dashboard/credits',
            trend: '+5', // Mock trend for premium feel
        },
        {
            label: 'Saved',
            value: savedJobsLoading ? '...' : savedJobsCount.toLocaleString(),
            subtext: 'Jobs',
            icon: Bookmark,
            color: 'text-amber-600',
            bg: 'bg-amber-50/50',
            border: 'hover:border-amber-200',
            href: '/dashboard/saved-jobs',
            trend: null,
        },
        {
            label: 'Searches',
            value: creditsLoading ? '...' : creditData?.used_credit?.toLocaleString() || '0',
            subtext: 'Lifetime',
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-50/50',
            border: 'hover:border-purple-200',
            href: '/dashboard/credits',
            trend: '+12%',
        },
    ];

    return (
        <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-3"
        )}>
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Link href={stat.href}>
                            <div className={cn(
                                "relative group flex flex-col justify-between p-5 rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                                stat.border
                            )}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("p-2 rounded-xl", stat.bg)}>
                                        <Icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                    {stat.trend && (
                                        <div className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                            {stat.trend} <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1">
                                        {stat.value}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {stat.label} <span className="normal-case opacity-50 ml-1 font-normal">{stat.subtext}</span>
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}
