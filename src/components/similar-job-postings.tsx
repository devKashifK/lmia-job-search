'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import db from '@/db';
import {
  MapPin,
  BadgeInfo,
  Briefcase,
  CalendarDays,
  Hash,
  BadgeDollarSign,
  ChartNetwork,
} from 'lucide-react';
import { useTableStore } from '@/context/store';
import { useRouter } from 'next/navigation';

interface Props {
  nocCode: string;
  state: string;
}

interface Job {
  id: string;
  operating_name: string;
  state: string;
  city: string;
  noc_code: string;
  job_title: string;
  date_of_job_posting: string;
  salary?: string;
}

export default function SimilarJobPostings({ nocCode, state }: Props) {
  const navigate = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['similar-jobs', nocCode, state],
    queryFn: async () => {
      const { data, error } = await db
        .from('hot_leads_new')
        .select('*')
        .eq('noc_code', nocCode)
        .eq('state', state);
      if (error) throw error;
      return data as Job[];
    },
  });

  const { setSelectedRecordID } = useTableStore();

  const handleClick = (recordID) => {
    setSelectedRecordID(recordID);
    navigate.push(`/search/noc-profile/${nocCode}`);
  };

  return (
    <div>
      <div className="flex gap-2 justify-start items-center">
        <ChartNetwork className="w-5 h-5" />
        <h3 className="text-lg font-bold mb-2 mt-2">Similar job postings</h3>
      </div>
      <hr className="mb-2" />
      <div className="space-y-3 mb-4">
        {isLoading && <div className="text-gray-400">Loading...</div>}
        {isError && <div className="text-red-500">Failed to load jobs.</div>}
        {!isLoading && data && data.length === 0 && (
          <div className="text-gray-400">No similar jobs found.</div>
        )}
        <div className="flex flex-col h-[450px] overflow-scroll">
          {data &&
            data.map((job) => (
              <div
                onClick={() => handleClick(job.RecordID)}
                key={job.id}
                className="border-b pb-2 pt-2 cursor-pointer"
              >
                <div className="text-brand-700 font-medium hover:underline flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-700" />
                  {job.operating_name}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="font-bold">Address:</span>
                    <span>{job.state},</span>
                    <span>{job.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Hash className="w-3 h-3" />
                    <span className="font-bold">NOC:</span>
                    <span>{job.noc_code}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <BadgeInfo className="w-3 h-3" />
                    <span className="font-bold">Job:</span>
                    <span>{job.job_title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays className="w-3 h-3" />
                    <span className="font-bold">Posted:</span>
                    <span>{job.date_of_job_posting}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <BadgeDollarSign className="w-3 h-3" />
                      <span className="font-bold">Salary:</span>
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
