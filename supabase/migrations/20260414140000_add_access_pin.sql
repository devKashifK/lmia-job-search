-- Add access_pin column to agency_client_strategies
ALTER TABLE public.agency_client_strategies 
ADD COLUMN IF NOT EXISTS access_pin TEXT;

COMMENT ON COLUMN public.agency_client_strategies.access_pin IS '4-digit PIN for client to access their public portal';
