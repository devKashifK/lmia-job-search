"use client";
import React, { Suspense, useState } from "react";
import { useParams } from "next/navigation";
import db from "@/db";
import { useQuery } from "@tanstack/react-query";
import { Building2, Briefcase, Utensils } from "lucide-react";
import { PremiumDialog } from "@/components/ui/premium-dialog";
import Loader from "@/components/ui/loader";
import PageTitle from "@/components/ui/page-title";
import Pagination from "@/components/ui/pagination";
import JobCard from "@/components/ui/job-card";

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

export default function RolesPage() {
  const params = useParams();
  const keyword = params?.keyword as string;
  const [page, setPage] = useState(1);
  const pageSize = 60;
  const [totalCount, setTotalCount] = useState(0);
  const [savedSet, setSavedSet] = useState<Set<number>>(new Set());
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  if (!keyword) {
    return <div>No keyword found</div>;
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto px-20 py-8">
      <div className="p-4">
        <PageTitle title={decodeURIComponent(keyword)} count={totalCount} />
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            <TopCompany
              keyword={decodeURIComponent(keyword)}
              page={page}
              pageSize={pageSize}
              setTotalCount={setTotalCount}
              savedSet={savedSet}
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
      </div>
      {/* Pagination Controls */}
      <div className="mt-8 py-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
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
  keyword,
  page,
  pageSize,
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
  toggleSaved: (idx: number) => void;
  onKnowMore: (job: Job) => void;
}) => {
  const { data, error, isFetching } = useQuery({
    queryKey: ["company", keyword, page],
    queryFn: async () => await getProfiles(keyword, page, pageSize),
  });

  const { data: countData } = useQuery({
    queryKey: ["company-count", keyword],
    queryFn: async () => await getProfilesCount(keyword),
  });

  React.useEffect(() => {
    if (typeof countData === "number") {
      setTotalCount(countData);
    }
  }, [countData, setTotalCount]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {isFetching && <Loader />}
      <div>
        {Array.isArray(data) && data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.map(
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

const getProfiles = async (keyword: string, page: number, pageSize: number) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await db
    .from("hot_leads_new")
    .select("*")
    .eq("job_title", keyword)
    .range(from, to);

  if (error) throw error;
  return data;
};

const getProfilesCount = async (keyword: string): Promise<number> => {
  const { count, error } = await db
    .from("hot_leads_new")
    .select("*", { count: "exact", head: true })
    .eq("job_title", keyword);
  if (error) throw error;
  return count || 0;
};
