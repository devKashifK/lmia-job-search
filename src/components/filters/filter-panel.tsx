"use client";
import React, { useMemo, useState } from "react";
import { useFilterAttributes } from "@/hooks/use-attribute";
import { AttributeName, snakeCaseToTitleCase } from "@/helpers/attribute";
import {
  ListChecks,
  X,
  Search,
  CheckCircle,
  Circle,
  SlidersHorizontal,
  Plus,
  Minus,
} from "lucide-react";
import { useTableStore } from "@/context/store";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { hotLeadsColumns, lmiaColumns } from "./column-def";

type Tab = "filters" | "applied";

export default function FilterPanel({ type }: { type: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("filters");
  const [searchQuery, setSearchQuery] = useState("");
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const {
    filters,
    clearAllFilters,
    setShowFilterPanel,
    clearSingleFilter,
    clearFilter,
    showFilterPanel,
  } = useTableStore();

  const totalFilters = Object.values(filters || {}).reduce(
    (acc, set) => acc + set.size,
    0
  );

  const columns = useMemo(() => {
    if (type == "hot_leads") {
      return hotLeadsColumns;
    }
    return lmiaColumns;
  }, [type]);

  const fuse = new Fuse(columns, {
    keys: ["accessorKey"],
    threshold: 0.4,
  });

  const filteredColumns = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : columns;

  const defaultOpenValue = filteredColumns[0]?.accessorKey;

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-lg border-r border-zinc-200/50 overflow-hidden w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2.5 border-b border-zinc-100 bg-gradient-to-r from-brand-100 via-brand-50 to-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-brand-200 rounded-md">
              <SlidersHorizontal className="h-3.5 w-3.5 text-brand-700" />
            </div>
            <div>
              <h2 className="font-medium text-black text-sm">Filters</h2>
              <p className="text-[10px] text-zinc-700">
                {totalFilters} active filter{totalFilters !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-medium text-zinc-800 hover:text-brand-800 transition-colors duration-200"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setShowFilterPanel(false)}
              className="p-1 hover:bg-brand-100 rounded-md transition-colors duration-200"
            >
              <X className="h-3.5 w-3.5 text-zinc-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 p-2 border-b border-zinc-100">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filters..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-zinc-50/80 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 transition-all duration-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-zinc-100">
        <button
          onClick={() => setActiveTab("filters")}
          className={cn(
            "flex-1 px-4 py-2 text-xs font-medium transition-colors relative",
            activeTab === "filters"
              ? "text-brand-800"
              : "text-zinc-700 hover:text-zinc-900"
          )}
        >
          Filters
          {activeTab === "filters" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("applied")}
          className={cn(
            "flex-1 px-4 py-2 text-xs font-medium transition-colors relative",
            activeTab === "applied"
              ? "text-brand-800"
              : "text-zinc-700 hover:text-zinc-900"
          )}
        >
          Applied
          {totalFilters > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-brand-400 text-white rounded-full">
              {totalFilters}
            </span>
          )}
          {activeTab === "applied" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "filters" ? (
          <Accordion type="multiple" className="w-full">
            {filteredColumns.map((column) => (
              <AccordionItem
                key={column?.accessorKey ?? column?.field ?? String(column)}
                value={column?.accessorKey ?? column?.field ?? String(column)}
                className="border-b border-zinc-100"
              >
                <AccordionTrigger
                  className="px-3 py-2 hover:bg-brand-100/80 transition-all duration-200"
                  onClick={() => {
                    const value =
                      column?.accessorKey ?? column?.field ?? String(column);
                    setOpenAccordions((prev) => {
                      const next = new Set(prev);
                      if (next.has(value)) {
                        next.delete(value);
                      } else {
                        next.add(value);
                      }
                      return next;
                    });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-zinc-600 group-hover:text-brand-800 transition-colors duration-200">
                      {column?.icon}
                    </div>
                    <div className="flex flex-col items-start">
                      <AttributeName
                        name={column?.accessorKey ?? column?.field ?? ""}
                        className="text-xs text-black group-hover:text-zinc-900"
                      />
                      {filters[column?.accessorKey]?.size > 0 && (
                        <span className="text-[10px] text-brand-800 font-medium">
                          {filters[column?.accessorKey].size} selected
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {openAccordions.has(
                      column?.accessorKey ?? column?.field ?? String(column)
                    ) ? (
                      <Minus className="h-4 w-4 shrink-0 text-brand-600 transition-transform duration-200" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0">
                  <FilterAccordionContent column={column} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="p-2">
            {totalFilters > 0 ? (
              <div className="space-y-2">
                {Object.entries(filters).map(
                  ([key, values]) =>
                    values.size > 0 && (
                      <div
                        key={key}
                        className="bg-gradient-to-r from-brand-100 to-white rounded-lg p-2"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-zinc-800">
                            {snakeCaseToTitleCase(key)}
                          </span>
                          <button
                            onClick={() => clearFilter(key)}
                            className="text-[10px] font-medium text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(values).map((value) => (
                            <Badge
                              key={`${key}-${value}`}
                              variant="secondary"
                              className="group px-2 py-0.5 text-[10px] font-normal bg-white hover:bg-red-50"
                            >
                              <span className="text-zinc-700">{value}</span>
                              <button
                                onClick={() => clearSingleFilter(key, value)}
                                className="ml-1 text-zinc-300 group-hover:text-red-500 transition-colors"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                <ListChecks className="h-8 w-8 mb-2" />
                <span className="text-sm">No filters applied</span>
                <button
                  onClick={() => setActiveTab("filters")}
                  className="text-xs text-brand-600 hover:text-brand-700 mt-1"
                >
                  Add filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-zinc-100 bg-gradient-to-r from-brand-100 via-brand-50 to-white text-xs text-zinc-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-700" />
          <span className="hidden sm:inline">
            Tip: Combine multiple filters for precise results.
          </span>
        </div>
        <a
          href="#"
          className="text-brand-800 hover:underline hover:text-brand-900 font-medium transition-colors text-xs"
          tabIndex={0}
        >
          Help
        </a>
      </div>
    </div>
  );
}

function FilterAccordionContent({ column }: { column: any }) {
  const attributes = useFilterAttributes(column?.accessorKey);
  const { updateFilter, filters, clearFilter } = useTableStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const fuse = new Fuse(attributes, {
    keys: ["value"],
    threshold: 0.4,
  });

  const filteredAttributes = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : attributes;

  const selectedCount = (filters && filters[column?.accessorKey]?.size) || 0;

  const handleFilterUpdate = (accessorKey: string, value: string) => {
    updateFilter(accessorKey, value);
    // toast({
    //   title: "Filter updated",
    //   description: `${value} ${
    //     filters[accessorKey]?.has(value) ? "removed from" : "added to"
    //   } ${snakeCaseToTitleCase(accessorKey)}`,
    //   variant: "info",
    //   duration: 2000,
    // });
  };

  const handleClearFilter = () => {
    clearFilter(column.accessorKey);
    toast({
      title: "Filters cleared",
      description: `Cleared all ${snakeCaseToTitleCase(
        column.accessorKey
      )} filters`,
      variant: "info",
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col">
      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-zinc-50/80 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 transition-all duration-200"
          />
        </div>
      </div>

      {/* Filter Options */}
      <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent p-1.5 space-y-0.5">
        {filteredAttributes.map((item) => (
          <div
            key={item.value}
            role="button"
            tabIndex={0}
            onClick={() => handleFilterUpdate(column.accessorKey, item.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleFilterUpdate(column.accessorKey, item.value);
              }
            }}
            className={cn(
              "group flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-200 cursor-pointer",
              "hover:bg-brand-100/80 active:bg-brand-200",
              filters[column.accessorKey]?.has(item.value)
                ? "bg-brand-100 text-brand-700"
                : "text-zinc-700"
            )}
          >
            <div className="w-3.5 h-3.5 flex-shrink-0">
              {filters[column.accessorKey]?.has(item.value) ? (
                <CheckCircle className="h-3.5 w-3.5 text-brand-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
              )}
            </div>
            <span className="truncate flex-1 text-black">{item.value}</span>
            {filters[column.accessorKey]?.has(item.value) && (
              <span className="text-[10px] text-brand-600/70 group-hover:text-brand-600">
                selected
              </span>
            )}
          </div>
        ))}
        {filteredAttributes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-zinc-400">
            <Search className="h-4 w-4 mb-1" />
            <span className="text-[10px]">No matching values found</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-zinc-100 bg-gradient-to-b from-brand-50 to-white">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-600">
            {filteredAttributes.length} total values
          </span>
          {selectedCount > 0 && (
            <button
              onClick={handleClearFilter}
              className="text-[10px] font-medium text-zinc-600 hover:text-red-500 transition-colors duration-200"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
