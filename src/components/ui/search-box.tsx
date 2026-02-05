'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  TrendingUp,
  ArrowRight,
  Star,
  Check,
  Car,
  Building,
  Hospital,
  Utensils,
  Wheat,
  Store,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  Briefcase, // restored for suggestions
  Clock,
  List, // restored for suggestions header
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
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import CategoryBox from './category-box';
import TrendingSearchBox from './trending-search-box';
import { AttributeName } from '@/helpers/attribute';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface Suggestion {
  suggestion: string;
  field?: string;
  hits?: number;
}

const categories = [
  {
    icon: <Car className="h-5 w-5" />,
    noc_priority: 'Automotive_Maintenance',
    bg: 'bg-brand-50',
  },
  {
    icon: <Building className="h-5 w-5" />,
    noc_priority: 'Construction',
    bg: 'bg-brand-50',
  },
  {
    icon: <Wheat className="h-5 w-5" />,
    noc_priority: 'Farm',
    bg: 'bg-brand-50',
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    noc_priority: 'F&B',
    bg: 'bg-brand-50',
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    noc_priority: 'Food Processing',
    bg: 'bg-brand-50',
  },
  {
    icon: <Hospital className="h-5 w-5" />,
    noc_priority: 'Healthcare',
    bg: 'bg-brand-50',
  },
  {
    icon: <Store className="h-5 w-5" />,
    noc_priority: 'Office_Retail',
    bg: 'bg-brand-50',
  },
];

