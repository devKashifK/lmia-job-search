'use client';

import React, { Suspense, useMemo, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernChartWrapper } from '@/components/charts/modern-chart-wrapper';
import {
  ModernBarChart,
  ModernPieChart,
  ModernLineChart,
} from '@/components/charts/modern-charts';
import { useQuery } from '@tanstack/react-query';
import db from '@/db';
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
  ArrowLeft,
  Briefcase,
  Calendar,
  CalendarDays,
  ChevronLeft,
  Database,
  Download,
  Filter,
  X,
  Home,
} from 'lucide-react';
import { Building2, TrendingUp, MapPin, Users, Hash } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';
import { Icon } from '@iconify/react/dist/iconify.js';
import UserDropdown from '@/components/ui/user-dropdown';

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
  [key: string]: any;
}

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
  ].filter(Boolean).length;

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
          ? [locationColumn, 'city', 'noc_code'].join(', ')
          : [locationColumn, 'city', 'noc_code'].join(', ');

      const { data, error } = await db
        .from(tableName)
        .select(selectCols)
        .eq(companyColumn, companyName);

      if (error) throw error;

      const result: Record<string, Set<string>> = {
        locations: new Set(),
        cities: new Set(),
        nocCodes: new Set(),
      };

      data?.forEach((row: any) => {
        if (row[locationColumn]) result.locations.add(row[locationColumn]);
        if (row.city) result.cities.add(row.city);
        if (row.noc_code) result.nocCodes.add(row.noc_code);
      });

      return {
        locations: Array.from(result.locations).sort(),
        cities: Array.from(result.cities).sort(),
        nocCodes: Array.from(result.nocCodes).sort(),
      };
    },
    enabled: !!companyName,
  });

  const addFilter = (key: string, value: string) => {
    const current =
      (currentFilters[key as keyof typeof currentFilters] as string[]) || [];
    if (!current.includes(value)) {
      updateFilters({ [key]: [...current, value] });
    }
  };

  const removeFilter = (key: string, value: string) => {
    const current =
      (currentFilters[key as keyof typeof currentFilters] as string[]) || [];
    updateFilters({ [key]: current.filter((v) => v !== value) });
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border-r border-brand-200/40 h-full flex flex-col shadow-lg">
      {/* Horizontal Filter Bar - Top of L */}
      <div className="border-b border-brand-200/40 bg-gradient-to-r from-brand-50/60 to-white px-6 py-4">
        <div className="flex items-center justify-between gap-6 flex-col">
          {/* Data Source */}
          <div className="flex flex-col items-start w-full gap-3">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2 whitespace-nowrap">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Data Source
            </Label>
            <Select
              value={currentFilters.searchType}
              onValueChange={(value) => updateFilters({ t: value })}
            >
              <SelectTrigger className="w-full h-9 bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot_leads">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Trending Jobs
                  </div>
                </SelectItem>
                <SelectItem value="lmia">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    LMIA
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col items-start w-full gap-3">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2 whitespace-nowrap">
              <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
              Date Range
            </Label>
            <div className="flex flex-col w-full items-start gap-2">
              <Input
                type="date"
                value={currentFilters.dateFrom || ''}
                onChange={(e) => updateFilters({ date_from: e.target.value })}
                placeholder="From"
                className="w-full h-9 bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors text-xs"
              />
              <Input
                type="date"
                value={currentFilters.dateTo || ''}
                onChange={(e) => updateFilters({ date_to: e.target.value })}
                placeholder="To"
                className="w-full h-9 bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors text-xs"
              />
            </div>
          </div>

          {/* Active Filters Count */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">
                {activeFiltersCount} Active
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Filter Panel - Vertical part of L */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white via-brand-50/20 to-brand-50/30">
        {/* Date Range Display (when not in top bar due to space) */}
        {(currentFilters.dateFrom || currentFilters.dateTo) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">
                Active Date Range
              </span>
            </div>
            <p className="text-xs text-blue-700">
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
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              Additional Filters
            </h3>
          </div>

          {!filtersLoading && filterOptions ? (
            <div className="space-y-5">
              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  {currentFilters.searchType === 'lmia' ? 'Territory' : 'State'}
                </Label>
                <Select onValueChange={(value) => addFilter('location', value)}>
                  <SelectTrigger className="h-9 bg-white border-gray-200 shadow-sm hover:border-emerald-300 transition-colors">
                    <SelectValue
                      placeholder={`Select ${
                        currentFilters.searchType === 'lmia'
                          ? 'territory'
                          : 'state'
                      }...`}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {filterOptions.locations.map((location) => (
                      <SelectItem
                        key={location}
                        value={location}
                        disabled={(currentFilters.location || []).includes(
                          location
                        )}
                      >
                        {location}
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
                  <SelectTrigger className="h-9 bg-white border-gray-200 shadow-sm hover:border-sky-300 transition-colors">
                    <SelectValue placeholder="Select city..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {filterOptions.cities.map((city) => (
                      <SelectItem
                        key={city}
                        value={city}
                        disabled={(currentFilters.city || []).includes(city)}
                      >
                        {city}
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
                <Select onValueChange={(value) => addFilter('noc_code', value)}>
                  <SelectTrigger className="h-9 bg-white border-gray-200 shadow-sm hover:border-violet-300 transition-colors">
                    <SelectValue placeholder="Select NOC code..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {filterOptions.nocCodes.map((nocCode) => (
                      <SelectItem
                        key={nocCode}
                        value={nocCode}
                        disabled={(currentFilters.nocCode || []).includes(
                          nocCode
                        )}
                      >
                        {nocCode}
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
        {activeFiltersCount > 0 && (
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
        )}
      </div>
    </div>
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

  const goBack = () => {
    router.back();
  };
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Get filters from URL parameters
  const filters = useMemo((): AnalysisFilters => {
    const searchType = (
      searchParams?.get('t') === 'lmia' ? 'lmia' : 'hot_leads'
    ) as 'hot_leads' | 'lmia';
    const dateFrom = searchParams?.get('date_from') || undefined;
    const dateTo = searchParams?.get('date_to') || undefined;
    const location = searchParams?.getAll('location') || [];
    const jobTitle = searchParams?.getAll('job_title') || [];
    const nocCode = searchParams?.getAll('noc_code') || [];
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
        console.log('Sample trending job data:', jobs[0]);
        console.log('Available columns:', Object.keys(jobs[0]));
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
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Company Selected
            </h2>
            <p className="text-gray-500">
              Please select a company from the search results to view analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              Error loading analysis: {(error as Error).message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log(analysisData, 'checkAnalysisData');

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
        `Generated on ${new Date().toLocaleDateString()} | Data Source: ${
          filters.searchType === 'lmia' ? 'LMIA' : 'Hot Leads'
        }`,
        margin,
        yPosition
      );
      yPosition += 15;

      // Add summary metrics
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55); // gray-800
      pdf.text('Key Metrics', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99); // gray-600
      const metrics = [
        `Total Jobs: ${analysisData?.totalJobs || 0}`,
        `Growth Rate: ${
          analysisData?.trends.growthRate
            ? `${
                analysisData.trends.growthRate > 0 ? '+' : ''
              }${analysisData.trends.growthRate.toFixed(1)}%`
            : 'N/A'
        }`,
        `Top Location: ${analysisData?.trends.popularLocation || 'N/A'}`,
        `Common Role: ${analysisData?.trends.commonTitle || 'N/A'}`,
        `Top NOC Code: ${analysisData?.trends.topNocCode || 'N/A'}`,
      ];

      metrics.forEach((metric) => {
        pdf.text(metric, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Function to capture and add chart to PDF
      const addChartToPdf = async (elementId: string, title: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = margin;
        }

        // Add chart title
        pdf.setFontSize(12);
        pdf.setTextColor(31, 41, 55);
        pdf.text(title, margin, yPosition);
        yPosition += 8;

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if image fits on current page
        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          // Re-add title on new page
          pdf.text(title, margin, yPosition);
          yPosition += 8;
        }

        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
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
        `${companyName.replace(/[^a-z0-9]/gi, '_')}_analysis_${
          new Date().toISOString().split('T')[0]
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
    <div className="flex h-screen flex-col bg-gradient-to-br from-brand-50/40 via-white to-brand-50/20">
      <header className="bg-white/80 backdrop-blur-md border-b border-brand-200/30 sticky top-0 z-20 flex-shrink-0 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section: Filter Toggle + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center"
                aria-label={isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              >
                {isFilterOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Filter className="w-5 h-5" />
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    D Jones Trucking Ltd
                  </h1>
                  <p className="text-xs text-gray-500">
                    Company Analysis • Real-time Insights
                  </p>
                </div>
              </div>
            </div>
            {/* Right Section: Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/')}
                variant={'outline'}
                className="px-4 py-2 font-medium rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <button
                onClick={handleExportReport}
                disabled={isExporting || isLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Report
                  </>
                )}
              </button>
              <Button
                variant={'secondary'}
                onClick={goBack}
                className="px-4 py-2  font-medium rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Container for Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar container with L-shape */}
        <aside
          className={`transition-all duration-300 ${
            isFilterOpen ? 'w-80' : 'w-0'
          } overflow-hidden flex-shrink-0 bg-white/95 backdrop-blur-sm`}
        >
          <FilterSidebar
            currentFilters={filters}
            tableName={tableName}
            companyName={companyName}
          />
        </aside>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-6 w-32 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-b from-transparent to-brand-50/10">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label={'Growth Rate'}
                value={
                  analysisData?.trends.growthRate
                    ? `${
                        analysisData.trends.growthRate > 0 ? '+' : ''
                      }${analysisData.trends.growthRate.toFixed(1)}%`
                    : 'N/A'
                }
                subtitle={'Year-over-year change'}
                icon={'material-symbols:trending-up'}
              />
              <MetricCard
                label={'Top Location'}
                value={analysisData?.trends.popularLocation || 'N/A'}
                subtitle={`Most common ${
                  filters.searchType === 'lmia' ? 'territory' : 'state'
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
                  value={analysisData.trends.averagePositions.toFixed(1)}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div id="chart-location-distribution">
                <DashboardCard
                  title="Location Distribution"
                  subtitle="Job postings by state/territory"
                  icon={MapPin}
                  className="h-[400px]"
                >
                  <DonutChart
                    data={analysisData.locationData.map((d) => ({
                      name: d.name,
                      value: d.value,
                    }))}
                    centerValue={analysisData.locationData.length}
                    centerLabel={'Locations'}
                  />
                </DashboardCard>
              </div>
              <div id="chart-top-cities">
                <DashboardCard
                  title="Top Cities"
                  subtitle="Most active hiring locations"
                  icon={Building2}
                  className="h-[400px]"
                >
                  <BarChart
                    data={analysisData.cityData.map((d) => ({
                      name: d.name,
                      value: d.value,
                    }))}
                  />
                </DashboardCard>
              </div>
            </div>

            {/* Two Column Charts - NOC Codes & Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div id="chart-noc-codes">
                <DashboardCard
                  title="NOC Code Distribution"
                  subtitle="Most common occupational classifications"
                  icon={Hash}
                  className="h-[400px]"
                >
                  <ColumnChart data={analysisData.nocCodeData} />
                </DashboardCard>
              </div>
              <div id="chart-categories">
                <DashboardCard
                  title="Job Categories"
                  subtitle="Distribution by job category"
                  icon={Briefcase}
                  className="h-[400px]"
                >
                  <DonutChart
                    data={analysisData.categoryData}
                    centerLabel={'Categories'}
                    centerValue={analysisData?.categoryData?.length}
                  />
                </DashboardCard>
              </div>
            </div>

            {/* Full Width Chart - Job Titles */}
            <div className="grid grid-cols-1 gap-6">
              <div id="chart-job-titles">
                <DashboardCard
                  title="Top Job Titles"
                  subtitle="Most common positions at this company"
                  icon={Users}
                  className="h-[350px]"
                >
                  <ColumnChart data={analysisData.jobTitleData} />
                </DashboardCard>
              </div>
            </div>

            {/* Full Width Chart - Hiring Trends */}
            <div className="grid grid-cols-1 gap-6">
              <div id="chart-hiring-trends">
                <DashboardCard
                  title="Hiring Trends Over Time"
                  subtitle="Historical job posting activity"
                  icon={TrendingUp}
                  className="h-[450px] p-0 overflow-visible"
                >
                  <AreaChart data={analysisData?.timeData} color="#10b981" />
                </DashboardCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
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
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="">
        <CompanyAnalysisContent params={params} />
      </div>
      <Footer />
    </Suspense>
  );
}

const MetricCard = ({ label, value, subtitle, trend, icon }) => {
  return (
    <div className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-brand-200/30 p-5 hover:shadow-lg hover:border-brand-400/50 hover:bg-white hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{value}</p>
        </div>
        <div className="p-2.5 bg-gradient-to-br from-brand-50 to-brand-100/80 rounded-xl ring-1 ring-brand-200/40 group-hover:ring-brand-400/50 group-hover:shadow-md transition-all">
          <Icon icon={icon} className="w-5 h-5 text-brand-600 group-hover:text-brand-700" />
        </div>
      </div>
      <p className="text-xs text-gray-500 group-hover:text-gray-600">{subtitle}</p>
    </div>
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
    <div
      className={`group bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-brand-200/30 hover:border-brand-300/50 hover:shadow-xl transition-all duration-300 flex flex-col ${className}`}
    >
      <div className="flex items-center gap-2.5 p-5 pb-3 flex-shrink-0">
        <div className="p-2 bg-gradient-to-br from-brand-50 to-brand-100/60 rounded-lg ring-1 ring-brand-200/30 group-hover:ring-brand-300/50 transition-all">
          <Icon className="w-4 h-4 text-brand-600 group-hover:text-brand-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">{subtitle}</p>
        </div>
      </div>
      <div className="flex-grow overflow-hidden w-full">{children}</div>
    </div>
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
      ? `${pathData} L ${points[points.length - 1].x} ${
          height - bottomPadding
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
const DonutChart = ({ data, centerValue, centerLabel }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  const paths = data.map((item, index) => {
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
  });

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
        {paths.map(
          (pathInfo, index) => (
            console.log(pathInfo, 'pathInfo'),
            (
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
            )
          )
        )}
      </div>
    </div>
  );
};

const BarChart = ({ data, maxValue }) => {
  console.log(data, 'barChartData');
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
            className="space-y-1 transition-all duration-200"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
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

const ColumnChart = ({ data }) => {
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
                className="w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer relative overflow-hidden"
                style={{
                  height: `${heightPercentage}%`,
                  backgroundColor: assignedColor, // Use assigned color
                  minHeight: '2px',
                  transform: isHovered ? 'scaleX(1.05)' : 'scaleX(1)',
                }}
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
