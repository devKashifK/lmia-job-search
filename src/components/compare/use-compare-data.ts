import { useQuery } from '@tanstack/react-query';
import db from '@/db';
import { useSearchParams } from 'next/navigation';

type ComparisonType = 'job_title' | 'state' | 'city' | 'employer';

export function useCompareData(type: ComparisonType) {
  const sp = useSearchParams();
  const table = (sp?.get('t') ?? 'trending_job').trim();

  return useQuery({
    queryKey: ['compare-options', table, type],
    queryFn: async () => {
      let q = db.from(table).select(type);
      const { data, error } = await q.limit(10000);
      if (error) throw new Error(error.message);

      // Count occurrences
      const countMap = new Map<string, number>();
      (data ?? []).forEach((row: any) => {
        const value = row?.[type] == null ? '' : String(row[type]).trim();
        if (value) {
          countMap.set(value, (countMap.get(value) || 0) + 1);
        }
      });

      // Convert to array and sort by count
      const result = Array.from(countMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 100); // Top 100 options

      return result;
    },
    staleTime: 300_000, // 5 minutes
  });
}

export function useComparisonData(
  type: ComparisonType,
  entity1: string,
  entity2: string
) {
  const sp = useSearchParams();
  const table = (sp?.get('t') ?? 'trending_job').trim();

  return useQuery({
    queryKey: ['comparison', table, type, entity1, entity2],
    queryFn: async () => {
      // Fetch data for both entities
      const [data1, data2] = await Promise.all([
        fetchEntityData(table, type, entity1),
        fetchEntityData(table, type, entity2),
      ]);

      return {
        entity1: data1,
        entity2: data2,
      };
    },
    enabled: !!entity1 && !!entity2,
    staleTime: 60_000,
  });
}

async function fetchEntityData(table: string, type: ComparisonType, value: string) {
  const { data, error, count } = await db
    .from(table)
    .select('*', { count: 'exact' })
    .eq(type, value)
    .limit(1000);

  if (error) throw new Error(error.message);

  // Calculate statistics
  const totalJobs = count ?? 0;
  const uniqueCities = new Set(data?.map((row: any) => row.city)).size;
  const uniqueStates = new Set(data?.map((row: any) => row.state || row.territory)).size;
  const uniqueEmployers = new Set(data?.map((row: any) => row.employer)).size;
  const uniqueNOCCodes = new Set(data?.map((row: any) => row.noc_code)).size;

  // Category breakdown
  const categoryMap = new Map<string, number>();
  const cityMap = new Map<string, number>();
  const employerMap = new Map<string, number>();
  const nocMap = new Map<string, number>();
  const monthlyMap = new Map<string, number>();

  data?.forEach((row: any) => {
    // Categories
    const category = row.category || row.job_title || 'Other';
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);

    // Cities
    const city = row.city || 'Unknown';
    cityMap.set(city, (cityMap.get(city) || 0) + 1);

    // Employers
    const employer = row.employer || row.operating_name || 'Unknown';
    employerMap.set(employer, (employerMap.get(employer) || 0) + 1);

    // NOC Codes
    const noc = row.noc_code || 'Unknown';
    nocMap.set(noc, (nocMap.get(noc) || 0) + 1);

    // Monthly trends
    const date = row.date_of_job_posting || row.lmia_year?.toString();
    if (date) {
      const month = typeof date === 'string' && date.includes('-') 
        ? date.slice(0, 7) 
        : date.toString();
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
    }
  });

  const topCategories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topCities = Array.from(cityMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topEmployers = Array.from(employerMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topNOC = Array.from(nocMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const monthlyTrends = Array.from(monthlyMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalJobs,
    uniqueCities,
    uniqueStates,
    uniqueEmployers,
    uniqueNOCCodes,
    topCategories,
    topCities,
    topEmployers,
    topNOC,
    monthlyTrends,
    rawData: data?.slice(0, 100) ?? [], // Sample data
  };
}
