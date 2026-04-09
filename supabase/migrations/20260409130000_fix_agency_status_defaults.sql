-- Harmonize agency client statuses with the new pipeline logic
-- Change default status to 'pre-screening'
ALTER TABLE public.agency_clients 
ALTER COLUMN status SET DEFAULT 'pre-screening';

-- Migration: Update existing 'active' or NULL statuses to 'pre-screening'
UPDATE public.agency_clients 
SET status = 'pre-screening' 
WHERE status IS NULL OR status = 'active';

-- Comment update
COMMENT ON COLUMN public.agency_clients.status IS 'Current stage in the recruitment funnel (pre-screening, marketing, interviewing, etc.)';
