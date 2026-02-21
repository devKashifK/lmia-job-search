'use client';
import React, { useState } from 'react';
import {
  Building2,
  Briefcase,
  Utensils,
  SearchX,
  Filter,
  RefreshCw,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LMIA } from '@/components/filters/column-def';
import Loader from '@/components/ui/loader';
import PageTitle from '@/components/ui/page-title';
import Pagination from '@/components/ui/pagination';
import JobCard from '@/components/ui/job-card';
import { SearchPageHeader } from '@/components/search/search-page-header';
import { keepPreviousData } from '@tanstack/react-query';
import { NocJobDescription } from './noc-job-description';
import { AllJobsList } from './all-jobs-list';
import { NewDataPanelSkeleton } from './skeletons';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';
import NewFilterPanel from '@/components/ui/new-filterpanel';
import AppliedFilters from '@/components/ui/applied-filters';
import { useTableStore } from '@/context/store';

import { useQuery } from '@tanstack/react-query';
import {
  usePathname,
  useRouter,
  useSearchParams,
  ReadonlyURLSearchParams,
} from 'next/navigation';
import useMobile from '@/hooks/use-mobile';
import { BottomNav } from '@/components/mobile/bottom-nav';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

type DataType = 'lmia' | 'hotLeads';

function isValidType(type: string | undefined): type is DataType {
  return type === 'lmia' || type === 'hotLeads';
}

interface DynamicDataViewProps {
  title: string;
  field: string;
  searchType?: 'hot_leads' | 'lmia';
}

function toPositiveInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function stableFiltersKey(
  sp: ReadonlyURLSearchParams | URLSearchParams | null,
  allowedFields: string[]
) {
  // Build a stable JSON key of allowed filter arrays (sorted)
  const obj: Record<string, string[]> = {};
  if (!sp) return JSON.stringify(obj);

  for (const k of allowedFields) {
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



export function useData(
  query: string,
  fieldFromProp?: string,
  searchType?: 'lmia' | 'hot_leads'
) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // table from URL (fallback to trending_job) or derived from searchType
  const tableName =
    (sp?.get('t') ?? (searchType === 'lmia' ? 'lmia' : 'trending_job')).trim();

  // Note: Local helper logic moved to @/lib/api/jobs.ts
  // Allowed fields for URL param parsing (duplicated for now to keep stableFiltersKey working locally, 
  // or we can export it from api)
  const allowedFields = tableName === 'lmia'
    ? [
      'territory', 'program', 'city', 'postal_code', 'lmia_period',
      'lmia_year', 'priority_occupation', 'employer', 'noc_code', 'job_title',
    ]
    : ['state', 'city', 'category', 'job_title', 'noc_code', 'employer'];

  // from URL
  const fieldParam = (sp?.get('field') ?? 'all').toLowerCase();
  const field = (fieldFromProp ?? fieldParam).toLowerCase();

  const page = toPositiveInt(sp?.get('page') ?? null, 1);
  const pageSize = toPositiveInt(sp?.get('pageSize') ?? null, 20);

  const filtersKey = stableFiltersKey(sp, allowedFields);

  // 🔹 date range from URL (YYYY-MM-DD)
  const rawDateFrom = sp?.get('date_from') ?? undefined;
  const rawDateTo = sp?.get('date_to') ?? undefined;

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
  const rawQ = (query ?? '').trim();

  // If query is 'all', try to get 'q' from URL params (used by NOC guide links)
  const paramQ = sp?.get('q')?.trim() ?? '';
  const q = rawQ.toLowerCase() === 'all'
    ? (paramQ || '')
    : rawQ;

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
      placeholderData: keepPreviousData,
      queryFn: async () => {
        const { queryJobs } = await import('@/lib/api/jobs');

        const { data, count } = await queryJobs({
          tableName,
          query: q,
          field,
          page,
          pageSize,
          filters,
          dateFrom: dateFrom,
          dateTo: dateTo
        });

        return {
          rows: (data as unknown as LMIA[]) ?? [],
          count: count ?? 0,
          page,
          pageSize,
          totalPages: count ? Math.ceil(count / pageSize) : undefined,
          hasMore: count ? (page * pageSize) < count : (data?.length ?? 0) === pageSize,
        };
      },
    }),
    setPage,
    setPageSize,
  };
}

