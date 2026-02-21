'use client';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUpdateCredits } from '@/hooks/use-credits';
import { useToast } from '@/hooks/use-toast';
import db from '@/db';
import { useSession } from '@/hooks/use-session';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobSearch } from '@/hooks/use-job-search';

interface CompactSearchProps {
  className?: string;
  placeholder?: string;
  defaultSearchType?: 'hot_leads' | 'lmia';
}

export default function CompactSearch({
  className = '',
  placeholder = 'Quick search...',
  defaultSearchType = 'hot_leads',
}: CompactSearchProps) {
  const {
    input,
    setInput,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isLoadingSuggestions,
    isSearching: isChecking,
    searchType,
    setSearchType,
    inputRef: searchInputRef, // Use matching ref name
    suggestionsRef,
    handleInputChange: handleChange,
    handleSearch,
    handleSuggestionClick,
  } = useJobSearch({ initialSearchType: defaultSearchType });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        if (!input.trim()) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [input, suggestionsRef, setShowSuggestions]);

  // Hook handles startSearch, which does: checkCredits -> updateCredits -> router.push.
  // CompactSearch had explicit "sp" (URLSearchParams) handling for 'field' and 't'.
  // The hook does: sp.set('field', searchBy). searchBy default is 'all'.
  // Hook does: sp.set('t', searchType...).
  // So the hook logic matches CompactSearch logic.

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
    setShowSuggestions(true);
    // manual trigger if input exists?
    // Hook uses debounce effect. If input exists, it should already have fetched or will fetch on change.
    // However, on Focus, if we want to show existing suggestions for existing input, the state 'suggestions' might be valid.
    // If we want to re-fetch:
    // fetchSuggestions(input); // fetchSuggestions is exposed from hook
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        layout
        className={`flex items-center bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-300 ${isExpanded ? 'shadow-md ring-1 ring-brand-500/20' : 'hover:shadow-md'
          }`}
        animate={{
          width: isExpanded ? '400px' : '260px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex items-center flex-1">
          <div className="pl-3 pr-2 text-gray-400">
            <Search className="w-4 h-4" />
          </div>

          <Input
            ref={searchInputRef}
            className="flex-1 border-0 bg-transparent text-sm py-2 h-8 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
            placeholder={placeholder}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            onFocus={handleFocus}
          />
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center border-l border-gray-200"
            >
              <Select
                value={searchType}
                onValueChange={(value: 'hot_leads' | 'lmia') =>
                  setSearchType(value)
                }
              >
                <SelectTrigger className="w-[90px] h-8 bg-transparent border-none shadow-none text-gray-500 text-xs px-2 focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot_leads">Trending Jobs</SelectItem>
                  <SelectItem value="lmia">LMIA</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                onClick={() => handleSearch()}
                disabled={isChecking}
                className="h-6 px-2 mr-2 text-xs bg-brand-500 hover:bg-brand-600 text-white rounded"
              >
                {isChecking ? (
                  <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Go'
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions &&
          isExpanded &&
          (input.trim() || isLoadingSuggestions) && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              <ScrollArea className="max-h-[200px]">
                {isLoadingSuggestions ? (
                  <div className="p-3 space-y-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center gap-2 p-1">
                        <div className="p-1 rounded bg-brand-100">
                          <Skeleton className="w-3 h-3 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="group px-3 py-2 hover:bg-brand-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-brand-100 group-hover:bg-brand-200 transition-colors">
                          <Search className="w-3 h-3 text-brand-600" />
                        </div>
                        <span className="text-sm text-gray-800 group-hover:text-brand-600 transition-colors truncate">
                          {suggestion.suggestion}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No suggestions found
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
