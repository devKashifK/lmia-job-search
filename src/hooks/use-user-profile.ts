import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import {
    getUserProfile,
    upsertUserProfile,
    DEFAULT_PROFILE,
    type UserProfile,
} from '@/lib/api/users';

export type { UserProfile };

export function useUserProfile() {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['user-profile', session?.user?.id],
        queryFn: async (): Promise<UserProfile> => {
            if (!session?.user?.id) return DEFAULT_PROFILE;
            try {
                return await getUserProfile(session.user.id);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                return DEFAULT_PROFILE;
            }
        },
        enabled: !!session?.user?.id,
        staleTime: 5 * 60 * 1000,
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedProfile: Partial<UserProfile>) => {
            if (!session?.user?.id) throw new Error('User not authenticated');
            return upsertUserProfile(session.user.id, updatedProfile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            toast({
                title: 'Profile saved',
                description: 'Your professional details have been updated successfully',
            });
        },
        onError: (error) => {
            console.error('Error updating profile:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save profile. Please try again.',
            });
        },
    });

    return {
        profile: profile || DEFAULT_PROFILE,
        isLoading,
        error,
        updateProfile: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
}
