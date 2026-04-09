-- Migration to pivot Agency Profile to operational data
ALTER TABLE public.agency_profiles 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- Comment on fields
COMMENT ON COLUMN public.agency_profiles.contact_name IS 'Primary business contact for the agency';
COMMENT ON COLUMN public.agency_profiles.contact_email IS 'Operational email for business inquiries';
COMMENT ON COLUMN public.agency_profiles.specialization IS 'Main industry or sector focus (e.g. Healthcare, Tech)';
COMMENT ON COLUMN public.agency_profiles.experience_years IS 'Number of years the agency has been operating';
