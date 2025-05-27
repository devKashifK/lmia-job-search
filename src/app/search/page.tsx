"use client";
import { Input } from "@/components/ui/input";
import { TypewriterEffect } from "@/components/ui/type-writter";
import { Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Footer from "@/pages/homepage/footer";
import Navbar from "../nabvar";
import { useUpdateCredits } from "@/hooks/use-credits";
import { useToast } from "@/hooks/use-toast";
import db from "@/db";
import { useSession } from "@/hooks/use-session";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchFeatures } from "@/components/search/features";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Category from "@/components/ui/category";
import { useTableStore } from "@/context/store";
import {
  applyDataConfig,
  applyFilterPanelConfig,
} from "@/components/ui/dynamic-data-view";
import { group } from "console";

export default function Page() {
  const [input, setInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<{ suggestion: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchType, setSearchType] = useState<"hot_leads" | "lmia">(
    "hot_leads"
  );
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { updateCreditsAndSearch } = useUpdateCredits();
  const navigate = useRouter();
  const { toast } = useToast();
  const { session } = useSession();
  const { setFilterPanelConfig, setDataConfig } = useTableStore();

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
      if (searchType === "hot_leads") {
        const { data, error } = await db.rpc("rpc_suggest_hot_leads_new", {
          term: query,
          p_limit: 10,
        });

        if (error) throw error;
        setSuggestions(data || []);
      } else if (searchType === "lmia") {
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
    setInput(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (!session?.session) {
      if (searchType === "hot_leads") {
        applyDataConfig(
          searchType,
          "hot_leads_new",
          suggestion,
          "rpc",
          setDataConfig
        );

        applyFilterPanelConfig(
          "job_title",
          searchType,
          "hot_leads_new",
          suggestion,
          "rpc",
          setFilterPanelConfig
        );
        navigate.push(`/search/hot-leads/${encodeURIComponent(suggestion)}`);
      } else if (searchType === "lmia") {
        applyDataConfig(searchType, "lmia", suggestion, "rpc", setDataConfig);

        applyFilterPanelConfig(
          "job_title",
          searchType,
          "lmia",
          suggestion,
          "rpc",
          setFilterPanelConfig
        );

        navigate.push(`/search/lmia/${encodeURIComponent(suggestion)}`);
      }
      return;
    }
    setInput(suggestion);
    setShowSuggestions(false);
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
      if (searchType === "hot_leads") {
        applyDataConfig(
          searchType,
          "hot_leads_new",
          input,
          "rpc",
          setDataConfig
        );

        applyFilterPanelConfig(
          "job_title",
          searchType,
          "hot_leads_new",
          input,
          "rpc",
          setFilterPanelConfig
        );

        navigate.push(`/search/hot-leads/${encodeURIComponent(input)}`);
      } else if (searchType === "lmia") {
        applyDataConfig(searchType, "lmia", input, "rpc", setDataConfig);

        applyFilterPanelConfig(
          "job_title",
          searchType,
          "lmia",
          input,
          "rpc",
          setFilterPanelConfig
        );

        navigate.push(`/search/lmia/${encodeURIComponent(input)}`);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // New function to handle trending search clicks
  const handleTrendingClick = async (term: string) => {
    setInput(term);
    setShowSuggestions(true);
    fetchSuggestions(term);

    setIsChecking(true);
    try {
      const hasCredits = await checkCredits();
      if (!hasCredits) return;

      await updateCreditsAndSearch(term);
      if (searchType === "hot_leads") {
        setDataConfig({
          type: "hot_leads",
          table: "hot_leads_new",
          columns: JSON.stringify([
            {
              job_title: term,
            },
          ]),
          keyword: term,
          method: "query",
          year: "",
          page: 1,
          pageSize: 100,
        });

        setFilterPanelConfig({
          column: "job_title",
          table: "hot_leads_new",
          keyword: term,
          type: "hot_leads",
          method: "query",
        });

        navigate.push(`/search/hot-leads/${encodeURIComponent(term)}`);
      } else if (searchType === "lmia") {
        setDataConfig({
          type: "lmia",
          table: "lmia",
          columns: JSON.stringify([
            {
              job_title: term,
            },
          ]),
          keyword: term,
          method: "query",
          year: "",
          page: 1,
          pageSize: 100,
        });
        setFilterPanelConfig({
          column: "job_title",
          table: "lmia",
          keyword: term,
          type: "lmia",
          method: "query",
        });
        navigate.push(`/search/lmia/${encodeURIComponent(term)}`);
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      startSearch();
    }
  };

  // Updated trending searches - added Cook, removed Remote Positions
  const trendingSearches =
    searchType === "hot_leads"
      ? [
          "Bookkeeper",
          "Cook",
          "Kitchen Helper",
          "Truck Driver",
          "Carpenter",
          "Baker",
        ]
      : [
          "Food Service Supervisors",
          "Cooks",
          "Retail Sales Supervisors",
          "Transport Truck Drivers",
        ];

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white min-h-screen">
      <Navbar className="" />

      <main className="pt-24 pb-16">
        {/* Hero section with animated background */}
        <div className="relative ">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-brand-300/5 to-transparent rounded-b-[50%] h-[500px] -z-10"></div>

          <motion.div
            className="absolute top-20 right-20 w-72 h-72 bg-brand-300/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-48 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              <Badge className="px-4 py-1.5 text-sm font-medium bg-brand-100 text-brand-800 hover:bg-brand-200 border-brand-200 mb-4">
                Find Top Opportunities
              </Badge>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight"
              >
                Discover{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700">
                  Perfect{" "}
                </span>
                <span>Career</span>
              </motion.h1>

              <div className="h-10">
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
            </div>

            {/* Search Input with surrounding glow */}
            <div className="w-full max-w-7xl mx-auto mt-8 relative flex flex-col gap-14">
              <div className="w-full max-w-3xl mx-auto ">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="relative group ">
                    {/* Remove the gradient glow effect */}
                    <div className="relative flex items-center bg-white rounded-full shadow-xl">
                      <div className="pl-5 pr-3 py-2 text-brand-500">
                        <Search className="w-6 h-6" />
                      </div>

                      <Input
                        ref={searchInputRef}
                        className="flex-1 border-0 bg-transparent text-lg py-6 h-16 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                        placeholder="Job title, company, or keyword..."
                        value={input}
                        onChange={handleChange}
                        onKeyDown={handleKeyPress}
                        onFocus={() => setShowSuggestions(true)}
                      />

                      <div className="flex items-center gap-2 mr-2">
                        <span className="h-8 border-l border-gray-300 mx-2" />
                        <Select
                          value={searchType}
                          onValueChange={(value: "hot_leads" | "lmia") =>
                            setSearchType(value)
                          }
                        >
                          <SelectTrigger className="w-[160px] bg-transparent border-none shadow-none text-gray-500 font-medium focus:ring-0 focus:ring-offset-0 px-2">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hot_leads">Hot Leads</SelectItem>
                            <SelectItem value="lmia">LMIA</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="h-8 border-l border-gray-300 mx-2" />

                        <motion.button
                          className="bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium px-6 py-3 rounded-full hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={startSearch}
                        >
                          {isChecking ? (
                            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Search"
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Trending searches */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <span className="text-sm text-gray-500 pt-1">
                        Trending:
                      </span>
                      {trendingSearches.map((term, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="bg-white/70 border-brand-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                          onClick={() => handleTrendingClick(term)}
                        >
                          {term}
                        </Button>
                      ))}
                    </div>

                    {/* Suggestions Dropdown - Put here directly where visible */}
                    {showSuggestions &&
                      (input.trim() || isLoadingSuggestions) && (
                        <div
                          ref={suggestionsRef}
                          className="absolute left-0 right-0 bg-white rounded-2xl shadow-2xl border border-brand-100  mt-4"
                          style={{ top: "46%", zIndex: 1000 }}
                        >
                          <ScrollArea className="max-h-[300px] z-[10000]">
                            {isLoadingSuggestions ? (
                              <div className="p-4 space-y-3">
                                {[...Array(4)].map((_, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-2"
                                  >
                                    <div className="p-2 rounded-full bg-brand-100">
                                      <Skeleton className="w-4 h-4 rounded-full" />
                                    </div>
                                    <Skeleton className="h-4 w-48" />
                                  </div>
                                ))}
                              </div>
                            ) : suggestions.length > 0 ? (
                              suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="group px-5 py-3 hover:bg-brand-50 cursor-pointer transition-all duration-300 border-b border-gray-100 last:border-b-0"
                                  onClick={() =>
                                    handleSuggestionClick(suggestion.suggestion)
                                  }
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-brand-100 group-hover:bg-brand-200 transition-colors">
                                      <Search className="w-4 h-4 text-brand-600" />
                                    </div>
                                    <span className="text-gray-800 group-hover:text-brand-600 transition-colors font-medium">
                                      {suggestion.suggestion}
                                    </span>
                                  </div>
                                  <div className="ml-11 text-sm text-gray-500 mt-1">
                                    Find jobs related to {suggestion.suggestion}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center text-gray-500">
                                No suggestions found
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      )}
                  </div>
                </motion.div>
              </div>
              <Category type={searchType} />
            </div>
          </div>
        </div>

        {/* Features section with animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-7xl mx-auto px-6"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Use Our Job Search?
            </h2>
            <p className="text-gray-600 mt-2">
              Discover what makes our platform different
            </p>
          </div>

          <SearchFeatures />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
