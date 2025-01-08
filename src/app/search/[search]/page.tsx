import Header from "@/components/search-components.tsx/header";
import { NavigationMenu } from "@/components/search-components.tsx/navigation-menu";
import SearchEngine from "@/pages/search-engine";
import React from "react";

export default async function Engine({
  params,
}: {
  params: Promise<{ search: string }>;
}) {
  console.log((await params).search, "checkParams");
  const searchKey = (await params).search;
  return (
    <div className="bg-[#faf5ff]">
      <NavigationMenu />
      <Header keywords={searchKey} />
      <SearchEngine keywords={searchKey} />
    </div>
  );
}
