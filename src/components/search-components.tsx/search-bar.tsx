"use client";
import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTableStore } from "@/context/store";
import { toast } from "@/hooks/use-toast";
import db from "@/db";
import { useRouter } from "next/navigation";
import { useUpdateCredits } from "@/hooks/use-credits";
import { motion, AnimatePresence } from "framer-motion";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const { searchWithFuse } = useTableStore();
  const { updateCreditsAndSearch } = useUpdateCredits();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useRouter();

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
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

      await updateCreditsAndSearch(searchQuery);
      searchWithFuse(searchQuery);

      const { data: updatedCredits } = await db
        .from("credits")
        .select("total_credit, used_credit")
        .single();

      const remainingCredits = updatedCredits
        ? updatedCredits.total_credit - (updatedCredits.used_credit || 0)
        : 0;

      toast({
        title: "Search Initiated",
        description: `Search started for "${searchQuery}". You have ${remainingCredits} credits remaining.`,
        variant: "success",
      });

      navigate.push(`/search/${searchQuery}`);
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
    searchWithFuse("");
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
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search..."
            className="w-full h-7 pl-8 pr-8 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200"
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
          onClick={handleSearch}
          disabled={isChecking}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-7 px-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 rounded-md flex items-center justify-center transition-colors"
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
    </motion.div>
  );
}
