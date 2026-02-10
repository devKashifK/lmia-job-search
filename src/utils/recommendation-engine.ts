import db from '@/db';
import { UserPreferences } from '@/hooks/use-user-preferences';

export interface JobRecommendation {
    job_id: string;
    job_source: 'lmia' | 'trending_job';
    score: number;
    reasons: string[];
    job_data?: any;
}

interface ScoringFactors {
    profileMatch: number;
    behavioralMatch: number;
    recencyBoost: number;
    diversityPenalty: number;
}

/**
 * Generate personalized job recommendations for a user
 */
export async function generateRecommendations(
    userId: string
): Promise<JobRecommendation[]> {
    try {
        // 1. Fetch user preferences
        const { data: preferences, error: prefError } = await db
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (prefError || !preferences) {
            console.log('No user preferences found, returning empty recommendations');
            return [];
        }

        // 2. Fetch saved jobs (behavioral signal)
        const { data: savedJobs } = await db
            .from('saved_jobs')
            .select('record_id')
            .eq('user_id', userId)
            .limit(50);

        // 3. Fetch recent searches (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentSearches } = await db
            .from('searches')
            .select('keyword, filters, created_at')
            .eq('id', userId)
            .gte('created_at', thirtyDaysAgo.toISOString())
            .not('keyword', 'like', '__job_view__%')
            .order('created_at', { ascending: false })
            .limit(20);

        // 4. Analyze patterns and generate candidate jobs
        const candidates = await getCandidateJobs(preferences);

        // 5. Score each candidate
        const scoredRecommendations = candidates.map((job) => {
            const scoring = scoreJob(job, preferences, savedJobs || [], recentSearches || []);
            return {
                job_id: job.id,
                job_source: job.source,
                score: scoring.totalScore,
                reasons: scoring.reasons,
                job_data: job,
            };
        });

        // 6. Sort by score and take top recommendations
        const topRecommendations = scoredRecommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 50); // Top 50 recommendations

        // 7. Cache in database
        await cacheRecommendations(userId, topRecommendations);

        return topRecommendations;
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return [];
    }
}

/**
 * Get candidate jobs based on user preferences
 */
async function getCandidateJobs(preferences: UserPreferences): Promise<any[]> {
    const candidates: any[] = [];

    // Fetch from LMIA records
    let lmiaQuery = db.from('lmia_records').select('*').limit(500);

    // Filter by job titles if specified
    if (preferences.preferred_job_titles?.length > 0) {
        // Use ilike for partial matching on each title
        const titleConditions = preferences.preferred_job_titles
            .map(title => `JobTitle.ilike.%${title}%`)
            .join(',');
        lmiaQuery = lmiaQuery.or(titleConditions);
    }

    // Filter by provinces if specified
    if (preferences.preferred_provinces?.length > 0) {
        lmiaQuery = lmiaQuery.in('Province', preferences.preferred_provinces);
    }

    // Filter by cities if specified (additive with provinces)
    if (preferences.preferred_cities?.length > 0) {
        lmiaQuery = lmiaQuery.in('City', preferences.preferred_cities);
    }

    // Filter by NOC codes if specified
    if (preferences.preferred_noc_codes?.length > 0) {
        lmiaQuery = lmiaQuery.in('NOC', preferences.preferred_noc_codes);
    }

    const { data: lmiaJobs } = await lmiaQuery;
    if (lmiaJobs) {
        candidates.push(
            ...lmiaJobs.map((job) => ({ ...job, source: 'lmia', id: job.RecordID }))
        );
    }

    // Fetch from trending jobs
    let trendingQuery = db.from('trending_job').select('*').limit(500);

    // Apply same filters to trending jobs
    if (preferences.preferred_job_titles?.length > 0) {
        const titleConditions = preferences.preferred_job_titles
            .map(title => `job_title.ilike.%${title}%`)
            .join(',');
        trendingQuery = trendingQuery.or(titleConditions);
    }

    if (preferences.preferred_provinces?.length > 0) {
        trendingQuery = trendingQuery.in('province', preferences.preferred_provinces);
    }

    if (preferences.preferred_cities?.length > 0) {
        trendingQuery = trendingQuery.in('city', preferences.preferred_cities);
    }

    if (preferences.preferred_industries?.length > 0) {
        const industryConditions = preferences.preferred_industries
            .map(ind => `industry.ilike.%${ind}%`)
            .join(',');
        trendingQuery = trendingQuery.or(industryConditions);
    }

    const { data: trendingJobs } = await trendingQuery;
    if (trendingJobs) {
        candidates.push(
            ...trendingJobs.map((job) => ({ ...job, source: 'trending_job' }))
        );
    }

    // If no candidates found with filters, return empty array
    // This prevents showing random 0% match jobs
    return candidates;
}

/**
 * Score a job based on user preferences and behavior
 */
