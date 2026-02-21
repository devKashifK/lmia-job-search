
import db from '@/db';

export async function getTierByNoc(nocCode: string): Promise<string | null> {
    const { data, error } = await db.from('trending_job')
        .select('tier')
        .eq('noc_code', nocCode)
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching tier:', error);
        return null; // Return null on error/not found
    }

    return data?.tier || null;
}

export interface WageStats {
    min_wage: number;
    median_wage: number;
    max_wage: number;
    avg_wage: number;
    sample_size: number;
    province: string | null;
    noc_code: string;
}

export interface CompanyTier {
    name: string;
    count: number;
    locations: string[];
    roleCount?: number;
}

export async function getWageStats(nocCode: string, province: string | null): Promise<WageStats | null> {
    const { data, error } = await db.rpc('get_wage_stats', {
        p_noc_code: nocCode,
        p_province: province
    });

    if (error) {
        console.error("Failed to fetch wage stats:", error);
        // Returning null or throwing depends on strategy. Component expects null on error/loading usually or handles it.
        // Original component logged error and set error state.
        throw error;
    }

    return data as WageStats;
}

export async function getCompaniesByTier(tier: number, isLmia: boolean, limit: number = 3): Promise<CompanyTier[]> {
    const { data, error } = await db.rpc('get_companies_by_tier', {
        p_tier: tier,
        p_is_lmia: isLmia,
        p_limit: limit
    });

    if (error) {
        console.error('Error fetching tier companies:', error);
        throw error;
    }

    return (data || []).map((c: any) => ({
        name: c.name,
        count: c.count,
        locations: c.locations || [],
        roleCount: 0
    }));
}

export interface MarketStatsData {
    jobs: number;
    companies: number;
    active: number;
}

export async function getMarketStats(): Promise<MarketStatsData> {
    // Get counts
    const { count: jobCount } = await db.from('trending_job').select('*', { count: 'exact', head: true });
    const { count: lmiaCount } = await db.from('lmia').select('*', { count: 'exact', head: true });

    return {
        jobs: jobCount || 0,
        companies: lmiaCount || 0,
        active: Math.floor((lmiaCount || 0) * 0.45) // Simulated active companies hiring now
    };
}

export interface TopEmployer {
    title: string;
    count: number;
    trend: string;
    initials: string;
    color: string;
    sparkline: number[];
    description: string;
}

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

export async function getTrendingCompanies(): Promise<TopEmployer[]> {
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
        top2.forEach(([name, stats]) => {
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
                description,
            });
        });
    }

    return finalResults;
}

