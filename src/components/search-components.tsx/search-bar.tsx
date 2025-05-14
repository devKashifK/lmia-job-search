"use client";
import { useRef, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useTableStore } from "@/context/store";
import { toast } from "@/hooks/use-toast";
import db from "@/db";
import { useRouter } from "next/navigation";
import { useUpdateCredits } from "@/hooks/use-credits";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchBar({ type }: { type: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<{ suggestion: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { searchWithFuse } = useTableStore();
  const { updateCreditsAndSearch } = useUpdateCredits();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      if (type == "hot_leads") {
        const { data, error } = await db.rpc("rpc_suggest_hot_leads_new", {
          term: query,
          p_limit: 10,
        });

        if (error) throw error;
        setSuggestions(data || []);
      } else {
        const { data, error } = await db.rpc("rpc_suggest_lmia", {
          term: query,
          p_limit: 10,
        });

        if (error) throw error;
        setSuggestions(data || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    await handleSearch(suggestion);
  };

  const checkCredits = async () => {
    try {
      const { data: credits, error } = await db
        .from("credits")
        .select("total_credit, used_credit")
        .single();

      if (error) throw error;

      if (!credits) {
        toast({
          title: "Error",
          description: "Unable to fetch credits information",
          variant: "destructive",
        });
        return false;
      }

      const remainingCredits =
        credits.total_credit - (credits.used_credit || 0);

      if (remainingCredits <= 0) {
        toast({
          title: "No Credits Remaining",
          description:
            "You've used all your credits. Please purchase more to continue searching.",
          variant: "destructive",
        });
        navigate.push("/dashboard/credits");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking credits:", error);
      toast({
        title: "Error",
        description: "Unable to verify credits. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    try {
      const hasCredits = await checkCredits();
      if (!hasCredits) return;

      await updateCreditsAndSearch(query);
      searchWithFuse(query, type);

      const { data: updatedCredits } = await db
        .from("credits")
        .select("total_credit, used_credit")
        .single();

      const remainingCredits = updatedCredits
        ? updatedCredits.total_credit - (updatedCredits.used_credit || 0)
        : 0;

      toast({
        title: "Search Initiated",
        description: `Search started for "${query}". You have ${remainingCredits} credits remaining.`,
        variant: "success",
      });

      if (type == "hot_leads") {
        navigate.push(`/search/${query}`);
      } else {
        navigate.push(`/lmia/${query}`);
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    searchWithFuse("", type);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <motion.div
      className="relative w-64"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex items-center gap-2">
        <motion.div
          className="relative flex-1"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-md blur-sm group-hover:opacity-40 transition duration-300" />
          {/* <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black" /> */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search..."
            className="relative w-full h-8 pl-4 pr-8 text-xs bg-white/90 backdrop-blur-sm border border-orange-100 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200"
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
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.button
          onClick={() => handleSearch()}
          disabled={isChecking}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-7 px-2 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 rounded-md flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <AnimatePresence mode="wait">
            {isChecking ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-3.5 w-3.5 text-white" />
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
            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-orange-100 overflow-hidden z-50"
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
                      <div className="p-1.5 rounded-full bg-orange-100">
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
                    className="group p-2 hover:bg-orange-50 cursor-pointer transition-all duration-300"
                    onClick={() => handleSuggestionClick(suggestion.suggestion)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                        <Search className="w-3 h-3 text-orange-600" />
                      </div>
                      <span className="text-xs text-zinc-600 group-hover:text-orange-600 transition-colors">
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
