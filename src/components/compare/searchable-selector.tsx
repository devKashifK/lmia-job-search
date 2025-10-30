'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';

interface SearchableSelectorProps {
  value: string;
  onValueChange: (value: string) =>void;
  options: Array<{ name: string; count: number }>;
  placeholder: string;
  isLoading?: boolean;
  excludeValue?: string;
}

export function SearchableSelector({
  value,
  onValueChange,
  options,
  placeholder,
  isLoading,
  excludeValue,
}: SearchableSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const filteredOptions = (options || []).filter(
    (opt) => opt.name !== excludeValue
  );

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
              {filteredOptions.find((opt) => opt.name === value) && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 ml-auto shrink-0">
                  {filteredOptions
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
        <Command>
          <CommandInput placeholder="Search..." className="h-8 text-xs" />
          <CommandEmpty className="text-xs py-6 text-center">No results found.</CommandEmpty>
          <CommandList className="max-h-[280px]">
            <CommandGroup>
              {isLoading ? (
                <div className="p-3 text-center text-xs text-gray-500">
                  Loading...
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <CommandItem
                    key={option.name}
                    value={option.name}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? '' : currentValue);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between py-1.5 px-2 text-xs"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Check
                        className={cn(
                          'h-3 w-3 shrink-0',
                          value === option.name ? 'opacity-100 text-brand-600' : 'opacity-0'
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
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
