'use client';
import Footer from '@/sections/homepage/footer';
import DynamicDataView from './dynamic-data-view';
import Navbar from './nabvar';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';

export function SearchResultsLayout({
  searchKey,
  field,
  searchType,
}: {
  searchKey: string;
  field: string;
  searchType: 'hot_leads' | 'lmia';
}) {
  const { isMobile } = useMobile();

  return (
    <>
      {isMobile ? (
        <MobileHeader title="Search Results" showBack={true} />
      ) : (
        <Navbar className="" />
      )}
      <div className={isMobile ? '' : 'pt-16'}>
        <DynamicDataView
          title={decodeURIComponent(searchKey)}
          field={decodeURIComponent(field)}
          searchType={searchType}
        />
      </div>
      {!isMobile && <Footer />}
    </>
  );
}
