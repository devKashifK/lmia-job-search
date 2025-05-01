"use client";

import { useState, useEffect, useRef } from "react";
import { Search, BarChart2, Filter, Download } from "lucide-react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/section-title";

const features = [
  {
    id: "search",
    title: "Smart Search",
    description: "Type and see results instantly",
    icon: Search,
    demo: (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-[400px] w-full">
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Try typing 'Software Developer'..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            />
          </div>
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Search
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="w-2/3 h-4 bg-gray-100 rounded" />
                <div className="w-1/4 h-4 bg-orange-100 rounded" />
              </div>
              <div className="w-1/2 h-3 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "visualize",
    title: "Data Visualization",
    description: "Interactive charts and graphs",
    icon: BarChart2,
    demo: (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-[400px] w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Job Market Trends
          </h3>
          <div className="flex items-center gap-2">
            <select className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
        </div>
        <div className="relative h-48">
          <div className="absolute inset-0 flex items-end gap-4">
            {[60, 85, 40, 95, 70, 55, 80].map((height, i) => (
              <div key={i} className="flex-1 group">
                <div className="relative">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer hover:opacity-90"
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(to top, #FDBA74, #F87171)`,
                      opacity: 0.8,
                    }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-sm text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {height} jobs
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600" />
              <span className="text-gray-600">Job Postings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <span className="text-gray-600">Applications</span>
            </div>
          </div>
          <button className="text-orange-600 hover:text-orange-700 font-medium">
            View Details →
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "filter",
    title: "Advanced Filters",
    description: "Refine your search results",
    icon: Filter,
    demo: (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-[400px] w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Filter Options</h3>
          <button className="text-sm text-orange-600 hover:text-orange-700">
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <select className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white">
              <option>All Provinces</option>
              <option>Ontario</option>
              <option>British Columbia</option>
              <option>Quebec</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              NOC Code
            </label>
            <select className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white">
              <option>All NOC Codes</option>
              <option>NOC 2171</option>
              <option>NOC 2173</option>
              <option>NOC 2174</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Salary Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Employment Type
            </label>
            <div className="flex flex-wrap gap-2">
              {["Full-time", "Part-time", "Contract", "Remote"].map((type) => (
                <button
                  key={type}
                  className="px-3 py-1.5 rounded-full text-sm border border-gray-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "export",
    title: "Export Results",
    description: "Download in multiple formats",
    icon: Download,
    demo: (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-[400px] w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Export Options</h3>
          <button className="text-sm text-orange-600 hover:text-orange-700">
            Select All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { format: "PDF Report", icon: "📄", size: "2.4 MB" },
            { format: "Excel Sheet", icon: "📊", size: "1.8 MB" },
            { format: "CSV Data", icon: "📝", size: "1.2 MB" },
            { format: "Print View", icon: "🖨️", size: "3.1 MB" },
          ].map(({ format, icon, size }) => (
            <button
              key={format}
              className="group p-4 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all relative overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors text-2xl">
                  {icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {format}
                  </div>
                  <div className="text-xs text-gray-500">{size}</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total size: <span className="font-medium">8.5 MB</span>
          </div>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download All
          </button>
        </div>
      </div>
    ),
  },
];

export default function SeeItAction() {
  const [activeFeature, setActiveFeature] = useState("search");
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const startAutoRotation = () => {
      intervalRef.current = setInterval(() => {
        if (!isHovered) {
          setActiveFeature((current) => {
            const currentIndex = features.findIndex((f) => f.id === current);
            const nextIndex = (currentIndex + 1) % features.length;
            return features[nextIndex].id;
          });
        }
      }, 2000);
    };

    startAutoRotation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered]);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="See it in Action"
          subtitle="Experience the power of our platform with a live demo"
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Feature Navigation - Takes 1/4 of the space */}
          <div className="lg:sticky lg:top-8">
            <div className="space-y-2">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeFeature === feature.id
                      ? "bg-orange-50 text-orange-600"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium text-current">
                        {feature.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {feature.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Demo - Takes 3/4 of the space */}
          <div
            className="lg:col-span-3 h-[400px] relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              {features.find((f) => f.id === activeFeature)?.demo}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
