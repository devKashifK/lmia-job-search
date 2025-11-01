'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import db from '@/db';
import JobCard from '@/components/ui/job-card';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface LMIAJob {
  RecordID: string;
  operating_name: string;
  job_title: string;
  city: string;
  territory: string;
  noc_code: string;
  program: string;
  lmia_year: string;
  priority_occupation: string;
  approved_positions: string;
  type: 'lmia';
  // Optional fields that might come from HotLeads
  occupation_title?: string;
  state?: string;
  job_status?: string;
  employer_type?: string;
  date_of_job_posting?: string;
  '2021_noc'?: string;
}

interface HotLeadsJob {
  RecordID: string;
  operating_name: string;
  job_title: string;
  occupation_title: string;
  city: string;
  state: string;
  '2021_noc': string;
  job_status: string;
  employer_type: string;
  date_of_job_posting: string;
  type: 'hotLeads';
  // Optional fields that might come from LMIA
  territory?: string;
  noc_code?: string;
  program?: string;
  lmia_year?: string;
  priority_occupation?: string;
  approved_positions?: string;
}

interface SavedJob {
  record_id: string;
  user_id: string;
  job_data: LMIAJob | HotLeadsJob;
}

export default function SavedJobs() {
  const { session } = useSession();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSavedJobs();
    }
  }, [session?.user?.id]);

  const fetchSavedJobs = async () => {
    try {
      // First get all saved job IDs
      const { data: savedJobsData, error: savedJobsError } = await db
        .from('saved_jobs')
        .select('*')
        .eq('user_id', session.user.id);

      if (savedJobsError) throw savedJobsError;

      // For each saved job, fetch the actual job data
      const jobsWithData = await Promise.all(
        savedJobsData.map(async (savedJob) => {
          // Try to fetch from LMIA table first
          const { data: lmiaData, error: lmiaError } = await db
            .from('lmia_records')
            .select('*')
            .eq('RecordID', savedJob.record_id)
            .single();

          if (!lmiaError && lmiaData) {
            return {
              ...savedJob,
              job_data: { ...lmiaData, type: 'lmia' } as LMIAJob,
            };
          }

          // If not in LMIA, try hot leads table
          const { data: hotLeadsData, error: hotLeadsError } = await db
            .from('trending_job')
            .select('*')
            .eq('id', savedJob.record_id)
            .single();

          if (!hotLeadsError && hotLeadsData) {
            return {
              ...savedJob,
              job_data: { ...hotLeadsData, type: 'hotLeads' } as HotLeadsJob,
            };
          }

          // If job not found in either table, return null
          return null;
        })
      );

      // Filter out any null values and update state
      setSavedJobs(jobsWithData.filter(Boolean));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to fetch saved jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (recordId: string) => {
    try {
      const { error } = await db
        .from('saved_jobs')
        .delete()
        .eq('record_id', recordId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Update local state
      setSavedJobs((prev) => prev.filter((job) => job.record_id !== recordId));
      toast.success('Job removed from saved jobs');
    } catch (error) {
      console.error('Error removing job:', error);
      toast.error('Failed to remove job');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!savedJobs.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <p className="text-xl font-semibold">No saved jobs found</p>
        <p className="mt-2">Jobs you save will appear here</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedJobs.map((savedJob) => {
          const job = savedJob.job_data;
          return (
            <JobCard
              key={savedJob.record_id}
              logoIcon={Building2}
              saved={true}
              onToggleSaved={() => handleToggleSave(savedJob.record_id)}
              employerName={job.employer}
              jobTitle={job.job_title || job.occupation_title}
              city={job.city}
              state={job.state}
              category={job.category}
              territory={job.territory}
              noc={job.noc_code || job['2021_noc']}
              jobStatus={job.job_status}
              employerType={job.employer_type}
              datePosted={job.date_of_job_posting}
              recordID={savedJob.record_id}
              onKnowMore={() => {
                /* Implement know more functionality */
              }}
              type={job.category}
              program={job.type === 'lmia' ? job.program : undefined}
              lmiaYear={job.type === 'lmia' ? job.lmia_year : undefined}
              priorityOccupation={
                job.type === 'lmia' ? job.priority_occupation : undefined
              }
              approvedPositions={
                job.type === 'lmia' ? job.approved_positions : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
