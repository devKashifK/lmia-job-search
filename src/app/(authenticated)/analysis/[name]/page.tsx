'use client';

import React, { Suspense, useMemo, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Filter,
  X,
  Check,
  ChevronsUpDown,
  Users,
  Download,
  Share2,
  Table as TableIcon,
  BarChart3,
  Search,
  Star,
  StarOff,
  ExternalLink,
  Copy,
  FileSpreadsheet,
  Save,
  FolderOpen,
  GitCompare,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  MapPin,
  Building2,
  Hash,
  AlertCircle,
  FileDown,
  RefreshCw,
  ChevronDown,
  Menu,
  Home,
  LayoutDashboard,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';
import { Icon } from '@iconify/react/dist/iconify.js';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { useQuery } from '@tanstack/react-query';
import db from '@/db';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface CompanyAnalysisData {
  companyName: string;
  totalJobs: number;
  totalPositions?: number;
  locationData: Array<{ name: string; value: number }>;
  timeData: Array<{ period: string; count: number }>;
  jobTitleData: Array<{ title: string; count: number }>;
  nocCodeData: Array<{ code: string; title: string; count: number }>;
  programData?: Array<{ name: string; value: number }>; // LMIA only
  categoryData?: Array<{ name: string; value: number }>; // Hot Leads only
  priorityOccupationData?: Array<{ name: string; value: number }>; // LMIA only
  cityData: Array<{ name: string; value: number }>;
  trends: {
    growthRate: number;
    popularLocation: string;
    commonTitle: string;
    topNocCode: string;
    averagePositions?: number; // LMIA only
  };
}

interface AnalysisFilters {
  searchType: 'hot_leads' | 'lmia';
  dateFrom?: string;
  dateTo?: string;
  location?: string[];
  jobTitle?: string[];
  nocCode?: string[];
  category?: string[];
  program?: string[];
  city?: string[];
  searchQuery?: string;
  [key: string]: any;
}

const DATE_PRESETS = [
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 3 months', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last year', days: 365 },
  { label: 'All time', days: null },
];

