-- Update user_preferences table to match new schema (provinces/cities instead of locations)
-- This migration updates the structure to separate provinces and cities

-- Add new columns
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS preferred_provinces TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_cities TEXT[] DEFAULT '{}';

-- Migrate data from old preferred_locations column to preferred_provinces (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'preferred_locations'
  ) THEN
    -- Copy old locations data to provinces
    UPDATE user_preferences 
    SET preferred_provinces = preferred_locations
    WHERE preferred_locations IS NOT NULL AND preferred_locations != '{}';
    
    -- Drop old column
    ALTER TABLE user_preferences DROP COLUMN preferred_locations;
  END IF;
END $$;

-- Remove deprecated columns that are no longer used
ALTER TABLE user_preferences 
DROP COLUMN IF EXISTS salary_min,
DROP COLUMN IF EXISTS salary_max,
DROP COLUMN IF EXISTS work_authorization,
DROP COLUMN IF EXISTS remote_preference,
DROP COLUMN IF EXISTS experience_level,
DROP COLUMN IF EXISTS company_size_preference;

-- Comment on new columns
COMMENT ON COLUMN user_preferences.preferred_provinces IS 'Array of preferred provinces/states for job search';
COMMENT ON COLUMN user_preferences.preferred_cities IS 'Array of preferred cities for job search (requires provinces to be selected first)';
COMMENT ON COLUMN user_preferences.preferred_job_titles IS 'Array of preferred job titles fetched from lmia_records and trending_job';
COMMENT ON COLUMN user_preferences.preferred_industries IS 'Array of preferred industries/categories from lmia_records and trending_job';
