
import db from '@/db';

export interface Province {
    province: string;
}

export interface City {
    city: string;
}

const PROVINCE_NORM: Record<string, string> = {
    'AB': 'Alberta', 'Alberta': 'Alberta',
    'BC': 'British Columbia', 'British Columbia': 'British Columbia',
    'MB': 'Manitoba', 'Manitoba': 'Manitoba',
    'NB': 'New Brunswick', 'New Brunswick': 'New Brunswick',
    'NL': 'Newfoundland and Labrador',
    'Newfoundland': 'Newfoundland and Labrador',
    'Newfoundland and Labrador': 'Newfoundland and Labrador',
    'Newfoundland And Labrador': 'Newfoundland and Labrador',
    'NS': 'Nova Scotia', 'Nova Scotia': 'Nova Scotia',
    'NT': 'Northwest Territories', 'Northwest Territories': 'Northwest Territories',
    'NU': 'Nunavut', 'Nunavut': 'Nunavut',
    'ON': 'Ontario', 'Ontario': 'Ontario',
    'PE': 'Prince Edward Island', 'PEI': 'Prince Edward Island',
    'Prince Edward Island': 'Prince Edward Island',
    'QC': 'Quebec', 'Quebec': 'Quebec', 'Québec': 'Quebec',
    'SK': 'Saskatchewan', 'Saskatchewan': 'Saskatchewan',
    'YT': 'Yukon', 'Yukon': 'Yukon',
};

export async function getProvinces(): Promise<string[]> {
    const { data, error } = await (db as any).rpc('get_provinces');

    if (error) {
        console.error('Error fetching provinces:', error);
        return [];
    }

    const provinces = ((data as Province[]) ?? []).map(p => {
        const name = p.province.trim();
        return PROVINCE_NORM[name] || name;
    });

    // Deduplicate normalized names
    return Array.from(new Set(provinces)).sort();
}

export async function getCitiesByProvince(province: string, search: string = ''): Promise<string[]> {
    const { data, error } = await (db as any).rpc('get_cities_by_province', {
        p_province: province,
        p_search: search,
    });

    if (error) {
        console.error('Error fetching cities:', error);
        return [];
    }

    return ((data as City[]) ?? []).map(c => c.city);
}

export async function getCitiesForProvinces(provincesList: string[]): Promise<{ city: string; province: string }[]> {
    if (provincesList.length === 0) {
        return [];
    }

    try {
        // Fetch stats for each selected province in parallel
        const allCitiesArrays = await Promise.all(
            provincesList.map(async (province) => {
                // Fetch from matching sources in parallel to get comprehensive list
                const [rpcRes, trendingRes, lmiaRes] = await Promise.all([
                    // 1. RPC
                    (db as any).rpc('get_cities_by_province', {
                        p_province: province,
                        p_search: '',
                    }),
                    // 2. Trending Job Table (Direct with higher limit)
                    db.from('trending_job')
                        .select('city')
                        .eq('state', province)
                        .limit(5000), // Fetch more to uncover cities missing from RPC/Top lists
                    // 3. LMIA Records Table
                    db.from('lmia')
                        .select('city')
                        .eq('territory', province)
                        .limit(5000)
                ]);

                let citiesForProv: { city: string; province: string }[] = [];

                // Collect from RPC
                if (!rpcRes.error && rpcRes.data && (rpcRes.data as any[]).length > 0) {
                    const rpcCities = (rpcRes.data as { city: string }[]).map(c => ({ ...c, province }));
                    citiesForProv = [...citiesForProv, ...rpcCities];
                }

                // Collect from Trending
                if (!trendingRes.error && trendingRes.data && (trendingRes.data as any[]).length > 0) {
                    const tCities = (trendingRes.data as any[])
                        .map(d => d.city)
                        .filter(Boolean)
                        .map(city => ({ city, province }));
                    citiesForProv = [...citiesForProv, ...tCities];
                }

                // Collect from LMIA
                if (!lmiaRes.error && lmiaRes.data && (lmiaRes.data as any[]).length > 0) {
                    const lCities = (lmiaRes.data as any[])
                        .map(d => d.city)
                        .filter(Boolean)
                        .map(city => ({ city, province }));
                    citiesForProv = [...citiesForProv, ...lCities];
                }

                // Deduplicate within this province
                const uniqueCities = new Set<string>();
                const distinct: { city: string; province: string }[] = [];

                for (const item of citiesForProv) {
                    const normalized = item.city.trim();
                    const lower = normalized.toLowerCase();
                    if (!uniqueCities.has(lower)) {
                        uniqueCities.add(lower);
                        distinct.push({ city: normalized, province });
                    }
                }

                return distinct.sort((a, b) => a.city.localeCompare(b.city));
            })
        );

        // Flatten and deduplicate
        return allCitiesArrays.flat();
    } catch (err) {
        console.error('Error fetching cities:', err);
        return [];
    }
}
