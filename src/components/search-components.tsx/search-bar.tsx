"use client";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTableStore } from "@/context/store";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { searchWithFuse } = useTableStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    searchWithFuse(value);
  };

  const handleClear = () => {
    setSearchQuery("");
    searchWithFuse("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-64">
      <div className="relative flex items-center">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search..."
          className="w-full h-7 pl-8 pr-8 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500/30"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
