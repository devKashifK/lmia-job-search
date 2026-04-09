-- Create a dedicated table for agency client strategies linked by URN
-- This ensures that strategies persist even if the client record is modified or re-analyzed
CREATE TABLE IF NOT EXISTS public.agency_client_strategies (
    client_urn TEXT PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    internal_notes TEXT,
    strategy_roadmap JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookup performance
CREATE INDEX IF NOT EXISTS idx_agency_strategies_agency_id ON public.agency_client_strategies(agency_id);

-- Enable RLS
ALTER TABLE public.agency_client_strategies ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'agency_client_strategies' AND policyname = 'Agencies can manage their own client strategies'
    ) THEN
        CREATE POLICY "Agencies can manage their own client strategies"
        ON public.agency_client_strategies
        FOR ALL
        TO authenticated
        USING (auth.uid() = agency_id)
        WITH CHECK (auth.uid() = agency_id);
    END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_agency_client_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_agency_client_strategies_updated_at ON public.agency_client_strategies;
CREATE TRIGGER set_agency_client_strategies_updated_at
BEFORE UPDATE ON public.agency_client_strategies
FOR EACH ROW
EXECUTE FUNCTION public.handle_agency_client_strategies_updated_at();

-- Comment on table for clarity
COMMENT ON TABLE public.agency_client_strategies IS 'Store persistent strategic data for agency clients, keyed by URN to survive re-analysis';
