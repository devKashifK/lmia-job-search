import { useTableStore } from "@/app/context/store";
import { useMemo } from "react";

export const useFilterAttributes = (key) => {
  const data = useTableStore((state) => state.data);

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
