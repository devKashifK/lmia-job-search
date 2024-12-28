import { ColumnDef } from "@tanstack/react-table";
import {
  AreaChart,
  Briefcase,
  Building,
  ChevronDown,
  ChevronUp,
  DatabaseIcon,
  Map,
  PersonStanding,
  PowerSquare,
  Satellite,
} from "lucide-react"; // Example icons from Lucide
import { ReactNode } from "react";

export type LMIA = {
  id: number;
  "Province/Territory": string;
  Program: string;
  Employer: string;
  Address: string;
  Occupation: string;
  "Incorporate Status": string;
  "Approved LMIAs": number;
  "Approved Positions": number;
  "LMIA Period": string;
  "LMIA Year": string;
  "LMIA Day": number;
  "2021 NOC": string;
  City: string;
  Postal_Code: string;
  "GTR Lead Type": string;
  "New Key": string;
  "Occupation Title": string;
  Employer_Name: string;
  Operating_Name: string;
  Local_Lead_ID: string;
  "KEY 1": string;
  Key_1: string;
  "Contact Status": string;
  Province_Mapping: string;
  "Check 1": string;
};

export const columns: ColumnDef<LMIA>[] = [
  {
    accessorKey: "Employer_Name",
    icon: <PersonStanding className="ml-2 h-4 w-4 text-gray-500" />,
    header: () => (
      <div className="flex items-center gap-1">
        <PersonStanding className="ml-2 h-4 w-4 text-gray-500" />
        Employer Name
      </div>
    ),
  },
  {
    accessorKey: "City",
    icon: <Satellite className="ml-2 h-4 w-4 text-gray-500" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Satellite className="ml-2 h-4 w-4 text-gray-500" />
        City
      </div>
    ),
  },
  {
    accessorKey: "Program",
    icon: <DatabaseIcon className="ml-2 h-4 w-4 text-gray-500" />,
    header: () => (
      <div className="flex items-center gap-1">
        <DatabaseIcon className="ml-2 h-4 w-4 text-gray-500" />
        Program
      </div>
    ),
  },
  {
    accessorKey: "Occupation Title",
    icon: <Briefcase className="ml-2 h-4 w-4 text-gray-500" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Briefcase className="ml-2 h-4 w-4 text-gray-500" />
        Occupation
      </div>
    ),
  },
  {
    accessorKey: "Province/Territory",
    icon: <Building className="ml-2 h-4 w-4 text-gray-500" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Building className="ml-2 h-4 w-4 text-gray-500" />
        Province
      </div>
    ),
  },
  {
    accessorKey: "Approved Positions",
    icon: <PowerSquare className="ml-2 h-4 w-4 text-gray-500" />,
    header: () => (
      <div className="flex items-center gap-1">
        <PowerSquare className="ml-2 h-4 w-4 text-gray-500" />
        Positions
      </div>
    ),
  },
  {
    accessorKey: "LMIA Year",
    icon: <Map className="ml-2 h-4 w-4 text-gray-500" />,
    header: () => (
      <div className="flex items-center gap-1">
        <Map className="ml-2 h-4 w-4 text-gray-500" />
        LMIA
      </div>
    ),
  },
  {
    accessorKey: "Postal_Code",
    icon: <AreaChart className="ml-2 h-4 w-4 text-gray-500" />,
    header: () => (
      <div className="flex items-center gap-1">
        <AreaChart className="ml-2 h-4 w-4 text-gray-500" />
        Postal
      </div>
    ),
  },
];
