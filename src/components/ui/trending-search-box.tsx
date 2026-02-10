import { TrendingUp, Loader2 } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUpdateCredits } from '@/hooks/use-credits';
import db from '@/db';

// Helper to derive TEER from NOC 2021 code
// TEER 0: Management (NOC starts with 0)
// TEER 1: University degree (2nd digit = 1)
// TEER 2: College/Apprenticeship >= 2 years (2nd digit = 2)
// TEER 3: College/Apprenticeship < 2 years (2nd digit = 3)
// TEER 4: High school (2nd digit = 4)
// TEER 5: No formal education (2nd digit = 5)
function getTeerFromNoc(noc: string): number {
  if (!noc || noc.length < 5) return 5; // Fallback
  if (noc.startsWith('0')) return 0;
  const secondDigit = parseInt(noc[1], 10);
  if (secondDigit >= 1 && secondDigit <= 5) return secondDigit;
  return 5; // Default fallback
}

type TrendingItem = {
  term: string;
  count: number;
  teer: number;
  noc: string;
};

function TrendingSearchBox({
  searchType,
  dateFrom,
  dateTo,
  selectedProvinces,
  selectedCities,
  setInput,
  setShowSuggestions,
  fetchSuggestions,
  checkCredits,
}: {
  searchType: 'hot_leads' | 'lmia';
  dateFrom?: string;
  dateTo?: string;
  selectedProvinces: string[];
  selectedCities: string[];
  setInput: (input: string) => void;
  setShowSuggestions: (show: boolean) => void;
  fetchSuggestions: (input: string) => void;
  checkCredits: () => Promise<boolean>;
}) {
  const router = useRouter();
  const { updateCreditsAndSearch } = useUpdateCredits();

  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeer, setSelectedTeer] = useState<number | 'all'>('all');

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const table = searchType === 'hot_leads' ? 'trending_job' : 'lmia';

        // Fetch top jobs for each tier
        const tiers = [0, 1, 2, 3, 4, 5];
        const allItems: TrendingItem[] = [];

        for (const tier of tiers) {
          const { data } = await db
            .from(table)
            .select('job_title')
            .eq('tier', tier) // Assuming 'tier' column exists. If 'teer', swap.
            .not('job_title', 'is', null)
            .limit(200); // Sample 200 per tier to find top

          if (!data) continue;

          // Aggregate
          const counts: Record<string, number> = {};
          data.forEach((row: any) => {
            // Basic Title Case Normalization
            const title = (row.job_title || '')
              .toLowerCase()
              .split(' ')
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
              .trim();
            if (title) counts[title] = (counts[title] || 0) + 1;
          });

          // Sort & Top 5
          const sorted = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([term, count]) => ({
              term,
              count,
              teer: tier,
              noc: '' // We don't have NOC here, but can search by Title.
            }));

          allItems.push(...sorted);
        }

        if (isMounted) {
          setTrendingData(allItems);
        }

      } catch (err) {
        console.error("Failed to fetch trending data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => { isMounted = false; };
  }, [searchType]);


  const displayedItems = useMemo(() => {
    if (selectedTeer === 'all') return trendingData.slice(0, 8);
    return trendingData.filter(i => i.teer === selectedTeer).slice(0, 8);
  }, [trendingData, selectedTeer]);

  const handleTrendingClick = async (item: TrendingItem) => {
    setInput(item.term);
    setShowSuggestions(true);
    fetchSuggestions(item.term);

    try {
      const hasCredits = await checkCredits();
      if (!hasCredits) return;

      await updateCreditsAndSearch(item.term);
      const qs = new URLSearchParams();
      qs.set('field', 'job_title'); // Search by Title (now populated)

      // Add locations
      selectedProvinces.forEach(p => qs.append('state', p));
      selectedCities.forEach(c => qs.append('city', c));

      if (dateFrom && dateTo) {
        qs.set('date_from', dateFrom);
        qs.set('date_to', dateTo);
      }

      const searchTerm = item.term;

      if (searchType === 'hot_leads') {
        qs.set('t', 'trending_job');
        router.push(
          `/search/hot-leads/${encodeURIComponent(searchTerm)}?${qs.toString()}`
        );
      } else if (searchType === 'lmia') {
        qs.set('t', 'lmia');
        router.push(
          `/search/lmia/${encodeURIComponent(searchTerm)}?${qs.toString()}`
        );
      }
    } finally {
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* TEER Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-1 px-2">
        {['all', 0, 1, 2, 3, 4, 5].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTeer(t as any)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border",
              selectedTeer === t
                ? "bg-brand-600 text-white border-brand-600 shadow-md transform scale-105"
                : "bg-white text-gray-500 border-gray-200 hover:border-brand-200 hover:text-brand-500"
            )}
          >
            {t === 'all' ? 'All' : `Teer ${t}`}
          </button>
        ))}
      </div>

      {/* Trending Items */}
      <div className="flex flex-wrap items-center justify-center gap-2 min-h-[40px]">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-xs animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading trending...
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-gray-400 text-xs italic">No trending jobs found for this tier.</div>
        ) : (
          <AnimatePresence>
            {displayedItems.map((item, index) => (
              <motion.button
                key={`${item.term}-${selectedTeer}`}
                className={cn(
                  'group relative px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full transition-all duration-200 text-xs font-medium hover:border-brand-300 hover:text-brand-600 hover:shadow-sm'
                )}
                onClick={() => handleTrendingClick(item)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-brand-400 group-hover:text-brand-500 transition-colors" />
                  <span>{item.term}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default TrendingSearchBox;
