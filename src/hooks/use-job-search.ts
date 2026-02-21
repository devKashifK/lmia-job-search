
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { useUpdateCredits } from '@/hooks/use-credits';
import { useToast } from '@/hooks/use-toast';
import { useTableStore } from '@/context/store';
import { useCheckCredits } from '@/hooks/use-check-credits';
import { trackSearch } from '@/utils/track-search';
import { useDebounce } from '@/hooks/use-debounce';

export interface Suggestion {
    suggestion: string;
    field?: string;
    hits?: number;
}


interface UseJobSearchProps {
    initialSearchType?: 'hot_leads' | 'lmia';
    onSearchComplete?: () => void;
}

export function useJobSearch({ initialSearchType = 'hot_leads', onSearchComplete }: UseJobSearchProps = {}) {
    // State
    const [input, setInput] = useState('');
    const [searchType, setSearchType] = useState<'hot_leads' | 'lmia'>(initialSearchType as 'hot_leads' | 'lmia'); // Type as string to match initialSearchType generic or force cast?
    // Better:
    // const [searchType, setSearchType] = useState<'hot_leads' | 'lmia'>((initialSearchType as 'hot_leads' | 'lmia') || 'hot_leads'); 

    // Actually, let's keep it string to be safe but cast where needed OR fix the type definition.
    // UseJobSearchProps: initialSearchType?: 'hot_leads' | 'lmia' | string;

    // Let's just fix the hook state type if we can.

    // If I change line 27:
    // const [searchType, setSearchType] = useState<string>(initialSearchType);
    // to
    // const [searchType, setSearchType] = useState(initialSearchType);
    // It infers string.

    // Let's force it to be compatible.
    // The components expect 'hot_leads' | 'lmia'.

    // I will change the type in the hook.
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchBy, setSearchBy] = useState<'all' | 'job_title' | 'category' | 'noc_code' | 'employer' | 'city'>('all'); // Added for SearchBox compatibility

    // Hooks
    const router = useRouter();
    const searchParams = useSearchParams();
    const sp = new URLSearchParams(searchParams?.toString() || '');
    const { session } = useSession();
    const { updateCreditsAndSearch } = useUpdateCredits();
    const { toast } = useToast();
    const { searchWithFuse } = useTableStore();
    const { checkCredits } = useCheckCredits();
    const debouncedInput = useDebounce(input, 300);

    // Refs
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Fetch Suggestions
    const fetchSuggestions = async (query: string) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        setIsLoadingSuggestions(true);
        try {
            // Import dynamically or at top level. Top level is better.
            // But for now let's assume imports.
            // Actually, I should add imports first.

            let data: Suggestion[] = [];
            if (searchType === 'hot_leads') {
                const { suggestTrending } = await import('@/lib/api/suggestions');
                data = await suggestTrending(query, searchBy || 'all');
            } else {
                const { suggestLmia } = await import('@/lib/api/suggestions');
                data = await suggestLmia(query, searchBy || 'all');
            }

            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    // Effect for Debounce
    useEffect(() => {
        if (debouncedInput.trim()) {
            void fetchSuggestions(debouncedInput);
        } else {
            setSuggestions([]);
        }
    }, [debouncedInput, searchType, searchBy]);


    // Handle Search Execution
    const handleSearch = async (queryOverride?: string, options?: any) => {
        const query = queryOverride || input;

        if (!query.trim()) {
            // Allow empty search if specific filters are applied (handled in components mostly)
            // For general search bar, warn.
            if (!options?.allowEmpty) {
                toast({
                    title: 'Empty Search',
                    description: 'Please enter a search term',
                    variant: 'destructive',
                });
                return;
            }
        }

        setIsSearching(true);
        try {
            const hasCredits = await checkCredits();
            if (!hasCredits) return;

            await updateCreditsAndSearch(query);

            // Update URL Params
            sp.set('field', searchBy); // Default or selected field

            // SearchBar specific: Fuse search update
            searchWithFuse(query, searchType);

            // Constants and Navigation
            const base = searchType === 'hot_leads'
                ? `/search/hot-leads/${encodeURIComponent(query)}`
                : `/search/lmia/${encodeURIComponent(query)}`;

            sp.set('t', searchType === 'hot_leads' ? 'trending_job' : 'lmia');

            if (options?.extraParams) {
                Object.entries(options.extraParams).forEach(([k, v]) => {
                    if (v) sp.set(k, v as string);
                });
            }

            router.push(sp.toString() ? `${base}?${sp.toString()}` : base);

            // Tracking
            if (session?.user?.id) {
                void trackSearch({
                    id: session.user.id,
                    keyword: query,
                    filters: { search_type: searchType, search_by: searchBy, ...options?.filters }
                });
            }

            if (onSearchComplete) onSearchComplete();

        } catch (error) {
            console.error("Search failed", error);
            toast({
                title: 'Search Failed',
                description: 'An error occurred while searching. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSearching(false);
            setShowSuggestions(false);
        }
    };

    // Input Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (s: Suggestion) => {
        setInput(s.suggestion);
        // Optional: Set searchBy if suggestion has field info
        if (s.field) setSearchBy(s.field as any);

        handleSearch(s.suggestion);
    };

    const handleClear = () => {
        setInput('');
        setSuggestions([]);
        setShowSuggestions(false);
        searchWithFuse('', searchType);
        inputRef.current?.focus();
    };

    return {
        input,
        setInput,
        searchType,
        setSearchType,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        isLoadingSuggestions,
        isSearching,
        searchBy,
        setSearchBy,
        inputRef,
        suggestionsRef,
        handleInputChange,
        handleSearch,
        handleSuggestionClick,
        handleClear,
        fetchSuggestions, // Exposed if manual trigger needed
        setIsSearching, // Expose for custom search implementations
        setSuggestions // Exposed for manual clearing (e.g. on tab change)
    };
}
