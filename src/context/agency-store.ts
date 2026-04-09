import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AgencyTab {
  id: string; // client id or 'clients-list'
  type: 'list' | 'detail';
  title: string;
  data?: any; // client data/extracted resume information
}

interface AgencyState {
  tabs: AgencyTab[];
  activeTabId: string;
  
  // Actions
  addTab: (tab: AgencyTab) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<AgencyTab>) => void;
  clearTabs: () => void;
}

export const useAgencyStore = create<AgencyState>()(
  persist(
    (set) => ({
      tabs: [{ id: 'clients-list', type: 'list', title: 'All Clients' }],
      activeTabId: 'clients-list',

      addTab: (tab) =>
        set((state) => {
          const exists = state.tabs.find((t) => t.id === tab.id);
          if (exists) {
            return { activeTabId: tab.id };
          }
          return {
            tabs: [...state.tabs, tab],
            activeTabId: tab.id,
          };
        }),

      removeTab: (id) =>
        set((state) => {
          if (id === 'clients-list') return state; // Prevent closing the main list
          
          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveId = state.activeTabId;
          
          if (state.activeTabId === id) {
            // If we're closing the active tab, switch to the previous one
            const index = state.tabs.findIndex((t) => t.id === id);
            newActiveId = state.tabs[index - 1]?.id || 'clients-list';
          }
          
          return {
            tabs: newTabs,
            activeTabId: newActiveId,
          };
        }),

      setActiveTab: (id) => set({ activeTabId: id }),

      updateTab: (id, updates) =>
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      clearTabs: () =>
        set({
          tabs: [{ id: 'clients-list', type: 'list', title: 'All Clients' }],
          activeTabId: 'clients-list',
        }),
    }),
    {
      name: 'jobmaze-agency-state',
    }
  )
);
