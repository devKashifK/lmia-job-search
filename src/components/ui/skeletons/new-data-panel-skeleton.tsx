'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface NewDataPanelSkeletonProps {
  className?: string;
}

export function NewDataPanelSkeleton({
  className = '',
}: NewDataPanelSkeletonProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Grid of Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-3xl bg-white p-2 border border-gray-100 shadow-sm"
          >
            {/* Top Section */}
            <div className="rounded-2xl px-5 pt-5 pb-4 flex flex-col relative bg-gray-50 h-[140px]">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-5 w-20 rounded-full bg-gray-200" />
                <Skeleton className="h-8 w-8 rounded-full bg-white" />
              </div>
              <div className="mt-auto space-y-2">
                <Skeleton className="h-3 w-24 bg-gray-200" />
                <Skeleton className="h-6 w-48 bg-gray-300" />
              </div>
            </div>
            {/* Bottom Section */}
            <div className="px-5 pt-3 pb-2 flex items-end justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-16 bg-gray-200" />
                <Skeleton className="h-3 w-32 bg-gray-100" />
              </div>
              <Skeleton className="h-8 w-20 rounded-full bg-gray-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
