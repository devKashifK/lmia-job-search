'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Search,
  CheckCircle2,
  ChevronRight,
  Anchor,
  Fish,
  Truck,
  Stethoscope
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function NewBrunswickJobsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(59,130,246,0.1)_0%,transparent_55%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/lmia-jobs" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">New Brunswick</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <Anchor className="w-3.5 h-3.5" />
                New Brunswick · NB
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-blue-400">New Brunswick</span>
              </h1>

              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                New Brunswick is a hub for seafood processing, transport, and manufacturing. The province offers several immigration pathways, including the Atlantic Immigration Program (AIP) and NBPNP, which are well-supported by LMIA-eligible employers.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">450+</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Active Listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center px-1">
                  <div className="text-2xl font-black text-white">Seafood</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Top Sector</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center px-1">
                  <div className="text-2xl font-black text-white px-2">NBPNP</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Nominee Program</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/search/lmia/all?state=New%20Brunswick&t=lmia"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-blue-500/20"
                >
                  Search New Brunswick LMIA Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* PREVIEW COMPONENT */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="text-xs font-black tracking-widest uppercase text-blue-400 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Live NB Listings
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Fish Plant Worker', employer: 'Grand Manan Seafood', location: 'Grand Manan, NB', wage: '$17–21/hr', noc: '94142', icon: <Fish className="w-5 h-5 text-blue-400" /> },
                    { title: 'Long-Haul Truck Driver', employer: 'Day & Ross Inc', location: 'Hartland, NB', wage: '$25–32/hr', noc: '73300', icon: <Truck className="w-5 h-5 text-blue-400" /> },
                    { title: 'Registered Nurse', employer: 'Horizon Health Network', location: 'Moncton, NB', wage: '$35–42/hr', noc: '31301', icon: <Stethoscope className="w-5 h-5 text-blue-400" /> },
                    { title: 'General Labourer', employer: 'J.D. Irving, Limited', location: 'Saint John, NB', wage: '$18–24/hr', noc: '95101', icon: <Anchor className="w-5 h-5 text-blue-400" /> },
                  ].map((job, i) => (
                    <div key={i} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex gap-4 items-center transition-all cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center flex-shrink-0">
                        {job.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{job.title}</div>
                        <div className="text-blue-300/40 text-[11px] font-medium mt-0.5 truncate">{job.employer} · {job.location}</div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">LMIA Approved</Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-blue-500/10 border border-blue-500/20 border-dashed rounded-2xl p-4 text-center">
                  <p className="text-sm text-blue-400">
                    🔒 Sign up free to see all employer contacts & application details
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INFO SECTION */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
            <div>
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 italic">Regional Overview</div>
              <h2 className="text-3xl md:text-4xl font-black text-brand-900 tracking-tight leading-tight mb-8">
                LMIA job market in New Brunswick
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed font-light mb-8 italic">
                "New Brunswick presents unique opportunities for immigration professionals. With lower competition compared to larger provinces and strong support for several PNP streams, finding the right LMIA job here can be the key to a fast-tracked PR application."
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Top City', value: 'Moncton' },
                  { title: 'Growth Sector', value: 'Seafood Processing' },
                  { title: 'Avg Vacancy Age', value: '14 Days' },
                  { title: 'AIP Participation', value: 'Very High' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.title}</div>
                    <div className="text-2xl font-black text-brand-900 tracking-tight">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* CITIES */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 py-8 border-y border-slate-100">
                {['Moncton', 'Saint John', 'Fredericton', 'Dieppe', 'Edmundston'].map((city, i) => (
                  <Link
                    key={i}
                    href={`/search/lmia/all?state=New%20Brunswick&city=${city}&t=lmia`}
                    className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-600/20">
                <h3 className="text-xl font-black mb-6 tracking-tight">Active Programs</h3>
                <div className="space-y-4">
                  {['Skilled Worker Stream', 'Critical Worker Pilot', 'Strategic Initiative', 'International Graduate'].map((stream, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-default">
                      <ChevronRight className="w-4 h-4 text-blue-300" />
                      <span className="text-sm font-bold uppercase tracking-widest">{stream}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2rem] p-8">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pro Tip</div>
                <p className="text-slate-500 text-sm leading-relaxed font-light">
                  New Brunswick's **Critical Worker Pilot** is particularly active. Employers in this program often have pre-approved LMIA quotas.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-brand-900 py-24 px-6 text-center border-t-4 border-amber-400">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4">Start your search</div>
            <h2 className="text-3xl md:text-[52px] font-black text-white tracking-tight leading-tight mb-8">
              Search 450+ New Brunswick LMIA Jobs
            </h2>
            <p className="text-blue-100/70 text-lg mb-12 font-light leading-relaxed">
              Filter by city, NOC, TEER, and industry. Direct-to-employer data available for all listings.
            </p>
            <Link
              href="/search/lmia/all?state=New%20Brunswick&t=lmia"
              className="bg-blue-500 hover:bg-blue-600 text-white font-black px-12 py-5 rounded-full transition-all inline-flex items-center gap-3 hover:-translate-y-1 shadow-2xl shadow-blue-500/40 text-lg"
            >
              Sign Up for Access
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-300/40 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Moncton / Saint John</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Seafood & Shipping</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Critical Worker Pilot</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
