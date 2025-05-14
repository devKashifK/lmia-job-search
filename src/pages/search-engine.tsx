"use client";

import { useTableStore } from "@/context/store";
import { useEffect, useState } from "react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import {
  PersonStanding,
  Satellite,
  DatabaseIcon,
  PowerSquare,
  Map,
  AreaChart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import FilterPanel from "@/components/filters/filter-panel";
import { AnimatePresence, motion } from "framer-motion";
import DynamicChart from "@/components/charts/chart";
import { DataTable } from "@/components/ui/custom-table";
import { SearchEngineSkeleton } from "@/components/search-components.tsx/search-engine-skeleton";
import { cn } from "@/lib/utils";

const hotLeadsColumns = [
  {
    field: "2021_noc",
    headerName: "2021 NOC",
    headerIcon: <PersonStanding className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },
  {
    field: "city",
    headerName: "City",
    headerIcon: <Satellite className="w-4 h-4 text-orange-600" />,
    width: 120,
    minWidth: 100,
  },
  {
    field: "year",
    headerName: "Year",
    headerIcon: <Satellite className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },

  {
    field: "noc_code",
    headerName: "Noc Code",
    headerIcon: <Satellite className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },
  {
    field: "date_of_job_posting",
    headerName: "Posted On",
    headerIcon: <DatabaseIcon className="w-4 h-4 text-orange-600" />,
    width: 120,
    minWidth: 100,
  },
  {
    field: "noc_priority",
    headerName: "Noc",
    headerIcon: <PowerSquare className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },
  {
    field: "job_title",
    headerName: "Job Title",
    headerIcon: <Map className="w-4 h-4 text-orange-600" />,
    width: 180,
    minWidth: 150,
  },

  {
    field: "operating_name",
    headerName: "Operating",
    headerIcon: <AreaChart className="w-4 h-4 text-orange-600" />,
    width: 180,
    minWidth: 150,
  },
  {
    field: "state",
    headerName: "State",
    headerIcon: <AreaChart className="w-4 h-4 text-orange-600" />,
    width: 120,
    minWidth: 100,
  },
];

const lmiaColumns = [
  {
    field: "territory",
    headerName: "Province",
    headerIcon: <PersonStanding className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },
  {
    field: "program",
    headerName: "Program",
    headerIcon: <PersonStanding className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },
  {
    field: "city",
    headerName: "City",
    headerIcon: <Satellite className="w-4 h-4 text-orange-600" />,
    width: 120,
    minWidth: 100,
  },
  {
    field: "lmia_year",
    headerName: "Year",
    headerIcon: <Satellite className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },

  {
    field: "noc_code",
    headerName: "Noc Code",
    headerIcon: <Satellite className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },
  {
    field: "job_title",
    headerName: "Job Title",
    headerIcon: <DatabaseIcon className="w-4 h-4 text-orange-600" />,
    width: 120,
    minWidth: 100,
  },
  {
    field: "priority_occupation",
    headerName: "Occupation",
    headerIcon: <PowerSquare className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },
  {
    field: "approved_positions",
    headerName: "Positions",
    headerIcon: <PowerSquare className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },
  {
    field: "operating_name",
    headerName: "Operating",
    headerIcon: <AreaChart className="w-4 h-4 text-orange-600" />,
    width: 180,
    minWidth: 150,
  },
];

export default function SearchEngine({
  keywords,
  type,
}: {
  keywords: string;
  type: string;
}) {
  const { searchWithFuse, filteredData, isLoading } = useTableStore();
  const [isChartsExpanded, setIsChartsExpanded] = useState(true);

  useEffect(() => {
    if (keywords) {
      searchWithFuse(decodeURIComponent(keywords), type);
    }
  }, [keywords, searchWithFuse, type]);

  const showFilterPanel = useTableStore((state) => state.showFilterPanel);

  if (isLoading) {
    return <SearchEngineSkeleton showOverlay={false} />;
  }

  return (
    <div className="w-full flex h-[calc(100vh-3.5rem)] overflow-hidden overflow-x-hidden min-w-0">
      {/* Filter Panel (always rendered, width toggled) */}
      <div
        className={
          showFilterPanel
            ? "w-[300px] shrink-0 relative h-full transition-all duration-300"
            : "w-0 shrink-0 relative h-full overflow-hidden opacity-0 transition-all duration-300"
        }
        style={{ zIndex: 40 }}
      >
        {showFilterPanel && (
          <div className="w-[300px] h-full">
            <FilterPanel type={type} />
          </div>
        )}
      </div>

      {/* Main Content */}
      <motion.div
        layout
        className="flex-1 flex flex-col gap-4 py-2 px-4 min-w-0 overflow-x-hidden"
        style={{ zIndex: 30 }}
        initial={false}
        animate={{
          transition: {
            duration: 0.3,
            ease: "easeOut",
          },
        }}
      >
        {/* Charts Section */}
        <div className="flex flex-col min-w-0 overflow-x-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 bg-gradient-to-r from-orange-50/80 to-white rounded-t-lg">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-orange-100 rounded-md">
                <AreaChart className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-medium text-zinc-800 text-sm">Charts</h2>
                <p className="text-[10px] text-zinc-500">Visualize your data</p>
              </div>
            </div>
            <button
              onClick={() => setIsChartsExpanded(!isChartsExpanded)}
              className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors duration-200"
            >
              {isChartsExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              )}
            </button>
          </div>
          <AnimatePresence>
            {isChartsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3 overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border-x border-b border-zinc-200/50 rounded-b-lg pt-3 pb-2 px-3"
              >
                <DynamicChart
                  data={filteredData}
                  keyName={"city"}
                  active={"bar"}
                />
                <DynamicChart
                  data={filteredData}
                  keyName={"lmia_year"}
                  active={"line"}
                />
                <DynamicChart
                  data={filteredData}
                  keyName={"program"}
                  active={"bar"}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table Section */}
        <div
          className={cn(
            "flex-1 min-h-0 min-w-0 overflow-x-hidden",
            !isChartsExpanded && "flex-1"
          )}
        >
          <DataTable
            columns={type === "hot_leads" ? hotLeadsColumns : lmiaColumns}
            data={filteredData}
            className="h-full shadow-lg"
            isLoading={isLoading}
          />
        </div>
      </motion.div>
    </div>
  );
}
