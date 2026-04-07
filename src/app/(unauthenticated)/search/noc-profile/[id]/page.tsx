import JobDescription from '@/components/ui/job-description';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import React from 'react';
import JobMarketInfo from '@/components/job-market-info';

async function NocProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Navbar className="relative border-b pb-2" />
      <div className="min-h-screen w-full flex space-x-8 mx-auto px-24 py-8">
        <JobDescription id={id} />
        <div className="w-[30%] flex justify-end">
          <JobMarketInfo id={id} />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default NocProfile;
