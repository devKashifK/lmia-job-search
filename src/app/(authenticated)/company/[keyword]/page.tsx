import { SearchResultsLayout } from '@/components/ui/search-result-layout';

type PageProps = {
  params: Promise<{ segment: string; keyword: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [{ keyword: 'company' }];
}
export default async function CompanyPage({ params, searchParams }: PageProps) {
  const { keyword } = await params;
  const { field } = await searchParams;

  const searchKey = decodeURIComponent(keyword);

  return (
    <SearchResultsLayout
      searchKey={searchKey}
      field={field as string}
      searchType="lmia" // or "lmia"
    />
  );
}
