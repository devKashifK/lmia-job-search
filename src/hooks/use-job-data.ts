import db from '@/db';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetch unique job titles from both lmia_records and trending_job tables
 */
export function useJobTitles() {
    return useQuery({
        queryKey: ['job-titles'],
        queryFn: async () => {
            try {
                // Fetch from both tables and combine
                const [lmiaResult, trendingResult] = await Promise.all([
                    db.from('lmia_records').select('JobTitle').not('JobTitle', 'is', null).limit(1000),
                    db.from('trending_job').select('job_title').not('job_title', 'is', null).limit(1000),
                ]);

                const lmiaTitles = lmiaResult.data?.map(r => r.JobTitle).filter(Boolean) || [];
                const trendingTitles = trendingResult.data?.map(r => r.job_title).filter(Boolean) || [];

                // Combine and get unique titles
                const allTitles = [...new Set([...lmiaTitles, ...trendingTitles])];

                // Sort alphabetically
                return allTitles.sort((a, b) => a.localeCompare(b));
            } catch (error) {
                console.error('Error fetching job titles:', error);
                return [];
            }
        },
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });
}

/**
 * Fetch unique categories/industries from both tables
 */
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                // Fetch from both tables
                const [lmiaResult, trendingResult] = await Promise.all([
                    db.from('lmia_records').select('Category').not('Category', 'is', null).limit(1000),
                    db.from('trending_job').select('category').not('category', 'is', null).limit(1000),
                ]);

                const lmiaCategories = lmiaResult.data?.map(r => r.Category).filter(Boolean) || [];
                const trendingCategories = trendingResult.data?.map(r => r.category).filter(Boolean) || [];

                // Combine and get unique categories
                const allCategories = [...new Set([...lmiaCategories, ...trendingCategories])];

                // Sort alphabetically
                return allCategories.sort((a, b) => a.localeCompare(b));
            } catch (error) {
                console.error('Error fetching categories:', error);
                return [];
            }
        },
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });
}

/**
 * Fetch provinces using existing RPC
 */
export function useProvinces() {
    return useQuery({
        queryKey: ['provinces'],
        queryFn: async () => {
            try {
                const { data, error } = await db.rpc('get_provinces');
                if (error) throw error;
                return (data as { province: string }[])?.map(p => p.province) || [];
            } catch (error) {
                console.error('Error fetching provinces:', error);
                return [];
            }
        },
        staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    });
}

/**
 * Fetch cities for a specific province using existing RPC
 */
export function useCitiesByProvince(province: string | null) {
    return useQuery({
        queryKey: ['cities', province],
        queryFn: async () => {
            if (!province) return [];

            try {
                const { data, error } = await db.rpc('get_cities_by_province', {
                    p_province: province,
                    p_search: '',
                });
                if (error) throw error;
                return (data as { city: string }[])?.map(c => c.city) || [];
            } catch (error) {
                console.error('Error fetching cities:', error);
                return [];
            }
        },
        enabled: !!province,
        staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    });
}

/**
 * Fetch cities for multiple provinces
 */
export function useCitiesForProvinces(provinces: string[]) {
    return useQuery({
        queryKey: ['cities-multi', provinces.sort().join(',')],
        queryFn: async () => {
            if (provinces.length === 0) return [];

            try {
                const allCitiesArrays = await Promise.all(
                    provinces.map(async (province) => {
                        const { data, error } = await db.rpc('get_cities_by_province', {
                            p_province: province,
                            p_search: '',
                        });
                        if (!error && data) {
                            return (data as { city: string }[]).map(c => ({ city: c.city, province }));
                        }
                        return [];
                    })
                );

                return allCitiesArrays.flat();
            } catch (error) {
                console.error('Error fetching cities for provinces:', error);
                return [];
            }
        },
        enabled: provinces.length > 0,
        staleTime: 30 * 60 * 1000,
    });
}

/**
 * Fetch unique NOC codes from both tables
 */
export function useNocCodes() {
    return useQuery({
        queryKey: ['noc-codes'],
        queryFn: async () => {
            try {
                // Fetch from trending_job (lmia_records might not have this field)
                const { data, error } = await db
                    .from('trending_job')
                    .select('noc_code')
                    .not('noc_code', 'is', null)
                    .limit(1000);

                if (error) throw error;

                const nocCodes = data?.map(r => r.noc_code).filter(Boolean) || [];
                const uniqueNocCodes = [...new Set(nocCodes)];

                return uniqueNocCodes.sort((a, b) => a.localeCompare(b));
            } catch (error) {
                console.error('Error fetching NOC codes:', error);
                return [];
            }
        },
        staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    });
}

/**
 * Fetch unique company tiers from trending_job table
 */
export function useCompanyTiers() {
    return useQuery({
        queryKey: ['company-tiers'],
        queryFn: async () => {
            try {
                const { data, error } = await db
                    .from('trending_job')
                    .select('tier')
                    .not('tier', 'is', null);

                if (error) throw error;

                const tiers = data?.map(r => r.tier).filter(Boolean) || [];
                const uniqueTiers = [...new Set(tiers)];

                // Sort tiers (A, B, C, etc.)
                return uniqueTiers.sort();
            } catch (error) {
                console.error('Error fetching company tiers:', error);
                return [];
            }
        },
        staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    });
}
