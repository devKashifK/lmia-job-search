import { DATA } from "@/data/data";
import { create } from "zustand";

export const useTableStore = create((set, get) => ({
  data: DATA,
  filters: {},

  setData: (newData) => set({ data: newData }),

  setDataToInitial: () => set({ data: DATA }),

  updateFilter: (columnKey, value) => {
    const { filters, data } = get();

    // Clone the filters object
    const updatedFilters = { ...filters };

    // Initialize the filter set for the column if it doesn't exist
    if (!updatedFilters[columnKey]) {
      updatedFilters[columnKey] = new Set();
    }

    // Toggle the value in the filter set
    if (updatedFilters[columnKey].has(value)) {
      updatedFilters[columnKey].delete(value); // Remove the value
      if (updatedFilters[columnKey].size === 0) {
        delete updatedFilters[columnKey]; // Clean up empty sets
      }
    } else {
      updatedFilters[columnKey].add(value); // Add the value
    }

    // Apply filters
    const filteredData = data.filter((item) =>
      Object.entries(updatedFilters).every(([key, values]) =>
        values.has(item[key])
      )
    );

    // If no filters are selected, reset to original data
    const newData =
      Object.keys(updatedFilters).length === 0
        ? get().initialData
        : filteredData;

    // Update the Zustand store
    set({
      filters: updatedFilters,
      data: newData,
    });
  },
}));
