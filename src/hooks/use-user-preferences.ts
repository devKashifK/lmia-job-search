import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import {
    getUserPreferences,
    upsertUserPreferences,
    DEFAULT_PREFERENCES,
    type UserPreferences,
} from '@/lib/api/users';

export type { UserPreferences };

export function useUserPreferences() {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: preferences, isLoading, error } = useQuery({
        queryKey: ['user-preferences', session?.user?.id],
        queryFn: async (): Promise<UserPreferences> => {
            if (!session?.user?.id) return DEFAULT_PREFERENCES;
            try {
                return await getUserPreferences(session.user.id);
            } catch (error) {
                console.error('Error fetching user preferences:', error);
                return DEFAULT_PREFERENCES;
            }
        },
        enabled: !!session?.user?.id,
        staleTime: 5 * 60 * 1000,
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedPreferences: Partial<UserPreferences>) => {
            if (!session?.user?.id) throw new Error('User not authenticated');
            return upsertUserPreferences(session.user.id, updatedPreferences);
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
