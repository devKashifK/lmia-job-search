'use client';
import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { Button } from './button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from './command';
import { Badge } from './badge';

export type SortOption = {
  key: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
};

export type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
} | null;

interface JobSortPopoverProps {
  currentSort: SortConfig;
  onSortChange: (sort: SortConfig) => void;
  className?: string;
}

const SORT_OPTIONS: SortOption[] = [
  {
    key: 'date-desc',
    label: 'Date Posted (Newest)',
    field: 'date_of_job_posting',
    direction: 'desc',
  },
  {
    key: 'date-asc',
    label: 'Date Posted (Oldest)',
    field: 'date_of_job_posting',
    direction: 'asc',
  },
  {
    key: 'title-asc',
    label: 'Job Title (A-Z)',
    field: 'job_title',
    direction: 'asc',
  },
  {
    key: 'title-desc',
    label: 'Job Title (Z-A)',
    field: 'job_title',
    direction: 'desc',
  },
  {
    key: 'employer-asc',
    label: 'Employer (A-Z)',
    field: 'employer',
    direction: 'asc',
  },
  {
    key: 'employer-desc',
    label: 'Employer (Z-A)',
    field: 'employer',
    direction: 'desc',
  },
  {
    key: 'location-asc',
    label: 'Location (A-Z)',
    field: 'city',
    direction: 'asc',
  },
  {
    key: 'location-desc',
    label: 'Location (Z-A)',
    field: 'city',
    direction: 'desc',
  },
  {
    key: 'noc-asc',
    label: 'NOC Code (A-Z)',
    field: 'noc_code',
    direction: 'asc',
  },
  {
    key: 'noc-desc',
    label: 'NOC Code (Z-A)',
    field: 'noc_code',
    direction: 'desc',
  },
];

export function JobSortPopover({
  currentSort,
  onSortChange,
  className = ''
}: JobSortPopoverProps) {
  const [open, setOpen] = React.useState(false);

  const currentSortOption = SORT_OPTIONS.find(
    option =>
      currentSort?.field === option.field &&
      currentSort?.direction === option.direction
  );

  const handleSortSelect = (option: SortOption) => {
    onSortChange({
      field: option.field,
      direction: option.direction,
    });
    setOpen(false);
  };

  const handleClearSort = () => {
    onSortChange(null);
    setOpen(false);
  };

  const getSortIcon = () => {
    if (!currentSort) return <ArrowUpDown className="w-4 h-4" />;
    return currentSort.direction === 'asc' ?
      <ArrowUp className="w-4 h-4" /> :
      <ArrowDown className="w-4 h-4" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 w-8 p-0 ${className} ${currentSort
              ? 'bg-brand-50 border-brand-200 text-brand-600 hover:bg-brand-100'
              : 'hover:bg-gray-50'
            }`}
          title="Sort jobs"
        >
          {getSortIcon()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end" sideOffset={8}>
        <Command>
          <div className="flex items-center justify-between p-3 border-b">
            <h4 className="font-medium text-sm">Sort Jobs</h4>
            {currentSort && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSort}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
            )}
          </div>
          <CommandList>
            <CommandEmpty>No sorting options found.</CommandEmpty>
            <CommandGroup>
              {SORT_OPTIONS.map((option) => (
                <CommandItem
                  key={option.key}
                  value={option.key}
                  onSelect={() => handleSortSelect(option)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-4 h-4">
                      {option.direction === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-gray-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {currentSortOption?.key === option.key && (
                    <Check className="w-4 h-4 text-brand-600" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Utility function to sort jobs array
export function sortJobs<T extends Record<string, any>>(
  jobs: T[],
  sortConfig: SortConfig
): T[] {
  if (!sortConfig) return jobs;

  return [...jobs].sort((a, b) => {
    let aValue = a[sortConfig.field];
    let bValue = b[sortConfig.field];

    // Handle special cases for different field types
    switch (sortConfig.field) {
      case 'job_title':
        aValue = a.job_title || '';
        bValue = b.job_title || '';
        break;
      case 'noc_code':
        aValue = a.noc_code || a['2021_noc'] || '';
        bValue = b.noc_code || b['2021_noc'] || '';
        break;
      case 'date_of_job_posting':
        // Handle date sorting
        if (!aValue) return 1;
        if (!bValue) return -1;
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
        break;
      default:
        // Default string handling
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
    }

    // Handle null/undefined values
    if (aValue === null || aValue === undefined || aValue === '') {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    if (bValue === null || bValue === undefined || bValue === '') {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }

    // Compare values
    let comparison = 0;
    if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }

    return sortConfig.direction === 'desc' ? -comparison : comparison;
  });
}
