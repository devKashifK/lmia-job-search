'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Menu, X } from 'lucide-react';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import Navbar from '@/components/ui/nabvar';
import { BottomNav } from '@/components/mobile/bottom-nav';
import useMobile from '@/hooks/use-mobile';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isMobile, isMounted } = useMobile();

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  if (!isMounted) {
    return null;
  }

  return (
    <BackgroundWrapper>
      {/* Hide navbar on mobile */}
      {!isMobile && <Navbar />}
      <div className="min-h-screen">
        {/* Sidebar Toggle Button - Hide on mobile */}
        {!isMobile && (
          <div className="fixed top-[7rem] left-4 z-40">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-brand-50 hover:border-brand-300 shadow-sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4 text-gray-600" />
              ) : (
                <Menu className="h-4 w-4 text-gray-600" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>
        )}

        {/* Sidebar - Hide on mobile */}
        {!isMobile && (
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                <motion.div
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-[6.5rem] left-0 bottom-0 w-[280px] z-40 bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-lg"
                >
                  <Sidebar
                    isOpen={isSidebarOpen}
                    isMobile={false}
                    onClose={() => setIsSidebarOpen(false)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}

        {/* Main Content */}
        <div
          className={cn(
            'transition-all duration-300',
            isMobile ? 'pt-4 pb-20' : 'pt-[6.5rem]',
            isSidebarOpen && !isMobile ? 'ml-[280px]' : 'ml-0'
          )}
        >
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                isMobile
                  ? 'min-h-[calc(100vh-5rem)]'
                  : 'min-h-[calc(100vh-6.5rem)] pb-12'
              )}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      {isMobile && <BottomNav />}
    </BackgroundWrapper>
  );
}
