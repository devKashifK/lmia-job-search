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
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import db from "@/db";
import { useCreditData } from "@/hooks/use-credits";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Topbar({ className }: { className?: string }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { session } = useSession();
  const { toast } = useToast();
  const { creditData, creditRemaining } = useCreditData();

  const getActiveState = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await db.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  return (
    <header
      className={cn(
        "bg-white/80 border-b border-zinc-200/80 sticky top-0 z-50 backdrop-blur-sm",
        className
      )}
    >
      <div className="max-w-screen-2xl mx-auto">
        <nav className="flex items-center justify-between px-4 h-14">
          {/* Logo & Primary Nav */}
          <div className="flex items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                L
              </div>
              <span className="text-sm font-semibold text-zinc-800">LIMA</span>
            </motion.div>

            <div className="flex items-center gap-1">
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
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
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
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Notifications
                  </h3>
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
                    We'll notify you when there's something new
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0 hover:bg-orange-50"
                >
                  <Avatar className="h-8 w-8">
                    {session?.user?.user_metadata?.avatar_url ? (
                      <AvatarImage
                        src={session.user.user_metadata.avatar_url}
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {session?.user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem className="flex items-center gap-2 cursor-default">
                  <Avatar className="h-8 w-8">
                    {session?.user?.user_metadata?.avatar_url ? (
                      <AvatarImage
                        src={session.user.user_metadata.avatar_url}
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        {session?.user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {session?.user?.user_metadata?.full_name || "User"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {session?.user?.email}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/settings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/credits")}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credits ({creditRemaining || 0})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
