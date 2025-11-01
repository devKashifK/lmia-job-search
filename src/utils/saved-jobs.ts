import db from '@/db';
import { toast } from 'sonner';

export interface SavedJobsUtils {
  handleSave: (recordID: string, session: any) => Promise<any>;
  checkIfSaved: (recordID: string, session: any) => Promise<boolean>;
  checkMultipleSavedJobs: (
    recordIDs: string[],
    session: any
  ) => Promise<Set<string>>;
}

/**
 * Save or unsave a job in the database
 * Returns { requiresLogin: true } if user is not logged in
 */
export const handleSave = async (recordID: string, session: any) => {
  if (!recordID) {
    console.error('Missing recordID');
    return { error: 'Missing record ID' };
  }

  // Check if user is logged in
  if (!session?.user?.id) {
    return { requiresLogin: true };
  }

  try {
    const isSaved = await checkIfSaved(recordID, session);

    if (isSaved) {
      // Remove from saved jobs
      const { error } = await db
        .from('saved_jobs')
        .delete()
        .eq('record_id', recordID)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to remove job from saved jobs');
        return;
      }

      toast.success('Job removed from your saved jobs');
      return { action: 'removed', saved: false };
    } else {
      // Add to saved jobs
      const { error } = await db.from('saved_jobs').insert({
        record_id: recordID,
        user_id: session.user.id,
        created_at: new Date().toISOString(), // Explicitly set timestamp
      });

      if (error) {
        console.error('Error saving job:', error);
        toast.error('Failed to save job');
        return;
      }

      toast.success('Job saved to your saved jobs');
      return { action: 'saved', saved: true };
    }
  } catch (error) {
    console.error('Error in handleSave:', error);
    toast.error('Something went wrong. Please try again.');
  }
};

/**
 * Check if a single job is saved
 */
export const checkIfSaved = async (
  recordID: string,
  session: any
): Promise<boolean> => {
  if (!recordID || !session?.user?.id) {
    return false;
  }

  try {
    const { data, error } = await db
      .from('saved_jobs')
      .select('record_id')
      .eq('record_id', recordID)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error checking if job is saved:', error);
      return false;
    }

    return data && data.length > 0 && data[0].record_id === recordID;
  } catch (error) {
    console.error('Error in checkIfSaved:', error);
    return false;
  }
};

/**
 * Check multiple jobs at once and return a Set of saved record IDs
 */
export const checkMultipleSavedJobs = async (
  recordIDs: string[],
  session: any
): Promise<Set<string>> => {
  if (!recordIDs.length || !session?.user?.id) {
    return new Set();
  }

  try {
    const { data, error } = await db
      .from('saved_jobs')
      .select('record_id')
      .in('record_id', recordIDs)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error checking multiple saved jobs:', error);
      return new Set();
    }

    return new Set(data.map((item) => item.record_id));
  } catch (error) {
    console.error('Error in checkMultipleSavedJobs:', error);
    return new Set();
  }
};

/**
 * Get the record ID from a job object
 */
export const getJobRecordId = (job: any): string | undefined => {
  // Convert to string since database expects string IDs
  const id = job?.id || job?.RecordID || job?.record_id;
  return id ? String(id) : undefined;
};
