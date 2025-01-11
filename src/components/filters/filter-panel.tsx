"use client";
import React, { useEffect, useRef, useState } from "react";
import { columns } from "./column-def";
import { Popover, PopoverTrigger } from "../ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import { useFilterAttributes } from "@/hooks/use-attribute";
import { AttributeName, snakeCaseToTitleCase } from "@/helpers/attribute";
import {
  Check,
  ChevronRight,
  ListChecks,
  ListCollapse,
  Logs,
  Rabbit,
  Trash2,
  X,
} from "lucide-react";
import IconInput from "../ui/input-with-icon";
import { Checkbox } from "../ui/checkbox";
import { useTableStore } from "@/app/context/store";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger } from "../ui/tooltip";
import { TooltipContent, TooltipProvider } from "@radix-ui/react-tooltip";
import Fuse from "fuse.js";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";

export default function FilterPanel() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { filters, clearAllFilters, clearSingleFilter, setShowFilterPanel } =
    useTableStore();

  return (
    <div className="bg-white py-1 rounded-md shadow-sm relative">
      <div className="flex justify-between items-center px-4 py-2  border-b">
        <span className="text-xl font-semibold">Filters</span>
        <div className="flex space-x-2">
          <div className=" border-r-2 flex space-x-2 pr-2 text-sm font-medium text-black/50">
            <Sheet>
              <SheetTrigger>
                <span className="">Load</span>
              </SheetTrigger>
              <SheetContent>Will Be Coming Soon</SheetContent>
            </Sheet>
            <Drawer>
              <DrawerTrigger>
                <span>Save</span>
              </DrawerTrigger>
              <DrawerContent className="flex justify-center items-center h-48">
                Will add the feature for user to save there filters so they can
                save there filters and apply it on different searches.
              </DrawerContent>
            </Drawer>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <ListCollapse
                  className="w-5 h-5 text-red-600 cursor-pointer"
                  onClick={setShowFilterPanel}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white shadow-xl px-3 py-1 text-red-600 rounded-md z-[1000000000]  text-sm">
                Close Filter
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="px-4 py-2 border-b">
        <IconInput placeholder={"Search"} />
      </div>

      <div className="flex flex-col space-y-1 py-2">
        {columns.map((column, index) => (
          <Popover
            key={index}
            open={openIndex === index}
            onOpenChange={(isOpen) => setOpenIndex(isOpen ? index : null)}
          >
            <PopoverTrigger className="flex justify-between items-center px-4 py-2 w-full">
              <div className="flex items-center gap-0">
                {column?.icon}
                <AttributeName
                  name={column?.accessorKey}
                  className="font-medium"
                />
              </div>
              <ChevronRight className="w-5 h-5 text-black/50" />
            </PopoverTrigger>
            {openIndex === index && (
              <PopoverContent
                side="right"
                align="center"
                sideOffset={10}
                className="bg-white absolute z-[100000000] shadow-2xl drop-shadow-2xl rounded-md w-[22rem]"
              >
                <FilterPopoverContent
                  column={column}
                  onClose={() => setOpenIndex(null)}
                />
              </PopoverContent>
            )}
          </Popover>
        ))}
      </div>
      <div className="border-t">
        <div className="flex justify-between items-center text-sm px-4 py-2">
          <span className="font-semibold text-sm">Active Filters</span>
          <span
            className="text-black/50 cursor-pointer"
            onClick={clearAllFilters}
          >
            Clear all
          </span>
        </div>
        <div className="flex flex-col space-y-2 max-h-28 overflow-y-auto ">
          {filters && Object.entries(filters).length > 0 ? (
            Object.entries(filters).map(([columnKey, values]) => (
              <div
                key={columnKey}
                className="flex flex-col space-y-1 items-center text-sm  py-2 px-4"
              >
                <div className="flex items-start justify-start gap-2 w-full">
                  <span className="font-medium text-left">
                    {snakeCaseToTitleCase(columnKey)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 w-full">
                  {Array.from(values).map((value) => (
                    <div
                      key={value}
                      className="flex items-center justify-between w-full  bg-active border rounded-md px-2 py-1 shadow-sm"
                    >
                      <div className="line-clamp-1 w-[85%]">{value}</div>

                      <Trash2
                        className="h-4 w-4 text-red-500 transition-transform duration-200 ease-in-out cursor-pointer"
                        onClick={() => clearSingleFilter(columnKey, value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm flex w-full space-x-2 px-4 text-red-500 py-3 justify-center items-center  ">
              <Rabbit className="h-4 w-4 " />
              <span> No active filters </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function FilterPopoverContent({
  column,
  onClose,
}: {
  column: any;
  onClose: () => void;
}) {
  const attributes = useFilterAttributes(column?.accessorKey);
  const { updateFilter, filters, clearFilter } = useTableStore();
  const fuse = new Fuse(attributes, {
    keys: ["value"],
    threshold: 0.4,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const filteredAttributes = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : attributes;

  const selectedCount = (filters && filters[column?.accessorKey]?.size) || 0;
  return (
    <div className="flex flex-col ">
      <div className="flex justify-between w-full items-center px-4 py-1 border-b">
        <div className="flex items-center gap-0 px-0 py-1">
          {column?.icon}
          <AttributeName name={column?.accessorKey} className="font-medium" />
        </div>
        <X className="h-5 w-5 text-red-500 cursor-pointer" onClick={onClose} />
      </div>
      <div className="px-3 py-2 border-b">
        <IconInput
          placeholder={`Search ${snakeCaseToTitleCase(column?.accessorKey)}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="py-2">
        <div className="h-72 overflow-y-auto px-2 flex flex-col space-y-1">
          {filteredAttributes.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex justify-between items-center cursor-pointer hover:bg-active rounded-md py-1 px-2",
                filters[column.accessorKey]?.has(item.value) && "bg-primary/10"
              )}
              onClick={() => {
                updateFilter(column.accessorKey, item.value);
              }}
            >
              <div className="flex gap-1 items-center justify-start w-[85%] py-1 scale-95 hover:scale-100 transition-all duration-300 ease-in-out">
                <div
                  className={cn(
                    "w-[20px] transition-colors duration-200 ease-in-out",

                    "text-black/50"
                  )}
                >
                  {filters[column.accessorKey]?.has(item.value) ? (
                    <ListChecks className="h-4 w-4 transition-transform duration-200 ease-in-out" />
                  ) : (
                    <Logs className="h-4 w-4 transition-transform duration-200 ease-in-out" />
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm text-black line-clamp-2 transition-colors duration-200"
                  )}
                >
                  {item.value}
                </p>
              </div>
              {/* <div className="w-[15%] flex items-center justify-end">
                <div
                  className={cn(
                    "rounded-sm h-5 w-5 flex justify-center items-center transition-colors duration-200",

                    " text-black/50"
                  )}
                >
                  <span className="text-xs">({item.count})</span>
                </div>
              </div> */}
            </div>
          ))}
        </div>
      </div>
      <div className="py-2 border-t pl-6 pr-5 flex justify-between items-center">
        <span className="text-black/50 font-medium">
          {selectedCount} selected
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Trash2
                className="h-5 w-5 text-black/50 transition-transform duration-200 ease-in-out"
                onClick={() => clearFilter(column.accessorKey)}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-active px-2 py-1 rounded-md  text-sm">
              Clear All
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
