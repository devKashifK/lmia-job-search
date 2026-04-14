-- Fix RLS policies for agency_profiles and ensure schema coverage
-- This migration ensures authenticated agency users can perform upsert operations without violations.

-- 1. Ensure any missing columns from the pivot are definitely there
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agency_profiles' AND column_name='contact_name') THEN
        ALTER TABLE public.agency_profiles ADD COLUMN contact_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agency_profiles' AND column_name='contact_email') THEN
        ALTER TABLE public.agency_profiles ADD COLUMN contact_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agency_profiles' AND column_name='specialization') THEN
        ALTER TABLE public.agency_profiles ADD COLUMN specialization TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agency_profiles' AND column_name='experience_years') THEN
        ALTER TABLE public.agency_profiles ADD COLUMN experience_years INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agency_profiles' AND column_name='linkedin_url') THEN
        ALTER TABLE public.agency_profiles ADD COLUMN linkedin_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agency_profiles' AND column_name='twitter_url') THEN
        ALTER TABLE public.agency_profiles ADD COLUMN twitter_url TEXT;
    END IF;
END $$;

-- 2. Explicitly Grant Permissions to the authenticated role
GRANT ALL ON TABLE public.agency_profiles TO authenticated;
GRANT ALL ON TABLE public.agency_profiles TO service_role;

-- 3. Reset and harden RLS policies
DROP POLICY IF EXISTS "Agencies can view own profile" ON public.agency_profiles;
DROP POLICY IF EXISTS "Agencies can insert own profile" ON public.agency_profiles;
DROP POLICY IF EXISTS "Agencies can update own profile" ON public.agency_profiles;

-- SELECT policy: Owners can view their own profile
CREATE POLICY "Agencies can view own profile"
    ON public.agency_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- INSERT policy: Owners can insert their own profile
-- This is critical for the 'upsert' logic in the Supabase JS client
CREATE POLICY "Agencies can insert own profile"
    ON public.agency_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- UPDATE policy: Owners can update their own profile
CREATE POLICY "Agencies can update own profile"
    ON public.agency_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. Fix trigger transparency and robustness
CREATE OR REPLACE FUNCTION public.handle_new_agency_profile()
RETURNS trigger AS $$
BEGIN
    -- Only create profile if user_type is agency
    IF (new.raw_user_meta_data ->> 'user_type') = 'agency' THEN
        INSERT INTO public.agency_profiles (id, company_name)
        VALUES (
            new.id, 
            coalesce(new.raw_user_meta_data ->> 'name', 'New Agency')
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
