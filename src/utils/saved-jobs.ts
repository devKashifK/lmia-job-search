/**
 * Saved-jobs utility — re-exports from centralized API for backwards compatibility.
 * Components should import from '@/lib/api/saved-jobs' directly going forward.
 */
export { saveJob, unsaveJob, isJobSaved as checkIfSaved } from '@/lib/api/saved-jobs';

import { isJobSaved, saveJob, unsaveJob, getSavedJobSet } from '@/lib/api/saved-jobs';
import { toast } from 'sonner';

export interface SavedJobsUtils {
  handleSave: (recordID: string, session: any) => Promise<any>;
  checkIfSaved: (recordID: string, session: any) => Promise<boolean>;
  checkMultipleSavedJobs: (recordIDs: string[], session: any) => Promise<Set<string>>;
}

export const checkMultipleSavedJobs = async (recordIDs: string[], session: any) => {
  if (!recordIDs?.length || !session?.user?.id) return new Set<string>();

  try {
    return await getSavedJobSet(recordIDs, session.user.id);
  } catch (error) {
    console.error('Error in checkMultipleSavedJobs:', error);
    return new Set<string>();
  }
};

/**
 * Save or unsave a job in the database
 */
export const handleSave = async (recordID: string, session: any) => {
  if (!recordID) return { error: 'Missing record ID' };
  if (!session?.user?.id) return { requiresLogin: true };

  try {
    const saved = await isJobSaved(recordID, session.user.id);
    if (saved) {
      await unsaveJob(recordID, session.user.id);
      toast.success('Job removed from your saved jobs');
      return { action: 'removed', saved: false };
    } else {
      await saveJob(recordID, session.user.id);
      toast.success('Job saved to your saved jobs');
      return { action: 'saved', saved: true };
    }
  } catch (error) {
    console.error('Error in handleSave:', error);
    toast.error('Something went wrong. Please try again.');
  }
};

/**
 * Get the record ID from a job object
 */
export const getJobRecordId = (job: any): string | undefined => {
  const id = job?.id || job?.RecordID || job?.record_id;
  return id ? String(id) : undefined;
};
