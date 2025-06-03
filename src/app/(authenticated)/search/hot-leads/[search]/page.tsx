import React from "react";
import DynamicDataView from "@/components/ui/dynamic-data-view";
import Navbar from "@/components/ui/nabvar";
import Footer from "@/pages/homepage/footer";

export default async function Engine({
  params,
}: {
  params: Promise<{ search: string }>;
}) {
  const searchKey = (await params).search;

  return (
    <>
      <Navbar className="border-b border-brand-200 pb-4" />
      <div className="mt-14">
        <DynamicDataView title={decodeURIComponent(searchKey)} />
      </div>
      <Footer />
    </>
  );
}
