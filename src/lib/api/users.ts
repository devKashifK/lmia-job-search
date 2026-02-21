import db from '@/db';

export interface UserPreferences {
    user_id?: string;
    preferred_job_titles: string[];
    preferred_locations: string[];
    // Legacy aliases (kept for backwards compatibility with existing components)
    preferred_provinces?: string[];
    preferred_cities?: string[];
    preferred_industries: string[];
    preferred_noc_codes: string[];
    preferred_teer_categories?: string[];
    preferred_company_tiers: string[];
    salary_min?: number;
    salary_max?: number;
    work_authorization?: string[];
    remote_preference?: string;
    experience_level?: string[];
    company_size_preference?: string;
    created_at?: string;
    updated_at?: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
    preferred_job_titles: [],
    preferred_locations: [],
    preferred_provinces: [],
    preferred_cities: [],
    preferred_industries: [],
    preferred_noc_codes: [],
    preferred_teer_categories: [],
    preferred_company_tiers: [],
};

/**
 * Get preferences for a user
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = await db
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        // No record yet — return defaults
        if (error.code === 'PGRST116') return DEFAULT_PREFERENCES;
        throw error;
    }

    return data || DEFAULT_PREFERENCES;
}

/**
 * Upsert (create or update) user preferences
 */
export async function upsertUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
    const { data, error } = await db
        .from('user_preferences')
        .upsert({ user_id: userId, ...preferences }, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Track a visitor
 */
export async function trackVisitor(visitorData: Record<string, any>): Promise<void> {
    const { error } = await db.from('visitors').insert(visitorData);
    if (error) console.error('Error tracking visitor:', error);
}
