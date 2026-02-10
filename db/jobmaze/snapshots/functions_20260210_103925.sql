CREATE OR REPLACE FUNCTION public.check_filter_availability(p_table text, p_column text, p_filters jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(value text, hits bigint)
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  allowed_cols constant text[] := ARRAY[
    'state','city','category','job_title','noc_code','employer',
    'state_norm','city_norm','category_norm','job_title_norm','noc_code_norm','employer_norm'
  ];
  target text;
  where_sql text;
  k text;
  vals text[];
BEGIN
  -- lock table for safety
  IF p_table IS NULL OR lower(p_table) <> 'trending_job' THEN
    RAISE EXCEPTION 'unsupported table: %', p_table;
  END IF;

  -- validate target column
  IF p_column IS NULL OR NOT (p_column = ANY(allowed_cols)) THEN
    RAISE EXCEPTION 'unsupported column: %', p_column;
  END IF;

  target := quote_ident(p_column);

  -- base predicate: target has a non-empty value
  where_sql := format('%1$s IS NOT NULL AND %1$s <> ''''', target);

  -- add AND filters from p_filters (excluding the target itself)
  FOR k IN SELECT jsonb_object_keys(coalesce(p_filters, '{}'::jsonb))
  LOOP
    IF k = p_column THEN CONTINUE; END IF;
    IF NOT (k = ANY(allowed_cols)) THEN CONTINUE; END IF;

    SELECT array_agg(btrim(x)) INTO vals
    FROM jsonb_array_elements_text(p_filters->k) AS t(x)
    WHERE btrim(x) <> '';

    IF vals IS NULL OR array_length(vals,1) IS NULL THEN CONTINUE; END IF;

    where_sql := where_sql || format(
      ' AND %s IN (%s)',
      quote_ident(k),
      (SELECT string_agg(quote_literal(v), ',') FROM unnest(vals) AS u(v))
    );
  END LOOP;

  RETURN QUERY EXECUTE format(
    'SELECT %1$s::text AS value, COUNT(*)::bigint AS hits
       FROM public.trending_job
      WHERE %2$s
      GROUP BY %1$s
      ORDER BY COUNT(*) DESC, %1$s ASC',
    target, where_sql
  );
END
$function$

CREATE OR REPLACE FUNCTION public.clean_old_recommendations()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM job_recommendations
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$function$

CREATE OR REPLACE FUNCTION public.cleanup_tredning_job_exact_duplicates()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
declare
  v_deleted integer;
begin
  -- 1. Find all rows that are exact duplicates across all the business columns,
  --    number them within each identical group,
  --    and mark rows with rn > 1 as "extra copies".
  with dups as (
    select id
    from (
      select
        id,
        row_number() over (
          partition by 
            date_of_job_posting,
            state,
            city,
            email,
            phone,
            category,
            job_title,
            noc_code,
            employer
          order by id  -- keep the lowest id as the "original"
        ) as rn
      from public.tredning_job
    ) ranked
    where ranked.rn > 1  -- these are duplicates to delete
  )

  -- 2. Delete those extra copies from the table
  delete from public.tredning_job t
  using dups
  where t.id = dups.id
  returning 1
  into v_deleted;

  -- 3. Return how many got deleted (0 if none)
  return coalesce(v_deleted, 0);
end;
$function$

CREATE OR REPLACE FUNCTION public.cleanup_trending_job_exact_duplicates()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
declare
  v_deleted integer;
begin
  with dups as (
    -- find all duplicate rows (same data across all business columns),
    -- mark any row after the first one in each group as duplicate
    select id
    from (
      select
        id,
        row_number() over (
          partition by 
            date_of_job_posting,
            state,
            city,
            email,
            phone,
            category,
            job_title,
            noc_code,
            employer
          order by id
        ) as rn
      from public.trending_job
    ) ranked
    where ranked.rn > 1
  ),
  deleted_rows as (
    delete from public.trending_job t
    using dups
    where t.id = dups.id
    returning t.id
  )
  select count(*)::int into v_deleted from deleted_rows;

  return coalesce(v_deleted, 0);
end;
$function$

CREATE OR REPLACE FUNCTION public.create_user_credit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.credits (id, total_credit, used_credit)
  values (new.id, 10, 0);
  return new;
end;
$function$

CREATE OR REPLACE FUNCTION public.dynamic_analytics(table_name text, filters_json jsonb, group_cols text[], measure_expr text)
 RETURNS TABLE(group_keys jsonb, value numeric)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
  where_clause text := '';
  grp_cols_str text := array_to_string(group_cols, ', ');
  sql          text;
begin
  -- Build a case-insensitive WHERE clause
  if jsonb_array_length(filters_json) > 0 then
    where_clause := 'WHERE ' ||
      (
        select string_agg(
          format(
            'LOWER(%I) %s LOWER(%L)',
            f->> 'column',
            f->> 'operator',
            f->> 'value'
          ),
          ' AND '
        )
        from jsonb_array_elements(filters_json) as arr(f)
      );
  end if;

  -- Assemble and execute the dynamic SQL
  sql := format($fmt$
    SELECT
      -- turn the grouped columns into JSONB and strip out the "value" key
      (to_jsonb(sub) - 'value')           AS group_keys,
      -- cast the aggregation (bigint) into numeric
      (sub.value)::numeric                AS value
    FROM (
      SELECT
        %s,                               -- e.g. "city, state"
        %s    AS value                    -- your measure_expr
      FROM %I
      %s                                  -- the WHERE clause
      GROUP BY %s                         -- same grouping columns
      ORDER BY value DESC
    ) AS sub
  $fmt$,
    grp_cols_str,
    measure_expr,
    table_name,
    where_clause,
    grp_cols_str
  );

  return query execute sql;
end;
$function$

CREATE OR REPLACE FUNCTION public.dynamic_analytics(table_name text, filters_json jsonb, group_cols text[], measure_expr text, date_column text DEFAULT 'data_of_job_posting'::text, years_back integer DEFAULT 2)
 RETURNS TABLE(group_keys jsonb, value numeric)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
  where_clauses text := '';
  grp_cols_str  text := array_to_string(group_cols, ', ');
  sql           text;
begin
  ---------------------------------------
  -- 1) DATE FILTER: "last N years"  --
  ---------------------------------------
  if years_back > 0 then
    where_clauses := format(
      'WHERE (%I)::date >= (CURRENT_DATE - make_interval(years => %s))',
      date_column,
      years_back
    );
  end if;

  ---------------------------------------
  -- 2) JSON‐BASED FILTERS, IF ANY   --
  ---------------------------------------
  if jsonb_array_length(filters_json) > 0 then
    where_clauses := where_clauses
      || (CASE WHEN where_clauses = '' THEN 'WHERE ' ELSE ' AND ' END)
      || (
        select string_agg(
          format(
            'LOWER(%I) %s LOWER(%L)',
            f->> 'column',
            f->> 'operator',
            f->> 'value'
          ),
          ' AND '
        )
        from jsonb_array_elements(filters_json) as arr(f)
      );
  end if;

  ---------------------------------------
  -- 3) BUILD & EXECUTE DYNAMIC SQL   --
  ---------------------------------------
  sql := format($fmt$
    SELECT
      -- Convert the grouped columns into JSONB, then remove "value"
      (to_jsonb(sub) - 'value')     AS group_keys,
      -- Cast the aggregation (often bigint) into numeric
      (sub.value)::numeric          AS value
    FROM (
      SELECT
        %s,                      -- grouping columns e.g. "city, state"
        %s     AS value          -- your measure_expr e.g. "count(*)"
      FROM %I
      %s                         -- combined WHERE clauses
      GROUP BY %s                -- same grouping columns
      ORDER BY value DESC
    ) AS sub
  $fmt$,
    grp_cols_str,
    measure_expr,
    table_name,
    where_clauses,
    grp_cols_str
  );

  return query execute sql;
end;
$function$

CREATE OR REPLACE FUNCTION public.get_cities_by_province(p_province text, p_search text DEFAULT ''::text)
 RETURNS TABLE(city text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT DISTINCT l.city
    FROM lmia l
    WHERE 
        l.territory = p_province
        AND l.city IS NOT NULL
        AND (p_search = '' OR l.city ILIKE p_search || '%')
    ORDER BY l.city
    LIMIT 50;
END;
$function$

CREATE OR REPLACE FUNCTION public.get_companies_by_tier(p_tier integer, p_is_lmia boolean, p_limit integer DEFAULT 3)
 RETURNS TABLE(name text, count bigint, locations text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_is_lmia THEN
    RETURN QUERY
    SELECT
      t.employer,
      SUM(
        COALESCE(
          NULLIF(regexp_replace(t.approved_positions, '[^0-9]', '', 'g'), '')::bigint,
          0
        )
      )::bigint AS count,
      (array_agg(DISTINCT (t.city || ', ' || t.territory)))[1:2] AS locations
    FROM public.lmia t
    WHERE t.tier ~ '^[0-9]+$'
      AND t.tier::int = p_tier
    GROUP BY t.employer
    ORDER BY count DESC
    LIMIT p_limit;

  ELSE
    RETURN QUERY
    SELECT
      t.employer,
      COUNT(*)::bigint AS count,
      (array_agg(DISTINCT (t.city || ', ' || t.state)))[1:2] AS locations
    FROM public.trending_job t
    WHERE t.tier ~ '^[0-9]+$'
      AND t.tier::int = p_tier
    GROUP BY t.employer
    ORDER BY count DESC
    LIMIT p_limit;
  END IF;
END;
$function$

CREATE OR REPLACE FUNCTION public.get_dashboard_data(filter_cols text[], filter_vals text[])
 RETURNS dashboard_snapshot
 LANGUAGE plpgsql
AS $function$
DECLARE
  total_cnt    bigint;
  base_where   text := '';
  dyn_sql      text;
  temp_json    jsonb;
  result       public.dashboard_snapshot;
  group_col    text;
  target_field text;
BEGIN
  IF array_length(filter_cols,1) IS DISTINCT FROM array_length(filter_vals,1) THEN
    RAISE EXCEPTION 'filter_cols and filter_vals must have the same length';
  END IF;

  IF array_length(filter_cols,1) > 0 THEN
    FOR i IN array_lower(filter_cols,1)..array_upper(filter_cols,1) LOOP
      base_where := base_where
        || (CASE WHEN i = array_lower(filter_cols,1) THEN ' WHERE ' ELSE ' AND ' END)
        || format('%I = %L', filter_cols[i], filter_vals[i]);
    END LOOP;
  END IF;

  EXECUTE format('SELECT count(*) FROM hot_leads_new%s', base_where)
    INTO total_cnt;
  result.total_count := total_cnt;

  FOR group_col, target_field IN
    SELECT fc, tf
    FROM (VALUES
      ('date_of_job_posting','by_date_of_job_posting'),
      ('state'               ,'by_state'),
      ('city'                ,'by_city'),
      ('occupation_title'    ,'by_occupation_title'),
      ('operating_name'      ,'by_operating_name'),
      ('year'                ,'by_year')
    ) AS dims(fc, tf)
  LOOP
    dyn_sql := format($q$
      SELECT jsonb_agg(r) FROM (
        SELECT
          %1$I::text                       AS label,
          count(*)                         AS cnt,
          ROUND(count(*) * 100.0 / %2$L,2) AS pct
        FROM hot_leads_new
        %3$s
        GROUP BY %1$I
        ORDER BY cnt DESC
      ) AS r
    $q$, group_col, total_cnt, base_where);

    EXECUTE dyn_sql INTO temp_json;

    -- <— Replace dynamic assignment with plain IF/ELSIF in PLpgSQL
    IF target_field = 'by_date_of_job_posting' THEN
      result.by_date_of_job_posting := temp_json;
    ELSIF target_field = 'by_state' THEN
      result.by_state := temp_json;
    ELSIF target_field = 'by_city' THEN
      result.by_city := temp_json;
    ELSIF target_field = 'by_occupation_title' THEN
      result.by_occupation_title := temp_json;
    ELSIF target_field = 'by_operating_name' THEN
      result.by_operating_name := temp_json;
    ELSIF target_field = 'by_year' THEN
      result.by_year := temp_json;
    END IF;
  END LOOP;

  RETURN result;
END;
$function$

CREATE OR REPLACE FUNCTION public.get_distinct_values_with_count(table_name text, column_name text)
 RETURNS TABLE(name text, count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$

CREATE OR REPLACE FUNCTION public.get_facet_counts_with_filters(p_table_name text, p_column_name text, p_filters jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(name text, count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  query_text TEXT;
  filter_key TEXT;
  filter_values JSONB;
  where_clauses TEXT[] := ARRAY[]::TEXT[];
  where_clause TEXT := '';
BEGIN
  -- Start building the query
  query_text := format(
    'SELECT %I::TEXT as name, COUNT(*)::BIGINT as count FROM %I',
    p_column_name,
    p_table_name
  );

  -- Add WHERE clause for non-null and non-empty values
  where_clauses := array_append(where_clauses, 
    format('%I IS NOT NULL AND TRIM(%I::TEXT) != ''''', p_column_name, p_column_name)
  );

  -- Process filters from JSONB
  FOR filter_key, filter_values IN SELECT * FROM jsonb_each(p_filters)
  LOOP
    IF jsonb_typeof(filter_values) = 'array' AND jsonb_array_length(filter_values) > 0 THEN
      -- Handle array of values (IN clause)
      where_clauses := array_append(where_clauses,
        format('%I = ANY(ARRAY[%s]::TEXT[])', 
          filter_key,
          (SELECT string_agg(quote_literal(value#>>'{}'), ',') FROM jsonb_array_elements(filter_values) AS value)
        )
      );
    ELSIF jsonb_typeof(filter_values) = 'string' THEN
      -- Handle single value (= clause)
      where_clauses := array_append(where_clauses,
        format('%I = %L', filter_key, filter_values#>>'{}')
      );
    ELSIF jsonb_typeof(filter_values) = 'object' THEN
      -- Handle range filters (for dates/years)
      IF filter_values ? 'gte' THEN
        where_clauses := array_append(where_clauses,
          format('%I >= %L', filter_key, filter_values->>'gte')
        );
      END IF;
      IF filter_values ? 'lte' THEN
        where_clauses := array_append(where_clauses,
          format('%I <= %L', filter_key, filter_values->>'lte')
        );
      END IF;
    END IF;
  END LOOP;

  -- Combine WHERE clauses
  IF array_length(where_clauses, 1) > 0 THEN
    where_clause := ' WHERE ' || array_to_string(where_clauses, ' AND ');
  END IF;

  -- Add GROUP BY and ORDER BY
  query_text := query_text || where_clause || format(
    ' GROUP BY %I ORDER BY count DESC',
    p_column_name
  );

  -- Execute and return
  RETURN QUERY EXECUTE query_text;
END;
$function$

CREATE OR REPLACE FUNCTION public.get_facet_counts_with_filters(p_table_name text, p_column_name text, p_filters jsonb DEFAULT '{}'::jsonb, p_search_field text DEFAULT NULL::text, p_search_term text DEFAULT NULL::text)
 RETURNS TABLE(name text, count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  query_text TEXT;
  filter_key TEXT;
  filter_values JSONB;
  where_clauses TEXT[] := ARRAY[]::TEXT[];
  where_clause TEXT := '';
BEGIN
  -- Start building the query
  query_text := format(
    'SELECT %I::TEXT as name, COUNT(*)::BIGINT as count FROM %I',
    p_column_name,
    p_table_name
  );

  -- Add WHERE clause for non-null and non-empty values
  where_clauses := array_append(where_clauses, 
    format('%I IS NOT NULL AND TRIM(%I::TEXT) != ''''', p_column_name, p_column_name)
  );

  -- Add search term filter (ILIKE)
  IF p_search_field IS NOT NULL AND p_search_term IS NOT NULL AND p_search_term != '' AND p_search_field != 'all' THEN
    where_clauses := array_append(where_clauses,
      format('%I::TEXT ILIKE %L', p_search_field, '%' || p_search_term || '%')
    );
  END IF;

  -- Process filters from JSONB
  FOR filter_key, filter_values IN SELECT * FROM jsonb_each(p_filters)
  LOOP
    IF jsonb_typeof(filter_values) = 'array' AND jsonb_array_length(filter_values) > 0 THEN
      -- Handle array of values (IN clause)
      where_clauses := array_append(where_clauses,
        format('%I = ANY(ARRAY[%s]::TEXT[])', 
          filter_key,
          (SELECT string_agg(quote_literal(value#>>'{}'), ',') FROM jsonb_array_elements(filter_values) AS value)
        )
      );
    ELSIF jsonb_typeof(filter_values) = 'string' THEN
      -- Handle single value (= clause)
      where_clauses := array_append(where_clauses,
        format('%I = %L', filter_key, filter_values#>>'{}')
      );
    ELSIF jsonb_typeof(filter_values) = 'object' THEN
      -- Handle range filters (for dates/years)
      IF filter_values ? 'gte' THEN
        where_clauses := array_append(where_clauses,
          format('%I >= %L', filter_key, filter_values->>'gte')
        );
      END IF;
      IF filter_values ? 'lte' THEN
        where_clauses := array_append(where_clauses,
          format('%I <= %L', filter_key, filter_values->>'lte')
        );
      END IF;
    END IF;
  END LOOP;

  -- Combine WHERE clauses
  IF array_length(where_clauses, 1) > 0 THEN
    where_clause := ' WHERE ' || array_to_string(where_clauses, ' AND ');
  END IF;

  -- Add GROUP BY and ORDER BY
  query_text := query_text || where_clause || format(
    ' GROUP BY %I ORDER BY count DESC',
    p_column_name
  );

  -- Execute and return
  RETURN QUERY EXECUTE query_text;
END;
$function$

CREATE OR REPLACE FUNCTION public.get_provinces()
 RETURNS TABLE(province text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT DISTINCT territory as province
    FROM lmia
    WHERE territory IS NOT NULL
    ORDER BY territory;
END;
$function$

CREATE OR REPLACE FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_query_trgm$function$

CREATE OR REPLACE FUNCTION public.gin_extract_value_trgm(text, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_value_trgm$function$

CREATE OR REPLACE FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_consistent$function$

CREATE OR REPLACE FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_triconsistent$function$

CREATE OR REPLACE FUNCTION public.gtrgm_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_compress$function$

CREATE OR REPLACE FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_consistent$function$

CREATE OR REPLACE FUNCTION public.gtrgm_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_decompress$function$

CREATE OR REPLACE FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_distance$function$

CREATE OR REPLACE FUNCTION public.gtrgm_in(cstring)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_in$function$

CREATE OR REPLACE FUNCTION public.gtrgm_options(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/pg_trgm', $function$gtrgm_options$function$

CREATE OR REPLACE FUNCTION public.gtrgm_out(gtrgm)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_out$function$

CREATE OR REPLACE FUNCTION public.gtrgm_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_penalty$function$

CREATE OR REPLACE FUNCTION public.gtrgm_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_picksplit$function$

CREATE OR REPLACE FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_same$function$

CREATE OR REPLACE FUNCTION public.gtrgm_union(internal, internal)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_union$function$

CREATE OR REPLACE FUNCTION public.rpc_search_hot_leads(term text)
 RETURNS TABLE(date_of_job_posting text, state text, city text, email text, noc_priority text, occupation_title text, "2021_noc" text, job_location text, operating_name text)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    date_of_job_posting::text AS date_of_job_posting,
    state,
    city,
    email,
    noc_priority::text        AS noc_priority,
    occupation_title,
    "2021_noc",
    job_location,
    operating_name
  FROM hot_leads
  WHERE
    date_of_job_posting::text ILIKE '%' || term || '%'
    OR state                ILIKE '%' || term || '%'
    OR city                 ILIKE '%' || term || '%'
    OR email                ILIKE '%' || term || '%'
    OR noc_priority::text   ILIKE '%' || term || '%'
    OR occupation_title     ILIKE '%' || term || '%'
    OR "2021_noc"           ILIKE '%' || term || '%'
    OR job_location         ILIKE '%' || term || '%'
    OR operating_name       ILIKE '%' || term || '%'
  ;
$function$

CREATE OR REPLACE FUNCTION public.rpc_search_lmia(term text)
 RETURNS SETOF lmia
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT *
    FROM public.lmia
   WHERE territory::text           ILIKE '%' || term || '%'
      OR program::text             ILIKE '%' || term || '%'
      OR city::text                ILIKE '%' || term || '%'
      OR postal_code::text         ILIKE '%' || term || '%'
      OR "2021_noc"               ILIKE '%' || term || '%'
      OR occupation_title::text   ILIKE '%' || term || '%'
      OR incorporate_status::text ILIKE '%' || term || '%'
      OR approved_lmias::text     ILIKE '%' || term || '%'
      OR approved_positions::text ILIKE '%' || term || '%'
      OR lmia_period::text        ILIKE '%' || term || '%'
      OR lmia_year::text          ILIKE '%' || term || '%'
      OR gtr_lead_type::text      ILIKE '%' || term || '%'
      OR phone_1::text            ILIKE '%' || term || '%'
      OR phone_ext::text          ILIKE '%' || term || '%'
      OR email_1::text            ILIKE '%' || term || '%'
      OR lead_gen_name::text      ILIKE '%' || term || '%'
      OR phone_2::text            ILIKE '%' || term || '%'
      OR email_2::text            ILIKE '%' || term || '%'
      OR lead_gen_name_2::text    ILIKE '%' || term || '%'
      OR priority_occupation::text ILIKE '%' || term || '%'
      OR employer_name::text      ILIKE '%' || term || '%'
      OR operating_name::text     ILIKE '%' || term || '%'
      OR lmia_local_id::text      ILIKE '%' || term || '%'
      OR status::text             ILIKE '%' || term || '%'
      OR key::text                ILIKE '%' || term || '%'
      OR lead_local_id::text      ILIKE '%' || term || '%'
      OR noc_code::text           ILIKE '%' || term || '%'
      OR job_title::text          ILIKE '%' || term || '%';
$function$

CREATE OR REPLACE FUNCTION public.rpc_suggest_hot_leads_new(term text, p_limit integer DEFAULT 10)
 RETURNS TABLE(suggestion text, source_col text)
 LANGUAGE sql
 STABLE
AS $function$
WITH numbered AS (
  SELECT
    suggestion,
    source_col,
    ROW_NUMBER() OVER (
      PARTITION BY suggestion
      ORDER BY source_col
    ) AS rn
  FROM public.hot_leads_new_suggestions
  WHERE
    suggestion ILIKE term || '%'
    AND source_col NOT IN ('job_local_id', 'lead_local_id' , 'job_local_id_formular' , 'lead_local_id_formular')
)
SELECT
  suggestion,
  source_col
FROM numbered
WHERE rn = 1
ORDER BY suggestion
LIMIT p_limit;
$function$

CREATE OR REPLACE FUNCTION public.rpc_suggest_lmia(term text, p_limit integer DEFAULT 10)
 RETURNS TABLE(suggestion text, source_col text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
WITH numbered AS (
  SELECT
    suggestion,
    source_col,
    ROW_NUMBER() OVER (
      PARTITION BY suggestion
      ORDER BY source_col
    ) AS rn
  FROM public.lmia_suggestions
  WHERE suggestion ILIKE term || '%'
)
SELECT suggestion, source_col
  FROM numbered
 WHERE rn = 1
 ORDER BY suggestion
 LIMIT p_limit;
$function$

CREATE OR REPLACE FUNCTION public.set_limit(real)
 RETURNS real
 LANGUAGE c
 STRICT
AS '$libdir/pg_trgm', $function$set_limit$function$

CREATE OR REPLACE FUNCTION public.show_limit()
 RETURNS real
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_limit$function$

CREATE OR REPLACE FUNCTION public.show_trgm(text)
 RETURNS text[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_trgm$function$

CREATE OR REPLACE FUNCTION public.similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity$function$

CREATE OR REPLACE FUNCTION public.similarity_dist(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_dist$function$

CREATE OR REPLACE FUNCTION public.similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_op$function$

CREATE OR REPLACE FUNCTION public.strict_word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity$function$

CREATE OR REPLACE FUNCTION public.strict_word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_commutator_op$function$

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_commutator_op$function$

CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_op$function$

CREATE OR REPLACE FUNCTION public.strict_word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_op$function$

CREATE OR REPLACE FUNCTION public.suggest_lmia(p_field text, p_q text, p_limit integer DEFAULT 10)
 RETURNS TABLE(field text, suggestion text, hits bigint)
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  q text := lower(coalesce(btrim(p_q), ''));
  L int  := length(coalesce(btrim(p_q), ''));
BEGIN
  -- GLOBAL mode: search across all whitelisted fields
  IF p_field IS NULL OR btrim(p_field) = '' OR lower(p_field) IN ('all','*') THEN
    RETURN QUERY
    WITH i AS (SELECT q, L)
    SELECT
      s.src_field AS field,
      s.suggestion,
      s.hits
    FROM (
      SELECT 'territory'::text AS src_field, territory::text AS suggestion, COUNT(*)::bigint AS hits,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(territory), i.q), 0) END AS sim
        FROM public.lmia, i
       WHERE territory IS NOT NULL AND territory <> ''
         AND (i.L = 0 OR (i.L < 3 AND lower(territory) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(territory) LIKE '%' || i.q || '%'))
       GROUP BY territory, i.q, i.L

      UNION ALL
      SELECT 'program', program, COUNT(*)::bigint,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(program), i.q), 0) END
        FROM public.lmia, i
       WHERE program IS NOT NULL AND program <> ''
         AND (i.L = 0 OR (i.L < 3 AND lower(program) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(program) LIKE '%' || i.q || '%'))
       GROUP BY program, i.q, i.L

      UNION ALL
      SELECT 'city', city, COUNT(*)::bigint,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(city), i.q), 0) END
        FROM public.lmia, i
       WHERE city IS NOT NULL AND city <> ''
         AND (i.L = 0 OR (i.L < 3 AND lower(city) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(city) LIKE '%' || i.q || '%'))
       GROUP BY city, i.q, i.L

      UNION ALL
      SELECT 'postal_code', postal_code, COUNT(*)::bigint,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(postal_code), i.q), 0) END
        FROM public.lmia, i
       WHERE postal_code IS NOT NULL AND postal_code <> ''
         AND (i.L = 0 OR (i.L < 3 AND lower(postal_code) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(postal_code) LIKE '%' || i.q || '%'))
       GROUP BY postal_code, i.q, i.L

      UNION ALL
      SELECT 'lmia_period', lmia_period, COUNT(*)::bigint,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(lmia_period), i.q), 0) END
        FROM public.lmia, i
       WHERE lmia_period IS NOT NULL AND lmia_period <> ''
         AND (i.L = 0 OR (i.L < 3 AND lower(lmia_period) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(lmia_period) LIKE '%' || i.q || '%'))
       GROUP BY lmia_period, i.q, i.L

      UNION ALL
      SELECT 'lmia_year', lmia_year::text, COUNT(*)::bigint,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(lmia_year::text), i.q), 0) END
        FROM public.lmia, i
       WHERE lmia_year IS NOT NULL
         AND (i.L = 0 OR (i.L < 3 AND lower(lmia_year::text) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(lmia_year::text) LIKE '%' || i.q || '%'))
       GROUP BY lmia_year, i.q, i.L

      UNION ALL
      SELECT 'priority_occupation', priority_occupation, COUNT(*)::bigint,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(priority_occupation), i.q), 0) END
        FROM public.lmia, i
       WHERE priority_occupation IS NOT NULL AND priority_occupation <> ''
         AND (i.L = 0 OR (i.L < 3 AND lower(priority_occupation) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(priority_occupation) LIKE '%' || i.q || '%'))
       GROUP BY priority_occupation, i.q, i.L

      UNION ALL
      SELECT 'employer', employer, COUNT(*)::bigint,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(employer), i.q), 0) END
        FROM public.lmia, i
       WHERE employer IS NOT NULL AND employer <> ''
         AND (i.L = 0 OR (i.L < 3 AND lower(employer) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(employer) LIKE '%' || i.q || '%'))
       GROUP BY employer, i.q, i.L

      UNION ALL
      SELECT 'noc_code', noc_code, COUNT(*)::bigint,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(noc_code), i.q), 0) END
        FROM public.lmia, i
       WHERE noc_code IS NOT NULL AND noc_code <> ''
         AND (i.L = 0 OR (i.L < 3 AND lower(noc_code) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(noc_code) LIKE '%' || i.q || '%'))
       GROUP BY noc_code, i.q, i.L

      UNION ALL
      SELECT 'job_title', job_title, COUNT(*)::bigint,
             CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(job_title), i.q), 0) END
        FROM public.lmia, i
       WHERE job_title IS NOT NULL AND job_title <> ''
         AND (i.L = 0 OR (i.L < 3 AND lower(job_title) LIKE i.q || '%')
                      OR (i.L >= 3 AND lower(job_title) LIKE '%' || i.q || '%'))
       GROUP BY job_title, i.q, i.L
    ) AS s
    ORDER BY s.sim DESC, s.hits DESC, s.suggestion ASC
    LIMIT COALESCE(p_limit, 10);

  ELSE
    -- SINGLE field mode
    RETURN QUERY
    WITH i AS (SELECT q, L)
    SELECT
      p_field::text AS field,
      s.suggestion,
      s.hits
    FROM (
      SELECT
        CASE p_field
          WHEN 'territory'            THEN territory::text
          WHEN 'program'              THEN program::text
          WHEN 'city'                 THEN city::text
          WHEN 'postal_code'          THEN postal_code::text
          WHEN 'lmia_period'          THEN lmia_period::text
          WHEN 'lmia_year'            THEN lmia_year::text
          WHEN 'priority_occupation'  THEN priority_occupation::text
          WHEN 'employer'             THEN employer::text
          WHEN 'noc_code'             THEN noc_code::text
          WHEN 'job_title'            THEN job_title::text
        END AS suggestion,
        COUNT(*)::bigint AS hits,
        CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(
          CASE p_field
            WHEN 'territory'            THEN territory::text
            WHEN 'program'              THEN program::text
            WHEN 'city'                 THEN city::text
            WHEN 'postal_code'          THEN postal_code::text
            WHEN 'lmia_period'          THEN lmia_period::text
            WHEN 'lmia_year'            THEN lmia_year::text
            WHEN 'priority_occupation'  THEN priority_occupation::text
            WHEN 'employer'             THEN employer::text
            WHEN 'noc_code'             THEN noc_code::text
            WHEN 'job_title'            THEN job_title::text
          END
        ), i.q), 0) END AS sim
      FROM public.lmia, i
      WHERE
        CASE p_field
          WHEN 'territory'            THEN territory IS NOT NULL AND territory <> ''
          WHEN 'program'              THEN program IS NOT NULL AND program <> ''
          WHEN 'city'                 THEN city IS NOT NULL AND city <> ''
          WHEN 'postal_code'          THEN postal_code IS NOT NULL AND postal_code <> ''
          WHEN 'lmia_period'          THEN lmia_period IS NOT NULL AND lmia_period <> ''
          WHEN 'lmia_year'            THEN lmia_year IS NOT NULL
          WHEN 'priority_occupation'  THEN priority_occupation IS NOT NULL AND priority_occupation <> ''
          WHEN 'employer'             THEN employer IS NOT NULL AND employer <> ''
          WHEN 'noc_code'             THEN noc_code IS NOT NULL AND noc_code <> ''
          WHEN 'job_title'            THEN job_title IS NOT NULL AND job_title <> ''
        END
        AND (
          i.L = 0
          OR (i.L < 3 AND lower(
            CASE p_field
              WHEN 'territory'            THEN territory::text
              WHEN 'program'              THEN program::text
              WHEN 'city'                 THEN city::text
              WHEN 'postal_code'          THEN postal_code::text
              WHEN 'lmia_period'          THEN lmia_period::text
              WHEN 'lmia_year'            THEN lmia_year::text
              WHEN 'priority_occupation'  THEN priority_occupation::text
              WHEN 'employer'             THEN employer::text
              WHEN 'noc_code'             THEN noc_code::text
              WHEN 'job_title'            THEN job_title::text
            END
          ) LIKE i.q || '%')
          OR (i.L >= 3 AND lower(
            CASE p_field
              WHEN 'territory'            THEN territory::text
              WHEN 'program'              THEN program::text
              WHEN 'city'                 THEN city::text
              WHEN 'postal_code'          THEN postal_code::text
              WHEN 'lmia_period'          THEN lmia_period::text
              WHEN 'lmia_year'            THEN lmia_year::text
              WHEN 'priority_occupation'  THEN priority_occupation::text
              WHEN 'employer'             THEN employer::text
              WHEN 'noc_code'             THEN noc_code::text
              WHEN 'job_title'            THEN job_title::text
            END
          ) LIKE '%' || i.q || '%')
        )
      GROUP BY p_field, i.q, i.L,
        CASE p_field
          WHEN 'territory'            THEN territory::text
          WHEN 'program'              THEN program::text
          WHEN 'city'                 THEN city::text
          WHEN 'postal_code'          THEN postal_code::text
          WHEN 'lmia_period'          THEN lmia_period::text
          WHEN 'lmia_year'            THEN lmia_year::text
          WHEN 'priority_occupation'  THEN priority_occupation::text
          WHEN 'employer'             THEN employer::text
          WHEN 'noc_code'             THEN noc_code::text
          WHEN 'job_title'            THEN job_title::text
        END
    ) AS s
    ORDER BY s.sim DESC, s.hits DESC, s.suggestion ASC
    LIMIT COALESCE(p_limit, 10);
  END IF;
END
$function$

CREATE OR REPLACE FUNCTION public.suggest_location(p_q text, p_limit integer DEFAULT 5)
 RETURNS TABLE(city text, province text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT DISTINCT l.city, l.territory as province
    FROM lmia l
    WHERE 
        (l.city ILIKE p_q || '%' OR l.territory ILIKE p_q || '%')
        AND l.city IS NOT NULL AND l.territory IS NOT NULL
    LIMIT p_limit;
END;
$function$

CREATE OR REPLACE FUNCTION public.suggest_trending_job(p_field text, p_q text, p_limit integer DEFAULT 10)
 RETURNS TABLE(field text, suggestion text, hits bigint)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  q text := lower(coalesce(btrim(p_q), ''));
  L int  := length(coalesce(btrim(p_q), ''));
BEGIN
  -- GLOBAL MODE: search all whitelisted columns
  IF p_field IS NULL OR btrim(p_field) = '' OR lower(p_field) IN ('all','*') THEN
    RETURN QUERY
    WITH i AS (SELECT q AS q, L AS L)
    SELECT
      u.field, u.suggestion, u.hits
    FROM (
      -- state
      SELECT
        'state'::text AS field,
        state::text   AS suggestion,
        COUNT(*)::bigint AS hits,
        CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(state), i.q), 0) END AS sim
      FROM public.trending_job, i
      WHERE state IS NOT NULL AND state <> ''
        AND (i.L = 0 OR (i.L < 3 AND lower(state) LIKE i.q || '%') OR (i.L >= 3 AND lower(state) LIKE '%' || i.q || '%'))
      GROUP BY state, i.q, i.L

      UNION ALL
      -- city
      SELECT
        'city', city, COUNT(*)::bigint,
        CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(city), i.q), 0) END
      FROM public.trending_job, i
      WHERE city IS NOT NULL AND city <> ''
        AND (i.L = 0 OR (i.L < 3 AND lower(city) LIKE i.q || '%') OR (i.L >= 3 AND lower(city) LIKE '%' || i.q || '%'))
      GROUP BY city, i.q, i.L

      UNION ALL
      -- category
      SELECT
        'category', category, COUNT(*)::bigint,
        CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(category), i.q), 0) END
      FROM public.trending_job, i
      WHERE category IS NOT NULL AND category <> ''
        AND (i.L = 0 OR (i.L < 3 AND lower(category) LIKE i.q || '%') OR (i.L >= 3 AND lower(category) LIKE '%' || i.q || '%'))
      GROUP BY category, i.q, i.L

      UNION ALL
      -- job_title
      SELECT
        'job_title', job_title, COUNT(*)::bigint,
        CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(job_title), i.q), 0) END
      FROM public.trending_job, i
      WHERE job_title IS NOT NULL AND job_title <> ''
        AND (i.L = 0 OR (i.L < 3 AND lower(job_title) LIKE i.q || '%') OR (i.L >= 3 AND lower(job_title) LIKE '%' || i.q || '%'))
      GROUP BY job_title, i.q, i.L

      UNION ALL
      -- noc_code
      SELECT
        'noc_code', noc_code, COUNT(*)::bigint,
        CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(noc_code), i.q), 0) END
      FROM public.trending_job, i
      WHERE noc_code IS NOT NULL AND noc_code <> ''
        AND (i.L = 0 OR (i.L < 3 AND lower(noc_code) LIKE i.q || '%') OR (i.L >= 3 AND lower(noc_code) LIKE '%' || i.q || '%'))
      GROUP BY noc_code, i.q, i.L

      UNION ALL
      -- employer
      SELECT
        'employer', employer, COUNT(*)::bigint,
        CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(employer), i.q), 0) END
      FROM public.trending_job, i
      WHERE employer IS NOT NULL AND employer <> ''
        AND (i.L = 0 OR (i.L < 3 AND lower(employer) LIKE i.q || '%') OR (i.L >= 3 AND lower(employer) LIKE '%' || i.q || '%'))
      GROUP BY employer, i.q, i.L
    ) AS u(field, suggestion, hits, sim)
    ORDER BY u.sim DESC, u.hits DESC, u.suggestion
    LIMIT p_limit;
    RETURN;
  END IF;

  -- SINGLE-FIELD MODE (explicit branches, with explicit aliases)
  IF lower(p_field) = 'state' THEN
    RETURN QUERY
    WITH i AS (SELECT q AS q, L AS L)
    SELECT
      'state'   AS field,
      state     AS suggestion,
      COUNT(*)::bigint AS hits
    FROM public.trending_job, i
    WHERE state IS NOT NULL AND state <> ''
      AND (i.L = 0 OR (i.L < 3 AND lower(state) LIKE i.q || '%') OR (i.L >= 3 AND lower(state) LIKE '%' || i.q || '%'))
    GROUP BY state, i.q, i.L
    ORDER BY
      CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(state), i.q), 0) END DESC,
      COUNT(*) DESC, state
    LIMIT p_limit;

  ELSIF lower(p_field) = 'city' THEN
    RETURN QUERY
    WITH i AS (SELECT q AS q, L AS L)
    SELECT 'city' AS field, city AS suggestion, COUNT(*)::bigint AS hits
    FROM public.trending_job, i
    WHERE city IS NOT NULL AND city <> ''
      AND (i.L = 0 OR (i.L < 3 AND lower(city) LIKE i.q || '%') OR (i.L >= 3 AND lower(city) LIKE '%' || i.q || '%'))
    GROUP BY city, i.q, i.L
    ORDER BY
      CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(city), i.q), 0) END DESC,
      COUNT(*) DESC, city
    LIMIT p_limit;

  ELSIF lower(p_field) = 'category' THEN
    RETURN QUERY
    WITH i AS (SELECT q AS q, L AS L)
    SELECT 'category', category AS suggestion, COUNT(*)::bigint AS hits
    FROM public.trending_job, i
    WHERE category IS NOT NULL AND category <> ''
      AND (i.L = 0 OR (i.L < 3 AND lower(category) LIKE i.q || '%') OR (i.L >= 3 AND lower(category) LIKE '%' || i.q || '%'))
    GROUP BY category, i.q, i.L
    ORDER BY
      CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(category), i.q), 0) END DESC,
      COUNT(*) DESC, category
    LIMIT p_limit;

  ELSIF lower(p_field) = 'job_title' THEN
    RETURN QUERY
    WITH i AS (SELECT q AS q, L AS L)
    SELECT 'job_title', job_title AS suggestion, COUNT(*)::bigint AS hits
    FROM public.trending_job, i
    WHERE job_title IS NOT NULL AND job_title <> ''
      AND (i.L = 0 OR (i.L < 3 AND lower(job_title) LIKE i.q || '%') OR (i.L >= 3 AND lower(job_title) LIKE '%' || i.q || '%'))
    GROUP BY job_title, i.q, i.L
    ORDER BY
      CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(job_title), i.q), 0) END DESC,
      COUNT(*) DESC, job_title
    LIMIT p_limit;

  ELSIF lower(p_field) = 'noc_code' THEN
    RETURN QUERY
    WITH i AS (SELECT q AS q, L AS L)
    SELECT 'noc_code', noc_code AS suggestion, COUNT(*)::bigint AS hits
    FROM public.trending_job, i
    WHERE noc_code IS NOT NULL AND noc_code <> ''
      AND (i.L = 0 OR (i.L < 3 AND lower(noc_code) LIKE i.q || '%') OR (i.L >= 3 AND lower(noc_code) LIKE '%' || i.q || '%'))
    GROUP BY noc_code, i.q, i.L
    ORDER BY
      CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(noc_code), i.q), 0) END DESC,
      COUNT(*) DESC, noc_code
    LIMIT p_limit;

  ELSIF lower(p_field) = 'employer' THEN
    RETURN QUERY
    WITH i AS (SELECT q AS q, L AS L)
    SELECT 'employer', employer AS suggestion, COUNT(*)::bigint AS hits
    FROM public.trending_job, i
    WHERE employer IS NOT NULL AND employer <> ''
      AND (i.L = 0 OR (i.L < 3 AND lower(employer) LIKE i.q || '%') OR (i.L >= 3 AND lower(employer) LIKE '%' || i.q || '%'))
    GROUP BY employer, i.q, i.L
    ORDER BY
      CASE WHEN i.L < 3 THEN 1.0 ELSE GREATEST(similarity(lower(employer), i.q), 0) END DESC,
      COUNT(*) DESC, employer
    LIMIT p_limit;

  ELSE
    RAISE EXCEPTION 'unsupported field: %', p_field;
  END IF;
END
$function$

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$

CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$

CREATE OR REPLACE FUNCTION public.word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity$function$

CREATE OR REPLACE FUNCTION public.word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_commutator_op$function$

CREATE OR REPLACE FUNCTION public.word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_commutator_op$function$

CREATE OR REPLACE FUNCTION public.word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_op$function$

CREATE OR REPLACE FUNCTION public.word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_op$function$

