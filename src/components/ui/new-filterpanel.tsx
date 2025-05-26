import { useTableStore } from "@/context/store";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { hotLeadsColumns, lmiaColumns } from "@/components/filters/column-def";
import { AttributeName } from "@/helpers/attribute";

export default function Newfilterpanel() {
  const columns = useFilterPanelColumns();
  console.log(columns, "checkColumns");
  return (
    <div className="border-r-2 border-brand-200 pr-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">Filters</div>
        <div className="text-sm w-3 h-3">
          <ChevronLeft />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {columns &&
          columns.map((column, idx) => (
            <div key={idx} className="text-sm font-medium">
              <AttributeName
                name={column?.accessorKey}
                className="w-4 h-4 text-gray-400"
              />
            </div>
          ))}
      </div>
    </div>
  );
}

const useFilterPanelColumns = () => {
  const { filterPanelConfig } = useTableStore();

  if (filterPanelConfig.type === "hot_leads") {
    return hotLeadsColumns;
  } else if (filterPanelConfig.type === "hot_leads_new") {
    return hotLeadsColumns;
  } else if (filterPanelConfig.type === "lmia") {
    return lmiaColumns;
  }
};

const useFilterPanel = () => {
  const { filterPanelConfig } = useTableStore();
  const { data, isLoading } = useQuery({
    queryKey: [
      filterPanelConfig.type,
      filterPanelConfig.keyword,
      filterPanelConfig.column,
    ],
    queryFn: () => getFilterPanelValues(filterPanelConfig),
  });
};
