import { Briefcase, TrendingUp, Building2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SimilarJob {
  job_title: string;
  operating_name: string;
  program?: string;
  employer_type?: string;
}

interface SimilarJobsProps {
  jobs: SimilarJob[];
  loading?: boolean;
  type: "lmia" | "hot_leads";
}

export function SimilarJobsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

export function SimilarJobs({ jobs, loading, type }: SimilarJobsProps) {
  if (loading) return <SimilarJobsSkeleton />;

  if (!jobs.length) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-500">
        No similar jobs found
      </div>
    );
  }

  // Group jobs by operating name
  const groupedJobs = jobs.reduce((acc, job) => {
    const key = job.operating_name || "Other";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(job);
    return acc;
  }, {} as Record<string, SimilarJob[]>);

  // Calculate percentages for the chart
  const total = jobs.length;
  const chartData = Object.entries(groupedJobs)
    .map(([key, value]) => ({
      label: key,
      value: value.length,
      percentage: (value.length / total) * 100,
    }))
    // Sort by number of jobs in descending order
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {/* Distribution Chart */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          Company Distribution
        </h5>
        <div className="space-y-2">
          {chartData.map(({ label, value, percentage }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 truncate flex-1 mr-2">
                  {label}
                </span>
                <span className="text-gray-700 font-medium whitespace-nowrap">
                  {value} jobs
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Jobs List */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-3">
          {jobs.map((job, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">
                    {job.job_title}
                  </h5>
                  <p className="text-sm text-gray-600 truncate">
                    {job.operating_name}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>
                        {type === "lmia" ? job.program : "Similar Role"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
