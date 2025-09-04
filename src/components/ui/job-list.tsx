import React from 'react';
import { Building2, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';

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

interface JobListProps {
  jobs: Job[];
  selectedJobId?: number;
  onJobSelect: (job: Job) => void;
  className?: string;
}

export function JobList({
  jobs,
  selectedJobId,
  onJobSelect,
  className = '',
}: JobListProps) {
  return (
    <div
      className={`bg-white border-r border-gray-200 overflow-y-auto ${className}`}
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Job List</h3>
        <p className="text-sm text-gray-500">{jobs.length} jobs found</p>
      </div>

      <div className="space-y-2 p-2">
        {jobs.map((job, index) => {
          const isSelected = selectedJobId === (job.id || index);
          const jobTitle = job.job_title || job.occupation_title || 'N/A';
          const nocCode = job.noc_code || job['2021_noc'] || 'N/A';

          return (
            <div
              key={job.id || index}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onJobSelect(job)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {jobTitle}
                  </h4>
                  <p className="text-sm text-gray-600 truncate">
                    {job.employer}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {job.city}, {job.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span>NOC: {nocCode}</span>
                    </div>
                  </div>

                  {job.date_of_job_posting && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(job.date_of_job_posting).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {job.category && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {job.category}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
