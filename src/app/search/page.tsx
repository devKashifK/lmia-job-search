"use client";
import { Input } from "@/components/ui/input";
import { TypewriterEffect } from "@/components/ui/type-writter";
import { Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Footer from "@/pages/homepage/footer";
import Navbar from "../nabvar";
import { useUpdateCredits } from "@/hooks/use-credits";
import { useToast } from "@/hooks/use-toast";
import db from "@/db";
import { useSession } from "@/hooks/use-session";
import { ScrollArea } from "@/components/ui/scroll-area";
import BackgroundWrapper from "@/components/ui/background-wrapper";
import { SearchFeatures } from "@/components/search/features";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const [input, setInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<{ suggestion: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
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
      const { data, error } = await db.rpc("rpc_search_hot_leads_suggestions", {
        term: query,
        p_limit: 20,
        branch_lim: 100,
      });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
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

  const handleSuggestionClick = async (suggestion: string) => {
    if (!session?.session) {
      navigate.push(`/search/${encodeURIComponent(suggestion)}`);
      return;
    }
    setInput(suggestion);
    setShowSuggestions(false);
    try {
      const hasCredits = await checkCredits();
      if (!hasCredits) return;

      await updateCreditsAndSearch(input);
      navigate.push(`/search/${encodeURIComponent(suggestion)}`);
    } finally {
      setIsChecking(false);
    }
  };

  const checkCredits = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: credits, error } = await db
        .from("credits")
        .select("total_credit, used_credit")
        .eq("id", session.user.id)
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
        navigate.push("/dashboard/credits"); // Redirect to credits page
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

  const startSearch = async () => {
    if (!input.trim()) {
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

      await updateCreditsAndSearch(input);
      navigate.push(`/search/${encodeURIComponent(input)}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      startSearch();
    }
  };

  return (
    <BackgroundWrapper>
      <div className="flex flex-col min-h-[130vh]">
        <Navbar className="" />

        <main className="flex-1 flex items-center justify-center px-4 min-h-screen py-28 mt-8">
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center gap-12">
            {/* Title Section */}
            <div className="text-center space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl font-bold text-gray-900"
              >
                Find Your Next Opportunity
              </motion.h1>
              <TypewriterEffect
                title="Search With"
                words={[
                  "Noc Code",
                  "Program",
                  "Employer",
                  "Address",
                  "Occupation",
                  "City",
                  "Employer Name",
                  "Province Mapping",
                  "",
                ]}
              />
            </div>

            {/* Search Input */}
            <motion.div
              className="w-full max-w-3xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300" />
                <Input
                  className="w-full rounded-full py-6 text-xl h-16 focus-visible:ring-orange-600 pl-6 pr-16 shadow-lg bg-white/90 backdrop-blur-sm border-orange-100 group-hover:border-orange-200 transition duration-300"
                  placeholder="Start Your Search ..."
                  value={input}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                />
                <motion.button
                  className="absolute top-2 right-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-3 cursor-pointer shadow-lg hover:shadow-orange-500/25 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startSearch}
                >
                  {isChecking ? (
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-6 h-6 text-white" />
                  )}
                </motion.button>
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (input.trim() || isLoadingSuggestions) && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 overflow-hidden z-50"
                  >
                    <ScrollArea className="max-h-[300px]">
                      {isLoadingSuggestions ? (
                        <div className="p-4 space-y-3">
                          {[...Array(4)].map((_, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-3 p-2"
                            >
                              <div className="p-2 rounded-full bg-orange-100">
                                <Skeleton className="w-4 h-4 rounded-full" />
                              </div>
                              <Skeleton className="h-4 w-48" />
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
                            className="group p-4 hover:bg-orange-50 cursor-pointer transition-all duration-300"
                            onClick={() =>
                              handleSuggestionClick(suggestion.suggestion)
                            }
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors">
                                <Search className="w-4 h-4 text-orange-600" />
                              </div>
                              <span className="text-gray-800 group-hover:text-orange-600 transition-colors">
                                {suggestion.suggestion}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          No suggestions found
                        </div>
                      )}
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Features Grid */}
            <SearchFeatures />
          </div>
        </main>

        <Footer />
      </div>
    </BackgroundWrapper>
  );
}
