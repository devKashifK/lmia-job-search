import Header from "@/components/search-components.tsx/header";
import Topbar from "@/components/search-components.tsx/topbar";
import SearchEngine from "@/pages/search-engine";
import React from "react";

export default async function Engine({
  params,
}: {
  params: Promise<{ search: string }>;
}) {
  const searchKey = (await params).search;

  return (
    <div className="min-h-screen bg-zinc-50/40">
      <Topbar />

      <Header keywords={searchKey} />
      <SearchEngine keywords={searchKey} />
    </div>
  );
}
