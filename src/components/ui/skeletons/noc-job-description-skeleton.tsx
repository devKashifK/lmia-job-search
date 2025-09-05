'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface NocJobDescriptionSkeletonProps {
  className?: string;
}

export function NocJobDescriptionSkeleton({
  className = '',
}: NocJobDescriptionSkeletonProps) {
  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`min-h-full w-full ${className}`}
      >
        <ScrollArea className="h-full w-full">
          <div className="p-1 space-y-4 w-full max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative rounded-2xl bg-gradient-to-r from-brand-400 via-purple-500 to-brand-600 p-0.5">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 shadow-sm">
                  <div className="relative p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* NOC Badge Skeleton */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-7 w-7 rounded-lg bg-white/20" />
                            <Skeleton className="h-6 w-20 rounded bg-white/20" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton className="w-2 h-2 rounded-full bg-white/20" />
                            <Skeleton className="h-4 w-24 rounded bg-white/20" />
                          </div>
                        </div>

                        {/* Title Skeleton */}
                        <Skeleton className="h-8 w-3/4 mb-3 rounded bg-white/20" />

                        {/* Company and Location Skeleton */}
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <Skeleton className="h-4 w-32 rounded bg-white/20" />
                          <Skeleton className="h-4 w-24 rounded bg-white/20" />
                          <Skeleton className="h-4 w-20 rounded bg-white/20" />
                        </div>

                        {/* Badges Skeleton */}
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-6 w-16 rounded bg-white/20" />
                          <Skeleton className="h-6 w-20 rounded bg-white/20" />
                          <Skeleton className="h-6 w-14 rounded bg-white/20" />
                          <Skeleton className="h-6 w-18 rounded bg-white/20" />
                        </div>
                      </div>

                      {/* Action Buttons Skeleton */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Skeleton className="h-8 w-8 rounded bg-white/20" />
                        <Skeleton className="h-8 w-8 rounded bg-white/20" />
                        <Skeleton className="h-8 w-8 rounded bg-white/20" />
                        <Skeleton className="h-8 w-8 rounded bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Info Card Skeleton */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="border-0 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-12 rounded" />
                      <Skeleton className="h-4 w-20 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Sections Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <div className="space-y-4">
                {/* Overview Card Skeleton */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-4 w-5/6 rounded" />
                      <Skeleton className="h-4 w-4/5 rounded" />
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </div>
                  </div>
                </motion.div>

                {/* Requirements Card Skeleton */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="border-0 shadow-sm bg-gradient-to-br from-white to-red-50 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Skeleton className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" />
                          <Skeleton
                            className={`h-4 rounded ${
                              i === 1
                                ? 'w-full'
                                : i === 2
                                ? 'w-5/6'
                                : i === 3
                                ? 'w-4/5'
                                : 'w-2/3'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Responsibilities Card Skeleton */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="border-0 shadow-sm bg-gradient-to-br from-white to-green-50 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Skeleton className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" />
                          <Skeleton
                            className={`h-4 rounded ${
                              i === 1
                                ? 'w-full'
                                : i === 2
                                ? 'w-5/6'
                                : i === 3
                                ? 'w-4/5'
                                : i === 4
                                ? 'w-3/4'
                                : 'w-2/3'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </TooltipProvider>
  );
}
