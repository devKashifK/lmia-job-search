-- Migrate credits table to support tiered pricing
-- Run this in your Supabase SQL Editor

-- 1. Create plan_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE plan_type AS ENUM (
            'free', 
            'pay_as_you_go', 
            'weekly', 
            'monthly', 
            'starter', 
            'pro', 
            'enterprise'
        );
    END IF;
END $$;

-- 2. Add plan_type and expires_at to credits table
ALTER TABLE IF EXISTS public.credits 
ADD COLUMN IF NOT EXISTS plan_type plan_type DEFAULT 'free',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 3. Update existing records to 'free' if they are null
UPDATE public.credits SET plan_type = 'free' WHERE plan_type IS NULL;

-- 4. Ensure RLS allows the service role (used by the callback) to update these fields
-- (This assumes RLS is already set up and we're using the service role key in the API)

COMMENT ON COLUMN public.credits.plan_type IS 'The subscription tier of the user';
COMMENT ON COLUMN public.credits.expires_at IS 'When the current premium plan expires (null for free/permanent credits)';
