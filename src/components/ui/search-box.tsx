'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  TrendingUp,
  ArrowRight,
  Briefcase,
  MapPin,
  X,
  ChevronDown,
  CalendarIcon,
  Check,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { useUpdateCredits } from '@/hooks/use-credits';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import db from '@/db';
import { trackSearch } from '@/utils/track-search';
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
import { DateRange } from 'react-day-picker';
import { CreateAlertDialog } from '@/components/alerts/create-alert-dialog';
import { HomeRecommendations } from '@/components/recommendations/home-recommendations';


interface Suggestion {
  suggestion: string;
  field?: string;
  hits?: number;
}

interface LocationSuggestion {
  city: string;
  province: string;
}

import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ... existing imports ...

// ... (Suggestion interfaces remain same)

export function SearchBox() {
  const { isMobile, isMounted } = useMobile();
  const [input, setInput] = useState('');
  const [locationText, setLocationText] = useState(''); // Text display only
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Location Hierarchy State (Multi-Select)
  const [provinces, setProvinces] = useState<{ province: string }[]>([]);
  const [cities, setCities] = useState<{ city: string; province: string }[]>([]);
  const [locationStep, setLocationStep] = useState<'province' | 'city'>('province');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);


  const [searchType, setSearchType] = useState<'hot_leads' | 'lmia'>('hot_leads');
  const [activeField, setActiveField] = useState<'what' | 'where' | 'dates' | null>(null);
  const [searchBy, setSearchBy] = useState<'all' | 'job_title' | 'category' | 'noc_code' | 'employer' | 'city'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  // ... (existing refs and hooks)

  const { updateCreditsAndSearch } = useUpdateCredits();
  const { toast } = useToast();
  const router = useRouter();
  const { session } = useSession();
  const searchParams = useSearchParams();
  const sp = new URLSearchParams(searchParams?.toString() || '');

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // helpers for dates
  const toYMD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (dateRange?.from) {
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
      if (locationMenuRef.current && !locationMenuRef.current.contains(t) && locationInputRef.current && !locationInputRef.current.contains(t)) {
        setShowLocationMenu(false);
      }

      // Clear active field if clicking outside main container
      const container = document.getElementById('search-pill-container');
      if (container && !container.contains(t)) {
        // Check if we clicked inside the calendar popover
        const calendarPopover = document.querySelector('[data-radix-popper-content-wrapper]');
        if (!calendarPopover?.contains(t)) {
          setActiveField(null);
        }
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
          p_field: searchBy,
          p_q: query,
          p_limit: 10,
        });
        if (error) throw error;
        setSuggestions((data as Suggestion[]) || []);
      } else {
        const { data, error } = await db.rpc('suggest_lmia', {
          p_field: searchBy,
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

  // 1. Fetch Provinces
  const fetchProvinces = async () => {
    try {
      const { data, error } = await db.rpc('get_provinces');
      if (!error && data) {
        setProvinces(data as { province: string }[]);
      }
    } catch (err) {
      console.error('Error fetching provinces:', err);
    }
  };

  // 2. Fetch Cities for ALL selected provinces (with fallback)
  const fetchCitiesForProvinces = async (provincesList: string[]) => {
    if (provincesList.length === 0) {
      setCities([]);
      return;
    }

    try {
      // Fetch stats for each selected province in parallel
      const allCitiesArrays = await Promise.all(
        provincesList.map(async (province) => {
          // Fetch from matching sources in parallel to get comprehensive list
          const [rpcRes, trendingRes, lmiaRes] = await Promise.all([
            // 1. RPC
            db.rpc('get_cities_by_province', {
              p_province: province,
              p_search: '',
            }),
            // 2. Trending Job Table (Direct with higher limit)
            db.from('trending_job')
              .select('city')
              .eq('state', province)
              .limit(5000), // Fetch more to uncover cities missing from RPC/Top lists
            // 3. LMIA Records Table
            db.from('lmia_records')
              .select('City')
              .eq('Province', province)
              .limit(5000)
          ]);

          let citiesForProv: { city: string; province: string }[] = [];

          // Collect from RPC
          if (!rpcRes.error && rpcRes.data && (rpcRes.data as any[]).length > 0) {
            const rpcCities = (rpcRes.data as { city: string }[]).map(c => ({ ...c, province }));
            citiesForProv = [...citiesForProv, ...rpcCities];
          }

          // Collect from Trending
          if (!trendingRes.error && trendingRes.data && trendingRes.data.length > 0) {
            const tCities = trendingRes.data
              .map(d => d.city)
              .filter(Boolean)
              .map(city => ({ city, province }));
            citiesForProv = [...citiesForProv, ...tCities];
          }

          // Collect from LMIA
          if (!lmiaRes.error && lmiaRes.data && lmiaRes.data.length > 0) {
            const lCities = lmiaRes.data
              .map(d => d.City)
              .filter(Boolean)
              .map(city => ({ city, province }));
            citiesForProv = [...citiesForProv, ...lCities];
          }

          // Deduplicate within this province
          const uniqueCities = new Set<string>();
          const distinct: { city: string; province: string }[] = [];

          for (const item of citiesForProv) {
            const normalized = item.city.trim(); // keep casing for display, but could normalize for check
            if (!uniqueCities.has(normalized)) {
              uniqueCities.add(normalized);
              distinct.push({ city: normalized, province });
            }
          }

          return distinct.sort((a, b) => a.city.localeCompare(b.city));
        })
      );

      // Flatten and deduplicate
      const flattened = allCitiesArrays.flat();

      // Deduplicate by city name across all provinces (or keep province context)
      // Since cities are keyed by province in the UI (key=`${c.province}-${c.city}-${idx}`), 
      // duplicates across provinces are fine (e.g. Springfield in multiple states).
      // But duplicates within same province should be handled by the per-province logic above.

      setCities(flattened);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  // Load provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Update cities when selected provinces change
  useEffect(() => {
    if (selectedProvinces.length > 0) {
      fetchCitiesForProvinces(selectedProvinces);
    } else {
      setCities([]);
    }
  }, [selectedProvinces]);

  // Update Location Text based on selections
  useEffect(() => {
    if (selectedCities.length > 0) {
      const count = selectedCities.length;
      setLocationText(`${count} Cit${count > 1 ? 'ies' : 'y'} Selected`);
    } else if (selectedProvinces.length > 0) {
      const count = selectedProvinces.length;
      setLocationText(`${count} Province${count > 1 ? 's' : ''} Selected`);
    } else {
      setLocationText('');
    }
  }, [selectedProvinces, selectedCities]);


  const handleProvinceToggle = (province: string) => {
    setSelectedProvinces(prev => {
      const next = prev.includes(province)
        ? prev.filter(p => p !== province)
        : [...prev, province];
      return next;
    });
    // If we deselect a province, we should remove its cities? 
    // Complicated UX. For now, let's clear cities if province is removed to be safe?
    // Or just filter valid cities later. 
    // Simplest: Clear cities when provinces change significantly or just let `fetchCitiesForProvinces` rebuild available list.
    // Real issue: `selectedCities` might contain cities from a deselected province.
    // Lets clear cities selection if we toggle provinces to avoid stale state for now, or filter them.
    setSelectedCities([]);
  };

  const handleCityToggle = (city: string) => {
    setSelectedCities(prev => {
      return prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city];
    });
  };

  const handleApplyLocation = () => {
    setShowLocationMenu(false);
    // Focus next field or just close
  };

  // reset on "Canada" selection
  const handleSelectCanada = () => {
    setSelectedProvinces([]);
    setSelectedCities([]);
    setLocationText('Canada');
    setShowLocationMenu(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setShowSuggestions(true);
    setActiveField('what');
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

      // Handle Location in URL
      sp.delete('state');
      sp.delete('city');
      if (selectedCities.length > 0) {
        selectedCities.forEach(c => sp.append('city', c));
        selectedProvinces.forEach(p => sp.append('state', p));
      } else {
        selectedProvinces.forEach(p => sp.append('state', p));
      }

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
    // ... validation ...
    if (!input.trim() && !dateRange?.from && selectedProvinces.length === 0 && selectedCities.length === 0 && locationText !== 'Canada') {
      // Allow if specifically "Canada" selected or manual text? 
      // For this UI, "Canada" means NO location filter.
    }

    setIsSearching(true);
    try {
      const isCanada = locationText.toLowerCase() === 'canada';

      if (isCanada || (selectedProvinces.length === 0 && selectedCities.length === 0)) {
        sp.delete('state');
        sp.delete('city');
      } else {
        // Multi-select URL params: append multiple 'state' or 'city' keys
        sp.delete('state');
        sp.delete('city');

        if (selectedCities.length > 0) {
          // If cities are selected, we filter by them. 
          // Do we ALSO need the province? Usually city implies province/state context or distinct names.
          // Search result logic likely handles `city` OR `state`? 
          // If I select "Toronto", I expect "Toronto, ON". 
          // Let's pass both if possible or just cities if they are granular enough.
          // Pass state context if query requires it. 
          // For now, let's pass all selected provinces AND all selected cities. 
          selectedCities.forEach(c => sp.append('city', c));
          // Also pass provinces? 
          selectedProvinces.forEach(p => sp.append('state', p));
        } else {
          // Only provinces selected
          selectedProvinces.forEach(p => sp.append('state', p));
        }
      }

      const searchTerm = input.trim() || 'all';
      sp.set('field', input.trim() ? searchBy : 'all');
      attachRangeParams(sp);

      // ... (rest of router push logic same as before, sp.toString() handles multi-params)

      const base =
        searchType === 'hot_leads'
          ? `/search/hot-leads/${encodeURIComponent(searchTerm)}`
          : `/search/lmia/${encodeURIComponent(searchTerm)}`;

      if (searchType === 'hot_leads') {
        sp.set('t', 'trending_job');
      } else {
        sp.set('t', 'lmia');
      }

      router.push(sp.toString() ? `${base}?${sp.toString()}` : base);

      // Track the search
      if (session?.user?.id) {
        const filters: Record<string, any> = {};
        if (selectedCities.length > 0) filters.cities = selectedCities;
        if (selectedProvinces.length > 0) filters.provinces = selectedProvinces;
        if (dateRange?.from) {
          filters.date_from = toYMD(dateRange.from);
          if (dateRange.to) filters.date_to = toYMD(dateRange.to);
        }
        filters.search_type = searchType;
        filters.search_by = searchBy;

        void trackSearch({
          userId: session.user.id,
          keyword: searchTerm,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        });
      }

    } catch (error) {
      // ... error ... 
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  // ... render ... 

  // In the UI for Zone 2: Where ...
  <div
    onClick={() => {
      setActiveField('where');
      setShowLocationMenu(true);
    }}
  // ... same styling ...
  >
    <Label className="...">Where</Label>
    <div className="flex items-center justify-between">
      <div className="text-base font-medium text-gray-900 truncate w-full">
        {locationText || "Select Location..."}
      </div>
      {locationText && (
        <button onClick={(e) => { e.stopPropagation(); handleSelectCanada(); setLocationText(''); }} className="p-1 hover:bg-gray-200 rounded-full">
          <X className="w-3 h-3 text-gray-400" />
        </button>
      )}
    </div>
  </div>

  // ... In Location Menu Dropdown ... 

  {/* Two-Step Multi-Select */ }
  <div className="mt-2 pt-2 border-t border-gray-100 max-h-[300px] overflow-y-auto">
    {locationStep === 'province' ? (
      <>
        <div className="flex items-center justify-between px-4 py-2 mb-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Provinces</div>
          {selectedProvinces.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocationStep('city')}
              className="h-7 text-xs text-brand-600 font-semibold hover:text-brand-700 hover:bg-brand-50"
            >
              Next: Select Cities <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-1 px-2">
          {provinces.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleProvinceToggle(p.province)}
            >
              <Checkbox
                checked={selectedProvinces.includes(p.province)}
                className="border-gray-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
              />
              <span className="text-sm font-medium text-gray-700">{p.province}</span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between px-2 mb-2 sticky top-0 bg-white z-10 py-2 border-b border-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocationStep('province')}
            className="h-8 px-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowRight className="w-4 h-4 rotate-180 mr-1" /> Back
          </Button>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Cities from {selectedProvinces.length} Provi...
          </div>
        </div>

        {cities.length > 0 ? (
          <div className="grid grid-cols-1 gap-1 px-2">
            {cities.map((c, idx) => (
              <div
                key={`${c.province}-${c.city}-${idx}`}
                className="flex items-center space-x-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleCityToggle(c.city)}
              >
                <Checkbox
                  checked={selectedCities.includes(c.city)}
                  className="border-gray-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">{c.city}</span>
                  <span className="text-[10px] text-gray-400">{c.province}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400 text-sm">No cities found.</div>
        )}

        <div className="sticky bottom-0 bg-white p-2 border-t border-gray-100 mt-2">
          <Button
            onClick={handleApplyLocation}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg h-9 text-sm"
          >
            Apply ({selectedCities.length})
          </Button>
        </div>
      </>
    )}
  </div>

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

  return (
    <>
      {isMobile && <MobileHeader title="Job Search" />}
      <div
        className={
          isMobile
            ? 'w-full max-w-full mx-auto px-4 pt-16 pb-10'
            : 'w-full max-w-7xl mx-auto px-6 pt-32 pb-16' // Dramatically reduced padding for "Eye Level"
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-20"
        >
          {/* Tabs (Moved outside bar) - Subtle */}
          <div className="flex justify-center gap-6 mb-2">
            <button
              onClick={() => setSearchType('hot_leads')}
              className={cn(
                "pb-2 text-sm font-semibold transition-all relative tracking-wide",
                searchType === 'hot_leads' ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Trending Jobs
              {searchType === 'hot_leads' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900" />
              )}
            </button>
            <button
              onClick={() => setSearchType('lmia')}
              className={cn(
                "pb-2 text-sm font-semibold transition-all relative tracking-wide",
                searchType === 'lmia' ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              )}
            >
              LMIA
              {searchType === 'lmia' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900" />
              )}
            </button>

          </div>

          {/* THE "TRI-ZONE PILL" Search Bar */}
          <div
            id="search-pill-container"
            className={cn(
              "relative max-w-5xl mx-auto bg-white rounded-full transition-all duration-300",
              isMobile
                ? "flex flex-col rounded-3xl shadow-xl overflow-hidden"
                : "flex items-center h-20 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
            )}
          >
            {/* Zone 1: What */}
            <div
              onClick={() => {
                setActiveField('what');
                searchInputRef.current?.focus();
              }}
              className={cn(
                "relative cursor-pointer hover:bg-gray-50/50 transition-colors",
                isMobile ? "p-4 border-b border-gray-100" : "h-full flex-[1.5] rounded-l-full pl-8 pr-4 flex flex-col justify-center", // Flex grow for input
                !isMobile && activeField === 'what' && "bg-gray-100/50 rounded-full"
              )}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Label
                    htmlFor="search-input"
                    className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest mb-0.5 block cursor-pointer ml-1 hover:text-brand-600 transition-colors flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Prevent activeField set if we want just menu, but here we want input focus too? 
                      // Actually, let's allow input focus but opening menu requires specific click on label.
                      // If we click label, it opens menu.
                    }}
                  >
                    {searchBy === 'all' ? 'Keywords' : searchBy.replace('_', ' ')}
                    <ChevronDown className="w-3 h-3" />
                  </Label>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>Search By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSearchBy('all')}>
                    Keywords (All)
                    {searchBy === 'all' && <Check className="ml-auto w-4 h-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchBy('job_title')}>
                    Job Title
                    {searchBy === 'job_title' && <Check className="ml-auto w-4 h-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchBy('category')}>
                    Category
                    {searchBy === 'category' && <Check className="ml-auto w-4 h-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchBy('noc_code')}>
                    NOC Code
                    {searchBy === 'noc_code' && <Check className="ml-auto w-4 h-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchBy('employer')}>
                    Employer
                    {searchBy === 'employer' && <Check className="ml-auto w-4 h-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSearchBy('city')}>
                    City
                    {searchBy === 'city' && <Check className="ml-auto w-4 h-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <input
                id="search-input"
                ref={searchInputRef}
                type="text"
                value={input}
                onChange={handleChange}
                onFocus={() => {
                  setActiveField('what');
                  setShowSuggestions(true);
                }}
                placeholder={searchBy === 'all' ? "Job title, keywords, or company..." : `Search by ${searchBy.replace('_', ' ')}...`}
                className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 text-base font-medium focus:outline-none truncate"
                onKeyDown={(e) => e.key === 'Enter' && startSearch()}
              />
              {!isMobile && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200" />
              )}
            </div>

            {/* Zone 2: Where */}
            <div
              onClick={() => {
                setActiveField('where');
                setShowLocationMenu(true);
              }}
              className={cn(
                "relative cursor-pointer hover:bg-gray-50/50 transition-colors",
                isMobile ? "p-4 border-b border-gray-100" : "h-full flex-1 pl-6 pr-4 flex flex-col justify-center",
                !isMobile && activeField === 'where' && "bg-gray-100/50 rounded-full"
              )}
            >
              <Label className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest mb-0.5 block cursor-pointer ml-1">Where</Label>
              <div className="flex items-center justify-between">
                <div className="text-base font-medium text-gray-900 truncate w-full">
                  {locationText || "Select Location..."}
                </div>
                {locationText && locationText !== 'Canada' && (
                  <button onClick={(e) => { e.stopPropagation(); handleSelectCanada(); }} className="p-1 hover:bg-gray-200 rounded-full">
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
              {!isMobile && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200" />
              )}
            </div>

            {/* Zone 3: Dates */}
            <Popover open={activeField === 'dates'} onOpenChange={(open) => setActiveField(open ? 'dates' : null)} modal={false}>
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    "relative cursor-pointer hover:bg-gray-50/50 transition-colors",
                    isMobile ? "p-4" : "h-full flex-1 pl-6 pr-20 flex flex-col justify-center", // Padding right for button
                    !isMobile && activeField === 'dates' && "bg-gray-100/50 rounded-full"
                  )}
                  onClick={() => setActiveField('dates')}
                >
                  <Label className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest mb-0.5 block cursor-pointer ml-1">Dates</Label>
                  <div className={cn("text-base font-medium truncate", (dateRange?.from || dateRange?.to) ? "text-brand-600" : "text-gray-400")}>
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>{format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd')}</>
                      ) : (
                        format(dateRange.from, 'LLL dd')
                      )
                    ) : (
                      'Add dates'
                    )}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="center"
                onInteractOutside={(e) => {
                  // Prevent closing when clicking on Select dropdown items
                  const target = e.target as HTMLElement;
                  if (target.closest('[role="listbox"]') || target.closest('[data-radix-select-content]')) {
                    e.preventDefault();
                  }
                }}
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  showManualInput={true}
                  showActionButtons={true}
                  onApply={() => setActiveField(null)}
                  onClear={() => {
                    setDateRange(undefined);
                    setActiveField(null);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* Search Button (Floating) */}
            <div className={isMobile ? "flex gap-3 p-4 pt-0" : "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2"}>
              {/* Alert Button (Desktop) */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAlertDialog(true)}
                  className="rounded-full h-10 w-10 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-all border border-transparent hover:border-brand-100"
                  title="Create Job Alert"
                >
                  <Bell className="w-5 h-5" />
                </Button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startSearch}
                className={cn(
                  "flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/30 transition-all",
                  isMobile ? "flex-1 h-14 rounded-2xl text-lg font-bold" : "w-14 h-14 rounded-full"
                )}
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className={isMobile ? "w-5 h-5 mr-2" : "w-6 h-6"} strokeWidth={2.5} />
                )}
                {isMobile && "Search"}
              </motion.button>

              {/* Alert Button (Mobile) */}
              {isMobile && (
                <Button
                  variant="outline"
                  onClick={() => setShowAlertDialog(true)}
                  className="h-14 w-14 rounded-2xl border-gray-200 bg-white shadow-sm"
                >
                  <Bell className="w-6 h-6 text-gray-500" />
                </Button>
              )}
            </div>

            <CreateAlertDialog
              open={showAlertDialog}
              onOpenChange={setShowAlertDialog}
              criteria={{
                q: input,
                title: searchBy === 'job_title' ? input : undefined,
                employer: searchBy === 'employer' ? input : undefined,
                noc: searchBy === 'noc_code' ? input : undefined,
                location: locationText || selectedCities,
                searchBy
              }}
              defaultName={input || 'My Job Alert'}
            />

            {/* Suggestions Dropdown (Absolute) */}
            <AnimatePresence>
              {showSuggestions && input.trim() && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "absolute left-0 z-50 bg-white shadow-2xl overflow-hidden ring-1 ring-black/5",
                    isMobile
                      ? "top-full mt-2 w-full rounded-2xl"
                      : "top-[calc(100%+16px)] w-[40%] rounded-3xl left-6"
                  )}
                >
                  <div className="max-h-[300px] overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="p-4 space-y-2">
                        <div className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                        <div className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="p-2">
                        {suggestions.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSuggestionClick(s)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                          >
                            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{s.suggestion}</div>
                              <div className="text-xs text-gray-500 font-medium">
                                <AttributeName name={s.field || 'Job'} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        No suggestions found.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Location Menu Dropdown (Absolute) */}
            <AnimatePresence>
              {showLocationMenu && (
                <motion.div
                  ref={locationMenuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "absolute z-50 bg-white shadow-2xl overflow-hidden p-2 ring-1 ring-black/5",
                    isMobile
                      ? "top-full mt-2 w-full rounded-2xl"
                      : "top-[calc(100%+16px)] left-[35%] w-[320px] rounded-3xl"
                  )}
                >
                  <Button
                    onClick={handleSelectCanada}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-medium">All of Canada</span>
                    </div>
                  </Button>

                  {/* Two-Step Multi-Select */}
                  <div className="mt-2 pt-2 border-t border-gray-100 max-h-[300px] overflow-y-auto">
                    {locationStep === 'province' ? (
                      <>
                        <div className="flex items-center justify-between px-4 py-2 mb-2">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Provinces</div>
                          {selectedProvinces.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocationStep('city')}
                              className="h-7 text-xs text-brand-600 font-semibold hover:text-brand-700 hover:bg-brand-50"
                            >
                              Next: Cities <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-1 px-2">
                          {provinces.map((p, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => handleProvinceToggle(p.province)}
                            >
                              <Checkbox
                                checked={selectedProvinces.includes(p.province)}
                                className="border-gray-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                              />
                              <span className="text-sm font-medium text-gray-700">{p.province}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between px-2 mb-2 sticky top-0 bg-white z-10 py-2 border-b border-gray-50">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocationStep('province')}
                            className="h-8 px-2 text-gray-500 hover:text-gray-900"
                          >
                            <ArrowRight className="w-4 h-4 rotate-180 mr-1" /> Back
                          </Button>
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Cities from {selectedProvinces.length} Provinces
                          </div>
                        </div>

                        {cities.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1 px-2">
                            {cities.map((c, idx) => (
                              <div
                                key={`${c.province}-${c.city}-${idx}`}
                                className="flex items-center space-x-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => handleCityToggle(c.city)}
                              >
                                <Checkbox
                                  checked={selectedCities.includes(c.city)}
                                  className="border-gray-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-700">{c.city}</span>
                                  <span className="text-[10px] text-gray-400">{c.province}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-400 text-sm">No cities found.</div>
                        )}

                        <div className="sticky bottom-0 bg-white p-2 border-t border-gray-100 mt-2">
                          <Button
                            onClick={handleApplyLocation}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg h-9 text-sm"
                          >
                            Apply ({selectedCities.length})
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div >

          {/* Search By Options (New) */}
          {/* Search By Options (Premium UI) */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-md border border-white/50 shadow-sm rounded-full p-1.5 gap-1">
              <span className="text-xs font-semibold text-gray-400 px-3 uppercase tracking-wider">Search by</span>
              {['all', 'job_title', 'category', 'noc_code', 'employer', 'city'].map((field) => (
                <button
                  key={field}
                  onClick={() => {
                    setSearchBy(field as any);
                    setSuggestions([]);
                    if (searchInputRef.current) searchInputRef.current.focus();
                  }}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                    searchBy === field
                      ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                  )}
                >
                  {field === 'all' ? 'All' : (field === 'noc_code' ? 'NOC' : field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()))}
                </button>
              ))}
            </div>
          </div>



          {/* Headline (Moved Below Search Bar) */}


          {/* Stats & Categories - Organized Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 max-w-5xl mx-auto"
          >
            {/* Unified Card for Trending & Categories */}
            <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl px-6 py-4 md:px-8 md:py-6 shadow-sm">

              <div className="text-center mt-12 mb-8 space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight"
                >
                  Discover your next <span className="text-brand-600">career move</span>.
                </motion.h1>
                {!isMobile && (
                  <div className="flex justify-center items-center gap-2 text-lg text-gray-500 font-medium">
                    <span className="text-gray-500 mt-3" >Search for</span>
                    <TypewriterEffect
                      title=""
                      words={['Software Engineers', 'Nurses in Ontario', 'LMIA Jobs', 'Marketing Managers']}
                      className="text-gray-900 font-semibold"
                    />
                  </div>
                )}
              </div>
              {/* Trending Section */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Trending Now</span>
                </div>
                <TrendingSearchBox
                  dateFrom={dateRange?.from ? toYMD(dateRange.from) : undefined}
                  dateTo={dateRange?.to ? toYMD(dateRange.to) : undefined}
                  checkCredits={checkCredits}
                  fetchSuggestions={fetchSuggestions}
                  selectedProvinces={selectedProvinces}
                  selectedCities={selectedCities}
                  searchType={searchType}
                  setInput={setInput}
                  setShowSuggestions={setShowSuggestions}
                />
              </div>

              {/* Divider */}
              <div className="w-24 h-px bg-gray-200 mx-auto mb-8" />

              {/* Categories Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Browse Categories</span>
                </div>
                <CategoryBox
                  dateFrom={dateRange?.from ? toYMD(dateRange.from) : undefined}
                  dateTo={dateRange?.to ? toYMD(dateRange.to) : undefined}
                  selectedProvinces={selectedProvinces}
                  selectedCities={selectedCities}
                  searchType={searchType}
                />
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <HomeRecommendations />
          </div>

        </motion.div>
      </div >
      {isMobile && <BottomNav />
      }
    </>
  );
}

export default SearchBox;
