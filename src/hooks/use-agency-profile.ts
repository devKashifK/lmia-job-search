import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import {
    getAgencyProfile,
    upsertAgencyProfile,
    DEFAULT_AGENCY_PROFILE,
    type AgencyProfile,
} from '@/lib/api/agency';

export function useAgencyProfile() {
    const { session } = useSession();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['agency-profile', session?.user?.id],
        queryFn: async (): Promise<AgencyProfile> => {
            if (!session?.user?.id) return DEFAULT_AGENCY_PROFILE;
            try {
                return await getAgencyProfile(session.user.id);
            } catch (error) {
                console.error('Error fetching agency profile:', error);
                return DEFAULT_AGENCY_PROFILE;
            }
        },
        enabled: !!session?.user?.id,
        staleTime: 5 * 60 * 1000,
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedProfile: Partial<AgencyProfile>) => {
            if (!session?.user?.id) throw new Error('User not authenticated');
            return upsertAgencyProfile(session.user.id, updatedProfile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agency-profile'] });
            toast({
                title: 'Agency profile saved',
                description: 'Your agency details have been updated successfully',
            });
        },
        onError: (error) => {
            console.error('Error updating agency profile:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save agency profile. Please try again.',
            });
        },
    });

    return {
        profile: profile || DEFAULT_AGENCY_PROFILE,
        isLoading,
        error,
        updateProfile: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
}
