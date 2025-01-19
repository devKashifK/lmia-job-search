import Header from "@/components/search-components.tsx/header";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import SearchEngine from "@/pages/search-engine";
import { Bell, Briefcase, Clock, Home, Search, Settings } from "lucide-react";
import Link from "next/link";
import React from "react";

export default async function Engine({
  params,
}: {
  params: Promise<{ search: string }>;
}) {
  const searchKey = (await params).search;
  const active = "search";
  return (
    <div className="min-h-screen bg-active py-0">
      <header className="border-b bg-white ">
        <div className="max-w-screen-full mx-auto">
          <nav className="flex items-center justify-between px-4 py-0 shadow-sm">
            <div className="flex space-x-4">
              <div className="flex items-center gap-2 font-semibold py-2">
                <div className="h-6 w-6 rounded bg-blue-800 text-active flex items-center justify-center text-sm">
                  L
                </div>
                LIMA
              </div>
              <div className="flex  space-x-1   py-0">
                <Link
                  href="#"
                  className="flex items-center px-3 py-2 text-sm hover:bg-active hover:text-blue-800"
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span>Home</span>
                </Link>

                <Link
                  href="#"
                  className={cn(
                    "flex items-center px-3 py-2 text-sm hover:bg-active hover:text-blue-800",
                    active === "search" &&
                      "bg-active text-blue-800 shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]"
                  )}
                >
                  <Search className="w-4 h-4 mr-2" />
                  <span>Search</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center px-3 py-2 text-sm hover:bg-active hover:text-blue-800 "
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>Opportunities</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-1 hover:bg-blue-800 text-black/50 hover:text-white rounded-full">
                <Clock className="w-5 h-5" />
              </button>
              <button className="p-1 hover:bg-blue-800 text-black/50 hover:text-white rounded-full">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-1 hover:bg-blue-800 text-black/50 hover:text-white rounded-full">
                <Settings className="w-5 h-5 " />
              </button>
              <button className=" hover:bg-blue-800 text-active hover:text-white rounded-full">
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                </Avatar>
              </button>
            </div>
          </nav>

          <Header keywords={searchKey} />
        </div>
      </header>
      <SearchEngine keywords={searchKey} />
    </div>
  );
}
