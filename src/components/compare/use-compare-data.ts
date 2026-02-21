import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { getComparisonData, getBenchmarkData, getEntityData } from '@/lib/api/comparison';

export type ComparisonType = 'job_title' | 'state' | 'city' | 'employer';

export function useCompareData(type: ComparisonType) {
  const sp = useSearchParams();
  const table = (sp?.get('t') ?? 'trending_job').trim();

  return useQuery({
    queryKey: ['compare-options', table, type],
    queryFn: async () => {
      // Use centralized API for comparison data
      return await getComparisonData(table, type);
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
        getEntityData(table, type, entity1),
        getEntityData(table, type, entity2),
      ];

      if (entity3) {
        promises.push(getEntityData(table, type, entity3));
      }

      // Also fetch benchmark data
      const benchmarkPromise = getBenchmarkData(table, type);

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
