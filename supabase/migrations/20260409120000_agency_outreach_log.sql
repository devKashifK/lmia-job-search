-- Add outreach_log to agency_clients to track recruiter interactions with employers
ALTER TABLE public.agency_clients 
ADD COLUMN IF NOT EXISTS outreach_log JSONB DEFAULT '[]'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN public.agency_clients.outreach_log IS 'Stores a chronological log of agency interactions with employers (calls, emails, submissions)';
