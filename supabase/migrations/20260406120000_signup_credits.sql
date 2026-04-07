-- Migration: Set default credits to 500 for new signups
-- This trigger ensures every new user starts with 500 credits.

-- 1. Ensure the profiles table or credits table has the correct default (if applicable)
-- ALTER TABLE profiles ALTER COLUMN credits SET DEFAULT 500;

-- 2. Trigger function to handle credit initialization on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.credits (user_id, amount)
  VALUES (new.id, 500)
  ON CONFLICT (user_id) DO UPDATE
  SET amount = EXCLUDED.amount;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger on auth.users (if using Supabase Auth)
-- Re-run if you want to apply this to the auth.users -> public.profiles flow.
-- DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
-- CREATE TRIGGER on_auth_user_created_credits
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Alternatively, simply update the default value in the profiles table if credits are stored there:
-- ALTER TABLE public.profiles ALTER COLUMN credit_balance SET DEFAULT 500;
