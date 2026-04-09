-- Create calculator_results table
CREATE TABLE IF NOT EXISTS public.calculator_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.agency_clients(id) ON DELETE CASCADE,
    calculator_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    inputs JSONB NOT NULL DEFAULT '{}',
    breakdown JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.calculator_results ENABLE ROW LEVEL SECURITY;

-- Policies for Candidates (own data only)
DROP POLICY IF EXISTS "Users can view own calculator results" ON public.calculator_results;
CREATE POLICY "Users can view own calculator results"
    ON public.calculator_results FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own calculator results" ON public.calculator_results;
CREATE POLICY "Users can insert own calculator results"
    ON public.calculator_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for Agencies
DROP POLICY IF EXISTS "Agency users can manage client calculator results" ON public.calculator_results;
CREATE POLICY "Agency users can manage client calculator results"
    ON public.calculator_results FOR ALL
    USING (client_id IS NOT NULL)
    WITH CHECK (client_id IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_calculator_results_updated_at ON public.calculator_results;
CREATE TRIGGER update_calculator_results_updated_at
    BEFORE UPDATE ON public.calculator_results
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
