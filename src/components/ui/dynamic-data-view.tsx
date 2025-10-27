'use client';
import React, { useState } from 'react';
import {
  Building2,
  Briefcase,
  Utensils,
  LayoutGrid,
  Table2,
  SearchX,
  Filter,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { VisibilityState, OnChangeFn } from '@tanstack/react-table';

import {
  LMIA,
  hotLeadsColumns,
  lmiaColumns,
} from '@/components/filters/column-def';
import Loader from '@/components/ui/loader';
import PageTitle from '@/components/ui/page-title';
import Pagination from '@/components/ui/pagination';
import JobCard from '@/components/ui/job-card';
import { NocJobDescription } from './noc-job-description';
import { AllJobsList } from './all-jobs-list';
import { NewDataPanelSkeleton } from './skeletons';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';
import NewFilterPanel from '@/components/ui/new-filterpanel';
import AppliedFilters from '@/components/ui/applied-filters';
import { useTableStore } from '@/context/store';
import db from '@/db';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type DataType = 'lmia' | 'hotLeads';

function isValidType(type: string | undefined): type is DataType {
  return type === 'lmia' || type === 'hotLeads';
}

interface DynamicDataViewProps {
  title: string;
  field: string;
}

const ALLOWED_FIELDS = [
  'state',
  'city',
  'category',
  'job_title',
  'noc_code',
  'employer',
] as const;

function toPositiveInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function stableFiltersKey(sp: URLSearchParams) {
  // Build a stable JSON key of allowed filter arrays (sorted)
  const obj: Record<string, string[]> = {};
  for (const k of ALLOWED_FIELDS) {
    const vals = sp
      .getAll(k)
      .map((s) => s.trim())
      .filter(Boolean)
      .sort();
    if (vals.length) obj[k] = vals;
  }
  return JSON.stringify(obj);
}

// your existing one, kept

function getPrimaryKey(table: string) {
  return table === 'lmia' ? 'RecordID' : 'id';
}

// Columns you allow for search/filters (URL params)
function getAllowedFields(table: string): string[] {
  if (table === 'lmia') {
    return [
      'territory',
      'program',
      'city',
      'postal_code',
      'lmia_period',
      'lmia_year', // numeric
      'priority_occupation',
      'employer',
      'noc_code',
      'job_title',
    ];
  }
  // trending_job
  return ['state', 'city', 'category', 'job_title', 'noc_code', 'employer'];
}

// Subset used for free-text OR search (skip numeric fields like lmia_year)
function getTextSearchFields(table: string): string[] {
  if (table === 'lmia') {
    return [
      'territory',
      'program',
      'city',
      'postal_code',
      'lmia_period',
      'priority_occupation',
      'employer',
      'noc_code',
      'job_title',
    ];
  }
  return ['state', 'city', 'category', 'job_title', 'noc_code', 'employer'];
}

// Map to normalized *_norm columns (only if you actually created them)
// For LMIA we assume no *_norm yet; add mappings later if you generate them.
const NORM_MAP_TRENDING: Record<string, string> = {
  state: 'state_norm',
  city: 'city_norm',
  category: 'category_norm',
  job_title: 'job_title_norm',
  noc_code: 'noc_code_norm',
  employer: 'employer_norm',
};

const NORM_MAP_LMIA: Record<string, string> = {
  city: 'city_norm',
  territory: 'territory_norm',
  program: 'program_norm',
  postal_code: 'postal_code_norm',
  lmia_period: 'lmia_period_norm',
  priority_occupation: 'priority_occupation_norm',
  employer: 'employer_norm',
  noc_code: 'noc_code_norm',
  job_title: 'job_title_norm',
  // lmia_year stays numeric, keep raw column
};

function getNormMap(table: string): Record<string, string> {
  return table === 'lmia' ? NORM_MAP_LMIA : NORM_MAP_TRENDING;
}

export function useData(query: string, fieldFromProp?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // table from URL (fallback to trending_job)
  const tableName = (sp.get('t') ?? 'trending_job').trim();

  // ---- table-specific helpers
  const pk = getPrimaryKey(tableName); // 'id' | 'RecordID'
  const selectCols = getColumnName(tableName); // select list string
  const allowedFields = getAllowedFields(tableName); // fields user can search/filter
  const textSearchFields = getTextSearchFields(tableName); // subset (skip numeric)
  const normMap = getNormMap(tableName); // only trending_job has *_norm

  // from URL
  const fieldParam = (sp.get('field') ?? 'all').toLowerCase();
  const field = (fieldFromProp ?? fieldParam).toLowerCase();

  const page = toPositiveInt(sp.get('page'), 1);
  const pageSize = toPositiveInt(sp.get('pageSize'), 20);

  const filtersKey = stableFiltersKey(sp);

  // 🔹 date range from URL (YYYY-MM-DD)
  const rawDateFrom = sp.get('date_from') ?? undefined;
  const rawDateTo = sp.get('date_to') ?? undefined;

  const isISO = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
  let dateFrom = isISO(rawDateFrom) ? rawDateFrom : undefined;
  let dateTo = isISO(rawDateTo) ? rawDateTo : undefined;
  if (dateFrom && dateTo && dateFrom > dateTo) {
    const tmp = dateFrom;
    dateFrom = dateTo;
    dateTo = tmp;
  }

  // parse filters from URL → { column: [values...] }
  const filters: Record<string, string[]> = {};
  for (const k of allowedFields) {
    const vals = sp
      .getAll(k)
      .map((s) => s.trim())
      .filter(Boolean);
    if (vals.length) filters[k] = Array.from(new Set(vals)); // dedupe
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const q = (query ?? '').trim();

  // small helpers to update URL
  const setPage = (next: number) => {
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.set('page', String(Math.max(1, Math.floor(next))));
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
  };

  const setPageSize = (next: number) => {
    const nextSp = new URLSearchParams(sp.toString());
    nextSp.set('pageSize', String(Math.max(1, Math.floor(next))));
    nextSp.set('page', '1');
    router.push(`${pathname}?${nextSp.toString()}`, { scroll: false });
  };

  return {
    ...useQuery({
      queryKey: [
        'tableData',
        tableName,
        q,
        field,
        page,
        pageSize,
        filtersKey,
        dateFrom ?? null,
        dateTo ?? null,
      ],
      keepPreviousData: true,
      queryFn: async () => {
        let builder = db.from(tableName).select(selectCols, { count: 'exact' });

        // ---------- free-text search
        if (q !== '') {
          if (field === 'all') {
            // OR across text-searchable columns only (avoid numeric lmia_year)
            const orExpr = textSearchFields
              .map((c) => `${c}.ilike.%${q}%`)
              .join(',');
            if (orExpr) builder = builder.or(orExpr);
          } else if (allowedFields.includes(field)) {
            if (tableName === 'lmia' && field === 'lmia_year') {
              // numeric year: support exact match if q is numeric, else ignore
              const num = Number(q);
              if (Number.isFinite(num))
                builder = builder.eq('lmia_year', Math.floor(num));
            } else {
              builder = builder.ilike(field as any, `%${q}%`);
            }
          } else {
            console.warn('Ignored unknown field:', field);
          }
        }

        // ---------- date range
        if (tableName === 'trending_job') {
          if (dateFrom) builder = builder.gte('date_of_job_posting', dateFrom);
          if (dateTo) builder = builder.lte('date_of_job_posting', dateTo);
        } else if (tableName === 'lmia') {
          // interpret date range as year range on lmia_year
          const yf = dateFrom ? Number(dateFrom.slice(0, 4)) : undefined;
          const yt = dateTo ? Number(dateTo.slice(0, 4)) : undefined;
          if (Number.isFinite(yf))
            builder = builder.gte('lmia_year', yf as number);
          if (Number.isFinite(yt))
            builder = builder.lte('lmia_year', yt as number);
        }

        // ---------- filters: AND across columns, OR within a column
        for (const key of Object.keys(filters)) {
          const rawVals = filters[key] ?? [];
          if (!rawVals.length) continue;

          const normCol = normMap[key] ?? key;

          if (normCol !== key) {
            // normalized column available → use lowercased exact matching
            const canon = rawVals
              .map((v) => v.trim().toLowerCase())
              .filter(Boolean);
            if (!canon.length) continue;
            builder =
              canon.length === 1
                ? builder.eq(normCol, canon[0])
                : builder.in(normCol, canon);
          } else {
            // no normalization → exact match/in on original values
            builder =
              rawVals.length === 1
                ? builder.eq(key, rawVals[0])
                : builder.in(key, rawVals);
          }
        }

        // ---------- sort (table-specific) then paginate
        if (tableName === 'trending_job') {
          builder = builder
            .order('date_of_job_posting', { ascending: false })
            .order(pk as any, { ascending: true });
        } else {
          builder = builder
            .order('lmia_year', { ascending: false })
            .order(pk as any, { ascending: true });
        }

        const { data, error, count } = await builder.range(from, to);
        if (error) throw new Error(error.message || 'Failed to fetch');

        return {
          rows: data ?? [],
          count: count ?? 0,
          page,
          pageSize,
          totalPages: count ? Math.ceil(count / pageSize) : undefined,
          hasMore: count ? to + 1 < count : (data?.length ?? 0) === pageSize,
        };
      },
    }),
    setPage,
    setPageSize,
  };
}

export default function DynamicDataView({
  title,
  field,
}: DynamicDataViewProps) {
  const [savedSet, setSavedSet] = useState<Set<number>>(new Set());

  // Get search type from URL parameter
  const searchParams = useSearchParams();
  const searchType = (
    searchParams?.get('t') === 'lmia' ? 'lmia' : 'hot_leads'
  ) as 'lmia' | 'hot_leads';

  return (
    <div className=" mx-auto px-16 py-8">
      <div className="py-0">
        <div className="flex justify-between items-center mb-0">
          <PageTitle
            title={title}
            showSearch={true}
            searchPlaceholder={
              searchType === 'lmia'
                ? 'Search LMIA jobs...'
                : 'Search Trending jobs...'
            }
            defaultSearchType={searchType}
          />
          {/* <div className="flex items-center space-x-3"> */}
          {/* <DataPanelViewMode /> */}

          {/* <DataPanelColumns /> */}

          {/* <div className="flex-shrink-0">
              <SortButton
                options={sortOptions}
                currentSort={sortBy}
                onSortChange={setSortBy}
              />
            </div> */}
          {/* </div> */}
        </div>
      </div>

      {/* Applied Filters */}
      <AppliedFilters />

      <div className="relative flex gap-1">
        <div className="w-1/5">
          <NewFilterPanel />
        </div>
        <NewDataPanel
          field={field}
          query={title}
          savedSet={savedSet}
          setSavedSet={setSavedSet}
          searchType={searchType}
        />
      </div>
    </div>
  );
}

export const selectProjectionLMIA =
  'RecordID, territory, program, city, lmia_year, job_title, noc_code, priority_occupation, approved_positions, operating_name';
export const selectProjectionHotLeads =
  'RecordID, state, city, date_of_job_posting, noc_code, noc_priority, job_title, operating_name, year, occupation_title, job_status, employer_type, 2021_noc';

export function applyDataConfig(
  type: 'lmia' | 'hot_leads',
  table: string,
  keyword: string,
  method: string,
  setDataConfig: (config: any) => void
) {
  setDataConfig({
    type: type,
    table: table,
    method: method,
    keyword: keyword,
    page: 1,
    pageSize: 100,
  });
}

export const getColumnName = (table: string) => {
  const trending_job =
    'id,date_of_job_posting,state,city,category,job_title,noc_code,employer';
  const lmia =
    'RecordID,territory,program,city,lmia_year,job_title,noc_code,priority_occupation,approved_positions,employer,postal_code,lmia_period';

  return table === 'trending_job' ? trending_job : lmia;
};

export function applyFilterPanelConfig(
  column: string,
  type: 'lmia' | 'hot_leads',
  table: string,
  keyword: string,
  method: string,
  setFilterPanelConfig: (config: any) => void
) {
  setFilterPanelConfig({
    column: column,
    table: table,
    keyword: keyword,
    type: type,
    method: method,
  });
}

export function DataPanel({
  query,
  field,
  savedSet,
  setSavedSet,
}: {
  savedSet: Set<number>;
  query: string;
  field: string;
  setSavedSet: (set: Set<number>) => void;
}) {
  const { data, error, isLoading } = useData(query, field);
  console.log('Data:', data);
  const { dataConfig } = useTableStore();
  const { viewMode } = useTableStore();

  const navigate = useRouter();

  const columns = dataConfig.type === 'lmia' ? lmiaColumns : hotLeadsColumns;

  const initialColumnVisibility = columns.reduce((acc, column) => {
    if (typeof column.accessorKey === 'string') {
      acc[column.accessorKey] = true;
    }
    return acc;
  }, {} as VisibilityState);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  );

  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (
    updater
  ) => {
    setColumnVisibility(updater);
  };

  const type: DataType = isValidType(dataConfig?.type)
    ? dataConfig.type
    : 'hotLeads';
  const pageSize = dataConfig?.pageSize
    ? parseInt(dataConfig.pageSize as string)
    : 60;
  const currentPage = dataConfig?.page
    ? parseInt(dataConfig.page as string)
    : 1;
  const showLoader = useMinimumLoading(isLoading);
  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="w-4/5">
      <div>
        {showLoader ? (
          <div className="fixed w-screen h-screen inset-0 flex justify-center items-center bg-white z-50">
            <Loader />
          </div>
        ) : (
          <div>
            {data?.rows && data.rows.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.rows.map((item: LMIA, idx: number) => {
                    const logoIcons = [Building2, Briefcase, Utensils];
                    const LogoIcon = logoIcons[idx % logoIcons.length];
                    const saved = savedSet.has(idx);
                    return (
                      <JobCard
                        key={item.id || idx}
                        logoIcon={LogoIcon}
                        saved={saved}
                        onToggleSaved={() => {
                          const next = new Set(savedSet);
                          if (next.has(idx)) next.delete(idx);
                          else next.add(idx);
                          setSavedSet(next);
                        }}
                        employerName={item.employer}
                        jobTitle={item.job_title || item.occupation_title}
                        city={item.city}
                        state={item.state}
                        noc={item.noc_code || item['2021_noc']}
                        category={item.category}
                        employerType={item.employer_type}
                        datePosted={item.date_of_job_posting}
                        recordID={item.RecordID}
                        onKnowMore={() => {
                          navigate.push(`/search/noc-profile/${item.noc_code}`);
                        }}
                        type={type}
                        program={type === 'lmia' ? item.program : undefined}
                        lmiaYear={type === 'lmia' ? item.lmia_year : undefined}
                        priorityOccupation={
                          type === 'lmia' ? item.priority_occupation : undefined
                        }
                        approvedPositions={
                          type === 'lmia' ? item.approved_positions : undefined
                        }
                        territory={type === 'lmia' ? item.territory : undefined}
                      />
                    );
                  })}
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={data.data}
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
                />
              )
            ) : (
              <div className="text-center py-8">No results found</div>
            )}
          </div>
        )}
      </div>
      {/* Pagination Controls */}
      <div className="mt-8 py-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}

