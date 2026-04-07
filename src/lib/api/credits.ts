import db from '@/db';

export interface CreditRecord {
    id: string;
    total_credit: number;
    used_credit: number;
    plan_type: string;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Get credit record for a user
 */
export async function getUserCredits(userId: string): Promise<CreditRecord | null> {
    const { data, error } = await db
        .from('credits')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No record found, return null instead of throwing
            return null;
        }
        throw error;
    }
    return data;
}

/**
 * Check if a plan provides unlimited searches and is not expired
 */
export function isUnlimitedPlan(credits: any): boolean {
    if (!credits) return false;
    
    // Check if plan type is unlimited
    const unlimitedPlans = ['weekly', 'monthly', 'starter', 'pro', 'advanced', 'enterprise', 'admin'];
    if (!unlimitedPlans.includes(credits.plan_type)) return false;

    // Check expiration if set
    if (credits.expires_at) {
        const expiryDate = new Date(credits.expires_at);
        if (expiryDate < new Date()) return false;
    }

    return true;
}

/**
 * Get remaining credits for a user. Returns Infinity if plan is unlimited.
 */
export async function getRemainingCredits(userId: string): Promise<number> {
    const data = await getUserCredits(userId);
    
    if (!data) return 0;
    
    if (isUnlimitedPlan(data)) {
        return Infinity;
    }

    return (data.total_credit ?? 0) - (data.used_credit ?? 0);
}

/**
 * Increment used_credit by a specified amount for a user and return updated record.
 * Bypasses increment if plan is unlimited.
 */
export async function incrementUsedCredit(userId: string, amount: number = 1) {
    const current = await getUserCredits(userId);
    if (!current) return null;

    // Don't increment if user has unlimited searches
    if (isUnlimitedPlan(current)) {
        return current;
    }

    const { data, error } = await (db as any)
        .from('credits')
        .update({ used_credit: (current.used_credit ?? 0) + amount })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Check if a user has sufficient credits or a premium plan, then consumes credits if not premium.
 * Returns true if successful (either premium or credits deducted).
 */
export async function consumeCreditsIfNoPremium(userId: string, amount: number): Promise<boolean> {
    const credits = await getUserCredits(userId);
    if (!credits) return false;

    // If on premium plan, return true immediately (unlimited access)
    if (isUnlimitedPlan(credits)) return true;

    const remaining = (credits.total_credit ?? 0) - (credits.used_credit ?? 0);
    if (remaining < amount) return false;

    // Deduct credits
    const updated = await incrementUsedCredit(userId, amount);
    return !!updated;
}

/**
 * Server-side verification for premium features
 */
export async function verifyPremiumAccess(userId: string): Promise<boolean> {
    const credits = await getUserCredits(userId);
    if (!credits) return false;

    // Check if plan type is premium
    const premiumPlans = ['weekly', 'monthly', 'starter', 'pro', 'advanced', 'enterprise', 'admin'];
    if (!premiumPlans.includes(credits.plan_type)) return false;

    // Check expiration
    if (credits.expires_at) {
        const expiryDate = new Date(credits.expires_at);
        if (expiryDate < new Date()) return false;
    }

    return true;
}
