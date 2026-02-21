
import db from '@/db';

export interface Suggestion {
    suggestion: string;
    field?: string;
    hits?: number;
}

export async function suggestTrending(query: string, field: string = 'all', limit: number = 10): Promise<Suggestion[]> {
    const { data, error } = await db.rpc('suggest_trending_job', {
        p_field: field,
        p_q: query,
        p_limit: limit
    });

    if (error) {
        console.error("Error fetching trending suggestions:", error);
        return [];
        // or throw error depending on error handling strategy, returning empty array is safer for UI
    }

    return (data as Suggestion[]) || [];
}

export async function suggestLmia(query: string, field: string = 'all', limit: number = 10): Promise<Suggestion[]> {
    // Using the same RPC signature assumption as trending for now, 
    // or 'suggest_lmia' if it matches the pattern in use-job-search.ts
    const { data, error } = await db.rpc('suggest_lmia', {
        p_field: field,
        p_q: query,
        p_limit: limit
    });

    if (error) {
        console.error("Error fetching LMIA suggestions:", error);
        return [];
    }

    return (data as Suggestion[]) || [];
}
