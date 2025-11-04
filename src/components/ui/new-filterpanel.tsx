'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  ChevronDown,
  Calendar as CalendarIcon,
  Search,
  Filter,
  MapPin,
  Building2,
  Briefcase,
  Tag,
  Hash,
  User,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';
import {
  usePathname,
  useRouter,
  useSearchParams,
  useParams,
} from 'next/navigation';
import db from '@/db';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { hotLeadsColumns, lmiaColumns } from '@/components/filters/column-def';
import { AttributeName } from '@/helpers/attribute';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { format, parseISO, isValid } from 'date-fns';

// ---------------------------
// Config / helpers
// ---------------------------

const USE_NORMALIZED = true as const; // flip to false if you DID NOT create *_norm columns

const NORM_MAP = {
  state: 'state_norm',
  city: 'city_norm',
  category: 'category_norm',
  job_title: 'job_title_norm',
  noc_code: 'noc_code_norm',
  employer: 'employer_norm',
} as const;

type SelectedFilter = { column: string; value: string };

function toPositiveInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

// Helper function to get appropriate icons for filter categories
function getFilterIcon(column: string) {
  switch (column) {
    case 'state':
    case 'city':
      return MapPin;
    case 'employer':
      return Building2;
    case 'job_title':
    case 'occupation_title':
      return Briefcase;
    case 'category':
      return Tag;
    case 'noc_code':
      return Hash;
    case 'date_of_job_posting':
      return CalendarIcon;
    default:
      return Filter;
  }
}

/** Distinct values for a facet column with counts. */
export function useFilterColumnAttributes(
  column: string,
  stateFilter?: string
) {
  const sp = useSearchParams();
  const params = useParams<{ search?: string }>();
  const table = (sp?.get('t') ?? 'trending_job').trim();
  const field = (sp?.get('field') ?? 'all').trim().toLowerCase();
  const searchTerm =
    typeof params?.search === 'string' ? decodeURIComponent(params.search) : '';

  // Get all active filters from URL (excluding the current column to show available options)
  const activeFilters = React.useMemo(() => {
    const filters: Record<string, string[]> = {};
    const filterKeys = [
      'state',
      'city',
      'category',
      'job_title',
      'noc_code',
      'employer',
      'territory',
    ];

    filterKeys.forEach((key) => {
      // Skip the column we're getting facets for
      if (key === column) return;
      const values = sp?.getAll(key) ?? [];
      if (values.length > 0) {
        filters[key] = values;
      }
    });
    return filters;
  }, [sp, column]);

  // Get date filters
  const dateFrom = sp?.get('date_from');
  const dateTo = sp?.get('date_to');

  // Create a stable key for all filters
  const filtersKey = JSON.stringify({ activeFilters, dateFrom, dateTo });

  return useQuery({
    queryKey: [
      'facet-values',
      table,
      column,
      field,
      searchTerm,
      stateFilter,
      filtersKey,
    ],
    queryFn: async () => {
      // Build filters object for RPC function
      const filters: Record<
        string,
        string | string[] | { gte?: string | number; lte?: string | number }
      > = {};

      // Add stateFilter for city column
      if (column === 'city' && stateFilter) {
        filters.state = stateFilter;
      }

      // Add all other active filters
      Object.entries(activeFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          filters[key] = values.length === 1 ? values[0] : values;
        }
      });

      // Add date range filters
      if (table === 'trending_job') {
        if (dateFrom || dateTo) {
          filters.date_of_job_posting = {};
          if (dateFrom) filters.date_of_job_posting.gte = dateFrom;
          if (dateTo) filters.date_of_job_posting.lte = dateTo;
        }
      } else if (table === 'lmia') {
        const yf = dateFrom ? Number(dateFrom.slice(0, 4)) : undefined;
        const yt = dateTo ? Number(dateTo.slice(0, 4)) : undefined;
        if (Number.isFinite(yf) || Number.isFinite(yt)) {
          filters.lmia_year = {};
          if (Number.isFinite(yf)) filters.lmia_year.gte = yf;
          if (Number.isFinite(yt)) filters.lmia_year.lte = yt;
        }
      }

      // Try RPC function first (fast and accurate)
      try {
        const { data: rpcData, error: rpcError } = await db.rpc(
          'get_facet_counts_with_filters',
          {
            p_table_name: table,
            p_column_name: column,
            p_filters: filters,
            p_search_field: searchTerm && field !== 'all' ? field : null,
            p_search_term: searchTerm || null,
          }
        );

        if (!rpcError && rpcData) {
          return rpcData
            .filter(
              (item: { name: string; count: number }) =>
                item.name && item.name.trim()
            )
            .sort(
              (
                a: { name: string; count: number },
                b: { name: string; count: number }
              ) => b.count - a.count
            );
        }
      } catch (err) {
        console.warn(
          'RPC function not available, falling back to client-side aggregation',
          err
        );
      }

      // Fallback: Client-side aggregation
      let q = db.from(table).select(column);

      // Apply search term filter
      if (searchTerm && field && field !== 'all') {
        q = q.ilike(field as any, `%${searchTerm}%`);
      }

      // Apply stateFilter for city column
      if (column === 'city' && stateFilter) {
        q = q.eq('state', stateFilter);
      }

      // Apply all other active filters
      Object.entries(activeFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          if (values.length === 1) {
            q = q.eq(key, values[0]);
          } else {
            q = q.in(key, values);
          }
        }
      });

      // Apply date range filters
      if (table === 'trending_job') {
        if (dateFrom) q = q.gte('date_of_job_posting', dateFrom);
        if (dateTo) q = q.lte('date_of_job_posting', dateTo);
      } else if (table === 'lmia') {
        const yf = dateFrom ? Number(dateFrom.slice(0, 4)) : undefined;
        const yt = dateTo ? Number(dateTo.slice(0, 4)) : undefined;
        if (Number.isFinite(yf)) q = q.gte('lmia_year', yf as number);
        if (Number.isFinite(yt)) q = q.lte('lmia_year', yt as number);
      }

      const { data, error } = await q.limit(50000); // Higher limit for fallback
      if (error) throw new Error(error.message);

      // Count occurrences of each value
      const countMap = new Map<string, number>();
      (data ?? []).forEach((row: any) => {
        const value = row?.[column] == null ? '' : String(row[column]).trim();
        if (value) {
          countMap.set(value, (countMap.get(value) || 0) + 1);
        }
      });

      // Convert to array of objects with name and count, sorted by count descending
      const result = Array.from(countMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return result;
    },
    staleTime: 60_000,
  });
}