function scoreJob(
    job: any,
    preferences: UserPreferences,
    savedJobs: any[],
    recentSearches: any[]
): { totalScore: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // 1. Job Title Match (weight: 0.3)
    if (preferences.preferred_job_titles?.length > 0) {
        const jobTitle = (job.job_title || job.JobTitle || '').toLowerCase();
        const titleMatch = preferences.preferred_job_titles.some((prefTitle) =>
            jobTitle.includes(prefTitle.replace(/_/g, ' '))
        );
        if (titleMatch) {
            score += 0.3;
            reasons.push('Matches your preferred job title');
        }
    }

    // 2. Location Match (weight: 0.25)
    const hasLocationPreferences =
        (preferences.preferred_provinces?.length || 0) > 0 ||
        (preferences.preferred_cities?.length || 0) > 0;

    if (hasLocationPreferences) {
        const jobCity = (job.City || job.city || '').toLowerCase();
        const jobProvince = (job.Province || job.province || '').toLowerCase();

        const provinceMatch = preferences.preferred_provinces?.some((prov: string) =>
            jobProvince.includes(prov.toLowerCase())
        );

        const cityMatch = preferences.preferred_cities?.some((city: string) =>
            jobCity.includes(city.toLowerCase())
        );

        if (provinceMatch || cityMatch) {
            score += 0.25;
            reasons.push(`Located in your preferred area`);
        }
    }

    // 3. Industry Match (weight: 0.2)
    if (preferences.preferred_industries?.length > 0) {
        const jobIndustry = (job.industry || job.NAICS_Title || '').toLowerCase();
        const industryMatch = preferences.preferred_industries.some((ind) =>
            jobIndustry.includes(ind.toLowerCase())
        );
        if (industryMatch) {
            score += 0.2;
            reasons.push('In your preferred industry');
        }
    }

    // 4. Behavioral Signals (weight: 0.2)
    // Check if similar to saved jobs
    const savedJobTitles = savedJobs.map(sj => sj.record_id);
    if (savedJobTitles.includes(job.id || job.RecordID)) {
        // Already saved, lower priority
        score -= 0.1;
    }

    // Check if matches recent search keywords
    const jobText = `${job.JobTitle || job.job_title || ''} ${job.operating_name || job.employer || ''}`.toLowerCase();
    const searchMatch = recentSearches?.some((search) =>
        jobText.includes(search.keyword?.toLowerCase() || '')
    );
    if (searchMatch) {
        score += 0.2;
        reasons.push('Related to your recent searches');
    }

    // Normalize score to 0-1 range
    const totalScore = Math.min(Math.max(score, 0), 1);

    // Ensure at least one reason
    if (reasons.length === 0) {
        reasons.push('Based on your profile');
    }

    return { totalScore, reasons };
}

/**
 * Extract salary from job data
 */
function extractSalary(job: any): number | null {
    // Try different salary fields
    const salaryFields = [
        job.salary,
        job.Wage,
        job.median_salary,
        job.salary_max,
    ];

    for (const field of salaryFields) {
        if (field && typeof field === 'number') {
            return field;
        }
        if (field && typeof field === 'string') {
            const parsed = parseFloat(field.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed)) {
                return parsed;
            }
        }
    }

    return null;
}

/**
 * Cache recommendations in the database
 */
async function cacheRecommendations(
    userId: string,
    recommendations: JobRecommendation[]
): Promise<void> {
    try {
        // Delete old recommendations for this user
        await db.from('job_recommendations').delete().eq('user_id', userId);

        // Insert new recommendations
        const records = recommendations.map((rec) => ({
            user_id: userId,
            job_id: rec.job_id,
            job_source: rec.job_source,
            score: rec.score,
            reasons: rec.reasons,
        }));

        const { error } = await db.from('job_recommendations').insert(records);

        if (error) {
            console.error('Error caching recommendations:', error);
        }
    } catch (error) {
        console.error('Error in cacheRecommendations:', error);
    }
}

/**
 * Get cached recommendations for a user
 */
export async function getCachedRecommendations(
    userId: string
): Promise<JobRecommendation[]> {
    try {
        const { data, error } = await db
            .from('job_recommendations')
            .select('*')
            .eq('user_id', userId)
            .order('score', { ascending: false })
            .limit(20);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error getting cached recommendations:', error);
        return [];
    }
}

/**
 * Refresh recommendations if they're stale (>24 hours old)
 */
export async function refreshRecommendationsIfNeeded(
    userId: string
): Promise<boolean> {
    try {
        const { data } = await db
            .from('job_recommendations')
            .select('created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!data) {
            // No recommendations, generate new ones
            await generateRecommendations(userId);
            return true;
        }

        const lastGenerated = new Date(data.created_at);
        const now = new Date();
        const hoursSinceGeneration = (now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60);

        if (hoursSinceGeneration > 24) {
            // Stale recommendations, regenerate
            await generateRecommendations(userId);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error checking recommendation freshness:', error);
        return false;
    }
}

/**
 * Invalidate (delete) cached recommendations for a user
 * Use this when user's data changes (deleted searches, updated preferences, etc.)
 */
export async function invalidateRecommendationCache(userId: string): Promise<void> {
    try {
        await db.from('job_recommendations').delete().eq('user_id', userId);
        console.log('Recommendation cache invalidated for user:', userId);
    } catch (error) {
        console.error('Error invalidating recommendation cache:', error);
    }
}

