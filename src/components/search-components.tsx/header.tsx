"use client";
import {
  Binoculars,
  Blend,
  BookmarkMinus,
  Building2,
  FileDown,
  FilterIcon,
  ListOrdered,
  Save,
  SearchCheck,
} from "lucide-react";
import { Button } from "../ui/button";
import { SearchBar } from "./search-bar";

import { Filter } from "../filters/filter";
import { useTableStore } from "@/context/store";
import { cn } from "@/lib/utils";

export default function Header({ keywords }: { keywords: string }) {
  const filteredData = useTableStore((state) => state.filteredData);
  const showFilterPanel = useTableStore((state) => state.showFilterPanel);
  const setShowFilterPanel = useTableStore((state) => state.setShowFilterPanel);
  return (
    <nav className="flex items-center justify-between px-4 py-0 bg-active">
      <div className="flex space-x-4">
        <a
          href="#"
          className="flex items-center px-3 py-3 text-sm text-blue-800 border-b-2 border-blue-800"
        >
          <SearchCheck className="w-4 h-4 mr-2" />
          <div className="flex gap-2 justify-center items-center">
            <span>
              {keywords} {"  "} -{" "}
            </span>
            <span className="bg-blue-200 text-blue-800 text-xs rounded-sm w-6 h-6 relative flex justify-center items-center">
              {filteredData.length}
            </span>
          </div>
        </a>
        {/* <a
          href="#"
          className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-blue-800"
        >
          <Building2 className="w-4 h-4 mr-2" />
          <span>Companies</span>
        </a>
       */}
        <div
          className={cn(
            "flex items-center px-3 py-3 text-sm text-gray-600 hover:text-blue-800 cursor-pointer",
            showFilterPanel && "text-blue-800 border-b-2 border-blue-800"
          )}
          onClick={setShowFilterPanel}
        >
          <Blend className="w-4 h-4 mr-2" />
          <span>Filters</span>
        </div>
        <a
          href="#"
          className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-blue-800"
        >
          <Binoculars className="w-4 h-4 mr-2" />
          <span>Recent Searches</span>
        </a>
        <a
          href="#"
          className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-blue-800"
        >
          <BookmarkMinus className="w-4 h-4 mr-2" />
          <span>Saved Searches</span>
        </a>
      </div>
      <div className="flex space-x-4 items-center">
        <SearchBar />
        <Filter />
        <Export />
        <SaveSearch />
      </div>
    </nav>
  );
}

export function Export() {
  return (
    <div className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-blue-800 cursor-pointer">
      <FileDown className="w-4 h-4 mr-2" />
      Export
    </div>
  );
}

export function SaveSearch() {
  return (
    <div className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-blue-800 cursor-pointer">
      <Save className="w-4 h-4 mr-2" />
      Save
    </div>
  );
}
