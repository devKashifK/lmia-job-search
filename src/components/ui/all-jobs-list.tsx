'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Star,
  Info,
  Clock,
} from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import Link from 'next/link';
import { useSession } from '@/hooks/use-session';
import {
  checkMultipleSavedJobs,
  getJobRecordId,
} from '@/utils/saved-jobs';
import { JobSortPopover, sortJobs, type SortConfig } from './job-sort-popover';
import { AttributeName } from '@/helpers/attribute';
import { useSaveJobList } from '@/hooks/use-save-job';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { JobListItem } from './job-list-item';

interface Job {
  id?: number;
  RecordID?: number;
  employer: string;
  job_title?: string;
  occupation_title?: string;
  city: string;
  state: string;
  noc_code?: string;
  '2021_noc'?: string;
  category?: string;
  employer_type?: string;
  date_of_job_posting?: string;
  program?: string;
  lmia_year?: number;
  priority_occupation?: string;
  approved_positions?: number;
  territory?: string;
}

interface AllJobsListProps {
  jobs: Job[];
  selectedJobId?: number;
  onJobSelect: (job: Job) => void;
  savedJobs: Set<number>;
  onToggleSaved: (jobIndex: number) => void;
  className?: string;
  totalCount?: number; // Total count from database
  searchType?: 'lmia' | 'hot_leads';
}

export function AllJobsList({
  jobs,
  selectedJobId,
  onJobSelect,
  savedJobs,
  onToggleSaved,
  className = '',
  totalCount,
  searchType = 'hot_leads',
}: AllJobsListProps) {
  const { session } = useSession();
  const {
    savedJobs: dbSavedJobs,
    toggleSave,
    setSavedJobs: setDbSavedJobs,
    isLoading: isLoadingSavedJobs,
    LoginAlertComponent,
  } = useSaveJobList();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Load saved jobs from database on mount or when jobs change
  useEffect(() => {
    let isCancelled = false;

    const loadSavedJobs = async () => {
      if (!session?.user?.id || !jobs.length) {
        setDbSavedJobs(new Set());
        return;
      }

      try {
        const recordIds = jobs
          .map((job) => getJobRecordId(job))
          .filter(Boolean) as string[];

        if (recordIds.length > 0 && !isCancelled) {
          const savedRecordIds = await checkMultipleSavedJobs(
            recordIds,
            session
          );
          if (!isCancelled) {
            setDbSavedJobs(savedRecordIds);
          }
        }
      } catch (error) {
        console.error('Failed to load saved jobs:', error);
        if (!isCancelled) {
          setDbSavedJobs(new Set());
        }
      }
    };

    loadSavedJobs();

    // Cleanup function to cancel async operation
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, jobs.length]);

  const { preferences } = useUserPreferences();

  // Sort jobs if sort config is set
  const sortedJobs = useMemo(() => {
    return sortJobs(jobs, sortConfig);
  }, [jobs, sortConfig]);

  // Calculate saved count - prioritize database state over local state
  const savedCount = sortedJobs.filter((job, index) => {
    const recordId = getJobRecordId(job);
    return recordId ? dbSavedJobs.has(recordId) : savedJobs.has(index);
  }).length;

  return (
    <TooltipProvider>
      <div className={`bg-gray-50/50 overflow-y-auto ${className}`}>
        {/* Enhanced Compact Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Job Listings
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {savedCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-0.5 text-yellow-600 text-xs">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {savedCount} saved
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            You have {savedCount} saved job
                            {savedCount > 1 ? 's' : ''}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sort Button */}
            <div className="flex items-center gap-2">
              <JobSortPopover
                currentSort={sortConfig}
                onSortChange={setSortConfig}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Compact Job List */}
        <div className="space-y-1 p-2 pb-20">
          {sortedJobs.map((job, index) => {
            const isSelected = selectedJobId === (job.id || index);
            const recordId = getJobRecordId(job);
            // Prioritize database state over local state for saved status
            const isSaved = recordId
              ? dbSavedJobs.has(recordId)
              : savedJobs.has(index);

            return (
              <JobListItem
                key={job.id || index}
                job={job}
                isSelected={isSelected}
                onSelect={onJobSelect}
                isSaved={isSaved}
                onToggleSave={async (e) => {
                  e.stopPropagation();

                  if (!recordId) {
                    console.warn('No record ID found for job');
                    return;
                  }

                  try {
                    const success = await toggleSave(recordId);
                    if (success) {
                      // Also update local state for consistency
                      onToggleSaved(index);
                    }
                  } catch (error) {
                    console.error('Failed to save/unsave job:', error);
                    // Fallback to local state on error
                    onToggleSaved(index);
                  }
                }}
                searchType={searchType}
                isLoadingSaved={isLoadingSavedJobs}
                userPreferences={preferences}
                index={index}
              />
            );
          })}

          {/* Enhanced Empty State */}
          {sortedJobs.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Try adjusting your search criteria or check back later for new
                opportunities.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Info className="w-3 h-3" />
                <span>Tip: Use broader search terms for more results</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <LoginAlertComponent />
    </TooltipProvider>
  );
}

