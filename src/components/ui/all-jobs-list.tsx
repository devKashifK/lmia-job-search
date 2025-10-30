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
  handleSave,
  checkMultipleSavedJobs,
  getJobRecordId,
} from '@/utils/saved-jobs';
import { JobSortPopover, sortJobs, type SortConfig } from './job-sort-popover';
import { AttributeName } from '@/helpers/attribute';

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
}

export function AllJobsList({
  jobs,
  selectedJobId,
  onJobSelect,
  savedJobs,
  onToggleSaved,
  className = '',
  totalCount,
}: AllJobsListProps) {
  const { session, isLoading: sessionLoading } = useSession();
  const [dbSavedJobs, setDbSavedJobs] = useState<Set<string>>(new Set());
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Load saved jobs from database on mount or when jobs change
  useEffect(() => {
    let isCancelled = false;

    const loadSavedJobs = async () => {
      // Wait for session to load and both session and jobs to be available
      if (sessionLoading) {
        return;
      }

      if (!session?.user?.id || !jobs.length) {
        setDbSavedJobs(new Set());
        return;
      }

      setIsLoadingSavedJobs(true);
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
      } finally {
        if (!isCancelled) {
          setIsLoadingSavedJobs(false);
        }
      }
    };

    loadSavedJobs();

    // Cleanup function to cancel async operation
    return () => {
      isCancelled = true;
    };
  }, [session?.user?.id, jobs, sessionLoading]);

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
      <div className={`bg-white overflow-y-auto ${className}`}>
        {/* Enhanced Compact Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-3 py-2 shadow-sm">
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
                    {/* <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {totalCount !== undefined ? (
                            <>
                              {totalCount.toLocaleString()} total
                              {jobs.length < totalCount && (
                                <span className="text-gray-400">
                                  {' '}
                                  (showing {jobs.length})
                                </span>
                              )}
                            </>
                          ) : (
                            `${jobs.length} available`
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {totalCount !== undefined ? (
                          <div>
                            <p>
                              Total jobs matching your criteria:{' '}
                              {totalCount.toLocaleString()}
                            </p>
                            {jobs.length < totalCount && (
                              <p className="text-xs text-gray-500 mt-1">
                                Currently viewing page with {jobs.length} jobs
                              </p>
                            )}
                          </div>
                        ) : (
                          <p>Jobs available on this page</p>
                        )}
                      </TooltipContent>
                    </Tooltip> */}
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
        <div className="divide-y divide-gray-100">
          {sortedJobs.map((job, index) => {
            const isSelected = selectedJobId === (job.id || index);
            const recordId = getJobRecordId(job);
            // Prioritize database state over local state for saved status
            const isSaved = recordId
              ? dbSavedJobs.has(recordId)
              : savedJobs.has(index);
            const jobTitle = job.job_title || job.occupation_title || 'N/A';
            const nocCode = job.noc_code || job['2021_noc'] || 'N/A';
            const isRecent =
              job.date_of_job_posting &&
              new Date().getTime() -
                new Date(job.date_of_job_posting).getTime() <
                7 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={job.id || index}
                className={`group cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white border-b border-gray-100 ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-50 to-white border-l-4 border-l-brand-500 shadow-md'
                    : 'hover:border-l-2 hover:border-l-brand-300'
                }`}
                onClick={() => onJobSelect(job)}
              >
                <div className="px-3 py-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Job Title and Company */}
                      <div className="flex items-start gap-2 mb-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-brand-100 group-hover:to-brand-200 group-hover:text-brand-600'
                              }`}
                            >
                              <Building2 className="w-4 h-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Company: <AttributeName name={job.employer} />
                            </p>
                            {job.employer_type && (
                              <p>Type: {job.employer_type}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h4 className="font-semibold text-gray-900 truncate cursor-help text-sm group-hover:text-brand-700 transition-colors">
                                  <AttributeName name={jobTitle} />
                                </h4>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  <AttributeName name={jobTitle} />
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            {isRecent && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300 font-semibold shadow-sm"
                                  >
                                    New
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Posted within the last 7 days</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <Link
                            onClick={(e) => e.stopPropagation()}
                            href={`/company/${encodeURIComponent(
                              job.employer
                            )}?field=employer&t=trending_job`}
                            className="text-xs text-gray-600 truncate hover:text-brand-600 hover:underline transition-colors font-medium"
                          >
                            <AttributeName name={job.employer} />
                          </Link>
                        </div>
                      </div>

                      {/* Enhanced Job Details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <MapPin className="w-3 h-3" />
                              <span className="text-xs">
                                <AttributeName name={job.city} />,
                                <AttributeName name={job.state} />
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Job Location</p>
                            {job.territory && (
                              <p className="text-xs text-gray-500 mt-1">
                                Territory: {job.territory}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <Briefcase className="w-3 h-3" />
                              <span className="text-xs">NOC: {nocCode}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>National Occupational Classification</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Code: {nocCode}
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        {job.date_of_job_posting && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-help">
                                <Calendar className="w-3 h-3" />
                                <span className="text-xs">
                                  {new Date(
                                    job.date_of_job_posting
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Job Posted Date</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                  job.date_of_job_posting
                                ).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {job.approved_positions && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help text-xs">
                                {job.approved_positions} positions
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Number of approved positions for this job</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {job.lmia_year && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-help">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">
                                  LMIA {job.lmia_year}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Labour Market Impact Assessment Year</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      {/* Enhanced Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.category && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0.5 cursor-help bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100 transition-colors"
                              >
                                {job.category}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Job Category</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {job.program && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0.5 cursor-help bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100 transition-colors"
                              >
                                {job.program}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Immigration Program</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {job.program}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {job.priority_occupation && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0.5 border-green-300 text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 cursor-help hover:from-green-100 hover:to-emerald-100 transition-all font-semibold shadow-sm"
                              >
                                Priority
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Priority Occupation</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {job.priority_occupation}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Save Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isLoadingSavedJobs}
                          onClick={async (e) => {
                            e.stopPropagation();

                            if (!session?.user?.id) {
                              // Fallback to local state if no session
                              onToggleSaved(index);
                              return;
                            }

                            if (!recordId) {
                              console.warn(
                                'No record ID found for job, using local state'
                              );
                              onToggleSaved(index);
                              return;
                            }

                            try {
                              const result = await handleSave(
                                recordId,
                                session
                              );
                              if (result) {
                                // Update database saved jobs state
                                setDbSavedJobs((prev) => {
                                  const newSet = new Set(prev);
                                  if (result.saved) {
                                    newSet.add(recordId);
                                  } else {
                                    newSet.delete(recordId);
                                  }
                                  return newSet;
                                });

                                // Also update local state for consistency
                                onToggleSaved(index);
                              }
                            } catch (error) {
                              console.error(
                                'Failed to save/unsave job:',
                                error
                              );
                              // Fallback to local state on error
                              onToggleSaved(index);
                            }
                          }}
                          className={`flex-shrink-0 p-1.5 h-7 w-7 rounded-lg transition-all duration-200 ${
                            isLoadingSavedJobs
                              ? 'opacity-50 cursor-not-allowed'
                              : isSaved
                              ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100 shadow-sm'
                              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                          }`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 transition-all duration-200 ${
                              isSaved ? 'fill-current scale-110' : ''
                            }`}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isSaved ? 'Remove from saved jobs' : 'Save this job'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
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
    </TooltipProvider>
  );
}
