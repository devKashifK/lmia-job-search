-- Add 'agency' to plan_type enum if it doesn't already exist
-- We can use a DO block for safely adding value to enum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'plan_type' AND e.enumlabel = 'agency'
    ) THEN
        ALTER TYPE public.plan_type ADD VALUE 'agency';
    END IF;
END $$;

-- Agency Clients Table
CREATE TABLE IF NOT EXISTS public.agency_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    urn TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    resume_url TEXT,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_agency_urn UNIQUE (urn)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_agency_clients_agency_id ON public.agency_clients(agency_id);

-- Enable RLS
ALTER TABLE public.agency_clients ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'agency_clients' AND policyname = 'Agencies can manage their own clients'
    ) THEN
        CREATE POLICY "Agencies can manage their own clients"
        ON public.agency_clients
        FOR ALL
        TO authenticated
        USING (auth.uid() = agency_id)
        WITH CHECK (auth.uid() = agency_id);
    END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_agency_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_agency_clients_updated_at ON public.agency_clients;
CREATE TRIGGER set_agency_clients_updated_at
BEFORE UPDATE ON public.agency_clients
FOR EACH ROW
EXECUTE FUNCTION public.handle_agency_clients_updated_at();

-- Bucket for agency resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-resumes', 'agency-resumes', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage
CREATE POLICY "Agencies can only access their own resumes"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'agency-resumes' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'agency-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Comment on columns for clarity
COMMENT ON TABLE public.agency_clients IS 'Store client records managed by agencies';
COMMENT ON COLUMN public.agency_clients.urn IS 'Unique identifier for the client case';
COMMENT ON COLUMN public.agency_clients.extracted_data IS 'Structured resume data including education, work experience, and personal details';
