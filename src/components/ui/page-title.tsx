import { AttributeName } from '@/helpers/attribute';
import React from 'react';
import { Badge } from './badge';
import { useData } from './dynamic-data-view';
import { useSearchParams } from 'next/navigation';

interface PageTitleProps {
  title: string;
  count?: number;
  showVerified?: boolean;
  className?: string;
}

export default function PageTitle({
  title,
  showVerified = true,
  className = '',
}: PageTitleProps) {
  const { data } = useData('');
  const sp = useSearchParams();

  // table from URL (fallback to trending_job)
  const tableName = (sp?.get('t') ?? 'trending_job').trim();
  const count = data?.count;
  return (
    <div className={`flex flex-col gap-2 mb-2 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-brand-600 rounded-full"></div>
        <AttributeName
          className="text-2xl font-bold text-gray-900"
          name={title}
        />
        <Badge variant="outline">
          <AttributeName name={tableName} />
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {/* {count !== undefined && (
          <span className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-500"
            >
              <path d="M21 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {count} job opportunities
          </span>
        )} */}
        {/* {count !== undefined && showVerified && (
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        )} */}
        {/* {showVerified && (
          <span className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand-500"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            Verified employers
          </span>
        )} */}
      </div>
    </div>
  );
}
