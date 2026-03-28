-- Add 'admin' to plan_type enum
-- Run this in your Supabase SQL Editor

ALTER TYPE public.plan_type ADD VALUE 'admin';

-- Update documentation/comment for the column
COMMENT ON COLUMN public.credits.plan_type IS 'The subscription tier of the user (free, pay_as_you_go, weekly, monthly, enterprise, admin)';
