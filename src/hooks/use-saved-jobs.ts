import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import db from '@/db';

export function useSavedJobs() {
  const { session } = useSession();

  return useQuery({
    queryKey: ['saved-jobs', session?.user?.id],
    queryFn: async () => {
      console.log('📊 Fetching saved jobs for user:', session?.user?.id);

      if (!session?.user?.id) {
        return [];
      }

      try {
        // Get all saved job IDs for the user
        const { data: savedJobsData, error: savedJobsError } = await db
          .from('saved_jobs')
          .select('record_id')
          .eq('user_id', session.user.id);

        if (savedJobsError) {
          console.error('Error fetching saved jobs:', savedJobsError);
          throw savedJobsError;
        }

        if (!savedJobsData || savedJobsData.length === 0) {
          return [];
        }

        // For each saved job, fetch the actual job data (same as saved jobs page)
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
                job_data: { ...lmiaData, type: 'lmia' },
              };
            }

            // If not in LMIA, try trending_job table
            const { data: trendingJobData, error: trendingJobError } = await db
              .from('trending_job')
              .select('*')
              .eq('id', savedJob.record_id)
              .single();

            if (!trendingJobError && trendingJobData) {
              return {
                ...savedJob,
                job_data: { ...trendingJobData, type: 'hotLeads' },
              };
            }

            // If job not found in either table, return null
            return null;
          })
        );

        // Filter out any null values and extract job_data
        const validJobs = jobsWithData
          .filter((job): job is NonNullable<typeof job> => job !== null)
          .map((job) => job.job_data);

        console.log('✅ Saved jobs fetched:', validJobs.length, 'jobs');
        return validJobs;
      } catch (error) {
        console.error('Error in useSavedJobs:', error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 0, // Always refetch when invalidated for real-time updates
  });
}
