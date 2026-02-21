
import db from '@/db';

export interface Province {
    province: string;
}

export interface City {
    city: string;
}

export async function getProvinces(): Promise<string[]> {
    const { data, error } = await db.rpc('get_provinces');

    if (error) {
        console.error('Error fetching provinces:', error);
        return [];
    }

    return (data as Province[])?.map(p => p.province) || [];
}

export async function getCitiesByProvince(province: string, search: string = ''): Promise<string[]> {
    const { data, error } = await db.rpc('get_cities_by_province', {
        p_province: province,
        p_search: search,
    });

    if (error) {
        console.error('Error fetching cities:', error);
        return [];
    }

    return (data as City[])?.map(c => c.city) || [];
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
                    db.rpc('get_cities_by_province', {
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
                if (!trendingRes.error && trendingRes.data && trendingRes.data.length > 0) {
                    const tCities = trendingRes.data
                        .map(d => d.city)
                        .filter(Boolean)
                        .map(city => ({ city, province }));
                    citiesForProv = [...citiesForProv, ...tCities];
                }

                // Collect from LMIA
                if (!lmiaRes.error && lmiaRes.data && lmiaRes.data.length > 0) {
                    const lCities = lmiaRes.data
                        .map(d => d.city)
                        .filter(Boolean)
                        .map(city => ({ city, province }));
                    citiesForProv = [...citiesForProv, ...lCities];
                }

                // Deduplicate within this province
                const uniqueCities = new Set<string>();
                const distinct: { city: string; province: string }[] = [];

                for (const item of citiesForProv) {
                    const normalized = item.city.trim(); // keep casing for display, but could normalize for check
                    if (!uniqueCities.has(normalized)) {
                        uniqueCities.add(normalized);
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
