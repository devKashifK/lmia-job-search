import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import { getSavedJobsWithData } from '@/lib/api/saved-jobs';

export function useSavedJobs() {
  const { session } = useSession();

  return useQuery({
    queryKey: ['saved-jobs', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      try {
        return await getSavedJobsWithData(session.user.id);
      } catch (error) {
        console.error('Error in useSavedJobs:', error);
        return [];
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 0,
  });
}
