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

export default function SearchEngine({ keywords }: { keywords: string }) {
  const { searchWithFuse, filteredData } = useTableStore();
  const fuseSearch = useMemo(
    () => searchWithFuse(keywords),
    [keywords, searchWithFuse]
  );
  return (
    <div className="w-full py-6 px-6">
      <DataTable columnDefs={columnDefs} rowData={filteredData} />
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
        rowData={rowData} // Table data
        columnDefs={columnDefs} // Column definitions
        defaultColDef={{
          sortable: true, // Enable sorting
          resizable: true, // Allow column resizing
          headerClass:
            "bg-purple-500 text-white text-sm font-semibold uppercase",
          cellClass: "text-gray-800 text-sm font-normal px-2 py-2", // Style for cells
          flex: 1,
        }}
        rowClass="even:bg-gray-50 hover:bg-purple-100"
        onGridReady={onGridReady}
        modules={[ClientSideRowModelModule]}
        overlayNoRowsTemplate={
          '<span class="text-gray-500">No data available</span>'
        } // Custom message for no data
      />
    </div>
  );
};
