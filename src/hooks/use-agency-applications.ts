import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

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
  const supabase = createClient();

  const fetchApplications = useCallback(async () => {
    if (!clientUrn) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('client_urn', clientUrn)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching agency applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clientUrn, supabase]);

  const updateApplicationStatus = useCallback(async (id: string, status: ApplicationStatus) => {
    // Optimistic update
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    try {
      const { error } = await (supabase as any)
        .from('job_applications')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating application status:', err);
      // Revert on error
      fetchApplications();
    }
  }, [supabase, fetchApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, isLoading, refresh: fetchApplications, updateApplicationStatus };
}

