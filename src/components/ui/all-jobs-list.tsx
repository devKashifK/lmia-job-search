import React from 'react';
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
import { Card, CardContent } from './card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

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
  const savedCount = jobs.filter((_, index) => savedJobs.has(index)).length;

  return (
    <TooltipProvider>
      <div className={`bg-white overflow-y-auto ${className}`}>
        {/* Enhanced Compact Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Job Listings
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {totalCount !== undefined ? (
                            <>
                              {totalCount.toLocaleString()} total
                              {jobs.length < totalCount && (
                                <span className="text-gray-400"> (showing {jobs.length})</span>
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
                            <p>Total jobs matching your criteria: {totalCount.toLocaleString()}</p>
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
                    </Tooltip>
                    {savedCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-3 h-3 fill-current" />
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

            {selectedJobId !== undefined && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full border border-brand-200">
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Selected</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Job selected for detailed view</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Enhanced Compact Job List */}
        <div className="divide-y divide-gray-100">
          {jobs.map((job, index) => {
            const isSelected = selectedJobId === (job.id || index);
            const isSaved = savedJobs.has(index);
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
                className={`group cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:shadow-sm ${
                  isSelected
                    ? 'bg-brand-50 border-l-4 border-l-brand-500 shadow-sm'
                    : ''
                }`}
                onClick={() => onJobSelect(job)}
              >
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Job Title and Company */}
                      <div className="flex items-start gap-3 mb-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 ${
                                isSelected
                                  ? 'bg-brand-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                              }`}
                            >
                              <Building2 className="w-5 h-5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Company: {job.employer}</p>
                            {job.employer_type && (
                              <p>Type: {job.employer_type}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h4 className="font-medium text-gray-900 truncate cursor-help">
                                  {jobTitle}
                                </h4>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{jobTitle}</p>
                              </TooltipContent>
                            </Tooltip>
                            {isRecent && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 border-green-200"
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm text-gray-600 truncate cursor-help">
                                {job.employer}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{job.employer}</p>
                              {job.employer_type && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Employer Type: {job.employer_type}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Enhanced Job Details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {job.city}, {job.state}
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
                              <span>NOC: {nocCode}</span>
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
                                <span>
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
                              <span className="cursor-help">
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
                                <span>LMIA {job.lmia_year}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Labour Market Impact Assessment Year</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      {/* Enhanced Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.category && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0.5 cursor-help"
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
                                className="text-xs px-2 py-0.5 cursor-help"
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
                                className="text-xs px-2 py-0.5 border-green-200 text-green-700 bg-green-50 cursor-help"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaved(index);
                          }}
                          className={`flex-shrink-0 p-1 h-8 w-8 transition-all duration-150 ${
                            isSaved
                              ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 transition-all duration-150 ${
                              isSaved ? 'fill-current' : ''
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
          {jobs.length === 0 && (
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