const FilterSidebar = ({
  currentFilters,
  tableName,
  companyName,
}: {
  currentFilters: AnalysisFilters;
  tableName: string;
  companyName: string;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const jobTitleFromUrl = searchParams?.get('jobTitle') || undefined;

  const updateFilters = (
    updates: Record<string, string | string[] | undefined>
  ) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '');

    Object.entries(updates).forEach(([key, value]) => {
      // Remove existing values for this key
      newSearchParams.delete(key);

      if (Array.isArray(value)) {
        // Add multiple values
        value.forEach((v) => newSearchParams.append(key, v));
      } else if (value) {
        // Add single value
        newSearchParams.set(key, value);
      }
    });

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const clearFilters = () => {
    const newSearchParams = new URLSearchParams();
    if (searchParams?.get('t')) {
      newSearchParams.set('t', searchParams.get('t')!);
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const activeFiltersCount = [
    // Count date range as one filter if either date is set
    currentFilters.dateFrom || currentFilters.dateTo ? 1 : 0,
    ...(currentFilters.location || []),
    ...(currentFilters.city || []),
    ...(currentFilters.nocCode || []),
    ...(currentFilters.jobTitle || []),
    ...(currentFilters.category || []),
  ].filter(Boolean).length;

  // Fetch companies with matching job title
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: [
      'analysis-companies',
      tableName,
      jobTitleFromUrl,
      currentFilters.searchType,
    ],
    queryFn: async () => {
      const companyColumn =
        currentFilters.searchType === 'lmia' ? 'employer' : 'employer';
      const jobTitleColumn = 'job_title';

      // Use RPC function for better performance with DISTINCT
      const { data, error } = await db.rpc(
        'get_distinct_companies_by_job_title',
        {
          p_table_name: tableName,
          p_company_column: companyColumn,
          p_job_title_column: jobTitleColumn,
          p_job_title_filter: jobTitleFromUrl || null,
        }
      );

      if (error) {
        // Fallback to client-side distinct if RPC doesn't exist

        let query = db
          .from(tableName)
          .select(companyColumn)
          .order(companyColumn);

        // Filter by job title if provided
        if (jobTitleFromUrl) {
          query = query.ilike(jobTitleColumn, `%${jobTitleFromUrl}%`);
        }

        const { data: fallbackData, error: fallbackError } = await query;

        if (fallbackError) throw fallbackError;

        // Get unique companies using Set
        const uniqueCompanies = Array.from(
          new Set(
            fallbackData
              ?.map((row: Record<string, string>) => row[companyColumn])
              .filter(Boolean)
          )
        ).sort();

        return uniqueCompanies as string[];
      }

      return (data || []) as string[];
    },
    enabled: !!tableName,
  });

  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  // Filter companies based on search query for better performance
  const filteredCompanies = useMemo(() => {
    if (!companiesData) return [];
    if (!companySearchQuery) return companiesData.slice(0, 100); // Show first 100 initially

    const query = companySearchQuery.toLowerCase();
    return companiesData
      .filter((company) => company.toLowerCase().includes(query))
      .slice(0, 100); // Limit to 100 results
  }, [companiesData, companySearchQuery]);

  const switchCompany = (newCompany: string) => {
    // Navigate to the new company's analysis page with current filters
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '');
    setCompanySearchOpen(false);
    setCompanySearchQuery(''); // Reset search
    router.push(
      `/analysis/${encodeURIComponent(
        newCompany
      )}?${newSearchParams.toString()}`
    );
  };

  const { data: filterOptions, isLoading: filtersLoading } = useQuery({
    queryKey: [
      'analysis-filter-options',
      tableName,
      companyName,
      currentFilters.searchType,
    ],
    queryFn: async () => {
      const companyColumn =
        currentFilters.searchType === 'lmia' ? 'operating_name' : 'employer';
      const locationColumn =
        currentFilters.searchType === 'lmia' ? 'territory' : 'state';

      const selectCols =
        currentFilters.searchType === 'lmia'
          ? [locationColumn, 'city', 'noc_code', 'job_title'].join(', ')
          : [locationColumn, 'city', 'noc_code', 'job_title'].join(', ');

      const { data, error } = await db
        .from(tableName)
        .select(selectCols)
        .eq(companyColumn, companyName);

      if (error) throw error;

      const result: Record<string, Map<string, number>> = {
        locations: new Map(),
        cities: new Map(),
        nocCodes: new Map(),
        jobTitles: new Map(),
      };

      data?.forEach((row: any) => {
        if (row[locationColumn]) {
          result.locations.set(
            row[locationColumn],
            (result.locations.get(row[locationColumn]) || 0) + 1
          );
        }
        if (row.city) {
          result.cities.set(row.city, (result.cities.get(row.city) || 0) + 1);
        }
        if (row.noc_code) {
          result.nocCodes.set(
            row.noc_code,
            (result.nocCodes.get(row.noc_code) || 0) + 1
          );
        }
        if (row.job_title) {
          result.jobTitles.set(
            row.job_title,
            (result.jobTitles.get(row.job_title) || 0) + 1
          );
        }
      });

      return {
        locations: Array.from(result.locations.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        cities: Array.from(result.cities.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        nocCodes: Array.from(result.nocCodes.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        jobTitles: Array.from(result.jobTitles.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      };
    },
    enabled: !!companyName,
  });

  const addFilter = (key: string, value: string) => {
    const current =
      (currentFilters[key as keyof typeof currentFilters] as string[]) || [];
    if (!current.includes(value)) {
      const urlKeyMap: Record<string, string> = {
        jobTitle: 'job_title',
        nocCode: 'noc_code',
        dateFrom: 'date_from',
        dateTo: 'date_to',
      };
      const urlKey = urlKeyMap[key] || key;

      updateFilters({ [urlKey]: [...current, value] });
    }
  };

  const removeFilter = (key: string, value: string) => {
    const current =
      (currentFilters[key as keyof typeof currentFilters] as string[]) || [];

    const urlKeyMap: Record<string, string> = {
      jobTitle: 'job_title',
      nocCode: 'noc_code',
      dateFrom: 'date_from',
      dateTo: 'date_to',
    };
    const urlKey = urlKeyMap[key] || key;

    updateFilters({ [urlKey]: current.filter((v) => v !== value) });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-r border-white/50 h-full flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      {/* Applied Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="border-b border-brand-100/50 bg-brand-50/30 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-brand-100 rounded-md">
                <Filter className="h-3 w-3 text-brand-600" />
              </div>
              <span className="text-xs font-bold text-brand-900">
                Active Filters ({activeFiltersCount})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-[10px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(currentFilters.dateFrom || currentFilters.dateTo) && (
              <Badge
                variant="outline"
                className="flex items-center gap-0.5 px-1.5 py-0 h-5 bg-blue-50 border-blue-200 text-blue-700 text-[10px]"
              >
                <CalendarDays className="h-2.5 w-2.5" />
                <span className="text-[10px]">Date</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-blue-200 rounded-full ml-0.5"
                  onClick={() =>
                    updateFilters({ date_from: undefined, date_to: undefined })
                  }
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            {currentFilters.jobTitle?.map((title) => (
              <Badge
                key={title}
                variant="outline"
                className="flex items-center gap-0.5 px-1.5 py-0 h-5 bg-blue-50 border-blue-200 text-blue-700 text-[10px]"
              >
                <Briefcase className="h-2.5 w-2.5" />
                <span className="text-[10px] max-w-[60px] truncate">
                  {title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-blue-200 rounded-full ml-0.5"
                  onClick={() => removeFilter('jobTitle', title)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            {currentFilters.location?.map((loc) => (
              <Badge
                key={loc}
                variant="outline"
                className="flex items-center gap-0.5 px-1.5 py-0 h-5 bg-purple-50 border-purple-200 text-purple-700 text-[10px]"
              >
                <MapPin className="h-2.5 w-2.5" />
                <span className="text-[10px] max-w-[60px] truncate">{loc}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-purple-200 rounded-full ml-0.5"
                  onClick={() => removeFilter('location', loc)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            {currentFilters.city?.map((city) => (
              <Badge
                key={city}
                variant="outline"
                className="flex items-center gap-0.5 px-1.5 py-0 h-5 bg-orange-50 border-orange-200 text-orange-700 text-[10px]"
              >
                <Building2 className="h-2.5 w-2.5" />
                <span className="text-[10px] max-w-[60px] truncate">
                  {city}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-orange-200 rounded-full ml-0.5"
                  onClick={() => removeFilter('city', city)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            {currentFilters.nocCode?.map((noc) => (
              <Badge
                key={noc}
                variant="outline"
                className="flex items-center gap-0.5 px-1.5 py-0 h-5 bg-violet-50 border-violet-200 text-violet-700 text-[10px]"
              >
                <Hash className="h-2.5 w-2.5" />
                <span className="text-[10px] max-w-[60px] truncate">{noc}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-violet-200 rounded-full ml-0.5"
                  onClick={() => removeFilter('nocCode', noc)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
          {/* Category Filter Badge */}
          {currentFilters.category?.map((cat) => (
            <Badge
              key={cat}
              variant="outline"
              className="flex items-center gap-0.5 px-1.5 py-0 h-5 bg-pink-50 border-pink-200 text-pink-700 text-[10px]"
            >
              <BarChart3 className="h-2.5 w-2.5" />
              <span className="text-[10px] max-w-[60px] truncate">{cat}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-pink-200 rounded-full ml-0.5"
                onClick={() => removeFilter('category', cat)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}




      {/* Company Switcher */}
      <div className="border-b border-brand-100/50 bg-white/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            Company
          </Label>
          {companiesData && companiesData.length > 0 && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-brand-50 text-brand-600 border border-brand-100 font-medium"
            >
              {companiesData.length.toLocaleString()}
            </Badge>
          )}
        </div>
        <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={companySearchOpen}
              className="w-full h-9 justify-between bg-white/60 border-gray-200/60 shadow-sm hover:border-brand-300 hover:bg-white hover:shadow-md transition-all duration-200 text-sm font-medium rounded-xl group"
            >
              <span className="truncate flex items-center gap-2">
                <div className="p-0.5 rounded-md bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                {companyName || 'Select company...'}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search companies..."
                className="h-8 text-xs"
                value={companySearchQuery}
                onValueChange={setCompanySearchQuery}
              />
              <CommandList>
                <CommandEmpty>
                  {companiesLoading
                    ? 'Loading companies...'
                    : companySearchQuery
                      ? 'No company found. Try a different search.'
                      : 'Type to search companies...'}
                </CommandEmpty>
                <CommandGroup>
                  {filteredCompanies.length > 0 ? (
                    <>
                      {filteredCompanies.map((company) => (
                        <CommandItem
                          key={company}
                          value={company}
                          onSelect={() => switchCompany(company)}
                          className="text-sm"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              companyName === company
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {company}
                        </CommandItem>
                      ))}
                      {!companySearchQuery &&
                        companiesData &&
                        companiesData.length > 100 && (
                          <div className="px-2 py-1.5 text-xs text-center text-gray-500 bg-gray-50 border-t">
                            Showing first 100 of{' '}
                            {companiesData.length.toLocaleString()} companies.
                            Type to search more.
                          </div>
                        )}
                    </>
                  ) : null}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {jobTitleFromUrl && (
          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            Filtered by: {jobTitleFromUrl}
          </p>
        )}
      </div>

      {/* Horizontal Filter Bar - Top of L */}
      <div className="border-b border-brand-200/40 bg-gradient-to-r from-brand-50/60 to-white px-3 py-2">
        <div className="flex items-center justify-between gap-3 flex-col">
          {/* Data Source */}
          <div className="flex flex-col items-start w-full gap-1.5">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2 whitespace-nowrap">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Data Source
            </Label>
            <Select
              value={currentFilters.searchType}
              onValueChange={(value) => updateFilters({ t: value })}
            >
              <SelectTrigger className="w-full h-8 bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[160px] [&>*]:p-0.5">
                <SelectItem
                  value="hot_leads"
                  className="text-xs !py-1 !pl-1.5 !pr-6 min-h-0 h-7"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Trending Jobs</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="lmia"
                  className="text-xs !py-1 !pl-1.5 !pr-6 min-h-0 h-7"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-xs">LMIA</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col items-start w-full gap-1.5">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2 whitespace-nowrap">
              <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
              Date Range
            </Label>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1 w-full">
              {DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (preset.days === null) {
                      updateFilters({
                        date_from: undefined,
                        date_to: undefined,
                      });
                    } else {
                      const today = new Date();
                      const pastDate = new Date(today);
                      pastDate.setDate(today.getDate() - preset.days);
                      updateFilters({
                        date_from: pastDate.toISOString().split('T')[0],
                        date_to: today.toISOString().split('T')[0],
                      });
                    }
                  }}
                  className="h-6 px-2 text-[10px] border-gray-200 hover:bg-brand-50 hover:border-brand-300"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-col w-full items-start gap-2">
              <Input
                type="date"
                value={currentFilters.dateFrom || ''}
                onChange={(e) => updateFilters({ date_from: e.target.value })}
                placeholder="From"
                className="w-full h-8 bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors text-xs"
              />
              <Input
                type="date"
                value={currentFilters.dateTo || ''}
                onChange={(e) => updateFilters({ date_to: e.target.value })}
                placeholder="To"
                className="w-full h-8 bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Filter Panel - Vertical part of L */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-white via-brand-50/10 to-brand-50/20">
        {/* Date Range Display (when not in top bar due to space) */}
        {(currentFilters.dateFrom || currentFilters.dateTo) && (
          <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-xs font-bold text-brand-900">
                Active Date Range
              </span>
            </div>
            <p className="text-xs text-brand-700 font-medium pl-5.5">
              {currentFilters.dateFrom && currentFilters.dateTo ? (
                <>
                  {new Date(currentFilters.dateFrom).toLocaleDateString()} →{' '}
                  {new Date(currentFilters.dateTo).toLocaleDateString()}
                </>
              ) : currentFilters.dateFrom ? (
                <>
                  From {new Date(currentFilters.dateFrom).toLocaleDateString()}
                </>
              ) : (
                <>
                  Until {new Date(currentFilters.dateTo!).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        )}

        {/* Advanced Filters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="p-1 bg-emerald-50 rounded-md">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Additional Filters
            </h3>
          </div>

          {!filtersLoading && filterOptions ? (
            <div className="space-y-5">
              {/* Job Title Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                  Job Title
                </Label>
                <Select
                  onValueChange={(value) => addFilter('jobTitle', value)}
                >
                  <SelectTrigger className="h-8 bg-white border-gray-200 shadow-sm hover:border-blue-300 transition-colors text-xs">
                    <SelectValue placeholder="Select job title..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 [&>*]:p-0.5">
                    {filterOptions.jobTitles.map((jobTitle) => (
                      <SelectItem
                        key={jobTitle.name}
                        value={jobTitle.name}
                        disabled={(currentFilters.jobTitle || []).includes(
                          jobTitle.name
                        )}
                        className="text-xs !py-1 !pl-1.5 !pr-6 min-h-0 h-7"
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{jobTitle.name}</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                            {jobTitle.count.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  {currentFilters.searchType === 'lmia' ? 'Territory' : 'State'}
                </Label>
                <Select onValueChange={(value) => addFilter('location', value)}>
                  <SelectTrigger className="h-9 bg-white/60 border-gray-200/60 shadow-sm hover:border-brand-300 hover:bg-white transition-all duration-200 text-xs rounded-xl">
                    <SelectValue
                      placeholder={`Select ${currentFilters.searchType === 'lmia'
                        ? 'territory'
                        : 'state'
                        }...`}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 [&>*]:p-0.5">
                    {filterOptions.locations.map((location) => (
                      <SelectItem
                        key={location.name}
                        value={location.name}
                        disabled={(currentFilters.location || []).includes(
                          location.name
                        )}
                        className="text-xs !py-1 !pl-1.5 !pr-6 min-h-0 h-7"
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{location.name}</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                            {location.count.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-sky-500" />
                  City
                </Label>
                <Select onValueChange={(value) => addFilter('city', value)}>
                  <SelectTrigger className="h-8 bg-white border-gray-200 shadow-sm hover:border-sky-300 transition-colors text-xs">
                    <SelectValue placeholder="Select city..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 [&>*]:p-0.5">
                    {filterOptions.cities.map((city) => (
                      <SelectItem
                        key={city.name}
                        value={city.name}
                        disabled={(currentFilters.city || []).includes(
                          city.name
                        )}
                        className="text-xs !py-1 !pl-1.5 !pr-6 min-h-0 h-7"
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{city.name}</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                            {city.count.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* NOC Code Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-violet-500" />
                  NOC Code
                </Label>
                <Select onValueChange={(value) => addFilter('nocCode', value)}>
                  <SelectTrigger className="h-8 bg-white border-gray-200 shadow-sm hover:border-violet-300 transition-colors text-xs">
                    <SelectValue placeholder="Select NOC code..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 [&>*]:p-0.5">
                    {filterOptions.nocCodes.map((nocCode) => (
                      <SelectItem
                        key={nocCode.name}
                        value={nocCode.name}
                        disabled={(currentFilters.nocCode || []).includes(
                          nocCode.name
                        )}
                        className="text-xs !py-1 !pl-1.5 !pr-6 min-h-0 h-7"
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{nocCode.name}</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                            {nocCode.count.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : filtersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-gray-500">
                  Loading filter options...
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Active Filters Tags */}
        {/* {activeFiltersCount > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">
                Active Filters ({activeFiltersCount})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentFilters.location?.map((location) => (
                <Badge
                  key={location}
                  variant="outline"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs"
                >
                  <MapPin className="h-3 w-3" />
                  <span className="max-w-[120px] truncate">{location}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3.5 w-3.5 p-0 hover:bg-emerald-200 rounded-full ml-1"
                    onClick={() => removeFilter('location', location)}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              ))}
              {currentFilters.city?.map((city) => (
                <Badge
                  key={city}
                  variant="outline"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors text-xs"
                >
                  <Building2 className="h-3 w-3" />
                  <span className="max-w-[120px] truncate">{city}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3.5 w-3.5 p-0 hover:bg-sky-200 rounded-full ml-1"
                    onClick={() => removeFilter('city', city)}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              ))}
              {currentFilters.nocCode?.map((nocCode) => (
                <Badge
                  key={nocCode}
                  variant="outline"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors text-xs"
                >
                  <Hash className="h-3 w-3" />
                  <span className="max-w-[120px] truncate">{nocCode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3.5 w-3.5 p-0 hover:bg-violet-200 rounded-full ml-1"
                    onClick={() => removeFilter('noc_code', nocCode)}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div >
  );
};
function CompanyAnalysisContent({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const companyName = decodeURIComponent(resolvedParams.name);
  const router = useRouter();
  const { isMobile } = useMobile();

  const pathname = usePathname();
  const goBack = () => {
    router.back();
  };
  const [isFilterOpen, setIsFilterOpen] = useState(!isMobile);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPresets, setShowFilterPresets] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load saved filter presets from localStorage
  const [savedPresets, setSavedPresets] = useState<
    Array<{
      name: string;
      filters: AnalysisFilters;
      createdAt: string;
    }>
  >([]);

  React.useEffect(() => {
    const presets = localStorage.getItem('analysisFilterPresets');
    if (presets) {
      setSavedPresets(JSON.parse(presets));
    }
  }, []);

  // Get filters from URL parameters
  const filters = useMemo((): AnalysisFilters => {
    const searchType = (
      searchParams?.get('t') === 'lmia' ? 'lmia' : 'hot_leads'
    ) as 'hot_leads' | 'lmia';
    const dateFrom = searchParams?.get('date_from') || undefined;
    const dateTo = searchParams?.get('date_to') || undefined;
    const location = searchParams?.getAll('location') || [];
    const jobTitle = searchParams?.getAll('job_title') || [];
    // Support both 'noc' and 'noc_code' parameter names
    const nocFromUrl = searchParams?.getAll('noc') || [];
    const nocCodeFromUrl = searchParams?.getAll('noc_code') || [];
    const nocCode = [...nocFromUrl, ...nocCodeFromUrl].filter(Boolean);
    const category = searchParams?.getAll('category') || [];
    const program = searchParams?.getAll('program') || [];
    const city = searchParams?.getAll('city') || [];

    return {
      searchType,
      dateFrom,
      dateTo,
      location,
      jobTitle,
      nocCode,
      category,
      program,
      city,
    };
  }, [searchParams]);

  const tableName = filters.searchType === 'lmia' ? 'lmia' : 'trending_job';
  const companyColumn = filters.searchType === 'lmia' ? 'employer' : 'employer';
  const locationColumn = filters.searchType === 'lmia' ? 'territory' : 'state';
  const dateColumn =
    filters.searchType === 'lmia' ? 'lmia_year' : 'date_of_job_posting';

  // Use more comprehensive column selection for analysis
  const selectCols =
    filters.searchType === 'lmia'
      ? 'RecordID,territory,program,city,lmia_year,job_title,noc_code,priority_occupation,approved_positions,postal_code,lmia_period,employer'
      : 'id,date_of_job_posting,state,city,category,job_title,noc_code,employer';

  // Fetch company analysis data
  const {
    data: analysisData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['company-analysis', companyName, tableName, filters],
    queryFn: async (): Promise<CompanyAnalysisData> => {
      if (!companyName) throw new Error('Company name required');

      let baseQuery = db.from(tableName).select(selectCols);

      // Apply company filter
      baseQuery = baseQuery.eq(companyColumn, companyName);

      // Apply date filters
      if (filters.searchType === 'lmia') {
        if (filters.dateFrom) {
          const yearFrom = parseInt(filters.dateFrom.split('-')[0]);
          baseQuery = baseQuery.gte('lmia_year', yearFrom);
        }
        if (filters.dateTo) {
          const yearTo = parseInt(filters.dateTo.split('-')[0]);
          baseQuery = baseQuery.lte('lmia_year', yearTo);
        }
      } else {
        if (filters.dateFrom)
          baseQuery = baseQuery.gte('date_of_job_posting', filters.dateFrom);
        if (filters.dateTo)
          baseQuery = baseQuery.lte('date_of_job_posting', filters.dateTo);
      }

      // Apply location filters
      if (filters.location.length > 0) {
        baseQuery = baseQuery.in(locationColumn, filters.location);
      }

      // Apply job title filters
      if (filters.jobTitle.length > 0) {
        baseQuery = baseQuery.in('job_title', filters.jobTitle);
      }

      // Apply NOC code filters
      if (filters.nocCode && filters.nocCode.length > 0) {
        baseQuery = baseQuery.in('noc_code', filters.nocCode);
      }

      // Apply city filters
      if (filters.city && filters.city.length > 0) {
        baseQuery = baseQuery.in('city', filters.city);
      }

      // Apply LMIA-specific filters
      if (filters.searchType === 'lmia') {
        if (filters.program && filters.program.length > 0) {
          baseQuery = baseQuery.in('program', filters.program);
        }
      }

      // Apply Hot Leads specific filters
      if (filters.searchType === 'hot_leads') {
        if (filters.category && filters.category.length > 0) {
          baseQuery = baseQuery.in('category', filters.category);
        }
      }

      const { data: jobs, error } = await baseQuery;
      if (error) throw error;

      // Debug information for trending jobs
      if (filters.searchType === 'hot_leads' && jobs && jobs.length > 0) {
      }

      const totalJobs = jobs?.length || 0;
      let totalPositions = 0;

      // Process various data dimensions
      const locationCounts: Record<string, number> = {};
      const timeCounts: Record<string, number> = {};
      const titleCounts: Record<string, number> = {};
      const nocCodeCounts: Record<string, number> = {};
      const programCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      const priorityOccupationCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};

      jobs?.forEach((job: any) => {
        // Location data
        const location = job[locationColumn] || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;

        // Time data
        let timeKey: string;
        if (filters.searchType === 'lmia') {
          timeKey = job.lmia_year?.toString() || 'Unknown';
        } else {
          // For trending_job, try multiple approaches to get year
          try {
            // First try: direct year column
            if (job.year && job.year !== null && job.year !== undefined) {
              timeKey = job.year.toString();
            }
            // Second try: extract from date_of_job_posting
            else if (job.date_of_job_posting) {
              const date = new Date(job.date_of_job_posting);
              if (!isNaN(date.getTime())) {
                timeKey = date.getFullYear().toString();
              } else {
                timeKey = 'Unknown';
              }
            }
            // Final fallback
            else {
              timeKey = 'Unknown';
            }
          } catch (e) {
            console.error('Error extracting year from job data:', e, job);
            timeKey = 'Unknown';
          }
        }

        if (timeKey && timeKey !== 'Unknown') {
          timeCounts[timeKey] = (timeCounts[timeKey] || 0) + 1;
        }

        // Job title data
        const title = job.job_title || 'Unknown';
        titleCounts[title] = (titleCounts[title] || 0) + 1;

        // NOC Code data
        const nocCode = job.noc_code || 'Unknown';
        nocCodeCounts[nocCode] = (nocCodeCounts[nocCode] || 0) + 1;

        // City data
        const city = job.city || 'Unknown';
        cityCounts[city] = (cityCounts[city] || 0) + 1;

        // LMIA-specific data
        if (filters.searchType === 'lmia') {
          // Approved positions count
          if (job.approved_positions) {
            totalPositions += parseInt(job.approved_positions) || 1;
          } else {
            totalPositions += 1;
          }

          // Program data
          const program = job.program || 'Unknown';
          programCounts[program] = (programCounts[program] || 0) + 1;

          // Priority occupation data
          const priorityOcc = job.priority_occupation || 'Unknown';
          priorityOccupationCounts[priorityOcc] =
            (priorityOccupationCounts[priorityOcc] || 0) + 1;
        }
        // Hot Leads specific data
        else {
          totalPositions += 1; // Each job posting is 1 position for hot leads

          // Category data
          const category = job.category || 'Unknown';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      // Convert to chart data format
      const locationData = Object.entries(locationCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      const timeData = Object.entries(timeCounts)
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => a.period.localeCompare(b.period));

      const jobTitleData = Object.entries(titleCounts)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const nocCodeData = Object.entries(nocCodeCounts)
        .map(([code, count]) => ({
          code,
          title: code, // You might want to map NOC codes to titles
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const cityData = Object.entries(cityCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      const programData =
        filters.searchType === 'lmia'
          ? Object.entries(programCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
          : undefined;

      const categoryData =
        filters.searchType === 'hot_leads'
          ? Object.entries(categoryCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
          : undefined;

      const priorityOccupationData =
        filters.searchType === 'lmia'
          ? Object.entries(priorityOccupationCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
          : undefined;

      // Calculate trends
      const sortedLocations = Object.entries(locationCounts).sort(
        (a, b) => b[1] - a[1]
      );
      const sortedTitles = Object.entries(titleCounts).sort(
        (a, b) => b[1] - a[1]
      );
      const sortedNocCodes = Object.entries(nocCodeCounts).sort(
        (a, b) => b[1] - a[1]
      );

      const recentYears = timeData.slice(-2);
      const growthRate =
        recentYears.length === 2
          ? ((recentYears[1].count - recentYears[0].count) /
            recentYears[0].count) *
          100
          : 0;

      return {
        companyName,
        totalJobs,
        totalPositions,
        locationData,
        timeData,
        jobTitleData,
        nocCodeData,
        programData,
        categoryData,
        priorityOccupationData,
        cityData,
        trends: {
          growthRate,
          popularLocation: sortedLocations[0]?.[0] || 'N/A',
          commonTitle: sortedTitles[0]?.[0] || 'N/A',
          topNocCode: sortedNocCodes[0]?.[0] || 'N/A',
          averagePositions:
            filters.searchType === 'lmia'
              ? totalPositions / Math.max(totalJobs, 1)
              : undefined,
        },
      };
    },
    enabled: !!companyName,
  });

  if (!companyName) {
    return (
      <BackgroundWrapper>
        <Navbar />
        <div className="min-h-screen pt-24 pb-20">
          <div className="container mx-auto px-6">
            <Card className="text-center py-12 border-0 shadow-sm">
              <CardContent>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-6">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No Company Selected
                </h2>
                <p className="text-gray-500">
                  Please select a company from the search results to view
                  analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </BackgroundWrapper>
    );
  }

  if (error) {
    return (
      <BackgroundWrapper>
        <Navbar />
        <div className="min-h-screen pt-24 pb-20">
          <div className="container mx-auto px-6">
            <Card className="border-red-200 border-2 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">
                    Error loading analysis: {(error as Error).message}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </BackgroundWrapper>
    );
  }

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // Dynamically import jsPDF and html2canvas
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Add Title
      pdf.setFontSize(24);
      pdf.setTextColor(16, 185, 129); // emerald-600
      pdf.text(`${companyName} Analysis Report`, margin, yPosition);
      yPosition += 10;

      // Add metadata
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // gray-500
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} | Data Source: ${filters.searchType === 'lmia' ? 'LMIA' : 'Hot Leads'
        }`,
        margin,
        yPosition
      );
      yPosition += 15;

      // Add metrics section
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55); // gray-800
      pdf.text('Key Metrics', margin, yPosition);
      yPosition += 8;

      // Add metric data
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99); // gray-600

      if (analysisData?.trends.growthRate) {
        pdf.text(
          `Growth Rate: ${analysisData.trends.growthRate > 0 ? '+' : ''
          }${analysisData.trends.growthRate.toFixed(1)}%`,
          margin,
          yPosition
        );
        yPosition += 6;
      }

      if (analysisData?.trends.popularLocation) {
        pdf.text(
          `Top Location: ${analysisData.trends.popularLocation}`,
          margin,
          yPosition
        );
        yPosition += 6;
      }

      if (analysisData?.trends.topNocCode) {
        pdf.text(
          `Top NOC Code: ${analysisData.trends.topNocCode}`,
          margin,
          yPosition
        );
        yPosition += 6;
      }

      yPosition += 10;

      // Function to add chart to PDF
      const addChartToPdf = async (chartId: string, title: string) => {
        const chartElement = document.getElementById(chartId);
        if (!chartElement) return;

        try {
          const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2,
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add chart title
          pdf.setFontSize(12);
          pdf.setTextColor(31, 41, 55);
          pdf.text(title, margin, yPosition);
          yPosition += 8;

          // Add image if it fits on the page
          if (yPosition + imgHeight <= pageHeight - margin) {
            pdf.addImage(
              imgData,
              'PNG',
              margin,
              yPosition,
              imgWidth,
              imgHeight
            );
            yPosition += imgHeight + 15;
          } else {
            // Add new page if it doesn't fit
            pdf.addPage();
            yPosition = margin;
            pdf.text(title, margin, yPosition);
            yPosition += 8;
            pdf.addImage(
              imgData,
              'PNG',
              margin,
              yPosition,
              imgWidth,
              imgHeight
            );
            yPosition += imgHeight + 15;
          }
        } catch (error) {
          console.error(`Error capturing ${chartId}:`, error);
        }
      };

      // Add charts with unique IDs
      await addChartToPdf('chart-hiring-trends', 'Hiring Trends Over Time');
      await addChartToPdf(
        'chart-location-distribution',
        'Location Distribution'
      );
      await addChartToPdf('chart-top-cities', 'Top Cities');
      await addChartToPdf('chart-job-titles', 'Top Job Titles');
      await addChartToPdf('chart-noc-codes', 'NOC Code Distribution');
      await addChartToPdf('chart-categories', 'Job Categories');

      // Save the PDF
      pdf.save(
        `${companyName.replace(/[^a-z0-9]/gi, '_')}_analysis_${new Date().toISOString().split('T')[0]
        }.pdf`
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <BackgroundWrapper>
      {isMobile ? (
        <MobileHeader title={companyName} showBack={true} />
      ) : null}
      <div
        className={
          isMobile ? 'min-h-screen pb-20' : 'min-h-screen pt-4 pb-12'
        }
      >
        <div
          className={isMobile ? 'mx-auto px-4' : 'max-w-[1600px] mx-auto px-8'}
        >
          {/* Header */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="sticky top-4 z-20 flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm"
            >
              {/* Left Section: Filter Toggle, Company Icon & Name */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Filter Toggle Button */}
                <Button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0 rounded-lg transition-all',
                    isFilterOpen
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-brand-300 hover:bg-brand-50'
                  )}
                >
                  {isFilterOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                </Button>

                {/* Company Name with Icon */}
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      duration: 0.3,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className="p-2 bg-brand-100 rounded-lg"
                  >
                    <Building2 className="w-5 h-5 text-brand-600" />
                  </motion.div>

                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      {companyName}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Company Analysis
                    </p>
                  </div>
                </div>

                {/* Data Source Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Badge
                    variant="outline"
                    className="text-xs font-medium border-gray-300 text-gray-700"
                  >
                    <TrendingUp className="w-3 h-3 mr-1 inline" />
                    {filters.searchType === 'lmia' ? 'LMIA' : 'Trending Jobs'}
                  </Badge>
                </motion.div>
              </div>

              {/* Right Section: Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex items-center gap-2"
              >
                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.reload();
                    toast.success('Refreshing data...');
                  }}
                  className="border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>

                {/* Bookmark Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const saved = localStorage.getItem('savedCompanies');
                    const savedList = saved ? JSON.parse(saved) : [];
                    const isBookmarked = savedList.some(
                      (c: any) =>
                        c.name === companyName && c.type === filters.searchType
                    );

                    if (isBookmarked) {
                      const updated = savedList.filter(
                        (c: any) =>
                          !(
                            c.name === companyName &&
                            c.type === filters.searchType
                          )
                      );
                      localStorage.setItem(
                        'savedCompanies',
                        JSON.stringify(updated)
                      );
                      toast.success('Company removed from bookmarks');
                    } else {
                      savedList.push({
                        name: companyName,
                        type: filters.searchType,
                        savedAt: new Date().toISOString(),
                      });
                      localStorage.setItem(
                        'savedCompanies',
                        JSON.stringify(savedList)
                      );
                      toast.success('Company bookmarked!');
                    }
                    // Force re-render
                    setIsFilterOpen((prev) => prev);
                  }}
                  className="border-gray-300 hover:border-yellow-300 hover:bg-yellow-50 transition-all"
                  title="Bookmark this company"
                >
                  {(() => {
                    const saved = localStorage.getItem('savedCompanies');
                    const savedList = saved ? JSON.parse(saved) : [];
                    const isBookmarked = savedList.some(
                      (c: any) =>
                        c.name === companyName && c.type === filters.searchType
                    );
                    return isBookmarked ? (
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    );
                  })()}
                </Button>

                {/* Export Dropdown */}
                {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isExporting}
                    className="border-gray-300 hover:border-green-300 hover:bg-green-50 transition-all"
                  >
                    {isExporting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="mr-2"
                      >
                        <Download className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={handleExportReport}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                    <span className="ml-auto text-xs text-gray-500">
                      Recommended
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        // Get table data from analysisData
                        const tableData = analysisData?.cityData || [];
                        if (!tableData.length) {
                          toast.error('No data to export');
                          return;
                        }

                        // Prepare CSV data from available chart data
                        const headers = ['Name', 'Count', 'Percentage'];
                        const total = tableData.reduce(
                          (sum, item) => sum + item.value,
                          0
                        );

                        const csvRows = [
                          headers.join(','),
                          ...tableData.map((item) =>
                            [
                              `"${item.name}"`,
                              item.value,
                              `${((item.value / total) * 100).toFixed(2)}%`,
                            ].join(',')
                          ),
                        ];

                        const csvContent = csvRows.join('\n');
                        const blob = new Blob([csvContent], {
                          type: 'text/csv',
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${companyName}-analysis-${
                          new Date().toISOString().split('T')[0]
                        }.csv`;
                        link.click();
                        URL.revokeObjectURL(url);

                        toast.success('CSV file downloaded!');
                      } catch (error) {
                        console.error('Export CSV failed:', error);
                        toast.error('Failed to export CSV');
                      }
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as CSV
                    <span className="ml-auto text-xs text-gray-500">Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        // Generate JSON export
                        const exportData = {
                          company: companyName,
                          exportDate: new Date().toISOString(),
                          filters: filters,
                          data: {
                            totalJobs: analysisData?.totalJobs,
                            locations: analysisData?.locationData,
                            cities: analysisData?.cityData,
                            categories: analysisData?.categoryData,
                            nocCodes: analysisData?.nocCodeData,
                            jobTitles: analysisData?.jobTitleData,
                          },
                        };

                        const jsonContent = JSON.stringify(exportData, null, 2);
                        const blob = new Blob([jsonContent], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${companyName}-analysis-${
                          new Date().toISOString().split('T')[0]
                        }.json`;
                        link.click();
                        URL.revokeObjectURL(url);

                        toast.success('JSON file downloaded!');
                      } catch (error) {
                        console.error('Export JSON failed:', error);
                        toast.error('Failed to export JSON');
                      }
                    }}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Export as JSON
                    <span className="ml-auto text-xs text-gray-500">API</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}

                {/* Share Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const url = window.location.href;
                      if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(url);
                        toast.success('Link copied to clipboard!');
                      } else {
                        // Fallback for non-secure contexts
                        const textArea = document.createElement('textarea');
                        textArea.value = url;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                          document.execCommand('copy');
                          toast.success('Link copied to clipboard!');
                        } catch (err) {
                          toast.error('Failed to copy link');
                        }
                        document.body.removeChild(textArea);
                      }
                    } catch (err) {
                      console.error('Share failed:', err);
                      toast.error('Failed to copy link');
                    }
                  }}
                  className="border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  title="Share analysis"
                >
                  <Share2 className="w-4 h-4" />
                </Button>

                {/* Add to Compare Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const compared =
                        localStorage.getItem('comparedCompanies');
                      const comparedList = compared ? JSON.parse(compared) : [];

                      const exists = comparedList.some(
                        (c: any) =>
                          c.name === companyName &&
                          c.type === filters.searchType
                      );

                      if (exists) {
                        toast.info('Company already in comparison list', {
                          action: {
                            label: 'View Comparison',
                            onClick: () => router.push('/compare'),
                          },
                        });
                        return;
                      }

                      if (comparedList.length >= 5) {
                        toast.error(
                          'Maximum 5 companies can be compared. Remove one to add more.',
                          {
                            action: {
                              label: 'View Comparison',
                              onClick: () => router.push('/compare'),
                            },
                          }
                        );
                        return;
                      }

                      comparedList.push({
                        name: companyName,
                        type: filters.searchType,
                        addedAt: new Date().toISOString(),
                      });
                      localStorage.setItem(
                        'comparedCompanies',
                        JSON.stringify(comparedList)
                      );

                      // Show success toast with navigation option
                      toast.success(
                        `${companyName} added to comparison (${comparedList.length}/5)`,
                        {
                          description:
                            comparedList.length >= 2
                              ? 'Ready to compare multiple companies'
                              : 'Add more companies to start comparing',
                          action: {
                            label: 'View Comparison',
                            onClick: () => router.push('/compare'),
                          },
                          duration: 5000,
                        }
                      );
                    } catch (err) {
                      console.error('Compare failed:', err);
                      toast.error('Failed to add to comparison');
                    }
                  }}
                  className="border-purple-300 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all"
                  title="Add to comparison"
                >
                  <GitCompare className="w-4 h-4 mr-1" />
                  Compare
                </Button>

                {/* View Jobs Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const searchParams = new URLSearchParams();
                    searchParams.set('employer', companyName);
                    searchParams.set('t', filters.searchType);
                    router.push(`/search?${searchParams.toString()}`);
                  }}
                  className="border-brand-300 bg-brand-50 hover:bg-brand-100 hover:border-brand-400 transition-all"
                  title="View all jobs"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Jobs
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="border-gray-300 hover:border-brand-300 hover:bg-brand-50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>

                {/* Navigation Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 hover:border-brand-300 hover:bg-brand-50 transition-all font-medium"
                    >
                      <Menu className="w-4 h-4 mr-2" />
                      Menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => router.push('/')}>
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/search')}>
                      <Search className="w-4 h-4 mr-2" />
                      Search Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/pricing')}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pricing
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </motion.div>
          )}

          {/* Mobile: Company Title Section */}
          {isMobile && (
            <div className="mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-gray-900">
                    {companyName}
                  </h1>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium border-gray-300 text-gray-700 mt-1"
                  >
                    <TrendingUp className="w-3 h-3 mr-1 inline" />
                    {filters.searchType === 'lmia' ? 'LMIA' : 'Trending Jobs'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {/* Sidebar - Desktop Only */}
            {!isMobile && isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-64 flex-shrink-0"
              >
                <div className="sticky top-24 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg shadow-brand-900/5 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-brand-500 rounded">
                          <Filter className="w-3 h-3 text-white" />
                        </div>
                        <h3 className="text-xs font-semibold text-gray-900">
                          Filters
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {
                          Object.values(filters).filter(
                            (v) =>
                              v &&
                              (typeof v === 'string' ||
                                (Array.isArray(v) && v.length > 0))
                          ).length
                        }
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <FilterSidebar
                      currentFilters={filters}
                      tableName={tableName}
                      companyName={companyName}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card
                      key={i}
                      className="animate-pulse border-0 bg-white/80 backdrop-blur-sm shadow-sm"
                    >
                      <CardHeader>
                        <div className="h-4 w-24 bg-gray-200 rounded-lg" />
                        <div className="h-6 w-32 bg-gray-200 rounded-lg" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-gray-200 rounded-lg" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : analysisData && analysisData.totalJobs === 0 ? (
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                  <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Data Found
                    </h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      No job postings found matching your current filters for{' '}
                      <span className="font-semibold">{companyName}</span>.
                    </p>
                    <div className="flex flex-col items-center gap-4 w-full max-w-md">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                          Active Filters:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {filters.dateFrom && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              Date: {filters.dateFrom} → {filters.dateTo}
                            </Badge>
                          )}
                          {filters.jobTitle?.map((t) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              Title: {t}
                            </Badge>
                          ))}
                          {filters.location?.map((l) => (
                            <Badge
                              key={l}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              Location: {l}
                            </Badge>
                          ))}
                          {filters.city?.map((c) => (
                            <Badge
                              key={c}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              City: {c}
                            </Badge>
                          ))}
                          {filters.nocCode?.map((n) => (
                            <Badge
                              key={n}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              NOC: {n}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          const newSearchParams = new URLSearchParams();
                          if (searchParams?.get('t')) {
                            newSearchParams.set('t', searchParams.get('t')!);
                          }
                          router.push(
                            `${pathname}?${newSearchParams.toString()}`
                          );
                        }}
                        className="w-full bg-brand-600 hover:bg-brand-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Try adjusting your filters or clearing them to see
                        available data
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* View Toggle and Search */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search in charts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-9 text-sm"
                        />
                      </div>

                      {/* Filter Presets Dropdown */}
                      <Popover
                        open={showFilterPresets}
                        onOpenChange={setShowFilterPresets}
                      >
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9">
                            <FolderOpen className="w-4 h-4 mr-1.5" />
                            Presets
                            {savedPresets.length > 0 && (
                              <Badge className="ml-2 bg-brand-600 text-white h-5 px-1.5 text-xs">
                                {savedPresets.length}
                              </Badge>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3" align="start">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold">
                                Filter Presets
                              </h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPresetName('');
                                  setShowSavePresetDialog(true);
                                }}
                                className="h-7 text-xs"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Save Current
                              </Button>
                            </div>

                            {savedPresets.length === 0 ? (
                              <p className="text-xs text-gray-500 text-center py-4">
                                No saved presets. Save your current filters to
                                reuse them later.
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {savedPresets.map((preset, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {preset.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(
                                          preset.createdAt
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newSearchParams =
                                            new URLSearchParams();
                                          newSearchParams.set(
                                            't',
                                            preset.filters.searchType
                                          );
                                          if (preset.filters.dateFrom)
                                            newSearchParams.set(
                                              'date_from',
                                              preset.filters.dateFrom
                                            );
                                          if (preset.filters.dateTo)
                                            newSearchParams.set(
                                              'date_to',
                                              preset.filters.dateTo
                                            );
                                          preset.filters.location?.forEach(
                                            (l) =>
                                              newSearchParams.append(
                                                'location',
                                                l
                                              )
                                          );
                                          preset.filters.jobTitle?.forEach(
                                            (j) =>
                                              newSearchParams.append(
                                                'job_title',
                                                j
                                              )
                                          );
                                          preset.filters.city?.forEach((c) =>
                                            newSearchParams.append('city', c)
                                          );
                                          preset.filters.nocCode?.forEach((n) =>
                                            newSearchParams.append(
                                              'noc_code',
                                              n
                                            )
                                          );

                                          router.push(
                                            `${pathname}?${newSearchParams.toString()}`
                                          );
                                          setShowFilterPresets(false);
                                          toast.success(
                                            `Applied preset: ${preset.name}`
                                          );
                                        }}
                                        className="h-7 px-2 text-xs"
                                      >
                                        Apply
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newPresets =
                                            savedPresets.filter(
                                              (_, i) => i !== idx
                                            );
                                          setSavedPresets(newPresets);
                                          localStorage.setItem(
                                            'analysisFilterPresets',
                                            JSON.stringify(newPresets)
                                          );
                                          toast.success('Preset deleted');
                                        }}
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Tabs
                      value={viewMode}
                      onValueChange={(v) =>
                        setViewMode(v as 'charts' | 'table')
                      }
                      className="w-auto"
                    >
                      <TabsList className="h-9">
                        <TabsTrigger value="charts" className="text-xs px-3">
                          <BarChart3 className="w-4 h-4 mr-1.5" />
                          Charts
                        </TabsTrigger>
                        {/* <TabsTrigger value="table" className="text-xs px-3">
                          <TableIcon className="w-4 h-4 mr-1.5" />
                          Table
                        </TabsTrigger> */}
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Data Freshness & Quick Stats - Compact */}
                  {/* <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                      <CalendarDays className="w-3 h-3 mr-1" />
                      Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Badge>
                  </div> */}

                  {/* Quick Stats Cards - Compact */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {/* Total Jobs Card */}
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-500 rounded-xl">
                          <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600 mb-1">Total Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analysisData?.totalJobs?.toLocaleString() || 0}
                      </p>
                    </Card>

                    {/* Locations Card */}
                    <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-emerald-500 rounded-xl">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                          {analysisData?.locationData?.length || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">Cities</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analysisData?.cityData?.length || 0}
                      </p>
                    </Card>

                    {/* Categories Card */}
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-2xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-500 rounded-xl">
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600 mb-1">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analysisData?.categoryData?.length || 0}
                      </p>
                    </Card>

                    {/* Job Titles Card */}
                    <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-orange-500 rounded-xl">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600 mb-1">Job Titles</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analysisData?.jobTitleData?.length || 0}
                      </p>
                    </Card>
                  </div>

                  {/* Quick Filter Chips */}
                  <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                      Quick Filters:
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs rounded-full border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                      onClick={() => {
                        const topCity = analysisData?.cityData?.[0]?.name;
                        if (topCity) {
                          const newSearchParams = new URLSearchParams(
                            searchParams?.toString() || ''
                          );
                          newSearchParams.set('city', topCity);
                          router.push(
                            `${pathname}?${newSearchParams.toString()}`
                          );
                          toast.success(`Filtered by top city: ${topCity}`);
                        }
                      }}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      Top City
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs rounded-full border-gray-300 hover:bg-purple-50 hover:border-purple-400"
                      onClick={() => {
                        const topCategory =
                          analysisData?.categoryData?.[0]?.name;
                        if (topCategory) {
                          const newSearchParams = new URLSearchParams(
                            searchParams?.toString() || ''
                          );
                          newSearchParams.set('category', topCategory);
                          router.push(
                            `${pathname}?${newSearchParams.toString()}`
                          );
                          toast.success(
                            `Filtered by top category: ${topCategory}`
                          );
                        }
                      }}
                    >
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Top Category
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs rounded-full border-gray-300 hover:bg-orange-50 hover:border-orange-400"
                      onClick={() => {
                        const topTitle = analysisData?.jobTitleData?.[0]?.title;
                        if (topTitle) {
                          const newSearchParams = new URLSearchParams(
                            searchParams?.toString() || ''
                          );
                          newSearchParams.set('jobTitle', topTitle);
                          router.push(
                            `${pathname}?${newSearchParams.toString()}`
                          );
                          toast.success(`Filtered by top job: ${topTitle}`);
                        }
                      }}
                    >
                      <Briefcase className="w-3 h-3 mr-1" />
                      Top Job
                    </Button>
                    {searchParams?.toString() && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs rounded-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        onClick={() => {
                          router.push(pathname || '/analysis');
                          toast.info('All filters cleared');
                        }}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {viewMode === 'table' ? (
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Job Data Table
                        </h3>
                        <p className="text-xs text-gray-500">
                          Detailed view of all metrics
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[200px]">
                                  Location
                                </TableHead>
                                <TableHead className="text-right">
                                  Job Count
                                </TableHead>
                                <TableHead className="text-right">
                                  Percentage
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analysisData?.locationData
                                .filter((d) =>
                                  searchQuery
                                    ? d.name
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                    : true
                                )
                                .map((location) => (
                                  <TableRow key={location.name}>
                                    <TableCell className="font-medium">
                                      {location.name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {location.value}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {(
                                        (location.value /
                                          analysisData.totalJobs) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold mb-3">
                            Top Cities
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[200px]">
                                  City
                                </TableHead>
                                <TableHead className="text-right">
                                  Job Count
                                </TableHead>
                                <TableHead className="text-right">
                                  Percentage
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analysisData?.cityData
                                .filter((d) =>
                                  searchQuery
                                    ? d.name
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                    : true
                                )
                                .map((city) => (
                                  <TableRow key={city.name}>
                                    <TableCell className="font-medium">
                                      {city.name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {city.value}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {(
                                        (city.value / analysisData.totalJobs) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold mb-3">
                            Top Job Titles
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead className="text-right">
                                  Count
                                </TableHead>
                                <TableHead className="text-right">
                                  Percentage
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analysisData?.jobTitleData
                                .filter((d) =>
                                  searchQuery
                                    ? d.title
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                    : true
                                )
                                .map((job) => (
                                  <TableRow key={job.title}>
                                    <TableCell className="font-medium">
                                      {job.title}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {job.count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {(
                                        (job.count / analysisData.totalJobs) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <MetricCard
                          label={'Growth Rate'}
                          value={
                            analysisData?.trends.growthRate
                              ? `${analysisData.trends.growthRate > 0 ? '+' : ''
                              }${analysisData.trends.growthRate.toFixed(1)}%`
                              : 'N/A'
                          }
                          subtitle={'Year-over-year change'}
                          icon={'material-symbols:trending-up'}
                        />
                        <MetricCard
                          label={'Top Location'}
                          value={analysisData?.trends.popularLocation || 'N/A'}
                          subtitle={`Most common ${filters.searchType === 'lmia'
                            ? 'territory'
                            : 'state'
                            }`}
                          icon={'material-symbols:add-location-alt'}
                        />
                        <MetricCard
                          label={'Top NOC Code'}
                          value={analysisData?.trends.topNocCode || 'N/A'}
                          subtitle={'Most frequent NOC code'}
                          icon={'line-md:hash-small'}
                        />

                        {filters.searchType === 'lmia' &&
                          analysisData?.trends.averagePositions ? (
                          <MetricCard
                            label={'Avg. Positions'}
                            value={analysisData.trends.averagePositions.toFixed(
                              1
                            )}
                            subtitle={'Per LMIA application'}
                            icon={'solar:suitcase-line-duotone'}
                          />
                        ) : (
                          <MetricCard
                            label={'Common Role'}
                            value={analysisData?.trends.commonTitle || 'N/A'}
                            subtitle={'Most frequent job title'}
                            icon={'solar:suitcase-line-duotone'}
                          />
                        )}
                      </div>

                      {/* Two Column Charts - Location & Cities */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div id="chart-location-distribution">
                          <DashboardCard
                            title="Location Distribution"
                            subtitle="Job postings by state/territory (click to filter)"
                            icon={MapPin}
                            className="h-[450px]"
                          >
                            <DonutChart
                              data={analysisData?.locationData.map((d) => ({
                                name: d.name,
                                value: d.value,
                              }))}
                              centerValue={analysisData?.locationData.length}
                              centerLabel={'Locations'}
                              onSegmentClick={(location: string) => {
                                const newSearchParams = new URLSearchParams(
                                  searchParams?.toString() || ''
                                );
                                newSearchParams.append('location', location);
                                router.push(
                                  `${pathname}?${newSearchParams.toString()}`
                                );
                                toast.success(
                                  `Filtered by location: ${location}`
                                );
                              }}
                            />
                          </DashboardCard>
                        </div>
                        <div id="chart-top-cities">
                          <DashboardCard
                            title="Top Cities"
                            subtitle="Most active hiring locations (click to filter)"
                            icon={Building2}
                            className="h-[450px]"
                          >
                            <BarChart
                              data={analysisData.cityData.map((d) => ({
                                name: d.name,
                                value: d.value,
                              }))}
                              onBarClick={(city: string) => {
                                const newSearchParams = new URLSearchParams(
                                  searchParams?.toString() || ''
                                );
                                newSearchParams.append('city', city);
                                router.push(
                                  `${pathname}?${newSearchParams.toString()}`
                                );
                                toast.success(`Filtered by city: ${city}`);
                              }}
                            />
                          </DashboardCard>
                        </div>
                      </div>

                      {/* Two Column Charts - NOC Codes & Categories */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div id="chart-noc-codes">
                          <DashboardCard
                            title="NOC Code Distribution"
                            subtitle="Most common occupational classifications (click to filter)"
                            icon={Hash}
                            className="h-[450px]"
                          >
                            <ColumnChart
                              data={analysisData.nocCodeData}
                              onColumnClick={(nocCode: string) => {
                                const newSearchParams = new URLSearchParams(
                                  searchParams?.toString() || ''
                                );
                                newSearchParams.append('noc_code', nocCode);
                                router.push(
                                  `${pathname}?${newSearchParams.toString()}`
                                );
                                toast.success(
                                  `Filtered by NOC code: ${nocCode}`
                                );
                              }}
                            />
                          </DashboardCard>
                        </div>
                        <div id="chart-categories">
                          <DashboardCard
                            title="Job Categories"
                            subtitle="Distribution by job category (click to filter)"
                            icon={Briefcase}
                            className="h-[450px]"
                          >
                            <DonutChart
                              data={analysisData.categoryData}
                              centerLabel={'Categories'}
                              centerValue={analysisData?.categoryData?.length}
                              onSegmentClick={(category: string) => {
                                const newSearchParams = new URLSearchParams(
                                  searchParams?.toString() || ''
                                );
                                newSearchParams.append('category', category);
                                router.push(
                                  `${pathname}?${newSearchParams.toString()}`
                                );
                                toast.success(
                                  `Filtered by category: ${category}`
                                );
                              }}
                            />
                          </DashboardCard>
                        </div>
                      </div>

                      {/* Full Width Chart - Job Titles */}
                      <div className="grid grid-cols-1 gap-4">
                        <div id="chart-job-titles">
                          <DashboardCard
                            title="Top Job Titles"
                            subtitle="Most common positions at this company (click to filter)"
                            icon={Users}
                            className="h-[450px]"
                          >
                            <ColumnChart
                              data={analysisData.jobTitleData}
                              onColumnClick={(jobTitle: string) => {
                                const newSearchParams = new URLSearchParams(
                                  searchParams?.toString() || ''
                                );
                                newSearchParams.append('job_title', jobTitle);
                                router.push(
                                  `${pathname}?${newSearchParams.toString()}`
                                );
                                toast.success(
                                  `Filtered by job title: ${jobTitle}`
                                );
                              }}
                            />
                          </DashboardCard>
                        </div>
                      </div>

                      {/* Full Width Chart - Hiring Trends */}
                      <div className="grid grid-cols-1 gap-4">
                        <div id="chart-hiring-trends">
                          <DashboardCard
                            title="Hiring Trends Over Time"
                            subtitle="Historical job posting activity"
                            icon={TrendingUp}
                            className="h-[450px] p-0 overflow-visible"
                          >
                            <AreaChart
                              data={analysisData?.timeData}
                              color="#10b981"
                            />
                          </DashboardCard>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {!isMobile && <Footer />}

      {/* Save Preset Dialog */}
      <Dialog
        open={showSavePresetDialog}
        onOpenChange={setShowSavePresetDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Give your current filter configuration a memorable name to reuse
              it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., Toronto Tech Jobs"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (presetName.trim()) {
                      try {
                        const newPresets = [
                          ...savedPresets,
                          {
                            name: presetName.trim(),
                            filters: filters,
                            createdAt: new Date().toISOString(),
                          },
                        ];
                        setSavedPresets(newPresets);
                        localStorage.setItem(
                          'analysisFilterPresets',
                          JSON.stringify(newPresets)
                        );
                        toast.success('Filter preset saved!');
                        setShowSavePresetDialog(false);
                        setPresetName('');
                      } catch (err) {
                        console.error('Save preset failed:', err);
                        toast.error('Failed to save preset');
                      }
                    }
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Current filters:{' '}
                {
                  Object.keys(filters).filter(
                    (k) => filters[k as keyof AnalysisFilters]
                  ).length
                }{' '}
                active
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowSavePresetDialog(false);
                setPresetName('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => {
                if (!presetName.trim()) {
                  toast.error('Please enter a preset name');
                  return;
                }
                try {
                  const newPresets = [
                    ...savedPresets,
                    {
                      name: presetName.trim(),
                      filters: filters,
                      createdAt: new Date().toISOString(),
                    },
                  ];
                  setSavedPresets(newPresets);
                  localStorage.setItem(
                    'analysisFilterPresets',
                    JSON.stringify(newPresets)
                  );
                  toast.success('Filter preset saved!');
                  setShowSavePresetDialog(false);
                  setPresetName('');
                } catch (err) {
                  console.error('Save preset failed:', err);
                  toast.error('Failed to save preset');
                }
              }}
              disabled={!presetName.trim()}
            >
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile: Floating Filter Button & Drawer */}
      {isMobile && (
        <>
          <div className="fixed bottom-24 right-4 z-30">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="group flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all px-4 py-3"
            >
              <Filter className="w-5 h-5" />
              <span className="text-sm font-semibold">Filters</span>
            </button>
          </div>

          <Drawer open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <DrawerContent className="max-h-[85vh] flex flex-col">
              <DrawerHeader className="flex-shrink-0 border-b rounded-t-2xl border-gray-200 bg-gradient-to-r from-brand-50 to-blue-50 py-4 px-4">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-md">
                      <Filter className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-900">
                        Filters
                      </span>
                      <span className="text-xs text-gray-500">
                        Refine analysis
                      </span>
                    </div>
                  </DrawerTitle>
                  <DrawerClose asChild>
                    <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md">
                      <X className="w-5 h-5" />
                    </button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto">
                <FilterSidebar
                  currentFilters={filters}
                  tableName={tableName}
                  companyName={companyName}
                />
              </div>
            </DrawerContent>
          </Drawer>

          <BottomNav />
        </>
      )}
    </BackgroundWrapper>
  );
}

type PageProps = {
  params: Promise<{ name: string }>;
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function DeepAnalysis({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <BackgroundWrapper>
          <Navbar />
          <div className="min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-6">
              <div className="animate-pulse space-y-8">
                <div className="h-8 w-48 bg-gray-200 rounded-xl" />
                <div className="h-4 w-32 bg-gray-200 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </BackgroundWrapper>
      }
    >
      <CompanyAnalysisContent params={params} />
    </Suspense>
  );
}

const MetricCard = ({ label, value, subtitle, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card className="group bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 overflow-hidden relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/0 group-hover:from-brand-500/5 group-hover:via-brand-500/5 group-hover:to-brand-500/10 transition-all duration-500" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {label}
                </p>
                {label === 'Growth Rate' && (
                  <motion.div
                    animate={{ rotate: value?.includes('+') ? 0 : 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TrendingUp
                      className={`w-3 h-3 ${value?.includes('+') ? 'text-green-500' : 'text-red-500'
                        }`}
                    />
                  </motion.div>
                )}
              </div>
              <motion.p
                className="text-xl font-bold text-gray-900 group-hover:text-brand-700 transition-colors"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {value}
              </motion.p>
            </div>
            <motion.div
              className="p-2 bg-gradient-to-br from-brand-50 to-brand-100/80 rounded-lg ring-1 ring-brand-200/40 group-hover:ring-brand-400/50 group-hover:shadow-md transition-all"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon
                icon={icon}
                className="w-4 h-4 text-brand-600 group-hover:text-brand-700"
              />
            </motion.div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
              {subtitle}
            </p>
            {/* Contextual status indicator */}
            {label === 'Growth Rate' && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${value?.includes('+')
                    ? 'bg-green-500'
                    : value?.includes('-')
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                    }`}
                />
                <span
                  className={`text-xs font-medium ${value?.includes('+')
                    ? 'text-green-600'
                    : value?.includes('-')
                      ? 'text-red-600'
                      : 'text-gray-500'
                    }`}
                >
                  {value?.includes('+')
                    ? 'Growing'
                    : value?.includes('-')
                      ? 'Declining'
                      : 'Stable'}
                </span>
              </motion.div>
            )}
            {label === 'Top Location' && (
              <motion.div
                className="flex items-center gap-1 text-brand-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <MapPin className="w-3 h-3" />
                <span className="text-xs font-medium">Primary</span>
              </motion.div>
            )}
            {label === 'Top NOC Code' && (
              <motion.div
                className="flex items-center gap-1 text-brand-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Hash className="w-3 h-3" />
                <span className="text-xs font-medium">Popular</span>
              </motion.div>
            )}
            {(label === 'Avg. Positions' || label === 'Common Role') && (
              <motion.div
                className="flex items-center gap-1 text-brand-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Briefcase className="w-3 h-3" />
                <span className="text-xs font-medium">Key Metric</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DashboardCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card
        className={`group bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-400 flex flex-col overflow-hidden relative ${className}`}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/0 group-hover:from-brand-500/3 group-hover:via-brand-500/2 group-hover:to-brand-500/5 transition-all duration-600" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-600" />

        <CardHeader className="flex items-start gap-1 px-6 py-2 flex-shrink-0 relative">
          <motion.div
            className="p-1.5 bg-gradient-to-br from-brand-50 to-brand-100/60 rounded-lg ring-1 ring-brand-200/30 group-hover:ring-brand-300/50 transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'reverse',
              }}
            >
              <Icon className="w-3.5 h-3.5 text-brand-600 group-hover:text-brand-700 transition-colors" />
            </motion.div>
          </motion.div>
          <div className="flex-1 min-w-0">
            <motion.h3
              className="text-xs font-bold text-gray-900 group-hover:text-brand-700 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.h3>
            <motion.p
              className="text-[10px] text-gray-500 group-hover:text-gray-600 transition-colors mt-0.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          </div>

          {/* Contextual action indicator */}
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-0.5 text-[10px] text-brand-600">
              <motion.div
                className="w-1 h-1 rounded-full bg-brand-500"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <span className="font-medium">
                {title.includes('Location')
                  ? 'Geographic'
                  : title.includes('Job Titles')
                    ? 'Roles'
                    : title.includes('NOC')
                      ? 'Classification'
                      : title.includes('Categories')
                        ? 'Segmented'
                        : title.includes('Trends')
                          ? 'Timeline'
                          : 'Analytics'}
              </span>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent className="flex-grow overflow-hidden w-full p-0 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </CardContent>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
      </Card>
    </motion.div>
  );
};

const AreaChart = ({ data, color = '#10b981' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  // Use 'count' instead of 'value'
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;
  const minValue = data.length > 0 ? Math.min(...data.map((d) => d.count)) : 0;
  const range = maxValue - minValue || 1;
  const width = 1000;
  const height = 400;
  const padding = 50;
  const bottomPadding = 80;

  // Use 'period' and 'count'
  const points =
    data.length > 1
      ? data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
        const y =
          height -
          bottomPadding -
          ((d.count - minValue) / range) * (height - padding - bottomPadding);
        return { x, y, value: d.count, period: d.period }; // Store period instead of year
      })
      : [];

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const areaData =
    points.length > 0
      ? `${pathData} L ${points[points.length - 1].x} ${height - bottomPadding
      } L ${points[0].x} ${height - bottomPadding} Z`
      : '';

  return (
    <div className="relative w-full h-full px-4 py-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop
              offset="100%"
              style={{ stopColor: color, stopOpacity: 0.05 }}
            />
          </linearGradient>
        </defs>
        <path d={areaData} fill="url(#areaGradient)" />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? '6' : '4'}
              fill="white"
              stroke={color}
              strokeWidth="2"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {hoveredIndex === index && (
              <g>
                <rect
                  x={point.x - 30}
                  y={point.y - 35}
                  width="60"
                  height="28"
                  rx="6"
                  fill="rgba(0, 0, 0, 0.8)"
                />
                {/* Display value (count) */}
                <text
                  x={point.x}
                  y={point.y - 24}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {point.value}
                </text>
                {/* Display period */}
                <text
                  x={point.x}
                  y={point.y - 13}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                >
                  {point.period}
                </text>
              </g>
            )}
          </g>
        ))}
        {/* X-axis line */}
        <line
          x1={padding}
          y1={height - bottomPadding}
          x2={width - padding}
          y2={height - bottomPadding}
          stroke="#d1d5db"
          strokeWidth="1.5"
        />
        {/* X-axis labels */}
        {points.map((point, index) => (
          <g key={`label-group-${index}`}>
            {/* Tick mark */}
            <line
              x1={point.x}
              y1={height - bottomPadding}
              x2={point.x}
              y2={height - bottomPadding + 5}
              stroke="#9ca3af"
              strokeWidth="1"
            />
            {/* Label text */}
            <text
              x={point.x}
              y={height - bottomPadding + 30}
              textAnchor="middle"
              fontSize="18"
              fontWeight={hoveredIndex === index ? 700 : 600}
              fill={hoveredIndex === index ? '#047857' : '#1f2937'}
              className="select-none"
              style={{
                userSelect: 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {point.period}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const COLOR_PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#3b82f6',
  '#10b981',
];
const DonutChart = ({ data, centerValue, centerLabel, onSegmentClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = (data && data.reduce((sum, item) => sum + item.value, 0)) || 0;
  let currentAngle = -90;

  const paths =
    (data &&
      data.map((item, index) => {
        // Assign color based on index, cycling through the palette
        const assignedColor = COLOR_PALETTE[index % COLOR_PALETTE.length];
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);
        const largeArc = angle > 180 ? 1 : 0;
        const pathData = [
          `M 50 50`,
          `L ${x1} ${y1}`,
          `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
          `Z`,
        ].join(' ');
        return {
          pathData,
          color: assignedColor, // Use assigned color
          name: item.name, // Keep using item.label
          value: item.value,
          percentage: percentage.toFixed(1),
          index,
        };
      })) ||
    [];

  const displayData =
    hoveredIndex !== null && paths[hoveredIndex] ? paths[hoveredIndex] : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="20"
          />
          {paths.map((path) => (
            <path
              key={path.index}
              d={path.pathData}
              fill={path.color} // Use assigned color here
              className="transition-all duration-200 cursor-pointer"
              style={{
                opacity:
                  hoveredIndex === null || hoveredIndex === path.index
                    ? 1
                    : 0.4,
                transform:
                  hoveredIndex === path.index ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: '50% 50%',
              }}
              onMouseEnter={() => setHoveredIndex(path.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSegmentClick && onSegmentClick(path.name)}
            />
          ))}
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none text-center">
          {displayData ? (
            <>
              <div className="text-2xl font-bold text-gray-900">
                {displayData.value}
              </div>
              <div className="text-xs text-gray-500">
                {displayData.percentage}%
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900">
                {centerValue}
              </div>
              <div className="text-xs text-gray-500">{centerLabel}</div>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {/* Update legend to use assigned colors */}
        {paths.map((pathInfo, index) => (
          <div
            key={index}
            className="flex items-center gap-2 cursor-pointer transition-opacity"
            style={{
              opacity:
                hoveredIndex === null || hoveredIndex === index ? 1 : 0.4,
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: pathInfo.color }} // Use assigned color
            />
            {/* Use pathInfo.label which corresponds to item.label */}
            <span className="text-xs text-gray-600 font-medium">
              {pathInfo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, maxValue, onBarClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const max =
    maxValue || (data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1);

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-brand-300 scrollbar-track-gray-100">
      <div className="space-y-3 p-4">
        {data.map((item, index) => {
          // Assign color based on index, cycling through the palette
          const assignedColor = COLOR_PALETTE[index % COLOR_PALETTE.length];
          const percentage = max > 0 ? (item.value / max) * 100 : 0;
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={index}
              className="space-y-1 transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onBarClick && onBarClick(item.name)}
              style={{ opacity: hoveredIndex === null || isHovered ? 1 : 0.5 }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">{item.name}</span>
                <span className="text-gray-900 font-semibold">
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden group">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: assignedColor, // Use assigned color
                    transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                  }}
                />
                {isHovered && (
                  <div className="absolute inset-0 flex items-center justify-end pr-3">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ColumnChart = ({ data, onColumnClick }) => {
  // Expects data with 'title' and 'count'
  const [hoveredIndex, setHoveredIndex] = useState(null);
  // Use 'count' instead of 'value' for maxValue calculation
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  return (
    <div className="h-full flex items-end justify-around gap-4 p-4">
      {data.map((item, index) => {
        // Assign color based on index, cycling through the palette
        const assignedColor = COLOR_PALETTE[index % COLOR_PALETTE.length];
        // Use 'count' instead of 'value' for height percentage
        const heightPercentage =
          maxValue > 0 ? (item.count / maxValue) * 100 : 0;
        const isHovered = hoveredIndex === index;
        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center gap-2 transition-all duration-200 h-full"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ opacity: hoveredIndex === null || isHovered ? 1 : 0.5 }}
          >
            <div className="relative w-full flex items-end justify-center h-full">
              {isHovered && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg whitespace-nowrap z-10">
                  {/* Use 'count' in tooltip */}
                  {item.count} ({heightPercentage.toFixed(1)}%)
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
              )}
              <div
                className="w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer relative overflow-hidden hover:shadow-lg"
                style={{
                  height: `${heightPercentage}%`,
                  backgroundColor: assignedColor, // Use assigned color
                  minHeight: '2px',
                  transform: isHovered ? 'scaleX(1.05)' : 'scaleX(1)',
                }}
                onClick={() => onColumnClick && onColumnClick(item.title)}
              >
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
              </div>
            </div>
            {/* Use 'title' for label */}
            <span
              className="text-xs text-gray-600 text-center font-medium transition-all"
              style={{ fontWeight: isHovered ? 700 : 500 }}
            >
              {item.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};
