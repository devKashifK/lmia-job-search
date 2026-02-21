'use server';

import db from '@/db';

// Define a unified Job type if possible, or use 'any' for now as existing code does
// Ideally we should import types from a central types definition if available.
// For now, mirroring the store's usage of 'any' or defining a basic shape.

export interface JobSearchResult {
    [key: string]: any;
}

export async function searchLmia(term: string): Promise<JobSearchResult[]> {
    const { data, error } = await db.rpc('rpc_search_lmia', {
        term: term,
    });

    if (error) {
        console.error('Error searching LMIA:', error);
        throw error;
    }

    return (data as JobSearchResult[]) || [];
}

export async function searchTrending(term: string): Promise<JobSearchResult[]> {
    const { data, error } = await db.rpc('rpc_search_hot_leads_new', {
        term: term,
    });

    if (error) {
        console.error('Error searching trending jobs:', error);
        throw error;
    }

    return (data as JobSearchResult[]) || [];
}

// --- Helpers moved from DynamicDataView ---

function getPrimaryKey(table: string) {
    return table === 'lmia' ? 'RecordID' : 'id';
}

function getAllowedFields(table: string): string[] {
    if (table === 'lmia') {
        return [
            'territory', 'program', 'city', 'postal_code', 'lmia_period',
            'lmia_year', 'priority_occupation', 'employer', 'noc_code', 'job_title',
        ];
    }
    return ['state', 'city', 'category', 'job_title', 'noc_code', 'employer'];
}

function getTextSearchFields(table: string): string[] {
    if (table === 'lmia') {
        return [
            'territory', 'program', 'city', 'postal_code', 'lmia_period',
            'priority_occupation', 'employer', 'noc_code', 'job_title',
        ];
    }
    return ['state', 'city', 'category', 'job_title', 'noc_code', 'employer'];
}

const NORM_MAP_TRENDING: Record<string, string> = {
    state: 'state_norm',
    city: 'city_norm',
    category: 'category_norm',
    job_title: 'job_title_norm',
    noc_code: 'noc_code_norm',
    employer: 'employer_norm',
};

const NORM_MAP_LMIA: Record<string, string> = {
    city: 'city_norm',
    territory: 'territory_norm',
    program: 'program_norm',
    postal_code: 'postal_code_norm',
    lmia_period: 'lmia_period_norm',
    priority_occupation: 'priority_occupation_norm',
    employer: 'employer_norm',
    noc_code: 'noc_code_norm',
    job_title: 'job_title_norm',
};

function getNormMap(table: string): Record<string, string> {
    return table === 'lmia' ? NORM_MAP_LMIA : NORM_MAP_TRENDING;
}

interface QueryJobsParams {
    tableName: string; // 'trending_job' | 'lmia' (mapped from searchType)
    query?: string;
    field?: string;
    page?: number;
    pageSize?: number;
    filters?: Record<string, string[]>;
    dateFrom?: string;
    dateTo?: string;
}

