import { useState, useCallback } from 'react';
import { useSession } from '@/hooks/use-session';
import { handleSave, checkIfSaved } from '@/utils/saved-jobs';
import { useLoginAlert } from '@/components/ui/login-alert-dialog';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Centralized hook for job saving functionality
 * Handles authentication checks, save/unsave operations, and state management
 */
export function useSaveJob(recordId: string | undefined) {
  const { session } = useSession();
  const { showLoginAlert, LoginAlertComponent } = useLoginAlert();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Check if the job is saved
   */
  const checkSavedStatus = useCallback(async () => {
    if (!recordId || !session?.user?.id) {
      setIsSaved(false);
      return false;
    }

    try {
      const saved = await checkIfSaved(recordId, session);
      setIsSaved(saved);
      return saved;
    } catch (error) {
      console.error('Error checking if job is saved:', error);
      setIsSaved(false);
      return false;
    }
  }, [recordId, session]);

  /**
   * Toggle save/unsave job
   * Returns true if operation was successful, false if login required or error
   */
  const toggleSave = useCallback(async () => {
    if (!recordId) {
      console.warn('No record ID provided');
      return false;
    }

    setIsLoading(true);
    try {
      const result = await handleSave(recordId, session);

      // Check if login is required
      if (result?.requiresLogin) {
        showLoginAlert('Please log in to save jobs to your profile.');
        setIsLoading(false);
        return false;
      }

      // Update local state based on result
      if (result && typeof result.saved === 'boolean') {
        setIsSaved(result.saved);

        // Force refetch ALL queries to update immediately
        await Promise.all([
          queryClient.refetchQueries({
            queryKey: ['saved-jobs'],
            type: 'all',
          }),
          queryClient.refetchQueries({
            queryKey: ['recent-activity'],
            type: 'all',
          }),
        ]);

        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error toggling save status:', error);
      setIsLoading(false);
      return false;
    }
  }, [recordId, session, showLoginAlert, queryClient]);

  return {
    isSaved,
    isLoading,
    toggleSave,
    checkSavedStatus,
    LoginAlertComponent,
  };
  // Note: queryClient is stable and doesn't need to be in dependencies
}

/**
 * Hook for managing multiple saved jobs (for lists)
 */
export function useSaveJobList() {
  const { session } = useSession();
  const { showLoginAlert, LoginAlertComponent } = useLoginAlert();
  const queryClient = useQueryClient();
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Toggle save status for a job
   */
  const toggleSave = useCallback(
    async (recordId: string) => {
      if (!recordId) {
        console.warn('No record ID provided');
        return false;
      }

      setIsLoading(true);
      try {
        const result = await handleSave(recordId, session);

        // Check if login is required
        if (result?.requiresLogin) {
          showLoginAlert('Please log in to save jobs to your profile.');
          setIsLoading(false);
          return false;
        }

        // Update local state
        if (result) {
          setSavedJobs((prev) => {
            const newSet = new Set(prev);
            if (result.saved) {
              newSet.add(recordId);
            } else {
              newSet.delete(recordId);
            }
            return newSet;
          });

          // Force refetch ALL queries to update immediately
          await Promise.all([
            queryClient.refetchQueries({
              queryKey: ['saved-jobs'],
              type: 'all',
            }),
            queryClient.refetchQueries({
              queryKey: ['recent-activity'],
              type: 'all',
            }),
          ]);

          setIsLoading(false);
          return true;
        }

        setIsLoading(false);
        return false;
      } catch (error) {
        console.error('Error toggling save status:', error);
        setIsLoading(false);
        return false;
      }
    },
    [session, showLoginAlert, queryClient]
  );

  /**
   * Check if a specific job is saved
   */
  const isSaved = useCallback(
    (recordId: string) => {
      return savedJobs.has(recordId);
    },
    [savedJobs]
  );

  /**
   * Update saved jobs set (useful when loading from API)
   */
  const setSavedJobsSet = useCallback((jobs: Set<string>) => {
    setSavedJobs(jobs);
  }, []);

  return {
    savedJobs,
    isSaved,
    isLoading,
    toggleSave,
    setSavedJobs: setSavedJobsSet,
    LoginAlertComponent,
  };
}
