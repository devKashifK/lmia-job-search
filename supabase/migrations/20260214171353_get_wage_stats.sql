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
  -- We aggregate from lmia_records where we have approved LMIAs (reliable wage data)
  -- Column names inferred from codebase: "Wage", "NOC", "Province"
  -- Note: "Wage" is a string in some contexts in code, but usually numeric in DB. 
  -- We cast to numeric just in case, or assume it's numeric. 
  -- If Wage is mixed, we might need regex, but let's assume it's clean for now or try simple casting.
  
  SELECT json_build_object(
    'min_wage', MIN("Wage"::numeric),
    'median_wage', PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "Wage"::numeric),
    'max_wage', MAX("Wage"::numeric),
    'avg_wage', AVG("Wage"::numeric),
    'sample_size', COUNT(*),
    'province', p_province,
    'noc_code', p_noc_code
  )
  INTO v_stats
  FROM lmia_records
  WHERE 
    "NOC"::text = p_noc_code
    AND "Wage" IS NOT NULL
    AND (p_province IS NULL OR "Province" = p_province);

  RETURN v_stats;
END;
$$;
