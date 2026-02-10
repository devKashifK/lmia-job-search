-- Create a function to get search stats (Top Companies, NOCs, Locations)
-- Returns a JSON object with aggregated data

CREATE OR REPLACE FUNCTION get_search_stats(
    p_is_lmia boolean,
    p_limit integer DEFAULT 5
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_companies json;
    v_nocs json;
    v_locations json;
BEGIN
    IF p_is_lmia THEN
        -- Top Companies (LMIA)
        SELECT json_agg(t) INTO v_companies FROM (
            SELECT employer as name, SUM(approved_positions)::bigint as count
            FROM lmia
            WHERE employer IS NOT NULL
            GROUP BY employer
            ORDER BY count DESC
            LIMIT p_limit
        ) t;

        -- Top NOC Codes (LMIA)
        SELECT json_agg(t) INTO v_nocs FROM (
            SELECT noc_code as code, COUNT(*)::bigint as count
            FROM lmia
            WHERE noc_code IS NOT NULL
            GROUP BY noc_code
            ORDER BY count DESC
            LIMIT p_limit
        ) t;

        -- Top Locations (LMIA)
        SELECT json_agg(t) INTO v_locations FROM (
            SELECT 
                city || ', ' || territory as name, 
                COUNT(*)::bigint as count
            FROM lmia
            WHERE city IS NOT NULL AND territory IS NOT NULL
            GROUP BY city, territory
            ORDER BY count DESC
            LIMIT p_limit
        ) t;
    ELSE
        -- Top Companies (Trending)
        SELECT json_agg(t) INTO v_companies FROM (
            SELECT employer as name, COUNT(*)::bigint as count
            FROM trending_job
            WHERE employer IS NOT NULL
            GROUP BY employer
            ORDER BY count DESC
            LIMIT p_limit
        ) t;

        -- Top NOC Codes (Trending)
        SELECT json_agg(t) INTO v_nocs FROM (
            SELECT "2021_noc" as code, COUNT(*)::bigint as count
            FROM trending_job
            WHERE "2021_noc" IS NOT NULL
            GROUP BY "2021_noc"
            ORDER BY count DESC
            LIMIT p_limit
        ) t;

        -- Top Locations (Trending)
        SELECT json_agg(t) INTO v_locations FROM (
            SELECT 
                city || ', ' || state as name, 
                COUNT(*)::bigint as count
            FROM trending_job
            WHERE city IS NOT NULL AND state IS NOT NULL
            GROUP BY city, state
            ORDER BY count DESC
            LIMIT p_limit
        ) t;
    END IF;

    RETURN json_build_object(
        'companies', COALESCE(v_companies, '[]'::json),
        'nocs', COALESCE(v_nocs, '[]'::json),
        'locations', COALESCE(v_locations, '[]'::json)
    );
END;
$$;

-- Reload schema cache to ensure RPC is available immediately
NOTIFY pgrst, 'reload schema';
