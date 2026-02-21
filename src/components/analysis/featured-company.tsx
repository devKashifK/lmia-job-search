'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Search, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { getTrendingRoles, getRegionalHotspots, getCategorizedCompanies, getDistinctCompanies } from '@/lib/api/analysis';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import db from '@/db';

export function FeaturedCompany() {
    const router = useRouter();

    const { data: company, isLoading } = useQuery({
        queryKey: ['featured-company-hero'],
        queryFn: async () => {
            // Find top LMIA employer
            const { data: lmiaData } = await db
                .from('lmia')
                .select('employer, approved_positions, city, province:territory')
                .not('employer', 'is', null)
                .order('approved_positions', { ascending: false })
                .limit(1)
                .single();

            // Find top Trending employer (by job count)
            const { data: trendingData } = await db
                .from('trending_job')
                .select('employer, city, state, job_title')
                .not('employer', 'is', null)
                .limit(500); // Sample top 500 to aggregate

            // Aggregate trending counts
            const trendingCounts: Record<string, number> = {};
            let topTrending = { name: '', count: 0, location: '' };

            trendingData?.forEach((job: any) => {
                const name = job.employer;
                trendingCounts[name] = (trendingCounts[name] || 0) + 1;
                if (trendingCounts[name] > topTrending.count) {
                    topTrending = {
                        name,
                        count: trendingCounts[name],
                        location: `${job.city}, ${job.state}`
                    };
                }
            });

            // Compare and pick winner
            const lmiaCount = Number(lmiaData?.approved_positions) || 0;

            if (lmiaData && lmiaCount > topTrending.count) {
                return {
                    name: lmiaData.employer,
                    positions: lmiaCount,
                    location: `${lmiaData.city}, ${lmiaData.province}`,
                    score: 98,
                    growth: '+12%',
                    type: 'lmia'
                };
            } else {
                return {
                    name: topTrending.name,
                    positions: topTrending.count,
                    location: topTrending.location,
                    score: 95,
                    growth: '+8%',
                    type: 'hot_leads'
                };
            }
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    if (isLoading) {
        return <Skeleton className="h-64 w-full rounded-3xl" />;
    }

    if (!company) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden bg-white rounded-3xl p-8 lg:p-10 shadow-lg group cursor-pointer border border-gray-100"
            onClick={() => router.push(`/analysis/${encodeURIComponent(company.name)}?t=${company.type || 'lmia'}`)}
        >
            {/* Background Accents - adjusted for light theme */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50/50 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-50/30 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <Zap className="w-3 h-3 fill-brand-600 text-brand-600" />
                        Featured Employer
                    </div>

                    <div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-2 leading-tight tracking-tight group-hover:text-brand-600 transition-colors">
                            {company.name}
                        </h2>
                        <div className="flex items-center gap-4 text-gray-500 text-sm md:text-base">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                {company.location}
                            </span>
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                            <span className="flex items-center gap-1.5 text-brand-600 font-medium bg-brand-50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-4 h-4" />
                                Verified Sponsor
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <Button
                            size="lg"
                            className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-lg hover:shadow-xl rounded-xl px-8 font-bold transition-all transform hover:-translate-y-1"
                        >
                            View Full Analysis <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="relative bg-white border border-gray-100 rounded-2xl p-6 w-full md:w-auto min-w-[280px] shadow-xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500">
                    <div className="absolute -top-3 -right-3 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                        Top 1%
                    </div>

                    <div className="space-y-5">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Impact Score</p>
                                <p className="text-4xl font-black text-gray-900">{company.score}</p>
                            </div>
                            <div className="text-right">
                                <TrendingUp className="w-6 h-6 text-brand-500 ml-auto mb-1" />
                                <p className="text-sm font-bold text-brand-600">{company.growth} Growth</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Approvals</span>
                                <span className="font-bold text-gray-900">{company.positions}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 w-[92%]" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Reliability</span>
                                <span className="font-bold text-gray-900">High</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 w-[98%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
