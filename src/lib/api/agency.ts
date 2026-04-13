import db from "@/db";

export interface AgencyProfile {
  id: string;
  company_name: string;
  website: string | null;
  logo_url: string | null;
  brand_color: string;
  office_address: string | null;
  license_number: string | null;
  contact_name: string | null;
  contact_email: string | null;
  specialization: string | null;
  experience_years: number | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  updated_at: string;
}

export const DEFAULT_AGENCY_PROFILE: AgencyProfile = {
  id: '',
  company_name: '',
  website: null,
  logo_url: null,
  brand_color: '#059669',
  office_address: null,
  license_number: null,
  contact_name: null,
  contact_email: null,
  specialization: null,
  experience_years: null,
  linkedin_url: null,
  twitter_url: null,
  updated_at: new Date().toISOString(),
};

export async function getAgencyProfile(userId: string): Promise<AgencyProfile> {
  const { data, error } = await (db.from('agency_profiles') as any)
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    // If the table is missing (PGRST205) or schema out of sync, log and return default
    if (error.code === 'PGRST205' || error.code === 'PGRST204') {
        console.warn(`[api/agency] Profile table missing or unreachable. Using default for ${userId}.`);
        return { ...DEFAULT_AGENCY_PROFILE, id: userId };
    }
    console.error(`[api/agency] Profile fetch error [${error.code}]:`, error.message);
    throw error;
  }

  // 2. If record exists, return it
  if (data) return data;

  // 3. Fallback: Self-Healing
  // If no record exists, we return a default, but also attempt a silent initialization
  // to ensure future requests (and RLS) work correctly.
  console.warn(`[api/agency] Profile missing for ${userId}. Initializing default...`);
  
  const defaultProfile = { ...DEFAULT_AGENCY_PROFILE, id: userId };
  
  try {
    // Attempt a silent insert to heal the DB state
    const { data: newData, error: upsertError } = await (db.from('agency_profiles') as any)
      .upsert({ id: userId, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (!upsertError && newData) {
        console.log(`[api/agency] Profile healed for ${userId}`);
        return newData;
    }
  } catch (e) {
    // If healing fails (e.g. RLS blocks insert), just return the memory-default
    console.error(`[api/agency] Silent healing failed for ${userId}:`, e);
  }

  return defaultProfile;
}

export async function upsertAgencyProfile(userId: string, profile: Partial<AgencyProfile>) {
  const { data, error } = await (db.from('agency_profiles') as any)
    .upsert({
      id: userId,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Agency Clients Support ---

export interface AgencyClient {
  id: string;
  agency_id: string;
  urn: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  resume_url: string | null;
  extracted_data: any;
  status: string;
  outreach_log?: any[];
  internal_notes?: string | null; // Keep for legacy/typing, but we'll use extracted_data
  strategy_roadmap?: any;
  created_at: string;
  updated_at: string;
}

export async function getAgencyClients(agencyId: string): Promise<AgencyClient[]> {
  const { data, error } = await (db.from('agency_clients') as any)
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAgencyClient(clientId: string): Promise<AgencyClient> {
  const { data, error } = await (db.from('agency_clients') as any)
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) throw error;
  return data;
}

export interface ClientStrategy {
  client_urn: string;
  agency_id: string;
  internal_notes: string | null;
  strategy_roadmap: any;
  interview_questions: any[] | null;
  updated_at: string;
}

export async function getClientStrategy(urn: string): Promise<ClientStrategy | null> {
  const { data, error } = await (db.from('agency_client_strategies') as any)
    .select('*')
    .eq('client_urn', urn)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function updateClientStrategy(urn: string, agencyId: string, updates: Partial<ClientStrategy>): Promise<ClientStrategy> {
  const { data, error } = await (db.from('agency_client_strategies') as any)
    .upsert({
      client_urn: urn,
      agency_id: agencyId,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAgencyClient(clientId: string, updates: Partial<AgencyClient>): Promise<AgencyClient> {
  const { internal_notes, strategy_roadmap, ...rest } = updates;
  
  // If strategy fields are provided directly in updates, they must be merged into extracted_data
  // but it's better to let the component handle the merge to keep this function clean and fast.
  const { data, error } = await (db.from('agency_clients') as any)
    .update({
      ...rest,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAgencyClient(clientId: string): Promise<void> {
  const { error } = await (db.from('agency_clients') as any)
    .delete()
    .eq('id', clientId);

  if (error) throw error;
}
