"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useState, useEffect } from "react";
import useMobile from "@/hooks/use-mobile";
import { BottomNav } from "@/components/mobile/bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { isMobile, isMounted } = useMobile();

    // On mobile, sidebar should be closed by default
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [isMobile]);

    if (!isMounted) return null;

    return (
        <div className="flex min-h-screen w-full bg-gray-50/50">
            {/* Sidebar - Desktop: Sticky, Mobile: Fixed over content */}
            {!isMobile && isSidebarOpen && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    isMobile={false}
                    onClose={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar Handling */}
            {isMobile && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    isMobile={true}
                    onClose={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
                <DashboardHeader
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    isMobile={isMobile}
                />

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            {isMobile && <BottomNav />}
        </div>
    );
}
