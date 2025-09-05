'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface AllJobsListSkeletonProps {
  className?: string;
  itemCount?: number;
}

export function AllJobsListSkeleton({ 
  className = '', 
  itemCount = 6 
}: AllJobsListSkeletonProps) {
  return (
    <div className={`bg-white overflow-y-auto ${className}`}>
      {/* Header Skeleton - matches AllJobsList header exactly */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Skeleton className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Job Listings
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sort Button Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded border" />
          </div>
        </div>
      </div>

      {/* Job List Items Skeleton - matches AllJobsList structure */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: itemCount }, (_, index) => (
          <div
            key={index}
            className="group cursor-pointer transition-all duration-150 hover:bg-gray-50"
          >
            <div className="px-4 py-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Job Title and Company skeleton */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Skeleton className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        {/* New badge skeleton - random chance */}
                        {index % 3 === 0 && (
                          <Skeleton className="h-5 w-8 rounded" />
                        )}
                      </div>
                      <Skeleton className="h-4 w-1/2 rounded" />
                    </div>
                  </div>

                  {/* Job Details skeleton */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-2">
                    {/* Location */}
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-3 h-3 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    
                    {/* NOC Code */}
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-3 h-3 rounded" />
                      <Skeleton className="h-3 w-12 rounded" />
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-3 h-3 rounded" />
                      <Skeleton className="h-3 w-14 rounded" />
                    </div>

                    {/* Positions - occasionally */}
                    {index % 4 === 0 && (
                      <Skeleton className="h-3 w-18 rounded" />
                    )}

                    {/* LMIA Year - occasionally */}
                    {index % 5 === 0 && (
                      <div className="flex items-center gap-1">
                        <Skeleton className="w-3 h-3 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    )}
                  </div>

                  {/* Tags skeleton */}
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-16 rounded" />
                    {index % 3 === 0 && <Skeleton className="h-6 w-20 rounded" />}
                    {index % 4 === 0 && <Skeleton className="h-6 w-14 rounded" />}
                    {index % 2 === 0 && <Skeleton className="h-6 w-12 rounded" />}
                  </div>
                </div>

                {/* Save Button skeleton */}
                <Skeleton className="flex-shrink-0 h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state would go here if needed */}
    </div>
  );
}
