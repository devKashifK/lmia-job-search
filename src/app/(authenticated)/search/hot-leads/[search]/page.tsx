import React from 'react';
import { SearchResultsLayout } from '@/components/ui/search-result-layout';

type PageProps = {
  params: { segment: string; search: string };
  searchParams: Record<string, string | string[] | undefined>;
};
export default async function Engine({ params, searchParams }: PageProps) {
  const { search } = await params;
  const qs = await searchParams;

  const field = (Array.isArray(qs.field) ? qs.field[0] : qs.field) ?? '';

  return (
    <>
      <SearchResultsLayout
        searchKey={search as string}
        field={field as string}
        searchType="hot_leads" // or "lmia"
      />
    </>
  );
}
