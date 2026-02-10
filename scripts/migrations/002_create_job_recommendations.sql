-- Create job_recommendations table to cache generated recommendations
CREATE TABLE IF NOT EXISTS job_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL, -- Reference to jobs table (could be lmia_records.RecordID or trending_job.id)
  job_source TEXT NOT NULL, -- "lmia" or "trending_job" to know which table to query
  score FLOAT NOT NULL CHECK (score >= 0 AND score <= 1), -- Recommendation score (0-1)
  reasons TEXT[] DEFAULT '{}', -- Array of reasons for recommendation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, job_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON job_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON job_recommendations(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_created_at ON job_recommendations(created_at DESC);

-- Enable RLS
ALTER TABLE job_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own recommendations"
  ON job_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON job_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON job_recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- Function to clean old recommendations (>7 days)
CREATE OR REPLACE FUNCTION clean_old_recommendations()
RETURNS void AS $$
BEGIN
  DELETE FROM job_recommendations
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE job_recommendations IS 'Stores cached job recommendations with scores and reasons';
COMMENT ON COLUMN job_recommendations.score IS 'Recommendation score from 0.0 to 1.0, higher is better match';
COMMENT ON COLUMN job_recommendations.reasons IS 'Array of strings explaining why this job was recommended';
