import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Calendar, MoreHorizontal, Workflow, Building2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';

interface JobHeaderProps {
  title: string;
  company: string;
  location: string;
  salary: string;
  postedDate: string;
  searchType?: 'lmia' | 'hot_leads';
}

const JobHeader = ({
  title,
  company,
  location,
  salary,
  postedDate,
  searchType,
}: JobHeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewCompanyJobs = () => {
    // Get current search type from URL or prop
    const currentSearchType = searchType || (searchParams?.get('t') === 'lmia' ? 'lmia' : 'hot_leads');
    
    // Navigate to dynamic analysis route with company name and search type
    const params = new URLSearchParams();
    params.set('t', currentSearchType);
    
    router.push(`/analysis/${encodeURIComponent(company)}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-black leading-tight mb-3">{title}</h1>
        <div className="flex flex-col gap-1 text-black/70">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-brand-500" />
            <span className="font-medium">{company}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{location}</span>
          </div>
        </div>
      </div>
      
      {/* Call to Action Button */}
      <div className="flex-shrink-0">
        <Button
          onClick={handleViewCompanyJobs}
          className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-lg font-medium"
          size="default"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          See All Jobs by {company}
        </Button>
      </div>
    </div>
  );
};

export { JobHeader };
export default JobHeader;
