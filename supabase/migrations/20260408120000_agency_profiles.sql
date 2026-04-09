-- 1. Create a table for agency firm-level identity
CREATE TABLE IF NOT EXISTS public.agency_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    website TEXT,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#059669', -- Default emerald-600
    office_address TEXT,
    license_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.agency_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Agencies can view and edit their own firm profile
CREATE POLICY "Agencies can view own profile"
    ON public.agency_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Agencies can insert own profile"
    ON public.agency_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Agencies can update own profile"
    ON public.agency_profiles FOR UPDATE
    USING (auth.uid() = id);

-- 4. Automatically create agency_profile entry on signup if role is agency
CREATE OR REPLACE FUNCTION public.handle_new_agency_profile()
RETURNS trigger AS $$
BEGIN
    IF (new.raw_user_meta_data ->> 'user_type') = 'agency' THEN
        INSERT INTO public.agency_profiles (id, company_name)
        VALUES (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'New Agency'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach trigger to auth.users
-- Note: Reusing the same auth trigger mechanism but in a separate function for clean separation
CREATE OR REPLACE TRIGGER on_auth_user_registration_agency_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_agency_profile();
