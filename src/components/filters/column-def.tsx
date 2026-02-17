import { ColumnDef } from '@tanstack/react-table';
import {
  AreaChart,
  Briefcase,
  Building,
  DatabaseIcon,
  Map,
  PersonStanding,
  PowerSquare,
  Satellite,
} from 'lucide-react'; // Example icons from Lucide
import { ReactNode } from 'react';

export type LMIA = {
  id: number;
  '2021_noc': string;
  city: string;
  date_of_job_posting: string;
  email: string;
  job_location: string;
  noc_priority: string;
  occupation_title: string;
  operating_name: string;
  state: string;
  job_title?: string;
  noc_code?: string;
  job_status?: string;
  employer_type?: string;
  year?: string;
  territory?: string;
  program?: string;
  lmia_year?: string;
  priority_occupation?: string;
  approved_positions?: string;
  employer?: string;
  category?: string;
  RecordID?: number;
};

interface ColumnMeta {
  icon: ReactNode;
}

type ColumnWithIcon = ColumnDef<LMIA> & {
  meta: ColumnMeta;
  accessorKey: keyof LMIA;
};

export const hotLeadsColumns: ColumnWithIcon[] = [
  {
    accessorKey: 'state',
    meta: { icon: <PersonStanding className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <PersonStanding className="h-3 w-3 text-black/50" />
        <span className="text-xs">State </span>
      </div>
    ),
  },
  {
    accessorKey: 'city',
    meta: { icon: <Satellite className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Satellite className="h-3 w-3 text-black/50" />
        <span className="text-xs">City </span>
      </div>
    ),
  },
  {
    accessorKey: 'date_of_job_posting',
    meta: { icon: <DatabaseIcon className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className="h-3 w-3 text-black/50" />
        <span className="text-xs"> Posted On </span>
      </div>
    ),
    size: 160,
  },
  {
    accessorKey: 'noc_code',
    meta: { icon: <DatabaseIcon className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className="h-3 w-3 text-black/50" />
        <span className="text-xs"> NOC Code </span>
      </div>
    ),
    size: 160,
  },

  {
    accessorKey: 'job_title',
    meta: { icon: <Map className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Map className="h-3 w-3 text-black/50" />
        <span className="text-xs">Job Title</span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: 'employer',
    meta: { icon: <AreaChart className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <AreaChart className="h-3 w-3 text-black/50" />
        <span className="text-xs">Employer</span>
      </div>
    ),
  },
];

export const lmiaColumns: ColumnWithIcon[] = [
  {
    accessorKey: 'territory',
    meta: { icon: <PersonStanding className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <PersonStanding className="h-3 w-3 text-black/50" />
        <span className="text-xs">Province </span>
      </div>
    ),
  },
  {
    accessorKey: 'program',
    meta: { icon: <Satellite className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Satellite className="h-3 w-3 text-black/50" />
        <span className="text-xs">Program </span>
      </div>
    ),
  },
  {
    accessorKey: 'city',
    meta: { icon: <DatabaseIcon className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className="h-3 w-3 text-black/50" />
        <span className="text-xs">City </span>
      </div>
    ),
  },
  {
    accessorKey: 'lmia_year',
    meta: { icon: <Briefcase className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Briefcase className="h-3 w-3 text-black/50" />
        <span className="text-xs">Year </span>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: 'job_title',
    meta: { icon: <Building className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Building className="h-3 w-3 text-black/50" />
        <span className="text-xs">Job Title </span>
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: 'noc_code',
    meta: { icon: <Building className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Building className="h-3 w-3 text-black/50" />
        <span className="text-xs">NOC Code </span>
      </div>
    ),
    size: 160,
  },
  {
    accessorKey: 'priority_occupation',
    meta: { icon: <PowerSquare className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <PowerSquare className="h-3 w-3 text-black/50" />
        <span className="text-xs">Industry </span>
      </div>
    ),
    size: 160,
  },
  {
    accessorKey: 'approved_positions',
    meta: { icon: <Map className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Map className="h-3 w-3 text-black/50" />
        <span className="text-xs">Positions </span>
      </div>
    ),
  },
  {
    accessorKey: 'employer',
    meta: { icon: <AreaChart className="h-3 w-3 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <AreaChart className="h-3 w-3 text-black/50" />
        <span className="text-xs">Operating Name </span>
      </div>
    ),
  },
];
