import React from 'react';
import Navbar from '@/components/ui/nabvar';
import DynamicDataView from '@/components/ui/dynamic-data-view';
import Footer from '@/pages/homepage/footer';

type PageProps = {
  params: { segment: string; search: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Engine({ params, searchParams }: PageProps) {
  const searchKey = params.search; // "Cook" (already decoded by Next)

  // ?field=job_title  (normalize to a single string)
  const field = searchParams.field;
  return (
    <>
      <Navbar className="" />
      <div className="pt-24">
        <DynamicDataView
          title={decodeURIComponent(searchKey)}
          field={decodeURIComponent(field as string)}
        />
      </div>
      <Footer />
    </>
  );
}
