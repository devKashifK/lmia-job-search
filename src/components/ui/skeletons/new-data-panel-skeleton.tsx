'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { NocJobDescriptionSkeleton } from './noc-job-description-skeleton';
import { AllJobsListSkeleton } from './all-jobs-list-skeleton';

interface NewDataPanelSkeletonProps {
  className?: string;
}

export function NewDataPanelSkeleton({
  className = '',
}: NewDataPanelSkeletonProps) {
  return (
    <div className={`flex flex-col w-full  h-[1200px] ${className}`}>
      <div className="flex flex-1 min-h-0">
        {/* Middle Section - NOC Job Description - Fixed width */}
        <div className="flex-1 min-w-0 max-w-4xl">
          <NocJobDescriptionSkeleton className="h-full" />
        </div>

        {/* Right Sidebar - All Jobs - Fixed width */}
        <div className="w-96 flex-shrink-0 border-l ml-4 border-gray-200">
          <AllJobsListSkeleton className="h-full" itemCount={5} />
        </div>
      </div>

      {/* Pagination Controls Skeleton - Outside scrollable area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 shadow-none">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-2">
            {/* Previous button */}
            <Skeleton className="h-8 w-8 rounded" />

            {/* Page numbers */}
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded bg-brand-100" />{' '}
              {/* Current page */}
              <Skeleton className="h-8 w-8 rounded" />
              <span className="flex items-center px-2 text-gray-500">...</span>
              <Skeleton className="h-8 w-8 rounded" />
            </div>

            {/* Next button */}
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
