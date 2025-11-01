"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Menu, X } from "lucide-react";
import BackgroundWrapper from "@/components/ui/background-wrapper";
import Navbar from "@/components/ui/nabvar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <BackgroundWrapper>
      <Navbar />
      <div className="min-h-screen">
        {/* Sidebar Toggle Button */}
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

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Mobile backdrop */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-30"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              {/* Sidebar panel */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                  "fixed top-[6.5rem] left-0 bottom-0 w-[280px] z-40 bg-white/90 backdrop-blur-xl border-r border-gray-200 shadow-lg",
                  isMobile && "shadow-2xl"
                )}
              >
                <Sidebar
                  isOpen={isSidebarOpen}
                  isMobile={isMobile}
                  onClose={() => setIsSidebarOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div
          className={cn(
            "transition-all duration-300 pt-[6.5rem]",
            isSidebarOpen && !isMobile ? "ml-[280px]" : "ml-0"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-[calc(100vh-6.5rem)] pb-12"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </BackgroundWrapper>
  );
}
