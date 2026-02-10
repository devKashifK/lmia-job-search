"use client";

import { usePathname } from "next/navigation";
import { User, Bell, Search, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import UserDropdown from "@/components/ui/user-dropdown";

interface DashboardHeaderProps {
    onMenuClick: () => void;
    isMobile: boolean;
}

export function DashboardHeader({ onMenuClick, isMobile }: DashboardHeaderProps) {
    const pathname = usePathname();
    const { session } = useSession();

    // Helper to get title from pathname
    const getPageTitle = (path: string) => {
        const segments = path.split("/").filter(Boolean);
        const lastSegment = segments[segments.length - 1];

        if (!lastSegment || lastSegment === "dashboard") return "Dashboard";

        return lastSegment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const title = getPageTitle(pathname || "");

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
            {isMobile && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 md:hidden"
                    onClick={onMenuClick}
                >
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            )}

            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        type="search"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                </div>

                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                    <Bell className="h-5 w-5" />
                </Button>

                <div className="pl-2 border-l border-gray-200">
                    <UserDropdown />
                </div>
            </div>
        </header>
    );
}
