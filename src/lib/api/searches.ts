import db from '@/db';

export interface SearchRecord {
    id: string; // The user ID
    keyword: string;
    search_id?: number | string;
    save?: boolean;
    filters?: Record<string, any>;
    results_count?: number;
}

/**
 * Insert a new search record
 */
export async function insertSearch(record: SearchRecord): Promise<{ search_id?: number | string }> {
    const { data, error } = await db
        .from('searches')
        .insert(record)
        .select('search_id')
        .single();

    if (error) throw error;
    return data ?? {};
}

/**
 * Update the saved status of a search
 */
export async function updateSearchSaved(searchId: number | string, saved: boolean): Promise<void> {
    const { error } = await db
        .from('searches')
        .update({ save: saved })
        .eq('search_id', searchId);

    if (error) throw error;
}

/**
 * Get recent search history for a user
 */
export async function getRecentSearches(userId: string, limit = 10): Promise<string[]> {
    const { data, error } = await db
        .from('searches')
        .select('keyword')
        .eq('id', userId)
        .not('keyword', 'like', '__job_view__%')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return [...new Set((data ?? []).map((s) => s.keyword))];
}

/**
 * Get full search history list for a user (for dashboard)
 */
export async function getSearchHistory(userId: string) {
    const { data, error } = await db
        .from('searches')
        .select('*')
        .eq('id', userId)
        .not('keyword', 'like', '__job_view__%')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
}

/**
 * Track a job view (stored as a special search entry)
 */
export async function trackJobView(userId: string, jobId: string, jobSource: 'lmia' | 'trending_job'): Promise<void> {
    await db.from('searches').insert({
        id: userId,
        keyword: `__job_view__:${jobSource}:${jobId}`,
    });
}

/**
 * Get usage history of searches in a date range
 */
export async function getUsageHistoryList(userId: string, startDate: Date, endDate: Date) {
    const { data, error } = await db
        .from('searches')
        .select('created_at')
        .eq('id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (error) throw error;
    return data ?? [];
}

/**
 * Delete a specific search by its ID
 */
export async function deleteSearch(searchId: number | string): Promise<void> {
    const { error } = await db
        .from('searches')
        .delete()
        .eq('search_id', searchId);

    if (error) throw error;
}

/**
 * Clear all search history for a user
 */
export async function clearSearchHistory(userId: string): Promise<void> {
    const { error } = await db
        .from('searches')
        .delete()
        .eq('id', userId);

    if (error) throw error;
}

/**
 * Rename a search
 */
export async function renameSearch(searchId: number | string, newKeyword: string): Promise<void> {
    const { error } = await db
        .from('searches')
        .update({ keyword: newKeyword })
        .eq('search_id', searchId);

    if (error) throw error;
}
