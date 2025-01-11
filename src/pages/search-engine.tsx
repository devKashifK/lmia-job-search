"use client";
// import { DataTable } from "@/components/ui/data-table";

import { useTableStore } from "@/app/context/store";
import { useMemo, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import {
  PersonStanding,
  Satellite,
  DatabaseIcon,
  Briefcase,
  Building,
  PowerSquare,
  Map,
  AreaChart,
} from "lucide-react";
import FilterPanel from "@/components/filters/filter-panel";
import { AnimatePresence, motion } from "framer-motion";

export const columnDefs = [
  {
    headerName: "Employer Name",
    field: "Employer_Name",
    headerComponentFramework: () => (
      <div className="flex items-center gap-1">
        <PersonStanding className="ml-2 h-4 w-4 text-gray-500" />
        Employer Name
      </div>
    ),
    cellRendererFramework: (params) => <span>{params.value}</span>,
  },
  {
    headerName: "City",
    field: "City",
    headerComponentFramework: () => (
      <div className="flex items-center gap-1">
        <Satellite className="ml-2 h-4 w-4 text-gray-500" />
        City
      </div>
    ),
    cellRendererFramework: (params) => <span>{params.value}</span>,
  },
  {
    headerName: "Program",
    field: "Program",
    headerComponentFramework: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className="ml-2 h-4 w-4 text-gray-500" />
        Program
      </div>
    ),
    cellRendererFramework: (params) => <span>{params.value}</span>,
  },
  {
    headerName: "Occupation",
    field: "Occupation Title",
    headerComponentFramework: () => (
      <div className="flex items-center gap-1">
        <Briefcase className="ml-2 h-4 w-4 text-gray-500" />
        Occupation
      </div>
    ),
    cellRendererFramework: (params) => <span>{params.value}</span>,
  },
  {
    headerName: "Province",
    field: "Province/Territory",
    headerComponentFramework: () => (
      <div className="flex items-center gap-1">
        <Building className="ml-2 h-4 w-4 text-gray-500" />
        Province
      </div>
    ),
    cellRendererFramework: (params) => <span>{params.value}</span>,
  },
  {
    headerName: "Positions",
    field: "Approved Positions",
    headerComponentFramework: () => (
      <div className="flex items-center gap-1">
        <PowerSquare className="ml-2 h-4 w-4 text-gray-500" />
        Positions
      </div>
    ),
    cellRendererFramework: (params) => <span>{params.value}</span>,
  },
  {
    headerName: "LMIA",
    field: "LMIA Year",
    headerComponentFramework: () => (
      <div className="flex items-center gap-1">
        <Map className="ml-2 h-4 w-4 text-gray-500" />
        LMIA
      </div>
    ),
    cellRendererFramework: (params) => <span>{params.value}</span>,
  },
  {
    headerName: "Postal",
    field: "Postal_Code",
    headerComponentFramework: () => (
      <div className="flex items-center gap-1">
        <AreaChart className="ml-2 h-4 w-4 text-gray-500" />
        Postal
      </div>
    ),
    cellRendererFramework: (params) => <span>{params.value}</span>,
  },
  {
    headerName: "NOC",
    field: "2021 NOC",
    headerComponentFramework: () => (
      <div className="flex items-center gap-1">
        <AreaChart className="ml-2 h-4 w-4 text-gray-500" />
        NOC
      </div>
    ),
    cellRendererFramework: (params) => <span>{params.value}</span>,
  },
];

// export default function SearchEngine({ keywords }: { keywords: string }) {
//   const { searchWithFuse, filteredData } = useTableStore();
//   const fuseSearch = useMemo(
//     () => searchWithFuse(keywords),
//     [keywords, searchWithFuse]
//   );

//   const showFilterPanel = useTableStore((state) => state.showFilterPanel);
//   return (
//     <div className="w-full py-6 px-6 flex gap-4">
//       {showFilterPanel && (
//         <div className="w-1/6">
//           <FilterPanel />
//         </div>
//       )}
//       <div className="w-5/6">
//         <DataTable columnDefs={columnDefs} rowData={filteredData} />
//       </div>
//     </div>
//   );
// }

export default function SearchEngine({ keywords }: { keywords: string }) {
  const { searchWithFuse, filteredData } = useTableStore();
  const fuseSearch = useMemo(
    () => searchWithFuse(keywords),
    [keywords, searchWithFuse]
  );

  const showFilterPanel = useTableStore((state) => state.showFilterPanel);

  return (
    <div className="w-full py-6 px-6">
      <div className="flex gap-4 relative">
        <AnimatePresence initial={false}>
          {showFilterPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: "300px",
                opacity: 1,
                transition: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              }}
              exit={{
                width: 0,
                opacity: 0,
                transition: {
                  duration: 0.3,
                  ease: "easeIn",
                },
              }}
              className="shrink-0"
            >
              <div className="w-[300px]">
                <FilterPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="flex-1"
          initial={false}
          animate={{
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          }}
        >
          <DataTable columnDefs={columnDefs} rowData={filteredData} />
        </motion.div>
      </div>
    </div>
  );
}

const DataTable = ({ rowData, columnDefs }) => {
  const [gridApi, setGridApi] = useState(null);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  return (
    <div
      className="ag-theme-alpine h-[600px] rounded-md border border-gray-300 shadow-lg"
      style={{
        width: "100%",
      }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          resizable: true,
          headerClass:
            "bg-purple-500 text-white text-sm font-semibold uppercase",
          cellClass: "text-gray-800 text-sm font-normal px-2 py-2",
          flex: 1,
        }}
        rowClass="even:bg-gray-50 hover:bg-purple-100"
        onGridReady={onGridReady}
        modules={[ClientSideRowModelModule]}
        overlayNoRowsTemplate={
          '<span class="text-gray-500">No data available</span>'
        }
      />
    </div>
  );
};
