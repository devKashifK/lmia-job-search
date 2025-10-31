import React from 'react';
import { SearchResultsLayout } from '@/components/ui/search-result-layout';

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
      <SearchResultsLayout
        searchKey={searchKey}
        field={field as string}
        searchType="lmia" // or "lmia"
      />
    </>
  );
}
