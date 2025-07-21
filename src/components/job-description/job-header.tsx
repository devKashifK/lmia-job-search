import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Calendar, MoreHorizontal, Workflow } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JobHeaderProps {
  title: string;
  company: string;
  location: string;
  salary: string;
  postedDate: string;
}

const JobHeader = ({
  title,
  company,
  location,
  salary,
  postedDate,
}: JobHeaderProps) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
    <div className="flex-1 mb-4 md:mb-0">
      <h1 className="text-3xl font-bold text-black">{title}</h1>
      <div className="flex flex-col items-start  text-black/70">
        <span>{company}</span>
        <span>{location}</span>
      </div>
    </div>
    <div className="flex gap-4 items-end justify-end md:items-end space-y-2">
      <Button
        variant="outline"
        size={'sm'}
        className="text-black hover:text-brand-500  hover:bg-brand-500/10"
      >
          <Workflow className="h-5 w-5" />
        {salary}
      </Button>
      <Button
        variant="outline"
        size={'sm'}
        className="text-black hover:text-brand-500  hover:bg-brand-500/10"
      >
          <Calendar className="h-5 w-5" />
        {postedDate}
      </Button>
      <Button
          variant="outline"
          size={'sm'}
          className="text-black hover:text-brand-500 hover:bg-brand-500/10"
        >
          <Bookmark className="h-5 w-5" />
          <span>Save this</span>
        </Button>
     
    </div>
  </div>
);

export { JobHeader };
export default JobHeader;
