import { create } from 'zustand';

interface TableState {
  data: any[];
  filteredData: any[];
  filters: Record<string, Set<string>>;
  showFilterPanel: boolean;
  currentSearchId: string | null;
  isLoading: boolean;
  filterPanelConfig: Record<string, string>;
  dataConfig: Record<string, string>;
  viewMode: 'grid' | 'table';
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
  setViewMode: (value: 'grid' | 'table') => void;
  setSelectedRecordID: (id: string) => void;
}

const DATA: any[] = [];

/**
 * Helper to apply active filters to dataset
 */
const applyFilters = (data: any[], filters: Record<string, Set<string>>) => {
  if (Object.keys(filters).length === 0) return data;
  return data.filter((item) =>
    Object.entries(filters).every(([key, values]) =>
      values.has(item[key])
    )
  );
};

export const useTableStore = create<TableState>((set, get) => ({
  data: [],
  filteredData: [],
  filters: {},
  showFilterPanel: true,
  currentSearchId: null,
  isLoading: false,
  filterPanelConfig: {},
  dataConfig: {},
  viewMode: 'grid',
  selectedRecordID: null,

  setShowFilterPanel: (value) => {
    const currentValue = get().showFilterPanel;
    set({
      showFilterPanel: typeof value === 'boolean' ? value : !currentValue,
    });
  },

  setViewMode: (value: 'grid' | 'table') => {
    set({
      viewMode: value,
    });
  },

  setDataToInitial: () => set({ data: DATA, filteredData: DATA }),

  setFilteredData: (newData) => set({ filteredData: newData }),

  clearAllFilters: () => {
    set({ filters: {}, filteredData: get().data });
  },

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

    set({
      filters: updatedFilters,
      filteredData: applyFilters(data, updatedFilters),
    });
  },

  clearFilter: (columnKey) => {
    const { filters, data } = get();
    const updatedFilters = { ...filters };
    delete updatedFilters[columnKey];

    set({
      filters: updatedFilters,
      filteredData: applyFilters(data, updatedFilters),
    });
  },

  clearSingleFilter: (columnKey, value) => {
    const { filters, data } = get();
    if (!filters[columnKey]) return;

    const updatedFilters = { ...filters };
    updatedFilters[columnKey].delete(value);

    if (updatedFilters[columnKey].size === 0) {
      delete updatedFilters[columnKey];
    }

    set({
      filters: updatedFilters,
      filteredData: applyFilters(data, updatedFilters),
    });
  },
  searchWithFuse: async (keywords, type = 'hot_leads') => {
    const safeKeywords = keywords || '';

    if (!safeKeywords.trim()) {
      set({ data: DATA, filteredData: DATA });
      return;
    }

    set({ isLoading: true });

    if (type !== 'hot_leads') {
      try {
        const { searchLmia } = await import('@/lib/api/jobs');
        const result = await searchLmia(safeKeywords);
        set({ data: result, filteredData: result });
      } catch (error) {
        console.error('Error in search:', error);
      } finally {
        set({ isLoading: false });
      }
    } else {
      try {
        const { searchTrending } = await import('@/lib/api/jobs');
        const result = await searchTrending(safeKeywords);
        set({ data: result, filteredData: result });
      } catch (error) {
        console.error('Error in search:', error);
      } finally {
        set({ isLoading: false });
      }
    }
  },
  setCurrentSearchId: (id) => set({ currentSearchId: id }),
  updateSearchSaved: async (searchId, saved) => {
    try {
      const { updateSearchSaved: apiUpdateSearchSaved } = await import('@/lib/api/searches');
      await apiUpdateSearchSaved(searchId, saved);
    } catch (error) {
      console.error('Error updating search:', error);
      throw error;
    }
  },
  setFilterPanelConfig: (config) => set({ filterPanelConfig: config }),
  setDataConfig: (config) => set({ dataConfig: config }),
  setSelectedRecordID: (id) => set({ selectedRecordID: id }),
}));
