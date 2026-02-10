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
  const [input, setInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { suggestion: string; field?: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchType, setSearchType] = useState<'hot_leads' | 'lmia'>(
    defaultSearchType
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const searchParams = useSearchParams();
  const sp = new URLSearchParams(searchParams?.toString() || '');
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { updateCreditsAndSearch } = useUpdateCredits();
  const navigate = useRouter();
  const { toast } = useToast();
  const { session } = useSession();

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
  }, [input]);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      if (searchType === 'hot_leads') {
        const { data, error } = await db.rpc('suggest_trending_job', {
          p_field: 'all',
          p_q: query,
          p_limit: 6,
        });

        if (error) throw error;
        setSuggestions(data || []);
      } else if (searchType === 'lmia') {
        const { data, error } = await db.rpc('suggest_lmia', {
          p_field: 'all',
          p_q: query,
          p_limit: 6,
        });
        if (error) throw error;
        setSuggestions(data || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = async (suggestion: {
    suggestion: string;
    field?: string;
  }) => {
    if (!session?.session) {
      updateCreditsAndSearch(suggestion.suggestion);
      if (searchType === 'hot_leads') {
        sp.set('field', suggestion.field ?? 'all');
        sp.set('t', 'trending_job');
        navigate.push(
          `/search/hot-leads/${encodeURIComponent(
            suggestion.suggestion
          )}?${sp.toString()}`
        );
      } else if (searchType === 'lmia') {
        sp.set('field', suggestion.field ?? 'all');
        sp.set('t', 'lmia');
        navigate.push(
          `/search/lmia/${encodeURIComponent(
            suggestion.suggestion
          )}?${sp.toString()}`
        );
      }
      return;
    }
    setInput(suggestion.suggestion);
    setShowSuggestions(false);
    startSearch(suggestion.suggestion);
  };

  const checkCredits = async () => {
    if (session?.trial) {
      // Trial session, allow access
      return true;
    }
    if (!session?.user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to perform this action',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data: credits, error } = await db
        .from('credits')
        .select('total_credit, used_credit')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (!credits) {
        toast({
          title: 'Error',
          description: 'Unable to fetch credits information',
          variant: 'destructive',
        });
        return false;
      }

      const remainingCredits =
        credits.total_credit - (credits.used_credit || 0);

      if (remainingCredits <= 0) {
        toast({
          title: 'No Credits Remaining',
          description:
            "You've used all your credits. Please purchase more to continue searching.",
          variant: 'destructive',
        });
        navigate.push('/dashboard/credits');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking credits:', error);
      toast({
        title: 'Error',
        description: 'Unable to verify credits. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const startSearch = async (searchTerm?: string) => {
    const query = searchTerm || input;
    if (!query.trim()) {
      toast({
        title: 'Empty Search',
        description: 'Please enter a search term',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    try {
      const hasCredits = await checkCredits();
      if (!hasCredits) return;

      await updateCreditsAndSearch(query);
      if (searchType === 'hot_leads') {
        sp.set('field', 'all');
        sp.set('t', 'trending_job');
        navigate.push(
          `/search/hot-leads/${encodeURIComponent(query)}?${sp.toString()}`
        );
      } else if (searchType === 'lmia') {
        sp.set('field', 'all');
        sp.set('t', 'lmia');
        navigate.push(
          `/search/lmia/${encodeURIComponent(query)}?${sp.toString()}`
        );
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      startSearch();
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
    setShowSuggestions(true);
    if (input.trim()) {
      fetchSuggestions(input);
    }
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
                onClick={() => startSearch()}
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
