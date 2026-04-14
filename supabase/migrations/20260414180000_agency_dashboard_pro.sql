-- migration: 20260414180000_agency_dashboard_pro.sql

-- 1. Expand agency_profiles with white-label fields
ALTER TABLE public.agency_profiles 
ADD COLUMN IF NOT EXISTS legal_disclaimer TEXT,
ADD COLUMN IF NOT EXISTS privacy_policy TEXT;

-- 2. Expand agency_client_strategies with advisor notes and engagement stats
ALTER TABLE public.agency_client_strategies
ADD COLUMN IF NOT EXISTS advisor_notes TEXT,
ADD COLUMN IF NOT EXISTS engagement_stats JSONB DEFAULT '{}'::jsonb;

-- 3. Create engagement tracking table
CREATE TABLE IF NOT EXISTS public.agency_portal_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_urn TEXT NOT NULL,
    agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'page_view', 'roadmap_click', etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    user_agent TEXT,
    ip_hash TEXT, -- Stored as hash for privacy compliance
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_portal_views_client_urn ON public.agency_portal_views(client_urn);
CREATE INDEX IF NOT EXISTS idx_portal_views_agency_id ON public.agency_portal_views(agency_id);

-- Enable RLS
ALTER TABLE public.agency_portal_views ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Tracking
-- Agencies can view their own analytics
DROP POLICY IF EXISTS "Agencies can view own portal analytics" ON public.agency_portal_views;
CREATE POLICY "Agencies can view own portal analytics"
    ON public.agency_portal_views FOR SELECT
    USING (auth.uid() = agency_id);

-- Tracking is insertable via public API, but restricted by valid client_urn
DROP POLICY IF EXISTS "Public can log portal interactions" ON public.agency_portal_views;
CREATE POLICY "Public can log portal interactions"
    ON public.agency_portal_views FOR INSERT
    WITH CHECK (true);

-- 5. Atomic increment function for engagement
CREATE OR REPLACE FUNCTION public.increment_client_engagement(target_urn TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO public.agency_client_strategies (client_urn, agency_id, engagement_stats)
    SELECT target_urn, agency_id, '{"views": 1}'::jsonb
    FROM public.agency_clients
    WHERE urn = target_urn
    ON CONFLICT (client_urn) DO UPDATE
    SET 
        engagement_stats = (
            COALESCE(agency_client_strategies.engagement_stats, '{}'::jsonb) || 
            jsonb_build_object('views', (COALESCE((agency_client_strategies.engagement_stats->>'views')::int, 0) + 1))
        ),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for clarity
COMMENT ON TABLE public.agency_portal_views IS 'Detailed tracking of client interactions with their assigned portals.';
