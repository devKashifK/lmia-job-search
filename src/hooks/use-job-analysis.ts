import { useQuery } from "@tanstack/react-query";
import db from "@/db";
import { selectProjectionHotLeads } from "@/components/ui/dynamic-data-view";
import { selectProjectionLMIA } from "@/components/ui/dynamic-data-view";

export interface UseJobAnalysisProps {
  table: string;
  jobTitle: string;
  analysisColumn: string; // The column we want to analyze
  analysisValue: string;
  type: "lmia" | "hot_leads";
  defaultColumn: string;
}

interface DistributionItem {
  label: string;
  value: number;
  percentage: number;
}

interface YearlyTrendItem {
  year: string;
  count: number;
}

interface SimilarJob {
  job_title: string;
  operating_name: string;
  territory?: string;
  state?: string;
  program?: string;
  employer_type?: string;
}

export interface JobAnalysisResult {
  value: number;
  trend: "up" | "down" | "neutral";
  distribution: DistributionItem[];
  yearlyTrend: YearlyTrendItem[];
  similarJobs: SimilarJob[];
}

export function useJobAnalysis(props: UseJobAnalysisProps) {
  const selectedProjection =
    props.type === "lmia" ? selectProjectionLMIA : selectProjectionHotLeads;
  return useQuery({
    queryKey: [
      "job-analysis",
      props.defaultColumn,
      props.table,
      props.jobTitle,
      props.analysisColumn,
      props.analysisValue,
    ],

    queryFn: async () => {
      // Get total count for jobs with this title
      const { data: matchingJobs, error: matchingError } = await db
        .from(props.table)
        .select(`${props.analysisColumn}`, { count: "exact" })
        .eq(props.defaultColumn, props.jobTitle)
        .eq(props.analysisColumn, props.analysisValue);

      if (matchingError) throw matchingError;

      // Get distribution data for the analysis column
      // We need to select both the analysis column and location fields
      const selectFields = [props.analysisColumn];
      if (props.type === "lmia") {
        selectFields.push("territory");
      } else {
        selectFields.push("state");
      }

      const { data: distributionData, error: distributionError } = await db
        .from(props.table)
        .select(selectFields.join(", "))
        .eq("job_title", props.jobTitle);

      if (distributionError) throw distributionError;

      // Process distribution data
      const distribution = (
        distributionData as any as Record<string, unknown>[]
      ).reduce((acc: DistributionItem[], item) => {
        const key =
          (
            item[props.analysisColumn] as string | number | boolean
          )?.toString() || "Other";
        const existing = acc.find((x) => x.label === key);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ label: key, value: 1, percentage: 0 });
        }
        return acc;
      }, []);

      // Calculate percentages
      const total = distribution.reduce(
        (sum: number, item: DistributionItem) => sum + item.value,
        0
      );
      distribution.forEach((item: DistributionItem) => {
        item.percentage = (item.value / total) * 100;
      });

      // Sort by value descending
      distribution.sort(
        (a: DistributionItem, b: DistributionItem) => b.value - a.value
      );

      // Get yearly trend data
      const yearField = props.type === "lmia" ? "lmia_year" : "year";
      const { data: yearlyData, error: yearlyError } = await db
        .from(props.table)
        .select(yearField)
        .eq("job_title", props.jobTitle)
        .order(yearField, { ascending: true });

      if (yearlyError) throw yearlyError;

      // Process yearly trend data
      const yearlyTrend = (yearlyData as Record<string, unknown>[]).reduce(
        (acc: YearlyTrendItem[], item) => {
          const year =
            (item[yearField] as string | number)?.toString() || "Unknown";
          const existing = acc.find((x) => x.year === year);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ year, count: 1 });
          }
          return acc;
        },
        []
      );

      // Sort by year
      yearlyTrend.sort((a, b) => a.year.localeCompare(b.year));

      // Calculate trend
      const recentYears = yearlyTrend.slice(-2);
      const trend: "up" | "down" | "neutral" =
        recentYears.length === 2
          ? recentYears[1].count > recentYears[0].count
            ? "up"
            : recentYears[1].count < recentYears[0].count
              ? "down"
              : "neutral"
          : "neutral";

      // Get similar jobs (same title, different companies)
      const selectSimilarFields = [
        "job_title",
        "operating_name",
        props.type === "lmia" ? "territory" : "state",
        props.type === "lmia" ? "program" : "employer_type",
      ];

      const { data: similarJobsData, error: similarError } = await db
        .from(props.table)
        .select(selectSimilarFields.join(", "))
        .eq("job_title", props.jobTitle)
        .limit(5);

      if (similarError) throw similarError;

      return {
        value: matchingJobs.length,
        trend,
        distribution,
        yearlyTrend,
        similarJobs: similarJobsData as unknown as SimilarJob[],
      };
    },
  });
}

interface UseSimilarJobsProps {
  table: string;
  nocCode: string;
  location: string;
  locationField: string;
  currentCompany: string;
  type: "lmia" | "hot_leads";
}

export function useSimilarJobs({
  table,
  nocCode,
  location,
  locationField,
  currentCompany,
  type,
}: UseSimilarJobsProps) {
  return useQuery({
    queryKey: ["similar-jobs", table, nocCode, location, locationField, type],
    queryFn: async () => {
      const { data, error } = await db
        .from(table)
        .select(
          type === "lmia"
            ? "job_title, employer, program"
            : "job_title, employer, employer_type"
        )
        .eq("noc_code", nocCode)
        .eq(locationField, location)
        .neq("employer", currentCompany)
        .limit(5);

      if (error) throw error;
      return data;
    },
  });
}
