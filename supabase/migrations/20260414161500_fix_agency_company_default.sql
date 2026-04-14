-- Fix Not Null constraint violation for company_name during partial profile updates
-- This allows agency users a "zero-state" experience where they can update individual fields 
-- without hitting a hard constraint on company_name before they've set it.

ALTER TABLE public.agency_profiles 
    ALTER COLUMN company_name SET DEFAULT 'New Agency';

-- Optional: Ensure all current agency users have a profile row to prevent upsert issues
DO $$
BEGIN
    INSERT INTO public.agency_profiles (id, company_name)
    SELECT id, coalesce(raw_user_meta_data ->> 'name', 'New Agency')
    FROM auth.users
    WHERE (raw_user_meta_data ->> 'user_type') = 'agency'
    ON CONFLICT (id) DO NOTHING;
END $$;
