import { MapPin } from "lucide-react";

import { Bookmark, Calendar, Hash } from "lucide-react";

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
}) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 px-4 py-4 flex flex-col gap-2 hover:shadow-lg transition-shadow duration-200">
      {/* Top Row: Logo + Save */}
      <div className="flex items-center justify-between mb-1">
        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
          <LogoIcon className="w-5 h-5 text-brand-600" />
        </div>
        <button
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium transition-colors duration-200 ${
            saved
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-brand-50 text-brand-600 border-brand-200 hover:bg-brand-100"
          }`}
          onClick={onToggleSaved}
          type="button"
        >
          {saved ? "Saved" : "Save"}
          <Bookmark
            className={`w-4 h-4 ml-1 ${
              saved ? "fill-white text-white" : "text-brand-400"
            }`}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>
      {/* Company Name + Posted Date */}
      <div className="flex items-center gap-2 mb-0.5">
        <span className="font-semibold text-brand-600 text-xs">
          {employerName || "-"}
        </span>
        {datePosted && (
          <span className="text-xs text-gray-400 ml-2">
            <Calendar className="inline w-3 h-3 mr-1 -mt-0.5 text-brand-400" />
            {datePosted}
          </span>
        )}
      </div>
      {/* Job Title */}
      <div className="text-base font-bold text-gray-900 mb-1">
        {jobTitle || "-"}
      </div>
      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-1">
        {employerType && (
          <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full text-xs font-medium border border-brand-100">
            {employerType}
          </span>
        )}
        {jobStatus && (
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100">
            {jobStatus}
          </span>
        )}
      </div>
      {/* Divider */}
      <div className="border-t border-gray-100 my-1" />
      {/* Bottom Row: NOC + Know More */}
      <div className="flex items-center justify-between mt-1">
        <span className="flex items-center gap-1 text-xs text-brand-600">
          <Hash className="w-4 h-4 text-brand-400" />
          NOC: {noc || "-"}
        </span>
        <button
          className="bg-brand-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-brand-700 transition-colors duration-200"
          onClick={onKnowMore}
        >
          Know More
        </button>
      </div>
      {/* Location */}
      {(city || state) && (
        <div className="mt-1 text-xs text-black flex items-center gap-1">
          <MapPin className="w-4 h-4 text-brand-400" />
          {city}
          {city && state ? ", " : ""}
          {state}
        </div>
      )}
    </div>
  );
}
