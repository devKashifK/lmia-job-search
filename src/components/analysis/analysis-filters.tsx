'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  CalendarDays,
  MapPin,
  Briefcase,
  Filter,
  X,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import db from '@/db';
import { cn } from '@/lib/utils';

interface AnalysisFiltersProps {
  currentFilters: {
    searchType: 'hot_leads' | 'lmia';
    dateFrom?: string;
    dateTo?: string;
    location?: string[];
    jobTitle?: string[];
    nocCode?: string[];
    category?: string[]; // Hot leads only
    program?: string[]; // LMIA only
    city?: string[];
  };
  tableName: string;
  companyName: string;
}

export function AnalysisFilters({
  currentFilters,
  tableName,
  companyName,
}: AnalysisFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [jobTitleOpen, setJobTitleOpen] = useState(false);

  // Get available locations and job titles for the company
  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options', tableName, companyName],
    queryFn: async () => {
      const companyColumn =
        currentFilters.searchType === 'lmia' ? 'operating_name' : 'employer';
      const locationColumn =
        currentFilters.searchType === 'lmia' ? 'territory' : 'state';

      const selectCols = [locationColumn, 'job_title'].join(', ');

      const { data, error } = await db
        .from(tableName)
        .select(selectCols)
        .eq(companyColumn, companyName);

      if (error) throw error;

      const locations = new Set<string>();
      const jobTitles = new Set<string>();

      data?.forEach((row: any) => {
        if (row[locationColumn]) locations.add(row[locationColumn]);
        if (row.job_title) jobTitles.add(row.job_title);
      });

      return {
        locations: Array.from(locations).sort(),
        jobTitles: Array.from(jobTitles).sort(),
      };
    },
    enabled: !!companyName,
  });

  const updateFilters = (
    updates: Record<string, string | string[] | undefined>
  ) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '');

    // Apply updates
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
    // Keep essential params
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
  ].filter(Boolean).length;

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
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              showFilters && 'rotate-180'
            )}
          />
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
              <SelectItem value="hot_leads">Trending</SelectItem>
              <SelectItem value="lmia">LMIA</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
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
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-from" className="text-sm text-gray-600">
                    From
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={currentFilters.dateFrom || ''}
                    onChange={(e) =>
                      updateFilters({ date_from: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-sm text-gray-600">
                    To
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={currentFilters.dateTo || ''}
                    onChange={(e) => updateFilters({ date_to: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {currentFilters.searchType === 'lmia' ? 'Territory' : 'State'}
              </Label>
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={locationOpen}
                    className="w-full justify-between"
                  >
                    {currentFilters.location &&
                    currentFilters.location.length > 0
                      ? `${currentFilters.location.length} selected`
                      : 'Select locations...'}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search locations..." />
                    <CommandEmpty>No locations found.</CommandEmpty>
                    <CommandGroup>
                      {filterOptions?.locations?.map((location) => (
                        <CommandItem
                          key={location}
                          onSelect={() => {
                            const currentSelected =
                              currentFilters.location || [];
                            const newSelected = currentSelected.includes(
                              location
                            )
                              ? currentSelected.filter((l) => l !== location)
                              : [...currentSelected, location];
                            updateFilters({ location: newSelected });
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              (currentFilters.location || []).includes(location)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {location}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Job Title Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Title
              </Label>
              <Popover open={jobTitleOpen} onOpenChange={setJobTitleOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={jobTitleOpen}
                    className="w-full justify-between"
                  >
                    {currentFilters.jobTitle &&
                    currentFilters.jobTitle.length > 0
                      ? `${currentFilters.jobTitle.length} selected`
                      : 'Select job titles...'}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search job titles..." />
                    <CommandEmpty>No job titles found.</CommandEmpty>
                    <CommandGroup>
                      {filterOptions?.jobTitles?.map((title) => (
                        <CommandItem
                          key={title}
                          onSelect={() => {
                            const currentSelected =
                              currentFilters.jobTitle || [];
                            const newSelected = currentSelected.includes(title)
                              ? currentSelected.filter((t) => t !== title)
                              : [...currentSelected, title];
                            updateFilters({ job_title: newSelected });
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              (currentFilters.jobTitle || []).includes(title)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.dateFrom && (
            <Badge variant="secondary" className="flex items-center gap-1">
              From: {currentFilters.dateFrom}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ date_from: undefined })}
              />
            </Badge>
          )}
          {currentFilters.dateTo && (
            <Badge variant="secondary" className="flex items-center gap-1">
              To: {currentFilters.dateTo}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ date_to: undefined })}
              />
            </Badge>
          )}
          {currentFilters.location?.map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {location}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newLocations =
                    currentFilters.location?.filter((l) => l !== location) ||
                    [];
                  updateFilters({ location: newLocations });
                }}
              />
            </Badge>
          ))}
          {currentFilters.jobTitle?.map((title) => (
            <Badge
              key={title}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {title.length > 30 ? `${title.substring(0, 30)}...` : title}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newTitles =
                    currentFilters.jobTitle?.filter((t) => t !== title) || [];
                  updateFilters({ job_title: newTitles });
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
