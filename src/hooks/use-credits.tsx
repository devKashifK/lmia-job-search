import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from './use-session';
import { getUserCredits, incrementUsedCredit, isUnlimitedPlan } from '@/lib/api/credits';
import { insertSearch } from '@/lib/api/searches';

// ... (SearchRecord interface remains same)

export const useCreditData = () => {
  const { session } = useSession();
  const { data: creditData, error: creditError, isLoading } = useQuery({
    queryKey: ['credits', session?.user?.id],
    queryFn: async () => {
      if (session?.trial) return null;
      // Removed artificial delay
      return getUserCredits(session?.user?.id!);
    },
    enabled: !!session?.user?.id
  });

  const isUnlimited = isUnlimitedPlan(creditData);
  const creditRemaining = isUnlimited ? Infinity : (creditData?.total_credit ?? 0) - (creditData?.used_credit ?? 0);

  return { creditData, creditError, creditRemaining, isUnlimited, isLoading };
};

export const useUpdateCredits = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const updateCreditsAndSearch = async (keyword: string, filters?: Record<string, any>) => {
    if (session?.trial) return null;
    if (!session?.user?.id) throw new Error('User not authenticated');

    try {
      // Searches are now free - removed incrementUsedCredit call

      const { search_id: currentSearchId } = await insertSearch({
        id: session.user.id,
        keyword,
        filters,
        save: false,
      });

      if (currentSearchId) {
        sessionStorage.setItem('currentSearchId', String(currentSearchId));
      }

      // No need to invalidate credits query since they didn't change
      // But we might want to refresh search history if needed
      
      return true;
    } catch (error) {
      console.error('Error recording search:', error);
      throw error;
    }
  };

  return { updateCreditsAndSearch };
};
