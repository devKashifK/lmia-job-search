'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  BarChart3,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import Link from 'next/link';
import { MobileHeader } from '@/components/mobile/mobile-header';
import useMobile from '@/hooks/use-mobile';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { RecommendationsWidget } from '@/components/dashboard/recommendations-widget';

export default function DashboardPage() {
  const { session } = useSession();
  const { isMobile, isMounted } = useMobile();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      label: 'Search Jobs',
      description: 'Find your dream job',
      icon: Search,
      color: 'text-brand-600',
      bgColor: 'bg-brand-50',
      borderColor: 'border-brand-200',
      href: '/',
    },
    {
      label: 'Compare Jobs',
      description: 'Compare side by side',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      href: '/compare',
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {isMobile && <MobileHeader title="Dashboard" />}
      <div className={isMobile ? 'w-full px-4 py-4 space-y-6' : 'w-full px-8 py-8 space-y-8 max-w-7xl mx-auto'}>
        {/* Header - Hide on mobile as we have MobileHeader */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between"
          >
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {getGreeting()}, {session?.user?.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-gray-500 text-lg">
                Here&apos;s what&apos;s happening with your job search today.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shdaow-brand-500/20 rounded-xl h-11 px-6">
                  <Search className="w-4 h-4 mr-2" />
                  Find Jobs
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Mobile Welcome */}
        {isMobile && (
          <div className="mb-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {getGreeting()}, <br />
              <span className="text-brand-600">{session?.user?.email?.split('@')[0] || 'User'}</span>
            </h2>
            <p className="text-sm text-gray-600">
              Track your job search progress
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column (Left - 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg shadow-sm">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Quick Actions
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={action.href}>
                        <div
                          className={cn(
                            isMobile
                              ? 'p-4 rounded-xl border bg-white shadow-sm flex items-center gap-3'
                              : 'p-5 rounded-xl border-2 bg-white transition-all duration-300 hover:shadow-lg group flex items-start gap-4',
                            action.borderColor
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-xl flex items-center justify-center shrink-0",
                              isMobile ? "w-10 h-10" : "w-12 h-12",
                              action.bgColor
                            )}
                          >
                            <Icon
                              className={cn(
                                isMobile ? 'w-5 h-5' : 'w-6 h-6',
                                action.color
                              )}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-brand-600 transition-colors">
                              {action.label}
                            </h3>
                            <p className="text-sm text-gray-500 leading-snug">
                              {action.description}
                            </p>
                          </div>
                          <div className="ml-auto self-center">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors text-gray-400">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Job Recommendations */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <RecommendationsWidget />
              </motion.div>
            )}

            {/* Recent Searches / Saved Jobs Preview could go here if we wanted more widgets */}
            {/* For now keeping it clean with just stats and quick actions on the main feed */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-brand-900 rounded-2xl p-6 relative overflow-hidden text-white"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                <p className="text-brand-100 mb-4 max-w-md">
                  Our AI-powered search helper can guide you to the best LMIA opportunities based on your profile.
                </p>
                <Button variant="secondary" className="text-brand-900 bg-white hover:bg-brand-50 border-0">
                  Contact Support
                </Button>
              </div>

              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-800 rounded-full opacity-50 blur-2xl" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-brand-800 rounded-full opacity-50 blur-2xl" />
            </motion.div>
          </div>

          {/* Sidebar Column (Right - 1/3) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="h-full"
            >
              <RecentActivityFeed />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
