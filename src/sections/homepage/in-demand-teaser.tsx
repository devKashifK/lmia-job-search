'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TopJob {
    noc_code: string;
    title: string;
    count: number;
    hot?: boolean;
}

export default function InDemandTeaser() {
    const [jobs, setJobs] = useState<TopJob[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTop = async () => {
            try {
                const res = await fetch('/api/insights?year=2026&source=trending');
                if (!res.ok) throw new Error();
                const data = await res.json();
                const canada = data.regions?.find((r: any) => r.key === 'canada');
                if (canada?.rows) {
                    setJobs(canada.rows.slice(0, 5));
                }
            } catch {
                // silently fail — teaser is non-critical
            } finally {
                setLoading(false);
            }
        };
        fetchTop();
    }, []);

    if (loading) {
        return (
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-5xl mx-auto flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                </div>
            </section>
        );
    }

    if (jobs.length === 0) return null;

    return (
        <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-4">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Top In-Demand Jobs · 2026
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Trending Roles Across Canada
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        See which NOC codes are hiring the most right now based on live job postings.
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {jobs.map((job, i) => (
                        <motion.div
                            key={job.noc_code}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                        >
                            <Link
                                href={`/resources/noc-codes/${job.noc_code}`}
                                className="block bg-white rounded-2xl p-4 ring-1 ring-gray-100 hover:ring-brand-200 hover:shadow-lg shadow-sm transition-all group h-full"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="font-mono text-[11px] bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded-md font-bold">
                                        {job.noc_code}
                                    </span>
                                    {(job.hot || i < 3) && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[9px] font-bold border border-orange-100">
                                            <Flame className="w-2.5 h-2.5" />
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-bold text-gray-800 group-hover:text-brand-700 transition-colors leading-snug mb-2 line-clamp-2">
                                    {job.title}
                                </h3>
                                <p className="text-xs text-gray-500 tabular-nums">
                                    {job.count.toLocaleString()} postings
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                >
                    <Link
                        href="/in-demand-jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        View All In-Demand Jobs <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
