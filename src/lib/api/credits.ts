import db from '@/db';

/**
 * Get credit balance for a user
 */
export async function getUserCredits(userId: string) {
    const { data, error } = await db
        .from('credits')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get remaining credits for a user
 */
export async function getRemainingCredits(userId: string): Promise<number> {
    const data = await getUserCredits(userId);
    return (data?.total_credit ?? 0) - (data?.used_credit ?? 0);
}

/**
 * Increment used_credit by 1 for a user and return updated record
 */
export async function incrementUsedCredit(userId: string) {
    const { data: current, error: fetchError } = await db
        .from('credits')
        .select('used_credit')
        .eq('id', userId)
        .single();

    if (fetchError) throw fetchError;

    const { data, error } = await db
        .from('credits')
        .update({ used_credit: (current?.used_credit ?? 0) + 1 })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
