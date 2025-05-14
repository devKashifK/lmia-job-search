"use client";
import {
  LayoutDashboardIcon,
  Home,
  Search,
  Settings,
  User,
  LogOut,
  CreditCard,
  Bell,
  Menu,
  FileDown,
  Save,
  SearchCheck,
  Blend,
  Binoculars,
  BookmarkMinus,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import db from "@/db";
import { useCreditData } from "@/hooks/use-credits";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTableStore } from "@/context/store";
import { SearchBar } from "./search-bar";
import { Filter } from "../filters/filter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSheet } from "@/context/sheet-context";
import { RecentSearches } from "./recent-searches";
import { SavedSearches } from "./saved-searches";

// Navigation Link Component
function NavLink({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200",
        isActive
          ? "text-orange-600 bg-orange-50 shadow-sm font-medium"
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// User Menu Component
function UserMenu() {
  const { session } = useSession();
  const { creditRemaining } = useCreditData();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await db.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      router.push("/");
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  return (
    <div className="border-t border-zinc-200">
      <Popover>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center gap-2 p-4 hover:bg-zinc-50 transition-colors">
            <Avatar className="h-8 w-8">
              {session?.user?.user_metadata?.avatar_url ? (
                <AvatarImage src={session.user.user_metadata.avatar_url} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                  {session?.user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {session?.user?.user_metadata?.full_name || "User"}
              </span>
              <span className="text-xs text-zinc-500">
                {session?.user?.email}
              </span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] p-0"
          align="start"
          side="right"
          sideOffset={-8}
        >
          <div className="flex flex-col py-2">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <Link
              href="/dashboard/credits"
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            >
              <CreditCard className="w-4 h-4" />
              Credits ({creditRemaining || 0})
            </Link>
            <div className="h-px bg-zinc-200 my-1" />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Navigation Menu Component
function NavigationMenu() {
  const pathname = usePathname() || "";

  const getActiveState = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col gap-1 p-4">
      <NavLink
        href="/"
        icon={<Home className="w-4 h-4" />}
        label="Home"
        isActive={getActiveState("/")}
      />
      <NavLink
        href="/search"
        icon={<Search className="w-4 h-4" />}
        label="Search"
        isActive={getActiveState("/search")}
      />
      <NavLink
        href="/dashboard"
        icon={<LayoutDashboardIcon className="w-4 h-4" />}
        label="Dashboard"
        isActive={getActiveState("/dashboard")}
      />
    </div>
  );
}

// NavItem Component
function NavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-all duration-200 h-5",
        isActive
          ? "text-orange-600 bg-orange-50 shadow-sm font-medium"
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

// Search Actions Component
function SearchActions({
  keywords,
  type,
}: {
  keywords?: string;
  type?: string;
}) {
  const filteredData = useTableStore((state) => state.filteredData);
  const updateSearchSaved = useTableStore((state) => state.updateSearchSaved);
  const showFilterPanel = useTableStore((state) => state.showFilterPanel);
  const setShowFilterPanel = useTableStore((state) => state.setShowFilterPanel);
  const { showSheet } = useSheet();
  const { toast } = useToast();

  const handleSave = async () => {
    const currentSearchId = sessionStorage.getItem("currentSearchId");
    if (!currentSearchId) {
      toast({
        title: "Error",
        description: "No search ID found",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateSearchSaved(currentSearchId, true);
      toast({
        title: "Success",
        description: "Search saved successfully",
      });
    } catch (error) {
      console.error("Failed to save search:", error);
      toast({
        title: "Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      console.log("No data to export");
      return;
    }

    try {
      const headers = Object.keys(filteredData[0]);
      const csvContent = [
        headers.join(","),
        ...filteredData.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              if (value === null || value === undefined) return "";
              if (typeof value === "object") return JSON.stringify(value);
              if (typeof value === "string") {
                if (
                  value.includes(",") ||
                  value.includes('"') ||
                  value.includes("\n")
                ) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
              }
              return value;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center h-5 gap-1">
          <NavItem
            icon={<Blend className="w-3 h-3" />}
            label="Filters"
            isActive={showFilterPanel}
            onClick={() => setShowFilterPanel(true)}
          />
          <NavItem
            icon={<Binoculars className="w-3 h-3" />}
            label="Recent"
            onClick={() => {
              showSheet({
                component: RecentSearches,
                className: "w-[400px] sm:w-[540px]",
              });
            }}
          />
          <NavItem
            icon={<BookmarkMinus className="w-3 h-3" />}
            label="Saved"
            onClick={() => {
              showSheet({
                component: SavedSearches,
                className: "w-[400px] sm:w-[540px]",
              });
            }}
          />
        </div>
        <div className="h-4 w-px bg-zinc-200" />
        <SearchBar type={type} />
        <div className="h-4 w-px bg-zinc-200" />
        <div className="flex items-center gap-1">
          {/* <Filter /> */}
          {/* <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={exportToCSV}
          >
            <FileDown className="w-3 h-3 mr-1" />
            Export
          </Button> */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleSave}
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

// Notifications Component
export function Notifications() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-md hover:bg-zinc-100"
        >
          <Bell className="h-4 w-4 text-zinc-500" />
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-white/95 backdrop-blur-sm border-zinc-200/50 shadow-lg"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-200/50">
          <h3 className="text-sm font-semibold text-zinc-900">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-zinc-500 hover:text-zinc-900"
          >
            Mark all as read
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-3 rounded-full bg-zinc-100 mb-3">
            <Bell className="h-5 w-5 text-zinc-400" />
          </div>
          <h4 className="text-sm font-medium text-zinc-900 mb-1">
            No new notifications
          </h4>
          <p className="text-xs text-zinc-500">
            We&apos;ll notify you when there&apos;s something new
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Main Topbar Component
export default function Topbar({
  className,
  keywords,
  type,
}: {
  className?: string;
  keywords?: string;
  type?: string;
}) {
  const router = useRouter();
  const filteredData = useTableStore((state) => state.filteredData);

  return (
    <header
      className={cn(
        "bg-white/80 border-b border-zinc-200/80 sticky top-0 z-50 backdrop-blur-sm",
        className
      )}
    >
      <div className="max-w-screen-2xl mx-auto">
        <nav className="flex items-center justify-between px-4 h-14">
          {/* Left side - Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-4rem)]">
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <NavigationMenu />
                    </div>
                    <div>
                      <UserMenu />
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => router.push("/")}
            >
              {type == "hot_leads" ? (
                <>
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                    H
                  </div>
                  <span className="text-sm font-semibold text-zinc-800">
                    Hot Leads
                  </span>
                </>
              ) : (
                <>
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                    L
                  </div>
                  <span className="text-sm font-semibold text-zinc-800">
                    LMIA
                  </span>
                </>
              )}
            </motion.div>

            {keywords && (
              <div className="flex items-center gap-2 pr-3 border-r border-zinc-200 h-5">
                <div className="p-1 bg-orange-50 rounded-md">
                  <SearchCheck className="w-3 h-3 text-orange-600" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-zinc-900">
                    {decodeURIComponent(keywords)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-md font-medium">
                    {filteredData.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Search, Actions & Notifications */}
          <div className="flex items-center gap-2">
            <SearchActions keywords={keywords} type={type} />
            <div className="h-4 w-px bg-zinc-200" />
            <Notifications />
          </div>
        </nav>
      </div>
    </header>
  );
}
