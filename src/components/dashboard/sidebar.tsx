import { motion, AnimatePresence } from "framer-motion";
import { NavItem } from "./nav-item";
import {
  User,
  Settings,
  CreditCard,
  Bookmark,
  LogOut,
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import db from "@/db";
import { toast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
    badge: 0,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    badge: 0,
  },
  {
    name: "Credits",
    href: "/dashboard/credits",
    icon: CreditCard,
    badge: 0,
  },
  {
    name: "Recent Searches",
    href: "/dashboard/recent-searches",
    icon: Bookmark,
    badge: 2,
  },
];

export function Sidebar({ isOpen, isMobile, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useSession();

  const handleLogout = async () => {
    toast({
      title: "Logged out",
      description: "You have been logged out",
      variant: "success",
    });
    await db.auth.signOut();
    router.push("/");
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
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? (isMobile ? "100%" : "280px") : "0px",
          x: isOpen ? 0 : -280,
        }}
        className={cn(
          "fixed left-0 z-40 bg-white/80 backdrop-blur-sm border-r border-gray-200 overflow-hidden",
          !isOpen && "w-0",
          "top-0 bottom-0",
          isMobile && "max-w-[280px]"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start text-gray-500 gap-2 hover:bg-brand-50 hover:text-gray-700 hover:border-brand-200"
              onClick={() => router.push("/search")}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Quick search...</span>
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
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
                  badge={item.badge}
                />
              ))}
            </nav>
          </div>

          {/* User Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-gray-200 p-4"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-3 hover:bg-brand-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 text-sm font-medium text-brand-600 border border-brand-200/50">
                      {session?.user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900">
                        Account
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[140px]">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-brand-50">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                  <span className="ml-auto bg-brand-100 text-brand-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
                    3
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-brand-50">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 flex items-center gap-2 hover:bg-red-50"
                  onClick={() => handleLogout()}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
