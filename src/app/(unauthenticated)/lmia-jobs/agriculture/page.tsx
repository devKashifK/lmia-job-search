'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sprout
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const agricultureOccupations = [
  {
    title: 'General Farm Worker',
    noc: '85100',
    teer: '5',
    demand: 'Very High',
    color: 'emerald'
  },
  {
    title: 'Nursery & Greenhouse Worker',
    noc: '85103',
    teer: '5',
    demand: 'High',
    color: 'emerald'
  },
  {
    title: 'Harvesting Labourer',
    noc: '85101',
    teer: '5',
    demand: 'High',
    color: 'emerald'
  },
  {
    title: 'Farm Supervisor',
    noc: '82030',
    teer: '2',
    status: 'High Demand',
    color: 'amber'
  }
];

export default function AgricultureJobsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(15,123,94,0.18)_0%,transparent_55%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/lmia-jobs" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">Agriculture</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <Sprout className="w-3.5 h-3.5" />
                Agriculture Sector
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-emerald-400">Agriculture</span>
              </h1>

              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Canada's agriculture sector relies heavily on the Temporary Foreign Worker Program. Many agricultural positions fall under the Agricultural Stream or the Seasonal Agricultural Worker Program (SAWP), offering consistent LMIA opportunities.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white pr-1">1,200+</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Live Listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white">TEER 5</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Primary Level</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white">SAWP</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Active Streams</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/lmia-jobs?industry=agriculture"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-emerald-500/20"
                >
                  Search Agriculture LMIA Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* PREVIEW COMPONENT */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="text-xs font-black tracking-widest uppercase text-emerald-400 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Agriculture Listings
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'General Farm Worker', employer: 'Sunny Valley Farms', location: 'Brandon, MB', wage: '$18–22/hr', noc: '85100' },
                    { title: 'Harvesting Labourer', employer: 'Okanagan Orchards', location: 'Vernon, BC', wage: '$17–21/hr', noc: '85101' },
                    { title: 'Nursery Assistant', employer: 'Garden Grow Ltd', location: 'Niagara, ON', wage: '$18–20/hr', noc: '85103' },
                    { title: 'Farm Supervisor', employer: 'Heritage Cattle Co', location: 'Red Deer, AB', wage: '$22–26/hr', noc: '82030' },
                  ].map((job, i) => (
                    <div key={i} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex gap-4 items-center transition-all cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-xl font-bold text-white">
                        🌾
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{job.title}</div>
                        <div className="text-blue-300/40 text-[11px] font-medium mt-0.5 truncate">{job.employer} · {job.location}</div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">LMIA Active</Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 border-dashed rounded-2xl p-4 text-center">
                  <p className="text-sm text-emerald-400">
                    🔒 Sign up free to see all employer contacts & application details
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IN-DEMAND OCCUPATIONS */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-xl">
                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">In-Demand Roles</div>
                <h2 className="text-3xl md:text-4xl font-black text-brand-900 tracking-tight leading-tight">
                  Top Agriculture occupations with active LMIA hiring
                </h2>
              </div>
              <p className="text-slate-500 text-lg md:max-w-xs font-light leading-relaxed">
                Filter by these NOC codes on JobMaze for precise matching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agricultureOccupations.map((occ, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between hover:border-emerald-500/30 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300">
                      🚜
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-900">{occ.title}</h3>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">NOC {occ.noc} · TEER {occ.teer}</div>
                    </div>
                  </div>
                  <div className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic animate-pulse">
                    Very High Demand
                  </div>
                </div>
              ))}
            </div>

            {/* TIP BOX */}
            <div className="mt-12 bg-slate-900 rounded-[2rem] p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-3xl shadow-2xl shadow-emerald-500/40 shrink-0">
                  💡
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Note for Immigration Professionals</h4>
                  <p className="text-blue-100/60 leading-relaxed font-light">
                    Agricultural LMIAs have specific housing and transportation requirements for TFWs. Ensure your client's employer meets the criteria for either the primary Agriculture Stream or SAWP.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-brand-900 py-24 px-6 text-center border-t-4 border-emerald-500">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Start your search</div>
            <h2 className="text-3xl md:text-[52px] font-black text-white tracking-tight leading-tight mb-8">
              Find Agriculture LMIA jobs now
            </h2>
            <p className="text-blue-100/70 text-lg mb-12 font-light leading-relaxed">
              Search 1,200+ live agricultural LMIA listings — updated hourly to help you find the right match faster.
            </p>
            <Link
              href="/sign-up"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-12 py-5 rounded-full transition-all inline-flex items-center gap-3 hover:-translate-y-1 shadow-2xl shadow-emerald-500/30 text-lg"
            >
              Search Agriculture Jobs Free
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-300/40 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> All provinces</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Daily updates</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full employer data</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
