import DynamicDataView from '@/components/ui/dynamic-data-view';

type PageProps = {
  params: { segment: string; keyword: string };
  searchParams: Record<string, string | string[] | undefined>;
};
export default function CompanyPage({ params, searchParams }: PageProps) {
  const searchKey = params.keyword; // "Cook" (already decoded by Next)

  // ?field=job_title  (normalize to a single string)
  const field = searchParams.field;

  return (
    <DynamicDataView
      title={decodeURIComponent(searchKey)}
      field={decodeURIComponent(field as string)}
    />
  );
}
