-- 1. Ensure the job_alerts table exists
CREATE TABLE IF NOT EXISTS public.job_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    frequency TEXT DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add column to support Agency-led alerts and client matching
ALTER TABLE public.job_alerts 
ADD COLUMN IF NOT EXISTS client_urn TEXT REFERENCES public.agency_clients(urn);

-- 3. Update RLS (Policies often exist, but ensuring coverage)
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own job alerts"
    ON public.job_alerts 
    USING (auth.uid() = user_id);
