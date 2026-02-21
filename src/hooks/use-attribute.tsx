import { useTableStore } from "@/context/store";
import { useMemo } from "react";

export const useFilterAttributes = (key: string) => {
  const data = useTableStore((state) => state.data);

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

  return attributes;
};
