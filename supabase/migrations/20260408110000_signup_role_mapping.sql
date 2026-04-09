-- Migration: Updated signup role mapping trigger
-- This matches the user's existing trigger style while adding plan_type mapping

CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS trigger AS $$
BEGIN
  -- 1. Initialize credits with 500 and map plan_type
  INSERT INTO public.credits (id, total_credit, used_credit, plan_type)
  VALUES (
    new.id,
    500,
    0,
    CASE
      WHEN (new.raw_user_meta_data ->> 'user_type') = 'agency' THEN 'agency'::plan_type
      ELSE 'free'::plan_type
    END
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Initialize user profile
  INSERT INTO public.user_profiles (user_id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.email
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is active on auth.users
DROP TRIGGER IF EXISTS on_auth_user_registration ON auth.users;
CREATE TRIGGER on_auth_user_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();
