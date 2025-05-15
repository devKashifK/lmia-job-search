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
  Lock,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");

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

  const handleColumnClick = (column: Column) => {
    setSelectedColumn(column.headerName);
    setShowSubscriptionDialog(true);
  };

  const handleSubscribe = () => {
    setShowSubscriptionDialog(false);
    router.push("/pricing");
  };

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
            <tr className="bg-gradient-to-r from-orange-200 via-orange-200/80 to-orange-200/50">
              {filteredColumns.map((column) => (
                <th
                  key={column.field}
                  className="relative p-0 first:rounded-tl-xl"
                  style={{
                    width: columnWidths[column.field],
                    minWidth: column.minWidth || 100,
                  }}
                  onClick={() => handleColumnClick(column)}
                >
                  <div className="flex items-center py-3.5 px-4 group cursor-pointer">
                    <div className="flex items-center gap-1 min-w-0">
                      <div className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md bg-orange-300/50 text-orange-800">
                        {column.headerIcon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-black whitespace-nowrap">
                          {column.headerName}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-orange-200 focus:opacity-100 transition-all rounded-lg",
                          sortConfig.key === column.field &&
                            "opacity-100 bg-orange-200"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSort(column.field);
                        }}
                      >
                        {sortConfig.key === column.field ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-3 w-3 text-orange-800" />
                          ) : sortConfig.direction === "desc" ? (
                            <ChevronDown className="h-3 w-3 text-orange-800" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-orange-800/70" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-orange-800/70" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {column.field !== columns[columns.length - 1].field && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-4 bg-orange-300/50" />
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedColumn(column.headerName);
                            setShowSubscriptionDialog(true);
                          }}
                        >
                          <div className="truncate text-black">
                            {row[column.field] || "-"}
                          </div>
                        </td>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm text-black">
                          {row[column.field] || "-"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Lock className="h-5 w-5" />
              Premium Content
            </DialogTitle>
            <DialogDescription>
              Subscribe to unlock detailed information about {selectedColumn}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-orange-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Email Address
                    </p>
                    <p className="text-xs text-zinc-500">Contact information</p>
                  </div>
                </div>
                <Lock className="h-4 w-4 text-orange-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-orange-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Phone Number
                    </p>
                    <p className="text-xs text-zinc-500">Direct contact</p>
                  </div>
                </div>
                <Lock className="h-4 w-4 text-orange-600" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-orange-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Secure access to contact information</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-orange-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <span>Unlimited access to all premium data</span>
              </div>
            </div>

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium"
              onClick={handleSubscribe}
            >
              Subscribe Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
