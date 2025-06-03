import { create } from "zustand";
import db from "@/db";

interface TableState {
  data: any[];
  filteredData: any[];
  filters: Record<string, Set<string>>;
  showFilterPanel: boolean;
  currentSearchId: string | null;
  isLoading: boolean;
  filterPanelConfig: Record<string, string>;
  dataConfig: Record<string, string>;
  viewMode: "grid" | "table";
  selectedRecordID: string | null;
  updateSearchSaved: (searchId: string, saved: boolean) => Promise<void>;

  setShowFilterPanel: (value: boolean) => void;
  setDataToInitial: () => void;
  setFilteredData: (newData: any[]) => void;
  updateFilter: (columnKey: string, value: string) => void;
  clearAllFilters: () => void;
  clearFilter: (columnKey: string) => void;
  clearSingleFilter: (columnKey: string, value: string) => void;
  searchWithFuse: (keywords: string, type: string) => void;
  setCurrentSearchId: (id: string) => void;
  setDataConfig: (config: Record<string, string>) => void;
  setFilterPanelConfig: (config: Record<string, string>) => void;
  setViewMode: (value: "grid" | "table") => void;
  setSelectedRecordID: (id: string) => void;
}

export const useTableStore = create<TableState>((set, get) => ({
  data: [],
  filteredData: [],
  filters: {},
  showFilterPanel: true,
  currentSearchId: null,
  isLoading: false,
  filterPanelConfig: {},
  dataConfig: {},
  viewMode: "grid",

  setShowFilterPanel: (value) => {
    const currentValue = get().showFilterPanel;
    set({
      showFilterPanel: typeof value === "boolean" ? value : !currentValue,
    });
  },

  setViewMode: (value: "grid" | "table") => {
    set({
      viewMode: value,
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
    delete updatedFilters[columnKey];

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
  searchWithFuse: async (keywords, type = "hot_leads") => {
    const safeKeywords = keywords || "";

    if (!safeKeywords.trim()) {
      set({ data: DATA, filteredData: DATA });
      return;
    }

    set({ isLoading: true });

    if (type !== "hot_leads") {
      try {
        const { data: result, error } = await db.rpc("rpc_search_lmia", {
          term: keywords,
        });

        if (error) {
          console.error("Error searching:", error);
          throw error;
        }

        set({ data: result, filteredData: result });
      } catch (error) {
        console.error("Error in search:", error);
      } finally {
        set({ isLoading: false });
      }
    } else {
      try {
        const { data: result, error } = await db.rpc(
          "rpc_search_hot_leads_new",
          {
            term: keywords,
          }
        );

        if (error) {
          console.error("Error searching:", error);
          throw error;
        }

        set({ data: result, filteredData: result });
      } catch (error) {
        console.error("Error in search:", error);
      } finally {
        set({ isLoading: false });
      }
    }
  },
  setCurrentSearchId: (id) => set({ currentSearchId: id }),
  updateSearchSaved: async (searchId, saved) => {
    try {
      const { error } = await db
        .from("searches")
        .update({ save: saved })
        .eq("search_id", searchId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating search:", error);
      throw error;
    }
  },
  setFilterPanelConfig: (config) => set({ filterPanelConfig: config }),
  setDataConfig: (config) => set({ dataConfig: config }),
  setSelectedRecordID: (id) => set({ selectedRecordID: id }),
}));
