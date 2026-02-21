
import db from '@/db';

export interface JobAlert {
    id: string; // The user ID
    name: string;
    criteria: any;
    frequency: 'daily' | 'weekly' | 'instant';
    is_active: boolean;
    created_at: string;
}

export async function getUserAlerts(userId: string): Promise<JobAlert[]> {
    const { data, error } = await db
        .from('job_alerts')
        .select('*')
        .eq('id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching alerts:', error);
        throw error;
    }

    return data as JobAlert[] || [];
}

export async function createAlert(alertData: Partial<JobAlert>): Promise<JobAlert | null> {
    const { data, error } = await db.from('job_alerts').insert(alertData).select().single();

    if (error) {
        console.error('Error creating alert:', error);
        throw error;
    }

    return data as JobAlert;
}

export async function deleteAlert(alertId: string): Promise<void> {
    const { error } = await db.from('job_alerts').delete().eq('id', alertId);

    if (error) {
        console.error('Error deleting alert:', error);
        throw error;
    }
}

export async function updateAlertStatus(alertId: string, isActive: boolean): Promise<void> {
    const { error } = await db.from('job_alerts').update({ is_active: isActive }).eq('id', alertId);

    if (error) {
        console.error('Error updating alert status:', error);
        throw error;
    }
}
