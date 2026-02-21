import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import {
    generateRecommendations,
    type JobRecommendation,
} from '@/lib/api/recommendations';

/**
 * Hook to fetch and manage job recommendations
 */
export function useJobRecommendations() {
    const { session } = useSession();
    const queryClient = useQueryClient();

    const { data: recommendations, isLoading, error } = useQuery({
        queryKey: ['job-recommendations', session?.user?.id],
        queryFn: async (): Promise<JobRecommendation[]> => {
            if (!session?.user?.id) return [];
            try {
                // Generate recommendations directly—react-query handles caching on the client
                const results = await generateRecommendations(session.user.id);
                return results;
            } catch (error) {
                console.error('Error in useJobRecommendations:', error);
                return [];
            }
        },
        enabled: !!session?.user?.id,
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
    });

    const regenerateMutation = useMutation({
        mutationFn: async () => {
            if (!session?.user?.id) throw new Error('User not authenticated');
            return await generateRecommendations(session.user.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-recommendations'] });
        },
    });

    return {
        recommendations: recommendations || [],
        isLoading,
        error,
        regenerate: regenerateMutation.mutate,
        isRegenerating: regenerateMutation.isPending,
    };
}
