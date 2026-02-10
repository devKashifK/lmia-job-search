import db from '@/db';

interface TrackSearchParams {
    userId: string;
    keyword: string;
    filters?: {
        location?: string;
        salary_min?: number;
        salary_max?: number;
        noc_code?: string;
        job_title?: string;
        city?: string;
        province?: string;
        [key: string]: any;
    };
    resultsCount?: number;
}

/**
 * Track user search queries for behavioral analysis and recommendations
 * Uses the existing searches table with optional enhanced columns
 */
export async function trackSearch({
    userId,
    keyword,
    filters,
    resultsCount,
}: TrackSearchParams): Promise<void> {
    try {
        // Insert into existing searches table
        const searchData: any = {
            id: userId, // User ID stored in 'id' column
            keyword: keyword,
            search_id: crypto.randomUUID(), // Generate unique search ID
        };

        // Add optional fields if they exist in the schema
        if (filters && Object.keys(filters).length > 0) {
            searchData.filters = filters;
        }

        if (resultsCount !== undefined) {
            searchData.results_count = resultsCount;
        }

        const { error } = await db.from('searches').insert(searchData);

        if (error) {
            // Log error but don't throw - tracking shouldn't break user experience
            console.error('Error tracking search:', error);
        }
    } catch (error) {
        console.error('Error in trackSearch:', error);
    }
}

/**
 * Track when a user views a job detail page
 */
export async function trackJobView(
    userId: string,
    jobId: string,
    jobSource: 'lmia' | 'trending_job'
): Promise<void> {
    try {
        // We could create a separate job_views table, but for now
        // we can track this as a search with special keyword
        await db.from('searches').insert({
            id: userId,
            keyword: `__job_view__:${jobSource}:${jobId}`,
            search_id: crypto.randomUUID(),
        });
    } catch (error) {
        console.error('Error tracking job view:', error);
    }
}

/**
 * Get recent search keywords for a user (for analytics/suggestions)
 */
export async function getRecentSearches(
    userId: string,
    limit: number = 10
): Promise<string[]> {
    try {
        const { data, error } = await db
            .from('searches')
            .select('keyword')
            .eq('id', userId)
            .not('keyword', 'like', '__job_view__%') // Exclude job view tracking
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Remove duplicates and return unique keywords
        const uniqueKeywords = [...new Set(data?.map((s) => s.keyword) || [])];
        return uniqueKeywords;
    } catch (error) {
        console.error('Error getting recent searches:', error);
        return [];
    }
}