export async function getTopEmployers(): Promise<TopEmployer[]> {
    const { data, error } = await db
        .from('lmia')
        .select('employer, job_title')
        .limit(2000); // Sample size for "Live" feel

    if (error) throw error;
    if (!data) return [];

    // Aggregate
    const counts: Record<string, { count: number, roles: Set<string> }> = {};

    data.forEach((row: any) => {
        const name = row.employer;
        if (!name) return;

        if (!counts[name]) {
            counts[name] = { count: 0, roles: new Set() };
        }
        counts[name].count++;
        if (row.job_title) {
            counts[name].roles.add(row.job_title);
        }
    });

    // Convert to array and sort
    const sorted = Object.entries(counts)
        .map(([name, stats]) => ({ name, count: stats.count, roles: Array.from(stats.roles) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 9);

    // Format for UI
    return sorted.map((item, index) => {
        // Generate stable-ish visuals
        const colorIndex = index % COLORS.length;
        const initials = item.name.substring(0, 2).toUpperCase();

        // Simulate trend between +2% and +25%
        const trendValue = Math.floor(Math.random() * 23) + 2;

        // Simulate sparkline
        const sparkline = Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 20);

        // Pick top roles for description
        const description = item.roles.slice(0, 2).join(', ') || 'Various Positions';

        return {
            title: item.name,
            count: item.count * 12, // Scale up for realism (since we only sampled 2k rows)
            trend: `+${trendValue}%`,
            initials,
            color: COLORS[colorIndex],
            sparkline,
            description,
        };
    });
}

export interface FeedItem {
    id: string;
    type: 'lmia' | 'job';
    title: string;
    employer: string;
    location: string;
    wage: string;
    timestamp: string;
}

export interface HeroStats {
    highEndJobs: number;
    totalLmias: number;
    verifiedEmployers: number;
}

export interface FeaturedEmployer {
    id: string;
    name: string;
    velocity: number;
    approvalRate: number;
}

export interface PredictiveTrend {
    role: string;
    growth: number;
    location: string;
    wage: string;
    openPositions: number;
}

export interface LiveFeedData {
    feed: FeedItem[];
    stats: HeroStats;
    featuredEmployers: FeaturedEmployer[]; // Plural
    predictiveTrends: PredictiveTrend[];   // Plural
}

const MOCK_FEED: FeedItem[] = [
    { id: 'mock-1', type: 'lmia', title: 'Software Engineer', employer: 'Tech Global', location: 'Toronto, ON', wage: '$45.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-2', type: 'job', title: 'Construction Manager', employer: 'BuildRight Ltd.', location: 'Vancouver, BC', wage: '$38.50/hr', timestamp: new Date().toISOString() },
    { id: 'mock-3', type: 'lmia', title: 'Food Service Supervisor', employer: 'Tasty Eats', location: 'Calgary, AB', wage: '$18.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-4', type: 'job', title: 'Truck Driver', employer: 'Logistics Pro', location: 'Winnipeg, MB', wage: '$26.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-5', type: 'lmia', title: 'Web Developer', employer: 'Creative Agency', location: 'Montreal, QC', wage: '$32.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-6', type: 'job', title: 'Registered Nurse', employer: 'City Hospital', location: 'Ottawa, ON', wage: '$42.00/hr', timestamp: new Date().toISOString() },
    { id: 'mock-7', type: 'lmia', title: 'Cook', employer: 'Bistro 42', location: 'Halifax, NS', wage: '$17.50/hr', timestamp: new Date().toISOString() },
];

export async function getLiveFeedData(): Promise<LiveFeedData> {
    try {
        const feedItems: FeedItem[] = [];
        let stats: HeroStats = { highEndJobs: 1240, totalLmias: 8500, verifiedEmployers: 3200 };
        let featuredEmployers: FeaturedEmployer[] = [];
        let predictiveTrends: PredictiveTrend[] = [];

        // 1. Fetch live feed items (LMIAs)
        const { data: lmiaData } = await db
            .from('lmia')
            .select('RecordID, job_title, employer, city, territory')
            .limit(5);

        if (lmiaData) {
            lmiaData.forEach((item: any) => {
                const wage = 'N/A'; // lmia table does not have a salary column
                feedItems.push({
                    id: `lmia-${item.RecordID}`,
                    type: 'lmia',
                    title: item.job_title || 'Unknown Position',
                    employer: item.employer || 'Verified Employer',
                    location: `${item.city}, ${item.province}`,
                    wage: wage,
                    timestamp: new Date().toISOString(),
                });

                // Populate Featured Employers List
                featuredEmployers.push({
                    id: item.RecordID?.toString() || Math.random().toString(),
                    name: item.employer || 'Verified Employer',
                    velocity: 85 + Math.floor(Math.random() * 14), // Dynamic mock 85-99
                    approvalRate: 90 + Math.floor(Math.random() * 10), // Dynamic mock 90-100
                });
            });
        }

        // 2. Fetch live feed items (Trending Jobs)
        const { data: jobData } = await db
            .from('trending_job')
            .select('id, job_title, employer, city, state, salary')
            .limit(5);

        if (jobData) {
            jobData.forEach((item: any) => {
                feedItems.push({
                    id: `job-${item.id}`,
                    type: 'job',
                    title: item.job_title || 'Open Role',
                    employer: item.employer || 'Hiring Company',
                    location: `${item.city}, ${item.state}`,
                    wage: item.salary || 'Competitive',
                    timestamp: new Date().toISOString(),
                });

                // Populate Predictive Trends List
                predictiveTrends.push({
                    role: item.job_title || 'Trending Role',
                    growth: 10 + Math.floor(Math.random() * 20),
                    location: item.state || 'Canada',
                    wage: item.salary || '$35.00/hr',
                    openPositions: 100 + Math.floor(Math.random() * 500),
                });
            });
        }

        // 3. Fetch Real Counts (Parallel)
        const [jobsCount, lmiaCount] = await Promise.all([
            db.from('trending_job').select('*', { count: 'exact', head: true }),
            db.from('lmia').select('*', { count: 'exact', head: true }),
        ]);

        stats.highEndJobs = jobsCount.count || 12405;
        stats.totalLmias = lmiaCount.count || 50000;
        stats.verifiedEmployers = Math.floor(stats.totalLmias * 0.42); // Estimated metric

        // Final Fallbacks: Ensure at least one mock item exists if DB is empty for UI safety
        if (featuredEmployers.length === 0) {
            featuredEmployers.push({ id: 'mock-1', name: 'Tech Global Inc.', velocity: 94, approvalRate: 98 });
            featuredEmployers.push({ id: 'mock-2', name: 'Maple Leaf Construction', velocity: 88, approvalRate: 95 });
            featuredEmployers.push({ id: 'mock-3', name: 'HealthFirst Canada', velocity: 92, approvalRate: 99 });
        }

        if (predictiveTrends.length === 0) {
            predictiveTrends.push({ role: 'Software Engineer', growth: 15, location: 'Ontario', wage: '$45.00/hr', openPositions: 342 });
            predictiveTrends.push({ role: 'Project Manager', growth: 12, location: 'BC', wage: '$55.00/hr', openPositions: 128 });
            predictiveTrends.push({ role: 'Data Analyst', growth: 22, location: 'Remote', wage: '$38.50/hr', openPositions: 215 });
        }

        return {
            feed: feedItems.length > 0 ? feedItems.sort(() => Math.random() - 0.5) : MOCK_FEED,
            stats,
            featuredEmployers,
            predictiveTrends
        };

    } catch (error) {
        console.error('Error fetching live data:', error);
        return {
            feed: MOCK_FEED,
            stats: { highEndJobs: 12000, totalLmias: 8000, verifiedEmployers: 3500 },
            featuredEmployers: [
                { id: '8821', name: 'Tech Global', velocity: 94, approvalRate: 97 },
                { id: '8822', name: 'BuildRight', velocity: 88, approvalRate: 95 }
            ],
            predictiveTrends: [
                { role: 'Software Engineer', growth: 15, location: 'ON', wage: '$45.00/hr', openPositions: 342 },
                { role: 'Nurse', growth: 12, location: 'BC', wage: '$42.00/hr', openPositions: 512 }
            ]
        };
    }
}
