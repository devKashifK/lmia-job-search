import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface AgencyAlert {
  id: string;
  name: string;
  criteria: any;
  frequency: string;
  is_active: boolean;
  client_urn: string;
}

export function useAgencyAlerts(clientUrn?: string) {
  const [alerts, setAlerts] = useState<AgencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchAlerts = useCallback(async () => {
    if (!clientUrn) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('client_urn', clientUrn);

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching agency alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clientUrn, supabase]);

  const toggleAlert = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase
        .from('job_alerts') as any)
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
    } catch (err) {
      console.error('Error toggling alert:', err);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase.from('job_alerts').delete().eq('id', id);
      if (error) throw error;
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  const createAlert = async (params: { name: string, criteria: any, frequency: string, clientUrn: string }) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { error } = await (supabase.from('job_alerts') as any).insert({
            user_id: user.id,
            name: params.name,
            criteria: params.criteria,
            frequency: params.frequency,
            client_urn: params.clientUrn,
            is_active: true
        });

        if (error) throw error;
        await fetchAlerts();
        return { success: true };
    } catch (err) {
        console.error('Error creating alert:', err);
        return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, isLoading, toggleAlert, deleteAlert, createAlert, refresh: fetchAlerts };
}
