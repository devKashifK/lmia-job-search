'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight, CheckCircle2, ChevronRight, MapPin, TrendingUp } from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';

export default function BritishColumbiaLMIAJobs() {
  return (
    <div className="min-h-screen bg-#F5F7FA flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-24 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(15,123,94,0.18)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/search" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">British Columbia</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-emerald-100/50 border border-emerald-700/40 text-emerald-700 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <MapPin className="w-3.5 h-3.5" />
                British Columbia · BC
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-black text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-amber-400">British Columbia</span>
              </h1>
              
              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                British Columbia offers one of Canada's most diverse LMIA job markets — from Vancouver's world-class tech sector to BC's booming construction industry and thriving hospitality scene. BC PNP draws are among Canada's most active.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">2,400+</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Active LMIA listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">Tech Pilot</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium italic">Fast-track stream</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">Daily</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Database refresh</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  href="/search?province=british columbia"
                  className="bg-amber-400 hover:bg-amber-400/90 text-brand-900 font-bold px-8 py-4 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-0.5"
                >
                  Search All BC LMIA Jobs
                  <ArrowRight className="w-4 h-4 text-brand-900" />
                </Link>
                <Link 
                  href="/faq"
                  className="bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/40 text-white/80 hover:text-white font-medium px-6 py-4 rounded-full transition-all"
                >
                  How does it work?
                </Link>
              </div>
            </div>

            {/* LIVE PREVIEW COMPONENT */}
            <div className="relative">
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="text-xs font-bold tracking-widest uppercase text-brand-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live Listings — British Columbia
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px] tracking-wider py-1.5 px-3">British Columbia</Badge>
                  <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10 uppercase text-[10px] tracking-wider py-1.5 px-3">All Industries</Badge>
                  <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10 uppercase text-[10px] tracking-wider py-1.5 px-3">TEER 0–4</Badge>
                </div>

                <div className="space-y-3 relative">
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Software Developer — Electronic Arts Canada</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">Vancouver, BC · $90–115k/yr · NOC 21232</div>
                    </div>
                    <Badge className="bg-brand-100 text-brand-400 border border-brand-300 font-medium whitespace-nowrap text-[10px]">LMIA Eligible</Badge>
                  </div>
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Registered Nurse — Vancouver Coastal Health</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">Vancouver, BC · $36–44/hr · NOC 31301</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-medium whitespace-nowrap text-[10px]">LMIA Approved</Badge>
                  </div>
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Heavy Equipment Operator — Ledcor Group</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">Prince George, BC · $36–44/hr · NOC 73400</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-medium whitespace-nowrap text-[10px]">LMIA Approved</Badge>
                  </div>
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Hotel Front Desk Supervisor — Fairmont Hotels</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">Victoria, BC · $22–26/hr · NOC 62022</div>
                    </div>
                    <Badge className="bg-brand-100 text-brand-400 border border-brand-300 font-medium whitespace-nowrap text-[10px]">LMIA Eligible</Badge>
                  </div>

                  <div className="absolute -bottom-2 -left-2 -right-2 h-24 bg-gradient-to-t from-brand-900 via-brand-900/80 to-transparent pointer-events-none rounded-b-2xl" />
                </div>

                <div className="mt-4 bg-amber-50 border border-amber-200 border-dashed rounded-xl p-4 text-center">
                  <p className="text-sm text-amber-400">
                    🔒 Showing 4 of 2,400+ listings. <Link href="/sign-up" className="font-bold underline hover:text-amber-400/80">Sign up free</Link> to view all — including employer contacts & wages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOP INDUSTRIES */}
        <section className="py-20 px-6 bg-gray-50 border-b border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">Top Industries</div>
              <h2 className="text-3xl md:text-4xl font-black text-brand-900 tracking-tight mb-4">
                Where LMIA hiring is most active in British Columbia
              </h2>
              <p className="text-gray-500 text-lg">
                These sectors consistently post LMIA-eligible positions in British Columbia. Use JobMaze's industry filter to narrow your search for clients seeking roles in these expanding fields.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: '💻', title: 'Technology', desc: 'Active LMIA hiring in British Columbia — filter by this sector on JobMaze' },
                { icon: '🏥', title: 'Healthcare', desc: 'Active LMIA hiring in British Columbia — filter by this sector on JobMaze' },
                { icon: '🏗️', title: 'Construction', desc: 'Active LMIA hiring in British Columbia — filter by this sector on JobMaze' },
                { icon: '🏨', title: 'Hospitality', desc: 'Active LMIA hiring in British Columbia — filter by this sector on JobMaze' },
                { icon: '🌲', title: 'Forestry', desc: 'Active LMIA hiring in British Columbia — filter by this sector on JobMaze' },
              ].map((ind, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 hover:-translate-y-1 hover:border-emerald-700/40 transition-all duration-300 shadow-sm">
                  <div className="text-3xl mb-3">{ind.icon}</div>
                  <h3 className="text-sm font-bold text-brand-900 mb-2">{ind.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PNP AND CITIES SECTIONS */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* PNP column */}
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">Provincial Nominee Program</div>
              <h3 className="text-3xl font-black text-brand-900 tracking-tight mb-6">British Columbia Provincial Nominee Program (BC PNP)</h3>
              <p className="text-gray-600 mb-8 text-lg">
                An LMIA job offer is a key component for several British Columbia PNP streams. Finding the right employer through JobMaze is the first step to a successful nomination for your client across active pathways.
              </p>

              <div className="bg-emerald-700/5 border border-emerald-100 rounded-2xl p-8">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-6">Active BC PNP Streams</div>
                <div className="space-y-4">
                  {['Skilled Worker', 'International Graduate', 'Tech Pilot', 'Health Authority'].map((stream, idx) => (
                    <div key={idx} className="flex items-center gap-3 border-b border-emerald-50 pb-4 last:border-0 last:pb-0 font-medium text-gray-800">
                      <ChevronRight className="w-5 h-5 text-emerald-700" />
                      {stream}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CITIES & STATS column */}
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">Cities Covered</div>
              <h3 className="text-3xl font-black text-brand-900 tracking-tight mb-6">Job searches by BC city</h3>
              <p className="text-gray-600 mb-8 text-lg">
                JobMaze covers LMIA jobs in every BC city and rural municipality. Use the city filter to narrow results for your client's preferred location.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                {['Vancouver', 'Surrey', 'Burnaby', 'Kelowna', 'Victoria', 'Prince George'].map((city, idx) => (
                  <Link 
                    key={idx}
                    href={`/search?province=british columbia&city=${city.toLowerCase()}`}
                    className="bg-white border border-brand-100 hover:border-brand-50/500 hover:text-brand-600 text-brand-900 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm"
                  >
                    {city}
                  </Link>
                ))}
              </div>

              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Quick Stats — British Columbia
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">LMIA listings updated</span>
                     <span className="font-bold text-gray-900">Daily (6am ET)</span>
                   </div>
                   <div className="w-full h-px bg-gray-100" />
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Average listings per month</span>
                     <span className="font-bold text-gray-900">2,400+</span>
                   </div>
                   <div className="w-full h-px bg-gray-100" />
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Top occupation category</span>
                     <span className="font-bold text-gray-900">Technology</span>
                   </div>
                   <div className="w-full h-px bg-gray-100" />
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Province abbreviation</span>
                     <span className="font-bold text-gray-900">BC</span>
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
             <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
               Find LMIA jobs in British Columbia now
             </h2>
             <p className="text-blue-100/70 text-lg mb-10 font-light">
               Sign up free and search 2,400+ live LMIA listings in British Columbia — filter by city, NOC, TEER, industry, and more.
             </p>
             <Link 
                href="/sign-up"
                className="bg-amber-400 hover:bg-amber-400/90 text-brand-900 font-bold px-10 py-5 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 text-lg shadow-xl shadow-amber-100"
              >
                Search British Columbia LMIA Jobs Free
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
                { title: '⛽ LMIA Jobs Alberta', href: '/lmia-jobs-alberta' },
                { title: '🌾 LMIA Jobs Saskatchewan', href: '/lmia-jobs-saskatchewan' },
                { title: '🏥 Healthcare LMIA Jobs', href: '/lmia-jobs-healthcare' },
                { title: '🚛 Trucking LMIA Jobs', href: '/lmia-jobs-trucking' },
                { title: '📋 What is LMIA?', href: '/what-is-lmia' },
              ].map((link, i) => (
                <Link 
                  key={i}
                  href={link.href}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-full text-sm font-medium transition-colors"
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
