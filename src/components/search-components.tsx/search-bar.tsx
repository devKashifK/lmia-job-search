"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Search, X } from "lucide-react";
import Fuse from "fuse.js";
import { useTableStore } from "@/context/store";

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const InputRef = useRef(null);
  const { searchWithFuse } = useTableStore();

  // const handleClear = () => {
  //   InputRef.current.value = "";
  // };

  const handleSearch = () => {
    searchWithFuse(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <div
      className={`relative  flex justify-center items-center  border rounded-sm h-9 overflow-hidden  transition-all duration-300 ease-in-out ${
        isExpanded ? "w-80" : "w-60"
      }`}
    >
      <Input
        ref={InputRef}
        className="peer outline-none  h-9 -pt-2 rounded-sm border-none focus:ring-0   focus-visible:ring-0 transition-all duration-300 ease-in-out"
        placeholder={isExpanded ? "Search with Noc code, Employee" : "Search"}
        type="text"
        onFocus={() => setIsExpanded(true)}
        onBlur={(e) => {
          if (!e.target.value) {
            setIsExpanded(false);
          }
        }}
        onChange={(e) => {
          if (e.target.value) {
            setIsExpanded(true);
            setSearchQuery(e.target.value);
          }
        }}
        onKeyDown={handleKeyPress}
      />

      <div className=" absolute inset-y-0  flex items-center justify-center right-3 text-muted-foreground/80  border-none focus:ring-0 cursor-pointer">
        {isExpanded ? (
          <X
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            className="cursor-pointer"
            // onClick={() => handleClear()}
          />
        ) : (
          <Search size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

export function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
