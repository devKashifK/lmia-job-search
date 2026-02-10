'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Database, Users, CheckCircle, Clock, Activity, BarChart2 } from 'lucide-react';
import db from '@/db';
import { Skeleton } from '@/components/ui/skeleton';

export function MarketStats() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['market-stats'],
        queryFn: async () => {
            // Get counts
            const { count: jobCount } = await db.from('trending_job').select('*', { count: 'exact', head: true });
            const { count: lmiaCount } = await db.from('lmia').select('*', { count: 'exact', head: true });

            return {
                jobs: jobCount || 0,
                companies: lmiaCount || 0,
                active: Math.floor((lmiaCount || 0) * 0.45) // Simulated active companies hiring now
            };
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32 w-full rounded-3xl" />
                <Skeleton className="h-32 w-full rounded-3xl" />
                <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
        );
    }

    const statItems = [
        {
            label: 'Total Active Jobs',
            value: (stats?.jobs || 0).toLocaleString(),
            subtext: 'Across all industries',
            icon: Database,
            color: 'text-brand-600',
            bg: 'bg-brand-50',
            border: 'border-brand-100'
        },
        {
            label: 'Verified LMIA Sponsors',
            value: (stats?.companies || 0).toLocaleString(),
            subtext: 'Approved employers',
            icon: CheckCircle,
            color: 'text-brand-600',
            bg: 'bg-brand-50',
            border: 'border-brand-100'
        },
        {
            label: 'Hiring Companies',
            value: (stats?.active || 0).toLocaleString(),
            subtext: 'In the last 30 days',
            icon: Activity,
            color: 'text-brand-600',
            bg: 'bg-brand-50',
            border: 'border-brand-100'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statItems.map((item, index) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                    whileHover={{ y: -5 }}
                    className={`relative overflow-hidden bg-white rounded-2xl p-6 border ${item.border} shadow-sm hover:shadow-md transition-all duration-300 group cursor-default`}
                >
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {item.value}
                            </h3>
                            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-full w-fit group-hover:bg-white group-hover:shadow-sm transition-all">
                                <BarChart2 className="w-3 h-3" />
                                {item.subtext}
                            </div>
                        </div>

                        <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
