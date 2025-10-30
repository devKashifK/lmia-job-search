'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedSearchableSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ name: string; count: number }>;
  placeholder: string;
  isLoading?: boolean;
  excludeValue?: string;
}

export function VirtualizedSearchableSelector({
  value,
  onValueChange,
  options,
  placeholder,
  isLoading,
  excludeValue,
}: VirtualizedSearchableSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const parentRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = React.useMemo(() => {
    let filtered = (options || []).filter((opt) => opt.name !== excludeValue);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((opt) =>
        opt.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [options, excludeValue, searchQuery]);

  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // Height of each item
    overscan: 5, // Render 5 extra items above and below viewport
  });

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === value ? '' : selectedValue);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-9 w-full justify-between border transition-all',
            value
              ? 'border-brand-300 bg-brand-50/30'
              : 'border-gray-200 hover:border-gray-300',
            'text-sm'
          )}
        >
          {value ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="font-medium text-gray-900 truncate text-xs">
                {value}
              </span>
              {options?.find((opt) => opt.name === value) && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 ml-auto shrink-0">
                  {options
                    .find((opt) => opt.name === value)
                    ?.count.toLocaleString()}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <Search className="w-3 h-3" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Virtualized List */}
          {isLoading ? (
            <div className="p-3 text-center text-xs text-gray-500">
              Loading...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              No results found.
            </div>
          ) : (
            <div
              ref={parentRef}
              className="h-[280px] overflow-auto relative"
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().length > 0 ? (
                  rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const option = filteredOptions[virtualItem.index];
                    if (!option) return null;
                    const isSelected = value === option.name;

                    return (
                      <div
                        key={virtualItem.key}
                        data-index={virtualItem.index}
                        className={cn(
                          'absolute top-0 left-0 w-full flex items-center justify-between px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-100 transition-colors',
                          isSelected && 'bg-brand-50'
                        )}
                        style={{
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                        onClick={() => handleSelect(option.name)}
                      >
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <Check
                            className={cn(
                              'h-3 w-3 shrink-0',
                              isSelected ? 'opacity-100 text-brand-600' : 'opacity-0'
                            )}
                          />
                          <span className="truncate">{option.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 ml-2 shrink-0"
                        >
                          {option.count.toLocaleString()}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  // Fallback: show first 100 items if virtualizer fails
                  filteredOptions.slice(0, 100).map((option) => {
                    const isSelected = value === option.name;
                    return (
                      <div
                        key={option.name}
                        className={cn(
                          'flex items-center justify-between px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-100 transition-colors',
                          isSelected && 'bg-brand-50'
                        )}
                        onClick={() => handleSelect(option.name)}
                      >
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <Check
                            className={cn(
                              'h-3 w-3 shrink-0',
                              isSelected ? 'opacity-100 text-brand-600' : 'opacity-0'
                            )}
                          />
                          <span className="truncate">{option.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 ml-2 shrink-0"
                        >
                          {option.count.toLocaleString()}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          {/* Results count */}
          {!isLoading && filteredOptions.length > 0 && (
            <div className="border-t px-3 py-1.5 text-[10px] text-gray-500">
              {filteredOptions.length.toLocaleString()} {filteredOptions.length === 1 ? 'option' : 'options'}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
