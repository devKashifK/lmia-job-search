-- Add interview_questions column to agency_client_strategies
ALTER TABLE public.agency_client_strategies 
ADD COLUMN IF NOT EXISTS interview_questions JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.agency_client_strategies.interview_questions IS 'AI-generated interview prep questions and coaching rationale';
