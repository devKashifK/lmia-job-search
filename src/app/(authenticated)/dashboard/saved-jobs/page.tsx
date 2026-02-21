"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import JobCard from "@/components/ui/job-card";
import { Building2, Bookmark, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/ui/loading-screen";

interface LMIAJob {
  RecordID: string;
  employer: string;
  job_title: string;
  city: string;
  territory: string;
  noc_code: string;
  program: string;
  lmia_year: string;
  priority_occupation: string;
  approved_positions: string;
  type: "lmia";
  // Optional fields that might come from HotLeads or be mapped
  occupation_title?: string;
  state?: string;
  job_status?: string;
  employer_type?: string;
  date_of_job_posting?: string;
  "2021_noc"?: string;
  category?: string; // Add category field
}

interface HotLeadsJob {
  RecordID: string;
  operating_name?: string; // Made optional
  employer?: string; // Added employer field
  job_title: string;
  occupation_title: string;
  city: string;
  state: string;
  "2021_noc": string;
  job_status: string;
  employer_type: string;
  date_of_job_posting: string;
  type: "hotLeads";
  // Optional fields that might come from LMIA
  territory?: string;
  noc_code?: string;
  program?: string;
  lmia_year?: string;
  priority_occupation?: string;
  approved_positions?: string;
  category?: string; // Add category field
}

interface SavedJob {
  record_id: string;
  user_id: string;
  job_data: LMIAJob | HotLeadsJob;
}

export default function SavedJobs() {
  const { session } = useSession();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchSavedJobs();
    }
  }, [session?.user?.id]);

  const fetchSavedJobs = async () => {
    try {
      const { getSavedJobsWithData } = await import("@/lib/api/saved-jobs");
      const jobs = await getSavedJobsWithData(session.user.id);

      const mappedJobs = jobs.map((job) => ({
        record_id: job.type === "lmia" ? job.RecordID : job.id,
        user_id: session.user.id,
        job_data: job,
      }));

      setSavedJobs(mappedJobs as SavedJob[]);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to fetch saved jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (recordId: string) => {
    try {
      const { unsaveJob } = await import("@/lib/api/saved-jobs");
      await unsaveJob(recordId, session.user.id);

      // Update local state
      setSavedJobs((prev) => prev.filter((job) => job.record_id !== recordId));
      toast.success("Job removed from saved jobs");
    } catch (error) {
      console.error("Error removing job:", error);
      toast.error("Failed to remove job");
    }
  };

  if (isLoading) {
    return <LoadingScreen className="h-[93vh]" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Saved Jobs
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Manage your bookmarked job opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-700/10">
            {savedJobs.length} Saved
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {savedJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
          >
            <div className="p-4 bg-gray-50 rounded-full mb-6">
              <Bookmark className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-gray-500 max-w-md mb-8">
              Jobs you bookmark will appear here. Start browsing to find your next opportunity.
            </p>
            <Button className="bg-brand-600 hover:bg-brand-700 text-white" asChild>
              <Link href="/search">
                Browse Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {savedJobs.map((savedJob) => {
                const job = savedJob.job_data;

                return (
                  <motion.div
                    key={savedJob.record_id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <JobCard
                      logoIcon={Building2}
                      saved={true}
                      onToggleSaved={() => handleToggleSave(savedJob.record_id)}
                      employerName={(job as LMIAJob).employer || (job as HotLeadsJob).employer || "Unknown Employer"}
                      jobTitle={job.job_title || job.occupation_title || "Untitled Job"}
                      city={job.city || "Unknown City"}
                      state={job.state}
                      category={job.category}
                      territory={job.territory}
                      noc={job.noc_code || job["2021_noc"]}
                      employerType={job.employer_type}
                      datePosted={job.date_of_job_posting}
                      recordID={savedJob.record_id}
                      onKnowMore={() => {
                        /* Implement know more functionality */
                      }}
                      type={job.type}
                      // category={job.category} // Removed duplicate
                      program={job.type === "lmia" ? job.program : undefined}
                      lmiaYear={job.type === "lmia" ? job.lmia_year : undefined}
                      priorityOccupation={
                        job.type === "lmia" ? job.priority_occupation : undefined
                      }
                      approvedPositions={
                        job.type === "lmia" ? job.approved_positions : undefined
                      }
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
