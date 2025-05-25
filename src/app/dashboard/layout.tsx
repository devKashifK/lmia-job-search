"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import AuthenticatedRoute from "@/helpers/authenticated-route";
import { Menu } from "lucide-react";
import BackgroundWrapper from "@/components/ui/background-wrapper";
import { Notifications } from "@/components/search-components.tsx/topbar";
import Link from "next/link";
import UserDropdown from "@/components/ui/user-dropdown";

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
      <BackgroundWrapper>
        <div className="flex h-screen w-full bg-white/50 backdrop-blur-sm overflow-hidden">
          {/* Navbar */}
          <div className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <div className="flex h-full items-center justify-between px-4 md:px-6">
              <div className="flex h-full items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 hover:bg-brand-50"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-500 text-transparent bg-clip-text">
                    Job Maze
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Notifications />
                <UserDropdown />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div
            className={cn(
              "fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 bg-white/80 backdrop-blur-sm border-r border-gray-200",
              isSidebarOpen ? "w-[280px]" : "w-0"
            )}
          >
            <Sidebar
              isOpen={isSidebarOpen}
              isMobile={isMobile}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Main Content */}
          <div
            className={cn(
              "flex-1 transition-all duration-300",
              isSidebarOpen && !isMobile ? "ml-[280px]" : "ml-0"
            )}
          >
            <div className="h-screen overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.main
                  key={pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="w-full min-h-full"
                >
                  {children}
                </motion.main>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </BackgroundWrapper>
    </AuthenticatedRoute>
  );
}
