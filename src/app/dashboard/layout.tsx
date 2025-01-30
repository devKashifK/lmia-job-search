"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Topbar from "@/components/search-components.tsx/topbar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import AuthenticatedRoute from "@/helpers/authenticated-route";

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
    <AuthenticatedRoute>
      <div className="flex min-h-screen bg-zinc-50/50">
        {/* Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-100 shadow-sm">
          <div className="flex h-16 items-center px-4 md:px-6">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 mr-4"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <Topbar className="w-full border-none" />
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 transition-all duration-300 pt-16",
            isSidebarOpen && !isMobile ? "ml-[280px]" : "ml-0"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="min-h-[calc(100vh-4rem)]"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
