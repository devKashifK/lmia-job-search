'use client';
import React from 'react';
import { useSelectedColumnRecord } from './ui/dynamic-data-view';
import { Info, ArrowRight, SquareLibrary } from 'lucide-react';
import SimilarJobPostings from './similar-job-postings';
import { useRouter } from 'next/navigation';

interface JobMarketInfoProps {
  id: string;
}

function isJobRecord(
  jd: unknown
): jd is { operating_name?: string; state?: string; city?: string } {
  return typeof jd === 'object' && jd !== null;
}

export default function JobMarketInfo({ id }: JobMarketInfoProps) {
  const { data: jd } = useSelectedColumnRecord();
  console.log(jd);
  const navigate = useRouter();

  const handleClick = () => {
    navigate.push(`/analysis/${jd?.operating_name}`);
  };

  return (
    <aside className="bg-white border-l pt-6 w-full pl-6 flex flex-col gap-2">
      <div>
        <div className="flex gap-2 justify-start items-center">
          <SquareLibrary className="w-5 h-5" />
          <h3 className="text-lg font-bold mb-2 mt-2">Related Information</h3>
        </div>
        <h2 className="text-xl font-bold mb-1"></h2>
        <hr className="mb-4" />
        <div className="mb-2">
          <button
            onClick={handleClick}
            className="w-full flex items-center justify-between gap-2 text-xs px-4 py-3 rounded-lg bg-brand-50 hover:bg-brand-100 border border-brand-100 shadow-sm transition group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <span className="flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-700" />
              <span className="text-brand-700 text-xs font-semibold">
                Run deep analysis on{' '}
                <span className="underline">
                  {isJobRecord(jd) && jd.operating_name
                    ? jd.operating_name
                    : '...'}
                </span>
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-brand-700 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>
      <SimilarJobPostings
        nocCode={id}
        state={isJobRecord(jd) && jd.state ? jd.state : ''}
      />
    </aside>
  );
}
