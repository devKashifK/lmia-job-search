'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  Circle,
  X,
  ChevronDown,
  Calendar as CalendarIcon,
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

export default function Newfilterpanel() {
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
    <div className="border-r-2 border-brand-200 pr-8 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">Filters</div>
      </div>

      {(selectedFilters.length > 0 || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFilters.map((filter) => (
            <div
              key={`${filter.column}-${filter.value}`}
              className="flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-xs"
            >
              <span className="font-medium">
                <AttributeName
                  name={filter.column}
                  className="w-3 h-3 text-brand-600"
                />
              </span>
              <span className="mx-1">:</span>
              <span>{filter.value}</span>
              <button
                onClick={() => handleRemoveFilter(filter.column, filter.value)}
                className="ml-1 hover:bg-brand-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {(dateFrom || dateTo) && (
            <DateRangeChip
              from={dateFrom ?? undefined}
              to={dateTo ?? undefined}
              onClear={clearDateRange}
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {columns && (
          <div className="w-full">
            {columns.map((column) => {
              const isCollapsed = !!collapsedSections[column.accessorKey];
              const isDate = column.accessorKey === 'date_of_job_posting';

              return (
                <div
                  key={column.accessorKey}
                  className="border-b border-zinc-100 flex flex-col gap-2 mb-4 pb-4"
                >
                  <div
                    className="text-sm font-medium flex items-center justify-between cursor-pointer select-none"
                    onClick={() => toggleSection(column.accessorKey)}
                  >
                    <span>
                      <AttributeName
                        name={column.accessorKey}
                        className="w-4 h-4 text-gray-400"
                      />
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                        isCollapsed ? 'rotate-0' : 'rotate-180'
                      }`}
                    />
                  </div>

                  {!isCollapsed && (
                    <>
                      {isDate ? (
                        <DateRangeFilter />
                      ) : (
                        <FilterAttributes
                          column={column.accessorKey}
                          selectedFilters={selectedFilters}
                          handleSelectedFilters={handleSelectedFilters}
                        />
                      )}
                    </>
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
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-2 py-1 h-7 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-600"
      />
      <div className="max-h-[300px] overflow-y-auto pretty-scroll">
        {sortedData.map((value) => {
          const isSelected = localFilters.has(value);
          return (
            <div
              key={value}
              role="button"
              tabIndex={0}
              onClick={() => handleFilterUpdate(column, value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  handleFilterUpdate(column, value);
              }}
              className={cn(
                'group flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-200',
                'cursor-pointer hover:bg-brand-100/80 active:bg-brand-200'
              )}
            >
              <div className="w-3.5 h-3.5 flex-shrink-0">
                {isSelected ? (
                  <CheckCircle className="h-3.5 w-3.5 text-brand-600" />
                ) : (
                  <Circle className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </div>
              <span className="truncate flex-1 text-black">{value}</span>
              {isSelected && (
                <span className="text-[10px] text-brand-600/70 group-hover:text-brand-600">
                  selected
                </span>
              )}
            </div>
          );
        })}
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
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal w-full"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="text-[10px]"> {label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => setRange(r || { from: undefined, to: undefined })}
            numberOfMonths={2}
          />
          <div className="flex gap-2 p-2 border-t">
            <Button
              variant="secondary"
              className="w-1/2"
              onClick={() => {
                applyRange(range);
                setOpen(false);
              }}
            >
              Apply
            </Button>
            <Button variant="ghost" className="w-1/2" onClick={clear}>
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
  const table = (sp.get('t') ?? 'trending_job').trim();
  const field = (sp.get('field') ?? 'all').trim();

  if (table === 'lmia') return lmiaColumns;

  let cols = hotLeadsColumns;
  if (field === 'job_title') {
    cols = cols.filter((f) => f.accessorKey !== 'noc_code');
  }
  return cols;
}
