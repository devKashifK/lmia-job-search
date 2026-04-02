'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight, CheckCircle2, ChevronRight, Activity, MapPin } from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';

export default function HealthcareLMIAJobs() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-inter">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-[#0D1B3E] pt-24 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(15,123,94,0.18)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="text-sm font-medium text-blue-200/60 mb-6 flex items-center gap-2">
                <Link href="/search" className="hover:text-white transition-colors">LMIA Jobs</Link>
                <span>/</span>
                <span className="text-white">Healthcare</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-[#0F7B5E]/15 border border-[#0F7B5E]/40 text-[#0F7B5E] rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <Activity className="w-3.5 h-3.5" />
                Healthcare Sector
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-black text-white leading-[1.1] tracking-tight mb-6">
                LMIA Jobs in <span className="text-[#F5A623]">Healthcare</span>
              </h1>
              
              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Healthcare is consistently the #1 sector for LMIA hiring in Canada. From registered nurses to personal support workers, Canadian health authorities are actively recruiting internationally trained professionals through the LMIA pathway.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">2,800+</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Healthcare listings</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">TEER 1–3</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Most common levels</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">All 13</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Provinces hiring</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                 <Link 
                  href="/search?category=Healthcare"
                  className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0D1B3E] font-bold px-8 py-4 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-[#F5A623]/20"
                >
                  Search Healthcare LMIA Jobs
                  <ArrowRight className="w-4 h-4 text-[#0D1B3E]" />
                </Link>
                <Link 
                  href="/what-is-lmia"
                  className="bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/40 text-white/80 hover:text-white font-medium px-6 py-4 rounded-full transition-all flex items-center gap-2"
                >
                  What is LMIA? <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* LIVE PREVIEW COMPONENT */}
            <div className="relative">
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="text-xs font-bold tracking-widest uppercase text-[#78B4E8] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Sample Healthcare Listings
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-[#D0EFE6] hover:bg-[#D0EFE6] text-[#0F7B5E] border-[#0F7B5E]/30 uppercase text-[10px] tracking-wider py-1.5 px-3">Healthcare</Badge>
                  <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10 uppercase text-[10px] tracking-wider py-1.5 px-3">All Provinces</Badge>
                </div>

                <div className="space-y-3 relative">
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-xl">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Registered Nurse</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">NOC 31301 · TEER 1 · Multiple provinces</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-medium whitespace-nowrap text-[10px]">LMIA Active</Badge>
                  </div>
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-xl">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Licensed Practical Nurse</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">NOC 32101 · TEER 2 · Multiple provinces</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-medium whitespace-nowrap text-[10px]">LMIA Active</Badge>
                  </div>
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-xl">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Personal Support Worker</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">NOC 44101 · TEER 4 · Multiple provinces</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-medium whitespace-nowrap text-[10px]">LMIA Active</Badge>
                  </div>
                  <div className="bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-xl p-3 flex gap-4 items-center transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-xl">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">Medical Laboratory Technician</div>
                      <div className="text-xs text-blue-200/60 mt-0.5 truncate">NOC 32120 · TEER 2 · Multiple provinces</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-medium whitespace-nowrap text-[10px]">LMIA Active</Badge>
                  </div>

                  <div className="absolute -bottom-2 -left-2 -right-2 h-24 bg-gradient-to-t from-[#0D1B3E] to-transparent pointer-events-none rounded-b-2xl" />
                </div>

                <div className="mt-4 bg-[#F5A623]/10 border border-[#F5A623]/30 border-dashed rounded-xl p-4 text-center">
                  <p className="text-sm text-[#F5A623]">
                    🔒 Sign up free to see full listings with employer names, wages & contact details. <Link href="/sign-up" className="font-bold underline hover:text-[#F5A623]/80">Start free trial</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IN DEMAND OCCUPATIONS */}
        <section className="py-20 px-6 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-[#0F7B5E] uppercase tracking-widest mb-3">In-Demand Occupations</div>
              <h2 className="text-3xl md:text-4xl font-black text-[#0D1B3E] tracking-tight mb-4">
                Top Healthcare occupations with LMIA activity
              </h2>
              <p className="text-gray-500 text-lg">
                These NOC codes consistently appear in healthcare LMIA applications. Use JobMaze to search by NOC code for precise client matching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Registered Nurse', noc: 'NOC 31301', teer: 'TEER 1', demand: 'Very High demand', demandColor: 'bg-[#D0EFE6] text-[#0F7B5E]' },
                { title: 'Licensed Practical Nurse', noc: 'NOC 32101', teer: 'TEER 2', demand: 'Very High demand', demandColor: 'bg-[#D0EFE6] text-[#0F7B5E]' },
                { title: 'Personal Support Worker', noc: 'NOC 44101', teer: 'TEER 4', demand: 'High demand', demandColor: 'bg-[#D6E6F7] text-[#1D6FBF]' },
                { title: 'Medical Laboratory Technician', noc: 'NOC 32120', teer: 'TEER 2', demand: 'High demand', demandColor: 'bg-[#D6E6F7] text-[#1D6FBF]' },
                { title: 'Pharmacist', noc: 'NOC 31120', teer: 'TEER 1', demand: 'Medium demand', demandColor: 'bg-[#FEF0D7] text-[#C47B12]' },
                { title: 'Physiotherapist', noc: 'NOC 31120', teer: 'TEER 1', demand: 'Medium demand', demandColor: 'bg-[#FEF0D7] text-[#C47B12]' },
              ].map((occ, i) => (
                <div key={i} className="bg-white border border-gray-200 hover:border-blue-200 rounded-xl p-4 flex items-center gap-4 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-[#D0EFE6] flex items-center justify-center text-xl flex-shrink-0">🏥</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{occ.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{occ.noc} · {occ.teer}</div>
                  </div>
                  <Badge variant="outline" className={`${occ.demandColor} font-medium border-black/5 whitespace-nowrap`}>
                    {occ.demand}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHERE TO SEARCH / HOW TO USE */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Where to Search column */}
            <div>
              <div className="text-xs font-bold text-[#0F7B5E] uppercase tracking-widest mb-3">Where to Search</div>
              <h3 className="text-3xl font-black text-[#0D1B3E] tracking-tight mb-6">Top provinces hiring in Healthcare</h3>
              <p className="text-gray-600 mb-8 text-lg">
                LMIA hiring for healthcare is active across Canada, with the highest volume in these provinces.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                {['Ontario', 'British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba'].map((prov, idx) => (
                  <Link 
                    key={idx}
                    href={`/search?province=${prov.toLowerCase()}`}
                    className="bg-[#0F7B5E]/15 border border-[#0F7B5E]/20 hover:bg-[#0F7B5E]/25 text-[#0F7B5E] px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm"
                  >
                    {prov}
                  </Link>
                ))}
              </div>

              <div className="bg-[#D0EFE6]/50 border border-[#0F7B5E]/20 rounded-2xl p-6">
                <div className="text-sm font-bold text-[#0F7B5E] mb-2 flex items-center gap-2">
                  💡 Note for immigration professionals
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Healthcare workers may also qualify for the IRCC Health Care Worker pathway — consult IRCC for current eligibility.
                </p>
              </div>
            </div>

            {/* How to use JobMaze */}
            <div>
              <div className="text-xs font-bold text-[#0F7B5E] uppercase tracking-widest mb-3">How to Use JobMaze</div>
              <h3 className="text-3xl font-black text-[#0D1B3E] tracking-tight mb-6">Find the right healthcare LMIA in 3 steps</h3>

              <div className="space-y-8 mt-10">
                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#D0EFE6] border border-[#0F7B5E]/30 flex items-center justify-center font-black text-[#0F7B5E] flex-shrink-0">1</div>
                  <div>
                    <div className="text-base font-bold text-[#0D1B3E] mb-2">Filter by industry</div>
                    <div className="text-sm text-gray-500 leading-relaxed">Select Healthcare in the industry filter on JobMaze</div>
                  </div>
                </div>
                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#D0EFE6] border border-[#0F7B5E]/30 flex items-center justify-center font-black text-[#0F7B5E] flex-shrink-0">2</div>
                  <div>
                    <div className="text-base font-bold text-[#0D1B3E] mb-2">Add your NOC code</div>
                    <div className="text-sm text-gray-500 leading-relaxed">Enter your client's NOC code to match eligible positions precisely</div>
                  </div>
                </div>
                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#D0EFE6] border border-[#0F7B5E]/30 flex items-center justify-center font-black text-[#0F7B5E] flex-shrink-0">3</div>
                  <div>
                    <div className="text-base font-bold text-[#0D1B3E] mb-2">Check LMIA status</div>
                    <div className="text-sm text-gray-500 leading-relaxed">Filter to LMIA Approved listings for the strongest employer leads</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-[#0D1B3E] py-24 px-6 text-center border-t-4 border-[#F5A623]">
          <div className="max-w-2xl mx-auto">
             <div className="text-xs font-bold text-blue-200/60 uppercase tracking-widest mb-4">Start Searching</div>
             <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
               Search 2,800+ Healthcare LMIA listings
             </h2>
             <p className="text-blue-100/70 text-lg mb-10 font-light">
               Updated daily. Filter by province, city, NOC code, TEER level, and wage range.
             </p>
             <Link 
                href="/sign-up"
                className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0D1B3E] font-bold px-10 py-5 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 text-lg shadow-xl shadow-[#F5A623]/20"
              >
                Search Healthcare LMIA Jobs Free
                <ArrowRight className="w-5 h-5 text-[#0D1B3E]" />
              </Link>
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
