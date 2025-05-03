import React from "react";
import Search from "./search-engine";

export default async function Engine({
  params,
}: {
  params: Promise<{ search: string }>;
}) {
  const searchKey = (await params).search;

  return <Search searchKey={searchKey} />;
}
