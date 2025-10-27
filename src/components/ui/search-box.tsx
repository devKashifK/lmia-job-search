'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowRight,
  Clock,
  Star,
  Check,
  Car,
  Building,
  Hospital,
  Utensils,
  Wheat,
  Store,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { useUpdateCredits } from '@/hooks/use-credits';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import db from '@/db';
import { useTableStore } from '@/context/store';
import { Badge } from '@/components/ui/badge';
import { TypewriterEffect } from './type-writter';

interface Suggestion {
  suggestion: string;
  field?: string;
}

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

const categories = [
  {
    icon: <Car className="h-5 w-5" />,
    noc_priority: 'Automotive_Maintenance',
    description: 'Jobs in vehicle maintenance and repair',
    bg: 'bg-brand-50',
  },
  {
    icon: <Building className="h-5 w-5" />,
    noc_priority: 'Construction',
    description: 'Construction and building trades',
    bg: 'bg-brand-50',
  },
  {
    icon: <Wheat className="h-5 w-5" />,
    noc_priority: 'Farm',
    description: 'Agricultural and farming positions',
    bg: 'bg-brand-50',
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    noc_priority: 'F&B',
    description: 'Food and beverage service jobs',
    bg: 'bg-brand-50',
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    noc_priority: 'Food Processing',
    description: 'Food manufacturing and processing',
    bg: 'bg-brand-50',
  },
  {
    icon: <Hospital className="h-5 w-5" />,
    noc_priority: 'Healthcare',
    description: 'Medical and healthcare positions',
    bg: 'bg-brand-50',
  },
  {
    icon: <Store className="h-5 w-5" />,
    noc_priority: 'Office_Retail',
    description: 'Office and retail positions',
    bg: 'bg-brand-50',
  },
];

