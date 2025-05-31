import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { LMIA } from "@/components/filters/column-def";
import { AttributeName } from "@/helpers/attribute";

interface ColumnSelectorProps {
  columns: ColumnDef<LMIA, unknown>[];
  selectedColumn: keyof LMIA;
  onColumnSelect: (column: string) => void;
}

export function ColumnSelector({
  columns,
  selectedColumn,
  onColumnSelect,
}: ColumnSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-sm font-medium text-gray-700">Analysis Fields</h4>
      </div>
      <div className="flex flex-col gap-2">
        {columns.map((column) => {
          const columnId = column.id;
          if (typeof columnId !== "string") return null;

          const header = column.header?.toString() || columnId;
          const displayName =
            header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, " ");

          return (
            <Button
              key={columnId}
              variant={selectedColumn === columnId ? "default" : "outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                selectedColumn === columnId &&
                  "bg-brand-600 text-white hover:bg-brand-700"
              )}
              onClick={() => onColumnSelect(columnId)}
            >
              <AttributeName name={columnId} />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
