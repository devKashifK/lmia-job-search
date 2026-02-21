'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { getTrendingRoles, getRegionalHotspots, getCategorizedCompanies, getDistinctCompanies } from '@/lib/api/analysis';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AnalysisCard } from '@/components/ui/analysis-card';

interface RegionData {
    name: string;
    type: 'province' | 'city';
    count: number;
    growth: string;
    topRole: string;
}

export function RegionalHotspots() {
    const router = useRouter();

    const { data: hotspots = [], isLoading } = useQuery({
        queryKey: ['regional-hotspots'],
        queryFn: () => getRegionalHotspots(6).then(items =>
            items.map(item => ({
                ...item,
                growth: `+${Math.floor(Math.random() * 20) + 5}%`,
            }))
        ),
        staleTime: 1000 * 60 * 60,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotspots.map((region, index) => (
                <AnalysisCard
                    key={region.name}
                    delay={index * 0.1}
                    onClick={() => router.push(`/search?location=${encodeURIComponent(region.name.split(',')[0])}`)}
                    className="h-full hover:border-brand-200"
                    backgroundIcon={<MapPin className="w-24 h-24 text-brand-900 transform rotate-12" />}
                    header={
                        <div className="flex justify-between items-start">
                            <Badge variant="secondary" className={`${region.type === 'province' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'} hover:bg-opacity-80`}>
                                {region.type === 'province' ? 'Province' : 'Hot City'}
                            </Badge>
                            <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3" />
                                {region.growth}
                            </span>
                        </div>
                    }
                    title={region.name}
                    subTitle={
                        <span>
                            Top Role: <span className="font-medium text-gray-700">{region.topRole}</span>
                        </span>
                    }
                    footer={
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Job Openings</p>
                                <p className="text-lg font-bold text-gray-900">{region.count}</p>
                            </div>
                            <div className="p-2 rounded-full bg-brand-50 text-brand-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    }
                />
            ))}
        </div>
    );
}
