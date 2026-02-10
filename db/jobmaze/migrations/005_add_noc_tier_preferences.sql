-- Add NOC code and company tier preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS preferred_noc_codes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_company_tiers TEXT[] DEFAULT '{}';

-- Add comments
COMMENT ON COLUMN user_preferences.preferred_noc_codes IS 'Array of preferred NOC codes for job matching';
COMMENT ON COLUMN user_preferences.preferred_company_tiers IS 'Array of preferred company tiers (A, B, C)';
