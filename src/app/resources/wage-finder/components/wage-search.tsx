'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search as SearchIcon } from 'lucide-react';
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
import { NocSummary } from '@/lib/noc-service';

interface WageSearchProps {
  summaries: NocSummary[];
  onSelect: (code: string) => void;
}

export function WageSearch({ summaries, onSelect }: WageSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-14 px-6 rounded-2xl border-emerald-100 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-emerald-200 transition-all text-left font-medium shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <SearchIcon className="h-5 w-5 text-emerald-500 shrink-0" />
              <span className="truncate">
                {value
                  ? summaries.find((s) => s.code === value)?.title || "Select NOC..."
                  : "Search by NOC Code or Job Title..."}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border-emerald-100 shadow-2xl overflow-hidden" align="start">
          <Command className="border-none">
            <CommandInput
              placeholder="Type NOC code or job name..."
              className="h-12 border-none focus:ring-0"
            />
            <CommandList className="max-h-[400px]">
              <CommandEmpty>No results found for that search.</CommandEmpty>
              <CommandGroup heading="Available NOC Classifications">
                {summaries.map((summary) => (
                  <CommandItem
                    key={summary.code}
                    value={`${summary.code} ${summary.title}`}
                    onSelect={() => {
                      setValue(summary.code);
                      setOpen(false);
                      onSelect(summary.code);
                    }}
                    className="flex items-center justify-between py-3 rounded-lg mx-1 my-0.5"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-emerald-900">{summary.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/50">NOC {summary.code}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold underline decoration-emerald-200">{summary.teer}</span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 text-emerald-600 transition-opacity",
                        value === summary.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trending:</span>
        {summaries.slice(0, 3).map((s) => (
            <button 
                key={s.code}
                onClick={() => {
                    setValue(s.code);
                    onSelect(s.code);
                }}
                className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"
            >
                {s.code}
            </button>
        ))}
      </div> */}
    </div>
  );
}
