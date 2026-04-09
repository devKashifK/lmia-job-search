-- Add internal_notes and roadmap columns to agency_clients
ALTER TABLE public.agency_clients 
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS strategy_roadmap JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.agency_clients.internal_notes IS 'Private internal notes for the agency regarding this client case';
COMMENT ON COLUMN public.agency_clients.strategy_roadmap IS 'Checklist or roadmap of strategic steps for the client';
