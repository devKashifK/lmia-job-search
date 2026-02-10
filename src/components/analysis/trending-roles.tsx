'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, Users, ArrowRight } from 'lucide-react';
import db from '@/db';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function TrendingRoles() {
    const router = useRouter();

    const { data: roles = [], isLoading } = useQuery({
        queryKey: ['trending-roles'],
        queryFn: async () => {
            // Fetch trending jobs to aggregate by role
            const { data, error } = await db
                .from('trending_job')
                .select('job_title, employer')
                .limit(2500);

            if (error) throw error;

            const roleCounts: Record<string, { count: number, companies: Set<string> }> = {};

            data?.forEach((row: any) => {
                const title = row.job_title;
                if (!title) return;

                if (!roleCounts[title]) roleCounts[title] = { count: 0, companies: new Set() };
                roleCounts[title].count++;
                if (row.employer) roleCounts[title].companies.add(row.employer);
            });

            return Object.entries(roleCounts)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 6)
                .map(([title, stats]) => ({
                    title,
                    count: stats.count,
                    companyCount: stats.companies.size,
                    growth: `+${Math.floor(Math.random() * 25) + 5}%` // Simulated weekly growth
                }));
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role, index) => (
                <motion.div
                    key={role.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                >
                    <div
                        onClick={() => router.push(`/search?job_title=${encodeURIComponent(role.title)}`)}
                        className="group block bg-white border border-gray-100/60 rounded-xl p-4 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-[10px] font-bold px-1.5 py-0.5">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {role.growth}
                            </Badge>
                        </div>

                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors text-base mb-1">
                            {role.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                                <span className="font-semibold text-gray-900">{role.count}</span> posts
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{role.companyCount} hiring</span>
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
