import { useQuery } from '@tanstack/react-query';
import { getTrendingCompanies } from '@/lib/api/analytics';

export function useTrendingCompanies() {
    return useQuery({
        queryKey: ['trending-companies-noc'],
        queryFn: async () => {
            try {
                return await getTrendingCompanies();
            } catch (err) {
                console.error('Error fetching trending companies:', err);
                return [];
            }
        },
        staleTime: 1000 * 60 * 15,
    });
}
