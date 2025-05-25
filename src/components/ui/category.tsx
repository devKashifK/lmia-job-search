import React from "react";
import {
  Car,
  Building,
  Hospital,
  Utensils,
  Wheat,
  Store,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const categories = [
  {
    icon: <Car className="h-5 w-5" />,
    noc_priority: "Automotive_Maintenance",
    description: "Jobs in vehicle maintenance and repair",
    bg: "bg-violet-50",
  },
  {
    icon: <Building className="h-5 w-5" />,
    noc_priority: "Construction",
    description: "Construction and building trades",
    bg: "bg-yellow-50",
  },
  {
    icon: <Wheat className="h-5 w-5" />,
    noc_priority: "Farm",
    description: "Agricultural and farming positions",
    bg: "bg-blue-50",
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    noc_priority: "F&B",
    description: "Food and beverage service jobs",
    bg: "bg-yellow-50",
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    noc_priority: "Food Processing",
    description: "Food manufacturing and processing",
    bg: "bg-violet-50",
  },
  {
    icon: <Hospital className="h-5 w-5" />,
    noc_priority: "Healthcare",
    description: "Medical and healthcare positions",
    bg: "bg-blue-50",
  },
  {
    icon: <Store className="h-5 w-5" />,
    noc_priority: "Office_Retail",
    description: "Office and retail positions",
    bg: "bg-yellow-50",
  },
];

export default function Category() {
  return (
    <div className="flex flex-wrap gap-4 max-w-7xl mx-auto justify-center items-center p-4">
      {categories.map((category) => (
        <Link
          href={`/jobs?category=${category.noc_priority}`}
          key={category.noc_priority}
          className="min-w-[150px] max-w-[240px] w-full"
        >
          <div
            className={
              `flex items-center gap-3 px-3 py-1 rounded-lg  border-brand-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ` +
              `h-[56px]`
            }
          >
            <span
              className={`flex items-center justify-center rounded-full bg-brand-400/10 w-9 h-9`}
            >
              {category.icon}
            </span>
            <span className="flex-1 truncate font-semibold text-brand-700 text-base text-left">
              {category.noc_priority.replace(/_/g, " ")}
            </span>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>
        </Link>
      ))}
    </div>
  );
}
