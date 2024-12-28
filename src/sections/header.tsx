"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Home", href: "#" },
  { name: "Find Jobs", href: "#" },
  { name: "Employers", href: "#" },
  { name: "Admin", href: "#" },
  { name: "About U", href: "#" },
  { name: "Search Engine", href: "/search" },
];

export function Header() {
  return (
    <header className="py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Search className="w-6 h-6 text-purple-600" />
        <span className="text-xl font-bold">GTR</span>
      </div>

      <nav className="hidden md:flex items-center space-x-6 ">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-gray-600 hover:text-purple-600"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          Contact Us
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700">Login</Button>
      </div>
    </header>
  );
}
