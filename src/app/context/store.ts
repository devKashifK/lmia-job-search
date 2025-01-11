import { create } from "zustand";
import Fuse from "fuse.js";
import { DATA } from "@/data/data";

export const useTableStore = create((set, get) => ({
  data: [],
  filteredData: [],
  filters: {},
  showFilterPanel: true,

  setShowFilterPanel: (value) => {
    const currentValue = get().showFilterPanel;
    set({
      showFilterPanel: typeof value === "boolean" ? value : !currentValue,
    });
  },

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
  clearAllFilters: () => {
    set({ filters: {}, filteredData: get().data });
  },

  clearFilter: (columnKey) => {
    const { filters, data } = get();

    const updatedFilters = { ...filters };
    delete updatedFilters[columnKey]; // Remove the filter for the specific column

    const filteredData =
      Object.keys(updatedFilters).length === 0
        ? data
        : data.filter((item) =>
            Object.entries(updatedFilters).every(([key, values]) =>
              values.has(item[key])
            )
          );

    set({
      filters: updatedFilters,
      filteredData,
    });
  },
  clearSingleFilter: (columnKey, value) => {
    const { filters, data } = get();

    if (!filters[columnKey]) return; // If the column has no filters, do nothing

    const updatedFilters = { ...filters };
    updatedFilters[columnKey].delete(value); // Remove the specific filter value

    // If the column has no more filters, remove the column key
    if (updatedFilters[columnKey].size === 0) {
      delete updatedFilters[columnKey];
    }

    const filteredData =
      Object.keys(updatedFilters).length === 0
        ? data
        : data.filter((item) =>
            Object.entries(updatedFilters).every(([key, values]) =>
              values.has(item[key])
            )
          );

    set({
      filters: updatedFilters,
      filteredData,
    });
  },
  searchWithFuse: (keywords) => {
    const safeKeywords = keywords || "";

    if (!safeKeywords.trim()) {
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
