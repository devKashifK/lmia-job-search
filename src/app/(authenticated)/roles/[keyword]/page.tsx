import React from "react";
import RolesClient from "./client";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [{ keyword: "all" }];
}

type PageProps = {
  params: Promise<{ keyword: string }>;
};

export default async function RolesPage({ params }: PageProps) {
  const { keyword } = await params;

  return <RolesClient keyword={keyword} />;
}
