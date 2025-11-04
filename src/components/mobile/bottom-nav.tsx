'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  BarChart3,
  User,
  GitCompare,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomLink from '../ui/CustomLink';

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    name: 'Search',
    icon: Search,
    href: '/search',
  },
  {
    name: 'Compare',
    icon: GitCompare,
    href: '/compare',
  },
  {
    name: 'Analysis',
    icon: BarChart3,
    href: '/analysis',
  },
  {
    name: 'Profile',
    icon: User,
    href: '/dashboard/profile',
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
      </div>
    </motion.nav>
  );
}
