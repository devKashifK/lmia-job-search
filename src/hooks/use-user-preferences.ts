import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';

export interface UserPreferences {
    id?: string;
    user_id?: string;
    preferred_job_titles: string[];
    preferred_provinces: string[];
    preferred_cities: string[];
    preferred_industries: string[];
    preferred_noc_codes: string[];
    preferred_teer_categories: string[]; // TEER 0-5
    preferred_company_tiers: string[];
    created_at?: string;
    updated_at?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    preferred_job_titles: [],
    preferred_provinces: [],
    preferred_cities: [],
    preferred_industries: [],
    preferred_noc_codes: [],
    preferred_teer_categories: [], // Default empty
    preferred_company_tiers: [],
};

export function useUserPreferences() {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: preferences, isLoading, error } = useQuery({
        queryKey: ['user-preferences', session?.user?.id],
        queryFn: async (): Promise<UserPreferences> => {
            if (!session?.user?.id) {
                return DEFAULT_PREFERENCES;
            }

            try {
                const { data, error } = await db
                    .from('user_preferences')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (error) {
                    // If no record exists yet (404), return defaults
                    if (error.code === 'PGRST116') {
                        return DEFAULT_PREFERENCES;
                    }
                    throw error;
                }

                return data || DEFAULT_PREFERENCES;
            } catch (error) {
                console.error('Error fetching user preferences:', error);
                return DEFAULT_PREFERENCES;
            }
        },
        enabled: !!session?.user?.id,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedPreferences: Partial<UserPreferences>) => {
            if (!session?.user?.id) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await db
                .from('user_preferences')
                .upsert({
                    user_id: session.user.id,
                    ...updatedPreferences,
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
            toast({
                title: 'Preferences saved',
                description: 'Your job preferences have been updated successfully',
            });
        },
        onError: (error) => {
            console.error('Error updating preferences:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save preferences. Please try again.',
            });
        },
    });

    return {
        preferences: preferences || DEFAULT_PREFERENCES,
        isLoading,
        error,
        updatePreferences: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
}