export function SearchBox() {
  const { isMobile, isMounted } = useMobile();
  const [input, setInput] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchType, setSearchType] = useState<'hot_leads' | 'lmia'>(
    'hot_leads'
  );

  // --- RANGE (Trending Jobs only)
  const [dateRange, setDateRange] = useState<DateRange | undefined>();


  const { updateCreditsAndSearch } = useUpdateCredits();
  const { toast } = useToast();
  const router = useRouter();
  const { session } = useSession();
  const searchParams = useSearchParams();
  const sp = new URLSearchParams(searchParams?.toString() || '');

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationMenuRef = useRef<HTMLDivElement>(null);

  // helpers for dates
  const toYMD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (dateRange?.from) {
      const fromParam = toYMD(dateRange.from);
      // If 'to' is undefined, we might just set to=from or handle it however the backend expects.
      // Usually ranges need both or at least 'from'.
      // If 'to' is present:
      const toParam = dateRange.to ? toYMD(dateRange.to) : '';

      // Update URL params logic will happen in attachRangeParams
    }
  }, [dateRange]);

  // seed from URL (if user lands with date_from/date_to)
  useEffect(() => {
    const urlFrom = searchParams?.get('date_from');
    const urlTo = searchParams?.get('date_to');
    if (urlFrom) {
      // simplistic parse, assumes YYYY-MM-DD
      const [y, m, d] = urlFrom.split('-').map(Number);
      const fromDate = new Date(y, m - 1, d);
      let toDate = undefined;
      if (urlTo) {
        const [ty, tm, td] = urlTo.split('-').map(Number);
        toDate = new Date(ty, tm - 1, td);
      }
      setDateRange({ from: fromDate, to: toDate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(t) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(t)
      ) {
        setShowSuggestions(false);
      }
      if (locationMenuRef.current && !locationMenuRef.current.contains(t)) {
        setShowLocationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // suggestions fetcher
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

  // attach date params to URL only for trending jobs
  const attachRangeParams = (params: URLSearchParams) => {
    if (searchType === 'hot_leads' && dateRange?.from) {
      params.set('date_from', toYMD(dateRange.from));
      if (dateRange.to) {
        params.set('date_to', toYMD(dateRange.to));
      } else {
        params.delete('date_to');
      }
    } else {
      params.delete('date_from');
      params.delete('date_to');
    }
  };

  const handleSuggestionClick = async (s: Suggestion) => {
    if (!session?.session) {
      updateCreditsAndSearch(s?.suggestion);
      sp.set('field', s.field ?? 'all');
      if (location.trim()) sp.set('state', location.trim());
      attachRangeParams(sp);

      if (searchType === 'hot_leads') {
        sp.set('t', 'trending_job');
        router.push(
          `/search/hot-leads/${encodeURIComponent(
            s.suggestion
          )}?${sp.toString()}`
        );
      } else {
        sp.set('t', 'lmia');
        router.push(
          `/search/lmia/${encodeURIComponent(s.suggestion)}?${sp.toString()}`
        );
      }
      return;
    }
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
      const loc = (location || '').trim();
      const cty = (city || '').trim();
      const isCanada = loc.toLowerCase() === 'canada';

      if (isCanada) {
        sp.delete('state');
        sp.delete('city');
      } else {
        if (loc) sp.set('state', loc);
        else sp.delete('state');
        if (cty) sp.set('city', cty);
        else sp.delete('city');
      }

      sp.set('field', 'job_title');
      attachRangeParams(sp);

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

      const base =
        searchType === 'hot_leads'
          ? `/search/hot-leads/${encodeURIComponent(input)}`
          : `/search/lmia/${encodeURIComponent(input)}`;

      router.push(sp.toString() ? `${base}?${sp.toString()}` : base);
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
    if (session?.trial) {
      // Trial session, allow access
      return true;
    }
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
      const remaining = credits.total_credit - (credits.used_credit || 0);
      if (remaining <= 0) {
        toast({
          title: 'No Credits Remaining',
          description:
            "You've used all your credits. Please purchase more to continue searching.",
          variant: 'destructive',
        });
        router.push('/dashboard/credits');
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

  if (!isMounted) {
    return null;
  }

  const hasCredits = session?.session || session?.trial || false; // simplified check for UI disabled states if needed

  return (
    <>
      {isMobile && <MobileHeader title="Job Search" />}
      <div
        className={
          isMobile
            ? 'w-full max-w-full mx-auto px-4 pt-4 pb-5'
            : 'w-full max-w-full mx-auto px-16 pt-32'
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={
            isMobile
              ? 'bg-white/95 backdrop-blur-2xl rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
              : 'bg-white/95 backdrop-blur-2xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden px-28'
          }
        >
          {/* Hero */}


          {/* Search Section */}
          <div
            className={
              isMobile
                ? 'p-4 relative bg-gradient-to-br from-brand-50/30 via-white to-brand-50/20'
                : 'p-10 pt-8 relative bg-gradient-to-br from-brand-50/30 via-white to-brand-50/20'
            }
          >
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative">
                {/* main search bar */}
                <div
                  className={cn(
                    isMobile
                      ? 'relative flex flex-col gap-3 rounded-xl transition-all duration-300 bg-white'
                      : 'relative flex items-stretch rounded-2xl transition-all duration-500 border-2 overflow-visible group w-full',
                    !isMobile &&
                    (showSuggestions || showLocationMenu
                      ? 'bg-white border-brand-500 shadow-lg shadow-brand-500/20 ring-2 ring-brand-500/10'
                      : 'bg-white border-gray-200 shadow-md hover:border-brand-300 hover:shadow-lg')
                  )}
                >
                  {isMobile ? (
                    <>
                      {/* Mobile: Simple search input */}
                      <div className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
                        <Search className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={input}
                          onChange={handleChange}
                          onFocus={() => setShowSuggestions(true)}
                          placeholder="Search jobs, companies..."
                          className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm focus:outline-none"
                          onKeyDown={(e) => e.key === 'Enter' && startSearch()}
                        />
                        {input && (
                          <button
                            onClick={() => {
                              setInput('');
                              setShowSuggestions(false);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Desktop: Complex layout */}
                      <motion.div
                        className="pl-5 pr-3 py-4 flex items-center"
                        animate={{ scale: showSuggestions ? 1.1 : 1 }}
                        transition={{
                          duration: 0.3,
                          type: 'spring',
                          stiffness: 200,
                        }}
                      >
                        <div
                          className={cn(
                            'p-2.5 rounded-xl transition-all duration-300 relative overflow-hidden',
                            showSuggestions
                              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg'
                              : 'bg-brand-100 text-brand-600 group-hover:bg-brand-200'
                          )}
                        >
                          <Search className="w-5 h-5 relative z-10" />
                        </div>
                      </motion.div>

                      <input
                        ref={searchInputRef}
                        type="text"
                        value={input}
                        onChange={handleChange}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Search for jobs, companies, NOC, keywords…"
                        className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-base py-4 px-2 focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && startSearch()}
                      />

                      <div className="my-2 w-px bg-gray-200" />
                    </>
                  )}

                  {/* location block */}
                  {isMobile ? (
                    <Button
                      type="button"
                      onClick={() => setShowLocationMenu((v) => !v)}
                      className="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-600" />
                        <span className="text-sm font-medium">
                          {location.trim() ? location : 'Add Location'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="relative flex items-center gap-2 px-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowLocationMenu((v) => !v)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl shadow-none px-3 py-2 transition-all duration-200',
                          showLocationMenu
                            ? 'bg-brand-50 text-brand-700'
                            : 'hover:bg-gray-100 text-gray-700'
                        )}
                      >
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium whitespace-nowrap">
                          {location.trim() ? location : 'Location'}
                        </span>
                      </Button>

                      {location.trim() && (
                        <Button
                          type="button"
                          aria-label="Clear location"
                          onClick={() => setLocation('')}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}

                      <div className="h-6 w-px bg-gray-200 mx-2" />

                      {/* Date Range Picker */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'flex items-center gap-2 rounded-xl shadow-none px-3 py-2 border-0 bg-transparent hover:bg-gray-100 text-gray-700',
                              (dateRange?.from || dateRange?.to) && 'text-brand-600 bg-brand-50 hover:bg-brand-100'
                            )}
                          >
                            <CalendarIcon className="w-4 h-4" />
                            <span className="text-sm font-medium whitespace-nowrap">
                              {dateRange?.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, 'LLL dd')} -{' '}
                                    {format(dateRange.to, 'LLL dd')}
                                  </>
                                ) : (
                                  format(dateRange.from, 'LLL dd')
                                )
                              ) : (
                                'Date Range'
                              )}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>

                      <AnimatePresence>
                        {showLocationMenu && (
                          <motion.div
                            ref={locationMenuRef}
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-[calc(100%+10px)] z-[10000] w-80 rounded-2xl border border-gray-200 bg-white shadow-xl"
                          >
                            <div className="p-3 border-b border-gray-100">
                              <Button
                                type="button"
                                onClick={() => {
                                  setLocation('Canada');
                                  setShowLocationMenu(false);
                                }}
                                className="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 hover:bg-brand-50 transition"
                              >
                                <span className="flex items-center gap-2 text-gray-800">
                                  <MapPin className="w-4 h-4 text-brand-600" />
                                  All of Canada
                                </span>
                                <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                                  Quick set
                                </span>
                              </Button>
                            </div>
                            <div className="p-3">
                              <Label className="block text-xs font-semibold text-gray-500 mb-2">
                                Type a state / province
                              </Label>
                              <Input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., Toronto, ON or British Columbia"
                                className="w-full mb-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter')
                                    setShowLocationMenu(false);
                                }}
                              />
                              <Label className="block text-xs font-semibold text-gray-500 mb-2">
                                Or type a city
                              </Label>
                              <Input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g., Edmonton, Abbotsford, Calgary"
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter')
                                    setShowLocationMenu(false);
                                }}
                              />
                              <div className="mt-3 flex justify-end gap-2">
                                <Button
                                  variant={'outline'}
                                  type="button"
                                  onClick={() => {
                                    setLocation('');
                                    setShowLocationMenu(false);
                                  }}
                                  className="text-sm px-3 py-1.5 rounded-lg "
                                >
                                  Clear
                                </Button>
                                <Button
                                  variant={'default'}
                                  type="button"
                                  onClick={() => setShowLocationMenu(false)}
                                  className="text-sm px-3 py-1.5 rounded-lg bg-brand-600 text-white"
                                >
                                  Done
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* trailing controls */}
                  {isMobile ? (
                    <Button
                      type="button"
                      onClick={startSearch}
                      disabled={isSearching || !input.trim()}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300',
                        isSearching || !input.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md'
                      )}
                    >
                      {isSearching ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Searching...
                        </div>
                      ) : (
                        'Search Jobs'
                      )}
                    </Button>
                  ) : (
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
                          !isSearching && input.trim()
                            ? { scale: 1.05 }
                            : undefined
                        }
                        whileTap={
                          !isSearching && input.trim()
                            ? { scale: 0.95 }
                            : undefined
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
                  )}
                </div>
              </div>

              {/* Suggestions Dropdown (restored) */}
              <AnimatePresence>
                {showSuggestions && input.trim() && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={
                      isMobile
                        ? 'absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[9999]'
                        : 'absolute left-0 right-0 top-full mt-3 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-sm border border-white/30 overflow-hidden z-[9999]'
                    }
                  >
                    <div
                      className={
                        isMobile
                          ? 'max-h-[300px] overflow-y-auto'
                          : 'max-h-[400px] overflow-y-auto'
                      }
                    >
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
                                  <span className="text-sm text-gray-500 mt-1 block flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                      <>
                                        <List className="w-3 h-3" />
                                        <AttributeName name={s.field || ''} />
                                      </>
                                    </span>
                                    {s.hits && (
                                      <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                        <span className="text-gray-600">
                                          {s.hits.toLocaleString()} results
                                        </span>
                                      </span>
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
          <div
            className={
              isMobile
                ? 'bg-gradient-to-br from-brand-50/50 via-white to-brand-50/30 px-4 pt-4 pb-4'
                : 'bg-gradient-to-br from-brand-50/50 via-white to-brand-50/30 px-10 pt-10 pb-6'
            }
          >
            {/* <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={isMobile ? 'text-left mb-3' : 'text-center mb-6'}
            >
              <Badge
                className={
                  isMobile
                    ? 'px-3 py-1 text-xs font-semibold bg-gradient-to-r from-brand-100 to-brand-200 text-brand-800 border-brand-200'
                    : 'px-6 py-2 text-sm font-semibold bg-gradient-to-r from-brand-100 to-brand-200 text-brand-800 hover:from-brand-200 hover:to-brand-300 border-brand-200 shadow-md'
                }
              >
                Find Top Opportunities
              </Badge>
            </motion.div> */}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={
                isMobile
                  ? 'text-2xl font-bold text-gray-900 tracking-tight leading-tight text-left mb-1'
                  : 'text-5xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight text-center mb-1'
              }
            >
              Discover the job you want
            </motion.h1>
            {!isMobile && (
              <div className="flex justify-center">
                <h3 className="text-xl pt-2 md:text-2xl font-medium text-brand-600 text-center mb-6">
                  Search by
                </h3>
                <TypewriterEffect
                  title=""
                  words={['NOC', 'Province or City', 'Job title']}
                />
              </div>
            )}
          </div>

          {/* Search Type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={isMobile ? 'px-4' : 'px-10'}
          >
            <div
              className={
                isMobile ? 'flex flex-col gap-3' : 'flex items-center gap-6 w-full'
              }
            >
              <span
                className={
                  isMobile
                    ? 'text-xs font-semibold text-gray-700'
                    : 'text-sm font-semibold text-gray-700'
                }
              >
                Search Type:
              </span>
              <div className="flex items-center gap-4">
                <motion.label
                  className="flex items-center gap-2 cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div className="relative" whileHover={{ scale: 1.1 }}>
                    <Input
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
                        <Check className="w-3 h-3 text-white" />
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

                <motion.label
                  className="flex items-center gap-2 cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div className="relative" whileHover={{ scale: 1.1 }}>
                    <Input
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
                        <Check className="w-3 h-3 text-white" />
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

          {/* Trending */}
          <div
            className={
              isMobile
                ? 'px-4 pb-6 bg-gradient-to-br from-transparent via-brand-50/20 to-transparent'
                : 'px-10 pb-2 bg-gradient-to-br from-transparent via-brand-50/20 to-transparent'
            }
          >
            <motion.div
              className={isMobile ? 'mt-4' : 'mt-8 w-full'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div
                className={
                  isMobile
                    ? 'flex items-center gap-2 mb-3'
                    : 'flex items-center gap-3 mb-4'
                }
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <div
                    className={
                      isMobile
                        ? 'p-1.5 rounded-lg bg-gradient-to-r from-brand-100 to-brand-200'
                        : 'p-2 rounded-xl bg-gradient-to-r from-brand-100 to-brand-200 shadow-lg shadow-brand-500/20'
                    }
                  >
                    <TrendingUp
                      className={
                        isMobile
                          ? 'w-4 h-4 text-brand-600'
                          : 'w-5 h-5 text-brand-600'
                      }
                    />
                  </div>
                </motion.div>
                <div>
                  <span
                    className={
                      isMobile
                        ? 'text-xs text-gray-500 pt-1'
                        : 'text-sm text-gray-500 pt-1 font-semibold'
                    }
                  >
                    High End Jobs
                  </span>
                  {!isMobile && (
                    <p className="text-sm text-gray-500">
                      Popular jobs right now
                    </p>
                  )}
                </div>
              </div>

              <TrendingSearchBox
                dateFrom={dateRange?.from ? toYMD(dateRange.from) : undefined}
                dateTo={dateRange?.to ? toYMD(dateRange.to) : undefined}
                checkCredits={checkCredits}
                fetchSuggestions={fetchSuggestions}
                location={location}
                searchType={searchType}
                setInput={setInput}
                setShowSuggestions={setShowSuggestions}
              />
            </motion.div>
          </div>

          {/* Categories */}
          <CategoryBox
            dateFrom={dateRange?.from ? toYMD(dateRange.from) : undefined}
            dateTo={dateRange?.to ? toYMD(dateRange.to) : undefined}
            location={location}
            searchType={searchType}
          />
        </motion.div>
      </div >
      {isMobile && <BottomNav />
      }
    </>
  );
}

export default SearchBox;
