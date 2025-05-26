"use client";
import React, { useMemo } from "react";
import { MapPin } from "lucide-react";
import { Bookmark } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";

const BG_COLORS = [
  "bg-orange-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-pink-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-teal-100",
  "bg-red-100",
  "bg-indigo-100",
  "bg-lime-100",
  "bg-cyan-100",
  "bg-fuchsia-100",
  "bg-rose-100",
  "bg-violet-100",
  "bg-amber-100",
  "bg-emerald-100",
  "bg-sky-100",
  "bg-slate-100",
  "bg-stone-100",
  "bg-gray-100",
  "bg-zinc-100",
  "bg-red-100",
  "bg-brand-100",
];

export default function JobCard({
  logoIcon: LogoIcon,
  saved,
  onToggleSaved,
  employerName,
  jobTitle,
  city,
  state,
  noc,
  jobStatus,
  employerType,
  datePosted,
  onKnowMore,
  salary,
}: {
  logoIcon: React.ElementType;
  saved: boolean;
  onToggleSaved: () => void;
  employerName?: string;
  jobTitle?: string;
  city?: string;
  state?: string;
  noc?: string;
  jobStatus?: string;
  employerType?: string;
  datePosted?: string;
  onKnowMore: () => void;
  salary?: string;
}) {
  // Collect tags
  const tags = [employerType, jobStatus, noc && `NOC: ${noc}`].filter(Boolean);

  // Pick a random color for the top section, stable for this card instance
  const randomBg = useMemo(
    () => BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
    []
  );

  return (
    <div className="rounded-2xl shadow-lg w-full max-w-md bg-transparent px-2 py-2 border border-gray-200">
      {/* Top Section */}
      <div
        className={`${randomBg} rounded-2xl px-5 pt-4 pb-3 flex flex-col relative`}
      >
        {/* Date + Save */}
        <div className="flex items-start justify-between mb-3">
          {datePosted ? (
            <span className="bg-white text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm font-medium">
              {datePosted}
            </span>
          ) : (
            <span />
          )}
          <TooltipProvider>
            <Tooltip delayDuration={50}>
              <TooltipTrigger asChild>
                <button
                  className="px-2 h-8 flex gap-2 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                  onClick={onToggleSaved}
                  type="button"
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      saved ? "fill-black text-black" : "text-gray-400"
                    }`}
                    fill={saved ? "currentColor" : "none"}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" align="end">
                Save this job
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Employer, Job Title, Logo */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xs text-gray-700 font-medium mb-1">
              {employerName || "-"}
            </div>
            <div className="text-xl font-bold text-gray-900 leading-tight mb-1">
              {jobTitle || "-"}
            </div>
          </div>
          {/* <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 border-2 border-gray-200 shadow ml-2 overflow-hidden">
            {typeof LogoIcon === "string" ? (
              <img
                src={LogoIcon}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <LogoIcon className="w-6 h-6 text-black" />
            )}
          </div> */}
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-white text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      {/* Bottom Section */}
      <div className="bg-white rounded-b-2xl px-5 pt-3 pb-4 flex items-end justify-between">
        <div>
          {salary && (
            <div className="text-base font-bold text-gray-900 mb-0.5">
              {salary}
            </div>
          )}
          <div className="text-xs text-gray-600">
            {city || state ? (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {city}
                {city && state ? ", " : ""}
                {state}
              </span>
            ) : null}
          </div>
        </div>
        <button
          className="bg-black text-white px-5 py-1.5 rounded-full font-semibold text-sm shadow hover:bg-gray-800 transition-colors duration-200"
          onClick={onKnowMore}
        >
          Details
        </button>
      </div>
    </div>
  );
}
