'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  BarChart3,
  User,
  GitCompare,
  Briefcase,
  Menu,
  LucideIcon,
  Lightbulb,
  HandCoins,
  BookOpen,
  Newspaper,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomLink from '../ui/CustomLink';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from '@/hooks/use-session';
import UserDropdown from '../ui/user-dropdown';
import { Button } from '../ui/button';

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    name: 'Search',
    icon: Search,
    href: '/',
  },
  {
    name: 'Analysis',
    icon: BarChart3,
    href: '/analysis',
  },
  {
    name: 'Compare',
    icon: GitCompare,
    href: '/compare',
  },
  {
    name: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-2xl shadow-brand-500/10 pb-safe"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <CustomLink
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 min-w-[64px]',
                active
                  ? 'text-brand-600'
                  : 'text-gray-500 hover:text-brand-500 active:scale-95'
              )}
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-2xl"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
              <div className="relative z-10">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    active ? 'scale-110' : ''
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'relative z-10 text-[10px] font-semibold transition-all duration-300',
                  active ? 'text-brand-700' : 'text-gray-600'
                )}
              >
                {item.name}
              </span>
            </CustomLink>
          );
        })}

        {/* Menu Hamburger at the end */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 min-w-[64px] text-gray-500 hover:text-brand-500 active:scale-95"
            >
              <div className="relative z-10">
                <Menu className="w-5 h-5" strokeWidth={2} />
              </div>
              <span className="relative z-10 text-[10px] font-semibold text-gray-600">
                Menu
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b border-gray-50 text-left">
              <SheetTitle className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Navigation</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-3 space-y-0.5">
                {[
                  { name: 'Search', href: '/search', icon: Search },
                  { name: 'Insights', href: '/insights', icon: Lightbulb },
                  { name: 'Analysis', href: '/analysis', icon: BarChart3 },
                  { name: 'Comparator', href: '/compare', icon: GitCompare },
                  { name: 'Wage Finder', href: '/resources/wage-finder', icon: HandCoins },
                  { name: 'NOC Guide', href: '/resources/noc-codes', icon: BookOpen },
                  { name: 'Blog', href: '/blog', icon: Newspaper },
                  { name: 'Pricing', href: '/pricing', icon: DollarSign },
                ].map((item) => (
                  <CustomLink
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-gray-600 hover:text-brand-600 hover:bg-brand-50/50 transition-all group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-brand-600 shadow-sm border border-gray-100/50">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-semibold">{item.name}</span>
                  </CustomLink>
                ))}
              </div>
              
              <div className="mt-4 px-3">
                <div className="h-px bg-gray-100 mb-4" />
                <div className="space-y-0.5">
                   <CustomLink
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-gray-600 hover:text-brand-600 hover:bg-brand-50/50 transition-all group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-brand-600 shadow-sm border border-gray-100/50">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-semibold">Dashboard</span>
                  </CustomLink>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
               <UserDropdown />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.nav>
  );
}
