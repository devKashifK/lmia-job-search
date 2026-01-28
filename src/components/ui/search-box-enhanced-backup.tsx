'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Briefcase,
  FileText,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { useUpdateCredits } from '@/hooks/use-credits';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import db from '@/db';

interface Suggestion {
  suggestion: string;
  field?: string;
}

const searchTabs = [
  {
    id: 'hot_leads',
    label: 'Trending',
    icon: TrendingUp,
    description: 'Hot job opportunities',
    gradient: 'from-brand-500 to-brand-600',
  },
  {
    id: 'lmia',
    label: 'LMIA Approved',
    icon: FileText,
    description: 'LMIA approved positions',
    gradient: 'from-brand-500 to-brand-600',
  },
];

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
};

export function SearchBox() {
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchType, setSearchType] = useState<'hot_leads' | 'lmia'>('hot_leads');
  const { updateCreditsAndSearch } = useUpdateCredits();
  const { toast } = useToast();
  const navigate = useRouter();
  const { session } = useSession();
  const searchParams = useSearchParams();
  const sp = new URLSearchParams(searchParams.toString());
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
        setSuggestions(data || []);
      } else if (searchType === 'lmia') {
        const { data, error } = await db.rpc('suggest_lmia', {
          p_field: 'all',
          p_q: query,
          p_limit: 10,
        });
        if (error) throw error;
        setSuggestions(data || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    if (!session?.session) {
      updateCreditsAndSearch(suggestion?.suggestion);
      if (searchType === 'hot_leads') {
        sp.set('field', suggestion.field ?? 'all');
        sp.set('t', 'trending_job');
        navigate.push(
          `/search/hot-leads/${encodeURIComponent(
            suggestion.suggestion
          )}?${sp.toString()}`
        );
      } else if (searchType === 'lmia') {
        sp.set('field', suggestion.field ?? 'all');
        sp.set('t', 'lmia');
        navigate.push(
          `/search/lmia/${encodeURIComponent(
            suggestion.suggestion
          )}?${sp.toString()}`
        );
      }
      return;
    }
    setInput(suggestion.suggestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      startSearch();
    }
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
          navigate.push(
            `/search/hot-leads/${encodeURIComponent(input)}?${sp.toString()}`
          );
        } else if (searchType === 'lmia') {
          sp.set('t', 'lmia');
          navigate.push(
            `/search/lmia/${encodeURIComponent(input)}?${sp.toString()}`
          );
        }
        return;
      }

      navigate.push(
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

  const handleTrendingClick = (term: string) => {
    setInput(term);
    startSearch();
  };

  const trendingSearches = trendingByType[searchType];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Tab Selection */}
        <div className="flex border-b border-white/30 bg-white/20 overflow-hidden backdrop-blur-sm">
          {searchTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = searchType === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setSearchType(tab.id as 'hot_leads' | 'lmia')}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-2 py-6 px-6 transition-all duration-500 relative overflow-hidden group',
                  isActive ? 'text-white' : 'text-gray-700 hover:text-gray-900'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn(
                      'absolute inset-0 bg-gradient-to-r shadow-lg',
                      tab.gradient
                    )}
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                {!isActive && (
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-brand-50/20 to-brand-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: isActive ? 360 : 0,
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: isActive ? Infinity : 0,
                      ease: 'linear',
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">{tab.label}</h3>
                    <p className="text-sm opacity-80">{tab.description}</p>
                  </div>
                </div>

                {isActive && (
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-white/90 drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Search Section */}
        <div className="p-10 relative bg-gradient-to-br from-brand-50/30 via-white to-brand-50/20">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div
              className={cn(
                'relative flex items-center rounded-3xl transition-all duration-500 border-2 overflow-visible group',
                showSuggestions
                  ? 'bg-white border-brand-500 shadow-2xl shadow-brand-500/25 ring-4 ring-brand-500/20'
                  : 'bg-white/80 backdrop-blur-md border-white/30 shadow-xl hover:shadow-2xl hover:border-brand-300/50'
              )}
            >
              <motion.div
                className="pl-6 pr-3 py-5"
                animate={{
                  scale: showSuggestions ? 1.15 : 1,
                  rotate: showSuggestions ? 360 : 0,
                }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              >
                <div
                  className={cn(
                    'p-3 rounded-2xl transition-all duration-300 relative overflow-hidden shadow-lg',
                    showSuggestions
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-brand-500/30'
                      : 'bg-gradient-to-r from-brand-100 to-brand-200 text-brand-600 group-hover:from-brand-200 group-hover:to-brand-300 shadow-brand-500/15'
                  )}
                >
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <Search className="w-6 h-6 relative z-10" />
                </div>
              </motion.div>

              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  className="w-full bg-transparent text-lg py-5 outline-none placeholder:text-gray-500 text-gray-800 font-medium transition-all duration-300 drop-shadow-sm"
                  placeholder={`Search for ${searchType === 'hot_leads'
                    ? 'trending job opportunities'
                    : 'LMIA approved positions'
                    }...`}
                  value={input}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                />

                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 shadow-lg shadow-brand-500/50"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: input ? '100%' : 0,
                    opacity: input ? 1 : 0,
                  }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
                />

                {input && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-brand-500/20 to-brand-600/20 blur-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>

              <motion.button
                className={cn(
                  'font-bold px-8 py-4 rounded-2xl transition-all duration-300 mr-3 min-w-[140px] flex items-center justify-center gap-2 text-sm relative overflow-hidden',
                  input.trim() && !isSearching
                    ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/30'
                    : 'bg-brand-100 text-brand-600 shadow-lg shadow-brand-500/10 cursor-not-allowed'
                )}
                onClick={startSearch}
                disabled={isSearching || !input.trim()}
                whileHover={
                  input.trim() && !isSearching ? { scale: 1.05, y: -2 } : {}
                }
                whileTap={input.trim() && !isSearching ? { scale: 0.95 } : {}}
              >
                {input.trim() && !isSearching && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}
                {isSearching ? (
                  <motion.div
                    className="flex items-center gap-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <motion.div
                      className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <span className="font-medium">Searching...</span>
                  </motion.div>
                ) : (
                  <>
                    <span className="font-medium relative z-10">Search Jobs</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      className="relative z-10"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </>
                )}
              </motion.button>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && input.trim() && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 top-full mt-3 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden z-[9999]"
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
                          {suggestions.map((suggestion, index) => (
                            <motion.div
                              key={index}
                              className="group px-4 py-4 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-100 cursor-pointer transition-all duration-200 rounded-2xl mx-1 mb-1"
                              onClick={() => handleSuggestionClick(suggestion)}
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
                                    animate={{
                                      opacity: [0.3, 0.5, 0.3],
                                    }}
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
                                    {suggestion.suggestion}
                                  </span>
                                  <span className="text-sm text-gray-500 mt-1 block flex items-center gap-1">
                                    {suggestion.field === 'job_title' ? (
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
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
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
                    key={index}
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
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 opacity-0 group-hover:opacity-15 transition-opacity duration-300" />

                    <div className="relative flex items-center gap-2">
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          rotate: [0, 10, -10, 0],
                        }}
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
        </div>
      </motion.div>
    </div>
  );
}

export default SearchBox;
