"use client";

import { SearchEngineSkeleton } from "@/components/search-components.tsx/search-engine-skeleton";
import Topbar from "@/components/search-components.tsx/topbar";
import { useSession } from "@/hooks/use-session";
import SearchEngine from "@/pages/search-engine";

export default function Search({ searchKey }: { searchKey: string }) {
  const session = useSession();
  console.log(session, "checkSession");

  if (!session.session && !session.loading) {
    return (
      <div className="min-h-screen bg-zinc-50/40 max-h-screen overflow-hidden">
        <SearchEngineSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/40">
      <Topbar keywords={searchKey} type="hot_leads" />
      <SearchEngine keywords={searchKey} type="hot_leads" />
    </div>
  );
}