// ---------------------------
// Panel
// ---------------------------

export default function NewFilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const columns = useFilterPanelColumns();
  const tableName = (sp?.get('t') ?? 'trending_job').trim(); // 👈 know which table

  // ✅ derive keys from columns so LMIA works too
  const urlFilterKeys = React.useMemo(() => {
    if (!columns) return [];
    const EXCLUDE = new Set([
      'id',
      'RecordID',
      'date_of_job_posting',
      'lmia_year',
    ]);
    return columns
      .map((c) => c.accessorKey)
      .filter((k) => !!k && !EXCLUDE.has(k));
  }, [columns]);

  // collapsed sections (open primary facets)
  const [collapsedSections, setCollapsedSections] = React.useState<
    Record<string, boolean>
  >({});
  React.useEffect(() => {
    if (!columns || Object.keys(collapsedSections).length > 0) return;
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      const openDefault =
        col.accessorKey === 'state' ||
        col.accessorKey === 'city' ||
        col.accessorKey === 'territory'; // LMIA main facet
      initial[col.accessorKey] = !openDefault;
    });
    setCollapsedSections(initial);
  }, [columns, collapsedSections]);

  const toggleSection = (column: string) =>
    setCollapsedSections((prev) => ({ ...prev, [column]: !prev[column] }));

  return (
    <div className="w-full lg:w-48 bg-white lg:border-r lg:border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="px-2 py-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-brand-500 rounded">
            <Filter className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-xs font-semibold text-gray-900">Filters</h2>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto px-0">
        {columns && (
          <div className="py-1 space-y-1">
            {columns.map((column) => {
              // 👇 date facet per table
              const isDate =
                (tableName === 'trending_job' &&
                  column.accessorKey === 'date_of_job_posting') ||
                (tableName === 'lmia' && column.accessorKey === 'lmia_year');

              const isCollapsed = !!collapsedSections[column.accessorKey];
              const activeFilters = sp?.getAll(column.accessorKey)?.length || 0;
              const FilterIcon = getFilterIcon(column.accessorKey);

              return (
                <div key={column.accessorKey}>
                  <button
                    className="w-full flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection(column.accessorKey)}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`p-0.5 rounded transition-colors ${
                          activeFilters > 0
                            ? 'bg-brand-50 border border-brand-200 text-brand-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <FilterIcon className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-xs font-medium text-gray-900">
                        <AttributeName name={column.accessorKey} />
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                        isCollapsed ? 'rotate-0' : 'rotate-180'
                      }`}
                    />
                  </button>

                  {!isCollapsed && (
                    <div className="mt-1 mb-1">
                      {isDate ? (
                        // ✅ same component; your hook already translates dates → lmia_year range
                        <DateRangeFilter />
                      ) : (
                        <FilterAttributes column={column.accessorKey} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function fmtDate(s?: string) {
  if (!s) return '…';
  const d = parseISO(s);
  return isValid(d) ? format(d, 'MMM d, yyyy') : s; // fallback to raw if not ISO
}

function DateRangeChip({
  from,
  to,
  onClear,
}: {
  from?: string;
  to?: string;
  onClear: () => void;
}) {
  const pretty = `${fmtDate(from)} — ${fmtDate(to)}`;
  const raw = `${from ?? '—'} → ${to ?? '—'}`;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            title={raw}
            className="inline-flex max-w-full sm:max-w-[440px] items-center gap-2
                       rounded-full border border-brand-200 bg-brand-50/70 text-brand-800
                       px-3 py-1.5 shadow-sm hover:bg-brand-50 transition-colors"
          >
            {/* <CalendarIcon className="h-3.5 w-3.5 flex-none opacity-80" /> */}

            {/* label + dates; no wrap, dates can truncate */}
            <div className="flex min-w-0 items-center gap-2">
              {/* short label on small screens */}

              {/* full label on >= sm */}

              <span className="text-xs tabular-nums tracking-tight truncate">
                {pretty}
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              aria-label="Clear date range"
              className="flex-none h-6 w-6 rounded-full text-brand-900 hover:bg-brand-100"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <span className="tabular-nums text-[8px]">{raw}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------------------------
// Child: one facet (non-date)
// ---------------------------

function FilterAttributes({ column }: { column: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Get state filter if column is city
  const stateFilter = column === 'city' ? sp?.getAll('state') : undefined;
  const stateFilterValue =
    stateFilter && stateFilter.length > 0 ? stateFilter[0] : undefined;

  // facet options
  const { data, isLoading, error } = useFilterColumnAttributes(
    column,
    stateFilterValue
  );

  // initialize selected values from URL (?column=A&column=B)
  const [localFilters, setLocalFilters] = React.useState(new Set<string>());
  React.useEffect(() => {
    if (!sp) return;
    setLocalFilters(new Set(sp.getAll(column)));
  }, [column, sp]);

  // 🔕 AVAILABILITY TEMPORARILY DISABLED
  // const tableName = (sp.get('t') ?? 'trending_job').trim();
  // const availabilityKey = JSON.stringify(
  //   [...selectedFilters]
  //     .filter((f) => f.column !== column)
  //     .sort((a, b) =>
  //       a.column === b.column ? a.value.localeCompare(b.value) : a.column.localeCompare(b.column)
  //     )
  // );
  // const { data: availability = [] } = useQuery({
  //   queryKey: ['filter-availability', tableName, column, availabilityKey, USE_NORMALIZED],
  //   queryFn: () => Promise.resolve([]),
  //   keepPreviousData: true,
  // });
  // const availableSet = React.useMemo(() => new Set(availability), [availability]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    return data.filter((item: { name: string; count: number }) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const sortedData = React.useMemo(() => {
    // Already sorted by count from the query, just apply filter
    return filteredData;
  }, [filteredData]);

  const handleFilterUpdate = (accessorKey: string, value: string) => {
    if (!sp) return;
    // derive from URL (single source of truth)
    const current = new Set(sp.getAll(accessorKey));
    current.has(value) ? current.delete(value) : current.add(value);

    // write to URL
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.delete(accessorKey);
    for (const v of current) nextSp.append(accessorKey, v);
    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });

    // local
    setLocalFilters(new Set(current));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    );
  }
  if (error) return <div>Error loading attributes.</div>;
  if (!data) return null;

  return (
    <div className="space-y-1 px-1">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
        />
        <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
      </div>

      {/* Options */}
      <div className="max-h-36 overflow-y-auto">
        <div className="space-y-0.5">
          {sortedData.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-3">
              {searchQuery ? 'No results' : 'No options'}
            </div>
          ) : (
            sortedData.map((item) => {
              const isSelected = localFilters.has(item.name);
              return (
                <button
                  key={item.name}
                  onClick={() => handleFilterUpdate(column, item.name)}
                  className={cn(
                    'w-full flex items-center justify-between gap-1.5 px-2 py-1 text-xs rounded text-left transition-colors',
                    isSelected
                      ? 'bg-brand-50 border border-brand-200 text-brand-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <span className="truncate text-[11px] flex-1">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[9px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                      {item.count.toLocaleString()}
                    </span>
                    {isSelected && (
                      <div className="w-1 h-1 bg-brand-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// Date range facet
// ---------------------------

function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const parseISO = (s: string | null) =>
    s ? new Date(`${s}T00:00:00`) : undefined;
  const toISO = (d?: Date) => (d ? d.toISOString().slice(0, 10) : undefined);

  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<{ from?: Date; to?: Date }>({
    from: parseISO(sp?.get('date_from') || null),
    to: parseISO(sp?.get('date_to') || null),
  });

  const applyRange = (r?: { from?: Date; to?: Date }) => {
    if (!sp) return;
    const nextSp = new URLSearchParams(sp.toString());
    // clean first
    nextSp.delete('date_from');
    nextSp.delete('date_to');

    if (r?.from) nextSp.set('date_from', toISO(r.from)!);
    if (r?.to) nextSp.set('date_to', toISO(r.to)!);

    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
  };

  const clear = () => {
    setRange({ from: undefined, to: undefined });
    if (!sp) return;
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.delete('date_from');
    nextSp.delete('date_to');
    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
  };

  const label =
    range.from && range.to
      ? `${toISO(range.from)} → ${toISO(range.to)}`
      : range.from
      ? `${toISO(range.from)} → …`
      : range.to
      ? `… → ${toISO(range.to)}`
      : 'Pick a date range';

  return (
    <div className="px-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between px-2.5 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded hover:bg-white hover:border-brand-500 transition-colors text-left">
            <span className="text-gray-700 truncate text-xs">{label}</span>
            <CalendarIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-2" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="right">
          <div className="p-3">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(r) =>
                setRange(r || { from: undefined, to: undefined })
              }
              numberOfMonths={1}
            />
          </div>
          <div className="flex gap-2 p-3 border-t border-gray-100">
            <Button
              size="sm"
              onClick={() => {
                applyRange(range);
                setOpen(false);
              }}
              disabled={!range.from && !range.to}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-xs"
            >
              Apply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clear();
                setOpen(false);
              }}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function useFilterPanelColumns() {
  const sp = useSearchParams();
  const table = (sp?.get('t') ?? 'trending_job').trim();
  const field = (sp?.get('field') ?? 'all').trim();

  return React.useMemo(() => {
    if (table === 'lmia') return lmiaColumns;

    let cols = hotLeadsColumns;
    if (field === 'job_title') {
      cols = cols.filter((f) => f.accessorKey !== 'noc_code');
    }
    return cols;
  }, [table, field]);
}

// Add custom scrollbar styles to document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(243, 244, 246, 0.5);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, rgb(156, 163, 175), rgb(107, 114, 128));
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, rgb(107, 114, 128), rgb(75, 85, 99));
    }
  `;
  document.head.appendChild(style);
}
