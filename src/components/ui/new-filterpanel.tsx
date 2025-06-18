import { useTableStore } from "@/context/store";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Circle, X, ChevronDown } from "lucide-react";
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
  const allowedKeys = ["date_of_job_posting"];
  const [selectedFiters, setSelectedFiters] = React.useState<
    {
      column: string;
      value: string;
    }[]
  >([]);
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});

  // Set initial collapsed state: only 'state' and 'city' open, others closed
  React.useEffect(() => {
    if (!columns) return;
    // Only set initial state if collapsedSections is empty
    if (Object.keys(collapsedSections).length === 0) {
      const initial: Record<string, boolean> = {};
      columns.forEach((col) => {
        if (col.accessorKey === "state" || col.accessorKey === "city") {
          initial[col.accessorKey] = false; // open
        } else {
          initial[col.accessorKey] = true; // collapsed
        }
      });
      setCollapsedSections(initial);
    }
  }, [columns]);

  const handleSelectedFilters = (column: string, value: string) => {
    setSelectedFiters((prev) => {
      const exists = prev.some((f) => f.column === column && f.value === value);
      if (exists) {
        // remove that exact filter
        return prev.filter((f) => !(f.column === column && f.value === value));
      } else {
        // add it
        return [...prev, { column, value }];
      }
    });
  };

  const handleRemoveFilter = (column: string, value: string) => {
    // First update the selected filters state
    setSelectedFiters((prev) => 
      prev.filter((f) => !(f.column === column && f.value === value))
    );

    // Then update the dataConfig to trigger a rerun
    const { dataConfig, setDataConfig } = useTableStore.getState();
    let previousFilters: Record<string, string[]>[] = [];
    
    if (dataConfig.columns && typeof dataConfig.columns === "string") {
      try {
        previousFilters = JSON.parse(dataConfig.columns);
      } catch (e) {
        console.error("Failed to parse columns:", e);
      }
    }

    const updatedFilters = previousFilters
      .map((filter) => {
        if (filter.hasOwnProperty(column)) {
          const existingValues = filter[column] || [];
          const updatedValues = existingValues.filter((v) => v !== value);

          if (updatedValues.length === 0) {
            return null;
          }

          return { [column]: updatedValues };
        }
        return filter;
      })
      .filter(Boolean);

    setDataConfig({
      ...(dataConfig || {}),
      columns: JSON.stringify(updatedFilters),
      page: "1",
    });
  };

  const toggleSection = (column: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  return (
    <div className="border-r-2 border-brand-200 pr-8 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">Filters</div>
        {/* <div className="text-sm w-3 h-3">
          <ChevronLeft />
        </div> */}
      </div>

      {selectedFiters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFiters.map((filter) => (
            <div
              key={`${filter.column}-${filter.value}`}
              className="flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-xs"
            >
              <span className="font-medium">
                <AttributeName name={filter.column} className="w-3 h-3 text-brand-600" />
              </span>
              <span className="mx-1">:</span>
              <span>{filter.value}</span>
              <button
                onClick={() => handleRemoveFilter(filter.column, filter.value)}
                className="ml-1 hover:bg-brand-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {columns && (
          <div className="w-full">
            {columns
              .filter((column) => !allowedKeys.includes(column.accessorKey))
              .map((column, idx) => {
                const isCollapsed = collapsedSections[column.accessorKey] || false;
                return (
                  <div
                    key={column?.accessorKey}
                    className="border-b border-zinc-100 flex flex-col gap-2 mb-4 pb-4"
                  >
                    <div
                      key={idx}
                      className="text-sm font-medium flex items-center justify-between cursor-pointer select-none"
                      onClick={() => toggleSection(column.accessorKey)}
                    >
                      <span>
                        <AttributeName
                          name={column?.accessorKey}
                          className="w-4 h-4 text-gray-400"
                        />
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 ml-2 transition-transform duration-200 ${isCollapsed ? "rotate-0" : "rotate-180"}`}
                      />
                    </div>
                    {!isCollapsed && (
                      <div className="">
                        <FilterAttributes
                          column={column?.accessorKey}
                          handleSelectedFilters={handleSelectedFilters}
                          selectedFilters={selectedFiters}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

const FilterAttributes = ({
  column,
  selectedFilters,
  handleSelectedFilters,
}: {
  column: string;
  selectedFilters: {
    column: string;
    value: string;
  }[];
  handleSelectedFilters: (column: string, value: string) => void;
}) => {
  const { data, isLoading, error } = useFilterColumnAttributes(column);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localFilters, setLocalFilters] = React.useState(new Set<string>());

  const { data: filterAvailability } = useQuery({
    queryKey: ["filter-availability", column, selectedFilters],
    queryFn: () =>
      selectedFilters.length > 0
        ? checkFilterAvailibity(selectedFilters, column)
        : [],
  });

  const { dataConfig } = useTableStore.getState();

  React.useEffect(() => {
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
  }, [column, dataConfig.columns]);

  const availableSet = React.useMemo(
    () => new Set<string>(filterAvailability),
    [filterAvailability]
  );

  console.log("availableSet", availableSet);

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    return data.filter((value) =>
      value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const sortedData = React.useMemo(() => {
    // copy so we don't mutate the original
    return filteredData.slice().sort((a, b) => {
      const aAvail = selectedFilters.length === 0 || availableSet.has(a);
      const bAvail = selectedFilters.length === 0 || availableSet.has(b);

      // if one is available and the other isn't, the available one comes first
      if (aAvail !== bAvail) return aAvail ? -1 : 1;

      // otherwise keep them alphabetically (or your default order)
      return a.localeCompare(b);
    });
  }, [filteredData, availableSet, selectedFilters.length]);

  const handleFilterUpdate = (accessorKey: string, value: string) => {
    const { dataConfig, setDataConfig } = useTableStore.getState();
    handleSelectedFilters(accessorKey, value);

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

    console.log("localFilters", localFilters);

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
        {sortedData.map((value) => {
          const isAvailable =
            selectedFilters.length === 0 || availableSet.has(value);
          return (
            <div
              key={value}
              role="button"
              tabIndex={0}
              onClick={() =>
                isAvailable &&
                startTransition(() => handleFilterUpdate(column, value))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (!isAvailable) return;
                  startTransition(() => handleFilterUpdate(column, value));
                }
              }}
              className={cn(
                "group flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-200 cursor-pointer",
                "hover:bg-brand-100/80 active:bg-brand-200",
                isAvailable
                  ? "cursor-pointer hover:bg-brand-100/80 active:bg-brand-200"
                  : "cursor-not-allowed opacity-50"
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
          );
        })}
      </div>
    </div>
  );
};

export const useFilterColumnAttributes = (column: string) => {
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
        return uniqueValues.sort((b, a) => a.localeCompare(b));
      } else if (method === "rpc") {
        const orClause = selectProjection
          .split(",")
          .filter((col) => col !== "RecordID")
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
        return uniqueValues.sort((b, a) => a.localeCompare(b));
      }
    },
  });
};

const useFilterPanelColumns = () => {
  const { filterPanelConfig } = useTableStore.getState();

  if (filterPanelConfig.type === "hot_leads") {
    if (filterPanelConfig.column === "job_title") {
      const filteredColumn = hotLeadsColumns.filter(
        (f) => f.accessorKey !== "noc_code"
      );
      return filteredColumn;
    }
    return hotLeadsColumns;
  } else if (filterPanelConfig.type === "hot_leads_new") {
    if (filterPanelConfig.column === "job_title") {
      const filteredColumn = hotLeadsColumns.filter(
        (f) => f.accessorKey !== "noc_code"
      );
      return filteredColumn;
    }
    return hotLeadsColumns;
  } else if (filterPanelConfig.type === "lmia") {
    return lmiaColumns;
  }
};

const checkFilterAvailibity = async (
  selectedFilters: {
    column: string;
    value: string;
  }[],
  targetColumn: string
) => {
  const { filterPanelConfig } = useTableStore.getState();

  const { table, column: filterColumn, method, type } = filterPanelConfig || {};

  const filterPayload =
    selectedFilters.length > 0 ? toFilterObject(selectedFilters) : {};

  const { data, error } = await db.rpc("check_filter_availability", {
    p_table: table,
    p_column: targetColumn,
    p_filters: filterPayload,
  });

  if (error) throw error;

  return data?.map((row) => row.value) ?? [];

  // 2. Group filters by column so we can .in() for multi‑select
};

function toFilterObject(
  selectedFilters: { column: string; value: string }[]
): Record<string, string[]> {
  return selectedFilters.reduce<Record<string, string[]>>(
    (acc, { column, value }) => {
      if (!acc[column]) acc[column] = [];
      acc[column].push(value);
      return acc;
    },
    {}
  );
}
