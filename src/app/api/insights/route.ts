import { NextResponse } from 'next/server';
import db from '@/db';
import { getAllPrograms, ProgramDefinition } from '@/lib/api/programs';

export const dynamic = 'force-dynamic';

// ─── Province normalisation ───────────────────────────────────────────────────

const PROVINCE_NORM: Record<string, string> = {
    'AB': 'Alberta', 'Alberta': 'Alberta',
    'BC': 'British Columbia', 'British Columbia': 'British Columbia',
    'MB': 'Manitoba', 'Manitoba': 'Manitoba',
    'NB': 'New Brunswick', 'New Brunswick': 'New Brunswick',
    'NL': 'Newfoundland and Labrador',
    'Newfoundland': 'Newfoundland and Labrador',
    'Newfoundland and Labrador': 'Newfoundland and Labrador',
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

const ATLANTIC_PROVINCES = new Set([
    'Nova Scotia', 'New Brunswick', 'Prince Edward Island', 'Newfoundland and Labrador',
]);

const PROVINCE_ORDER = [
    'British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba',
    'Ontario', 'Quebec',
    'Nova Scotia', 'New Brunswick', 'Prince Edward Island', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nunavut', 'Yukon',
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Bucket = { count: number; title: string; tier: string; salarySum: number; salaryCount: number };
type ProvMap = Record<string, Bucket>;

export interface NocRow {
    noc_code: string;
    title: string;
    tier: string;
    count: number;
    avg_salary: number | null;
    hot?: boolean;    // true if NOC appears in top-3 across 3+ provinces
}

export interface RegionData {
    key: string;
    region: string;
    rows: NocRow[];
}

export interface InDemandResponse {
    totalCount: number;
    regions: RegionData[];
    source: string;
    year: string;
    updatedAt: string;   // ISO timestamp
    hotNocs: string[];   // noc_codes appearing in top-3 across 3+ provinces
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toRows(map: ProvMap, limit = 15, hotSet?: Set<string>): NocRow[] {
    return Object.entries(map)
        .map(([noc_code, v]) => ({
            noc_code,
            title: v.title,
            tier: v.tier,
            count: v.count,
            avg_salary: v.salaryCount > 0 ? Math.round(v.salarySum / v.salaryCount) : null,
            hot: hotSet?.has(noc_code),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

const PAGE_SIZE = 100_000;

async function fetchTrendingRows(year: string, dateFrom?: string | null, dateTo?: string | null, program?: ProgramDefinition) {
    const all: any[] = [];
    let from = 0;
    while (true) {
        let q = db
            .from('trending_job')
            .select('noc_code, job_title, tier, state, city, salary')
            .not('noc_code', 'is', null)
            .not('state', 'is', null);

        // Apply program filters (State/City pairs)
        if (program) {
            const orConditions = program.locations.map(loc => {
                const stateFilter = `state.eq."${loc.state}"`;
                if (loc.cities && loc.cities.length > 0) {
                    // Properly escape cities for PostgREST in() filter
                    const escapedCities = loc.cities.map(c => `"${c}"`).join(',');
                    return `and(${stateFilter},city.in.(${escapedCities}))`;
                }
                return stateFilter;
            });
            if (orConditions.length > 0) {
                q = q.or(orConditions.join(','));
            }
        }

        if (year === 'custom' && (dateFrom || dateTo)) {
            if (dateFrom) q = q.gte('date_of_job_posting', dateFrom);
            if (dateTo) q = q.lte('date_of_job_posting', dateTo);
        } else if (year !== 'all') {
            q = q.gte('date_of_job_posting', `${year}-01-01`).lte('date_of_job_posting', `${year}-12-31`);
        }
        const { data, error } = await q.range(from, from + PAGE_SIZE - 1);
        if (error) {
            console.error('Error fetching trending rows:', error);
            throw error;
        }
        if (!data?.length) break;
        all.push(...data);
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }
    return all;
}

async function fetchLmiaRows(year: string, dateFrom?: string | null, dateTo?: string | null) {
    const all: any[] = [];
    let from = 0;
    while (true) {
        let q = db
            .from('lmia')
            .select('noc_code_norm, job_title, territory')
            .not('noc_code_norm', 'is', null)
            .not('territory', 'is', null);
        if (year === 'custom' && (dateFrom || dateTo)) {
            const years: number[] = [];
            if (dateFrom && dateTo) {
                const sY = parseInt(dateFrom.split('-')[0]);
                const eY = parseInt(dateTo.split('-')[0]);
                for (let y = sY; y <= eY; y++) if (!isNaN(y)) years.push(y);
            } else if (dateFrom) {
                const y = parseInt(dateFrom.split('-')[0]);
                if (!isNaN(y)) years.push(y);
            } else if (dateTo) {
                const y = parseInt(dateTo.split('-')[0]);
                if (!isNaN(y)) years.push(y);
            }
            if (years.length > 0) q = q.in('lmia_year', years);
        } else if (year !== 'all') {
            q = q.eq('lmia_year', parseInt(year));
        }
        const { data, error } = await q.range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        if (!data?.length) break;
        all.push(...data);
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }
    return all;
}

function parseSalary(raw: unknown): number | null {
    if (!raw) return null;
    const s = String(raw).replace(/[$,\/hr\/year\s]/gi, '');
    const n = parseFloat(s);
    return isNaN(n) || n <= 0 ? null : n;
}

// Find NOCs that appear in top-3 across 3+ provinces → "hot"
function findHotNocs(provinceMaps: Record<string, ProvMap>): Set<string> {
    const nocProvinceCount: Record<string, number> = {};
    for (const [, map] of Object.entries(provinceMaps)) {
        const top3 = Object.entries(map)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 3)
            .map(([noc]) => noc);
        for (const noc of top3) {
            nocProvinceCount[noc] = (nocProvinceCount[noc] || 0) + 1;
        }
    }
    return new Set(Object.entries(nocProvinceCount).filter(([, c]) => c >= 3).map(([noc]) => noc));
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') ?? '2026';
        const source = searchParams.get('source') ?? 'trending';
        const dateFrom = searchParams.get('date_from');
        const dateTo = searchParams.get('date_to');
        
        const allPrograms = await getAllPrograms();
        const program = allPrograms.find(p => p.id === source);
        const isLmia = source === 'lmia' && !program;
        const isProgram = !!program;

        // ── 1. Count Total (Approximate for UI stats) ─────────────────────────
        let countQuery = db
            .from(isLmia ? 'lmia' : 'trending_job')
            .select('*', { count: 'exact', head: true });
            
        if (isProgram && program) {
            const orConditions = program.locations.map(loc => {
                const stateFilter = `state.eq."${loc.state}"`;
                if (loc.cities && loc.cities.length > 0) {
                    const escapedCities = loc.cities.map(c => `"${c}"`).join(',');
                    return `and(${stateFilter},city.in.(${escapedCities}))`;
                }
                return stateFilter;
            });
            if (orConditions.length > 0) {
                countQuery = (countQuery as any).or(orConditions.join(','));
            }
        }

        if (year === 'custom' && (dateFrom || dateTo)) {
            if (isLmia) {
                const years: number[] = [];
                if (dateFrom && dateTo) {
                    const sY = parseInt(dateFrom.split('-')[0]);
                    const eY = parseInt(dateTo.split('-')[0]);
                    for (let y = sY; y <= eY; y++) if (!isNaN(y)) years.push(y);
                } else if (dateFrom) {
                    const y = parseInt(dateFrom.split('-')[0]);
                    if (!isNaN(y)) years.push(y);
                }
                if (years.length > 0) countQuery = (countQuery as any).in('lmia_year', years);
            } else {
                if (dateFrom) countQuery = (countQuery as any).gte('date_of_job_posting', dateFrom);
                if (dateTo) countQuery = (countQuery as any).lte('date_of_job_posting', dateTo);
            }
        } else if (year !== 'all') {
            if (isLmia) {
                countQuery = (countQuery as any).eq('lmia_year', parseInt(year));
            } else {
                countQuery = (countQuery as any)
                    .gte('date_of_job_posting', `${year}-01-01`)
                    .lte('date_of_job_posting', `${year}-12-31`);
            }
        }
        
        const { count: totalCount, error: countError } = await countQuery;
        if (countError) throw countError;

        // ── 2. Fetch rows ─────────────────────────────────────────────────────
        const rawRows = isLmia 
            ? await fetchLmiaRows(year, dateFrom, dateTo) 
            : await fetchTrendingRows(year, dateFrom, dateTo, program);

        // ── 3. Aggregate ──────────────────────────────────────────────────────
        const provinceMaps: Record<string, ProvMap> = {};
        const canadaMap: ProvMap = {};
        const atlanticMap: ProvMap = {};

        for (const row of rawRows) {
            const rawProvince = isLmia ? row.territory : row.state;
            const province = PROVINCE_NORM[rawProvince] || rawProvince;
            const noc = (isLmia ? row.noc_code_norm : row.noc_code)?.trim();
            const title = row.job_title?.trim() || 'Unknown';
            const tier = isLmia ? '' : (row.tier?.toString() || '');
            const salary = isLmia ? null : parseSalary(row.salary);

            if (!noc || !province) continue;

            // Canada
            if (!canadaMap[noc]) canadaMap[noc] = { count: 0, title, tier, salarySum: 0, salaryCount: 0 };
            canadaMap[noc].count++;
            if (salary) { canadaMap[noc].salarySum += salary; canadaMap[noc].salaryCount++; }

            // Atlantic
            if (ATLANTIC_PROVINCES.has(province)) {
                if (!atlanticMap[noc]) atlanticMap[noc] = { count: 0, title, tier, salarySum: 0, salaryCount: 0 };
                atlanticMap[noc].count++;
                if (salary) { atlanticMap[noc].salarySum += salary; atlanticMap[noc].salaryCount++; }
            }

            // Province
            if (!provinceMaps[province]) provinceMaps[province] = {};
            if (!provinceMaps[province][noc]) provinceMaps[province][noc] = { count: 0, title, tier, salarySum: 0, salaryCount: 0 };
            provinceMaps[province][noc].count++;
            if (salary) { provinceMaps[province][noc].salarySum += salary; provinceMaps[province][noc].salaryCount++; }
        }

        // ── 4. Hot NOC detection ──────────────────────────────────────────────
        const hotSet = findHotNocs(provinceMaps);
        const hotNocs = Array.from(hotSet);

        // ── 5. Build response ─────────────────────────────────────────────────
        const regions: RegionData[] = [
            { key: 'canada', region: 'Canada', rows: toRows(canadaMap, 22, hotSet) },
        ];

        // Only add Atlantic if it has data (which happens if the program includes Atlantic provinces)
        if (Object.keys(atlanticMap).length > 0) {
            regions.push({ key: 'atlantic', region: 'Atlantic', rows: toRows(atlanticMap, 15, hotSet) });
        }

        regions.push(...PROVINCE_ORDER
            .filter(p => provinceMaps[p] && Object.keys(provinceMaps[p]).length > 0)
            .map(p => ({
                key: p.toLowerCase().replace(/\s+/g, '-'),
                region: p,
                rows: toRows(provinceMaps[p], 15, hotSet),
            }))
        );

        const response: InDemandResponse = {
            totalCount: totalCount ?? 0,
            regions,
            source,
            year,
            updatedAt: new Date().toISOString(),
            hotNocs,
        };

        return NextResponse.json(response, {
            headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
        });
    } catch (err) {
        console.error('[/api/insights] Error:', err);
        return NextResponse.json({ error: 'Failed to fetch in-demand jobs data' }, { status: 500 });
    }
}
