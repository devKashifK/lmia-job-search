import CustomLink from "@/app/CustomLink";
import Header from "@/components/search-components.tsx/header";
import Topbar from "@/components/search-components.tsx/topbar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import SearchEngine from "@/pages/search-engine";
import {
  Bell,
  Briefcase,
  Clock,
  Home,
  LayoutDashboardIcon,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import React, { cloneElement } from "react";

export default async function Engine({
  params,
}: {
  params: Promise<{ search: string }>;
}) {
  const searchKey = (await params).search;
  const active = "search";

  return (
    <div className="min-h-screen bg-zinc-50/40">
      <Topbar searchKey={searchKey} />

      <Header keywords={searchKey} />
      <SearchEngine keywords={searchKey} />
    </div>
  );
}
