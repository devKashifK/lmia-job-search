'use client';
import React, { useState } from 'react';
import {
  Building2,
  Briefcase,
  Utensils,
  LayoutGrid,
  Table2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { VisibilityState, OnChangeFn } from '@tanstack/react-table';

import {
  LMIA,
  hotLeadsColumns,
  lmiaColumns,
} from '@/components/filters/column-def';
import { PremiumDialog } from '@/components/ui/premium-dialog';
import Loader from '@/components/ui/loader';
import PageTitle from '@/components/ui/page-title';
import Pagination from '@/components/ui/pagination';
import JobCard from '@/components/ui/job-card';
import { SortOption } from '@/components/ui/sort-button';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';
import Newfilterpanel from '@/components/ui/new-filterpanel';
import { useTableStore } from '@/context/store';
import db from '@/db';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

type DataType = 'lmia' | 'hotLeads';

function isValidType(type: string | undefined): type is DataType {
  return type === 'lmia' || type === 'hotLeads';
}

interface FilterObject {
  [key: string]: string | string[];
}

interface DynamicDataViewProps {
  title: string;
}

export const useData = () => {
  const { dataConfig } = useTableStore();
  const {
    table,
    method,
    columns: filterJsonString,
    type,
    page,
    pageSize,
    keyword,
  } = dataConfig || {};

  const isQueryEnabled = typeof table === 'string' && table.trim() !== '';
  const selectProjection =
    type == 'lmia' ? selectProjectionLMIA : selectProjectionHotLeads;

  let parsedFilterArray: FilterObject[] = [];

  if (isQueryEnabled && filterJsonString && filterJsonString !== 'null') {
    try {
      const parsed = JSON.parse(filterJsonString);
      if (Array.isArray(parsed)) {
        parsedFilterArray = parsed;
      }
    } catch (e) {
      console.error(
        'Failed to parse dataConfig.columns (filterJsonString):',
        e
      );
    }
  } else if (isQueryEnabled && Array.isArray(filterJsonString)) {
    parsedFilterArray = filterJsonString;
  }

  const stableFiltersKeyPart = JSON.stringify(parsedFilterArray);

  return useQuery({
    queryKey: [
      'tableData',
      table,
      type,
      method,
      selectProjection,
      stableFiltersKeyPart,
      page,
      pageSize,
    ],
    queryFn: async () => {
      if (method === 'query') {
        let query = db
          .from(table)
          .select(selectProjection || '*', { count: 'exact' });

        parsedFilterArray.forEach((filterObject) => {
          if (typeof filterObject === 'object' && filterObject !== null) {
            for (const key in filterObject) {
              if (Object.prototype.hasOwnProperty.call(filterObject, key)) {
                const value = filterObject[key];
                if (Array.isArray(value)) {
                  query = query.in(key, value);
                } else {
                  query = query.eq(key, value);
                }
              }
            }
          }
        });

        const currentPage = typeof page === 'number' && page > 0 ? page : 1;
        const currentPSize =
          typeof pageSize === 'number' && pageSize > 0 ? pageSize : 10;
        const from = (currentPage - 1) * currentPSize;
        const to = from + currentPSize - 1;

        query = query.range(from, to);
        const { data, error, count } = await query;

        if (error) {
          throw new Error(
            error.message ||
              `Failed to fetch data from Supabase table "${table}".`
          );
        }

        return {
          data: data as unknown as LMIA[],
          error: null,
          count: count || 0,
        };
      } else if (method === 'rpc') {
        const orFilter = selectProjection
          .split(',')
          .map((col) => `${col}.ilike.%${keyword}%`)
          .join(',');
        const currentPage = typeof page === 'number' && page > 0 ? page : 1;
        const currentPSize =
          typeof pageSize === 'number' && pageSize > 0 ? pageSize : 10;
        const from = (currentPage - 1) * currentPSize;
        const to = from + currentPSize - 1;

        let query = db
          .from(table)
          .select(selectProjection || '*', { count: 'exact' })
          .or(orFilter);

        // ✅ Apply filters from filterJsonString
        parsedFilterArray.forEach((filterObject) => {
          if (typeof filterObject === 'object' && filterObject !== null) {
            for (const key in filterObject) {
              if (Object.prototype.hasOwnProperty.call(filterObject, key)) {
                const value = filterObject[key];

                if (Array.isArray(value)) {
                  query = query.in(key, value);
                } else {
                  query = query.eq(key, value);
                }
              }
            }
          }
        });

        query = query.range(from, to);

        // ✅ Fetch data
        const { data, error, count } = await query;

        if (error) {
          throw new Error(
            error.message ||
              `Failed to fetch data from Supabase table "${table}".`
          );
        }
        return {
          data: data as unknown as LMIA[],
          error: null,
          count: count || 0,
        };
      }
    },
    enabled: isQueryEnabled,
  });
};
export default function DynamicDataView({ title }: DynamicDataViewProps) {
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<LMIA | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [savedSet, setSavedSet] = useState<Set<number>>(new Set());

  const sortOptions: SortOption[] = [
    { label: 'Latest', value: 'latest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Job Title', value: 'title' },
  ];

  return (
    <div className="container mx-auto px-24 py-8">
      <div className="py-4">
        <div className="flex justify-between items-center mb-6">
          <PageTitle title={title} />
          <div className="flex items-center space-x-3">
            <DataPanelViewMode />

            {/* <DataPanelColumns /> */}

            {/* <div className="flex-shrink-0">
              <SortButton
                options={sortOptions}
                currentSort={sortBy}
                onSortChange={setSortBy}
              />
            </div> */}
          </div>
        </div>
      </div>
      <div className="relative flex gap-4">
        <div className="w-1/5">
          <Newfilterpanel />
        </div>
        <DataPanel
          setSelectedJob={setSelectedJob}
          setShowPremiumDialog={setShowPremiumDialog}
          savedSet={savedSet}
          setSavedSet={setSavedSet}
        />
      </div>
      <PremiumDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        selectedColumn={
          selectedJob?.job_title || selectedJob?.occupation_title || 'Job'
        }
        selectedValue={selectedJob}
        handleSubscribe={() => setShowPremiumDialog(false)}
      />
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
  savedSet,
  setSavedSet,
  setSelectedJob,
  setShowPremiumDialog,
}: {
  setSelectedJob: (job: LMIA) => void;
  setShowPremiumDialog: (show: boolean) => void;
  savedSet: Set<number>;
  setSavedSet: (set: Set<number>) => void;
}) {
  const { data, error, isLoading } = useData();
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
            {data?.data && data.data.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.data.map((item: LMIA, idx: number) => {
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
                        employerName={item.operating_name}
                        jobTitle={item.job_title || item.occupation_title}
                        city={item.city}
                        state={item.state}
                        noc={item.noc_code || item['2021_noc']}
                        jobStatus={item.job_status}
                        employerType={item.employer_type}
                        datePosted={item.date_of_job_posting}
                        recordID={item.RecordID}
                        onKnowMore={() => {
                          setSelectedJob(item);
                          navigate.push(`/search/noc-profile/${item.noc_code}`);
                          // setShowPremiumDialog(true);
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
