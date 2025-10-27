'use client';
import { Button } from '@/components/ui/button';
import CustomLink from '@/components/ui/CustomLink';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import UserDropdown from '@/components/ui/user-dropdown';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import Logo from '@/components/ui/logo';

export default function Navbar({ className }: { className?: string }) {
  const { session, loading } = useSession();

  return (
    <nav
      className={cn(
        'w-full absolute top-0 left-0 z-20 transition-all duration-300',
        className
      )}
    >
      <div className="max-w-full mx-auto px-16">
        <div className="mt-4 mb-6 backdrop-blur-xl bg-white/90 border border-gray-200/50 shadow-sm shadow-brand-500/5 rounded-2xl hover:shadow-2xl hover:shadow-brand-500/10 transition-shadow duration-300">
          <div className="flex items-center justify-between w-full px-6 py-3.5 gap-4">
            {/* Logo */}
            <CustomLink
              href="/"
              className="flex items-center min-w-[140px] group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 rounded-xl blur-lg opacity-30 group-hover:opacity-60 group-hover:blur-xl transition-all duration-500 animate-pulse" />
                  {/* Logo container */}
                  <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 shadow-lg group-hover:shadow-2xl group-hover:shadow-brand-500/50 group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                    <Logo className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-transparent bg-clip-text leading-tight group-hover:from-brand-500 group-hover:via-brand-600 group-hover:to-brand-700 transition-all duration-300">
                    Job Maze
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 group-hover:text-brand-600 leading-none transition-colors duration-300">
                    Find Your Dream Job
                  </span>
                </div>
              </div>
            </CustomLink>
            {/* Navigation */}
            <div className="hidden md:flex flex-1 justify-center">
              <NavigationMenu>
                <NavigationMenuList className="flex flex-row items-center gap-2">
                  <NavigationMenuItem>
                    <CustomLink
                      href="/search"
                      className="relative inline-flex h-9 items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold text-gray-700 hover:text-brand-700 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-100/50 transition-all duration-200 group overflow-hidden"
                    >
                      <span className="relative z-10">Search</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 to-brand-600/0 group-hover:from-brand-500/5 group-hover:to-brand-600/5 transition-all duration-300" />
                    </CustomLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <CustomLink
                      href="/pricing"
                      className="relative inline-flex h-9 items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold text-gray-700 hover:text-brand-700 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-100/50 transition-all duration-200 group overflow-hidden"
                    >
                      <span className="relative z-10">Pricing</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 to-brand-600/0 group-hover:from-brand-500/5 group-hover:to-brand-600/5 transition-all duration-300" />
                    </CustomLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <CustomLink
                      href="/contact"
                      className="relative inline-flex h-9 items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold text-gray-700 hover:text-brand-700 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-100/50 transition-all duration-200 group overflow-hidden"
                    >
                      <span className="relative z-10">Contact</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 to-brand-600/0 group-hover:from-brand-500/5 group-hover:to-brand-600/5 transition-all duration-300" />
                    </CustomLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-2 min-w-[120px] justify-end">
              {loading ? (
                <div className="h-9 w-24 bg-gradient-to-r from-brand-100 to-brand-200 rounded-xl animate-pulse" />
              ) : session ? (
                <>
                  <Button
                    variant="ghost"
                    className="h-9 px-5 text-gray-700 font-semibold hover:text-brand-700 hover:bg-gradient-to-r hover:from-brand-50 hover:to-brand-100/50 rounded-xl transition-all duration-200"
                    asChild
                  >
                    <CustomLink href="/dashboard">Dashboard</CustomLink>
                  </Button>
                  <UserDropdown />
                </>
              ) : (
                <Button
                  className="h-9 px-6 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 hover:from-brand-600 hover:via-brand-700 hover:to-brand-800 text-white font-bold rounded-xl shadow-lg shadow-brand-500/40 hover:shadow-xl hover:shadow-brand-600/50 transition-all duration-300 hover:scale-105 border border-brand-400/20"
                  asChild
                >
                  <CustomLink href="/sign-in">Get Started</CustomLink>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
