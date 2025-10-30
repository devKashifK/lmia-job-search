-- RPC Function for efficient server-side aggregation
-- This dramatically improves performance when fetching distinct values with counts
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_distinct_values_with_count(
  table_name TEXT,
  column_name TEXT
)
RETURNS TABLE (name TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Dynamically build and execute the query
  RETURN QUERY EXECUTE format(
    'SELECT %I::TEXT as name, COUNT(*)::BIGINT as count 
     FROM %I 
     WHERE %I IS NOT NULL AND TRIM(%I::TEXT) != ''''
     GROUP BY %I
     ORDER BY count DESC',
    column_name,
    table_name,
    column_name,
    column_name,
    column_name
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_distinct_values_with_count(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_distinct_values_with_count(TEXT, TEXT) TO anon;

-- Example usage:
-- SELECT * FROM get_distinct_values_with_count('trending_job', 'employer');
-- SELECT * FROM get_distinct_values_with_count('trending_job', 'job_title');
