import Header from "@/components/search-components.tsx/header";
import { NavigationMenu } from "@/components/search-components.tsx/navigation-menu";
import SearchEngine from "@/pages/search-engine";
import React from "react";

export default function page() {
  return (
    <div>
      <NavigationMenu />
      <Header />
      <SearchEngine />
    </div>
  );
}