export function SearchBox() {
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchType, setSearchType] = useState<'hot_leads' | 'lmia'>(
    'hot_leads'
  );

  const { updateCreditsAndSearch } = useUpdateCredits();
  const { toast } = useToast();
  const router = useRouter();
  const { session } = useSession();
  const searchParams = useSearchParams();
  const sp = new URLSearchParams(searchParams?.toString() || '');

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setDataConfig, setFilterPanelConfig } = useTableStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      if (searchType === 'hot_leads') {
        const { data, error } = await db.rpc('suggest_trending_job', {
          p_field: 'all',
          p_q: query,
          p_limit: 10,
        });
        if (error) throw error;
        setSuggestions((data as Suggestion[]) || []);
      } else {
        const { data, error } = await db.rpc('suggest_lmia', {
          p_field: 'all',
          p_q: query,
          p_limit: 10,
        });
        if (error) throw error;
        setSuggestions((data as Suggestion[]) || []);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setShowSuggestions(true);
    void fetchSuggestions(value);
  };

  const handleSuggestionClick = async (s: Suggestion) => {
    // If not logged in, consume credits and navigate directly
    if (!session?.session) {
      updateCreditsAndSearch(s?.suggestion);
      if (searchType === 'hot_leads') {
        sp.set('field', s.field ?? 'all');
        sp.set('t', 'trending_job');
        router.push(
          `/search/hot-leads/${encodeURIComponent(
            s.suggestion
          )}?${sp.toString()}`
        );
      } else {
        sp.set('field', s.field ?? 'all');
        sp.set('t', 'lmia');
        router.push(
          `/search/lmia/${encodeURIComponent(s.suggestion)}?${sp.toString()}`
        );
      }
      return;
    }
    // If logged in, just fill input and let user hit search
    setInput(s.suggestion);
    setShowSuggestions(false);
  };

  const startSearch = async () => {
    if (!input.trim()) {
      toast({
        title: 'Empty Search',
        description: 'Please enter a search term',
        variant: 'destructive',
      });
      return;
    }
    setIsSearching(true);
    try {
      if (!session?.session) {
        updateCreditsAndSearch(input);
        if (searchType === 'hot_leads') {
          sp.set('t', 'trending_job');
          router.push(
            `/search/hot-leads/${encodeURIComponent(input)}?${sp.toString()}`
          );
        } else {
          sp.set('t', 'lmia');
          router.push(
            `/search/lmia/${encodeURIComponent(input)}?${sp.toString()}`
          );
        }
        return;
      }
      router.push(
        searchType === 'hot_leads'
          ? `/search/hot-leads/${encodeURIComponent(input)}`
          : `/search/lmia/${encodeURIComponent(input)}`
      );
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Error',
        description: 'An error occurred while searching',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const checkCredits = async () => {
    if (!session?.user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to perform this action',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data: credits, error } = await db
        .from('credits')
        .select('total_credit, used_credit')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (!credits) {
        toast({
          title: 'Error',
          description: 'Unable to fetch credits information',
          variant: 'destructive',
        });
        return false;
      }

      const remainingCredits =
        credits.total_credit - (credits.used_credit || 0);

      if (remainingCredits <= 0) {
        toast({
          title: 'No Credits Remaining',
          description:
            "You've used all your credits. Please purchase more to continue searching.",
          variant: 'destructive',
        });
        router.push('/dashboard/credits'); // Redirect to credits page
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking credits:', error);
      toast({
        title: 'Error',
        description: 'Unable to verify credits. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleTrendingClick = async (term: string) => {
    setInput(term);
    setShowSuggestions(true);
    fetchSuggestions(term);

    try {
      const hasCredits = await checkCredits();
      if (!hasCredits) return;

      await updateCreditsAndSearch(term);
      if (searchType === 'hot_leads') {
        router.push(
          `/search/hot-leads/${encodeURIComponent(
            term
          )}?field=job_title&t=trending_job`
        );
      } else if (searchType === 'lmia') {
        router.push(
          `/search/lmia/${encodeURIComponent(term)}?&field=job_title&t=lmia`
        );
      }
    } finally {
    }
  };

  const handleCategoryClick = (category: { noc_priority: string }) => {
    updateCreditsAndSearch(category.noc_priority);
    if (searchType === 'hot_leads') {
      router.push(
        `/search/hot-leads/${encodeURIComponent(
          category.noc_priority
        )}?field=category&t=trending_job`
      );
    } else {
      setDataConfig({
        type: 'lmia',
        table: 'lmia',
        columns: JSON.stringify([
          { priority_occupation: category.noc_priority },
        ]),
        keyword: category.noc_priority,
        method: 'query',
        page: 1,
        pageSize: 100,
      });
      setFilterPanelConfig({
        column: 'priority_occupation',
        table: 'lmia',
        keyword: category.noc_priority,
        type: 'lmia',
        method: 'query',
      });
      router.push(`/search/lmia/${encodeURIComponent(category.noc_priority)}`);
    }
  };

  const trendingSearches = trendingByType[searchType];

  return (
    <div className="w-full max-w-full mx-auto px-16 pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-brand-50/50 via-white to-brand-50/30 px-10 pt-10 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-6"
          >
            <Badge className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-brand-100 to-brand-200 text-brand-800 hover:from-brand-200 hover:to-brand-300 border-brand-200 shadow-md">
              Find Top Opportunities
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight text-center mb-6"
          >
            Discover{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-700 to-brand-600">
              Perfect{' '}
            </span>
            <span>Career</span>
          </motion.h1>

          <TypewriterEffect
            title="Search With"
            words={[
              'Noc Code',
              'Program',
              'Employer',
              'Address',
              'Occupation',
              'City',
              'Employer Name',
              'Province Mapping',
              '',
            ]}
          />

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <div className="text-lg md:text-xl text-gray-600 font-medium">
              Search With:{' '}
              <span className="font-bold text-brand-600 bg-gradient-to-r from-brand-50 to-brand-100 px-3 py-1 rounded-lg">
                Noc Code, Program, Employer, Address, Occupation, City, Employer
                Name, Province Mapping
              </span>
            </div>
          </motion.div> */}
        </div>

        {/* Search Section */}
        <div className="p-10 relative bg-gradient-to-br from-brand-50/30 via-white to-brand-50/20">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative">
              <div
                className={cn(
                  'relative flex items-center rounded-2xl transition-all duration-500 border-2 overflow-visible group',
                  showSuggestions
                    ? 'bg-white border-brand-500 shadow-lg shadow-brand-500/20 ring-2 ring-brand-500/10'
                    : 'bg-white border-gray-200 shadow-md hover:border-brand-300 hover:shadow-lg'
                )}
              >
                <motion.div
                  className="pl-5 pr-3 py-4"
                  animate={{ scale: showSuggestions ? 1.1 : 1 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <div
                    className={cn(
                      'p-2.5 rounded-xl transition-all duration-300 relative overflow-hidden',
                      showSuggestions
                        ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg'
                        : 'bg-brand-100 text-brand-600 group-hover:bg-brand-200'
                    )}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      animate={{ opacity: [0.3, 0.5, 0.3] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <Search className="w-5 h-5 relative z-10" />
                  </div>
                </motion.div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={input}
                  onChange={handleChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for jobs, companies, location , noc or keywords..."
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-base py-4 px-2 focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && startSearch()}
                />

                <div className="flex items-center gap-3 pr-4">
                  <AnimatePresence>
                    {input && (
                      <motion.button
                        type="button"
                        onClick={() => {
                          setInput('');
                          setShowSuggestions(false);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <motion.div
                          animate={{ rotate: 0 }}
                          whileHover={{ rotate: 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </motion.div>
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="button"
                    onClick={startSearch}
                    disabled={isSearching || !input.trim()}
                    className={cn(
                      'px-5 py-2.5 rounded-xl font-medium transition-all duration-300 relative overflow-hidden',
                      isSearching || !input.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                    )}
                    whileHover={
                      !isSearching && input.trim() ? { scale: 1.05 } : undefined
                    }
                    whileTap={
                      !isSearching && input.trim() ? { scale: 0.95 } : undefined
                    }
                  >
                    {isSearching ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    ) : (
                      <span className="flex items-center gap-2">
                        Search
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Animated underline */}
              {/* <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500"
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: showSuggestions ? '100%' : 0,
                  opacity: showSuggestions ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              /> */}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && input.trim() && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full mt-3 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-sm border border-white/30 overflow-hidden z-[9999]"
                >
                  <div className="max-h-[400px] overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="p-6 space-y-3">
                        {[...Array(4)].map((_, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4 animate-pulse" />
                              <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-1/2 animate-pulse" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="p-2">
                        <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-brand-100 rounded-2xl mb-2 border-b border-white/20">
                          <div className="flex items-center gap-2 text-sm text-brand-700 font-medium">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            >
                              <Clock className="w-4 h-4" />
                            </motion.div>
                            <span className="font-medium">
                              Suggestions based on your search
                            </span>
                          </div>
                        </div>

                        {suggestions.map((s, index) => (
                          <motion.div
                            key={`${s.suggestion}-${index}`}
                            className="group px-4 py-4 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-100 cursor-pointer transition-all duration-200 rounded-2xl mx-1 mb-1"
                            onClick={() => handleSuggestionClick(s)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-4">
                              <motion.div
                                className="p-3 rounded-2xl bg-gradient-to-r from-brand-100 to-brand-200 group-hover:from-brand-200 group-hover:to-brand-300 transition-all duration-200 relative overflow-hidden shadow-lg shadow-brand-500/20"
                                whileHover={{ rotate: 15, scale: 1.1 }}
                              >
                                <motion.div
                                  className="absolute inset-0 opacity-30"
                                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'linear',
                                  }}
                                />
                                <Search className="w-5 h-5 text-brand-600 relative z-10" />
                              </motion.div>
                              <div className="flex-1">
                                <span className="text-gray-800 group-hover:text-brand-700 transition-colors font-semibold text-base block">
                                  {s.suggestion}
                                </span>
                                <span className="text-sm text-gray-500 mt-1 block flex items-center gap-1">
                                  {s.field === 'job_title' ? (
                                    <>
                                      <Briefcase className="w-3 h-3" />
                                      Job Title
                                    </>
                                  ) : (
                                    <>
                                      <Search className="w-3 h-3" />
                                      Search term
                                    </>
                                  )}
                                </span>
                              </div>
                              <motion.div
                                className="opacity-0 group-hover:opacity-100 transition-all duration-200"
                                initial={{ x: 10, scale: 0.8 }}
                                whileHover={{ x: 0, scale: 1 }}
                              >
                                <motion.div
                                  animate={{ x: [0, 3, 0] }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                  }}
                                >
                                  <ArrowRight className="w-5 h-5 text-brand-500" />
                                </motion.div>
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        className="p-10 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <motion.div
                          className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center shadow-lg"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        >
                          <Search className="w-8 h-8 text-gray-400" />
                        </motion.div>
                        <p className="font-semibold text-gray-700 text-lg mb-1">
                          No suggestions found
                        </p>
                        <p className="text-sm text-gray-500">
                          Try different keywords or check spelling
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Search Type Checkboxes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className=" px-10"
        >
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-700">
              Search Type:
            </span>

            <div className="flex items-center gap-4">
              {/* LMIA Checkbox (acts as radio) */}
              <motion.label
                className="flex items-center gap-2 cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div className="relative" whileHover={{ scale: 1.1 }}>
                  <input
                    type="checkbox"
                    checked={searchType === 'lmia'}
                    onChange={() => setSearchType('lmia')}
                    className="sr-only"
                  />
                  <motion.div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                      searchType === 'lmia'
                        ? 'bg-brand-600 border-brand-600'
                        : 'border-gray-300 group-hover:border-brand-400'
                    )}
                  >
                    {searchType === 'lmia' && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, type: 'spring' }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    searchType === 'lmia'
                      ? 'text-brand-700'
                      : 'text-gray-600 group-hover:text-brand-600'
                  )}
                >
                  LMIA Approved
                </span>
              </motion.label>

              {/* Trending Jobs Checkbox (acts as radio) */}
              <motion.label
                className="flex items-center gap-2 cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div className="relative" whileHover={{ scale: 1.1 }}>
                  <input
                    type="checkbox"
                    checked={searchType === 'hot_leads'}
                    onChange={() => setSearchType('hot_leads')}
                    className="sr-only"
                  />
                  <motion.div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                      searchType === 'hot_leads'
                        ? 'bg-brand-600 border-brand-600'
                        : 'border-gray-300 group-hover:border-brand-400'
                    )}
                  >
                    {searchType === 'hot_leads' && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, type: 'spring' }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    searchType === 'hot_leads'
                      ? 'text-brand-700'
                      : 'text-gray-600 group-hover:text-brand-600'
                  )}
                >
                  Trending Jobs
                </span>
              </motion.label>
            </div>
          </div>
        </motion.div>

        {/* Trending Searches */}
        <div className="px-10 pb-10 bg-gradient-to-br from-transparent via-brand-50/20 to-transparent">
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <div className="p-2 rounded-xl bg-gradient-to-r from-brand-100 to-brand-200 shadow-lg shadow-brand-500/20">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                </div>
              </motion.div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  Trending Searches
                </h3>
                <p className="text-sm text-gray-500">
                  Popular job categories right now
                </p>
              </div>
            </div>

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
                  {/* Note: Tailwind doesn't have `opacity-15` by default; using a subtle overlay via opacity utility is optional */}
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
          </motion.div>
        </div>

        {/* Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="px-10 pb-10"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-left mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Popular Categories
            </h2>
            <p className="text-gray-600">Quick access to top job categories</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl">
            {categories.map((category, index) => (
              <motion.button
                key={category.noc_priority}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.05, duration: 0.3 }}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: 'rgb(249 250 251)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-300 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-100 text-brand-600">
                  {category.icon}
                </div>
                <div className="w-full">
                  <div className="font-medium text-gray-900 text-sm text-center">
                    {category.noc_priority.replace(/_/g, ' ')}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SearchBox;
