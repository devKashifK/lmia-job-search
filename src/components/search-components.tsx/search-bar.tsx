'use client';
import { useRef, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTableStore } from '@/context/store';
import { toast } from '@/hooks/use-toast';
import db from '@/db';
import { useRouter } from 'next/navigation';
import { useUpdateCredits } from '@/hooks/use-credits';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobSearch } from '@/hooks/use-job-search';

export function SearchBar({ type }: { type: string }) {
  const {
    input: searchQuery,
    setInput: setSearchQuery,
    suggestions,
    showSuggestions,
    setShowSuggestions, // Ensure this is returned from hook
    isLoadingSuggestions, // Ensure this is returned
    isSearching: isChecking, // Map to existing name
    searchType,
    setSearchType,
    inputRef,
    suggestionsRef,
    handleInputChange: handleChange, // Map to existing handler name style for minimal diff or use directly
    handleSearch,
    handleSuggestionClick,
    handleClear
  } = useJobSearch({ initialSearchType: type as 'hot_leads' | 'lmia' });

  // Map hook handlers to component expectations or use hook directly where possible
  // The hook handles onChange, so we can just pass handleInputChange to input

  // Note: The hook's handleSearch takes (queryOverride?)
  // The component's handleSearch took (query = searchQuery)
  // We can wrap if needed, or just use hook's. Hook's handleSearch uses current input if no arg.

  // Re-implement specialized behavior if needed, or rely on hook.
  // SearchBar had: navigate.push, updateCreditsAndSearch, searchWithFuse.
  // The hook does: router.push, updateCreditsAndSearch, searchWithFuse.
  // It effectively replicates the logic.

  // One difference: SearchBar cleared Fuse search on clear. Hook does too.

  // Input Ref: Hook provides one. We can use it.

  // Suggestions Ref: Hook provides one.

  // Click Outside: Hook does NOT handle click outside (it's UI specific). We kept that? 
  // No, the previous code had useEffect for click outside. useJobSearch does NOT have it?
  // Let's check the hook again. 
  // Hook does NOT have click outside. We need to keep it in the component.

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [suggestionsRef, setShowSuggestions]); // Update dep array

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <motion.div
      className="relative w-full max-w-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex w-full">
        <div className="relative flex-grow flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onKeyDown={onKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search..."
            className="w-full h-8 pl-3 pr-8 text-sm bg-white border border-brand-100 border-r-0 rounded-l-md focus:outline-none focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500/30 transition-all duration-200"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <span className="h-8 border-l border-brand-100 mx-0" />
        <Select
          value={searchType}
          onValueChange={(value) => setSearchType(value)}
        >
          <SelectTrigger className="w-[110px] h-8 bg-white border border-brand-100 rounded-l-none border-l-0 rounded-r-md text-gray-500 font-medium focus:ring-0 focus:ring-offset-0 px-2 flex items-center shadow-none">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hot_leads">Trending</SelectItem>
            <SelectItem value="lmia">LMIA</SelectItem>
          </SelectContent>
        </Select>
        <motion.button
          onClick={() => handleSearch()}
          disabled={isChecking}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ml-2 h-8 px-3 bg-gradient-to-br from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 rounded-md flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <AnimatePresence mode="wait">
            {isChecking ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-4 w-4 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (searchQuery.trim() || isLoadingSuggestions) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-brand-100 overflow-hidden z-50"
          >
            <ScrollArea className="max-h-[200px]">
              {isLoadingSuggestions ? (
                <div className="p-2 space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 p-2"
                    >
                      <div className="p-1.5 rounded-full bg-brand-100">
                        <Skeleton className="w-3 h-3 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-32" />
                    </motion.div>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-2 hover:bg-brand-50 cursor-pointer transition-all duration-300"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-brand-100 group-hover:bg-brand-200 transition-colors">
                        <Search className="w-3 h-3 text-brand-600" />
                      </div>
                      <span className="text-xs text-zinc-600 group-hover:text-brand-600 transition-colors">
                        {suggestion.suggestion}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-2 text-center text-xs text-zinc-500">
                  No suggestions found
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
