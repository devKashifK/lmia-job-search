-- RPC to find employers that have historically posted jobs for specific occupations
CREATE OR REPLACE FUNCTION public.get_matching_employers(
    p_noc_codes TEXT[],
    p_job_titles TEXT[]
)
RETURNS TABLE (
    name TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH combined_employers AS (
        -- From LMIA (using confirmed column names)
        SELECT "Employer" as e_name
        FROM public.lmia
        WHERE (noc_code = ANY(p_noc_codes) OR "JobTitle" = ANY(p_job_titles))
          AND "Employer" IS NOT NULL
        
        UNION ALL
        
        -- From Trending Jobs (using confirmed column names)
        SELECT employer as e_name
        FROM public.trending_job
        WHERE (noc_code = ANY(p_noc_codes) OR job_title = ANY(p_job_titles))
          AND employer IS NOT NULL
    )
    SELECT e_name, COUNT(*)::BIGINT as total_count
    FROM combined_employers
    WHERE e_name != '' AND e_name != 'Unknown'
    GROUP BY e_name
    ORDER BY total_count DESC
    LIMIT 12;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
