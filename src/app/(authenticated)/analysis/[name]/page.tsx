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
import { Briefcase, CalendarDays, ChevronLeft, Filter, X } from 'lucide-react';
import { Building2, TrendingUp, MapPin, Users, Hash } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';

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

// Modern analysis filters component
function SimpleAnalysisFilters({
  currentFilters,
  tableName,
  companyName,
}: {
  currentFilters: AnalysisFilters;
  tableName: string;
  companyName: string;
}) {
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

  // Get available filter options for the company
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
    <div className="bg-gradient-to-br w-[30%] from-white to-gray-50/30 border border-gray-200/60 rounded-xl shadow-sm">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Filter className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Filter Analysis</h3>
            <p className="text-xs text-gray-500">
              Refine your company insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {activeFiltersCount} active
            </Badge>
          )}
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-8 px-3"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button> */}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Essential Filters Row */}
        <div className="flex flex-col gap-4">
          {/* Data Source */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Data Source
            </Label>
            <Select
              value={currentFilters.searchType}
              onValueChange={(value) => updateFilters({ t: value })}
            >
              <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
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
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarDays className="h-3 w-3 text-orange-500" />
              Date Range
            </Label>
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                value={currentFilters.dateFrom || ''}
                onChange={(e) => updateFilters({ date_from: e.target.value })}
                placeholder="Start date"
                className="bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors text-sm"
              />
              <Input
                type="date"
                value={currentFilters.dateTo || ''}
                onChange={(e) => updateFilters({ date_to: e.target.value })}
                placeholder="End date"
                className="bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors text-sm"
              />
            </div>
            {(currentFilters.dateFrom || currentFilters.dateTo) && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {currentFilters.dateFrom && currentFilters.dateTo ? (
                  <>
                    From{' '}
                    {new Date(currentFilters.dateFrom).toLocaleDateString()} to{' '}
                    {new Date(currentFilters.dateTo).toLocaleDateString()}
                  </>
                ) : currentFilters.dateFrom ? (
                  <>
                    From{' '}
                    {new Date(currentFilters.dateFrom).toLocaleDateString()}{' '}
                    onwards
                  </>
                ) : (
                  <>
                    Up to{' '}
                    {new Date(currentFilters.dateTo!).toLocaleDateString()}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-2 pt-2">
            <span className="text-xs text-left font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Advanced Filters
            </span>
          </div>

          {!filtersLoading && filterOptions ? (
            <div className="flex flex-col gap-4">
              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  {currentFilters.searchType === 'lmia' ? 'Territory' : 'State'}
                </Label>
                <Select onValueChange={(value) => addFilter('location', value)}>
                  <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
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
                        className="flex items-center gap-2"
                      >
                        <span
                          className={`${
                            (currentFilters.location || []).includes(location)
                              ? 'text-gray-400'
                              : ''
                          }`}
                        >
                          {location}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="h-3 w-3 text-sky-500" />
                  City
                </Label>
                <Select onValueChange={(value) => addFilter('city', value)}>
                  <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                    <SelectValue placeholder="Select city..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {filterOptions.cities.map((city) => (
                      <SelectItem
                        key={city}
                        value={city}
                        disabled={(currentFilters.city || []).includes(city)}
                      >
                        <span
                          className={`${
                            (currentFilters.city || []).includes(city)
                              ? 'text-gray-400'
                              : ''
                          }`}
                        >
                          {city}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* NOC Code Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Hash className="h-3 w-3 text-violet-500" />
                  NOC Code
                </Label>
                <Select onValueChange={(value) => addFilter('noc_code', value)}>
                  <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
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
                        <span
                          className={`${
                            (currentFilters.nocCode || []).includes(nocCode)
                              ? 'text-gray-400'
                              : ''
                          }`}
                        >
                          {nocCode}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : filtersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">
                  Loading filter options...
                </span>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
              <span className="text-xs font-medium text-gray-600">
                Active Filters ({activeFiltersCount})
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(currentFilters.dateFrom || currentFilters.dateTo) && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors"
                >
                  <CalendarDays className="h-3 w-3" />
                  {currentFilters.dateFrom && currentFilters.dateTo ? (
                    <>
                      From{' '}
                      {new Date(currentFilters.dateFrom).toLocaleDateString()}{' '}
                      to {new Date(currentFilters.dateTo).toLocaleDateString()}
                    </>
                  ) : currentFilters.dateFrom ? (
                    <>
                      From{' '}
                      {new Date(currentFilters.dateFrom).toLocaleDateString()}
                    </>
                  ) : (
                    <>
                      To {new Date(currentFilters.dateTo!).toLocaleDateString()}
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-orange-200 rounded-full"
                    onClick={() =>
                      updateFilters({
                        date_from: undefined,
                        date_to: undefined,
                      })
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {currentFilters.location?.map((location) => (
                <Badge
                  key={location}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  <MapPin className="h-3 w-3" />
                  {location}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-emerald-200 rounded-full"
                    onClick={() => removeFilter('location', location)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {currentFilters.city?.map((city) => (
                <Badge
                  key={city}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1 bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors"
                >
                  <Building2 className="h-3 w-3" />
                  {city}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-sky-200 rounded-full"
                    onClick={() => removeFilter('city', city)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {currentFilters.nocCode?.map((nocCode) => (
                <Badge
                  key={nocCode}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1 bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors"
                >
                  <Hash className="h-3 w-3" />
                  {nocCode}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-violet-200 rounded-full"
                    onClick={() => removeFilter('noc_code', nocCode)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

              {activeFiltersCount > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 border"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Simple Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-brand-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{companyName}</h1>
            <p className="text-sm text-gray-500">
              Company Analysis •{' '}
              {filters.searchType === 'lmia' ? 'LMIA' : 'Hot Leads'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Badge variant="outline" className="text-sm">
            {analysisData?.totalJobs || 0} Jobs
          </Badge>
          <Button
            onClick={goBack}
            className="bg-brand-600 text-white hover:bg-brand-700 px-3"
          >
            <ChevronLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Filters */}
        <SimpleAnalysisFilters
          currentFilters={filters}
          tableName={tableName}
          companyName={companyName}
        />

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
          <div className="flex flex-col gap-4 w-full">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Growth Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysisData?.trends.growthRate
                      ? `${
                          analysisData.trends.growthRate > 0 ? '+' : ''
                        }${analysisData.trends.growthRate.toFixed(1)}%`
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Year-over-year change
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Top Location
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {analysisData?.trends.popularLocation || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Most common{' '}
                    {filters.searchType === 'lmia' ? 'territory' : 'state'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Top NOC Code
                  </CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {analysisData?.trends.topNocCode || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Most frequent NOC code
                  </p>
                </CardContent>
              </Card>

              {filters.searchType === 'lmia' &&
              analysisData?.trends.averagePositions ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Positions
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analysisData.trends.averagePositions.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per LMIA application
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Common Role
                    </CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold truncate">
                      {analysisData?.trends.commonTitle || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Most frequent job title
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location Distribution */}
              <ModernChartWrapper
                title="Location Distribution"
                description={`Job postings by ${
                  filters.searchType === 'lmia' ? 'territory' : 'state'
                }`}
                height="360px"
              >
                {analysisData?.locationData && (
                  <ModernPieChart
                    data={analysisData.locationData.map((d) => ({
                      name: d.name,
                      value: d.value,
                    }))}
                  />
                )}
              </ModernChartWrapper>

              {/* Time Trend */}
              <ModernChartWrapper
                title="Hiring Trends Over Time"
                description={`Job postings by ${
                  filters.searchType === 'lmia' ? 'year' : 'posting date'
                }`}
                trend={
                  analysisData?.trends.growthRate
                    ? {
                        value: Math.abs(analysisData.trends.growthRate),
                        isPositive: analysisData.trends.growthRate > 0,
                      }
                    : undefined
                }
                height="380px"
              >
                {analysisData?.timeData && (
                  <ModernLineChart
                    data={analysisData.timeData.map((d) => ({
                      name: d.period,
                      value: d.count,
                    }))}
                    showArea
                  />
                )}
              </ModernChartWrapper>

              {/* City Distribution */}
              <ModernChartWrapper
                title="Top Cities"
                description="Job postings by city location"
                height="360px"
              >
                {analysisData?.cityData && (
                  <ModernBarChart
                    data={analysisData.cityData.map((d) => ({
                      name: d.name,
                      value: d.value,
                    }))}
                    colorScheme="brand"
                    showGrid
                  />
                )}
              </ModernChartWrapper>

              {/* NOC Codes */}
              <ModernChartWrapper
                title="NOC Code Distribution"
                description="Most common National Occupational Classification codes"
                height="360px"
              >
                {analysisData?.nocCodeData && (
                  <ModernBarChart
                    data={analysisData.nocCodeData.map((d) => ({
                      name: d.code,
                      value: d.count,
                    }))}
                    colorScheme="professional"
                    showGrid
                  />
                )}
              </ModernChartWrapper>

              {/* LMIA-specific charts */}
              {filters.searchType === 'lmia' && analysisData?.programData && (
                <ModernChartWrapper
                  title="LMIA Programs"
                  description="Distribution by LMIA program type"
                  height="340px"
                >
                  <ModernPieChart
                    data={analysisData.programData.map((d) => ({
                      name: d.name,
                      value: d.value,
                    }))}
                  />
                </ModernChartWrapper>
              )}

              {filters.searchType === 'lmia' &&
                analysisData?.priorityOccupationData && (
                  <ModernChartWrapper
                    title="Priority Occupations"
                    description="Jobs categorized by priority occupation status"
                    height="360px"
                  >
                    <ModernBarChart
                      data={analysisData.priorityOccupationData.map((d) => ({
                        name: d.name,
                        value: d.value,
                      }))}
                      colorScheme="pastel"
                      showGrid
                    />
                  </ModernChartWrapper>
                )}

              {/* Hot Leads-specific charts */}
              {filters.searchType === 'hot_leads' &&
                analysisData?.categoryData && (
                  <ModernChartWrapper
                    title="Job Categories"
                    description="Distribution by job category"
                    height="340px"
                  >
                    <ModernPieChart
                      data={analysisData.categoryData.map((d) => ({
                        name: d.name,
                        value: d.value,
                      }))}
                    />
                  </ModernChartWrapper>
                )}

              {/* Job Titles - Full width */}
              <ModernChartWrapper
                title="Top Job Titles"
                description="Most common positions at this company"
                className="lg:col-span-2"
                height="400px"
              >
                {analysisData?.jobTitleData && (
                  <ModernBarChart
                    data={analysisData.jobTitleData.map((d) => ({
                      name: d.title,
                      value: d.count,
                    }))}
                    colorScheme="gradient"
                    showGrid
                  />
                )}
              </ModernChartWrapper>
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
      <Navbar />
      <div className="mt-14">
        <CompanyAnalysisContent params={params} />
      </div>
      <Footer />
    </Suspense>
  );
}
