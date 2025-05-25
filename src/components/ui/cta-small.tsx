import React from "react";

export default function CtaSmall() {
  return (
    <section className="py-16 relative">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-[0_4px_32px_0_rgba(80,112,255,0.06)] flex flex-col md:flex-row items-center justify-between px-6 py-10 gap-6 border border-gray-100 relative overflow-hidden">
        {/* Illustration */}
        <div className="flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl w-20 h-20 md:w-24 md:h-24">
          {/* Placeholder SVG illustration */}
          <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
            <rect x="4" y="8" width="40" height="32" rx="6" fill="#E0E7FF" />
            <rect x="12" y="16" width="24" height="4" rx="2" fill="#6366F1" />
            <rect x="12" y="24" width="16" height="4" rx="2" fill="#A5B4FC" />
            <circle cx="36" cy="28" r="4" fill="#6366F1" />
          </svg>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Boost your job search with Job Maze services
            </h2>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Get personalized job alerts and more—all in one place!
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 font-medium text-sm border border-brand-100 hover:bg-brand-100 transition">
              <span>🔔</span> Job Alerts
            </button>
          </div>
        </div>
        {/* CTA Button */}
        <div className="flex flex-col items-center md:items-end gap-1">
          <button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3 rounded-full text-base shadow-md transition">
            Get Started
          </button>
          <span className="text-xs text-gray-500 mt-1">
            Includes free and premium features
          </span>
        </div>
        {/* Platform badge */}
        <span className="absolute top-5 right-6 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm hidden md:block">
          by Job Maze
        </span>
      </div>
    </section>
  );
}
