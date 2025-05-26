"use client";
import React, { Suspense,  useState } from "react";
import { useParams } from "next/navigation";
import db from "@/db";
import { useQuery } from "@tanstack/react-query";
import { Building2, Briefcase, Utensils } from "lucide-react";
import { PremiumDialog } from "@/components/ui/premium-dialog";
import Loader from "@/components/ui/loader";
import PageTitle from "@/components/ui/page-title";
import Pagination from "@/components/ui/pagination";
import JobCard from "@/components/ui/job-card";
import SortButton, { SortOption } from "@/components/ui/sort-button";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import Newfilterpanel from "@/components/ui/new-filterpanel";
import { useTableStore } from "@/context/store";
import { Select } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectTrigger } from "@radix-ui/react-select";

// Define a Job type for job objects
interface Job {
  id?: string | number;
  operating_name?: string;
  employer_name?: string;
  job_title?: string;
  occupation_title?: string;
  city?: string;
  state?: string;
  noc_code?: string;
  ["2021_noc"]?: string;
  date_of_job_posting?: string;
  employer_type?: string;
  job_status?: string;
}

export default function CompanyPage() {
  const params = useParams();
  const keyword = params?.keyword as string;
  const [page, setPage] = useState(1);
  const pageSize = 60;
  const [totalCount, setTotalCount] = useState(0);
  const [savedSet, setSavedSet] = useState<Set<number>>(new Set());
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sortBy, setSortBy] = useState("latest");

  const sortOptions: SortOption[] = [
    { label: "Latest", value: "latest" },
    { label: "Oldest", value: "oldest" },
    { label: "Job Title", value: "title" },
  ];

  if (!keyword) {
    return <div>No keyword found</div>;
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto px-20 py-8">
      <div className="p-4">
        <div className="flex justify-between items-start mb-6">
          <PageTitle title={keyword} count={totalCount} />
          <div>
          <SortButton
            options={sortOptions}
            currentSort={sortBy}
            onSortChange={setSortBy}
            className="mt-2"
          />
          </div>
        </div>
      </div>
      <div className="relative flex gap-4">
        <div className="w-1/5">
          <Newfilterpanel />
        </div>
        <div className="w-4/5">
          <div>
            <Suspense fallback={<div>Loading...</div>}>
              <TopCompany
                keyword={keyword}
                page={page}
                pageSize={pageSize}
                setTotalCount={setTotalCount}
                savedSet={savedSet}
                sortBy={sortBy}
                toggleSaved={(idx: number) =>
                  setSavedSet((prev) => {
                    const next = new Set(prev);
                    if (next.has(idx)) next.delete(idx);
                    else next.add(idx);
                    return next;
                  })
                }
                onKnowMore={(job: Job) => {
                  setSelectedJob(job);
                  setShowPremiumDialog(true);
                }}
              />
            </Suspense>
          </div>
          {/* Pagination Controls */}
          <div className="mt-8 py-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
      <PremiumDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        selectedColumn={
          selectedJob?.job_title || selectedJob?.occupation_title || "Job"
        }
        handleSubscribe={() => setShowPremiumDialog(false)}
      />
    </div>
  );
}

