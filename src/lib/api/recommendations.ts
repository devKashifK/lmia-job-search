import db from '@/db';
import { type UserPreferences } from '@/lib/api/users';

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
        // 1. Fetch user preferences (may not exist)
        const { data: preferences } = await db
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

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

        // If we have neither preferences nor search history, return empty
        if (!preferences && (!recentSearches || recentSearches.length === 0)) {
            console.log('No preferences or search history, returning empty recommendations');
            return [];
        }

        // 4. Analyze patterns and generate candidate jobs
        // Use DEFAULT_PREFERENCES as fallback when user hasn't set preferences
        const effectivePreferences = preferences || {
            preferred_job_titles: [],
            preferred_locations: [],
            preferred_industries: [],
            preferred_noc_codes: [],
            preferred_company_tiers: [],
        };

        const candidates = await getCandidateJobs(effectivePreferences, recentSearches || []);

        // 5. Score each candidate
        const scoredRecommendations = candidates.map((job) => {
            const scoring = scoreJob(job, effectivePreferences, savedJobs || [], recentSearches || []);
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
 * Get candidate jobs based on user preferences and recent activity
 */
async function getCandidateJobs(
    preferences: UserPreferences,
    recentSearches: any[] = []
): Promise<any[]> {
    const candidates: any[] = [];

    // Extract unique keywords from recent searches
    const searchKeywords = recentSearches
        .map(s => s.keyword)
        .filter(k => k && k.length > 2 && !k.startsWith('__job_view__')) // Filter out short keywords and internal tracking
        .map(k => k.trim());

    // De-duplicate keywords
    const uniqueKeywords = [...new Set(searchKeywords)];

    // For trending_job, we select limited fields. For lmia, we select what's available
    let trendingQuery = db.from('trending_job').select('id, job_title, operating_name, employer, city, state, noc_code').limit(500);
    let lmiaQuery = db.from('lmia').select('*').limit(500);

    // Filter by job titles OR search keywords
    const titleFilters = [];

    if (preferences.preferred_job_titles?.length > 0) {
        titleFilters.push(...preferences.preferred_job_titles);
    }

    if (uniqueKeywords.length > 0) {
        titleFilters.push(...uniqueKeywords);
    }

    // Filter by Job Title / Keywords (Primary Strategy)
    const hasTitleFilters = titleFilters.length > 0;

    if (hasTitleFilters) {
        // If we have specific job titles/keywords, use them as the primary filter
        // We DO NOT filter by location here to ensure we find matches even if they are in different provinces
        // The scoring algorithm will prioritize local matches higher
        const conditions = titleFilters
            .map(term => `job_title.ilike.%${term}%`)
            .join(',');
        lmiaQuery = lmiaQuery.or(conditions);
    } else if (preferences.preferred_industries?.length > 0) {
        // Fallback to Industry matching if no titles (Secondary Strategy)
        // Again, prioritized over location to ensure role fit
        // Note: LMIA data often lacks explicit "industry" field, so this might rely on NAICS logic or be skipped
        // For now, we'll try to match NAICS_Title if available or skip
        // (Assuming LMIA records have a way to match industry - often they don't directly, but let's keep placeholder)
    }

    // Only apply Strict Location/NOC/TEER filters if we lack specific Title/Industry preferences
    // This prevents over-filtering where "Cook in Toronto" returns 0 because only "Cook in Vancouver" exists
    if (!hasTitleFilters && !preferences.preferred_industries?.length) {
        if (preferences.preferred_provinces?.length > 0) {
            lmiaQuery = lmiaQuery.in('territory', preferences.preferred_provinces);
        }

        if (preferences.preferred_cities?.length > 0) {
            lmiaQuery = lmiaQuery.in('city', preferences.preferred_cities);
        }

        if (preferences.preferred_noc_codes?.length > 0) {
            lmiaQuery = lmiaQuery.in('noc_code', preferences.preferred_noc_codes);
        }

        // Filter by TEER if specified (assuming 'Teer' column exists OR using NOC pattern)
        if (preferences.preferred_teer_categories?.length > 0) {
            // For now assuming we can query 'Teer' column directly or we might need a complex OR condition on NOC
            // Let's assume 'Teer' column works for now based on recent API updates
            lmiaQuery = lmiaQuery.in('tier', preferences.preferred_teer_categories);
        }
    }

    const { data: lmiaJobs } = await lmiaQuery;
    if (lmiaJobs) {
        candidates.push(
            ...lmiaJobs.map((job) => ({ ...job, source: 'lmia', id: job.RecordID }))
        );
    }

    // Fetch from trending jobs
    trendingQuery = db.from('trending_job').select('*').limit(500);

    // Apply similar logic for trending jobs
    if (hasTitleFilters) {
        const conditions = titleFilters
            .map(term => `job_title.ilike.%${term}%`)
            .join(',');
        trendingQuery = trendingQuery.or(conditions);
    } else if (preferences.preferred_industries?.length > 0) {
        const industryConditions = preferences.preferred_industries
            .map(ind => `industry.ilike.%${ind}%`)
            .join(',');
        trendingQuery = trendingQuery.or(industryConditions);
    }

    // Only strict filter by location/TEER if no title/industry prefs
    if (!hasTitleFilters && !preferences.preferred_industries?.length) {
        if (preferences.preferred_provinces?.length > 0) {
            trendingQuery = trendingQuery.in('state', preferences.preferred_provinces);
        }

        if (preferences.preferred_cities?.length > 0) {
            trendingQuery = trendingQuery.in('city', preferences.preferred_cities);
        }

        // Add TEER filter for trending jobs (assuming column 'teer')
        if (preferences.preferred_teer_categories?.length > 0) {
            trendingQuery = trendingQuery.in('teer', preferences.preferred_teer_categories);
        }
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
            jobTitle.includes(prefTitle.replace(/_/g, ' ').toLowerCase())
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
        const jobCity = (job.city || '').toLowerCase();
        const jobProvince = (job.territory || job.province || '').toLowerCase();

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

    // 4. NOC Code Match (weight: 0.25)
    if (preferences.preferred_noc_codes?.length > 0) {
        const jobNoc = String(job.noc_code || job.noc || '');
        if (preferences.preferred_noc_codes.includes(jobNoc)) {
            score += 0.25;
            reasons.push(`Matches NOC code ${jobNoc}`);
        }
    }

    // 5. TEER Category Match (weight: 0.15)
    // Try to find TEER in job data or infer from NOC (2nd digit in NOC 2021 usually indicates TEER)
    // NOTE: This assumes database has a 'Teer' column or we can parse it.
    if (preferences.preferred_teer_categories?.length > 0) {
        let jobTeer = String(job.Teer || job.teer || '');

        // If no explicit TEER field, try to derive from NOC if it's a 5-digit 2021 NOC
        if (!jobTeer && (job.noc_code || job.noc)) {
            const noc = String(job.noc_code || job.noc);
            if (noc.length === 5) {
                jobTeer = noc.charAt(1); // 2nd digit is often TEER-related in 2021 system
            }
        }

        if (preferences.preferred_teer_categories.includes(jobTeer)) {
            score += 0.15;
            reasons.push(`Matches your preferred TEER category`);
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
    const jobText = `${job.job_title || ''} ${job.employer || ''}`.toLowerCase();
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

