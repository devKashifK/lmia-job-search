'use client';

import {
    Briefcase,
    TrendingUp,
    MapPin,
    Calendar,
    LineChart,
    ArrowRight,
    Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/ui/section-title';
import useMobile from '@/hooks/use-mobile';
import CustomLink from '@/components/ui/CustomLink';

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
        link: '/dashboard',
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
        link: '/dashboard',
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

    if (!isMounted) {
        return null;
    }

    return (
        <section className={isMobile ? "py-10 relative overflow-hidden" : "py-20 relative overflow-hidden bg-white"}>
            <div className={isMobile ? "max-w-full mx-auto px-4" : "max-w-7xl mx-auto px-8"}>
                <SectionTitle
                    title="JobMaze Intelligence"
                    subtitle="Data-driven insights to give you the competitive edge"
                />

                <div className="mt-12 space-y-20 md:space-y-32">
                    {intelligenceFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={item}
                            className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16`}
                        >
                            {/* Text Content */}
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-sm font-semibold mb-4 border border-brand-100">
                                    {feature.title}
                                </span>
                                <h3 className={isMobile ? "text-2xl font-bold text-gray-900 mb-4" : "text-4xl font-bold text-gray-900 mb-6"}>
                                    {feature.headline}
                                </h3>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    {feature.description}
                                </p>

                                <ul className="space-y-4 mb-8">
                                    {feature.points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="p-1 bg-white rounded-full shadow-sm border border-gray-100 mt-0.5">
                                                <point.icon className="w-4 h-4 text-brand-600" />
                                            </div>
                                            <span className="text-gray-700 font-medium">{point.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                {feature.note && (
                                    <p className="text-sm text-gray-500 italic mb-8 border-l-4 border-gray-200 pl-4">
                                        {feature.note}
                                    </p>
                                )}

                                <CustomLink href={feature.link}>
                                    <button className="flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors group">
                                        {feature.cta}
                                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </CustomLink>
                            </div>

                            {/* Visual Content Placeholder */}
                            <div className="flex-1 w-full">
                                <div className="relative aspect-square md:aspect-[4/3] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-xl group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5" />

                                    {/* Decorative Elements */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4">
                                        {index === 0 ? (
                                            // Hiring Intelligence Visual
                                            <div className="w-full h-full p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100" />
                                                    <div className="space-y-2">
                                                        <div className="w-32 h-4 bg-gray-100 rounded" />
                                                        <div className="w-20 h-3 bg-gray-50 rounded" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex items-end justify-between gap-2 px-2">
                                                    <div className="w-full bg-brand-100 rounded-t h-[40%]" />
                                                    <div className="w-full bg-brand-200 rounded-t h-[60%]" />
                                                    <div className="w-full bg-brand-300 rounded-t h-[80%]" />
                                                    <div className="w-full bg-brand-400 rounded-t h-[50%]" />
                                                    <div className="w-full bg-brand-500 rounded-t h-[90%]" />
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-400">
                                                    <span>2020</span>
                                                    <span>2024</span>
                                                </div>
                                            </div>
                                        ) : (
                                            // Predictive Analysis Visual
                                            <div className="w-full h-full p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-6">
                                                <div className="w-24 h-24 rounded-full border-8 border-brand-100 flex items-center justify-center relative">
                                                    <TrendingUp className="w-10 h-10 text-brand-500" />
                                                    <div className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                        +45%
                                                    </div>
                                                </div>
                                                <div className="space-y-3 w-full max-w-[200px]">
                                                    <div className="w-full h-2 bg-brand-50 rounded-full overflow-hidden">
                                                        <div className="w-3/4 h-full bg-brand-500 rounded-full" />
                                                    </div>
                                                    <div className="w-full h-2 bg-brand-50 rounded-full overflow-hidden">
                                                        <div className="w-1/2 h-full bg-brand-300 rounded-full" />
                                                    </div>
                                                    <div className="w-full h-2 bg-brand-50 rounded-full overflow-hidden">
                                                        <div className="w-2/3 h-full bg-brand-400 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
