"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpDown } from "lucide-react";
import { useTableStore } from "@/context/store";

type SortDirection = "asc" | "desc" | null;

interface DataItem {
  id: number;
  name: string;
  category: string;
  price: string;
  sales: number;
  status: string;
}
const statusColors: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  pending: "bg-yellow-500",
};

export default function PremiumTable() {
  const { filteredData } = useTableStore();
  const [data, setData] = useState<DataItem[]>(filteredData);
  const [sortColumn, setSortColumn] = useState<keyof DataItem | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: keyof DataItem) => {
    let direction: SortDirection = "asc";
    if (column === sortColumn) {
      if (sortDirection === "asc") direction = "desc";
      else if (sortDirection === "desc") direction = null;
      else direction = "asc";
    }

    setSortColumn(column);
    setSortDirection(direction);

    if (direction) {
      const sortedData = [...data].sort((a, b) => {
        if (a[column] < b[column]) return direction === "asc" ? -1 : 1;
        if (a[column] > b[column]) return direction === "asc" ? 1 : -1;
        return 0;
      });
      setData(sortedData);
    } else {
      setData(filteredData);
    }
  };

  const renderSortIcon = (column: keyof DataItem) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    if (sortDirection === "asc")
      return <ArrowUpDown className="ml-2 h-4 w-4 text-blue-500" />;
    if (sortDirection === "desc")
      return <ArrowUpDown className="ml-2 h-4 w-4 text-blue-500 rotate-180" />;
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50">
              {Object.keys(filteredData[0])
                .filter((key) => key !== "id")
                .map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="flex items-center focus:outline-none"
                            onClick={() => handleSort(key as keyof DataItem)}
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                            {renderSortIcon(key as keyof DataItem)}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to sort by {key}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <TooltipProvider key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.tr
                      whileHover={{ backgroundColor: "#f0f4f8" }}
                      transition={{ duration: 0.2 }}
                      className="hover:shadow-sm cursor-pointer"
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          {item.category}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {item.price}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          {item.sales.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-opacity-10 text-gray-800">
                          <span
                            className={`h-2 w-2 rounded-full ${statusColors[item.status]
                              } mr-2 self-center`}
                          ></span>
                          {item.status}
                        </span>
                      </td>
                    </motion.tr>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to view details for {item.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
