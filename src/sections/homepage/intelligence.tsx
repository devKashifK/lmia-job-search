'use client';

// Prevent static optimization - force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
    Briefcase,
    TrendingUp,
    MapPin,
    Calendar,
    LineChart,
    ArrowRight,
    Target,
    CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '@/components/ui/section-title';
import useMobile from '@/hooks/use-mobile';
import CustomLink from '@/components/ui/CustomLink';
import { useLiveFeed } from '@/hooks/use-live-feed';

const intelligenceFeatures = [
    {
        title: 'Employer Hiring Intelligence',
        headline: 'Go Beyond Job Listings. Understand Employers.',
        description: 'Each employer profile on JobMaze includes up to 5 years of hiring trends, helping you make informed decisions before applying.',
        points: [
            { icon: Briefcase, text: 'Roles hired most frequently' },
            { icon: MapPin, text: 'Cities & provinces with active hiring' },
            { icon: Calendar, text: 'Year-wise hiring trends' },
            { icon: TrendingUp, text: 'Demand growth or decline signals' },
        ],
        note: 'Insights are generated from historical job data and public hiring patterns. Predictions indicate probability, not guarantees.',
        cta: 'View Employer Insights',
        link: '/search/lmia/all?field=employer',
        visual: 'chart', // placeholder for visual type
    },
    {
        title: 'Predictive & Trend Analysis',
        headline: 'Apply Where Hiring Is Likely — Not Random.',
        description: 'JobMaze analyzes historical hiring data to surface predictive signals such as:',
        points: [
            { icon: LineChart, text: 'Roles with growing demand' },
            { icon: MapPin, text: 'Provinces with increasing hiring activity' },
            { icon: Target, text: 'Employers showing consistent recruitment patterns' },
        ],
        note: 'These insights help job seekers, consultants, and recruiters prioritize the right opportunities.',
        cta: 'Explore Trends',
        link: '/search/hot-leads/all',
        visual: 'graph', // placeholder
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
};

export default function Intelligence() {
    const { isMobile, isMounted } = useMobile();
    const { data } = useLiveFeed();

    // State for cycling through data
    const [activeIndex, setActiveIndex] = useState(0);

    // Dynamic rotation logic
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => prev + 1);
        }, 4000); // Rotate every 4 seconds
        return () => clearInterval(interval);
    }, []);

    const employers = data?.featuredEmployers || [];
    const trends = data?.predictiveTrends || [];

    // Safe access with fallback (though hook ensures data)
    const featuredEmployer = employers.length > 0 ? employers[activeIndex % employers.length] : { name: 'Loading...', velocity: 0, approvalRate: 0 };
    const predictiveTrend = trends.length > 0 ? trends[activeIndex % trends.length] : { role: 'Loading...', growth: 0, location: '', wage: '...', openPositions: 0 };

    if (!isMounted) {
        return null;
    }

    return (
        <section className="py-24 bg-white">
            <div className={isMobile ? "max-w-full mx-auto px-4" : "max-w-7xl mx-auto px-6 lg:px-8"}>
                <SectionTitle
                    badge="Data Intelligence"
                    title={<>Predictive <span className="text-brand-600">Insights</span>.</>}
                    subtitle="Historical data and machine learning working for you."
                />

                <div className="mt-8 space-y-24">
                    {intelligenceFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={item}
                            className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
                        >
                            {/* Text Content */}
                            <div className="flex-1 w-full lg:w-1/2">
                                <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                                    {feature.headline}
                                </h3>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">
                                    {feature.description}
                                </p>

                                <ul className="space-y-4 mb-8">
                                    {feature.points.map((point, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                            <span className="font-medium">{point.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                <CustomLink href={feature.link}>
                                    <button className="text-sm font-bold text-gray-900 hover:text-brand-600 uppercase tracking-widest flex items-center gap-2 group transition-colors">
                                        {feature.cta}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </CustomLink>
                            </div>

                            {/* Visual Content: Premium Analytics Cards with Animation */}
                            <div className="flex-1 w-full lg:w-1/2">
                                <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white border border-gray-100 p-8 min-h-[320px] flex items-center justify-center">
                                    {/* Abstract background decorative blobs */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-50 rounded-full blur-3xl opacity-60" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-60" />

                                    {index === 0 ? (
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={featuredEmployer.name} // Key triggers animation on change
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.5 }}
                                                className="relative z-10 w-full"
                                            >
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center border border-brand-100">
                                                            <Briefcase className="w-6 h-6 text-brand-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg leading-tight truncate max-w-[180px]">{featuredEmployer.name}</h4>
                                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                                                                <CheckCircle2 className="w-3 h-3" /> Verified Employer
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-900 tracking-tight">A+</div>
                                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Rating</div>
                                                    </div>
                                                </div>

                                                {/* Metrics Details */}
                                                <div className="space-y-6">
                                                    <div>
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="text-sm font-medium text-gray-600">Hiring Velocity</span>
                                                            <span className="text-sm font-bold text-gray-900">{featuredEmployer.velocity}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${featuredEmployer.velocity}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-1.5">Top 10% of employers in your region</p>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between items-end mb-2">
                                                            <span className="text-sm font-medium text-gray-600">LMIA Approval Rate</span>
                                                            <span className="text-sm font-bold text-gray-900">{featuredEmployer.approvalRate}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${featuredEmployer.approvalRate}%` }}
                                                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-1.5">Consistent approval history (5 Years)</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    ) : (
                                        <div className="relative z-10 w-full h-full flex flex-col">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={predictiveTrend.role}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.05 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="flex flex-col h-full justify-between"
                                                >
                                                    {/* Top Section: Role & Growth Chart */}
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
                                                                    Trending Now
                                                                </span>
                                                                <span className="flex items-center text-[10px] text-gray-400 font-medium">
                                                                    <MapPin className="w-3 h-3 mr-0.5" /> {predictiveTrend.location}
                                                                </span>
                                                            </div>
                                                            <h3 className="text-2xl font-bold text-gray-900 leading-tight max-w-[200px]">
                                                                {predictiveTrend.role}
                                                            </h3>
                                                        </div>

                                                        {/* Mini Circular Chart */}
                                                        <div className="relative w-20 h-20 flex-shrink-0">
                                                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                                                <motion.circle
                                                                    initial={{ pathLength: 0 }}
                                                                    animate={{ pathLength: 0.7 + (predictiveTrend.growth / 100) }}
                                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                                    cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round"
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-blue-600">+{predictiveTrend.growth}%</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Middle Section: Stats Grid */}
                                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                            <p className="text-[10px] text-gray-500 font-medium uppercase mb-1">Avg. Wage</p>
                                                            <p className="text-lg font-bold text-gray-900">{predictiveTrend.wage}</p>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                            <p className="text-[10px] text-gray-500 font-medium uppercase mb-1">Open Roles</p>
                                                            <p className="text-lg font-bold text-gray-900">{predictiveTrend.openPositions}+</p>
                                                        </div>
                                                    </div>

                                                    {/* Bottom: Forecast Line (Visual Only) */}
                                                    <div className="relative h-12 w-full pt-4 border-t border-gray-100">
                                                        <div className="absolute top-4 left-0 text-[10px] text-gray-400">Demand Forecast</div>
                                                        <div className="flex items-end justify-end h-full gap-1">
                                                            {[40, 60, 45, 70, 85, 60, 95].map((h, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${h}%` }}
                                                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                                                    className={`w-full rounded-sm ${i === 6 ? 'bg-blue-500' : 'bg-blue-100'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
