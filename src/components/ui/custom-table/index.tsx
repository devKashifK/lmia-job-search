"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Column {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  headerIcon?: React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  className?: string;
  isLoading?: boolean;
  onRowClick?: (row: Record<string, any>) => void;
  selectedRow?: string;
  pageSize?: number;
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc" | null;
};

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Show max 5 pages at a time
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page, idx) =>
        page === "..." ? (
          <div key={`ellipsis-${idx}`} className="px-2 text-zinc-400">
            ...
          </div>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              currentPage === page &&
                "bg-orange-100 hover:bg-orange-200 text-orange-600"
            )}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function DataTable({
  columns,
  data = [],
  className,
  isLoading,
  onRowClick,
  selectedRow,
  pageSize = 10,
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "",
    direction: null,
  });
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((col) => col.field)
  );

  useEffect(() => {
    const initialWidths: { [key: string]: number } = {};
    columns.forEach((column) => {
      initialWidths[column.field] = column.width || 150;
    });
    setColumnWidths(initialWidths);
  }, [columns]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = null;
    }

    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.direction || !sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (!aValue && !bValue) return 0;
    if (!aValue) return 1;
    if (!bValue) return -1;

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleColumn = (field: string) => {
    setVisibleColumns((current) =>
      current.includes(field)
        ? current.filter((f) => f !== field)
        : [...current, field]
    );
  };

  const filteredColumns = columns.filter((col) =>
    visibleColumns.includes(col.field)
  );

  if (isLoading) {
    return (
      <div className="h-full border rounded-lg bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-zinc-500">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="h-full border rounded-lg bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-zinc-500">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col border rounded-xl bg-white h-full shadow-sm",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gradient-to-r from-orange-50 via-orange-50/80 to-orange-50/50">
              {filteredColumns.map((column) => (
                <th
                  key={column.field}
                  className="relative p-0 first:rounded-tl-xl"
                  style={{
                    width: columnWidths[column.field],
                    minWidth: column.minWidth || 100,
                  }}
                >
                  <div className="flex items-center py-3.5 px-4 group">
                    <div className="flex items-center gap-1  min-w-0">
                      <div className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md bg-orange-100/50 text-orange-600">
                        {column.headerIcon}
                      </div>
                      <div className=" min-w-0">
                        <span className="text-sm font-medium text-zinc-800 whitespace-nowrap">
                          {column.headerName}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-orange-100 focus:opacity-100 transition-all rounded-lg",
                          sortConfig.key === column.field &&
                            "opacity-100 bg-orange-100"
                        )}
                        onClick={() => handleSort(column.field)}
                      >
                        {sortConfig.key === column.field ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-orange-600" />
                          ) : sortConfig.direction === "desc" ? (
                            <ChevronDown className="h-3 w-3 text-orange-600" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-orange-600/70" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-orange-600/70" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {column.field !== columns[columns.length - 1].field && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-4 bg-orange-200/50" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full table-fixed">
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className="group border-b border-zinc-100 last:border-0"
              >
                {filteredColumns.map((column, colIndex) => (
                  <TooltipProvider key={column.field} delayDuration={50}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <td
                          className={cn(
                            "px-4 py-3 text-sm text-zinc-600 transition-colors cursor-pointer",
                            "hover:bg-zinc-50/80 hover:text-zinc-900",
                            colIndex !== columns.length - 1 &&
                              "border-r border-zinc-100"
                          )}
                          style={{
                            width: columnWidths[column.field],
                          }}
                        >
                          <div className="truncate">
                            {row[column.field] || "-"}
                          </div>
                        </td>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">{row[column.field] || "-"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with Pagination and Settings */}
      <div className="border-t border-zinc-100 px-4 py-2 flex items-center justify-between bg-zinc-50/50">
        <div className="text-sm text-zinc-500">
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, data.length)} of {data.length}{" "}
          entries
        </div>
        <div className="flex items-center gap-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <div className="pl-4 border-l border-zinc-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-orange-50"
                >
                  <Settings className="h-4 w-4 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.field}
                    checked={visibleColumns.includes(column.field)}
                    onCheckedChange={() => toggleColumn(column.field)}
                  >
                    {column.headerName}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
