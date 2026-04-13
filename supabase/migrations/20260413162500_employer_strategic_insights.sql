-- Migration: Employer Strategic Insights RPC
-- Analyzes historical LMIA and Trending Job data for a specific employer and NOC list

CREATE OR REPLACE FUNCTION public.get_employer_strategic_insights(
    p_employer_name TEXT,
    p_noc_codes TEXT[]
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    WITH combined AS (
        SELECT "JobTitle" as title, lmia_year as year, city as loc
        FROM public.lmia
        WHERE "Employer" = p_employer_name AND noc_code = ANY(p_noc_codes)
        
        UNION ALL
        
        SELECT job_title as title, EXTRACT(YEAR FROM date_of_job_posting)::INT as year, city as loc
        FROM public.trending_job
        WHERE employer = p_employer_name AND noc_code = ANY(p_noc_codes)
    )
    SELECT 
        jsonb_build_object(
            'total_insights', COUNT(*),
            'yearly_distribution', (
                SELECT jsonb_object_agg(y, c) 
                FROM (SELECT year as y, COUNT(*) as c FROM combined GROUP BY year ORDER BY year DESC) t
            ),
            'top_titles', (
                SELECT jsonb_agg(t.title) 
                FROM (SELECT title, COUNT(*) as c FROM combined GROUP BY title ORDER BY c DESC LIMIT 3) t
            ),
            'locations', (
                SELECT jsonb_agg(t.loc) 
                FROM (SELECT loc, COUNT(*) as c FROM combined GROUP BY loc ORDER BY c DESC LIMIT 3) t
            )
        ) INTO v_result
    FROM combined;

    RETURN COALESCE(v_result, jsonb_build_object(
        'total_insights', 0,
        'yearly_distribution', '{}'::jsonb,
        'top_titles', '[]'::jsonb,
        'locations', '[]'::jsonb
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