import { CrossTableChecker } from './cross-table-checker';

// ... existing imports

export default function DynamicDataView({
  title,
  field,
  searchType: propSearchType,
}: DynamicDataViewProps) {
  const [savedSet, setSavedSet] = useState<Set<number>>(new Set());
  const { isMobile, isMounted } = useMobile();

  // Get search type from prop or URL parameter
  const searchParams = useSearchParams();
  const searchType =
    propSearchType ??
    ((searchParams?.get('t') === 'lmia' ? 'lmia' : 'hot_leads') as
      | 'lmia'
      | 'hot_leads');

  // Determine if we should show the specialized Search Header
  // We show it if searchType is explicitly provided (SearchResultsLayout) OR 
  // if we are on a route that implies search (like roles/[keyword] which might use it)
  // For now, let's use it if we have a searchType, as that drives the data source switcher.
  const useNewHeader = !!searchType;

  // Call useData once here to get the filtered count
  const { data } = useData(title, field, searchType);
  const count = data?.count;

  // Wait for client-side mounting to determine device type
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CrossTableChecker
        currentSearchType={searchType}
        field={field}
        query={title}
      />
      <div
        className={
          isMobile ? 'mx-auto px-4 py-4 pb-20 overflow-x-hidden'
            : 'mx-auto px-0 pt-0 pb-8' // Remove padding/margins to let Header span full width
        }
      >
        <div className="py-0">
          <div className="flex flex-col mb-0">
            {useNewHeader ? (
              <SearchPageHeader
                currentSearchType={searchType}
                title={title}
                field={field}
                count={count}
              />
            ) : (
              <div className="px-16 pt-2">
                <PageTitle
                  title={title}
                  count={count}
                  showSearch={!isMobile}
                  searchPlaceholder={
                    searchType === 'lmia'
                      ? 'Search LMIA jobs...'
                      : 'Search Trending jobs...'
                  }
                  defaultSearchType={searchType}
                  field={field}
                />
              </div>
            )}
          </div>
        </div>

        {!useNewHeader && <AppliedFilters />}

        <div
          className={
            isMobile ? 'relative flex flex-col gap-3 px-4' : 'relative flex gap-0 px-16 pt-2'
          }
        >
          {!isMobile && (
            <div className="">
              <NewFilterPanel />
            </div>
          )}
          <NewDataPanel
            field={field}
            query={title}
            savedSet={savedSet}
            setSavedSet={setSavedSet}
            searchType={searchType}
          />
        </div>
      </div>
      {isMobile && <BottomNav />}
    </>
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
  searchType,
}: {
  savedSet: Set<number>;
  query: string;
  field: string;
  setSavedSet: (set: Set<number>) => void;
  searchType: 'lmia' | 'hot_leads';
}) {
  const { data, error, isLoading } = useData(query, field, searchType);
  const { dataConfig } = useTableStore();
  const navigate = useRouter();

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
                      jobTitle={item.job_title}
                      city={item.city}
                      state={item.state}
                      noc={item.noc_code || item['2021_noc']}
                      category={item.category}
                      employerType={item.employer_type}
                      datePosted={item.date_of_job_posting}
                      recordID={item.RecordID ? String(item.RecordID) : undefined}
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
  searchType: 'lmia' | 'hot_leads';
}) {
  const { isMobile } = useMobile();
  const { data, error, isLoading, setPage } = useData(query, field, searchType);
  const [selectedJob, setSelectedJob] = React.useState<any>(null);
  const [selectedJobId, setSelectedJobId] = React.useState<number | undefined>(
    undefined
  );
  const [showFilters, setShowFilters] = React.useState(false);
  const [showJobDetails, setShowJobDetails] = React.useState(false);
  const navigate = useRouter();

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
    if (isMobile) {
      setShowJobDetails(true);
    }
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
    <div
      className={
        isMobile ? 'flex flex-col min-h-screen' : 'flex flex-col h-[1200px]'
      }
    >
      <div
        className={isMobile ? 'flex flex-col flex-1' : 'flex flex-1 min-h-0'}
      >
        {/* Mobile: Job list takes full width, details slide in */}
        {/* Desktop: Side by side layout */}

        {isMobile ? (
          <>
            {/* Mobile Job List */}
            <div className="flex-1 overflow-hidden">
              <AllJobsList
                jobs={(data?.rows as unknown as any[]) || []}
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
                searchType={searchType as 'lmia' | 'hot_leads'}
              />
            </div>

            {/* Mobile Filter Drawer */}
            <Drawer open={showFilters} onOpenChange={setShowFilters}>
              <div className="fixed bottom-24 right-4 z-30">
                <button
                  onClick={() => setShowFilters(true)}
                  className="group flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all px-4 py-3"
                >
                  <Filter className="w-5 h-5" />
                  <span className="text-sm font-semibold">Filters</span>
                </button>
              </div>

              <DrawerContent className="max-h-[85vh] flex flex-col">
                <DrawerHeader className="flex-shrink-0 border-b rounded-t-2xl border-gray-200 bg-gradient-to-r from-brand-50 to-blue-50 py-4 px-4">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="flex items-center gap-3 ">
                      <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-md">
                        <Filter className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">
                          Filters
                        </span>
                        <span className="text-xs text-gray-500">
                          Refine your search
                        </span>
                      </div>
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md">
                        <X className="w-5 h-5" />
                      </button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                <div className=" overflow-y-auto px-4 py-4 pb-6">
                  <NewFilterPanel />
                </div>
              </DrawerContent>
            </Drawer>

            {/* Mobile Job Details Drawer */}
            <Drawer open={showJobDetails} onOpenChange={setShowJobDetails}>
              <DrawerContent className="max-h-[90vh] flex flex-col">
                <DrawerHeader className="flex-shrink-0 border-b rounded-t-2xl border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 py-4 px-4">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">
                          Job Details
                        </span>
                        <span className="text-xs text-gray-500">
                          Complete information
                        </span>
                      </div>
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md">
                        <X className="w-5 h-5" />
                      </button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto pb-6">
                  <NocJobDescription
                    job={selectedJob}
                    onSaveJob={handleSaveJob}
                    onViewNOC={handleViewNOC}
                    isSaved={isJobSaved}
                    className=""
                    searchType={searchType}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <>
            {/* Desktop: Side by side */}
            <div className="w-[550px] flex-shrink-0 border-r border-gray-200">
              <AllJobsList
                jobs={(data?.rows as unknown as any[]) || []}
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
                searchType={searchType as 'lmia' | 'hot_leads'}
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
          </>
        )}
      </div>

      {/* Pagination Controls */}
      <div
        className={
          isMobile
            ? 'flex-shrink-0 border-t border-gray-200 bg-white p-3'
            : 'flex-shrink-0 border-t border-gray-200 bg-white p-4 shadow-none'
        }
      >
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

export const useSelectedColumnRecord = () => {
  const { selectedRecordID, dataConfig } = useTableStore.getState();

  const { data: record, isLoading } = useQuery({
    queryKey: ['selectedColumnRecord', selectedRecordID, dataConfig?.type],
    enabled: !!selectedRecordID,
    queryFn: async () => {
      if (!selectedRecordID) return null;

      const { queryJobs } = await import('@/lib/api/jobs');
      const type = dataConfig?.type === 'lmia' ? 'lmia' : 'trending_job';
      const pk = type === 'lmia' ? 'RecordID' : 'id';

      const { data } = await queryJobs({
        tableName: type,
        filters: { [pk]: [String(selectedRecordID)] },
        pageSize: 1
      });

      if (!data || data.length === 0) {
        throw new Error('Record not found');
      }

      return data[0];
    },
  });

  return { record, isLoading };
};