export async function queryJobs({
    tableName,
    query = '',
    field = 'all',
    page = 1,
    pageSize = 10,
    filters = {},
    dateFrom,
    dateTo
}: QueryJobsParams): Promise<{ data: any[]; count: number | null }> {
    console.log('DEBUG: queryJobs params:', { tableName, query, field, page, pageSize, filters, dateFrom, dateTo });
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Table specific helpers
    const pk = getPrimaryKey(tableName);
    const useNorm = true; // Use normalized columns logic
    const normMap = getNormMap(tableName);
    const textSearchFields = getTextSearchFields(tableName);
    const allowedFields = getAllowedFields(tableName);

    let selectCols = '*';
    if (tableName === 'trending_job') {
        selectCols = '*';
    }

    let builder = db.from(tableName).select(selectCols, { count: 'exact' });

    // 1. Free-text Search
    const q = query.trim();
    if (q !== '') {
        if (field === 'all') {
            // OR across text-searchable columns
            const orExpr = textSearchFields
                .map((c) => `${c}.ilike.%${q}%`)
                .join(',');
            if (orExpr) builder = builder.or(orExpr);
        } else if (allowedFields.includes(field)) {
            // Field specific
            if (tableName === 'lmia' && field === 'lmia_year') {
                const num = Number(q);
                if (Number.isFinite(num)) {
                    builder = builder.eq('lmia_year', Math.floor(num));
                }
            } else {
                builder = builder.ilike(field, `%${q}%`);
            }
        }
    }

    // 2. Date Range
    if (tableName === 'trending_job') {
        if (dateFrom) builder = builder.gte('date_of_job_posting', dateFrom);
        if (dateTo) builder = builder.lte('date_of_job_posting', dateTo);
    } else if (tableName === 'lmia') {
        // Year range
        const yf = dateFrom ? Number(dateFrom.slice(0, 4)) : undefined;
        const yt = dateTo ? Number(dateTo.slice(0, 4)) : undefined;
        if (Number.isFinite(yf)) builder = builder.gte('lmia_year', yf as number);
        if (Number.isFinite(yt)) builder = builder.lte('lmia_year', yt as number);
    }

    // 3. Filters
    Object.entries(filters).forEach(([key, values]) => {
        if (!values || values.length === 0) return;

        const normCol = normMap[key] ?? key;

        if (normCol !== key) {
            // Use normalized exact matching logic (assumes values are raw, need lowercasing if logic required, 
            // but usually filters passed here might already be processed or we process them:
            const canon = values.map(v => v.trim().toLowerCase()).filter(Boolean);
            if (canon.length > 0) {
                if (canon.length === 1) builder = builder.eq(normCol, canon[0]);
                else builder = builder.in(normCol, canon);
            }
        } else {
            if (values.length === 1) builder = builder.eq(key, values[0]);
            else builder = builder.in(key, values);
        }
    });

    // 4. Sorting
    if (tableName === 'trending_job') {
        builder = builder
            .order('date_of_job_posting', { ascending: false })
            .order(pk, { ascending: true });
    } else {
        builder = builder
            .order('lmia_year', { ascending: false })
            .order(pk, { ascending: true });
    }

    // 5. Pagination
    const { data, error, count } = await builder.range(from, to);

    if (error) {
        console.error('Error querying jobs:', JSON.stringify(error, null, 2));
        throw new Error(error.message || 'Failed to fetch');
    }

    return { data: data || [], count };
}

// ─── Metadata helpers ────────────────────────────────────────────────────────

export async function getJobTitles(): Promise<string[]> {
    const [lmiaRes, trendingRes] = await Promise.all([
        db.from('lmia').select('JobTitle').not('JobTitle', 'is', null).limit(1000),
        db.from('trending_job').select('job_title').not('job_title', 'is', null).limit(1000),
    ]);
    const all = [
        ...(lmiaRes.data?.map((r) => r.JobTitle) ?? []),
        ...(trendingRes.data?.map((r) => r.job_title) ?? []),
    ].filter(Boolean);
    return [...new Set(all)].sort((a, b) => a.localeCompare(b));
}

export async function getCategories(): Promise<string[]> {
    const [lmiaRes, trendingRes] = await Promise.all([
        db.from('lmia').select('Category').not('Category', 'is', null).limit(1000),
        db.from('trending_job').select('category').not('category', 'is', null).limit(1000),
    ]);
    const all = [
        ...(lmiaRes.data?.map((r) => r.Category) ?? []),
        ...(trendingRes.data?.map((r) => r.category) ?? []),
    ].filter(Boolean);
    return [...new Set(all)].sort((a, b) => a.localeCompare(b));
}

export async function getNocCodes(): Promise<string[]> {
    const { data, error } = await db
        .from('trending_job')
        .select('noc_code')
        .not('noc_code', 'is', null)
        .limit(1000);
    if (error) throw error;
    return [...new Set((data ?? []).map((r) => r.noc_code).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
    );
}

export async function getCompanyTiers(): Promise<string[]> {
    const { data, error } = await db
        .from('trending_job')
        .select('tier')
        .not('tier', 'is', null);
    if (error) throw error;
    return [...new Set((data ?? []).map((r) => r.tier).filter(Boolean))].sort();
}

export async function getLiveFeedCounts(): Promise<{ highEndJobs: number; totalLmias: number }> {
    const [trendingRes, lmiaRes] = await Promise.all([
        db.from('trending_job').select('*', { count: 'exact', head: true }),
        db.from('lmia').select('*', { count: 'exact', head: true }),
    ]);
    return {
        highEndJobs: trendingRes.count ?? 0,
        totalLmias: lmiaRes.count ?? 0,
    };
}
