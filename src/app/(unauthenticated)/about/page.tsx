'use client';

import React from 'react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { motion } from 'framer-motion';
import { Users, Target, Shield, Zap, Globe, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

export default function AboutPage() {
    const { isMobile } = useMobile();

    const stats = [
        { label: 'Active Jobs', value: '10k+', icon: <Zap className="w-5 h-5 text-yellow-500" /> },
        { label: 'Companies', value: '500+', icon: <BuildingIcon className="w-5 h-5 text-blue-500" /> },
        { label: 'Job Seekers', value: '50k+', icon: <Users className="w-5 h-5 text-green-500" /> },
        { label: 'Countries', value: '12', icon: <Globe className="w-5 h-5 text-purple-500" /> },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
            {isMobile ? (
                <MobileHeader title="About Us" showBack={true} />
            ) : (
                <Navbar />
            )}

            <main className="flex-grow">
                {/* Hero Section - Premium Gradient & Glass */}
                <section className="relative pt-32 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white -z-10" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-100/30 rounded-full blur-[100px] -mr-32 -mt-32 opacity-60 animate-pulse-slow" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px] -ml-20 -mb-20 opacity-60" />

                    <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold uppercase tracking-widest mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                                </span>
                                Our Mission
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
                                Empowering Global <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">Talent & Opportunity</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-light">
                                We're democratizing access to the Canadian job market through data intelligence, transparency, and seamless connections.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section - Floating Glass Cards */}
                <section className="py-8 bg-white relative z-20 -mt-16">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-brand-100/50 hover:-translate-y-1 transition-all duration-300 text-center group"
                                >
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        {stat.icon}
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 tracking-tight">{stat.value}</div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Story Section - Modern Layout */}
                <section className="py-24 md:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                                    Bridging the Gap Between <br />
                                    <span className="text-brand-600">Dreams & Reality</span>
                                </h2>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-light">
                                    <p>
                                        JobMaze began with a simple observation: talented individuals around the world strive to contribute to the Canadian economy, but the path is often cluttered with confusing information and inaccessible opportunities.
                                    </p>
                                    <p>
                                        We built JobMaze to cut through the noise. By aggregating official LMIA data and combining it with real-time job listings, we provide a clear, data-driven pathway for job seekers and a targeted recruitment tool for employers.
                                    </p>
                                    <div className="pt-6 border-t border-gray-100 mt-8">
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500 overflow-hidden`}>
                                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-bold text-gray-900 block">Trusted by Professionals</span>
                                                <span className="text-gray-500">From over 12 countries</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative"
                            >
                                <div className="aspect-square bg-gradient-to-tr from-brand-600 to-blue-500 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-brand-900/20 rotate-3 hover:rotate-0 transition-all duration-500">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-8 left-8 right-8 text-white">
                                        <div className="text-3xl font-bold mb-2">Build Your Future</div>
                                        <p className="text-white/80">Join thousands who found their path with us.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values Section - Bento Grid */}
                <section className="py-24 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">Our DNA</span>
                            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-6">Core Values</h2>
                            <p className="text-gray-600 text-lg">The fundamental principles that guide every decision we make at JobMaze.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                            {/* Large Card - Mission */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="md:col-span-2 bg-white rounded-3xl p-10 border border-gray-100 shadow-sm relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mb-6 text-brand-600">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Mission Driven</h3>
                                        <p className="text-gray-600 text-lg max-w-md">We are dedicated to simplifying the complex landscape of Canadian immigration and employment.</p>
                                    </div>
                                    <div className="mt-8 flex gap-2">
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">Focus</span>
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">Clarity</span>
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">Impact</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Standard Card - Transparency */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group"
                            >
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-50 rounded-full blur-2xl -ml-16 -mb-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency</h3>
                                <p className="text-gray-600">We believe in open data. No hidden fees, no opaque processes.</p>
                            </motion.div>

                            {/* Standard Card - Innovation */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -ml-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
                                <p className="text-gray-600">Leveraging AI and real-time data to provide the most accurate insights.</p>
                            </motion.div>

                            {/* Medium Card - Community */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 shadow-lg text-white relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div>
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 text-white">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">Community First</h3>
                                        <p className="text-gray-300 text-lg max-w-md">Building a supportive ecosystem where job seekers and employers thrive together.</p>
                                    </div>
                                    <div className="hidden md:block">
                                        <Award className="w-24 h-24 text-white/10 rotate-12" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            {!isMobile && <Footer />}
            {isMobile && <BottomNav />}
        </div>
    );
}

function BuildingIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="9" y1="22" x2="9" y2="22.01"></line>
            <line x1="15" y1="22" x2="15" y2="22.01"></line>
            <line x1="12" y1="18" x2="12" y2="18.01"></line>
            <line x1="12" y1="14" x2="12" y2="14.01"></line>
            <line x1="12" y1="10" x2="12" y2="10.01"></line>
            <line x1="12" y1="6" x2="12" y2="6.01"></line>
            <line x1="9" y1="6" x2="9" y2="6.01"></line>
            <line x1="15" y1="6" x2="15" y2="6.01"></line>
            <line x1="9" y1="10" x2="9" y2="10.01"></line>
            <line x1="15" y1="10" x2="15" y2="10.01"></line>
        </svg>
    )
}
