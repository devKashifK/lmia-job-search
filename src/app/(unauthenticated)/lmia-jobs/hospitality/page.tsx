'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  CheckCircle2,
  Utensils,
  Hotel,
  Coffee,
  IceCream
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';

const hospitalityOccupations = [
  {
    title: 'Restaurant Cook',
    noc: '63200',
    teer: '3',
    demand: 'Very High',
    color: 'emerald'
  },
  {
    title: 'Food Service Supervisor',
    noc: '62020',
    teer: '2',
    demand: 'High',
    color: 'emerald'
  },
  {
    title: 'Hotel Front Desk Agent',
    noc: '64314',
    teer: '4',
    demand: 'High',
    color: 'emerald'
  },
  {
    title: 'Baker',
    noc: '63210',
    teer: '3',
    demand: 'Medium',
    color: 'emerald'
  }
];

export default function HospitalityJobsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(16,185,129,0.1)_0%,transparent_55%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/lmia-jobs" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">Hospitality</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <Hotel className="w-3.5 h-3.5" />
                Hospitality & Food Service Sector
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-emerald-400">Hospitality</span>
              </h1>

              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Hotels, restaurants, and food service operators are among Canada's most active LMIA employers. The hospitality sector consistently hires under the Low-Wage LMIA stream for roles at TEER 3 and 4.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">1,500+</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Live Listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-xl font-black text-white">TEER 2-4</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Main NOCs</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white px-2">Low-Wage</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Primary Stream</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/search/lmia/all?category=Hospitality&t=lmia"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-emerald-500/20"
                >
                  Search Hospitality LMIA Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* PREVIEW COMPONENT */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="text-xs font-black tracking-widest uppercase text-emerald-400 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Hospitality Listings
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Restaurant Cook', employer: 'Recipe Unlimited', location: 'Toronto, ON', wage: '$19–24/hr', noc: '63200', icon: <Utensils className="w-5 h-5 text-emerald-400" /> },
                    { title: 'Food Service Supervisor', employer: 'Tim Hortons', location: 'Edmonton, AB', wage: '$18–22/hr', noc: '62020', icon: <Coffee className="w-5 h-5 text-emerald-400" /> },
                    { title: 'Hotel Front Desk', employer: 'Marriott Halifax', location: 'Halifax, NS', wage: '$18–22/hr', noc: '64314', icon: <Hotel className="w-5 h-5 text-emerald-400" /> },
                    { title: 'Baker', employer: 'Cobs Bread', location: 'Vancouver, BC', wage: '$20–25/hr', noc: '63210', icon: <Utensils className="w-5 h-5 text-emerald-400" /> },
                  ].map((job, i) => (
                    <div key={i} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex gap-4 items-center transition-all cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                        {job.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{job.title}</div>
                        <div className="text-blue-300/40 text-[11px] font-medium mt-0.5 truncate">{job.employer} · {job.location}</div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">LMIA Approved</Badge>
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
                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">Service Occupations</div>
                <h2 className="text-3xl md:text-4xl font-black text-brand-900 tracking-tight leading-tight">
                  Top Hospitality & Food Service occupations with active LMIA hiring
                </h2>
              </div>
              <p className="text-slate-500 text-lg md:max-w-xs font-light leading-relaxed">
                Search by exact NOC code on JobMaze for targeted client matching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hospitalityOccupations.map((occ, i) => (
                <div key={i} className="group bg-white border border-slate-200 rounded-[2rem] p-6 pb-8 hover:-translate-y-2 hover:border-emerald-400/30 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-300 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-50 group-hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center mb-6">
                    {i === 0 ? <Utensils className="w-8 h-8 text-emerald-500 group-hover:text-white" /> : i === 1 ? <Coffee className="w-8 h-8 text-emerald-500 group-hover:text-white" /> : i === 2 ? <Hotel className="w-8 h-8 text-emerald-500 group-hover:text-white" /> : <IceCream className="w-8 h-8 text-emerald-500 group-hover:text-white" />}
                  </div>
                  <h3 className="font-bold text-brand-900 mb-2 leading-snug h-12 flex items-center">{occ.title}</h3>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-6">NOC {occ.noc} · TEER {occ.teer}</div>
                  <Badge className="bg-slate-50 text-emerald-600 border-emerald-100 font-black uppercase text-[9px] tracking-wider py-1 px-4">
                    {occ.demand} Demand
                  </Badge>
                </div>
              ))}
            </div>

            {/* TIP BOX */}
            <div className="mt-12 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="text-5xl shrink-0">💡</div>
                <div className="max-w-xl">
                  <h4 className="text-xl font-bold text-brand-900 mb-4 tracking-tight uppercase tracking-widest text-sm text-emerald-600">Expert Guidance</h4>
                  <p className="text-slate-600 leading-relaxed font-light text-lg italic">
                    "Hospitality positions typically fall under the Low-Wage LMIA stream. Employers must comply with the current cap on TFW workforce percentage — typically 10–20% depending on the sector and region."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-brand-900 py-24 px-6 text-center border-t-4 border-amber-400">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4">Start your search</div>
            <h2 className="text-3xl md:text-[52px] font-black text-white tracking-tight leading-tight mb-8">
              Search 1,500+ Hospitality LMIA Jobs
            </h2>
            <p className="text-blue-100/70 text-lg mb-12 font-light leading-relaxed">
              Filter by province, city, NOC, TEER, and wage. Direct-to-employer data available for all listings.
            </p>
            <Link
              href="/search/lmia/all?category=Hospitality&t=lmia"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-12 py-5 rounded-full transition-all inline-flex items-center gap-3 hover:-translate-y-1 shadow-2xl shadow-emerald-500/40 text-lg"
            >
              Sign Up for Full Access
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-300/40 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> NOC 6 / TEER 2-4</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tourism-heavy regions</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Daily-updated data</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
