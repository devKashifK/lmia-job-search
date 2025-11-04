'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/pages/homepage/footer';
import { Filter } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { X } from 'lucide-react';

interface AnalysisLayoutProps {
  children: React.ReactNode;
  companyName: string;
  filterSidebar: React.ReactNode;
}

export const AnalysisLayout = ({
  children,
  companyName,
  filterSidebar,
}: AnalysisLayoutProps) => {
  const { isMobile } = useMobile();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      {/* Header */}
      {isMobile ? (
        <MobileHeader title={companyName} showBack={true} />
      ) : (
        <Navbar className="" />
      )}

      {/* Main Content */}
      <div
        className={
          isMobile
            ? 'flex flex-col min-h-screen pb-20'
            : 'flex min-h-screen pt-24'
        }
      >
        {/* Desktop: Sidebar */}
        {!isMobile && (
          <aside className="w-64 border-r border-gray-200 bg-white sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
            {filterSidebar}
          </aside>
        )}

        {/* Main Content Area */}
        <main className={isMobile ? 'flex-1 px-4 py-4' : 'flex-1 px-8 py-8'}>
          {children}
        </main>

        {/* Mobile: Filter Button & Drawer */}
        {isMobile && (
          <>
            {/* Floating Filter Button */}
            <div className="fixed bottom-24 right-4 z-30">
              <button
                onClick={() => setShowFilters(true)}
                className="group flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all px-4 py-3"
              >
                <Filter className="w-5 h-5" />
                <span className="text-sm font-semibold">Filters</span>
              </button>
            </div>

            {/* Filter Drawer */}
            <Drawer open={showFilters} onOpenChange={setShowFilters}>
              <DrawerContent className="max-h-[85vh] flex flex-col">
                <DrawerHeader className="flex-shrink-0 border-b rounded-t-2xl border-gray-200 bg-gradient-to-r from-brand-50 to-blue-50 py-4 px-4">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-md">
                        <Filter className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">
                          Filters
                        </span>
                        <span className="text-xs text-gray-500">
                          Refine analysis
                        </span>
                      </div>
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md">
                        <X className="w-5 h-5" />
                      </button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto">{filterSidebar}</div>
              </DrawerContent>
            </Drawer>

            {/* Bottom Navigation */}
            <BottomNav />
          </>
        )}
      </div>

      {/* Footer - Desktop only */}
      {!isMobile && <Footer />}
    </>
  );
};
