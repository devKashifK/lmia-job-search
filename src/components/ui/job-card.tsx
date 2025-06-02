"use client";
import React, { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Bookmark } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Badge } from "@/components/ui/badge";
import { useTableStore } from "@/context/store";
import db from "@/db/index";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const BG_COLORS = [
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
  "bg-brand-200",
  "bg-teal-200",
  "bg-red-200",
  "bg-indigo-200",
  "bg-lime-200",
  "bg-cyan-200",
  "bg-fuchsia-200",
  "bg-rose-200",
  "bg-violet-200",
  "bg-amber-200",
  "bg-emerald-200",
  "bg-sky-200",
  "bg-slate-200",
  "bg-stone-200",
  "bg-gray-200",
  "bg-zinc-200",
  "bg-red-200",
  "bg-brand-200",
];

interface JobCardProps {
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
  type?: "lmia" | "hotLeads";
  // Additional LMIA specific fields
  program?: string;
  lmiaYear?: string;
  priorityOccupation?: string;
  approvedPositions?: string;
  territory?: string;
  recordID?: string;
}

export default function JobCard({
  logoIcon: LogoIcon,
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
  recordID,
  salary,
  type = "hotLeads",
  program,
  lmiaYear,
  priorityOccupation,
  approvedPositions,
  territory,
}: JobCardProps) {
  // Collect tags based on type

  const { session } = useSession();

  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (recordID && session) {
      checkIfSaved(recordID, session).then((isSaved) => setSaved(isSaved));
    }
  }, [recordID, session, saved]);
  const { setSelectedRecordID } = useTableStore();
  const tags =
    type === "lmia"
      ? [
          `Program: ${program}`,
          `Priority Occupation: ${priorityOccupation}`,
          `NOC: ${noc}`,
          `Positions: ${approvedPositions}`,
        ].filter(Boolean)
      : [
          `Employer Type: ${employerType}`,
          `Job Status: ${jobStatus}`,
          `NOC: ${noc}`,
        ].filter(Boolean);

  // Pick a random color for the top section, stable for this card instance
  const randomBg = useMemo(
    () => BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
    []
  );

  // Get location display based on type
  const location =
    type === "lmia"
      ? [city, territory].filter(Boolean).join(", ")
      : [city, state].filter(Boolean).join(", ");

  return (
    <div className="rounded-2xl  w-full max-w-md bg-transparent px-2 py-2 border border-gray-200">
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
            <span className="bg-white text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm font-medium">
              {lmiaYear}
            </span>
          )}
          <TooltipProvider>
            <Tooltip delayDuration={50}>
              <TooltipTrigger asChild>
                <button
                  className="px-2 h-8 flex gap-2 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                  onClick={async () => {
                    if (recordID && session) {
                      await handleSave(recordID, session);
                    }
                    onToggleSaved();
                    const isSaved = await checkIfSaved(recordID, session);
                    setSaved(isSaved);
                  }}
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
                {saved ? "Remove from saved jobs" : "Save this job"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Employer, Job Title, Logo */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xs text-gray-700 font-medium mb-1 line-clamp-1">
              <TooltipProvider delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="line-clamp-1">{jobTitle || "-"}</div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="end"
                    className="max-w-xs bg-black"
                  >
                    {jobTitle || "-"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-xl font-bold text-gray-900 leading-tight mb-1 line-clamp-1">
              <TooltipProvider delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="line-clamp-1">{employerName || "-"}</div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="end"
                    className="max-w-xs bg-black"
                  >
                    {employerName || "-"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
            <Badge
              key={tag}
              variant="secondary"
              className="bg-white/80 hover:bg-white text-gray-700 border border-gray-200/50"
            >
              {tag}
            </Badge>
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
          {location && (
            <div className="text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {location}
              </span>
            </div>
          )}
        </div>
        <button
          className="bg-black text-white px-5 py-1.5 rounded-full font-semibold text-sm shadow hover:bg-gray-800 transition-colors duration-200"
          onClick={() => {
            setSelectedRecordID(recordID);
            onKnowMore();
          }}
        >
          Details
        </button>
      </div>
    </div>
  );
}

const handleSave = async (recordID: string, session: any) => {
  if (!recordID || !session) {
    return;
  }

  const isSaved = await checkIfSaved(recordID, session);
  if (isSaved) {
    const { data, error } = await db
      .from("saved_jobs")
      .delete()
      .eq("record_id", recordID)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error deleting job:", error);

      return;
    }

    toast.success("Job removed from your saved jobs");

    return data;
  }

  const { data, error } = await db.from("saved_jobs").insert({
    record_id: recordID,
    user_id: session.user.id,
  });

  if (error) {
    console.error("Error saving job:", error);
  }

  toast.success("Job saved to your saved jobs");
  return data;
};

const checkIfSaved = async (recordID: string, session: any) => {
  const { data, error } = await db
    .from("saved_jobs")
    .select("record_id")
    .eq("record_id", recordID)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Error checking if job is saved:", error);
  }
  if (data && data.length > 0 && data[0].record_id === recordID) {
    return true;
  }
  return false;
};
