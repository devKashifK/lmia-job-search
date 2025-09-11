'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, MapPin, Briefcase, Filter, X, ChevronDown, Hash, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import db from '@/db';
import { cn } from '@/lib/utils';

interface EnhancedAnalysisFiltersProps {
  currentFilters: {
    searchType: 'hot_leads' | 'lmia';
    dateFrom?: string;
    dateTo?: string;
    location?: string[];
    jobTitle?: string[];
    nocCode?: string[];
    category?: string[];
    program?: string[];
    city?: string[];
  };
  tableName: string;
  companyName: string;
}

export function EnhancedAnalysisFilters({ 
  currentFilters, 
  tableName, 
  companyName 
}: EnhancedAnalysisFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [showFilters, setShowFilters] = useState(false);

  // Get available filter options for the company
  const { data: filterOptions, isLoading } = useQuery({
    queryKey: ['analysis-filter-options', tableName, companyName, currentFilters.searchType],
    queryFn: async () => {
      const companyColumn = currentFilters.searchType === 'lmia' ? 'operating_name' : 'employer';
      
      const selectCols = currentFilters.searchType === 'lmia'
        ? 'territory,city,job_title,noc_code,program'
        : 'state,city,job_title,noc_code,category';
      
      const { data, error } = await db
        .from(tableName)
        .select(selectCols)
        .eq(companyColumn, companyName);
        
      if (error) throw error;

      const result: Record<string, Set<string>> = {
        locations: new Set(),
        cities: new Set(),
        jobTitles: new Set(),
        nocCodes: new Set(),
        categories: new Set(),
        programs: new Set(),
      };
      
      data?.forEach((row: any) => {
        const locationColumn = currentFilters.searchType === 'lmia' ? 'territory' : 'state';
        if (row[locationColumn]) result.locations.add(row[locationColumn]);
        if (row.city) result.cities.add(row.city);
        if (row.job_title) result.jobTitles.add(row.job_title);
        if (row.noc_code) result.nocCodes.add(row.noc_code);
        if (row.category) result.categories.add(row.category);
        if (row.program) result.programs.add(row.program);
      });

      return {
        locations: Array.from(result.locations).sort(),
        cities: Array.from(result.cities).sort(),
        jobTitles: Array.from(result.jobTitles).sort(),
        nocCodes: Array.from(result.nocCodes).sort(),
        categories: Array.from(result.categories).sort(),
        programs: Array.from(result.programs).sort(),
      };
    },
    enabled: !!companyName,
  });

  const updateFilters = (updates: Record<string, string | string[] | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '');
    
    Object.entries(updates).forEach(([key, value]) => {
      newSearchParams.delete(key);
      
      if (Array.isArray(value)) {
        value.forEach(v => newSearchParams.append(key, v));
      } else if (value) {
        newSearchParams.set(key, value);
      }
    });
    
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const addFilter = (key: string, value: string) => {
    const current = currentFilters[key as keyof typeof currentFilters] as string[] || [];
    if (!current.includes(value)) {
      updateFilters({ [key]: [...current, value] });
    }
  };

  const removeFilter = (key: string, value: string) => {
    const current = currentFilters[key as keyof typeof currentFilters] as string[] || [];
    updateFilters({ [key]: current.filter(v => v !== value) });
  };

  const clearAllFilters = () => {
    const newSearchParams = new URLSearchParams();
    if (searchParams?.get('company')) {
      newSearchParams.set('company', searchParams.get('company')!);
    }
    if (searchParams?.get('t')) {
      newSearchParams.set('t', searchParams.get('t')!);
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const activeFiltersCount = [
    currentFilters.dateFrom,
    currentFilters.dateTo,
    ...(currentFilters.location || []),
    ...(currentFilters.jobTitle || []),
    ...(currentFilters.nocCode || []),
    ...(currentFilters.category || []),
    ...(currentFilters.program || []),
    ...(currentFilters.city || []),
  ].filter(Boolean).length;

  const renderMultiSelect = (
    label: string, 
    icon: React.ReactNode, 
    options: string[] = [], 
    filterKey: string,
    currentValues: string[] = []
  ) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <Select onValueChange={(value) => addFilter(filterKey, value)}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}...`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option}
              disabled={currentValues.includes(option)}
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Show selected values */}
      {currentValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {currentValues.map((value) => (
            <Badge key={value} variant="secondary" className="flex items-center gap-1">
              {value.length > 20 ? `${value.substring(0, 20)}...` : value}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter(filterKey, value)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
        </Button>
        
        <div className="flex items-center gap-2">
          {/* Search Type Selector */}
          <Select 
            value={currentFilters.searchType} 
            onValueChange={(value) => updateFilters({ t: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot_leads">Hot Leads</SelectItem>
              <SelectItem value="lmia">LMIA</SelectItem>
            </SelectContent>
          </Select>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date Range {currentFilters.searchType === 'lmia' ? '(Year)' : '(Date)'}
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-from" className="text-sm text-gray-600">From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={currentFilters.dateFrom || ''}
                    onChange={(e) => updateFilters({ date_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-sm text-gray-600">To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={currentFilters.dateTo || ''}
                    onChange={(e) => updateFilters({ date_to: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {!isLoading && filterOptions && (
              <>
                {/* Location Filter */}
                {renderMultiSelect(
                  currentFilters.searchType === 'lmia' ? 'Territory' : 'State',
                  <MapPin className="h-4 w-4" />,
                  filterOptions.locations,
                  'location',
                  currentFilters.location
                )}

                {/* City Filter */}
                {renderMultiSelect(
                  'City',
                  <Building2 className="h-4 w-4" />,
                  filterOptions.cities,
                  'city',
                  currentFilters.city
                )}

                {/* Job Title Filter */}
                {renderMultiSelect(
                  'Job Title',
                  <Briefcase className="h-4 w-4" />,
                  filterOptions.jobTitles,
                  'job_title',
                  currentFilters.jobTitle
                )}

                {/* NOC Code Filter */}
                {renderMultiSelect(
                  'NOC Code',
                  <Hash className="h-4 w-4" />,
                  filterOptions.nocCodes,
                  'noc_code',
                  currentFilters.nocCode
                )}

                {/* LMIA-specific filters */}
                {currentFilters.searchType === 'lmia' && (
                  <>
                    {renderMultiSelect(
                      'Program',
                      <Briefcase className="h-4 w-4" />,
                      filterOptions.programs,
                      'program',
                      currentFilters.program
                    )}
                  </>
                )}

                {/* Hot Leads-specific filters */}
                {currentFilters.searchType === 'hot_leads' && (
                  <>
                    {renderMultiSelect(
                      'Category',
                      <Briefcase className="h-4 w-4" />,
                      filterOptions.categories,
                      'category',
                      currentFilters.category
                    )}
                  </>
                )}
              </>
            )}

            {isLoading && (
              <div className="text-center py-4 text-gray-500">
                Loading filter options...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
