import { create } from "zustand";
import Fuse from "fuse.js";
import { DATA } from "@/data/data";

export const useTableStore = create((set, get) => ({
  data: [],
  filteredData: [],
  filters: {},

  setDataToInitial: () => set({ data: DATA, filteredData: DATA }),

  setFilteredData: (newData) => set({ filteredData: newData }),

  updateFilter: (columnKey, value) => {
    const { filters, data } = get();

    const updatedFilters = { ...filters };

    if (!updatedFilters[columnKey]) {
      updatedFilters[columnKey] = new Set();
    }

    if (updatedFilters[columnKey].has(value)) {
      updatedFilters[columnKey].delete(value);
      if (updatedFilters[columnKey].size === 0) {
        delete updatedFilters[columnKey];
      }
    } else {
      updatedFilters[columnKey].add(value);
    }

    const filteredData = data.filter((item) =>
      Object.entries(updatedFilters).every(([key, values]) =>
        values.has(item[key])
      )
    );

    const newFilteredData =
      Object.keys(updatedFilters).length === 0 ? data : filteredData;

    set({
      filters: updatedFilters,
      filteredData: newFilteredData,
    });
  },

  searchWithFuse: (keywords) => {
    if (!keywords.trim()) {
      set({ data: DATA, filteredData: DATA });
      return;
    }

    const fuse = new Fuse(DATA, {
      keys: [
        "Province/Territory",
        "Program",
        "Employer",
        "Address",
        "Occupation",
        "2021 NOC",
        "City",
        "Postal_Code",
        "Occupation Title",
        "Employer_Name",
      ],
      threshold: 0.4,
    });

    const result = fuse.search(keywords).map((res) => res.item);

    set({ data: result, filteredData: result });
  },
}));
