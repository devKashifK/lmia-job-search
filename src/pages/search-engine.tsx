"use client";
// import { DataTable } from "@/components/ui/data-table";

import { useTableStore } from "@/context/store";
import { useMemo, useState, useEffect } from "react";
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
import DynamicChart from "@/components/charts/chart";
import { DataTable } from "@/components/ui/custom-table";

const columns = [
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
    field: "date_of_job_posting",
    headerName: "Posted On",
    headerIcon: <DatabaseIcon className="w-4 h-4 text-orange-600" />,
    width: 120,
    minWidth: 100,
  },
  // {
  //   field: "email",
  //   headerName: "Email",
  //   headerIcon: <Briefcase className="w-4 h-4 text-orange-600" />,
  //   width: 100,
  //   minWidth: 80,
  // },
  {
    field: "job_location",
    headerName: "Location",
    headerIcon: <Building className="w-4 h-4 text-orange-600" />,
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
    field: "occupation_title",
    headerName: "Occupation",
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
  const { searchWithFuse, filteredData, isLoading } = useTableStore();

  console.log(filteredData, "Check");

  useEffect(() => {
    if (keywords) {
      searchWithFuse(keywords);
    }
  }, [keywords, searchWithFuse]);

  const showFilterPanel = useTableStore((state) => state.showFilterPanel);

  return (
    <div className="w-full py-6 px-6 flex flex-col gap-4">
      <div className="flex gap-2">
        <DynamicChart
          data={filteredData}
          keyName={"Occupation"}
          active={"bar"}
        />
        <DynamicChart
          data={filteredData}
          keyName={"2021 NOC"}
          active={"line"}
        />
        <DynamicChart data={filteredData} keyName={"Employer"} active={"bar"} />
      </div>
      <div className="flex gap-0 relative min-h-[calc(100vh-23rem)]">
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
              className="shrink-0 relative"
              style={{ zIndex: 40 }}
            >
              <div className="w-[300px]">
                <FilterPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="flex-1 relative"
          style={{ zIndex: 30 }}
          initial={false}
          animate={{
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          }}
        >
          <DataTable
            columns={columns}
            data={filteredData}
            className="h-[calc(100vh-23rem)] shadow-lg"
            isLoading={isLoading}
          />
          {/* <PremiumTable /> */}
        </motion.div>
      </div>
    </div>
  );
}

// const DataTable = ({ rowData, columnDefs }) => {
//   const [gridApi, setGridApi] = useState(null);

//   const onGridReady = (params) => {
//     setGridApi(params.api);
//   };

//   return (
//     <div
//       className="ag-theme-alpine h-[600px] rounded-md border border-gray-300 shadow-lg"
//       style={{
//         width: "100%",
//       }}
//     >
//       <AgGridReact
//         rowData={rowData}
//         columnDefs={columnDefs}
//         defaultColDef={{
//           sortable: true,
//           resizable: true,
//           headerClass:
//             "bg-purple-500 text-white text-sm font-semibold uppercase",
//           cellClass: "text-gray-800 text-sm font-normal px-2 py-2",
//           flex: 1,
//         }}
//         rowClass="even:bg-gray-50 hover:bg-purple-100"
//         onGridReady={onGridReady}
//         modules={[ClientSideRowModelModule]}
//         overlayNoRowsTemplate={
//           '<span class="text-gray-500">No data available</span>'
//         }
//       />
//     </div>
//   );
// };
