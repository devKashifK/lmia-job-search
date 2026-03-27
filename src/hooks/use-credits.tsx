import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from './use-session';
import { getUserCredits, incrementUsedCredit, isUnlimitedPlan } from '@/lib/api/credits';
import { insertSearch } from '@/lib/api/searches';

// ... (SearchRecord interface remains same)

export const useCreditData = () => {
  const { session } = useSession();
  const { data: creditData, error: creditError, isLoading } = useQuery({
    queryKey: ['credits', session.trial, session?.user?.id],
    queryFn: async () => {
      if (session?.trial) return null;
      // Removed artificial delay
      return getUserCredits(session?.user?.id!);
    },
    enabled: !!session?.user?.id && !session.trial,
  });

  const isUnlimited = isUnlimitedPlan(creditData);
  const creditRemaining = isUnlimited ? Infinity : (creditData?.total_credit ?? 0) - (creditData?.used_credit ?? 0);

  return { creditData, creditError, creditRemaining, isUnlimited, isLoading };
};

export const useUpdateCredits = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const updateCreditsAndSearch = async (keyword: string) => {
    if (session?.trial) return null;
    if (!session?.user?.id) throw new Error('User not authenticated');

    try {
      const updatedCredits = await incrementUsedCredit(session.user.id);

      const { search_id: currentSearchId } = await insertSearch({
        id: session.user.id,
        keyword,
        save: false,
      });

      if (currentSearchId) {
        sessionStorage.setItem('currentSearchId', String(currentSearchId));
      }

      await queryClient.invalidateQueries({
        queryKey: ['credits', session.trial, session.user.id],
      });

      return updatedCredits;
    } catch (error) {
      console.error('Error updating credits:', error);
      throw error;
    }
  };

  return { updateCreditsAndSearch };
};
