/**
 * Track-search utility — re-exports from centralized API for backwards compatibility.
 * Components should import from '@/lib/api/searches' directly going forward.
 */
export {
    insertSearch as trackSearch,
    trackJobView,
    getRecentSearches,
} from '@/lib/api/searches';

// Legacy wrapper matching old signature for backwards compatibility
import { insertSearch } from '@/lib/api/searches';

export interface TrackSearchParams {
    userId: string;
    keyword: string;
    filters?: Record<string, any>;
    resultsCount?: number;
}

export async function trackSearchLegacy({
    userId,
    keyword,
    filters,
    resultsCount,
}: TrackSearchParams): Promise<void> {
    try {
        await insertSearch({
            id: userId,
            keyword,
            ...(filters && Object.keys(filters).length ? { filters } : {}),
            ...(resultsCount !== undefined ? { results_count: resultsCount } : {}),
        });
    } catch (error) {
        console.error('Error in trackSearch:', error);
    }
}
