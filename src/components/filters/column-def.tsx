import { ColumnDef } from "@tanstack/react-table";
import {
  AreaChart,
  Briefcase,
  Building,
  DatabaseIcon,
  Map,
  PersonStanding,
  PowerSquare,
  Satellite,
} from "lucide-react"; // Example icons from Lucide
import { ReactNode } from "react";

export type LMIA = {
  id: number;
  "2021_noc": string;
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
    accessorKey: "state",
    meta: { icon: <PersonStanding className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <PersonStanding className="h-5 w-5 text-black/50" />
        State
      </div>
    ),
  },
  {
    accessorKey: "city",
    meta: { icon: <Satellite className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Satellite className="h-5 w-5 text-black/50" />
        City
      </div>
    ),
  },
  {
    accessorKey: "date_of_job_posting",
    meta: { icon: <DatabaseIcon className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className="h-5 w-5 text-black/50" />
        Posted On
      </div>
    ),
  },
  {
    accessorKey: "noc_code",
    meta: { icon: <DatabaseIcon className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className="h-5 w-5 text-black/50" />
        NOC Code
      </div>
    ),
  },
  {
    accessorKey: "noc_priority",
    meta: { icon: <PowerSquare className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <PowerSquare className="h-5 w-5 text-black/50" />
        Industry
      </div>
    ),
  },
  {
    accessorKey: "job_title",
    meta: { icon: <Map className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Map className="h-5 w-5 text-black/50" />
        Job Title
      </div>
    ),
  },
  {
    accessorKey: "operating_name",
    meta: { icon: <AreaChart className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <AreaChart className="h-5 w-5 text-black/50" />
        Operating Name
      </div>
    ),
  },
  {
    accessorKey: "year",
    meta: { icon: <AreaChart className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <AreaChart className="h-5 w-5 text-black/50" />
        Year
      </div>
    ),
  },
];

export const lmiaColumns: ColumnWithIcon[] = [
  {
    accessorKey: "territory",
    meta: { icon: <PersonStanding className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <PersonStanding className="h-5 w-5 text-black/50" />
        Province
      </div>
    ),
  },
  {
    accessorKey: "program",
    meta: { icon: <Satellite className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Satellite className="h-5 w-5 text-black/50" />
        Program
      </div>
    ),
  },
  {
    accessorKey: "city",
    meta: { icon: <DatabaseIcon className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className="h-5 w-5 text-black/50" />
        City
      </div>
    ),
  },
  {
    accessorKey: "lmia_year",
    meta: { icon: <Briefcase className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Briefcase className="h-5 w-5 text-black/50" />
        Year
      </div>
    ),
  },
  {
    accessorKey: "job_title",
    meta: { icon: <Building className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Building className="h-5 w-5 text-black/50" />
        Job Title
      </div>
    ),
  },
  {
    accessorKey: "noc_code",
    meta: { icon: <Building className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Building className="h-5 w-5 text-black/50" />
        Job Title
      </div>
    ),
  },
  {
    accessorKey: "priority_occupation",
    meta: { icon: <PowerSquare className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <PowerSquare className="h-5 w-5 text-black/50" />
        Occupation
      </div>
    ),
  },
  {
    accessorKey: "approved_positions",
    meta: { icon: <Map className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <Map className="h-5 w-5 text-black/50" />
        Positions
      </div>
    ),
  },
  {
    accessorKey: "operating_name",
    meta: { icon: <AreaChart className="h-5 w-5 text-black/50" /> },
    header: () => (
      <div className="flex items-center gap-1">
        <AreaChart className="h-5 w-5 text-black/50" />
        Operating Name
      </div>
    ),
  },
];
