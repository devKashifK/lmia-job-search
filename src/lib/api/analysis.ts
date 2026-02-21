import db from '@/db';

export async function getCompanyAnalysis(
    tableName: string,
    companyColumn: string,
    companyName: string,
    searchType: 'hot_leads' | 'lmia',
    filters?: {
        dateFrom?: string;
        dateTo?: string;
    }
) {
    let q = db.from(tableName).select('*').eq(companyColumn, companyName);

    if (filters) {
        if (searchType === 'lmia') {
            if (filters.dateFrom) {
                const yearFrom = parseInt(filters.dateFrom.split('-')[0]);
                q = q.gte('lmia_year', yearFrom);
            }
            if (filters.dateTo) {
                const yearTo = parseInt(filters.dateTo.split('-')[0]);
                q = q.lte('lmia_year', yearTo);
            }
        } else {
            if (filters.dateFrom) q = q.gte('date_of_job_posting', filters.dateFrom);
            if (filters.dateTo) q = q.lte('date_of_job_posting', filters.dateTo);
        }
    }

    const { data, error } = await q;

    if (error) throw error;
    return data;
}

export async function getDistinctCompanies(
    tableName: string,
    companyColumn: string,
    jobTitleColumn: string,
    jobTitleFilter: string | null = null
) {
    let q = db
        .from(tableName)
        .select(companyColumn)
        .not(companyColumn, 'is', null);

    if (jobTitleFilter) {
        q = q.ilike(jobTitleColumn, `%${jobTitleFilter}%`);
    }

    const { data, error } = await q.limit(1000);

    if (error) {
        console.error('Error fetching distinct companies:', error);
        return [];
    }

    // Deduplicate
    const unique = Array.from(
        new Set((data || []).map((r: any) => r[companyColumn]).filter(Boolean))
    );
    return unique.sort().map(name => ({ employer: name }));
}

export async function getFilterOptions(
    tableName: string,
    column: string,
    searchTerm: string = ''
) {
    let q = db.from(tableName).select(column);

    if (searchTerm) {
        q = q.ilike(column, `%${searchTerm}%`);
    }

    const { data, error } = await q.limit(1000);

    if (error) {
        console.error(`Error fetching filter options for ${column}:`, error);
        return [];
    }

    // Deduplicate and sort
    const unique = Array.from(new Set(data.map((r: any) => r[column]))).filter(Boolean);
    return unique.sort();
}

