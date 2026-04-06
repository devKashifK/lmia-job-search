'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Search,
  CheckCircle2,
  Anchor,
  Compass,
  Ship,
  Hotel
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function NovaScotiaJobsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(15,123,94,0.18)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/lmia-jobs" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">Nova Scotia</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <Compass className="w-3.5 h-3.5" />
                Nova Scotia · NS
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-emerald-400">Nova Scotia</span>
              </h1>

              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Nova Scotia's economy is powered by fisheries, tourism, and a growing tech sector in Halifax. The province is a key participant in the Atlantic Immigration Program (AIP), making LMIA opportunities highly sought after.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">580+</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Active Listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white">AIP</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Main Program</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center px-1">
                  <div className="text-2xl font-black text-white px-2">Halifax</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Core Market</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/lmia-jobs?province=nova-scotia"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-emerald-500/20"
                >
                  Search Nova Scotia LMIA Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* PREVIEW COMPONENT */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="text-xs font-black tracking-widest uppercase text-emerald-400 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live NS Listings
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Seafood Processor', employer: 'High Liner Foods', location: 'Lunenburg, NS', wage: '$18–22/hr', noc: '94142', icon: <Ship className="w-5 h-5 text-emerald-400" /> },
                    { title: 'Cook', employer: 'Halifax Dining Group', location: 'Halifax, NS', wage: '$19–24/hr', noc: '63200', icon: <Anchor className="w-5 h-5 text-emerald-400" /> },
                    { title: 'Hotel Supervisor', employer: 'Delta Hotels Halifax', location: 'Halifax, NS', wage: '$24–30/hr', noc: '62022', icon: <Hotel className="w-5 h-5 text-emerald-400" /> },
                    { title: 'Truck Driver', employer: 'Maritime Transport', location: 'Truro, NS', wage: '$26–32/hr', noc: '73300', icon: <Compass className="w-5 h-5 text-emerald-400" /> },
                  ].map((job, i) => (
                    <div key={i} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex gap-4 items-center transition-all cursor-default relative overflow-hidden group">
                      <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        {job.icon}
                      </div>
                      <div className="flex-1 min-w-0 font-bold">
                        <div className="text-white text-sm truncate">{job.title}</div>
                        <div className="text-blue-300/40 text-[11px] mt-0.5 truncate uppercase tracking-widest">{job.employer} · {job.location}</div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-widest">LMIA Approved</Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 border-dashed rounded-2xl p-4 text-center">
                  <p className="text-sm text-emerald-400 font-medium">
                    🔒 Sign up free to unlock 580+ Nova Scotia listings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INFO SECTION */}
        <section className="py-24 px-6 bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
              <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">Regional Growth</div>
              <h2 className="text-3xl md:text-5xl font-black text-brand-900 tracking-tight leading-tight mb-6">
                Active LMIA hiring in Nova Scotia
              </h2>
              <p className="text-slate-500 text-lg font-light leading-relaxed">
                From the bustling harbor of Halifax to Cape Breton's tourism hotspots, Nova Scotia employers are actively seeking foreign workers to fill critical vacancies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-[2.5rem] p-10 hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:bg-emerald-500 transition-colors">
                  🏗️
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-4 tracking-tight">Construction</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light mb-6">High demand for carpenters, electricians, and labourers in Halifax's infrastructure boom.</p>
                <Link href="/lmia-jobs/construction" className="text-emerald-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">View Sector <ArrowRight className="w-3 h-3" /></Link>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] p-10 hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:bg-emerald-500 transition-colors">
                  🐟
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-4 tracking-tight">Fisheries</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light mb-6">Consistent seasonal and year-round LMIA hiring in seafood processing and aquaculture.</p>
                <span className="text-slate-300 text-xs font-black uppercase tracking-widest italic">Core Nova Scotia Sector</span>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] p-10 hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:bg-emerald-500 transition-colors">
                  🏨
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-4 tracking-tight">Tourism</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light mb-6">Hotels and restaurants across the province rely on LMIA approvals for peak season staffing.</p>
                <Link href="/lmia-jobs/hospitality" className="text-emerald-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">View Sector <ArrowRight className="w-3 h-3" /></Link>
              </div>
            </div>

            {/* AIP NOTICE */}
            <div className="mt-16 bg-brand-900 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[90px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="shrink-0 relative">
                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/40 rotate-6">
                  ⚓
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Atlantic Immigration Program (AIP)</h3>
                <p className="text-blue-100/70 text-lg font-light leading-relaxed mb-8">
                  Many Nova Scotia employers are already designated under the AIP. A job offer from an AIP-designated employer can significantly accelerate the immigration process for your clients.
                </p>
                <div className="flex flex-wrap gap-4">
                  {['Skilled Workers', 'International Graduates', 'NB/NS/PEI/NL Streams'].map((tag, i) => (
                    <Badge key={i} className="bg-white/10 hover:bg-white/20 text-white border-white/5 py-2 px-4 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-brand-900 py-24 px-6 text-center border-t-4 border-emerald-500 mt-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Start your search</div>
            <h2 className="text-3xl md:text-[52px] font-black text-white tracking-tight leading-tight mb-8">
              Search 580+ Nova Scotia LMIA Jobs
            </h2>
            <p className="text-blue-100/70 text-lg mb-12 font-light leading-relaxed">
              Filter by city, NOC, TEER, industry, and wage. Direct-to-employer data available for all listings.
            </p>
            <Link
              href="/sign-up"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-12 py-5 rounded-full transition-all inline-flex items-center gap-3 hover:-translate-y-1 shadow-2xl shadow-emerald-500/30 text-lg"
            >
              Get Started Free
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-300/40 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Halifax & Dartmouth</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> AIP-Designated Employers</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Daily Updates</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
