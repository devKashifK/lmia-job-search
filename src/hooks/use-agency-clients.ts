import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { 
    getAgencyClients, 
    getAgencyClient, 
    deleteAgencyClient,
    updateAgencyClient,
    getClientStrategy,
    updateClientStrategy,
    type AgencyClient,
    type ClientStrategy
} from '@/lib/api/agency';

export function useAgencyClients() {
    const { user } = useSession();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: clients = [], isLoading, error } = useQuery({
        queryKey: ['agency-clients', user?.id],
        queryFn: () => getAgencyClients(user!.id),
        enabled: !!user?.id,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteAgencyClient(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agency-clients'] });
            toast({
                title: 'Client deleted',
                description: 'The client record has been removed successfully',
            });
        },
        onError: (err: any) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to delete client',
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<AgencyClient> }) => updateAgencyClient(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agency-clients'] });
            queryClient.invalidateQueries({ queryKey: ['agency-client'] });
            toast({
                title: 'Changes saved',
                description: 'Client information has been updated successfully',
            });
        },
        onError: (err: any) => {
            toast({
                variant: 'destructive',
                title: 'Error updating client',
                description: err.message || 'Failed to save changes',
            });
        }
    });

    return {
        clients,
        isLoading,
        error,
        deleteClient: deleteMutation.mutateAsync,
        updateClient: updateMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
        refresh: () => queryClient.invalidateQueries({ queryKey: ['agency-clients'] })
    };
}

export function useAgencyClientDetail(id: string) {
    const { data: client, isLoading, error } = useQuery({
        queryKey: ['agency-client', id],
        queryFn: () => getAgencyClient(id),
        enabled: !!id,
    });

    return {
        client,
        isLoading,
        error
    };
}

export function useAgencyStrategy(urn: string) {
    const { user } = useSession();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: strategy, isLoading } = useQuery({
        queryKey: ['agency-strategy', urn],
        queryFn: () => getClientStrategy(urn),
        enabled: !!urn,
    });

    const updateStrategyMutation = useMutation({
        mutationFn: (updates: Partial<ClientStrategy>) => 
            updateClientStrategy(urn, user!.id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agency-strategy', urn] });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Strategy Error",
                description: error.message || "Failed to persist strategy."
            });
        }
    });

    return {
        strategy,
        isLoading,
        updateStrategy: updateStrategyMutation.mutateAsync,
        isUpdating: updateStrategyMutation.isPending
    };
}
