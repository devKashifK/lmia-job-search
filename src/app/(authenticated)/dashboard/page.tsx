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
      <div className={isMobile ? 'w-full px-4 py-4 space-y-6' : 'w-full px-6 py-6 space-y-6 max-w-7xl mx-auto'}>
        {/* Header - Compact & Premium */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {getGreeting()}, {session?.user?.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Your daily job market overview.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button className="bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 rounded-lg h-10 px-5 text-sm font-medium">
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
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">
              {getGreeting()}, <span className="text-brand-600">{session?.user?.email?.split('@')[0] || 'User'}</span>
            </h2>
          </div>
        )}

        {/* Stats Grid - Assume component handles its own sizing, but container context helps */}
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Column (Left - 8/12) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Quick Actions - Compact Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-brand-100 rounded-md">
                  <Zap className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  Quick Actions
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Link href={action.href}>
                        <div
                          className={cn(
                            'p-3.5 rounded-xl border bg-white transition-all duration-200 hover:shadow-md hover:border-brand-200 group flex items-center gap-3',
                            action.borderColor
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-lg flex items-center justify-center shrink-0 w-10 h-10",
                              action.bgColor
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-5 h-5',
                                action.color
                              )}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">
                              {action.label}
                            </h3>
                            <p className="text-xs text-gray-500 leading-tight mt-0.5">
                              {action.description}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
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

            {/* Helper Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-brand-900 rounded-xl p-5 relative overflow-hidden text-white shadow-lg shadow-brand-900/10"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Need help finding a job?</h3>
                  <p className="text-brand-100 text-sm max-w-sm">
                    Our AI search helper can guide you to the best LMIA opportunities.
                  </p>
                </div>
                <Button variant="secondary" size="sm" className="text-brand-900 bg-white hover:bg-brand-50 border-0 h-9 text-xs font-semibold px-4 shadow-sm">
                  Contact Support
                </Button>
              </div>

              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-brand-700/50 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-brand-700/50 rounded-full blur-2xl" />
            </motion.div>
          </div>

          {/* Sidebar Column (Right - 4/12) */}
          <div className="lg:col-span-4">
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
