'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  HardHat,
  Hammer,
  Truck
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const constructionOccupations = [
  {
    title: 'Carpenter',
    noc: '72310',
    teer: '2',
    demand: 'High',
    color: 'amber'
  },
  {
    title: 'Electrician',
    noc: '72200',
    teer: '2',
    demand: 'High',
    color: 'amber'
  },
  {
    title: 'Construction Trades Helper',
    noc: '75110',
    teer: '5',
    demand: 'Very High',
    color: 'amber'
  },
  {
    title: 'Heavy Equipment Operator',
    noc: '73400',
    teer: '3',
    demand: 'High',
    color: 'amber'
  }
];

export default function ConstructionJobsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(251,191,36,0.1)_0%,transparent_55%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/lmia-jobs" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">Construction</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <HardHat className="w-3.5 h-3.5" />
                Construction & Infrastructure Sector
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-amber-400">Construction</span>
              </h1>

              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Canada's building boom continues to drive demand for skilled and semi-skilled trades. Construction companies across all provinces are actively hiring foreign workers under High-Wage and Low-Wage LMIA streams.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">2,500+</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Live Listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-exl font-black text-white">TEER 2-5</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Common NOCs</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white">ON/AB/BC</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Top Provinces</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/search/lmia/all?category=Construction&t=lmia"
                  className="bg-amber-400 hover:bg-amber-500 text-brand-900 font-bold px-8 py-4 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-amber-400/20"
                >
                  Search Construction LMIA Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* PREVIEW COMPONENT */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="text-xs font-black tracking-widest uppercase text-amber-400 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Live Construction Listings
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Carpenter', employer: 'EllisDon Corp', location: 'Toronto, ON', wage: '$38–46/hr', noc: '72310' },
                    { title: 'Construction Labourer', employer: 'PCL Construction', location: 'Edmonton, AB', wage: '$22–28/hr', noc: '75110' },
                    { title: 'Heavy Equipment Operator', employer: 'Graham Group', location: 'Vancouver, BC', wage: '$35–42/hr', noc: '73400' },
                    { title: 'Electrician', employer: 'Ledcor Group', location: 'Calgary, AB', wage: '$36–44/hr', noc: '72200' },
                  ].map((job, i) => (
                    <div key={i} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex gap-4 items-center transition-all cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center flex-shrink-0 text-xl font-bold text-white">
                        🏗️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{job.title}</div>
                        <div className="text-blue-300/40 text-[11px] font-medium mt-0.5 truncate">{job.employer} · {job.location}</div>
                      </div>
                      <Badge className="bg-amber-400/20 text-amber-400 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">LMIA Active</Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-amber-400/10 border border-amber-400/20 border-dashed rounded-2xl p-4 text-center">
                  <p className="text-sm text-amber-400">
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
                <div className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3">Construction Trades</div>
                <h2 className="text-3xl md:text-4xl font-black text-brand-900 tracking-tight leading-tight">
                  Top Construction occupations with active LMIA hiring
                </h2>
              </div>
              <p className="text-slate-500 text-lg md:max-w-xs font-light leading-relaxed">
                Trade certifications and provincial safety tickets may be required for certain roles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {constructionOccupations.map((occ, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-300 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-3xl mb-4 group-hover:bg-amber-500 transition-all">
                    {i === 0 ? <Hammer className="w-7 h-7 text-amber-500 group-hover:text-white" /> : i === 3 ? <Truck className="w-7 h-7 text-amber-500 group-hover:text-white" /> : <HardHat className="w-7 h-7 text-amber-500 group-hover:text-white" />}
                  </div>
                  <h3 className="font-bold text-brand-900 mb-2 leading-tight">{occ.title}</h3>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">NOC {occ.noc} · TEER {occ.teer}</div>
                  <Badge variant="outline" className="border-amber-100 text-amber-600 font-bold uppercase text-[9px] tracking-[0.15em] px-3">
                    {occ.demand} Demand
                  </Badge>
                </div>
              ))}
            </div>

            {/* TIP BOX */}
            <div className="mt-12 bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-24 bg-amber-400/5 rounded-bl-[100px] pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-3xl shadow-sm shrink-0">
                  🏗️
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brand-900 mb-3 tracking-tight">Immigration Consultant Tips</h4>
                  <p className="text-slate-500 leading-relaxed font-light text-base">
                    Construction LMIAs for skill levels (TEER 2-3) often require proof of provincial trade certification (Red Seal or equivalent). Verify your client's credentials or eligibility for the **Trade Equivalency Assessment** before beginning an LMIA-based work permit application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-brand-900 py-24 px-6 text-center border-t-4 border-amber-400">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4">Build your future</div>
            <h2 className="text-3xl md:text-[52px] font-black text-white tracking-tight leading-tight mb-8">
              Search 2,500+ Construction LMIA Listings
            </h2>
            <p className="text-blue-100/70 text-lg mb-12 font-light leading-relaxed">
              Find the perfect trade opportunity across Canada. Updated daily with direct employer information for subscribers.
            </p>
            <Link
              href="/search/lmia/all?category=Construction&t=lmia"
              className="bg-amber-400 hover:bg-amber-500 text-brand-900 font-black px-12 py-5 rounded-full transition-all inline-flex items-center gap-3 hover:-translate-y-1 shadow-2xl shadow-amber-400/30 text-lg"
            >
              Start Free Search
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-300/40 font-bold uppercase tracking-widest italic">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> NOC Levels 0–5</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> New Listings Daily</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Red Seal Eligible</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
