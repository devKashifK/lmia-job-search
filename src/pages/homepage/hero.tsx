'use client';
import { useState, useEffect } from 'react';
import CustomLink from '@/components/ui/CustomLink';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import useMobile from '@/hooks/use-mobile';
import { useLiveFeed } from '@/hooks/use-live-feed';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Hero() {
  const { isMobile, isMounted } = useMobile();
  const { data, isLoading } = useLiveFeed();
  const feedData = data?.feed;
  const stats = data?.stats;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!feedData?.length) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % feedData.length);
    }, 4000); // Cycle every 4 seconds
    return () => clearInterval(interval);
  }, [feedData]);

  // Derived items for the floating cards (offset to show different ones)
  const trendItem = feedData?.[activeIndex % (feedData?.length || 1)];
  const verifiedItem = feedData?.[(activeIndex + 2) % (feedData?.length || 1)];

  if (!isMounted) {
    return null;
  }

  return (
    <section className="relative py-20 overflow-hidden bg-white selection:bg-brand-100 selection:text-brand-900">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>

      <div className={isMobile ? "relative w-full px-4" : "relative max-w-7xl mx-auto px-6 lg:px-8"}>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left Content: High Density Value Prop */}
          <motion.div
            className={isMobile ? "w-full text-center" : "lg:w-1/2 text-left"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-semibold">
                JobMaze
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Identify <span className="text-brand-600">Hidden</span> Hiring Patterns.
            </h1>

            <p className="text-gray-600 mb-8 text-base leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
              JobMaze aggregates 5 years of LMIA data and live job postings into a single high-density dashboard. Stop searching blindly.
            </p>

            <div className={isMobile ? "flex flex-col gap-3" : "flex flex-row gap-4"}>
              <motion.button
                onClick={() => {
                  const searchBox = document.getElementById('search-pill-container');
                  if (searchBox) {
                    searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } else {
                    // Fallback if on another page or ID missing
                    window.location.href = '/search';
                  }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full lg:w-auto px-8 py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm shadow-xl shadow-gray-200"
              >
                Start Analysis <ArrowRight className="w-4 h-4" />
              </motion.button>
              <Dialog>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full lg:w-auto px-8 py-3.5 bg-white border border-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    View Demo
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95 border-gray-800">
                  <div className="relative w-full aspect-video">
                    <video
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    >
                      <source src="/demo.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Micro-Stats (Real Data) */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-12 border-t border-gray-100 pt-8">
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                  {stats?.highEndJobs ? stats.highEndJobs.toLocaleString() : '...'}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mt-1">High End Jobs</p>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                  {stats?.totalLmias ? stats.totalLmias.toLocaleString() : '...'}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mt-1">Total LMIAs</p>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                  {stats?.verifiedEmployers ? stats.verifiedEmployers.toLocaleString() : '...'}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mt-1">Verified Employers</p>
              </div>
            </div>
          </motion.div>

          {/* Right Content: Live Data Feed Visual */}
          {!isMobile && (
            <motion.div
              className="lg:w-1/2 relative perspective-1000"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Main Dashboard Card */}
              <div className="relative bg-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden h-[500px] w-full max-w-md mx-auto transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out group">
                {/* Header */}
                <div className="h-20 border-b border-gray-100 bg-white flex flex-col justify-center px-6 z-20 relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-sm font-bold text-gray-900 tracking-tight uppercase">Live Market Pulse</span>
                    </div>
                    <div className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full font-mono border border-gray-100">
                      LOCAL: CA-ON
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 pl-4 border-l-2 border-brand-100">
                    Real-time hiring data from Canada's top employers.
                  </p>
                </div>

                {/* Live Feed Content */}
                <div className="p-4 h-full flex flex-col relative overflow-hidden bg-gray-50/30">

                  {/* Mask for top and bottom fade */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent z-10 pointer-events-none" />

                  {/* Scrolling list container */}
                  <div className="overflow-hidden h-full relative pb-20">
                    {/* Inner track that moves */}
                    <div className="animate-vertical-scroll flex flex-col gap-3 pt-2">
                      {/* Duplicate data for seamless loop - 4 times to ensure height > container */}
                      {[...(feedData || []), ...(feedData || []), ...(feedData || []), ...(feedData || [])].slice(0, 20).map((item, i) => (
                        <div
                          key={`${item.id}-${i}`}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow group/item"
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${item.type === 'lmia'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-blue-50 border-blue-100 text-blue-600'
                            }`}>
                            {item.type === 'lmia' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Building2 className="w-4 h-4" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-bold text-gray-900 truncate pr-2 group-hover/item:text-brand-600 transition-colors">
                                {item.title}
                              </p>
                              <span className="text-[9px] font-mono text-gray-400 whitespace-nowrap">
                                {Math.floor(Math.random() * 59)}m ago
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                              <span className="font-medium text-gray-700">{item.employer}</span>
                              <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                              {item.location}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-0.5">
                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.type === 'lmia' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {item.wage === 'N/A' ? 'Active' : item.wage}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 (Trend Alert) - Cycling */}
              <motion.div
                key={`trend-${trendItem?.id || 'static'}`}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute -right-6 top-32 bg-white/90 backdrop-blur-md p-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 z-30 max-w-[200px]"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg shadow-blue-200">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Surging Now</p>
                    <p className="text-xs font-bold text-gray-900 leading-tight w-28">
                      {trendItem?.title?.split(' ').slice(0, 2).join(' ') || 'Construction'}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                      +{Math.floor(Math.random() * 20) + 10}% Demand
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Element 2 (Verified) - Cycling */}
              <motion.div
                key={`verified-${verifiedItem?.id || 'static'}`}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute -left-12 bottom-32 bg-white/90 backdrop-blur-md p-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 z-30 max-w-[220px]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <span className="font-bold text-xs text-brand-600">
                        {verifiedItem?.employer?.substring(0, 2).toUpperCase() || 'AB'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white rounded-full p-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-900 truncate w-32">{verifiedItem?.employer || 'Verified Employer'}</p>
                    <p className="text-[10px] text-emerald-600 font-medium bg-emerald-50 inline-block px-1.5 py-0.5 rounded mt-0.5">
                      LMIA Approved
                    </p>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
