'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Code, Stethoscope, HardHat, Coffee, ArrowUpRight } from 'lucide-react';
import db from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
    { id: 'tech', label: 'Tech & IT', icon: Code, color: 'text-blue-600 bg-blue-50', keywords: ['developer', 'engineer', 'software', 'network', 'system', 'data', 'analyst', 'tech'] },
    { id: 'healthcare', label: 'Healthcare', icon: Stethoscope, color: 'text-emerald-600 bg-emerald-50', keywords: ['nurse', 'doctor', 'patient', 'health', 'medical', 'care', 'clinic', 'hospital'] },
    { id: 'construction', label: 'Construction', icon: HardHat, color: 'text-orange-600 bg-orange-50', keywords: ['construction', 'carpenter', 'electrician', 'plumber', 'laborer', 'site', 'build'] },
    { id: 'hospitality', label: 'Hospitality', icon: Coffee, color: 'text-pink-600 bg-pink-50', keywords: ['cook', 'chef', 'server', 'hotel', 'restaurant', 'food', 'kitchen', 'service'] },
];

export function CategorizedCompanies() {
    const router = useRouter();

    const { data: categoriesData = [], isLoading } = useQuery({
        queryKey: ['categorized-companies'],
        queryFn: async () => {
            // Fetch a large sample of trending jobs to categorize client-side
            const { data, error } = await db
                .from('trending_job')
                .select('employer, job_title')
                .not('employer', 'is', null)
                .limit(2000);

            if (error) throw error;

            const grouped: Record<string, { companies: Record<string, number> }> = {};

            // Initialize groups
            CATEGORIES.forEach(cat => {
                grouped[cat.id] = { companies: {} };
            });

            data?.forEach((row: any) => {
                const title = (row.job_title || '').toLowerCase();
                const employer = row.employer;

                // Find matching category
                for (const cat of CATEGORIES) {
                    if (cat.keywords.some(k => title.includes(k))) {
                        if (!grouped[cat.id].companies[employer]) {
                            grouped[cat.id].companies[employer] = 0;
                        }
                        grouped[cat.id].companies[employer]++;
                        break;
                    }
                }
            });

            // Format results
            return CATEGORIES.map(cat => {
                const topCompanies = Object.entries(grouped[cat.id]?.companies || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([name, count]) => ({ name, count }));

                return {
                    ...cat,
                    companies: topCompanies
                };
            });
        },
        staleTime: 1000 * 60 * 30, // 30 mins
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesData.map((category, index) => (
                <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">

                        {/* Header */}
                        <div className="p-6 pb-2 border-b border-gray-100/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2.5 rounded-lg ${category.color}`}>
                                    <category.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">
                                    {category.label}
                                </h3>
                            </div>
                        </div>

                        {/* List */}
                        <div className="p-2 flex-grow">
                            {category.companies.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {category.companies.map((company, i) => (
                                        <div
                                            key={company.name}
                                            onClick={() => router.push(`/analysis/${encodeURIComponent(company.name)}`)}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-colors"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    i === 1 ? 'bg-gray-100 text-gray-600' :
                                                        i === 2 ? 'bg-orange-50 text-orange-700' : 'bg-transparent text-gray-400'
                                                    }`}>
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-700 truncate group-hover:text-brand-600 transition-colors">
                                                    {company.name}
                                                </span>
                                            </div>
                                            <div className="text-xs font-semibold text-gray-400 group-hover:text-brand-500">
                                                {company.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
                                    <p>No data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
