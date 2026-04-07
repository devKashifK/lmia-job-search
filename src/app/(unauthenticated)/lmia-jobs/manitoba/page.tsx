'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Waves,
  Building2,
  Stethoscope as Steth
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ManitobaJobsPage() {
  return (
    <div className="min-h-screen bg-brand-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(29,111,191,0.18)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/lmia-jobs" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">Manitoba</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <Waves className="w-3.5 h-3.5" />
                Manitoba · MB
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-blue-400">Manitoba</span>
              </h1>

              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Manitoba's Provincial Nominee Program is one of Canada's most accessible. The province's healthcare, agriculture, and trucking sectors consistently generate high LMIA activity.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">820+</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Active Listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center px-1">
                  <div className="text-2xl font-black text-white">Healthcare</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Top Sector</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center px-1">
                  <div className="text-2xl font-black text-white">MPNP</div>
                  <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold mt-1">Nominee Program</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/search/lmia/all?state=Manitoba&t=lmia"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-blue-500/20"
                >
                  Search All Manitoba LMIA Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* PREVIEW COMPONENT */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="text-xs font-black tracking-widest uppercase text-blue-400 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Live Manitoba Listings
                </div>

                <div className="space-y-4 relative">
                  {[
                    { title: 'Personal Support Worker', employer: 'Winnipeg Regional Health', location: 'Winnipeg, MB', wage: '$18–22/hr', noc: '44101', status: 'Approved' },
                    { title: 'Grain Farm Worker', employer: 'Manitoba Grain Corp', location: 'Brandon, MB', wage: '$20–24/hr', noc: '84100', status: 'Approved' },
                    { title: 'Heavy Truck Driver', employer: 'Prairie Transport', location: 'Winnipeg, MB', wage: '$26–32/hr', noc: '73300', status: 'Eligible' },
                    { title: 'Food Processing Sup.', employer: 'Maple Leaf Foods', location: 'Brandon, MB', wage: '$24–28/hr', noc: '92010', status: 'Approved' },
                  ].map((job, i) => (
                    <div key={i} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex gap-4 items-center transition-all cursor-default relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-xl font-bold text-white">
                        💼
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{job.title}</div>
                        <div className="text-blue-300/40 text-[11px] font-medium mt-0.5 truncate">{job.employer} · {job.location}</div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest">LMIA {job.status}</Badge>
                    </div>
                  ))}
                  <div className="absolute -bottom-2 -left-2 -right-2 h-24 bg-gradient-to-t from-brand-900 to-transparent pointer-events-none rounded-b-2xl" />
                </div>

                <div className="mt-4 bg-white/5 border border-white/10 border-dashed rounded-2xl p-4 text-center">
                  <p className="text-xs text-blue-300/50">
                    🔒 Showing 4 of 820+ listings · <Link href="/sign-up" className="text-amber-400 font-bold underline">Sign up free</Link> to view all
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS & INFO SECTION */}
        <section className="py-24 px-6 bg-brand-900 border-t border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 italic">Top Industries</div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-8">
                Where LMIA hiring is active in Manitoba
              </h2>
              <div className="flex flex-wrap gap-2 mb-10">
                {['Healthcare', 'Agriculture', 'Trucking', 'Manufacturing', 'Food Processing'].map((ind, i) => (
                  <Badge key={i} variant="outline" className="px-5 py-2.5 rounded-full border-blue-100 bg-blue-50/30 text-blue-700 font-bold text-sm tracking-tight hover:bg-blue-100 transition-colors">
                    {ind}
                  </Badge>
                ))}
              </div>

              {/* TOP CITIES */}
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
                <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Top Cities in Manitoba
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie'].map((city, i) => (
                    <Link
                      key={i}
                      href={`/search/lmia/all?state=Manitoba&city=${city}&t=lmia`}
                      className="bg-white/5 hover:bg-blue-500 hover:text-white border border-white/10 text-white px-6 py-3 rounded-full text-sm font-bold shadow-sm transition-all duration-300"
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3 italic">Provincial Nominee Program</div>
              <h2 className="text-3xl font-black text-brand-900 tracking-tight leading-tight mb-6">
                Manitoba Provincial Nominee Program (MPNP)
              </h2>
              <p className="text-blue-100/70 text-lg leading-relaxed mb-8 max-w-xl font-light">
                An LMIA job offer is a critical component of several Manitoba immigration streams. Use JobMaze to find the right employer match for your client's pathway.
              </p>

              <div className="bg-brand-900 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Active Nominee Streams</div>
                <div className="space-y-6">
                  {['Skilled Worker in Manitoba', 'Skilled Worker Overseas', 'International Education Stream', 'Business Investor Stream'].map((stream, idx) => (
                    <div key={idx} className="flex items-start gap-4 group">
                      <div className="w-6 h-6 rounded-full bg-amber-400 text-brand-900 flex items-center justify-center flex-shrink-0 text-[10px] font-black group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <div className="text-white font-bold group-hover:text-amber-400 transition-colors uppercase tracking-widest text-[12px]">
                        {stream}
                      </div>
                    </div>
                  ))}
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
              Search 820+ LMIA Listings in Manitoba
            </h2>
            <p className="text-blue-100/70 text-lg mb-12 font-light leading-relaxed">
              Filter by city, NOC, TEER, industry, and wage. Targeted listings for immigration professionals.
            </p>
            <Link
              href="/search/lmia/all?state=Manitoba&t=lmia"
              className="bg-amber-400 hover:bg-amber-500 text-brand-900 font-black px-12 py-5 rounded-full transition-all inline-flex items-center gap-3 hover:-translate-y-1 shadow-2xl shadow-amber-400/30 text-lg"
            >
              Sign Up for Access
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-300/40 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Healthcare & Ag</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> MPNP Direct Match</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Daily Updates</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
