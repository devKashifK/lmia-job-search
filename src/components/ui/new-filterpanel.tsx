import { useTableStore } from "@/context/store";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Circle } from "lucide-react";
import React, { startTransition } from "react";
import { hotLeadsColumns, lmiaColumns } from "@/components/filters/column-def";
import { AttributeName } from "@/helpers/attribute";
import db from "@/db";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { selectProjectionHotLeads } from "./dynamic-data-view";
import { selectProjectionLMIA } from "./dynamic-data-view";

interface FilterConfig {
  [key: string]: string[];
}

export default function Newfilterpanel() {
  const columns = useFilterPanelColumns();
  return (
    <div className="border-r-2 border-brand-200 pr-8 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">Filters</div>
        {/* <div className="text-sm w-3 h-3">
          <ChevronLeft />
        </div> */}
      </div>

      <div className="flex flex-col gap-2">
        {columns && (
          <div className="w-full">
            {columns.map((column, idx) => (
              <div
                key={column?.accessorKey}
                className="border-b border-zinc-100 flex flex-col gap-2 mb-4 pb-4"
              >
                <div key={idx} className="text-sm font-medium">
                  <AttributeName
                    name={column?.accessorKey}
                    className="w-4 h-4 text-gray-400"
                  />
                </div>
                <div className="">
                  <FilterAttributes column={column?.accessorKey} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const FilterAttributes = ({ column }: { column: string }) => {
  const { data, isLoading, error } = useFilterColumnAttributes(column);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localFilters, setLocalFilters] = React.useState(new Set<string>());

  // Initialize local filters from dataConfig
  React.useEffect(() => {
    const { dataConfig } = useTableStore.getState();
    let initialSelections = new Set<string>();
    if (dataConfig.columns && typeof dataConfig.columns === "string") {
      try {
        const parsedGlobalFilters = JSON.parse(
          dataConfig.columns
        ) as FilterConfig[];
        const foundFilterConfig = parsedGlobalFilters.find((f) =>
          f.hasOwnProperty(column)
        );
        if (foundFilterConfig) {
          initialSelections = new Set(foundFilterConfig[column]);
        }
      } catch (e) {
        console.error(`Failed to parse initial columns for ${column}:`, e);
      }
    }
    setLocalFilters(initialSelections);
  }, [column]);

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    return data.filter((value) =>
      value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const handleFilterUpdate = (accessorKey: string, value: string) => {
    const { dataConfig, setDataConfig } = useTableStore.getState();

    // Update local filters first
    setLocalFilters((prevFilters) => {
      const newFilters = new Set(prevFilters);
      if (newFilters.has(value)) {
        newFilters.delete(value);
      } else {
        newFilters.add(value);
      }
      return newFilters;
    });

    // Then update dataConfig
    let previousFilters: Record<string, string[]>[] = [];
    if (dataConfig.columns && typeof dataConfig.columns === "string") {
      try {
        previousFilters = JSON.parse(dataConfig.columns);
      } catch (e) {
        console.error("Failed to parse columns:", e);
      }
    }

    let found = false;
    const updatedFilters = previousFilters
      .map((filter) => {
        if (filter.hasOwnProperty(accessorKey)) {
          found = true;
          const existingValues = filter[accessorKey] || [];
          let updatedValues;

          if (existingValues.includes(value)) {
            updatedValues = existingValues.filter((v) => v !== value);
          } else {
            updatedValues = [...existingValues, value];
          }

          if (updatedValues.length === 0) {
            return null;
          }

          return { [accessorKey]: updatedValues };
        }
        return filter;
      })
      .filter(Boolean);

    // If no filter existed for this accessorKey and we're selecting (not deselecting)
    if (!found && !localFilters.has(value)) {
      updatedFilters.push({ [accessorKey]: [value] });
    }

    setDataConfig({
      ...(dataConfig || {}),
      columns: JSON.stringify(updatedFilters),
      page: "1",
    });
  };

  if (isLoading)
    return (
      <div className="flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    );

  if (error) return <div>Error loading attributes.</div>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder={"Search..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-2 py-1 h-7 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-600"
      />
      <div className="max-h-[300px] overflow-y-auto pretty-scroll">
        {filteredData.map((value) => (
          <div
            key={value}
            role="button"
            tabIndex={0}
            onClick={() =>
              startTransition(() => handleFilterUpdate(column, value))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                startTransition(() => handleFilterUpdate(column, value));
              }
            }}
            className={cn(
              "group flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-200 cursor-pointer",
              "hover:bg-brand-100/80 active:bg-brand-200"
            )}
          >
            <div className="w-3.5 h-3.5 flex-shrink-0">
              {localFilters.has(value) ? (
                <CheckCircle className="h-3.5 w-3.5 text-brand-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
              )}
            </div>
            <span className="truncate flex-1 text-black">{value}</span>
            {localFilters.has(value) && (
              <span className="text-[10px] text-brand-600/70 group-hover:text-brand-600">
                selected
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const useFilterColumnAttributes = (column) => {
  const { filterPanelConfig } = useTableStore.getState();

  const {
    table,
    keyword,
    column: filterColumn,
    method,
    type,
  } = filterPanelConfig || {};

  const selectProjection =
    type === "hot_leads" ? selectProjectionHotLeads : selectProjectionLMIA;

  return useQuery({
    enabled: !!table && !!filterColumn && !!keyword && !!column,
    queryKey: [
      "filtered-distinct-values",
      table,
      filterColumn,
      keyword,
      method,
      column,
    ],
    queryFn: async () => {
      if (method === "query") {
        const { data, error } = await db
          .from(table)
          .select(column, { count: "exact", head: false })
          .eq(filterColumn, keyword);

        if (error) throw new Error(error.message);

        const uniqueValues = [...new Set(data.map((item) => item[column]))];
        return uniqueValues;
      } else if (method === "rpc") {
        const orClause = selectProjection
          .split(",")
          .map((col) => `${col}.ilike.%${keyword}%`)
          .join(",");

        const { data, error } = await db
          .from(table)
          .select(column, { count: "exact", head: false })
          .or(orClause);

        if (!data) throw new Error("No data found");

        if (error) throw new Error(error.message);

        const uniqueValues = [
          ...new Set(data.map((item) => item[column])),
        ].filter(Boolean);
        return uniqueValues;
      }
    },
  });
};

const useFilterPanelColumns = () => {
  const { filterPanelConfig } = useTableStore.getState();

  if (filterPanelConfig.type === "hot_leads") {
    return hotLeadsColumns;
  } else if (filterPanelConfig.type === "hot_leads_new") {
    return hotLeadsColumns;
  } else if (filterPanelConfig.type === "lmia") {
    return lmiaColumns;
  }
};
