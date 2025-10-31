import Footer from '@/pages/homepage/footer';
import DynamicDataView from './dynamic-data-view';
import Navbar from './nabvar';

export function SearchResultsLayout({
  searchKey,
  field,
  searchType,
}: {
  searchKey: string;
  field: string;
  searchType: 'hot_leads' | 'lmia';
}) {
  return (
    <>
      <Navbar className="" />
      <div className="pt-24">
        <DynamicDataView
          title={decodeURIComponent(searchKey)}
          field={decodeURIComponent(field)}
          searchType={searchType}
        />
      </div>
      <Footer />
    </>
  );
}
