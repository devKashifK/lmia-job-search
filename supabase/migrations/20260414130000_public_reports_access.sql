-- Enable Public Access for White-Label Client Reports
-- Purpose: Allows candidates to view their own strategic reports using a secret URN link without logging in.

-- 1. Agency Profiles (for branding/logos on reports)
ALTER TABLE public.agency_profiles ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'agency_profiles' AND policyname = 'Public can view agency branding'
    ) THEN
        CREATE POLICY "Public can view agency branding" 
        ON public.agency_profiles FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- 2. Agency Clients (to fetch the candidate identity)
ALTER TABLE public.agency_clients ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'agency_clients' AND policyname = 'Public can view client via URN'
    ) THEN
        CREATE POLICY "Public can view client via URN" 
        ON public.agency_clients FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- 3. Agency Client Strategies (the roadmap itself)
ALTER TABLE public.agency_client_strategies ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'agency_client_strategies' AND policyname = 'Public can view strategy via URN'
    ) THEN
        CREATE POLICY "Public can view strategy via URN" 
        ON public.agency_client_strategies FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- 4. Job Applications (recent activity list)
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'job_applications' AND policyname = 'Public can view applications'
    ) THEN
        CREATE POLICY "Public can view applications" 
        ON public.job_applications FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- 5. Calculator Results (eligibility scores)
ALTER TABLE public.calculator_results ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'calculator_results' AND policyname = 'Public can view evaluation results'
    ) THEN
        CREATE POLICY "Public can view evaluation results" 
        ON public.calculator_results FOR SELECT TO anon USING (true);
    END IF;
END $$;

COMMENT ON TABLE public.agency_client_strategies IS 'Stores strategic roadmaps. Public SELECT enabled for unauthenticated report viewing.';
