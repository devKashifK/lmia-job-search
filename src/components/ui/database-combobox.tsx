'use client';

import * as React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Plus } from 'lucide-react';
import db from '@/db';

import { suggestTrending, suggestLmia } from '@/lib/api/suggestions';

export function DatabaseCombobox({ 
    type, 
    onSelect, 
    placeholder = "Add..." 
}: { 
    type: 'title' | 'noc' | 'employer';
    onSelect: (val: string) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [options, setOptions] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (!open) return; // Only fetch if the combobox is opened

        const fetchOptions = async () => {
            setIsLoading(true);
            try {
               if (type === 'title') {
                   const [d1, d2] = await Promise.all([
                       suggestTrending(search, 'job_title', 1000),
                       suggestLmia(search, 'JobTitle', 1000)
                   ]);
                   const s = new Set<string>();
                   d1.forEach(r => { if (r.suggestion) s.add(r.suggestion); });
                   d2.forEach(r => { if (r.suggestion) s.add(r.suggestion); });
                   setOptions(Array.from(s));
               } else if (type === 'noc') {
                   const d = await suggestLmia(search, 'noc_code', 1000);
                   const s = new Set<string>();
                   d.forEach(r => { if (r.suggestion) s.add(r.suggestion); });
                   setOptions(Array.from(s));
               } else if (type === 'employer') {
                   const [d1, d2] = await Promise.all([
                       suggestTrending(search, 'employer', 1000),
                       suggestLmia(search, 'employer', 1000)
                   ]);
                   const s = new Set<string>();
                   d1.forEach(r => { if (r.suggestion) s.add(r.suggestion); });
                   d2.forEach(r => { if (r.suggestion) s.add(r.suggestion); });
                   setOptions(Array.from(s));
               }
            } catch(e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        const t = setTimeout(fetchOptions, search ? 300 : 0);
        return () => clearTimeout(t);
    }, [search, type, open]);

    return (
        <Popover open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) setSearch('');
        }}>
            <PopoverTrigger asChild>
                <button className="bg-transparent border border-dashed border-gray-300 hover:border-gray-500 text-gray-500 text-[10px] px-2 py-1 h-6 min-w-[90px] w-auto flex items-center justify-center gap-1 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                    <Plus className="w-2.5 h-2.5" /> {placeholder}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 shadow-xl border border-gray-200 z-[100]" align="start" sideOffset={8}>
                <Command shouldFilter={false}>
                    <CommandInput 
                        placeholder="Type to search database..." 
                        value={search} 
                        onValueChange={setSearch} 
                        className="text-xs h-9 border-none focus:ring-0"
                    />
                    <CommandList className="max-h-72 text-xs overflow-y-auto w-full custom-scroll">
                        <CommandEmpty className="py-4 text-center text-xs text-gray-500">
                            {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Querying DB...</span> : "No unique results found."}
                        </CommandEmpty>
                        
                        {(options.length > 0) && (
                            <CommandGroup heading="Database Matches">
                                {options.map((opt) => (
                                    <CommandItem 
                                        key={opt}
                                        onSelect={() => {
                                            onSelect(opt);
                                            setOpen(false);
                                            setSearch('');
                                        }}
                                        className="cursor-pointer text-xs flex items-center w-full min-w-0"
                                    >
                                        <span className="truncate w-[95%]">{opt}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        
                        {search && search.length >= 2 && !options.includes(search) && (
                            <CommandGroup heading="Custom Entry">
                                <CommandItem 
                                    onSelect={() => {
                                        onSelect(search);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className="cursor-pointer text-xs italic text-brand-600 bg-brand-50/30"
                                >
                                    <Plus className="w-3 h-3 mr-1.5 shrink-0" />
                                    <span className="truncate w-[95%]">Add "{search}"</span>
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
