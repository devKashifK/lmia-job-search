"use client";
import { useEffect, useState } from "react";
import { Menu, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CustomLink from "@/app/CustomLink";
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

export default function Navbar({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const { session } = useSession();

  console.log(session, "session");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 14) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={cn(
        "w-full transition-all duration-200",
        isFixed
          ? "fixed top-0 bg-white/80 backdrop-blur-lg shadow-sm border-b border-zinc-200/50 z-50"
          : "relative bg-white z-50",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <CustomLink href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text">
                SearchPro
              </span>
            </CustomLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-9 px-4 hover:bg-zinc-100 data-[state=open]:bg-zinc-100">
                      Solutions
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[400px] gap-3 p-4">
                        {solutions.map((item) => (
                          <NavigationMenuLink
                            key={item.title}
                            href={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-zinc-100"
                          >
                            <div className="text-sm font-medium text-zinc-900">
                              {item.title}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-zinc-500">
                              {item.description}
                            </p>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <CustomLink
                      href="/pricing"
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100"
                    >
                      Pricing
                    </CustomLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <CustomLink
                      href="/contact"
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100"
                    >
                      Contact
                    </CustomLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <CustomLink
                      href="/search"
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100"
                    >
                      Search
                    </CustomLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="h-9 px-4 hover:bg-zinc-100"
                  asChild
                >
                  <CustomLink href="/dashboard">Dashboard</CustomLink>
                </Button>
                <UserDropdown />
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="h-9 px-4 hover:bg-zinc-100"
                  asChild
                >
                  <CustomLink href="/sign-in">Sign in</CustomLink>
                </Button>
                <Button
                  className="h-9 px-4 bg-orange-600 hover:bg-orange-700"
                  asChild
                >
                  <CustomLink href="/sign-up">Get Started</CustomLink>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-zinc-100"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-6">
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-zinc-500 uppercase">
                      Solutions
                    </div>
                    {solutions.map((item) => (
                      <CustomLink
                        key={item.title}
                        href={item.href}
                        className="block text-sm text-zinc-600 hover:text-orange-600"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.title}
                      </CustomLink>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-zinc-500 uppercase">
                      Menu
                    </div>
                    <CustomLink
                      href="/pricing"
                      className="block text-sm text-zinc-600 hover:text-orange-600"
                      onClick={() => setIsOpen(false)}
                    >
                      Pricing
                    </CustomLink>
                    <CustomLink
                      href="/search"
                      className="block text-sm text-zinc-600 hover:text-orange-600"
                      onClick={() => setIsOpen(false)}
                    >
                      Search
                    </CustomLink>
                  </div>
                  {!session && (
                    <div className="space-y-3 pt-4 border-t border-zinc-200">
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-2 hover:bg-zinc-100"
                        asChild
                      >
                        <CustomLink href="/sign-in">Sign in</CustomLink>
                      </Button>
                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        asChild
                      >
                        <CustomLink href="/sign-up">Get Started</CustomLink>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
