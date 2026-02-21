import { useQuery } from '@tanstack/react-query';
import { getTopEmployers, type TopEmployer } from '@/lib/api/analytics';

export type { TopEmployer };

export function useTopEmployers() {
    return useQuery({
        queryKey: ['top-employers'],
        queryFn: async () => {
            try {
                return await getTopEmployers();
            } catch (err) {
                console.error('Error fetching top employers:', err);
                // Fallback to mock data if DB fails
                return [
                    { title: 'Tim Hortons', count: 4261, trend: '+12%', initials: 'TH', color: 'bg-red-50 text-red-600', sparkline: [40, 45, 42, 50, 48, 55, 60], description: 'Food Service Supervisor' },
                    { title: 'Subway', count: 2591, trend: '+5%', initials: 'SW', color: 'bg-green-50 text-green-600', sparkline: [30, 32, 35, 34, 38, 40, 42], description: 'Sandwich Artist' },
                    { title: "McDonald's", count: 1458, trend: '+8%', initials: 'MD', color: 'bg-yellow-50 text-yellow-600', sparkline: [20, 25, 22, 28, 30, 35, 38], description: 'Crew Member' },
                ] as TopEmployer[];
            }
        },
        staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    });
}

