import { useQuery } from '@tanstack/react-query';
import { getJobTitles, getCategories, getNocCodes, getCompanyTiers } from '@/lib/api/jobs';
import { getProvinces, getCitiesByProvince } from '@/lib/api/locations';

/** Fetch unique job titles from both tables */
export function useJobTitles() {
    return useQuery({
        queryKey: ['job-titles'],
        queryFn: () => getJobTitles(),
        staleTime: 10 * 60 * 1000,
    });
}

/** Fetch unique categories/industries from both tables */
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories(),
        staleTime: 10 * 60 * 1000,
    });
}

/** Fetch provinces */
export function useProvinces() {
    return useQuery({
        queryKey: ['provinces'],
        queryFn: () => getProvinces(),
        staleTime: 30 * 60 * 1000,
    });
}

/** Fetch cities for a specific province */
export function useCitiesByProvince(province: string | null) {
    return useQuery({
        queryKey: ['cities', province],
        queryFn: () => getCitiesByProvince(province!),
        enabled: !!province,
        staleTime: 30 * 60 * 1000,
    });
}

/** Fetch cities for multiple provinces */
export function useCitiesForProvinces(provinces: string[]) {
    return useQuery({
        queryKey: ['cities-multi', provinces.sort().join(',')],
        queryFn: async () => {
            const all = await Promise.all(
                provinces.map(async (p) => {
                    const cities = await getCitiesByProvince(p);
                    return cities.map((city) => ({ city, province: p }));
                })
            );
            return all.flat();
        },
        enabled: provinces.length > 0,
        staleTime: 30 * 60 * 1000,
    });
}

/** Fetch unique NOC codes */
export function useNocCodes() {
    return useQuery({
        queryKey: ['noc-codes'],
        queryFn: () => getNocCodes(),
        staleTime: 30 * 60 * 1000,
    });
}

/** Fetch unique company tiers */
export function useCompanyTiers() {
    return useQuery({
        queryKey: ['company-tiers'],
        queryFn: () => getCompanyTiers(),
        staleTime: 30 * 60 * 1000,
    });
}
