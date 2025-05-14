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
};

export const hotLeadsColumns: ColumnDef<LMIA>[] = [
  {
    accessorKey: "state",
    icon: <PersonStanding className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <PersonStanding className=" h-5 w-5 text-black/50" />
        State
      </div>
    ),
  },
  {
    accessorKey: "city",
    icon: <Satellite className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Satellite className=" h-5 w-5 text-black/50" />
        City
      </div>
    ),
  },
  {
    accessorKey: "date_of_job_posting",
    icon: <DatabaseIcon className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className=" h-5 w-5 text-black/50" />
        Date of Job Posting
      </div>
    ),
  },

  {
    accessorKey: "noc_priority",
    icon: <PowerSquare className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <PowerSquare className=" h-5 w-5 text-black/50" />
        Industry
      </div>
    ),
  },
  {
    accessorKey: "job_title",
    icon: <Map className="h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Map className=" h-5 w-5 text-black/50" />
        Job Title
      </div>
    ),
  },
  {
    accessorKey: "operating_name",
    icon: <AreaChart className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <AreaChart className=" h-5 w-5 text-black/50" />
        Operating Name
      </div>
    ),
  },
];

export const lmiaColumns: ColumnDef<LMIA>[] = [
  {
    accessorKey: "territory",
    icon: <PersonStanding className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <PersonStanding className=" h-5 w-5 text-black/50" />
        Province
      </div>
    ),
  },
  {
    accessorKey: "program",
    icon: <Satellite className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Satellite className=" h-5 w-5 text-black/50" />
        Program
      </div>
    ),
  },
  {
    accessorKey: "city",
    icon: <DatabaseIcon className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className=" h-5 w-5 text-black/50" />
        City
      </div>
    ),
  },
  {
    accessorKey: "lmia_year",
    icon: <Briefcase className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Briefcase className=" h-5 w-5 text-black/50" />
        Year
      </div>
    ),
  },
  {
    accessorKey: "job_title",
    icon: <Building className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Building className=" h-5 w-5 text-black/50" />
        Job Title
      </div>
    ),
  },
  {
    accessorKey: "priority_occupation",
    icon: <PowerSquare className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <PowerSquare className=" h-5 w-5 text-black/50" />
        Occupation
      </div>
    ),
  },
  {
    accessorKey: "approved_positions",
    icon: <Map className="h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Map className=" h-5 w-5 text-black/50" />
        Positions
      </div>
    ),
  },
  {
    accessorKey: "operating_name",
    icon: <AreaChart className=" h-5 w-5 text-black/50" />,
    header: () => (
      <div className="flex items-center gap-1">
        <AreaChart className=" h-5 w-5 text-black/50" />
        Operating Name
      </div>
    ),
  },
];
