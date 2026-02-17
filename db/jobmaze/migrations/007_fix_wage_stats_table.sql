-- Create a function to get wage statistics for a specific NOC and Province
CREATE OR REPLACE FUNCTION get_wage_stats(
  p_noc_code text,
  p_province text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_stats json;
BEGIN
  -- Aggregate wage data from trending_job table (salary column contains text like "$35.00HOUR hourly")
  WITH wage_data AS (
    SELECT 
      (substring(salary from '\$([0-9]+\.?[0-9]*)'))::numeric as hourly_wage
    FROM trending_job
    WHERE 
      noc_code = p_noc_code
      AND (p_province IS NULL OR state = p_province)
      AND salary LIKE '%HOUR%'
      AND salary ~ '\$[0-9]+'
  )
  SELECT json_build_object(
    'min_wage', MIN(hourly_wage),
    'median_wage', PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY hourly_wage),
    'max_wage', MAX(hourly_wage),
    'avg_wage', AVG(hourly_wage),
    'sample_size', COUNT(*),
    'province', p_province,
    'noc_code', p_noc_code
  )
  INTO v_stats
  FROM wage_data;

  RETURN v_stats;
END;
$$;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_wage_stats(text, text) TO anon;
GRANT EXECUTE ON FUNCTION get_wage_stats(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_wage_stats(text, text) TO service_role;
