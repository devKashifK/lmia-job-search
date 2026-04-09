import db from '@/db';

export interface JobApplication {
  id?: string;
  user_id?: string; // Optional for agency apps
  agency_id?: string; // Set for agency-led apps
  client_urn?: string; // Set for agency-led apps
  job_id: string | number;
  job_title: string;
  noc_code: string;
  employer_name: string;
  city: string;
  state: string;
  table_name: string;
  status: 'applied' | 'notified';
  review_status?: string;
  posted_link: string;
  created_at?: string;
}

/**
 * Submit a new job application
 */
export async function submitApplication(application: JobApplication) {
  const { data, error } = await (db as any)
    .from('job_applications')
    .insert([
      {
        user_id: application.user_id,
        agency_id: application.agency_id,
        client_urn: application.client_urn,
        job_id: application.job_id.toString(),
        job_title: application.job_title,
        noc_code: application.noc_code,
        employer_name: application.employer_name,
        city: application.city,
        state: application.state,
        table_name: application.table_name,
        status: application.status,
        review_status: application.review_status,
        posted_link: application.posted_link
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check if user has already applied for this job
 */
export async function checkApplicationStatus(userId: string, jobId: string | number) {
  const { data, error } = await (db as any)
    .from('job_applications')
    .select('*')
    .eq('user_id', userId)
    .eq('job_id', jobId.toString())
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Get all job applications for a user
 */
export async function getUserApplications(userId: string) {
  const { data, error } = await (db as any)
    .from('job_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as JobApplication[];
}

/**
 * Get all job applications submitted by an agency for their clients
 */
export async function getAgencyApplications(agencyId: string) {
  const { data, error } = await (db as any)
    .from('job_applications')
    .select('*, client:agency_clients!client_urn(*)')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as (JobApplication & { client?: any })[];
}
