'use client';
import { Button } from '@/components/ui/button';
import CustomLink from '@/components/ui/CustomLink';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import UserDropdown from '@/components/ui/user-dropdown';
import { NotificationsPopover } from '@/components/ui/notifications-popover';
import { CreditsPopover } from '@/components/ui/credits-popover';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import Logo from '@/components/ui/logo';
import useMobile from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

import {
  Search,
  Lightbulb,
  BarChart3,
  GitCompare,
  BookOpen,
  DollarSign,
  LayoutDashboard,
  Bell,
  ChevronRight,
  LogIn,
  UserPlus,
  HandCoins,
  Newspaper,
  Wallet
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8
};

export default function Navbar({ className }: { className?: string }) {
  const { session, loading } = useSession();
  const { isMobile } = useMobile();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isMobile) return null;

  const navItems = [
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Insights', href: '/insights', icon: Lightbulb },
    { name: 'Analysis', href: '/analysis', icon: BarChart3 },
    { name: 'Comparator', href: '/compare', icon: GitCompare },
    { name: 'Wage Finder', href: '/resources/wage-finder', icon: HandCoins },
    { name: 'NOC Guide', href: '/resources/noc-codes', icon: BookOpen },
    { name: 'Blog', href: '/blog', icon: Newspaper },
    { name: 'Pricing', href: '/pricing', icon: DollarSign },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <LayoutGroup id="navbar">
        <motion.div 
          layout
          className={cn(
            "fixed z-50 pointer-events-none flex items-center transition-none",
            scrolled
              ? "inset-y-0 right-6 w-auto"
              : "top-0 left-0 right-0 justify-center p-6 h-auto",
            className
          )}
        >
          <motion.nav
            layout
            transition={transition}
            className={cn(
              "pointer-events-auto flex shadow-2xl transition-none relative",
              scrolled
                ? "flex-col gap-4 p-3 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl ring-1 ring-black/5"
                : "items-center justify-between w-full max-w-7xl rounded-full px-6 py-3 bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg shadow-black/5"
            )}
          >
            {/* Logo Section */}
            <motion.div layout transition={transition}>
              <CustomLink href="/" className="flex items-center gap-2.5 group transition-all duration-300">
                <motion.div 
                  layout
                  transition={transition}
                  className={cn(
                    "relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 shadow-lg transform group-hover:scale-110 transition-all duration-300",
                    scrolled ? "w-10 h-10" : "w-9 h-9"
                  )}
                >
                  <Logo className="h-5 w-5 text-white" />
                </motion.div>
                {!scrolled && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xl font-bold text-gray-900 tracking-tight"
                  >
                    Job Maze
                  </motion.span>
                )}
              </CustomLink>
            </motion.div>

            {/* Navigation Links */}
            <motion.div 
              layout
              transition={transition}
              className={cn(
                "flex gap-1",
                scrolled ? "flex-col bg-gray-100/30 p-1.5 rounded-2xl" : "items-center bg-gray-100/50 p-1 rounded-full border border-gray-200/30"
              )}
            >
              {navItems.map((item) => {
                const navLink = (
                  <CustomLink
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center transition-all duration-300",
                      scrolled
                        ? "w-10 h-10 rounded-xl hover:bg-white hover:text-brand-600 text-gray-500"
                        : "px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                    )}
                  >
                    {scrolled ? <item.icon className="w-5 h-5" /> : item.name}
                  </CustomLink>
                );

                if (!scrolled) return <motion.div layout key={item.name}>{navLink}</motion.div>;

                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <motion.div layout>{navLink}</motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="font-semibold bg-gray-900 text-white border-none">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </motion.div>

            {/* Auth Section */}
            <motion.div 
              layout
              transition={transition}
              className={cn(
                "flex items-center",
                scrolled ? "flex-col gap-4 mt-2 pt-4 border-t border-gray-100 w-full" : "gap-3"
              )}
            >
              {loading ? (
                <div className="h-9 w-9 bg-gray-100/50 rounded-full animate-pulse" />
              ) : session?.user ? (
                <>
                  {scrolled ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CustomLink href="/dashboard" className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 flex items-center justify-center transition-all">
                          <LayoutDashboard className="w-5 h-5" />
                        </CustomLink>
                      </TooltipTrigger>
                      <TooltipContent side="left">Dashboard</TooltipContent>
                    </Tooltip>
                  ) : (
                    <CustomLink href="/dashboard" className="hidden lg:flex items-center h-9 px-4 rounded-full text-sm font-semibold text-gray-600 hover:text-brand-600 hover:bg-brand-50/50 transition-all">
                      Dashboard
                    </CustomLink>
                  )}

                  <div className="relative">
                    {scrolled ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div><CreditsPopover /></div>
                        </TooltipTrigger>
                        <TooltipContent side="left">Credits & Plan</TooltipContent>
                      </Tooltip>
                    ) : (
                      <CreditsPopover />
                    )}
                  </div>

                  <div className="relative">
                    <NotificationsPopover />
                  </div>
                  <div className={scrolled ? "pb-2" : "pl-1"}><UserDropdown /></div>
                </>
              ) : (
                <div className={cn("flex items-center gap-2", scrolled && "flex-col")}>
                  {scrolled ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CustomLink href="/sign-in" className="w-10 h-10 rounded-xl text-gray-400 hover:text-gray-900 flex items-center justify-center transition-all">
                            <LogIn className="w-5 h-5" />
                          </CustomLink>
                        </TooltipTrigger>
                        <TooltipContent side="left">Log in</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="w-10 h-10 p-0 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-lg transition-all" asChild>
                            <CustomLink href="/sign-in">
                              <UserPlus className="w-5 h-5" />
                            </CustomLink>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">Sign up</TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <CustomLink href="/sign-in" className="text-sm font-bold text-gray-600 hover:text-gray-900 px-3">
                        Log in
                      </CustomLink>
                      <Button className="rounded-full bg-gray-900 hover:bg-gray-800 text-white font-bold h-9 px-5 text-sm shadow-lg transition-all" asChild>
                        <CustomLink href="/sign-in">Sign up</CustomLink>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.nav>
        </motion.div>
      </LayoutGroup>
    </TooltipProvider>
  );
}
