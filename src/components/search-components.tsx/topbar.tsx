"use client";
import { LayoutDashboardIcon, Home, Search, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

import CustomLink from "@/app/CustomLink";
import { cn } from "@/lib/utils";
import { cloneElement } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Bell, Clock } from "lucide-react";

export default function Topbar({ className }: { className?: string }) {
  const pathname = usePathname();

  const getActiveState = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <header
      className={cn(
        "bg-white border-b border-zinc-200/80 sticky top-0 z-50 backdrop-blur-sm",
        className
      )}
    >
      <div className="max-w-screen-2xl mx-auto">
        <nav className="flex items-center justify-between px-4 h-12">
          {/* Logo & Primary Nav */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center text-xs shadow-sm">
                L
              </div>
              <span className="text-sm font-semibold text-zinc-800">LIMA</span>
            </div>

            <div className="flex items-center gap-0.5">
              <NavLink
                href="/"
                icon={<Home className="w-3.5 h-3.5" />}
                label="Home"
                isActive={getActiveState("/")}
              />
              <NavLink
                href="/search"
                icon={<Search className="w-3.5 h-3.5" />}
                label="Search"
                isActive={getActiveState("/search")}
              />
              <NavLink
                href="/dashboard"
                icon={<LayoutDashboardIcon className="w-3.5 h-3.5" />}
                label="Dashboard"
                isActive={getActiveState("/dashboard")}
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-1">
            <IconButton icon={<Clock />} />
            <IconButton icon={<Bell />} />
            <IconButton icon={<Settings />} />
            <button className="p-0.5 rounded-full hover:ring-2 hover:ring-orange-500/20 transition-all duration-200">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
              </Avatar>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

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
    <CustomLink
      href={href}
      className={cn(
        "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all duration-200",
        isActive
          ? "text-orange-600 bg-orange-50 shadow-sm font-medium"
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
      )}
    >
      {icon}
      <span>{label}</span>
    </CustomLink>
  );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all duration-200">
      {cloneElement(icon as React.ReactElement, {
        className: "w-3.5 h-3.5",
      })}
    </button>
  );
}
