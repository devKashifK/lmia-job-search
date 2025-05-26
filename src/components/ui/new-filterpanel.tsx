import { useTableStore } from "@/context/store";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, ChevronLeft, Circle } from "lucide-react";
import React from "react";
import { hotLeadsColumns, lmiaColumns } from "@/components/filters/column-def";
import { AttributeName } from "@/helpers/attribute";
import db from "@/db";
import { cn } from "@/lib/utils";
import { Vidaloka } from "next/font/google";

export default function Newfilterpanel() {
  const columns = useFilterPanelColumns();
  return (
    <div className="border-r-2 border-brand-200 pr-8 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">Filters</div>
        <div className="text-sm w-3 h-3">
          <ChevronLeft />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {columns &&
          <div className="w-full">
        {(
          columns.map((column, idx) => (
            <div
                key={column?.accessorKey }
                className="border-b border-zinc-100 flex flex-col gap-4 mb-4 pb-4"
              >
                
            <div key={idx} className="text-sm font-medium">
              <AttributeName
                name={column?.accessorKey}
                className="w-4 h-4 text-gray-400"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto pretty-scroll">
              <FilterAttributes column = {column?.accessorKey}/>
            </div>
            </div>
          )))}
          </div>
}
      </div>
    </div>
  );
}



const FilterAttributes = ({ column }) => {
  const { data, isLoading, error } = useFilterColumnAttributes(column)
  const { updateFilter, filters, clearFilter , dataConfig , setDataConfig } = useTableStore();

const handleFilterUpdate = (accessorKey: string, value: string) => {
  updateFilter(accessorKey, value);

  let previousFilters: Record<string, string[]>[] = [];

  if (dataConfig.columns && typeof dataConfig.columns === "string") {
    try {
      previousFilters = JSON.parse(dataConfig.columns);
    } catch (e) {
      console.error("Failed to parse columns:", e);
    }
  }

  let found = false;

  const updatedFilters = previousFilters.map((filter) => {
    if (filter.hasOwnProperty(accessorKey)) {
      found = true;

      const existingValues = filter[accessorKey] || [];
      const updatedValues = Array.from(new Set([...existingValues, value])); // remove duplicates

      return { [accessorKey]: updatedValues };
    }
    return filter;
  });

  // If no filter existed for this accessorKey, add it
  if (!found) {
    updatedFilters.push({ [accessorKey]: [value] });
  }

  setDataConfig({
    ...(dataConfig || {}),
    columns: JSON.stringify(updatedFilters),
    page: 1, // optional: reset page when filter changes
  });
};





  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading attributes.</div>
  if (!data) return null

  return (
    <div>
      {data.map((value) => (
        <div
          key={value}
          role="button"
          tabIndex={0}
          onClick={() => handleFilterUpdate(column, value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleFilterUpdate(column, value)
            }
          }}
          className={cn(
            "group flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-200 cursor-pointer",
            "hover:bg-brand-100/80 active:bg-brand-200",
          )}
        >
          <div className="w-3.5 h-3.5 flex-shrink-0">
            {filters[column]?.has(value) ? (
              <CheckCircle className="h-3.5 w-3.5 text-brand-600" />
            ) : (
              <Circle className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
            )}
          </div>
          <span className="truncate flex-1 text-black">{value}</span>
          {filters[column]?.has(value) && (
            <span className="text-[10px] text-brand-600/70 group-hover:text-brand-600">
              selected
            </span>
          )}
        </div>
      ))}
    </div>
  )
}



const useFilterColumnAttributes = (column) => {
  const {filterPanelConfig} = useTableStore()

  const { table, keyword, column: filterColumn } = filterPanelConfig || {}

  return useQuery({
    enabled: !!table && !!filterColumn && !!keyword && !!column,
    queryKey: ["filtered-distinct-values", table, filterColumn, keyword, column],
    queryFn: async () => {
      const { data, error } = await db
        .from(table)
        .select(column, { count: "exact", head: false })
        .eq(filterColumn, keyword)

      if (error) throw new Error(error.message)

      // remove duplicate values manually if needed
      const uniqueValues = [...new Set(data.map((item) => item[column]))]
      return uniqueValues
    },
  })
}

const useFilterPanelColumns = () => {
  const { filterPanelConfig } = useTableStore();

  if (filterPanelConfig.type === "hot_leads") {
    return hotLeadsColumns;
  } else if (filterPanelConfig.type === "hot_leads_new") {
    return hotLeadsColumns;
  } else if (filterPanelConfig.type === "lmia") {
    return lmiaColumns;
  }
};


