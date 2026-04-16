'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight, CheckCircle2, ChevronRight, MapPin, TrendingUp } from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AlbertaLMIAJobs() {
  return (
    <div className="min-h-screen bg-brand-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(196,123,18,0.18)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/lmia-jobs" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">Alberta</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <MapPin className="w-3.5 h-3.5" />
                Alberta · AB
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-amber-400">Alberta</span>
              </h1>

              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Alberta's booming economy driven by energy, agriculture, and construction creates consistent LMIA demand across skilled trades and professional occupations. The Alberta Immigrant Nominee Program (AINP) is one of Canada's most active provincial streams.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white tracking-tight">1,900+</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Active LMIA listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white tracking-tight">Trades</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">#1 job category</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white tracking-tight">AIP</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium italic">Most common pathway</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/search/lmia/all?state=Alberta&t=lmia"
                  className="bg-amber-400 hover:bg-amber-500 text-brand-900 font-bold px-8 py-4 rounded-xl transition-all inline-flex items-center gap-2 hover:-translate-y-1 shadow-lg shadow-amber-500/20"
                >
                  Search All Alberta LMIA Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/faq"
                  className="bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/40 text-white/80 hover:text-white font-medium px-6 py-4 rounded-xl transition-all"
                >
                  How does it work?
                </Link>
              </div>
            </div>

            {/* LIVE PREVIEW COMPONENT */}
            <div className="relative">
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="text-xs font-bold tracking-widest uppercase text-brand-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-xl bg-green-500 animate-pulse" />
                  Live Listings — Alberta
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase text-[10px] tracking-wider py-1.5 px-3">Alberta</Badge>
                  <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10 uppercase text-[10px] tracking-wider py-1.5 px-3">All Industries</Badge>
                  <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10 uppercase text-[10px] tracking-wider py-1.5 px-3">TEER 0–4</Badge>
                </div>

                <div className="space-y-3 relative">
                  {/* Job Fake Card 1 */}
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Pipefitter — Pembina Pipeline</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">Fort McMurray, AB · $45–58/hr · NOC 72402</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-medium whitespace-nowrap text-[10px]">LMIA Approved</Badge>
                  </div>
                  {/* Job Fake Card 2 */}
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Heavy Truck Driver — CN Rail Logistics</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">Calgary, AB · $30–36/hr · NOC 73300</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-medium whitespace-nowrap text-[10px]">LMIA Approved</Badge>
                  </div>
                  {/* Job Fake Card 3 */}
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Petroleum Engineer — Suncor Energy</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">Calgary, AB · $110–140k/yr · NOC 21330</div>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium whitespace-nowrap text-[10px]">LMIA Eligible</Badge>
                  </div>

                  <div className="absolute -bottom-2 -left-2 -right-2 h-24 bg-gradient-to-t from-brand-900 to-transparent pointer-events-none rounded-b-2xl" />
                </div>

                <div className="mt-4 bg-amber-50 border border-amber-200 border-dashed rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-400">
                    🔒 Showing 3 of 1,900+ listings. <Link href="/sign-up" className="font-bold underline hover:text-amber-400/80">Sign up free</Link> to view all — including employer contacts & wages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOP INDUSTRIES */}
        <section className="py-20 px-6 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 italic">Top Industries</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Where LMIA hiring is most active in Alberta
              </h2>
              <p className="text-slate-500 text-lg font-light leading-relaxed">
                These sectors consistently post LMIA-eligible positions in Alberta. Use JobMaze's industry filter to narrow your search for clients seeking roles in these expanding fields.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: '⛽', title: 'Oil & Gas', desc: 'Active LMIA hiring in Alberta — filter by this sector on JobMaze' },
                { icon: '🏗️', title: 'Construction', desc: 'Active LMIA hiring in Alberta — filter by this sector on JobMaze' },
                { icon: '🌾', title: 'Agriculture', desc: 'Active LMIA hiring in Alberta — filter by this sector on JobMaze' },
                { icon: '🏥', title: 'Healthcare', desc: 'Active LMIA hiring in Alberta — filter by this sector on JobMaze' },
                { icon: '🚛', title: 'Trucking', desc: 'Active LMIA hiring in Alberta — filter by this sector on JobMaze' },
              ].map((ind, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 hover:-translate-y-1 hover:border-amber-400/40 transition-all duration-300 shadow-sm">
                  <div className="text-3xl mb-3">{ind.icon}</div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{ind.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PNP AND CITIES SECTIONS */}
        <section className="py-24 px-6 bg-brand-900 border-t border-white/10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* PNP column */}
            <div>
              <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 italic">Provincial Nominee Program</div>
              <h3 className="text-3xl font-bold text-white tracking-tight mb-6 italic">Alberta Advantage Immigration Program (AAIP)</h3>
              <p className="text-blue-100/70 mb-8 text-lg font-light leading-relaxed">
                An LMIA job offer is a key component for several Alberta PNP streams. Finding the right employer through JobMaze is the first step to a successful nomination for your client across active pathways.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-4 italic">Active Streams</div>
                <div className="space-y-4">
                  {['Alberta Opportunity Stream', 'Alberta Express Entry Stream', 'Rural Renewal Stream'].map((stream, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0 text-sm text-blue-100 font-bold tracking-tight">
                      <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5" />
                      {stream}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CITIES & STATS column */}
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 italic">Cities Covered</div>
              <h3 className="text-3xl font-bold text-white tracking-tight mb-6 italic">Job searches by Alberta city</h3>
              <p className="text-blue-100/70 mb-8 text-lg font-light leading-relaxed">
                JobMaze covers LMIA jobs in every Alberta city and rural municipality. Use the city filter to narrow results for your client's preferred location.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                {['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Fort McMurray', 'Grande Prairie', 'Medicine Hat', 'Banff'].map((city, idx) => (
                  <Link
                    key={idx}
                    href={`/search/lmia/all?state=Alberta&city=${city}&t=lmia`}
                    className="bg-white/5 border border-white/10 hover:bg-amber-600 hover:text-white text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm duration-300"
                  >
                    {city}
                  </Link>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 shadow-sm rounded-2xl p-8">
                <div className="text-xs font-bold text-blue-200/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Quick Stats — Alberta
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-100/50">LMIA listings updated</span>
                    <span className="font-bold text-white">Daily (6am ET)</span>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-100/50">Average listings per month</span>
                    <span className="font-bold text-white">1,900+</span>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-100/50">Top occupation category</span>
                    <span className="font-bold text-white">Oil & Gas / Trades</span>
                  </div>
                  <div className="w-full h-px bg-white/5" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-100/50">Province abbreviation</span>
                    <span className="font-bold text-white">AB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-brand-900 py-24 px-6 text-center border-t-4 border-amber-400">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs font-bold text-blue-200/60 uppercase tracking-widest mb-4">Start Searching</div>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
              Find LMIA jobs in Alberta now
            </h2>
            <p className="text-blue-100/70 text-lg mb-10 font-light">
              Sign up free and search 1,900+ live LMIA listings in Alberta — filter by city, NOC, TEER, industry, and more.
            </p>
            <Link
              href="/search/lmia/all?state=Alberta&t=lmia"
              className="bg-amber-400 hover:bg-amber-400/90 text-brand-900 font-bold px-10 py-5 rounded-xl transition-all inline-flex items-center gap-2 hover:-translate-y-1 text-lg shadow-xl shadow-amber-100"
            >
              Search Alberta LMIA Jobs Free
              <ArrowRight className="w-5 h-5 text-brand-900" />
            </Link>
            <div className="mt-8 text-sm text-blue-200/50 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> No credit card required</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Daily-updated listings</span>
            </div>
          </div>
        </section>

        {/* SEO INTERNAL LINKS (FOOTER BLOCK) */}
        <section className="py-16 px-6 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto text-center">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">More LMIA Job Searches</h4>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { title: '🏙️ LMIA Jobs Ontario', href: '/lmia-jobs-ontario' },
                { title: '🌲 LMIA Jobs BC', href: '/lmia-jobs-british-columbia' },
                { title: '🌾 LMIA Jobs Saskatchewan', href: '/lmia-jobs-saskatchewan' },
                { title: '🏥 Healthcare LMIA Jobs', href: '/lmia-jobs-healthcare' },
                { title: '🚛 Trucking LMIA Jobs', href: '/lmia-jobs-trucking' },
                { title: '📋 What is LMIA?', href: '/what-is-lmia' },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
