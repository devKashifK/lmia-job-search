import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import db from '@/db';

export interface ActivityItem {
  id: string;
  type: 'saved_job' | 'search';
  action: string;
  details: string;
  timestamp: string;
  icon: 'bookmark' | 'search';
  color: string;
  bgColor: string;
}

export function useRecentActivity(limit: number = 10) {
  const { session } = useSession();

  return useQuery({
    queryKey: ['recent-activity', session?.user?.id, limit],
    queryFn: async () => {
      console.log('🎯 Fetching recent activity for user:', session?.user?.id, 'limit:', limit);
      
      if (!session?.user?.id) {
        return [];
      }

      try {
        const activities: ActivityItem[] = [];

        // Fetch recent saved jobs
        // Note: If created_at doesn't exist in saved_jobs table, only record_id will be fetched
        const { data: savedJobsData, error: savedJobsError } = await db
          .from('saved_jobs')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!savedJobsError && savedJobsData) {
          // For each saved job, fetch job details
          const jobDetailsPromises = savedJobsData.map(async (savedJob) => {
            // Try LMIA first
            const { data: lmiaData } = await db
              .from('lmia_records')
              .select('job_title, operating_name')
              .eq('RecordID', savedJob.record_id)
              .single();

            if (lmiaData) {
              return {
                ...savedJob,
                job_title: lmiaData.job_title,
                employer: lmiaData.operating_name,
              };
            }

            // Try Trending Job (previously Hot Leads)
            const { data: trendingJobData } = await db
              .from('trending_job')
              .select('occupation_title, employer')
              .eq('id', savedJob.record_id)
              .single();

            if (trendingJobData) {
              return {
                ...savedJob,
                job_title: trendingJobData.occupation_title,
                employer: trendingJobData.employer,
              };
            }

            return null;
          });

          const jobDetails = await Promise.all(jobDetailsPromises);

          jobDetails.forEach((job) => {
            if (job && job.job_title && job.employer) {
              activities.push({
                id: job.record_id,
                type: 'saved_job',
                action: 'Saved a job',
                details: `${job.job_title} at ${job.employer}`,
                timestamp: job.created_at || new Date().toISOString(), // Fallback to current time if no timestamp
                icon: 'bookmark',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
              });
            }
          });
        } else if (savedJobsError) {
          console.error('Error fetching saved jobs:', savedJobsError);
        }

        // Fetch recent searches
        const { data: searchesData, error: searchesError } = await db
          .from('searches')
          .select('id, keyword, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!searchesError && searchesData) {
          searchesData.forEach((search) => {
            activities.push({
              id: search.id,
              type: 'search',
              action: 'Searched',
              details: search.keyword,
              timestamp: search.created_at,
              icon: 'search',
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
            });
          });
        }

        // Sort all activities by timestamp (most recent first)
        activities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Return only the requested number of items
        const result = activities.slice(0, limit);
        console.log('✅ Recent activity fetched:', result.length, 'items');
        return result;
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 0, // Always refetch when invalidated for real-time updates
  });
}
