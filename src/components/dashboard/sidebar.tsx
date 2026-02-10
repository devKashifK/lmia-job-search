"use client";

import { motion, AnimatePresence } from "framer-motion";
import { NavItem } from "./nav-item";
import {
  User,
  Settings,
  CreditCard,
  Bookmark,
  LogOut,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import db from "@/db";
import { toast } from "@/hooks/use-toast";
import Logo from "@/components/ui/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Credits",
    href: "/dashboard/credits",
    icon: CreditCard,
  },
  {
    name: "Recent Searches",
    href: "/dashboard/recent-searches",
    icon: Search,
  },
  {
    name: "Saved Jobs",
    href: "/dashboard/saved-jobs",
    icon: Bookmark,
  },
];

export function Sidebar({ isOpen, isMobile, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useSession();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("brandColor");
      await db.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "success",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {/* Sidebar */}
      <motion.div
        className={cn(
          "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isMobile
            ? "fixed left-0 top-0 bottom-0 z-50 w-[280px]"
            : "sticky top-0 h-screen w-[280px] z-30 flex-shrink-0"
        )}
        initial={isMobile ? { x: -280 } : { width: 0, opacity: 0 }}
        animate={
          isMobile
            ? { x: isOpen ? 0 : -280 }
            : { width: 280, opacity: 1 }
        }
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      >
        {/* Branding Area */}
        <div className="flex h-16 items-center px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <Logo className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-brand-600 transition-colors">
              Job Maze
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                icon={item.icon}
                label={item.name}
                isActive={pathname === item.href}
                onClick={() => {
                  router.push(item.href);
                  if (isMobile) onClose();
                }}
              />
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Log out</span>
          </Button>
        </div>
      </motion.div>
    </>
  );
}