export function NewDataPanel({
  query,
  field,
  savedSet,
  setSavedSet,
  searchType,
}: {
  savedSet: Set<number>;
  query: string;
  field: string;
  setSavedSet: (set: Set<number>) => void;
  searchType: string;
}) {
  const { data, error, isLoading, setPage } = useData(query, field);
  const [selectedJob, setSelectedJob] = React.useState<any>(null);
  const [selectedJobId, setSelectedJobId] = React.useState<number | undefined>(
    undefined
  );
  const navigate = useRouter();

  console.log('Data:', query, field, data);

  // Set first job as selected by default when data loads or changes
  React.useEffect(() => {
    if (data?.rows && data.rows.length > 0) {
      const firstJob = data.rows[0];
      // Always update to first job when data changes (filters, pagination, etc.)
      setSelectedJob(firstJob);
      setSelectedJobId(firstJob.id || 0);
    }
  }, [data?.rows]);

  const handleJobSelect = (job: any) => {
    setSelectedJob(job);
    setSelectedJobId(job.id || data?.rows?.indexOf(job));
  };

  const handleSaveJob = () => {
    if (selectedJob) {
      const jobIndex = data?.rows?.indexOf(selectedJob);
      if (jobIndex !== undefined) {
        const next = new Set(savedSet);
        if (next.has(jobIndex)) {
          next.delete(jobIndex);
        } else {
          next.add(jobIndex);
        }
        setSavedSet(next);
      }
    }
  };

  const handleViewNOC = () => {
    if (selectedJob?.noc_code) {
      navigate.push(`/search/noc-profile/${selectedJob.noc_code}`);
    }
  };

  const isJobSaved = selectedJob
    ? savedSet.has(data?.rows?.indexOf(selectedJob) || -1)
    : false;

  // Pagination logic - use URL parameters like useData hook
  const sp = useSearchParams();
  const page = toPositiveInt(sp?.get('page') ?? null, 1);
  const pageSize = toPositiveInt(sp?.get('pageSize') ?? null, 60);
  const currentPage = page;
  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  if (error) {
    return <div className="p-4 text-red-600">Error: {error.message}</div>;
  }

  if (isLoading) {
    return <NewDataPanelSkeleton />;
  }

  if (!data?.rows || data.rows.length === 0) {
    return (
      <div className="flex flex-col h-[1200px] w-full">
        <div className="flex flex-1 items-center justify-center w-full">
          <div className="text-center w-full px-8">
            {/* Animated Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <SearchX className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Filter className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Main Message */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Jobs Found
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We couldn't find any jobs matching your current search criteria.
              Try adjusting your filters or search terms to discover more
              opportunities.
            </p>

            {/* Suggestions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Try these suggestions:
              </h4>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use broader search terms or remove some filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Check your spelling and try alternative keywords</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Expand your location search to nearby areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Try searching for related job titles or categories
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Search
            </Button>

            {/* Footer Text */}
            <p className="text-xs text-gray-500 mt-6">
              New jobs are added regularly. Check back soon for fresh
              opportunities!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col  h-[1200px]">
      <div className="flex flex-1 min-h-0">
        {/* Middle Section - NOC Job Description - Fixed width */}

        {/* Right Sidebar - All Jobs - Fixed width */}
        <div className="w-[550px] flex-shrink-0 border-r border-gray-200">
          <AllJobsList
            jobs={data?.rows || []}
            selectedJobId={selectedJobId}
            onJobSelect={handleJobSelect}
            savedJobs={savedSet}
            onToggleSaved={(index) => {
              const next = new Set(savedSet);
              if (next.has(index)) {
                next.delete(index);
              } else {
                next.add(index);
              }
              setSavedSet(next);
            }}
            totalCount={data?.count}
            className="h-full"
          />
        </div>
        <div className="flex-1 min-w-0 max-w-4xl">
          <NocJobDescription
            job={selectedJob}
            onSaveJob={handleSaveJob}
            onViewNOC={handleViewNOC}
            isSaved={isJobSaved}
            className="h-full"
            searchType={searchType}
          />
        </div>
      </div>

      {/* Pagination Controls - Outside scrollable area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 shadow-none">
        <div className="max-w-4xl mx-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}

const DataPanelViewMode = () => {
  const { viewMode, setViewMode } = useTableStore();
  return (
    <div className="flex items-center border rounded-md bg-background">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('grid')}
        className="h-9 px-3 rounded-r-none"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Grid
      </Button>
      <div className="h-9 border-l" />
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('table')}
        className="h-9 px-3 rounded-l-none"
      >
        <Table2 className="h-4 w-4 mr-2" />
        Table
      </Button>
    </div>
  );
};

// const DataPanelColumns = () => {
//   return (
//     viewMode === "table" && (
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="outline" size="sm" className="h-9">
//             <Settings2 className="h-4 w-4 mr-2" />
//             Columns
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end" className="w-[200px]">
//           {columns.map((column) => {
//             const key = column.accessorKey as keyof LMIA;
//             const headerContent =
//               typeof column.header === "string" ? column.header : key;
//             return key ? (
//               <DropdownMenuCheckboxItem
//                 key={key}
//                 className="capitalize"
//                 checked={columnVisibility[key] ?? true}
//                 onCheckedChange={(value) =>
//                   handleColumnVisibilityChange((prev) => ({
//                     ...prev,
//                     [key]: value,
//                   }))
//                 }
//               >
//                 {headerContent}
//               </DropdownMenuCheckboxItem>
//             ) : null;
//           })}
//         </DropdownMenuContent>
//       </DropdownMenu>
//     )
//   );
// };

export const useSelectedColumnRecord = () => {
  const { selectedRecordID, dataConfig } = useTableStore.getState();
  console.log(selectedRecordID, 'check');

  const selectProjection =
    dataConfig.type === 'lmia'
      ? selectProjectionLMIA
      : selectProjectionHotLeads;

  const { data, error } = useQuery({
    queryKey: ['selectedColumnRecord', selectedRecordID, dataConfig.type],
    queryFn: async () => {
      const { data, error } = await db
        .from(dataConfig.table)
        .select(selectProjection.split(',').join(' , '))
        .eq('RecordID', selectedRecordID)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!selectedRecordID,
  });

  return { data, error };
};
