'use client';

import React from 'react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Heart, Globe, Coffee, Laptop, DollarSign } from 'lucide-react';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';

export default function CareersPage() {
    const { isMobile } = useMobile();

    const benefits = [
        {
            icon: <Globe className="w-5 h-5 text-brand-600" />,
            title: 'Remote First',
            description: 'Work from anywhere. We believe in output, not hours in a chair.',
        },
        {
            icon: <Zap className="w-5 h-5 text-brand-600" />,
            title: 'Fast Paced',
            description: 'We move quickly and ship often. Ideal for those who love to build.',
        },
        {
            icon: <Heart className="w-5 h-5 text-brand-600" />,
            title: 'Health & Wellness',
            description: 'Comprehensive health coverage and wellness stipends.',
        },
        {
            icon: <Coffee className="w-5 h-5 text-brand-600" />,
            title: 'Flexible Hours',
            description: 'Set your own schedule. We respect your work-life balance.',
        },
        {
            icon: <Laptop className="w-5 h-5 text-brand-600" />,
            title: 'Top Gear',
            description: 'We provide the latest MacBook Pros and monitor setups.',
        },
        {
            icon: <DollarSign className="w-5 h-5 text-brand-600" />,
            title: 'Competitive Pay',
            description: 'Top-tier salary and equity packages.',
        },
    ];



    return (
        <div className="min-h-screen bg-white flex flex-col">
            {isMobile ? (
                <MobileHeader title="Careers" showBack={true} />
            ) : (
                <Navbar />
            )}

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-brand-900 text-white">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-900/90 to-brand-900/50" />

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                                Build the <span className="text-brand-400">Future</span> of Work
                            </h1>
                            <p className="text-xl text-brand-100 max-w-2xl mx-auto leading-relaxed mb-8">
                                Join a team of passionate builders, thinkers, and doers who are redefining how the world finds work.
                            </p>
                            <button className="px-8 py-4 bg-white text-brand-900 rounded-full font-bold hover:bg-brand-50 transition-colors shadow-lg">
                                View Open Roles
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why JobMaze?</h2>
                            <p className="text-gray-600 text-lg">We take care of our team so they can take care of our users.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                                >
                                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                                    <p className="text-gray-600 text-sm">
                                        {benefit.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open Positions Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
                            <p className="text-gray-600">Come do the best work of your career.</p>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Coffee className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Open Roles Right Now</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                We're currently fully staffed, but we're always looking for talent.
                                Check back later or follow us for updates.
                            </p>
                        </div>
                    </div>
                </section>

            </main>

            {!isMobile && <Footer />}
            {isMobile && <BottomNav />}
        </div>
    );
}
