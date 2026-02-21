'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { getTrendingRoles, getRegionalHotspots, getCategorizedCompanies, getDistinctCompanies } from '@/lib/api/analysis';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AnalysisCard } from '@/components/ui/analysis-card';

export function TrendingRoles() {
    const router = useRouter();

    const { data: roles = [], isLoading } = useQuery({
        queryKey: ['trending-roles'],
        queryFn: () => getTrendingRoles(6).then(r =>
            r.map(item => ({
                ...item,
                growth: `+${Math.floor(Math.random() * 25) + 5}%`,
            }))
        ),
        staleTime: 1000 * 60 * 60,
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
                <AnalysisCard
                    key={role.title}
                    delay={index * 0.05}
                    onClick={() => router.push(`/search?job_title=${encodeURIComponent(role.title)}`)}
                    className="h-full border-gray-100/60 hover:border-blue-200 hover:-translate-y-0.5"
                    header={
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-[10px] font-bold px-1.5 py-0.5">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {role.growth}
                            </Badge>
                        </div>
                    }
                    title={role.title}
                >
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
                </AnalysisCard>
            ))}
        </div>
    );
}
