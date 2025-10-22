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
        'w-full absolute top-0 left-0 bg-transparent z-20 transition-all duration-200',
        className
      )}
    >
      <div className="max-w-full mx-auto px-12 sm:px-6 lg:px-10 lg:pr-16">
        <div className="flex items-center justify-between w-full pt-6 gap-4">
          {/* Logo on the left */}
          <CustomLink href="/" className="flex items-center min-w-[120px]">
            <div className="flex items-center gap-2">
              {/* <Logo className="h-12 w-12 rounded-lg text-brand-600" /> */}
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 text-transparent bg-clip-text leading-none">
                Job Maze
              </span>
            </div>
          </CustomLink>
          {/* Centered Navigation - Hidden on mobile */}
          <div className="hidden md:flex flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList className="flex flex-row items-center gap-2 md:gap-4">
                <NavigationMenuItem>
                  <CustomLink
                    href="/search"
                    className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100/60 transition-colors"
                  >
                    Search
                  </CustomLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <CustomLink
                    href="/pricing"
                    className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100/60 transition-colors"
                  >
                    Pricing
                  </CustomLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <CustomLink
                    href="/contact"
                    className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100/60 transition-colors"
                  >
                    Contact
                  </CustomLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {/* Right Section (auth) - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 md:gap-4 min-w-[120px] justify-end">
            {loading ? (
              <div className="h-9 w-24 bg-brand-100/50 rounded-md animate-pulse" />
            ) : session ? (
              <>
                <Button
                  variant="ghost"
                  className="h-9 px-4 text-brand-700 hover:bg-brand-100/60"
                  asChild
                >
                  <CustomLink href="/dashboard">Dashboard</CustomLink>
                </Button>
                <UserDropdown />
              </>
            ) : (
              <Button
                className="h-9 px-4 bg-brand-600 hover:bg-brand-700 text-white"
                asChild
              >
                <CustomLink href="/sign-in">Get Started</CustomLink>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
