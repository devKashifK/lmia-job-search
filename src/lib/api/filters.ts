import db from '@/db';

export async function getFacetCounts(
    table: string,
    column: string,
    filters: any,
    searchTerm: string | null = null,
    searchField: string | null = null
) {
    console.log('DEBUG getFacetCounts:', { table, column, filters, searchTerm, searchField });

    // Try RPC first for performance
    const { data: rpcData, error: rpcError } = await db.rpc(
        'get_facet_counts_with_filters',
        {
            p_table_name: table,
            p_column_name: column,
            p_filters: filters,
            p_search_field: searchField !== 'all' ? searchField : null,
            p_search_term: searchTerm || null,
        }
    );

    console.log('DEBUG RPC result:', { rpcDataLength: rpcData?.length, rpcError });

    if (!rpcError && rpcData && (rpcData as any[]).length > 0) {
        const firstItem = (rpcData as any[])[0];
        console.log('RPC first item shape:', firstItem);
        // The RPC may return {value, count} or {column_name, count} — find the right key
        const valueKey = 'value' in firstItem
            ? 'value'
            : Object.keys(firstItem).find(k => k !== 'count') ?? 'value';
        console.log('Using value key:', valueKey);
        return (rpcData as any[])
            .filter((d) => d[valueKey] != null && d[valueKey] !== '')
            .map((d) => ({
                value: String(d[valueKey]),
                count: Number(d.count ?? 0)
            }));
    }
    if (!rpcError && rpcData) return [];

    console.warn('RPC failed for facet counts, using fallback:', rpcError?.message);

    // Fallback: query the column directly
    let q = db.from(table).select(column);

    // Apply filters
    Object.entries(filters).forEach(([key, val]) => {
        if (!val || val === 'all') return;
        if (key === 'salary_min') q = q.gte('min_wage', val);
        else if (key === 'salary_max') q = q.lte('max_wage', val);
        else q = q.eq(key, val);
    });

    // Apply search
    if (searchTerm && searchField && searchField !== 'all') {
        q = q.ilike(searchField, `%${searchTerm}%`);
    }

    const { data, error } = await q.limit(50000);

    if (error) {
        console.error('Error fetching fallback facets:', JSON.stringify(error));
        return [];
    }

    const counts: Record<string, number> = {};
    (data || []).forEach((row: any) => {
        const val = row[column];
        if (val) counts[val] = (counts[val] || 0) + 1;
    });

    const result = Object.entries(counts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);

    console.log('DEBUG fallback returning:', result.length, 'items');
    return result;
}

export async function getCompanySuggestions(table: string, query: string) {
    const { data, error } = await db
        .from(table)
        .select('employer')
        .ilike('employer', `%${query}%`)
        .limit(10);

    if (error) {
        console.error('Error fetching company suggestions:', error);
        return [];
    }

    return Array.from(new Set(data.map((d: any) => d.employer)));
}