export async function getCompanyFilterOptions(
    tableName: string,
    companyName: string,
    searchType: 'hot_leads' | 'lmia'
) {
    const companyColumn =
        searchType === 'lmia' ? 'employer' : 'employer';
    const locationColumn =
        searchType === 'lmia' ? 'territory' : 'state';

    const selectCols =
        searchType === 'lmia'
            ? [locationColumn, 'city', 'noc_code', 'job_title'].join(', ')
            : [locationColumn, 'city', 'noc_code', 'job_title'].join(', ');

    const { data, error } = await db
        .from(tableName)
        .select(selectCols)
        .eq(companyColumn, companyName);

    if (error) throw error;

    const result: Record<string, Map<string, number>> = {
        locations: new Map(),
        cities: new Map(),
        nocCodes: new Map(),
        jobTitles: new Map(),
    };

    data?.forEach((row: any) => {
        if (row[locationColumn]) {
            result.locations.set(
                row[locationColumn],
                (result.locations.get(row[locationColumn]) || 0) + 1
            );
        }
        if (row.city) {
            result.cities.set(row.city, (result.cities.get(row.city) || 0) + 1);
        }
        if (row.noc_code) {
            result.nocCodes.set(
                row.noc_code,
                (result.nocCodes.get(row.noc_code) || 0) + 1
            );
        }
        if (row.job_title) {
            result.jobTitles.set(
                row.job_title,
                (result.jobTitles.get(row.job_title) || 0) + 1
            );
        }
    });

    return {
        locations: Array.from(result.locations.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
        cities: Array.from(result.cities.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
        nocCodes: Array.from(result.nocCodes.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
        jobTitles: Array.from(result.jobTitles.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
    };
}

// ─── Analysis page data helpers ──────────────────────────────────────────────

export async function getTrendingRoles(limit = 6) {
    const { data, error } = await db
        .from('trending_job')
        .select('job_title, employer')
        .limit(2500);
    if (error) throw error;

    const roleCounts: Record<string, { count: number; companies: Set<string> }> = {};
    (data ?? []).forEach((row: any) => {
        const title = row.job_title;
        if (!title) return;
        if (!roleCounts[title]) roleCounts[title] = { count: 0, companies: new Set() };
        roleCounts[title].count++;
        if (row.employer) roleCounts[title].companies.add(row.employer);
    });

    return Object.entries(roleCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, limit)
        .map(([title, stats]) => ({
            title,
            count: stats.count,
            companyCount: stats.companies.size,
        }));
}

export async function getRegionalHotspots(limit = 6) {
    const { data, error } = await db
        .from('trending_job')
        .select('city, state, job_title')
        .limit(2000);
    if (error) throw error;

    const provinces: Record<string, { count: number; roles: Record<string, number> }> = {};
    const cities: Record<string, { count: number; province: string; roles: Record<string, number> }> = {};

    (data ?? []).forEach((row: any) => {
        const prov = row.state || 'Unknown';
        const role = row.job_title || 'Unknown';
        if (!provinces[prov]) provinces[prov] = { count: 0, roles: {} };
        provinces[prov].count++;
        provinces[prov].roles[role] = (provinces[prov].roles[role] || 0) + 1;

        if (row.city) {
            if (!cities[row.city]) cities[row.city] = { count: 0, province: prov, roles: {} };
            cities[row.city].count++;
            cities[row.city].roles[role] = (cities[row.city].roles[role] || 0) + 1;
        }
    });

    const topProvinces = Object.entries(provinces)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)
        .map(([name, stats]) => ({
            name,
            type: 'province' as const,
            count: stats.count,
            topRole: Object.entries(stats.roles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Various',
        }));

    const topCities = Object.entries(cities)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)
        .map(([name, stats]) => ({
            name,
            type: 'city' as const,
            count: stats.count,
            topRole: Object.entries(stats.roles).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Various',
        }));

    return [...topProvinces, ...topCities].slice(0, limit);
}

export async function getTopCompaniesList(variant: 'trending' | 'lmia', limit = 8) {
    if (variant === 'lmia') {
        const { data, error } = await db
            .from('lmia')
            .select('employer, approved_positions, city, province:territory')
            .not('employer', 'is', null)
            .limit(1500);
        if (error) throw error;

        const agg: Record<string, { count: number; positions: number; locations: Set<string> }> = {};
        (data ?? []).forEach((row: any) => {
            const name = row.employer;
            if (!agg[name]) agg[name] = { count: 0, positions: 0, locations: new Set() };
            agg[name].count++;
            agg[name].positions += Number(row.approved_positions) || 1;
            if (row.city) agg[name].locations.add(row.city);
        });

        return Object.entries(agg)
            .map(([name, s]) => ({ name, metric: s.positions, subMetric: `${s.count} applications`, locations: [...s.locations].slice(0, 2), isVerified: true }))
            .sort((a, b) => b.metric - a.metric).slice(0, limit);
    }

    const { data, error } = await db
        .from('trending_job')
        .select('employer, job_title, city, state')
        .not('employer', 'is', null)
        .limit(1500);
    if (error) throw error;

    const agg: Record<string, { count: number; roles: Set<string>; locations: Set<string> }> = {};
    (data ?? []).forEach((row: any) => {
        const name = row.employer;
        if (!agg[name]) agg[name] = { count: 0, roles: new Set(), locations: new Set() };
        agg[name].count++;
        if (row.job_title) agg[name].roles.add(row.job_title);
        if (row.city) agg[name].locations.add(row.city);
    });

    return Object.entries(agg)
        .map(([name, s]) => ({ name, metric: s.count, subMetric: `${s.roles.size} active roles`, locations: [...s.locations].slice(0, 2), isVerified: false }))
        .sort((a, b) => b.metric - a.metric).slice(0, limit);
}

export async function getCategorizedCompanies(limit = 2000) {
    const { data, error } = await db
        .from('trending_job')
        .select('employer, job_title')
        .not('employer', 'is', null)
        .limit(limit);
    if (error) throw error;
    return data ?? [];
}

