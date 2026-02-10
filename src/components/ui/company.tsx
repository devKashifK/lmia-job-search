'use client';

import { motion } from 'framer-motion';
import SectionTitle from './section-title';
import { ArrowUpRight, TrendingUp, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUpdateCredits } from '@/hooks/use-credits';
import { cn } from '@/lib/utils';

import { useTrendingCompanies } from '@/hooks/use-trending-companies';

// Simple Sparkline Component
const Sparkline = ({ data, colorClass }: { data: number[], colorClass: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  // Extract color for stroke (simplified mapping)
  const strokeColor = colorClass.includes('red') ? '#dc2626' :
    colorClass.includes('green') ? '#16a34a' :
      colorClass.includes('yellow') ? '#ca8a04' :
        colorClass.includes('blue') ? '#2563eb' :
          colorClass.includes('indigo') ? '#4f46e5' : '#4b5563';

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d">
      <defs>
        <linearGradient id={`gradient-${colorClass}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M0,100 L0,${100 - ((data[0] - min) / range) * 100} ${points.split(' ').map(p => 'L' + p).join(' ')} L100,100 Z`}
        fill={`url(#gradient-${colorClass})`}
        className="opacity-50"
      />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function Company() {
  const router = useRouter();
  const { updateCreditsAndSearch } = useUpdateCredits();
  const { data: companies, isLoading } = useTrendingCompanies();

  const handleViewDetails = (company: string) => {
    router.push(
      `/company/${encodeURIComponent(company)}?field=employer&t=lmia`
    );
  };

  const displayData = companies || []; // Fallback handled in hook

  return (
    <section className="w-full py-16 bg-white relative overflow-hidden border-t border-gray-100">

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <SectionTitle
            badge="Market Trends"
            title={<>Trending <span className="text-brand-600">Companies</span></>}
            subtitle="Top employers from the most active sectors (NOCs)."
            className="mb-0"
          />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading && displayData.length === 0 ? (
            // Simple Loading Skeleton
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-50 rounded-xl animate-pulse" />
            ))
          ) : (
            displayData.map((group, idx) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <div
                  onClick={() => {
                    updateCreditsAndSearch(group.title);
                    handleViewDetails(group.title);
                  }}
                  className="group relative bg-white rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-lg hover:border-brand-100 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Header: Logo & Title */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm border border-black/5", group.color)}>
                        {group.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors">
                          {group.title}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">TICKER: {group.initials}</p>
                      </div>
                    </div>

                    {/* Trend Badge */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        <TrendingUp className="w-3 h-3" />
                        {group.trend}
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Sparkline Row */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-0.5">Active LMIAs</p>
                      <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                        {group.count.toLocaleString()}
                      </p>
                    </div>

                    {/* Sparkline Visualization */}
                    <div className="h-10 w-24 relative">
                      <Sparkline data={group.sparkline} colorClass={group.color} />
                    </div>
                  </div>

                  <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      Top: <span className="text-gray-700 font-medium">{group.description}</span>
                    </p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                      <ArrowUpRight className="w-4 h-4 text-brand-600" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
