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
      // Use RPC function for efficient server-side aggregation
      try {
        const { data: rpcData, error: rpcError } = await db.rpc('get_distinct_values_with_count', {
          table_name: table,
          column_name: type
        });
        
        if (!rpcError && rpcData) {
          return rpcData
            .filter((item: any) => item.name && item.name.trim())
            .sort((a: any, b: any) => b.count - a.count);
        }
      } catch {
        console.warn('RPC function not available, falling back to client-side aggregation');
      }

      // Fallback: Fetch with limit and aggregate client-side
      const { data, error } = await db
        .from(table)
        .select(type)
        .limit(50000); // Reasonable limit for fallback
      
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
        .sort((a, b) => b.count - a.count);

      return result;
    },
    staleTime: 600_000, // 10 minutes - cache longer since this is expensive
  });
}

export function useComparisonData(
  type: ComparisonType,
  entity1: string,
  entity2: string,
  entity3?: string
) {
  const sp = useSearchParams();
  const table = (sp?.get('t') ?? 'trending_job').trim();

  return useQuery({
    queryKey: ['comparison', table, type, entity1, entity2, entity3],
    queryFn: async () => {
      // Fetch data for entities (2 or 3)
      const promises = [
        fetchEntityData(table, type, entity1),
        fetchEntityData(table, type, entity2),
      ];
      
      if (entity3) {
        promises.push(fetchEntityData(table, type, entity3));
      }
      
      // Also fetch benchmark data
      const benchmarkPromise = fetchBenchmarkData(table, type);
      
      const results = await Promise.all([...promises, benchmarkPromise]);
      const benchmark = results.pop();
      
      const response: any = {
        entity1: results[0],
        entity2: results[1],
        benchmark,
      };
      
      if (entity3 && results[2]) {
        response.entity3 = results[2];
      }

      return response;
    },
    enabled: !!entity1 && !!entity2,
    staleTime: 60_000,
  });
}

// Fetch benchmark/average data for context
async function fetchBenchmarkData(table: string, type: ComparisonType) {
  // Get total count first
  const { count: totalCount } = await db
    .from(table)
    .select('*', { count: 'exact', head: true });

  // Sample larger set for better accuracy
  const { data, error } = await db
    .from(table)
    .select('*')
    .limit(50000); // Increased sample size

  if (error || !data || !totalCount) return null;

  // Count unique values
  const valueMap = new Map<string, number>();
  data.forEach((row: any) => {
    const value = row[type];
    if (value) {
      valueMap.set(value, (valueMap.get(value) || 0) + 1);
    }
  });

  const uniqueValues = valueMap.size;
  // Use median instead of mean for more realistic benchmark
  const counts = Array.from(valueMap.values()).sort((a, b) => a - b);
  const medianJobs = counts[Math.floor(counts.length / 2)] || 1;
  
  // Also calculate mean for reference
  const totalJobs = counts.reduce((sum, c) => sum + c, 0);
  const avgJobsPerValue = Math.round(totalJobs / uniqueValues);

  return {
    totalJobs: totalCount,
    uniqueValues,
    avgJobsPerValue: Math.max(avgJobsPerValue, medianJobs), // Use higher of avg or median
    medianJobs,
    topValues: calculateTopValues(data, type),
  };
}

function calculateTopValues(data: any[], type: ComparisonType) {
  const valueMap = new Map<string, number>();
  data.forEach((row: any) => {
    const value = row[type];
    if (value) {
      valueMap.set(value, (valueMap.get(value) || 0) + 1);
    }
  });
  
  return Array.from(valueMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
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

  // Calculate growth trend (last 3 months vs previous 3 months)
  const recentMonths = monthlyTrends.slice(-6);
  let growthRate = 0;
  if (recentMonths.length >= 6) {
    const recent3 = recentMonths.slice(-3).reduce((sum, m) => sum + m.count, 0);
    const previous3 = recentMonths.slice(0, 3).reduce((sum, m) => sum + m.count, 0);
    if (previous3 > 0) {
      growthRate = ((recent3 - previous3) / previous3) * 100;
    }
  }

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
    growthRate: Math.round(growthRate * 10) / 10, // Round to 1 decimal
    rawData: data?.slice(0, 100) ?? [], // Sample data
  };
}
