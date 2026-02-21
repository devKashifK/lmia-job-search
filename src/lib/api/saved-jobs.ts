import db from '@/db';

/**
 * Get all saved job IDs for a user
 */
export async function getSavedJobIds(userId: string): Promise<string[]> {
    const { data, error } = await db
        .from('saved_jobs')
        .select('record_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching saved job IDs:', error);
        return [];
    }
    return (data ?? []).map((r) => r.record_id);
}

/**
 * Check if a specific job is saved by the user
 */
export async function isJobSaved(recordId: string, userId: string): Promise<boolean> {
    if (!recordId || !userId) return false;

    const { data, error } = await db
        .from('saved_jobs')
        .select('record_id')
        .eq('record_id', recordId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error checking if job is saved:', error);
        return false;
    }
    return (data?.length ?? 0) > 0;
}

/**
 * Check multiple jobs and return a Set of saved record IDs
 */
export async function getSavedJobSet(recordIds: string[], userId: string): Promise<Set<string>> {
    if (!recordIds.length || !userId) return new Set();

    const { data, error } = await db
        .from('saved_jobs')
        .select('record_id')
        .in('record_id', recordIds)
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching saved job set:', error);
        return new Set();
    }
    return new Set((data ?? []).map((r) => r.record_id));
}

/**
 * Save a job for a user
 */
export async function saveJob(recordId: string, userId: string): Promise<void> {
    const { error } = await db.from('saved_jobs').insert({
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
    const { error } = await db
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
    const { data: savedJobsData, error } = await db
        .from('saved_jobs')
        .select('record_id')
        .eq('user_id', userId);

    if (error) throw error;
    if (!savedJobsData || savedJobsData.length === 0) return [];

    const jobsWithData = await Promise.all(
        savedJobsData.map(async (savedJob) => {
            const { data: lmiaData, error: lmiaError } = await db
                .from('lmia')
                .select('*')
                .eq('RecordID', savedJob.record_id)
                .single();

            if (!lmiaError && lmiaData) {
                return { ...lmiaData, type: 'lmia' };
            }

            const { data: trendingJobData, error: trendingJobError } = await db
                .from('trending_job')
                .select('*')
                .eq('id', savedJob.record_id)
                .single();

            if (!trendingJobError && trendingJobData) {
                return {
                    ...trendingJobData,
                    type: 'hotLeads',
                    operating_name: trendingJobData.employer,
                    JobTitle: trendingJobData.job_title,
                };
            }

            return null;
        })
    );

    return jobsWithData.filter(Boolean);
}
