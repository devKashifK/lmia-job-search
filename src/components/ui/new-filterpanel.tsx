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

/** Distinct values for a facet column (lightweight; deduped client-side). */
export function useFilterColumnAttributes(column: string) {
  const sp = useSearchParams();
  const params = useParams<{ search?: string }>();
  const table = (sp.get('t') ?? 'trending_job').trim();
  const field = (sp.get('field') ?? 'all').trim().toLowerCase();
  const searchTerm =
    typeof params?.search === 'string' ? decodeURIComponent(params.search) : '';

  return useQuery({
    queryKey: ['facet-values', table, column, field, searchTerm],
    queryFn: async () => {
      let q = db.from(table).select(column);
      if (searchTerm && field && field !== 'all') {
        q = q.ilike(field as any, `%${searchTerm}%`);
      }
      const { data, error } = await q.limit(10000);
      if (error) throw new Error(error.message);

      const uniq = Array.from(
        new Set(
          (data ?? [])
            .map((row: any) =>
              row?.[column] == null ? '' : String(row[column]).trim()
            )
            .filter(Boolean)
        )
      );
      return uniq.sort((a, b) => a.localeCompare(b));
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

  // local chips state (derived from URL)
  const [selectedFilters, setSelectedFilters] = React.useState<
    SelectedFilter[]
  >([]);

  React.useEffect(() => {
    const keys = [
      'state',
      'city',
      'category',
      'job_title',
      'noc_code',
      'employer',
    ];
    const next: SelectedFilter[] = [];
    for (const k of keys) {
      const vals = sp.getAll(k);
      for (const v of vals) next.push({ column: k, value: v });
    }
    setSelectedFilters(next);
  }, [sp]);

  // read date range chips from URL (optional display)
  const dateFrom = sp.get('date_from');
  const dateTo = sp.get('date_to');

  const clearDateRange = () => {
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.delete('date_from');
    nextSp.delete('date_to');
    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
  };

  // collapsed sections (state & city open by default)
  const [collapsedSections, setCollapsedSections] = React.useState<
    Record<string, boolean>
  >({});
  React.useEffect(() => {
    if (!columns) return;
    if (Object.keys(collapsedSections).length > 0) return;
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      initial[col.accessorKey] = !(
        col.accessorKey === 'state' || col.accessorKey === 'city'
      );
    });
    setCollapsedSections(initial);
  }, [columns, collapsedSections]);

  const toggleSection = (column: string) =>
    setCollapsedSections((prev) => ({ ...prev, [column]: !prev[column] }));

  const handleSelectedFilters = (column: string, value: string) => {
    // Only update local chips; URL is updated inside FilterAttributes
    setSelectedFilters((prev) => {
      const exists = prev.some((f) => f.column === column && f.value === value);
      return exists
        ? prev.filter((f) => !(f.column === column && f.value === value))
        : [...prev, { column, value }];
    });
  };

  const handleRemoveFilter = (column: string, value: string) => {
    // 1) Update URL
    const nextSp = new URLSearchParams(sp.toString());
    const current = new Set(nextSp.getAll(column));
    current.delete(value);
    nextSp.delete(column);
    for (const v of current) nextSp.append(column, v);
    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });

    // 2) Update local chips
    setSelectedFilters((prev) =>
      prev.filter((f) => !(f.column === column && f.value === value))
    );
  };

  return (
    <div className="w-64 pr-4 border-r border-gray-200 h-full flex flex-col">
      {/* Compact Header */}
      <div className="px-1 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-500 rounded-md">
              <Filter className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          </div>
          {(selectedFilters.length > 0 || dateFrom || dateTo) && (
            <button
              onClick={() => {
                // Clear all filters
                const nextSp = new URLSearchParams();
                const preserveParams = ['t', 'field', 'page', 'pageSize'];
                preserveParams.forEach((param) => {
                  const value = sp.get(param);
                  if (value) nextSp.set(param, value);
                });
                nextSp.set('page', '1');
                router.push(`${pathname}?${nextSp.toString()}`, {
                  scroll: false,
                });
              }}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Compact Active Filters */}
      {(selectedFilters.length > 0 || dateFrom || dateTo) && (
        <div className="px-1 py-3 border-b border-gray-200">
          <div className="space-y-1.5">
            {selectedFilters.map((filter) => (
              <div
                key={`${filter.column}-${filter.value}`}
                className="group flex items-center justify-between py-1.5 px-2.5 bg-white rounded-md border border-gray-200 hover:border-brand-300 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0" />
                  <span className="text-xs text-gray-700 truncate">
                    {filter.value}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleRemoveFilter(filter.column, filter.value)
                  }
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-100 rounded transition-all"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ))}
            {(dateFrom || dateTo) && (
              <div className="group flex items-center justify-between py-1.5 px-2.5 bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-700 truncate">
                    {fmtDate(dateFrom)} - {fmtDate(dateTo)}
                  </span>
                </div>
                <button
                  onClick={clearDateRange}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-100 rounded transition-all"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compact Filter Sections */}
      <div className="flex-1 overflow-y-auto px-0">
        {columns && (
          <div className="py-2 space-y-3">
            {columns.map((column) => {
              const isCollapsed = !!collapsedSections[column.accessorKey];
              const isDate = column.accessorKey === 'date_of_job_posting';
              const activeFilters = selectedFilters.filter(
                (f) => f.column === column.accessorKey
              ).length;
              const FilterIcon = getFilterIcon(column.accessorKey);

              return (
                <div key={column.accessorKey}>
                  <button
                    className="w-full flex items-center justify-between py-2 group"
                    onClick={() => toggleSection(column.accessorKey)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-md transition-colors ${
                          activeFilters > 0
                            ? 'bg-brand-100 text-brand-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <FilterIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        <AttributeName name={column.accessorKey} />
                      </span>
                      {activeFilters > 0 && (
                        <span className="bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {activeFilters}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isCollapsed ? 'rotate-0' : 'rotate-180'
                      }`}
                    />
                  </button>

                  {!isCollapsed && (
                    <div className="mt-2 mb-2">
                      {isDate ? (
                        <DateRangeFilter />
                      ) : (
                        <FilterAttributes
                          column={column.accessorKey}
                          selectedFilters={selectedFilters}
                          handleSelectedFilters={handleSelectedFilters}
                        />
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

function FilterAttributes({
  column,
  selectedFilters,
  handleSelectedFilters,
}: {
  column: string;
  selectedFilters: SelectedFilter[];
  handleSelectedFilters: (column: string, value: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // facet options
  const { data, isLoading, error } = useFilterColumnAttributes(column);

  // initialize selected values from URL (?column=A&column=B)
  const [localFilters, setLocalFilters] = React.useState(new Set<string>());
  React.useEffect(() => {
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
    return data.filter((v) =>
      v.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const sortedData = React.useMemo(() => {
    return filteredData.slice().sort((a, b) => a.localeCompare(b));
  }, [filteredData]);

  const handleFilterUpdate = (accessorKey: string, value: string) => {
    // derive from URL (single source of truth)
    const current = new Set(sp.getAll(accessorKey));
    current.has(value) ? current.delete(value) : current.add(value);

    // write to URL
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.delete(accessorKey);
    for (const v of current) nextSp.append(accessorKey, v);
    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });

    // local + chips
    setLocalFilters(new Set(current));
    handleSelectedFilters(accessorKey, value);
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
    <div className="space-y-3">
      {/* Compact Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-brand-400 transition-colors"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Compact Options List */}
      <div className="max-h-48 overflow-y-auto">
        <div className="space-y-1">
          {sortedData.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-6">
              {searchQuery ? 'No results found' : 'No options'}
            </div>
          ) : (
            sortedData.map((value) => {
              const isSelected = localFilters.has(value);
              return (
                <button
                  key={value}
                  onClick={() => handleFilterUpdate(column, value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-1 text-sm rounded-md text-left transition-colors',
                    isSelected
                      ? 'bg-brand-50 text-brand-900 border border-brand-200'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                  )}
                >
                  <span className="truncate">{value}</span>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0 ml-2" />
                  )}
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
    from: parseISO(sp.get('date_from')),
    to: parseISO(sp.get('date_to')),
  });

  const applyRange = (r?: { from?: Date; to?: Date }) => {
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors text-left">
          <span className="text-gray-700 truncate">{label}</span>
          <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="right">
        <div className="p-4">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => setRange(r || { from: undefined, to: undefined })}
            numberOfMonths={1}
          />
        </div>
        <div className="flex gap-2 p-4 border-t border-gray-100">
          <Button
            size="sm"
            onClick={() => {
              applyRange(range);
              setOpen(false);
            }}
            disabled={!range.from && !range.to}
            className="flex-1"
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
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function useFilterPanelColumns() {
  const sp = useSearchParams();
  const table = (sp.get('t') ?? 'trending_job').trim();
  const field = (sp.get('field') ?? 'all').trim();

  if (table === 'lmia') return lmiaColumns;

  let cols = hotLeadsColumns;
  if (field === 'job_title') {
    cols = cols.filter((f) => f.accessorKey !== 'noc_code');
  }
  return cols;
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
