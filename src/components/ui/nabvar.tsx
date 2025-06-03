"use client";
import { Button } from "@/components/ui/button";
import CustomLink from "@/components/ui/CustomLink";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import UserDropdown from "@/components/ui/user-dropdown";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const solutions = [
  {
    title: "Analytics",
    href: "/analytics",
    description: "Measure and optimize your search performance",
  },
  {
    title: "Engagement",
    href: "/engagement",
    description: "Connect with users through powerful search features",
  },
  {
    title: "Security",
    href: "/security",
    description: "Protect your data with enterprise-grade security",
  },
];

const searchPages = [
  {
    title: "Hot Leads",
    href: "/search",
    description: "Search for Hot Leads",
  },
  {
    title: "LMIA",
    href: "/lmia",
    description: "Search for LMIA jobs and candidates",
  },
];

export default function Navbar({ className }: { className?: string }) {
  const { session, loading } = useSession();

  return (
    <nav
      className={cn(
        "w-full absolute top-0 left-0 bg-transparent z-20 transition-all duration-200",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full pt-6 gap-4">
          {/* Logo on the left */}
          <CustomLink href="/" className="flex items-center min-w-[120px]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                J
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 text-transparent bg-clip-text">
                Job Maze
              </span>
            </div>
          </CustomLink>
          {/* Centered Navigation - Hidden on mobile */}
          <div className="hidden md:flex flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList className="flex flex-row items-center gap-2 md:gap-4">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-4 bg-transparent hover:bg-brand-100/60 data-[state=open]:bg-brand-100/60 text-brand-700 font-medium">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4">
                      {solutions.map((item) => (
                        <NavigationMenuLink
                          key={item.title}
                          href={item.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-brand-50"
                        >
                          <div className="text-sm font-medium text-brand-900">
                            {item.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-brand-500">
                            {item.description}
                          </p>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                {/* 
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-4 bg-transparent hover:bg-brand-100/60 data-[state=open]:bg-brand-100/60 text-brand-700 font-medium">
                    Search
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4">
                      {searchPages.map((item) => (
                        <NavigationMenuLink
                          key={item.title}
                          href={item.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-brand-50"
                        >
                          <div className="text-sm font-medium text-brand-900">
                            {item.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-brand-500">
                            {item.description}
                          </p>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem> */}

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
