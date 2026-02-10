'use client';
import { Button } from '@/components/ui/button';
import CustomLink from '@/components/ui/CustomLink';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import UserDropdown from '@/components/ui/user-dropdown';
import { NotificationsPopover } from '@/components/ui/notifications-popover';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import Logo from '@/components/ui/logo';
import useMobile from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar({ className }: { className?: string }) {
  const { session, loading } = useSession();
  const { isMobile } = useMobile();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isMobile) return null;

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50 flex justify-center py-4 px-4 transition-all duration-300 pointer-events-none", className)}>
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "pointer-events-auto flex items-center justify-between w-full max-w-5xl rounded-full px-5 py-3 transition-all duration-300",
          scrolled
            ? "bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg shadow-black/5"
            : "bg-white/60 backdrop-blur-md border border-white/20 shadow-sm"
        )}
      >
        {/* Logo Section */}
        <CustomLink href="/" className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500 shadow-md transform group-hover:scale-105 transition-all duration-300">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            Job Maze
          </span>
        </CustomLink>

        {/* Navigation Links */}
        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/30">
            {[
              { name: 'Search', href: '/search' },
              { name: 'Analysis', href: '/analysis' },
              { name: 'Comparator', href: '/compare' },
              { name: 'NOC Guide', href: '/resources/noc-codes' },
              { name: 'Pricing', href: '/pricing' },
              { name: 'Contact', href: '/contact' },
            ].map((item) => (
              <NavigationMenuItem key={item.name}>
                <CustomLink
                  href={item.href}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  {item.name}
                </CustomLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 bg-gray-100/50 rounded-full animate-pulse" />
          ) : session ? (
            <>
              <Button
                variant="ghost"
                className="hidden lg:flex h-9 px-4 rounded-full text-sm font-semibold text-gray-600 hover:text-brand-600 hover:bg-brand-50/50"
                asChild
              >
                <CustomLink href="/dashboard">Dashboard</CustomLink>
              </Button>
              <NotificationsPopover />
              <div className="pl-1"><UserDropdown /></div>
            </>
          ) : (
            <>
              <CustomLink
                href="/sign-in"
                className="text-sm font-bold text-gray-600 hover:text-gray-900 px-3 transition-colors"
              >
                Log in
              </CustomLink>
              <Button
                className="h-9 px-5 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                asChild
              >
                <CustomLink href="/sign-in">Sign up</CustomLink>
              </Button>
            </>
          )}
        </div>
      </motion.nav>
    </div>
  );
}
