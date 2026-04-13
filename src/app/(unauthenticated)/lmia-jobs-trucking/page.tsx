'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight, CheckCircle2, ChevronRight, Activity, MapPin, Truck } from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';

export default function TruckingLMIAJobs() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(245,166,35,0.1)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/search" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">Trucking & Transportation</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <Truck className="w-3.5 h-3.5" />
                Trucking & Transportation Sector
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-black text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-amber-400">Trucking & Transportation</span>
              </h1>

              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Long-haul trucking is one of Canada's most consistently LMIA-approved occupations. With a chronic driver shortage across every province, transportation employers regularly obtain positive LMIAs.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">1,400+</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Trucking LMIA listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">NOC 73300</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Primary occupation</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">TEER 3</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Primary TEER level</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/search/lmia/all?field=all&t=lmia&page=1&category=Transportation+%26+Logistics"
                  className="bg-amber-400 hover:bg-amber-500 text-brand-900 font-bold px-8 py-4 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-amber-500/20"
                >
                  Search Trucking LMIA Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/what-is-lmia"
                  className="bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/40 text-white/80 hover:text-white font-medium px-6 py-4 rounded-full transition-all flex items-center gap-2"
                >
                  What is LMIA? <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="relative">
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="text-xs font-bold tracking-widest uppercase text-emerald-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sample Transportation Listings
                </div>
                <div className="space-y-3 relative">
                  {[
                    { t: 'Transport Truck Driver (Long Haul)', s: 'NOC 73300 · TEER 3' },
                    { t: 'Dispatcher', s: 'NOC 13200 · TEER 2' },
                    { t: 'Transport Company Manager', s: 'NOC 70010 · TEER 0' },
                  ].map((job, i) => (
                    <div key={i} className="bg-white/[0.06] border border-white/10 rounded-xl p-3 flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl flex-shrink-0">🚛</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">{job.t}</div>
                        <div className="text-xs text-blue-200/60 mt-0.5">{job.s}</div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">LMIA Active</Badge>
                    </div>
                  ))}
                  <div className="absolute -bottom-2 -left-2 -right-2 h-24 bg-gradient-to-t from-brand-900 to-transparent pointer-events-none rounded-b-2xl" />
                </div>
                <div className="mt-4 bg-amber-50 border border-amber-200 border-dashed rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-400">
                    🔒 <Link href="/sign-up" className="font-bold underline hover:text-amber-400/80">Sign up free</Link> to see 1,400+ trucking listings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IN DEMAND */}
        <section className="py-20 px-6 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">In-Demand Occupations</div>
              <h2 className="text-3xl md:text-4xl font-black text-brand-900 tracking-tight mb-4">
                Top Trucking occupations with LMIA activity
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
              {[
                { title: 'Truck Driver (Long Haul)', noc: '73300', demand: 'Very High', color: 'text-emerald-700' },
                { title: 'Dispatcher', noc: '13200', demand: 'High', color: 'text-brand-600' },
                { title: 'Company Manager', noc: '70010', demand: 'Medium', color: 'text-amber-600' },
              ].map((occ, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-200 transition-all">
                  <div className="text-sm font-bold text-brand-900 mb-1">{occ.title}</div>
                  <div className="text-xs text-gray-500 mb-4">NOC {occ.noc}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${occ.color}`}>{occ.demand} Demand</div>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">How to Use JobMaze</div>
              <h3 className="text-3xl font-black text-brand-900 tracking-tight mb-10 text-center">Find the right trucking LMIA in 3 steps</h3>
              <div className="space-y-6">
                {[
                  { n: 1, t: 'Filter by industry', d: 'Select Trucking & Transportation in the industry filter.' },
                  { n: 2, t: 'Add your NOC code', d: 'Enter your client\'s NOC code to match eligible positions.' },
                  { n: 3, t: 'Check LMIA status', d: 'Filter to LMIA Approved listings for the strongest leads.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-600/30 flex items-center justify-center font-black text-amber-600 text-xl flex-shrink-0">{step.n}</div>
                    <div>
                      <div className="text-lg font-bold text-brand-900 mb-1">{step.t}</div>
                      <div className="text-sm text-gray-500">{step.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-brand-900 py-24 px-6 text-center border-t-4 border-amber-400">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
              Search 1,400+ Trucking LMIA listings
            </h2>
            <p className="text-blue-100/70 text-lg mb-10 font-light">
              Updated daily. Filter by province, city, NOC code, TEER level, and wage range.
            </p>
            <Link
              href="/search/lmia/all?field=all&t=lmia&page=1&category=Transportation+%26+Logistics"
              className="bg-amber-400 hover:bg-amber-400/90 text-brand-900 font-bold px-10 py-5 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 text-lg"
            >
              Search Transportation LMIA Jobs Free
              <ArrowRight className="w-5 h-5 text-brand-900" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