const TopCompany = ({
  setTotalCount,
  savedSet,
  toggleSaved,
  onKnowMore,
}: {
  keyword: string;
  page: number;
  pageSize: number;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  savedSet: Set<number>;
  sortBy: string;
  toggleSaved: (idx: number) => void;
  onKnowMore: (job: Job) => void;
}) => {

  const { data , error  , isLoading} = useData()
  // const { data, error, isFetching } = useQuery({
  //   queryKey: ["company", keyword, page, sortBy],
  //   queryFn: async () => await getCompany(keyword, page, pageSize, sortBy),
  // });
   
  const showLoader = useMinimumLoading(isLoading);

  // const { data: countData } = useQuery({
  //   queryKey: ["company-count", keyword],
  //   queryFn: async () => await getCompanyCount(keyword),
  // });

  React.useEffect(() => {
    if (typeof data?.count === "number") {
      setTotalCount(data?.count);
    }
  }, [data , data?.count, setTotalCount]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="relative">
      {showLoader && (
        <div className="fixed w-screen h-screen inset-0 flex justify-center items-center bg-white  z-50">
          <Loader />
        </div>
      )}
      <div>
        {Array.isArray(data?.data) && data?.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.data.map(
              (
                item: {
                  id?: string | number;
                  operating_name?: string;
                  employer_name?: string;
                  job_title?: string;
                  occupation_title?: string;
                  city?: string;
                  state?: string;
                  noc_code?: string;
                  ["2021_noc"]?: string;
                  date_of_job_posting?: string;
                  employer_type?: string;
                  job_status?: string;
                },
                idx: number
              ) => {
                const logoIcons = [Building2, Briefcase, Utensils];
                const LogoIcon = logoIcons[idx % logoIcons.length];
                const saved = savedSet.has(idx);
                return (
                  <JobCard
                    key={item.id || idx}
                    logoIcon={LogoIcon}
                    saved={saved}
                    onToggleSaved={() => toggleSaved(idx)}
                    employerName={item.employer_name || item.operating_name}
                    jobTitle={item.job_title || item.occupation_title}
                    city={item.city}
                    state={item.state}
                    noc={item.noc_code || item["2021_noc"]}
                    jobStatus={item.job_status}
                    employerType={item.employer_type}
                    datePosted={item.date_of_job_posting}
                    onKnowMore={() => onKnowMore(item)}
                  />
                );
              }
            )}
          </div>
        ) : (
          <div>No results found.</div>
        )}
      </div>
    </div>
  );
};


const getCompanyCount = async (keyword: string): Promise<number> => {
  const { count, error } = await db
    .from("hot_leads_new")
    .select("*", { count: "exact", head: true })
    .eq("operating_name", keyword);
  if (error) throw error;
  return count || 0;
};






const useData = () => {
  const { dataConfig } = useTableStore();
  const {
    table,
    method,
    columns: filterJsonString, 
    type,
    page, 
    pageSize
  } = dataConfig || {};


  console.log(dataConfig , "checkData")


  const isQueryEnabled = method === "query" && typeof table === 'string' && table.trim() !== '';

  const selectProjection = type == "lmia" ? selectProjectionLMIA : selectProjectionHotLeads


  let parsedFilterArray: Array<{ [key: string]: any }> = [];

    if (isQueryEnabled && typeof filterJsonString === 'string' && filterJsonString.trim() !== '') {
    try {
      const parsed = JSON.parse(filterJsonString);
      if (Array.isArray(parsed)) {
        parsedFilterArray = parsed;
      } else {
        console.warn("dataConfig.columns (filterJsonString) parsed into a non-array. Defaulting to empty array for filtering.");
      }
    } catch (e) {
      console.error("Failed to parse dataConfig.columns (filterJsonString):", e);
    }
  } else if (isQueryEnabled && Array.isArray(filterJsonString)) {
    parsedFilterArray = filterJsonString;
  }


  const stableFiltersKeyPart = JSON.stringify(parsedFilterArray);

  return useQuery<any[] | null, Error>({
    queryKey: ['tableData', table, type, selectProjection, stableFiltersKeyPart, page, pageSize],

    queryFn: async () => {


      let query = db.from(table).select(selectProjection || '*' , {count : "exact"});

     parsedFilterArray.forEach((filterObject) => {
    if (typeof filterObject === "object" && filterObject !== null) {
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


      
     



      const currentPage = page && page > 0 ? page : 1;
      const currentPSize = pageSize && pageSize > 0 ? pageSize : 10; // Default page size
      const from = (currentPage - 1) * currentPSize;
      const to = from + currentPSize - 1;

      query = query.range(from, to);
      const { data, error , count } = await query;


      if (error) {
        console.error(`Error fetching data from Supabase table "${table}":`, error);
        throw new Error(error.message || `Failed to fetch data from Supabase table "${table}".`);
      }

      return {data , error , count};
    },
    enabled: isQueryEnabled,
  });
};


const selectProjectionLMIA = "territory , program , city , lmia_year , job_title, noc_code, priority_occupation, approved_positions, operating_name";

const selectProjectionHotLeads = "state , city , date_of_job_posting , noc_code , noc_priority , job_title , operating_name  , year"
