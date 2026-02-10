-- Create user_preferences table to store job preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Job Preferences
  preferred_job_titles TEXT[] DEFAULT '{}', -- Array of job titles
  preferred_locations TEXT[] DEFAULT '{}', -- Array of cities/provinces  
  preferred_industries TEXT[] DEFAULT '{}', -- Array of industries
  salary_min INTEGER,
  salary_max INTEGER,
  work_authorization TEXT, -- e.g., "Canadian Citizen", "Work Permit", "Open Work Permit"
  remote_preference TEXT DEFAULT 'any', -- "remote", "hybrid", "onsite", "any"
  
  -- Experience Level
  experience_level TEXT, -- "entry", "mid", "senior", "lead"
  
  -- Additional Filters
  company_size_preference TEXT[] DEFAULT '{}', -- "startup", "mid-size", "enterprise"
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();
