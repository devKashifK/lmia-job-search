import db from '@/db';

export interface UserPreferences {
    user_id?: string;
    preferred_job_titles: string[];
    preferred_locations: string[]; // Actual column in DB
    preferred_industries: string[];
    preferred_noc_codes: string[];
    preferred_company_tiers: string[];
    created_at?: string;
    updated_at?: string;
}

export interface UserProfile {
    user_id?: string;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    website?: string | null;
    linkedin?: string | null;
    position?: string | null;
    company?: string | null;
    bio?: string | null;
    experience?: string | null;
    skills?: string | null;
    education?: string | null;
    work_history?: string | null;
    created_at?: string;
    updated_at?: string;
}

export const DEFAULT_PROFILE: UserProfile = {};

export const DEFAULT_PREFERENCES: UserPreferences = {
    preferred_job_titles: [],
    preferred_locations: [],
    preferred_industries: [],
    preferred_noc_codes: [],
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
    // 1. Try to get existing preferences to avoid clearing fields during partial update/upsert
    const { data: existing } = await db
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    // 2. Perform the upsert with merged data
    const { data, error } = await (db.from('user_preferences') as any)
        .upsert({ 
            user_id: userId, 
            ...(existing || {}), 
            ...preferences,
            updated_at: new Date().toISOString() 
        }, { onConflict: 'user_id' })
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

/**
 * Get profile for a user
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await db
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return DEFAULT_PROFILE;
        throw error;
    }

    return data || DEFAULT_PROFILE;
}

/**
 * Upsert (create or update) user profile
 */
export async function upsertUserProfile(userId: string, profile: Partial<UserProfile>) {
    // 1. Try to get existing profile to avoid clearing fields during partial update
    const { data: existing } = await db
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    // 2. Perform the upsert with merged data
    const { data, error } = await (db.from('user_profiles') as any)
        .upsert({ 
            user_id: userId, 
            ...(existing || {}), 
            ...profile,
            updated_at: new Date().toISOString() 
        }, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
}
