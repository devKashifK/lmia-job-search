-- Optional: Enhance existing searches table with filters and results_count
-- This allows tracking more detailed search behavior for better recommendations

-- Add filters JSONB column to track applied search filters
ALTER TABLE searches 
ADD COLUMN IF NOT EXISTS filters JSONB DEFAULT '{}'::jsonb;

-- Add results_count to track how many results the search returned
ALTER TABLE searches 
ADD COLUMN IF NOT EXISTS results_count INTEGER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_searches_user_created 
ON searches(id, created_at DESC);

-- Create index on filters for JSONB queries
CREATE INDEX IF NOT EXISTS idx_searches_filters 
ON searches USING GIN (filters jsonb_path_ops);

COMMENT ON COLUMN searches.filters IS 'JSONB object storing applied filters: {location, salary_min, salary_max, noc_code, etc.}';
COMMENT ON COLUMN searches.results_count IS 'Number of results returned for this search';
