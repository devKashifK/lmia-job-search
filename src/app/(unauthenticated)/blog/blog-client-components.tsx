'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

interface Category {
  name: string;
  slug: string;
}

interface BlogClientComponentsProps {
  currentSearch: string;
}

export default function BlogClientComponents({
  currentSearch,
}: BlogClientComponentsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [searchValue, setSearchValue] = useState(currentSearch);

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchValue) {
          params.set('search', searchValue);
        } else {
          params.delete('search');
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, currentSearch, pathname, router, searchParams]);

  return (
    <div className="relative w-full group">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 transition-transform duration-300 group-focus-within:scale-110">
        <SearchIcon className="w-5 h-5 text-blue-200/50 group-focus-within:text-brand-400 group-hover:text-brand-400 transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search the Knowledge Maze..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="w-full h-18 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl pl-16 pr-8 text-white placeholder:text-blue-200/30 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:bg-white/10 transition-all duration-500 text-lg shadow-2xl"
      />
      {searchValue && (
        <button 
          onClick={() => setSearchValue('')}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-200/30 hover:text-white transition-colors"
        >
          <span className="text-xs font-black uppercase tracking-widest">Clear</span>
        </button>
      )}
    </div>
  );
}
