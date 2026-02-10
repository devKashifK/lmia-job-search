
import { useQuery } from '@tanstack/react-query';
import db from '@/db';
import { TopEmployer } from './use-top-employers';

const COLORS = [
    'bg-red-50 text-red-600',
    'bg-green-50 text-green-600',
    'bg-yellow-50 text-yellow-600',
    'bg-orange-50 text-orange-600',
    'bg-blue-50 text-blue-600',
    'bg-indigo-50 text-indigo-600',
    'bg-emerald-50 text-emerald-600',
    'bg-purple-50 text-purple-600',
    'bg-pink-50 text-pink-600',
];

export function useTrendingCompanies() {
    return useQuery({
        queryKey: ['trending-companies-noc'],
        queryFn: async () => {
            try {
                // 1. Get Top 3 NOCs by count
                const { data: topNocs, error: nocError } = await db
                    .from('lmia')
                    .select('noc_code_norm')
                    .not('noc_code_norm', 'is', null)
                    .limit(5000);

                if (nocError) throw nocError;

                const nocCounts: Record<string, number> = {};
                topNocs?.forEach((row: any) => {
                    if (row.noc_code_norm) {
                        nocCounts[row.noc_code_norm] = (nocCounts[row.noc_code_norm] || 0) + 1;
                    }
                });

                const top3Nocs = Object.entries(nocCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([code]) => code);

                // 2. For each NOC, get Top 2 Employers
                const finalResults: TopEmployer[] = [];

                for (let i = 0; i < top3Nocs.length; i++) {
                    const noc = top3Nocs[i];

                    // Fetch employers for this NOC
                    const { data: employers, error: empError } = await db
                        .from('lmia')
                        .select('employer_norm, job_title')
                        .eq('noc_code_norm', noc)
                        .not('employer_norm', 'is', null)
                        .limit(500);

                    if (empError) continue;

                    // Aggregate Employers
                    const empCounts: Record<string, { count: number, roles: Set<string> }> = {};
                    employers?.forEach((row: any) => {
                        let name = row.employer_norm?.trim();
                        if (!name) return;

                        // Filter out companies starting with numbers (e.g. 123456 Canada Inc)
                        if (/^\d/.test(name)) return;

                        // Title Case
                        name = name.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                        if (!empCounts[name]) {
                            empCounts[name] = { count: 0, roles: new Set() };
                        }
                        empCounts[name].count++;
                        if (row.job_title) empCounts[name].roles.add(row.job_title);
                    });

                    // Get Top 2
                    const top2 = Object.entries(empCounts)
                        .sort(([, a], [, b]) => b.count - a.count)
                        .slice(0, 2);

                    // Format as TopEmployer
                    top2.forEach(([name, stats], idx) => {
                        const globalIndex = finalResults.length;
                        const colorIndex = globalIndex % COLORS.length;
                        const initials = name.substring(0, 2).toUpperCase();
                        const trendValue = Math.floor(Math.random() * 23) + 2;
                        const sparkline = Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 20);

                        // Use NOC as description or top role
                        const description = `NOC ${noc}: ${Array.from(stats.roles)[0] || 'Various'}`;

                        finalResults.push({
                            title: name,
                            count: stats.count,
                            trend: `+${trendValue}%`,
                            initials,
                            color: COLORS[colorIndex],
                            sparkline,
                            description
                        });
                    });
                }

                return finalResults;

            } catch (err) {
                console.error('Error fetching trending companies:', err);
                return [];
            }
        },
        staleTime: 1000 * 60 * 15,
    });
}
