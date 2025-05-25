"use client";

import { FilterX, X } from "lucide-react";
import { useTableStore } from "@/context/store";
import { useState, cloneElement } from "react";
import { columns } from "./column-def";
import { useFilterAttributes } from "@/hooks/use-attribute";
import { cn } from "@/lib/utils";
import { snakeCaseToTitleCase } from "@/helpers/attribute";
import { ChevronDown, Search, ListFilter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Filter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"filters" | "applied">("filters");
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const { filters, clearFilter, clearAllFilters } = useTableStore();

  const totalFiltersApplied = Object.values(filters).reduce(
    (acc, filter) => acc + (filter?.size || 0),
    0
  );

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all duration-200",
          isOpen
            ? "bg-brand-50 text-brand-600 shadow-sm font-medium"
            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
        )}
      >
        <FilterX className="w-3.5 h-3.5" />
        <span className="font-medium">Advanced</span>
        {totalFiltersApplied > 0 && (
          <span className="px-1.5 py-0.5 bg-brand-100 text-brand-600 rounded-full text-[10px] font-medium">
            {totalFiltersApplied}
          </span>
        )}
      </button>

      {/* Popover Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-lg border border-zinc-200 overflow-hidden z-50"
          >
            {/* Header Tabs */}
            <div className="grid grid-cols-2 p-1 gap-1 bg-zinc-50/80">
              <button
                onClick={() => setActiveTab("filters")}
                className={cn(
                  "py-1.5 text-xs font-medium rounded transition-colors",
                  activeTab === "filters"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-zinc-600 hover:bg-white/60"
                )}
              >
                Filters
              </button>
              <button
                onClick={() => setActiveTab("applied")}
                className={cn(
                  "py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5",
                  activeTab === "applied"
                    ? "bg-white text-brand-600 shadow-sm"
                    : "text-zinc-600 hover:bg-white/60"
                )}
              >
                Applied
                {totalFiltersApplied > 0 && (
                  <span className="px-1.5 bg-brand-100 rounded-full text-[10px]">
                    {totalFiltersApplied}
                  </span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-1">
              {activeTab === "filters" ? (
                <div className="max-h-[400px] overflow-y-auto hide-scrollbar rounded-md bg-zinc-50">
                  {columns.map((column) => (
                    <FilterAttribute
                      key={column.accessorKey}
                      column={column}
                      isOpen={activeAccordion === column.accessorKey}
                      onToggle={() => {
                        setActiveAccordion(
                          activeAccordion === column.accessorKey
                            ? null
                            : column.accessorKey
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <AppliedFilters />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterAttribute = ({ column, isOpen, onToggle }) => {
  const attributes = useFilterAttributes(column.accessorKey);
  const { updateFilter, filters } = useTableStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttributes = attributes.filter((item) =>
    item.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = filters[column.accessorKey]?.size || 0;

  return (
    <div className="bg-white rounded-md mb-1 last:mb-0 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-1.5 px-2 hover:bg-zinc-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center rounded bg-zinc-100/80 text-zinc-500">
            {cloneElement(column.icon, { className: "w-3 h-3" })}
          </div>
          <span className="text-[11px] font-medium text-zinc-700">
            {snakeCaseToTitleCase(column.accessorKey)}
          </span>
          {selectedCount > 0 && (
            <span className="px-1.5 py-0.5 bg-brand-50 rounded-full text-[10px] font-medium text-brand-600 min-w-[18px] text-center">
              {selectedCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-zinc-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-zinc-100"
          >
            <div className="p-2 bg-zinc-50">
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-7 pl-7 pr-2 text-xs bg-white border border-zinc-200 rounded focus:outline-none focus:border-brand-500/30 focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
                {filteredAttributes.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => updateFilter(column.accessorKey, item.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors",
                      filters[column.accessorKey]?.has(item.value)
                        ? "bg-white text-brand-600 shadow-sm font-medium"
                        : "hover:bg-white text-zinc-600"
                    )}
                  >
                    <span className="text-left">{item.value}</span>
                    <span className="text-[10px] text-zinc-400">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AppliedFilters = () => {
  const { filters, clearFilter, updateFilter, clearAllFilters } =
    useTableStore();
  const appliedFilters = Object.entries(filters).filter(
    ([_, values]) => values?.size > 0
  );

  if (appliedFilters.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <ListFilter className="w-5 h-5 text-zinc-300 mx-auto mb-2" />
        <p className="text-xs text-zinc-400">No filters applied</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-[400px] overflow-y-auto p-1">
      {appliedFilters.map(([key, values]) => (
        <div
          key={key}
          className="bg-white rounded-md shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-zinc-100">
            <div className="w-5 h-5 flex items-center justify-center rounded bg-zinc-100/80 text-zinc-500">
              {cloneElement(
                columns.find((col) => col.accessorKey === key)?.icon,
                {
                  className: "w-3 h-3",
                }
              )}
            </div>
            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-zinc-700 truncate">
                  {snakeCaseToTitleCase(key)}
                </span>
                <span className="shrink-0 px-1.5 py-0.5 bg-brand-50 rounded-full text-[10px] font-medium text-brand-600 min-w-[18px] text-center">
                  {values.size}
                </span>
              </div>
              <button
                onClick={() => clearFilter(key)}
                className="shrink-0 text-[10px] font-medium text-zinc-400 hover:text-red-500 transition-colors ml-2"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="p-1.5 bg-zinc-50/50">
            <div className="flex flex-wrap gap-1">
              {Array.from(values).map((value) => (
                <div
                  key={value}
                  className="group flex items-center gap-1 bg-white rounded border border-zinc-200 hover:border-zinc-300 transition-colors overflow-hidden"
                >
                  <span className="px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 truncate max-w-[150px]">
                    {value}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFilter(key, value);
                    }}
                    className="px-1 py-0.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors border-l border-zinc-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="px-1 pt-1 mt-1 border-t border-zinc-100">
        <button
          onClick={clearAllFilters}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-zinc-500 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
        >
          <X className="w-3 h-3" />
          <span>Clear all filters</span>
        </button>
      </div>
    </div>
  );
};
