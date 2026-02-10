import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import {
    generateRecommendations,
    getCachedRecommendations,
    refreshRecommendationsIfNeeded,
    JobRecommendation,
} from '@/utils/recommendation-engine';
import db from '@/db';

/**
 * Hook to fetch and manage job recommendations
 */
export function useJobRecommendations() {
    const { session } = useSession();
    const queryClient = useQueryClient();

    const { data: recommendations, isLoading, error } = useQuery({
        queryKey: ['job-recommendations', session?.user?.id],
        queryFn: async (): Promise<JobRecommendation[]> => {
            if (!session?.user?.id) {
                return [];
            }

            try {
                // Check if recommendations need refresh
                await refreshRecommendationsIfNeeded(session.user.id);

                // Get cached recommendations
                const cached = await getCachedRecommendations(session.user.id);

                // If no cached recommendations, generate new ones
                if (!cached || cached.length === 0) {
                    return await generateRecommendations(session.user.id);
                }

                // Fetch full job details for cached recommendations
                const withDetails = await Promise.all(
                    cached.map(async (rec) => {
                        try {
                            if (rec.job_source === 'lmia') {
                                const { data } = await db
                                    .from('lmia_records')
                                    .select('*')
                                    .eq('RecordID', rec.job_id)
                                    .single();
                                return { ...rec, job_data: data };
                            } else {
                                const { data } = await db
                                    .from('trending_job')
                                    .select('*')
                                    .eq('id', rec.job_id)
                                    .single();
                                return { ...rec, job_data: data };
                            }
                        } catch (err) {
                            console.error('Error fetching job details:', err);
                            return rec;
                        }
                    })
                );

                return withDetails.filter((rec) => rec.job_data); // Filter out jobs not found
            } catch (error) {
                console.error('Error in useJobRecommendations:', error);
                return [];
            }
        },
        enabled: !!session?.user?.id,
        staleTime: 30 * 60 * 1000, // Cache for 30 minutes
        gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    });

    const regenerateMutation = useMutation({
        mutationFn: async () => {
            if (!session?.user?.id) {
                throw new Error('User not authenticated');
            }
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
