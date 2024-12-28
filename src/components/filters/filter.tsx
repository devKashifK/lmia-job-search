"use client";

import { FilterIcon, FilterX, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useTableStore } from "@/app/context/store";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { columns } from "./column-def";
import { Checkbox } from "../ui/checkbox";

export function Filter() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="flex justify-center items-center gap-2 shadow-none hover:bg-purple-800 hover:text-white bg-white text-black border-2 border-gray-200 hover:border-purple-600 rounded-sm transition-all duration-100">
          <FilterIcon className="h-4 w-4" />
          Advance Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onInteractOutside={(e) => {
          e.stopPropagation(), e.preventDefault();
        }}
        className="px-0 py-0 pretty-scroll"
      >
        <div className="bg-gray-100 flex justify-between items-center px-4 py-2 rounded-t-md">
          <div className="flex gap-2 justify-center items-center">
            <FilterX className="h-3 w-3" />
            <span>Filter</span>
          </div>
          <div
            className="bg-red-400/60 border rounded-sm cursor-pointer px-1 py-0.5 border-red-800"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4 text-red-800" />
          </div>
        </div>
        <div className="">
          <Accordion>
            {columns.map((column, index) => (
              <FilterAttribute column={column} key={index} />
            ))}
          </Accordion>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const FilterAttribute = ({ column }) => {
  const attributes = useFilterAttributes(column.accessorKey);
  const { updateFilter, filters } = useTableStore();
  console.log(attributes, "CheckAttr23");
  return (
    <AccordionItem
      value={column.accessorKey}
      key={column.accessorKey}
      className=""
    >
      <AccordionTrigger className="bg-gray-50 py-1.5 px-1 data-[state=open]:border-b">
        <div className="flex items-center gap-2">
          {column.icon}
          <span className="text-sm font-normal">{column.accessorKey}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className=" max-h-56 overflow-y-auto pretty-scroll">
        <div className="flex flex-col gap-1">
          {attributes.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center hover:bg-purple-200 even:bg-gray-100 pr-2"
            >
              <div className="flex gap-1 items-center justify-start  cursor-pointer px-4 py-1 ">
                <p className="text-sm font-normal">{item.value}</p>
                <span className="text-gray-500 text-xs">({item.count})</span>
              </div>
              <Checkbox
                checked={filters[column.accessorKey]?.has(item.value) || false}
                onCheckedChange={() =>
                  updateFilter(column.accessorKey, item.value)
                }
              />
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const useFilterAttributes = (key) => {
  const { data } = useTableStore();

  console.log(data, "CheckData");

  const attributes = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      // Return an empty array if data is not valid or empty
      return [];
    }

    const countMap = data.reduce((acc, item) => {
      const value = item[key] || "Unknown"; // Default to "Unknown" for missing values
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(countMap).map(([value, count]) => ({
      value,
      count,
    }));
  }, [key, data]);

  console.log(attributes, "CheckAttr");
  return attributes;
};
