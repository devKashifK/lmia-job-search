'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Users, ArrowRight, Activity, Percent } from 'lucide-react';
import { getTopCompaniesList } from '@/lib/api/analysis';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface TopCompaniesListProps {
    variant: 'trending' | 'lmia';
}

export function TopCompaniesList({ variant }: TopCompaniesListProps) {
    const router = useRouter();
    const isLmia = variant === 'lmia';

    const { data: companies = [], isLoading } = useQuery({
        queryKey: ['top-companies-list', variant],
        queryFn: () => getTopCompaniesList(variant),
        staleTime: 1000 * 60 * 15,
    });
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companies.map((company, index) => (
                <motion.div
                    key={company.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                >
                    <div
                        className="group relative h-full bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-default"
                    >
                        {/* Hover CTA Overlay */}
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-20">
                            <Button
                                onClick={() => router.push(`/analysis/${encodeURIComponent(company.name)}?t=${isLmia ? 'lmia' : 'hot_leads'}`)}
                                className="pointer-events-auto bg-brand-600 hover:bg-brand-700 text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 rounded-full px-6"
                            >
                                Deep Analysis <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>

                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm bg-brand-50 text-brand-600">
                                    {company.name.substring(0, 1).toUpperCase()}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 h-14" title={company.name}>
                                {company.name}
                            </h3>

                            <div className="flex items-center gap-2 mb-6">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] uppercase tracking-wide font-semibold px-2">
                                    {isLmia ? 'Verified' : 'Trending'}
                                </Badge>
                                {isLmia && (
                                    <span className="text-[10px] text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Percent className="w-3 h-3" /> 98% Score
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-50 pt-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
                                        {isLmia ? 'Total Approvals' : 'Job Openings'}
                                    </p>
                                    <p className="text-2xl font-black text-gray-900 leading-none">
                                        {company.metric.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                                    <Activity className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
