'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Search, Bookmark } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRecentActivity } from '@/hooks/use-recent-activity';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivityFeed() {
    const { data: activities, isLoading } = useRecentActivity(10);

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'bookmark':
                return Bookmark;
            case 'search':
                return Search;
            default:
                return Clock;
        }
    };

    const formatRelativeTime = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6 border-2 border-gray-200 h-full">
                <div className="space-y-4">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-2 h-full bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-0 border-2 border-gray-100 overflow-hidden h-full bg-white shadow-sm">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    Recent Activity
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                    Last 30 days
                </span>
            </div>

            <div className="p-0">
                {!activities || activities.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-900 font-medium">No recent activity</p>
                        <p className="text-xs text-gray-500 mt-1">Start searching to track your history</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-8 top-6 bottom-6 w-px bg-gray-200" />

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {activities.map((activity, index) => {
                                const Icon = getIconComponent(activity.icon);
                                return (
                                    <motion.div
                                        key={`${activity.type}-${activity.id}-${index}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="relative pl-16 py-4 pr-5 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
                                    >
                                        {/* Timestamp bubble on left */}
                                        <div className="absolute left-4 top-5 w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 bg-white group-hover:scale-110 transition-transform duration-200">
                                            <Icon className={cn("w-3.5 h-3.5", activity.color)} />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                                                    {activity.action}
                                                </p>
                                                <span className="text-[10px] text-gray-400 font-medium tabular-nums px-1.5 py-0.5 rounded-full bg-gray-100/50">
                                                    {formatRelativeTime(activity.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                                {activity.details}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
