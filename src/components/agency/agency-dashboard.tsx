'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  X, 
  FileText, 
  LayoutDashboard,
  Search,
  Filter,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { useAgencyStore, AgencyTab } from '@/context/agency-store';
import { ClientList } from './client-list';
import { ClientDetailView } from './client-detail-view';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AgencyDashboard() {
  const { tabs, activeTabId, setActiveTab, removeTab } = useAgencyStore();

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="flex flex-col h-full bg-gray-50/50 min-h-[calc(100vh-4rem)]">
      {/* Premium Tab Bar - Condensed */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 pt-3">
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar pb-px">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const Icon = tab.type === 'list' ? LayoutDashboard : FileText;
            
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl cursor-pointer transition-all duration-200 min-w-[100px] max-w-[200px] border-x border-t border-transparent",
                  isActive 
                    ? "bg-white border-gray-200 text-brand-600 shadow-[0_-2px_10px_rgba(0,0,0,0.01)]" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-brand-600" : "text-gray-400")} />
                <span className="text-[11px] font-bold truncate flex-1 uppercase tracking-tight">
                  {tab.title}
                </span>
                
                {tab.id !== 'clients-list' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                    className={cn(
                      "p-0.5 rounded-xl px-1.5 py-1.5",
                      isActive && "opacity-100"
                    )}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
                
                {isActive && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-brand-600 z-10"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab.type === 'list' ? (
              <ClientList />
            ) : (
              <ClientDetailView tab={activeTab} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
