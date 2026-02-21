import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import { getSavedJobsWithData } from '@/lib/api/saved-jobs';
import { getSearchHistory } from '@/lib/api/searches';

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
    queryKey: ['recent-activity', session, session?.user?.id, limit],
    queryFn: async () => {
      if (!session?.user?.id) {
        return [];
      }

      try {
        const activities: ActivityItem[] = [];

        // Fetch recent saved jobs
        const savedJobsData = await getSavedJobsWithData(session.user.id);

        savedJobsData.forEach((job) => {
          const title = job.job_title || job.JobTitle || job.occupation_title;
          const employer = job.operating_name || job.employer;

          if (title && employer) {
            activities.push({
              id: job.RecordID || job.id,
              type: 'saved_job',
              action: 'Saved a job',
              details: `${title} at ${employer}`,
              timestamp: job.created_at || new Date().toISOString(), // Fallback to current time if no timestamp
              icon: 'bookmark',
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
            });
          }
        });

        // Fetch recent searches
        const searchesData = await getSearchHistory(session.user.id);

        searchesData.forEach((search: any) => {
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

        // Sort all activities by timestamp (most recent first)
        activities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Return only the requested number of items
        const result = activities.slice(0, limit);
        return result;
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 60 * 1000, // Cache for 1 minute
  });
}

