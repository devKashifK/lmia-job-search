'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import db from '@/db';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
        queryFn: async () => {
            // Fetch trending jobs to aggregate by location
            const { data, error } = await db
                .from('trending_job')
                .select('city, state, job_title')
                .limit(2000);

            if (error) throw error;

            const provinces: Record<string, { count: number, roles: Record<string, number> }> = {};
            const cities: Record<string, { count: number, province: string, roles: Record<string, number> }> = {};

            data?.forEach((row: any) => {
                // Province
                const prov = row.state || 'Unknown';
                if (!provinces[prov]) provinces[prov] = { count: 0, roles: {} };
                provinces[prov].count++;
                const role = row.job_title || 'Unknown';
                provinces[prov].roles[role] = (provinces[prov].roles[role] || 0) + 1;

                // City
                const city = row.city;
                if (city) {
                    if (!cities[city]) cities[city] = { count: 0, province: prov, roles: {} };
                    cities[city].count++;
                    cities[city].roles[role] = (cities[city].roles[role] || 0) + 1;
                }
            });

            // Top 3 Provinces
            const topProvinces = Object.entries(provinces)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 3)
                .map(([name, stats]) => {
                    const topRole = Object.entries(stats.roles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Various';
                    return {
                        name,
                        type: 'province' as const,
                        count: stats.count,
                        growth: `+${Math.floor(Math.random() * 15) + 5}%`, // Simulated growth
                        topRole
                    };
                });

            // Top 3 Cities
            const topCities = Object.entries(cities)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 3)
                .map(([name, stats]) => {
                    const topRole = Object.entries(stats.roles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Various';
                    return {
                        name: `${name}, ${stats.province}`,
                        type: 'city' as const,
                        count: stats.count,
                        growth: `+${Math.floor(Math.random() * 20) + 10}%`,
                        topRole
                    };
                });

            return [...topProvinces, ...topCities];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
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
                <motion.div
                    key={region.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div
                        onClick={() => router.push(`/search?location=${encodeURIComponent(region.name.split(',')[0])}`)}
                        className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-200 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MapPin className="w-24 h-24 text-brand-900 transform rotate-12" />
                        </div>

                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className={`${region.type === 'province' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'} hover:bg-opacity-80`}>
                                    {region.type === 'province' ? 'Province' : 'Hot City'}
                                </Badge>
                                <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                    <TrendingUp className="w-3 h-3" />
                                    {region.growth}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-1">
                                {region.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Top Role: <span className="font-medium text-gray-700">{region.topRole}</span>
                            </p>
                        </div>

                        <div className="flex items-end justify-between border-t border-gray-50 pt-3">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Job Openings</p>
                                <p className="text-lg font-bold text-gray-900">{region.count}</p>
                            </div>
                            <div className="p-2 rounded-full bg-brand-50 text-brand-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
