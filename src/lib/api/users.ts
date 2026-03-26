import db from '@/db';

export interface UserPreferences {
    user_id?: string;
    preferred_job_titles: string[];
    preferred_locations: string[];
    preferred_industries: string[];
    preferred_noc_codes: string[];
    preferred_company_tiers: string[];
    salary_min?: number | null;
    salary_max?: number | null;
    work_authorization?: string | null;
    remote_preference?: string | null;
    experience_level?: string | null;
    company_size_preference?: string[] | null;
    created_at?: string;
    updated_at?: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
    preferred_job_titles: [],
    preferred_locations: [],
    preferred_industries: [],
    preferred_noc_codes: [],
    preferred_company_tiers: [],
    salary_min: null,
    salary_max: null,
    work_authorization: null,
    remote_preference: null,
    experience_level: null,
    company_size_preference: [],
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
