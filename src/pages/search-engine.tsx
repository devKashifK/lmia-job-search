"use client";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/filters/column-def";
import { useTableStore } from "@/app/context/store";

export default function SearchEngine() {
  const { data: DATA } = useTableStore();

  return (
    <div className="w-full py-6 px-6">
      <DataTable columns={columns} data={DATA} />
    </div>
  );
}
