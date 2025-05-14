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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FilterPanel from "@/components/filters/filter-panel";
import { AnimatePresence, motion } from "framer-motion";
import DynamicChart from "@/components/charts/chart";
import { DataTable } from "@/components/ui/custom-table";
import { SearchEngineSkeleton } from "@/components/search-components.tsx/search-engine-skeleton";
import { cn } from "@/lib/utils";

const hotLeadsColumns = [
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
    headerIcon: <Map className="w-4 h-4 text-orange-600" />,
    width: 180,
    minWidth: 150,
  },
  {
    field: "noc_priority",
    headerName: "Industry",
    headerIcon: <PowerSquare className="w-4 h-4 text-orange-600" />,
    width: 100,
    minWidth: 80,
  },
  {
    field: "operating_name",
    headerName: "Company",
    headerIcon: <AreaChart className="w-4 h-4 text-orange-600" />,
    width: 180,
    minWidth: 150,
  },
  {
    field: "date_of_job_posting",
    headerName: "Posted On",
    headerIcon: <DatabaseIcon className="w-4 h-4 text-orange-600" />,
    width: 120,
    minWidth: 100,
  },
  {
    field: "state",
    headerName: "State",
    headerIcon: <AreaChart className="w-4 h-4 text-orange-600" />,
    width: 120,
    minWidth: 100,
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
  const {
    searchWithFuse,
    filteredData,
    isLoading,
    setShowFilterPanel,
    showFilterPanel,
  } = useTableStore();
  const [isChartsExpanded, setIsChartsExpanded] = useState(false);

  useEffect(() => {
    if (keywords) {
      searchWithFuse(decodeURIComponent(keywords), type);
    }
  }, [keywords, searchWithFuse, type]);

  if (isLoading) {
    return <SearchEngineSkeleton showOverlay={false} />;
  }

  return (
    <div className="w-full flex h-[calc(100vh-3.5rem)] overflow-hidden overflow-x-hidden min-w-0">
      {!showFilterPanel && (
        <button
          onClick={() => setShowFilterPanel(true)}
          className="fixed left-0 top-1/2 z-50 flex items-center gap-2 px-0 py-1 bg-orange-100 shadow-lg rounded-tr-lg rounded-br-lg border border-zinc-200 hover:bg-orange-50 transition-colors duration-200 group"
        >
          <div className="p-1 bg-orange-100 rounded-md">
            <ChevronRight className="h-3.5 w-3.5 text-orange-600" />
          </div>
        </button>
      )}

      {showFilterPanel && (
        <div
          className={cn(
            "shrink-0 relative h-full transition-all duration-300",
            showFilterPanel ? "w-[300px]" : "w-0"
          )}
          style={{ zIndex: 40 }}
        >
          <div
            className={cn(
              "absolute top-0 left-0 w-[300px] h-full transition-transform duration-300"
            )}
          >
            <FilterPanel type={type} />
          </div>
        </div>
      )}

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
                  keyName={type === "hot_leads" ? "year" : "lmia_year"}
                  active={"line"}
                />
                <DynamicChart
                  data={filteredData}
                  keyName={type === "hot_leads" ? "noc_code" : "territory"}
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
