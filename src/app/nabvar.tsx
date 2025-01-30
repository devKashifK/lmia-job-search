"use client";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CustomLink from "@/app/CustomLink";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import UserDropdown from "@/components/ui/user-dropdown";

const navigation = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "/about-us" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "/contact" },
  { name: "Search", href: "/search" },
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
        "w-full  transition-all  duration-100 animate-linear",
        isFixed
          ? "fixed top-0 bg-gray-900 shadow-lg z-50 text-white"
          : `relative bg-white text-gray-600 z-50" ${className}`
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <CustomLink href="/" className="flex items-center cursor-pointer">
            <span className="text-2xl font-bold ">SearchPro</span>
          </CustomLink>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <CustomLink
                key={item.name}
                href={item.href}
                className=" hover:text-orange-600 transition-colors"
              >
                {item.name}
              </CustomLink>
            ))}
            {session ? (
              <div className="flex items-center space-x-4">
                <CustomLink
                  href="/dashboard/profile"
                  className=" hover:text-orange-600 transition-colors"
                >
                  Dashboard
                </CustomLink>
                <UserDropdown />
              </div>
            ) : (
              <>
                <CustomLink
                  href="/sign-in"
                  className=" hover:text-orange-600 transition-colors"
                >
                  Sign In
                </CustomLink>
                <Button className="bg-orange-600 hover:bg-orange-700 rounded-full">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-white hover:text-orange-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                  <Button className="bg-orange-600 hover:bg-orange-700 w-full rounded-full">
                    Sign Up
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
