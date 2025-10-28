import { ArrowRight, Star } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUpdateCredits } from '@/hooks/use-credits';

const trendingByType = {
  hot_leads: [
    'Bookkeeper',
    'Cook',
    'Kitchen Helper',
    'Truck Driver',
    'Carpenter',
    'Baker',
  ],
  lmia: [
    'Food Service Supervisors',
    'Cooks',
    'Retail Sales Supervisors',
    'Transport Truck Drivers',
  ],
} as const;

function TrendingSearchBox({
  searchType,
  dateFrom,
  dateTo,
  location,
  setInput,
  setShowSuggestions,
  fetchSuggestions,
  checkCredits,
}: {
  searchType: 'hot_leads' | 'lmia';
  dateFrom?: string;
  dateTo?: string;
  location: string;
  setInput: (input: string) => void;
  setShowSuggestions: (show: boolean) => void;
  fetchSuggestions: (input: string) => void;
  checkCredits: () => Promise<boolean>;
}) {
  const trendingSearches = trendingByType[searchType];
  const router = useRouter();
  const { updateCreditsAndSearch } = useUpdateCredits();

  const handleTrendingClick = async (term: string) => {
    setInput(term);
    setShowSuggestions(true);
    fetchSuggestions(term);

    try {
      const hasCredits = await checkCredits();
      if (!hasCredits) return;

      await updateCreditsAndSearch(term);
      const qs = new URLSearchParams();
      qs.set('field', 'job_title');
      if (location.trim()) qs.set('state', location.trim());
      if (dateFrom && dateTo) {
        qs.set('date_from', dateFrom);
        qs.set('date_to', dateTo);
      }
      if (searchType === 'hot_leads') {
        qs.set('t', 'trending_job');
        router.push(
          `/search/hot-leads/${encodeURIComponent(term)}?${qs.toString()}`
        );
      } else if (searchType === 'lmia') {
        qs.set('t', 'lmia');
        router.push(
          `/search/lmia/${encodeURIComponent(term)}?${qs.toString()}`
        );
      }
    } finally {
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      {trendingSearches.map((term, index) => (
        <motion.button
          key={term}
          className={cn(
            'group relative px-5 py-3 bg-gradient-to-r from-white to-brand-50 border border-brand-200 text-gray-700 rounded-2xl transition-all duration-300 text-sm font-semibold overflow-hidden shadow-md hover:shadow-xl shadow-brand-500/10',
            'hover:scale-105 hover:border-brand-300'
          )}
          onClick={() => handleTrendingClick(term)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
          whileHover={{ y: -2, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
                type: 'spring',
                stiffness: 200,
              }}
            >
              <Star className="w-4 h-4 text-yellow-500 drop-shadow-sm" />
            </motion.div>
            <span className="font-medium">{term}</span>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-all duration-200"
              initial={{ x: -5, scale: 0.8 }}
              whileHover={{ x: 0, scale: 1 }}
            >
              <ArrowRight className="w-3 h-3 text-brand-500" />
            </motion.div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export default TrendingSearchBox;
