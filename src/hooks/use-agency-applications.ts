import { useState, useEffect, useCallback } from 'react';
import db from '@/db';
import { useSession } from './use-session';

export interface AgencyApplication {
  id: string;
  job_id: string;
  job_title: string;
  employer_name: string;
  status: string;
  created_at: string;
  client_urn: string;
  city?: string;
  state?: string;
}

export const APPLICATION_STATUSES = ['applied', 'screening', 'interview', 'offered', 'rejected'] as const;
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];

export function useAgencyApplications(clientUrn?: string) {
  const [applications, setApplications] = useState<AgencyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session, user } = useSession();

  const fetchApplications = useCallback(async () => {
    if (!clientUrn || !user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch ALL applications for this agency (identical to Global View path)
      const { data, error } = await (db as any)
        .from('job_applications')
        .select('*')
        .eq('agency_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch applications error:', error);
        setError(error.message);
        throw error;
      }

      // 2. Filter LOCALLY by clientUrn (case-insensitive)
      // This ensures 100% consistency with the client's profile
      const allApps = (data || []) as any[];
      const filtered = allApps.filter(app => {
          if (!app.client_urn) return false;
          const appUrn = String(app.client_urn).toLowerCase();
          const targetUrn = clientUrn.toLowerCase();
          return appUrn === targetUrn || 
                 appUrn.includes(targetUrn) ||
                 targetUrn.includes(appUrn);
      });

      setApplications(filtered);
    } catch (err: any) {
      console.error('Error fetching agency applications:', err);
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  }, [clientUrn, user?.id]);

  const updateApplicationStatus = useCallback(async (id: string, status: ApplicationStatus) => {
    // Optimistic update
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    try {
      const { error } = await (db as any)
        .from('job_applications')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating application status:', err);
      // Revert on error
      fetchApplications();
    }
  }, [fetchApplications]);

  useEffect(() => {
    if (clientUrn && user?.id) {
      fetchApplications();
    }
  }, [clientUrn, user?.id, fetchApplications]);

  return { 
    applications, 
    isLoading, 
    error, 
    refresh: fetchApplications, 
    updateApplicationStatus 
  };
}

