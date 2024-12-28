"use client";

import { Bookmark } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  type: "FULL-TIME" | "PART-TIME";
  salary: string;
  logo: string;
  applicants: string;
}

export function JobCard({
  title,
  company,
  location,
  type,
  salary,
  logo,
  applicants,
}: JobCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg relative">
      <Bookmark className="absolute top-4 right-4 text-gray-400 hover:text-purple-600 cursor-pointer" />
      <div className="mb-4">
        <span
          className={`text-xs px-3 py-1 rounded-full ${
            type === "FULL-TIME"
              ? "bg-purple-100 text-purple-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {type}
        </span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{salary}</p>

      <div className="flex items-center mb-4">
        <div className="w-8 h-8 mr-3">
          <Image src={logo} alt={company} width={32} height={32} />
        </div>
        <div>
          <p className="font-semibold">{company}</p>
          <p className="text-sm text-gray-600">{location}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {applicants} applicants
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            View details
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Apply now
          </Button>
        </div>
      </div>
    </div>
  );
}
