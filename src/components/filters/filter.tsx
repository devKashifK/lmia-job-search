"use client";

import { FilterX, SlidersHorizontal, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useTableStore } from "@/context/store";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { columns } from "./column-def";
import { Checkbox } from "../ui/checkbox";
import { useFilterAttributes } from "@/hooks/use-attribute";

export function Filter() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center px-3 py-3 text-sm text-gray-600 hover:text-blue-800 cursor-pointer">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Advance Filter
        </div>
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
            className="bg-blue-400/60 border rounded-sm cursor-pointer px-1 py-0.5 border-blue-800"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4 text-blue-800" />
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
