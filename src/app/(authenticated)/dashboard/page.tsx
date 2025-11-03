'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Search,
  Clock,
  Sparkles,
  ArrowRight,
  MapPin,
  BarChart3,
  Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSavedJobs } from '@/hooks/use-saved-jobs';
import { useSession } from '@/hooks/use-session';
import { useRecentActivity } from '@/hooks/use-recent-activity';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { MobileHeader } from '@/components/mobile/mobile-header';
import useMobile from '@/hooks/use-mobile';

export default function DashboardPage() {
  const { session } = useSession();
  const { isMobile, isMounted } = useMobile();
  const {
    data: savedJobs,
    isLoading: savedJobsLoading,
    refetch: refetchSavedJobs,
  } = useSavedJobs();
  const {
    data: recentActivity,
    isLoading: activityLoading,
    refetch: refetchActivity,
  } = useRecentActivity(5);

  // Debug logging
  console.log('📊 Dashboard - Saved Jobs:', savedJobs?.length || 0);
  console.log(
    '🎯 Dashboard - Recent Activity:',
    recentActivity?.length || 0,
    recentActivity
  );

  const savedJobsCount = savedJobs?.length || 0;

  // Manual refresh function for testing
  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered...');
    await Promise.all([refetchSavedJobs(), refetchActivity()]);
    console.log('✅ Manual refresh complete');
  };

  // Get quick stats - Only real data
  const stats = [
    {
      label: 'Saved Jobs',
      value: savedJobsCount,
      icon: Bookmark,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      href: '/dashboard/saved-jobs',
    },
    {
      label: 'Recent Activity',
      value: recentActivity?.length || 0,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      href: '#activity',
    },
  ];

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

  // Get icon component from icon name string
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'bookmark':
        return Bookmark;
      case 'search':
        return Search;
      default:
        return Bookmark;
    }
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {isMobile && <MobileHeader title="Dashboard" />}
      <div className={isMobile ? 'w-full px-4 py-4' : 'w-full px-6 py-8'}>
        {/* Header - Hide on mobile as we have MobileHeader */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4 border-b pb-3 border-brand-100">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome back, {session?.user?.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-sm text-gray-600">
                  Here&apos;s what&apos;s happening with your job search
                </p>
              </div>
              <Button
                onClick={handleManualRefresh}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </motion.div>
        )}

        {/* Mobile Welcome */}
        {isMobile && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Welcome, {session?.user?.email?.split('@')[0] || 'User'}!
            </h2>
            <p className="text-xs text-gray-600">
              Track your job search progress
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={
            isMobile
              ? 'grid grid-cols-2 gap-3 mb-4'
              : 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'
          }
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                <Link href={stat.href}>
                  <Card
                    className={cn(
                      isMobile
                        ? 'p-3 border transition-all duration-300 hover:shadow-md cursor-pointer group'
                        : 'p-5 border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group',
                      stat.borderColor,
                      stat.bgColor
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className={
                            isMobile
                              ? 'text-xs font-medium text-gray-600 mb-1'
                              : 'text-sm font-medium text-gray-600 mb-1'
                          }
                        >
                          {stat.label}
                        </p>
                        <p
                          className={
                            isMobile
                              ? 'text-2xl font-bold text-gray-900'
                              : 'text-3xl font-bold text-gray-900'
                          }
                        >
                          {(savedJobsLoading && stat.label === 'Saved Jobs') ||
                          (activityLoading && stat.label === 'Recent Activity')
                            ? '...'
                            : stat.value}
                        </p>
                      </div>
                      {!isMobile && (
                        <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                          <Icon className={cn('w-5 h-5', stat.color)} />
                        </div>
                      )}
                    </div>
                    {!isMobile && (
                      <div className="mt-3 flex items-center text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                        View details
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div
          className={
            isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
          }
        >
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              className={
                isMobile
                  ? 'p-4 border border-gray-200'
                  : 'p-5 border-2 border-gray-200'
              }
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={
                    isMobile
                      ? 'p-1.5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg'
                      : 'p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl'
                  }
                >
                  <Sparkles
                    className={
                      isMobile ? 'w-3 h-3 text-white' : 'w-4 h-4 text-white'
                    }
                  />
                </div>
                <h2
                  className={
                    isMobile
                      ? 'text-sm font-bold text-gray-900'
                      : 'font-bold text-gray-900'
                  }
                >
                  Quick Actions
                </h2>
              </div>
              <div
                className={
                  isMobile
                    ? 'grid grid-cols-2 gap-2'
                    : 'grid grid-cols-1 md:grid-cols-2 gap-3'
                }
              >
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    >
                      <Link href={action.href}>
                        <div
                          className={cn(
                            isMobile
                              ? 'p-3 rounded-lg border transition-all duration-300 hover:shadow-sm cursor-pointer group flex flex-col items-center gap-2 text-center'
                              : 'p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md hover:scale-105 cursor-pointer group flex items-center gap-3',
                            action.borderColor,
                            action.bgColor
                          )}
                        >
                          <div
                            className={cn(
                              isMobile ? 'p-2 rounded-lg' : 'p-2.5 rounded-lg',
                              action.bgColor
                            )}
                          >
                            <Icon
                              className={cn(
                                isMobile ? 'w-4 h-4' : 'w-5 h-5',
                                action.color
                              )}
                            />
                          </div>
                          <div>
                            <h3
                              className={
                                isMobile
                                  ? 'font-semibold text-gray-900 text-xs'
                                  : 'font-semibold text-gray-900 text-sm'
                              }
                            >
                              {action.label}
                            </h3>
                            {!isMobile && (
                              <p className="text-xs text-gray-600">
                                {action.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            id="activity"
          >
            <Card
              className={
                isMobile
                  ? 'p-4 border border-gray-200'
                  : 'p-5 border-2 border-gray-200'
              }
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={
                    isMobile
                      ? 'p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg'
                      : 'p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl'
                  }
                >
                  <Clock
                    className={
                      isMobile ? 'w-3 h-3 text-white' : 'w-4 h-4 text-white'
                    }
                  />
                </div>
                <h2
                  className={
                    isMobile
                      ? 'text-sm font-bold text-gray-900'
                      : 'font-bold text-gray-900'
                  }
                >
                  Recent Activity
                </h2>
                {recentActivity && recentActivity.length > 0 && (
                  <span className="ml-auto text-xs text-gray-500">
                    {recentActivity.length}{' '}
                    {recentActivity.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {activityLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const Icon = getIconComponent(activity.icon);
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.4 + index * 0.05,
                        }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={cn('p-2 rounded-lg', activity.bgColor)}>
                          <Icon className={cn('w-4 h-4', activity.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {activity.details}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Saved Jobs Preview */}
        {savedJobsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={isMobile ? 'mt-4' : 'mt-6'}
          >
            <Card
              className={
                isMobile
                  ? 'p-4 border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30'
                  : 'p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30'
              }
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={
                      isMobile
                        ? 'p-1.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg'
                        : 'p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl'
                    }
                  >
                    <Bookmark
                      className={
                        isMobile ? 'w-3 h-3 text-white' : 'w-4 h-4 text-white'
                      }
                    />
                  </div>
                  <div>
                    <h2
                      className={
                        isMobile
                          ? 'text-sm font-bold text-gray-900'
                          : 'text-lg font-bold text-gray-900'
                      }
                    >
                      Your Saved Jobs
                    </h2>
                    <p
                      className={
                        isMobile
                          ? 'text-xs text-gray-600'
                          : 'text-sm text-gray-600'
                      }
                    >
                      You have {savedJobsCount} saved{' '}
                      {savedJobsCount === 1 ? 'job' : 'jobs'}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/saved-jobs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 hover:bg-amber-50 text-xs"
                  >
                    {isMobile ? 'View' : 'View All'}
                    <ArrowRight
                      className={isMobile ? 'w-3 h-3 ml-1' : 'w-4 h-4 ml-1'}
                    />
                  </Button>
                </Link>
              </div>
              <div
                className={
                  isMobile
                    ? 'space-y-2'
                    : 'grid grid-cols-1 md:grid-cols-3 gap-3'
                }
              >
                {savedJobs?.slice(0, 3).map((job, index: number) => (
                  <motion.div
                    key={job.RecordID || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    className={
                      isMobile
                        ? 'p-3 rounded-lg bg-white border border-amber-200 hover:border-amber-300 transition-all'
                        : 'p-4 rounded-lg bg-white border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all'
                    }
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={
                          isMobile
                            ? 'p-1.5 bg-amber-50 rounded-lg'
                            : 'p-2 bg-amber-50 rounded-lg'
                        }
                      >
                        <Briefcase
                          className={
                            isMobile
                              ? 'w-3 h-3 text-amber-600'
                              : 'w-4 h-4 text-amber-600'
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={
                            isMobile
                              ? 'font-semibold text-gray-900 text-xs truncate'
                              : 'font-semibold text-gray-900 text-sm truncate'
                          }
                        >
                          {job.job_title || job.occupation_title}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {job.operating_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {job.city}, {job.state || job.territory}
                      </span>
                    </div>
                    {job.type && (
                      <Badge
                        variant="outline"
                        className="mt-2 text-xs bg-amber-50 border-amber-300 text-amber-700"
                      >
                        {job.type === 'lmia' ? 'LMIA' : 'Hot Leads'}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
}
