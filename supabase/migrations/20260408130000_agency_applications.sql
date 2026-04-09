-- 1. Ensure the job_applications table exists (standard user applications)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    job_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    noc_code TEXT,
    employer_name TEXT,
    city TEXT,
    state TEXT,
    table_name TEXT,
    status TEXT DEFAULT 'applied',
    review_status TEXT,
    posted_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add columns to support Agency-led applications
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS client_urn TEXT REFERENCES public.agency_clients(urn);

-- 3. Update RLS for job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Standard Users can see their own applications
CREATE POLICY "Users can view own applications"
    ON public.job_applications FOR SELECT
    USING (auth.uid() = user_id);

-- Agencies can see applications they submitted for clients
CREATE POLICY "Agencies can view their client applications"
    ON public.job_applications FOR SELECT
    USING (auth.uid() = agency_id);

-- Standard Users can submit their own applications
CREATE POLICY "Users can insert own applications"
    ON public.job_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Agencies can submit applications for their clients
CREATE POLICY "Agencies can insert client applications"
    ON public.job_applications FOR INSERT
    WITH CHECK (auth.uid() = agency_id);
