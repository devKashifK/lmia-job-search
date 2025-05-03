"use client";

import Header from "@/components/search-components.tsx/header";
import { HeaderSkeleton } from "@/components/search-components.tsx/header-skeleton";
import { SearchEngineSkeleton } from "@/components/search-components.tsx/search-engine-skeleton";
import Topbar from "@/components/search-components.tsx/topbar";
import { useSession } from "@/hooks/use-session";
import SearchEngine from "@/pages/search-engine";

export default function Search({ searchKey }: { searchKey: string }) {
  const session = useSession();
  console.log(session);

  if (!session.session) {
    return (
      <div className="min-h-screen bg-zinc-50/40 max-h-screen overflow-hidden">
        <Topbar />
        <HeaderSkeleton />
        <SearchEngineSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/40">
      <Topbar />

      <Header keywords={searchKey} />
      <SearchEngine keywords={searchKey} />
    </div>
  );
}
