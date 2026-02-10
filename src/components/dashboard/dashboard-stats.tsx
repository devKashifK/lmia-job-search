'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Bookmark, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCreditData } from '@/hooks/use-credits';
import { useSavedJobs } from '@/hooks/use-saved-jobs';
import Link from 'next/link';
import useMobile from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStats() {
    const { isMobile } = useMobile();
    const { creditData, creditRemaining, isLoading: creditsLoading } = useCreditData();
    const { data: savedJobs, isLoading: savedJobsLoading } = useSavedJobs();

    const savedJobsCount = savedJobs?.length || 0;

    // Calculate run-out estimate if available, otherwise mock or hide
    // precise calculation is in credits page, we can do a simple one here or just show balance
    // Let's show balance and usage

    const stats = [
        {
            label: 'Available Credits',
            value: creditsLoading ? '...' : creditRemaining?.toLocaleString() || '0',
            subtext: 'Search queries remaining',
            icon: CreditCard,
            color: 'text-brand-600',
            bgColor: 'bg-brand-50',
            borderColor: 'border-brand-200',
            href: '/dashboard/credits',
        },
        {
            label: 'Saved Jobs',
            value: savedJobsLoading ? '...' : savedJobsCount.toLocaleString(),
            subtext: 'Jobs you are tracking',
            icon: Bookmark,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            href: '/dashboard/saved-jobs',
        },
        {
            label: 'Total Usage',
            value: creditsLoading ? '...' : creditData?.used_credit?.toLocaleString() || '0',
            subtext: 'Lifetime searches',
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            href: '/dashboard/credits',
        },
    ];

    return (
        <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
        )}>
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Link href={stat.href}>
                            <Card className={cn(
                                "relative overflow-hidden transition-all duration-300 group hover:shadow-md border-2",
                                isMobile ? "p-4" : "p-5",
                                stat.borderColor,
                                "bg-white/50 backdrop-blur-sm"
                            )}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-500 mb-1">
                                            {stat.label}
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                                {stat.value}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {stat.subtext}
                                        </p>
                                    </div>
                                    <div className={cn("p-2.5 rounded-xl transition-colors", stat.bgColor)}>
                                        <Icon className={cn("w-5 h-5", stat.color)} />
                                    </div>
                                </div>

                                {/* Decorative background element */}
                                <div className={cn(
                                    "absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500",
                                    stat.bgColor.replace('bg-', 'bg-')
                                )} />
                            </Card>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
}
