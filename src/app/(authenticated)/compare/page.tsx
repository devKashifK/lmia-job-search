'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Briefcase,
    MapPin,
    Building2,
    Users,
    BarChart3,
    TrendingUp,
    Sparkles,
    CheckCircle2,
    Zap,
    Target,
    Shield,
    Clock,
    Globe,
    Twitter,
    Linkedin,
    Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/ui/nabvar';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';
import Link from 'next/link';

const FEATURES = [
    {
        icon: Briefcase,
        title: 'Job Titles',
        description: 'Compare salaries, requirements, and growth potential across different positions',
        metrics: ['Salary ranges', 'Job demand', 'Required skills'],
    },
    {
        icon: MapPin,
        title: 'Locations',
        description: 'Analyze job markets, cost of living, and opportunities across cities or states',
        metrics: ['Market size', 'Opportunities', 'Regional trends'],
    },
    {
        icon: Building2,
        title: 'Companies',
        description: 'Compare employers side-by-side with detailed metrics and insights',
        metrics: ['Company size', 'Job postings', 'Market presence'],
    },
    {
        icon: Users,
        title: '3-Way Comparison',
        description: 'Go beyond head-to-head with advanced 3-way comparison capabilities',
        metrics: ['Multiple entities', 'Detailed analysis', 'Side-by-side view'],
    },
];

const HOW_IT_WORKS = [
    {
        step: '1',
        title: 'Choose Comparison Type',
        description: 'Select what you want to compare: jobs, locations, or companies',
    },
    {
        step: '2',
        title: 'Select Entities',
        description: 'Pick 2 or 3 items to compare from our verified database',
    },
    {
        step: '3',
        title: 'Get Insights',
        description: 'View detailed comparisons with 100+ data points and AI recommendations',
    },
];

const STATS = [
    { value: '100+', label: 'Data Metrics' },
    { value: '10k+', label: 'Companies' },
    { value: '50k+', label: 'Job Listings' },
    { value: '24/7', label: 'Live Updates' },
];

