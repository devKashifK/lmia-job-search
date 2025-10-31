import { SearchResultsLayout } from '@/components/ui/search-result-layout';

type PageProps = {
  params: { segment: string; keyword: string };
  searchParams: Record<string, string | string[] | undefined>;
};
export default function CompanyPage({ params, searchParams }: PageProps) {
  const searchKey = params.keyword; // "Cook" (already decoded by Next)

  // ?field=job_title  (normalize to a single string)
  const field = searchParams.field;

  return (
    <SearchResultsLayout
      searchKey={searchKey}
      field={field as string}
      searchType="company" // or "lmia"
    />
  );
}
