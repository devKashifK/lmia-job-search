import db from '@/db';

/**
 * Get all saved job IDs for a user
 */
export async function getSavedJobIds(userId: string): Promise<string[]> {
    const { data, error } = await (db as any)
        .from('saved_jobs')
        .select('record_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching saved job IDs:', error);
        return [];
    }
    return ((data as any[]) ?? []).map((r) => r.record_id);
}

/**
 * Check if a specific job is saved by the user
 */
export async function isJobSaved(recordId: string, userId: string): Promise<boolean> {
    if (!recordId || !userId) return false;

    const { data, error } = await (db as any)
        .from('saved_jobs')
        .select('record_id')
        .eq('record_id', recordId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error checking if job is saved:', error);
        return false;
    }
    return ((data as any[])?.length ?? 0) > 0;
}

/**
 * Check multiple jobs and return a Set of saved record IDs.
 * Uses batching or fetches all saved IDs to avoid exceeding URL length limits.
 */
export async function getSavedJobSet(recordIds: string[], userId: string): Promise<Set<string>> {
    if (!recordIds.length || !userId) return new Set();

    // If checking a small number of IDs, use .in() - it's fast.
    // If checking many IDs, it's safer and more efficient to just fetch all the user's saved IDs
    // and check against them locally, avoiding massive URL strings.
    if (recordIds.length < 50) {
        const { data, error } = await (db as any)
            .from('saved_jobs')
            .select('record_id')
            .in('record_id', recordIds)
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching saved job set:', error);
            return new Set();
        }
        return new Set(((data as any[]) ?? []).map((r) => r.record_id));
    }

    // fallback for large sets: just get everything this user has saved
    // This is much safer than building a 10KB URL string.
    const allSavedIds = await getSavedJobIds(userId);
    const idSet = new Set(allSavedIds);
    
    // Filter to only return the ones requested
    return new Set(recordIds.filter(id => idSet.has(id)));
}

/**
 * Save a job for a user
 */
export async function saveJob(recordId: string, userId: string): Promise<void> {
    const { error } = await (db as any).from('saved_jobs').insert({
        record_id: recordId,
        user_id: userId,
        created_at: new Date().toISOString(),
    });
    if (error) throw error;
}

/**
 * Unsave (delete) a job for a user
 */
export async function unsaveJob(recordId: string, userId: string): Promise<void> {
    const { error } = await (db as any)
        .from('saved_jobs')
        .delete()
        .eq('record_id', recordId)
        .eq('user_id', userId);
    if (error) throw error;
}

/**
 * Get full saved jobs with their data from lmia or trending_job
 */
export async function getSavedJobsWithData(userId: string): Promise<any[]> {
    const { data: savedJobsData, error } = await (db as any)
        .from('saved_jobs')
        .select('record_id')
        .eq('user_id', userId);

    if (error) throw error;
    if (!savedJobsData || (savedJobsData as any[]).length === 0) return [];

    const jobsWithData = await Promise.all(
        (savedJobsData as any[]).map(async (savedJob) => {
            const { data: lmiaData, error: lmiaError } = await (db as any)
                .from('lmia')
                .select('*')
                .eq('RecordID', savedJob.record_id)
                .single();

            if (!lmiaError && lmiaData) {
                return { ...(lmiaData as any), type: 'lmia' };
            }

            const { data: trendingJobData, error: trendingJobError } = await (db as any)
                .from('trending_job')
                .select('*')
                .eq('id', savedJob.record_id)
                .single();

            if (!trendingJobError && trendingJobData) {
                return {
                    ...(trendingJobData as any),
                    type: 'hotLeads',
                    operating_name: (trendingJobData as any).employer,
                    JobTitle: (trendingJobData as any).job_title,
                };
            }

            return null;
        })
    );

    return jobsWithData.filter(Boolean);
}