export default function CompareLandingPage() {
    const router = useRouter();
    const { isMobile } = useMobile();

    const handleLaunchTool = () => {
        router.push('/compare/tool');
    };

    return (
        <BackgroundWrapper>
            {isMobile ? (
                <MobileHeader title="Comparator" showBack={true} />
            ) : (
                <Navbar />
            )}

            <div className={isMobile ? 'min-h-screen pb-20' : 'min-h-screen pt-20 pb-12'}>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/20 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50 -z-10" />
                <div className="absolute top-1/3 left-0 w-[350px] h-[350px] bg-brand-50/40 rounded-full blur-[90px] -ml-20 opacity-40 -z-10" />

                <div className={isMobile ? 'container mx-auto px-4' : 'container mx-auto px-6 max-w-7xl'}>
                    {/* Hero Section - Compact */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={cn("text-center relative mx-auto", isMobile ? "mb-12 pt-6" : "mb-16 pt-8 max-w-4xl")}
                    >
                        <Badge className="bg-brand-50 text-brand-600 border-brand-200 mb-4 text-xs px-3 py-1">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Smart Comparison Tool
                        </Badge>

                        <h1 className={cn("font-extrabold text-gray-900 tracking-tight leading-tight", isMobile ? "text-3xl mb-4" : "text-4xl md:text-5xl mb-5")}>
                            Compare. Analyze.{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-500">
                                Decide
                            </span>
                        </h1>

                        <p className={cn("text-gray-600 mx-auto leading-relaxed", isMobile ? "text-sm mb-6" : "text-lg mb-8 max-w-2xl")}>
                            Make informed career decisions by comparing jobs, locations, and companies with comprehensive data and AI-powered insights.
                        </p>

                        {/* CTA Buttons */}
                        <div className={cn("flex items-center justify-center gap-3", isMobile ? "flex-col mb-8" : "flex-row mb-10")}>
                            <Button
                                size={isMobile ? "default" : "lg"}
                                onClick={handleLaunchTool}
                                className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/25 rounded-lg px-6 py-5 font-semibold transition-all transform hover:-translate-y-0.5"
                            >
                                <Zap className="w-4 h-4 mr-2 fill-white" />
                                Launch Comparator
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                                size={isMobile ? "default" : "lg"}
                                variant="outline"
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="border-2 border-gray-200 hover:border-brand-200 hover:bg-brand-50 rounded-lg px-6 py-5 font-semibold"
                            >
                                See How It Works
                            </Button>
                        </div>

                        {/* Compact Stats */}
                        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                            {STATS.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                    className="text-center"
                                >
                                    <div className={cn("font-bold text-brand-600", isMobile ? "text-lg" : "text-2xl")}>{stat.value}</div>
                                    <div className={cn("text-gray-500", isMobile ? "text-[10px]" : "text-xs")}>{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Features Section - Compact */}
                    <div id="features" className={isMobile ? "mb-10" : "mb-14"}>
                        <div className={cn("text-center", isMobile ? "mb-6" : "mb-8")}>
                            <Badge className="bg-brand-100 text-brand-700 mb-3 text-xs px-3 py-1">
                                Powerful Features
                            </Badge>
                            <h2 className={cn("font-extrabold text-gray-900", isMobile ? "text-2xl mb-2" : "text-3xl md:text-4xl mb-3")}>
                                Compare Anything, <span className="text-brand-600">Anywhere</span>
                            </h2>
                            <p className={cn("text-gray-600 mx-auto", isMobile ? "text-sm" : "text-base max-w-2xl")}>
                                Choose what matters to you and get detailed side-by-side comparisons
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {FEATURES.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08, duration: 0.4 }}
                                    >
                                        <Card
                                            className="group relative h-full bg-white border-2 border-brand-100 rounded-2xl p-5 hover:shadow-lg hover:border-brand-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                            onClick={handleLaunchTool}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="inline-flex p-2.5 rounded-xl bg-brand-50 group-hover:scale-105 transition-transform">
                                                    <Icon className="w-5 h-5 text-brand-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{feature.description}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {feature.metrics.map((metric) => (
                                                            <Badge key={metric} variant="secondary" className="text-[10px] px-2 py-0.5 bg-brand-50 text-brand-700">
                                                                {metric}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-3 right-3 text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* How It Works Section */}
                    <div className={isMobile ? "mb-10" : "mb-14"}>
                        <div className={cn("text-center", isMobile ? "mb-6" : "mb-8")}>
                            <Badge className="bg-brand-100 text-brand-700 mb-3 text-xs px-3 py-1">
                                How It Works
                            </Badge>
                            <h2 className={cn("font-extrabold text-gray-900", isMobile ? "text-2xl mb-2" : "text-3xl md:text-4xl mb-3")}>
                                Simple, Fast, <span className="text-brand-600">Powerful</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {HOW_IT_WORKS.map((item, index) => (
                                <motion.div
                                    key={item.step}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="relative p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-200 hover:shadow-md transition-all">
                                        <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            {item.step}
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-2 mt-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className={isMobile ? "mb-8" : "mb-12"}
                    >
                        <Card className="relative overflow-hidden bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl p-8 border-0 shadow-xl">
                            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-white/10 rounded-full blur-[80px] -mr-16 -mt-16" />
                            <div className="relative z-10 max-w-3xl mx-auto text-center">
                                <h2 className={cn("font-extrabold mb-4", isMobile ? "text-2xl" : "text-3xl md:text-4xl")}>
                                    Ready to Make Smarter Decisions?
                                </h2>
                                <p className={cn("text-brand-50 mb-6 leading-relaxed", isMobile ? "text-sm" : "text-lg")}>
                                    Join thousands of professionals using our compar ator to find the best opportunities
                                </p>

                                <Button
                                    size="lg"
                                    onClick={handleLaunchTool}
                                    className="bg-white text-brand-600 hover:bg-gray-50 shadow-lg rounded-lg px-8 py-5 font-bold transition-all transform hover:-translate-y-0.5"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>

                                <div className={cn("grid gap-4 text-left", isMobile ? "grid-cols-1 mt-6" : "grid-cols-3 mt-8")}>
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm mb-0.5">No Credit Card</p>
                                            <p className="text-brand-100 text-xs">Start comparing now</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm mb-0.5">Unlimited Use</p>
                                            <p className="text-brand-100 text-xs">Compare as many as needed</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm mb-0.5">Save & Share</p>
                                            <p className="text-brand-100 text-xs">Access anytime, anywhere</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Footer */}
                {!isMobile && (
                    <footer className="bg-gray-50 border-t border-gray-200 mt-16 py-8">
                        <div className="container mx-auto px-6 max-w-7xl">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {/* Brand Column */}
                                <div className="md:col-span-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg">
                                            <BarChart3 className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-bold text-gray-900">Jobmaze Comparator</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                        Make informed career decisions with data-driven comparisons.
                                    </p>
                                    <div className="flex gap-3">
                                        <a href="#" className="p-2 rounded-lg bg-gray-100 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                        <a href="#" className="p-2 rounded-lg bg-gray-100 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                        <a href="#" className="p-2 rounded-lg bg-gray-100 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                                            <Github className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>

                                {/* Product Column */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Product</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><Link href="/compare/tool" className="text-gray-600 hover:text-brand-600 transition-colors">Comparator Tool</Link></li>
                                        <li><Link href="/analysis" className="text-gray-600 hover:text-brand-600 transition-colors">Market Analysis</Link></li>
                                        <li><Link href="/jobs" className="text-gray-600 hover:text-brand-600 transition-colors">Job Search</Link></li>
                                        <li><Link href="/resources" className="text-gray-600 hover:text-brand-600 transition-colors">Resources</Link></li>
                                    </ul>
                                </div>

                                {/* Company Column */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Company</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><Link href="/about" className="text-gray-600 hover:text-brand-600 transition-colors">About Us</Link></li>
                                        <li><Link href="/contact" className="text-gray-600 hover:text-brand-600 transition-colors">Contact</Link></li>
                                        <li><Link href="/privacy" className="text-gray-600 hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
                                        <li><Link href="/terms" className="text-gray-600 hover:text-brand-600 transition-colors">Terms of Service</Link></li>
                                    </ul>
                                </div>

                                {/* Support Column */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Support</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><Link href="/resources/documentation" className="text-gray-600 hover:text-brand-600 transition-colors">Documentation</Link></li>
                                        <li><Link href="/help" className="text-gray-600 hover:text-brand-600 transition-colors">Help Center</Link></li>
                                        <li><Link href="/faq" className="text-gray-600 hover:text-brand-600 transition-colors">FAQ</Link></li>
                                        <li><a href="mailto:support@jobmaze.ca" className="text-gray-600 hover:text-brand-600 transition-colors">support@jobmaze.ca</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-500">
                                    © {new Date().getFullYear()} Jobmaze. All rights reserved.
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5" />
                                        Secure & Private
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Real-time Data
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Globe className="w-3.5 h-3.5" />
                                        Canada-wide
                                    </span>
                                </div>
                            </div>
                        </div>
                    </footer>
                )}
            </div>

            {isMobile && <BottomNav />}
        </BackgroundWrapper>
    );
}
