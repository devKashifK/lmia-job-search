'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, CheckCircle2, Building2, Users, BarChart3, 
  FileSpreadsheet, Search, TrendingUp, Handshake, Network, UserPlus, Check, X
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';

export default function ForRecruiters() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION Split */}
        <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">
          {/* Left Side */}
          <div className="bg-[#0D1B3E] pt-24 pb-20 px-8 lg:px-16 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[radial-gradient(circle,rgba(29,111,191,0.2)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#1D6FBF]/15 border border-[#1D6FBF]/40 text-[#1D6FBF] rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                <Building2 className="w-3.5 h-3.5" />
                For Staffing Agencies
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
                The <span className="text-[#F5A623] italic">LMIA job board</span> built for Canadian recruiters
              </h1>
              
              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Source TFW candidates faster, identify LMIA-active employers, and build a qualified pipeline — all from one platform designed for agency workflows.
              </p>

              <div className="flex flex-col sm:flex-row items-baseline gap-4">
                <Link 
                  href="/sign-up"
                  className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0D1B3E] font-bold px-10 py-5 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 text-lg shadow-xl shadow-[#F5A623]/20"
                >
                  Request Agency Demo
                  <ArrowRight className="w-5 h-5 text-[#0D1B3E]" />
                </Link>
                <Link 
                  href="/for-immigration-consultants"
                  className="text-white/60 hover:text-white text-sm font-medium transition-colors"
                >
                  RCIC? See the consultant plan →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="bg-[#F5F7FA] px-8 lg:px-16 py-16 flex flex-col justify-center border-l border-gray-200">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
              Agency plan at a glance
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 shadow-sm transform transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-[#D6E6F7] flex items-center justify-center text-2xl flex-shrink-0">🏢</div>
                <div className="flex-1">
                  <div className="text-2xl font-black text-[#0D1B3E] leading-none mb-1">500+</div>
                  <div className="text-xs text-gray-500 font-medium">LMIA-active employers searchable</div>
                </div>
                <Badge variant="outline" className="bg-[#D6E6F7] text-[#1D6FBF] border-[#1D6FBF]/20 uppercase whitespace-nowrap text-[10px]">Per export</Badge>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 shadow-sm transform transition-transform hover:-translate-y-1 delay-75">
                <div className="w-12 h-12 rounded-xl bg-[#D6E6F7] flex items-center justify-center text-2xl flex-shrink-0">👥</div>
                <div>
                  <div className="text-2xl font-black text-[#0D1B3E] leading-none mb-1">5 seats</div>
                  <div className="text-xs text-gray-500 font-medium">Multi-user team access</div>
                </div>
                <Badge variant="outline" className="bg-[#D6E6F7] text-[#1D6FBF] border-[#1D6FBF]/20 uppercase whitespace-nowrap text-[10px]">Agency plan</Badge>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 shadow-sm transform transition-transform hover:-translate-y-1 delay-150">
                <div className="w-12 h-12 rounded-xl bg-[#D0EFE6] flex items-center justify-center text-2xl flex-shrink-0">📊</div>
                <div>
                  <div className="text-2xl font-black text-[#0D1B3E] leading-none mb-1">All 13</div>
                  <div className="text-xs text-gray-500 font-medium">Provinces & territories covered</div>
                </div>
                <Badge variant="outline" className="bg-[#D0EFE6] text-[#0F7B5E] border-[#0F7B5E]/20 uppercase whitespace-nowrap text-[10px]">Daily refresh</Badge>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 shadow-sm transform transition-transform hover:-translate-y-1 delay-200">
                <div className="w-12 h-12 rounded-xl bg-[#FEF0D7] flex items-center justify-center text-2xl flex-shrink-0">📋</div>
                <div className="flex-1">
                  <div className="text-2xl font-black text-[#0D1B3E] leading-none mb-1">CSV / XLS</div>
                  <div className="text-xs text-gray-500 font-medium">Bulk export for your ATS</div>
                </div>
                <Badge variant="outline" className="bg-[#FEF0D7] text-[#C47B12] border-[#C47B12]/20 uppercase whitespace-nowrap text-[10px]">Agency only</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-24 px-6 bg-gray-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-[#1D6FBF] uppercase tracking-widest mb-3">Use Cases</div>
              <h2 className="text-3xl md:text-4xl font-black text-[#0D1B3E] tracking-tight mb-4">
                How recruiters use JobMaze
              </h2>
              <p className="text-gray-500 text-lg">
                Whether you're sourcing TFW candidates or building your employer client list, JobMaze fits your workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 relative overflow-hidden group hover:border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="absolute top-4 right-6 text-6xl font-black text-gray-100 leading-none pointer-events-none">01</div>
                <div className="text-3xl mb-4 relative z-10">🔍</div>
                <h3 className="text-xl font-bold text-[#0D1B3E] mb-3 relative z-10">TFW candidate sourcing</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 relative z-10">
                  Find open LMIA positions that match your candidate pool by province, industry, wage, and NOC code — then connect candidates with qualified employers.
                </p>
                <ul className="space-y-2 relative z-10">
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#B83A6E] font-bold">→</span> Filter by province, city, and industry simultaneously</li>
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#B83A6E] font-bold">→</span> View employer contact details directly</li>
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#B83A6E] font-bold">→</span> Export matched listings for candidate review</li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-8 relative overflow-hidden group hover:border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="absolute top-4 right-6 text-6xl font-black text-gray-100 leading-none pointer-events-none">02</div>
                <div className="text-3xl mb-4 relative z-10">🏗️</div>
                <h3 className="text-xl font-bold text-[#0D1B3E] mb-4">Direct Employer Pipeline</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 relative z-10">
                  Identify companies with a history of LMIA hiring in your target sectors, then approach them as potential clients for your TFW placement services.
                </p>
                <ul className="space-y-2 relative z-10">
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#1D6FBF] font-bold">→</span> Rank employers by LMIA volume and recency</li>
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#1D6FBF] font-bold">→</span> Filter by sector and approval rate</li>
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#1D6FBF] font-bold">→</span> Build prospect lists and export for outreach</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-8 relative overflow-hidden group hover:border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="absolute top-4 right-6 text-6xl font-black text-gray-100 leading-none pointer-events-none">03</div>
                <div className="text-3xl mb-4 relative z-10">📊</div>
                <h3 className="text-xl font-bold text-[#0D1B3E] mb-3 relative z-10">Market research & reporting</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 relative z-10">
                  Understand which industries and provinces are most active for LMIA hiring — essential data for advising clients on where to focus and for making the case to new employer clients.
                </p>
                <ul className="space-y-2 relative z-10">
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#B83A6E] font-bold">→</span> Province-by-province LMIA volume data</li>
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#B83A6E] font-bold">→</span> Sector trending over time</li>
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#B83A6E] font-bold">→</span> Quarterly LMIA market reports (free to download)</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-8 relative overflow-hidden group hover:border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="absolute top-4 right-6 text-6xl font-black text-gray-100 leading-none pointer-events-none">04</div>
                <div className="text-3xl mb-4 relative z-10">🤝</div>
                <h3 className="text-xl font-bold text-[#0D1B3E] mb-4">Verified Contact Intel</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 relative z-10">
                  Multiple recruiters working the same database with shared pipelines, shared saved searches, and role-based permissions — no more duplicated work or missed opportunities.
                </p>
                <ul className="space-y-2 relative z-10">
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#B83A6E] font-bold">→</span> Up to 5 team members on Agency plan</li>
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#B83A6E] font-bold">→</span> Shared employer pipeline with status tags</li>
                  <li className="flex gap-2 items-start text-[13px] text-gray-700"><span className="text-[#B83A6E] font-bold">→</span> Admin controls for team access management</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE COMPARISON */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-[#1D6FBF] uppercase tracking-widest mb-3">Plan Comparison</div>
              <h2 className="text-3xl md:text-4xl font-black text-[#0D1B3E] tracking-tight mb-4">
                Pro vs Agency — what's the difference?
              </h2>
              <p className="text-gray-500 text-lg">
                Both plans include full LMIA job search. Agency adds team and bulk features designed for growing firms.
              </p>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
               <div className="grid grid-cols-12 bg-[#0D1B3E] p-5">
                  <div className="col-span-6 font-bold text-blue-200 uppercase tracking-widest text-xs">Feature</div>
                  <div className="col-span-3 text-center font-bold text-white uppercase tracking-widest text-xs">Pro Plan</div>
                  <div className="col-span-3 text-center font-bold text-white uppercase tracking-widest text-xs">Agency Plan</div>
               </div>
               
               {[
                 { feat: 'LMIA job search & filters', pro: 'check', ag: 'check' },
                 { feat: 'Employer contact details', pro: 'check', ag: 'check' },
                 { feat: 'Employer LMIA history', pro: 'check', ag: 'check' },
                 { feat: 'Saved searches & alerts', pro: 'Unlimited', ag: 'Unlimited + Shared', proColor: 'text-[#1D6FBF] font-medium', agColor: 'text-[#1D6FBF] font-bold' },
                 { feat: 'Team seats', pro: 'cross', proLabel: '1 user', ag: 'Up to 5 users', agColor: 'text-[#1D6FBF] font-bold' },
                 { feat: 'Bulk export (CSV/XLS)', pro: 'cross', ag: '500 records/export', agColor: 'text-[#1D6FBF] font-bold' },
                 { feat: 'Employer pipeline management', pro: 'cross', ag: 'check' },
                 { feat: 'Shared team pipeline', pro: 'cross', ag: 'check' },
                 { feat: 'Admin role & permissions', pro: 'cross', ag: 'check' },
                 { feat: 'Priority support', pro: 'cross', ag: 'check' },
                 { feat: 'Dedicated onboarding session', pro: 'cross', ag: '60 min session', agColor: 'text-[#1D6FBF] font-bold' },
               ].map((row, i) => (
                 <div key={i} className="grid grid-cols-12 p-4 border-t border-gray-100 hover:bg-gray-50 items-center transition-colors">
                   <div className="col-span-6 text-sm text-gray-700">{row.feat}</div>
                   <div className="col-span-3 text-center text-sm">
                      {row.pro === 'check' ? <Check className="w-5 h-5 text-[#0F7B5E] mx-auto" /> : 
                       row.pro === 'cross' ? (row.proLabel ? <span className="text-gray-400">{row.proLabel}</span> : <X className="w-5 h-5 text-gray-300 mx-auto" />) : 
                       <span className={row.proColor}>{row.pro}</span>}
                   </div>
                   <div className="col-span-3 text-center text-sm">
                      {row.ag === 'check' ? <Check className="w-5 h-5 text-[#0F7B5E] mx-auto" /> : 
                       <span className={row.agColor}>{row.ag}</span>}
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* PIPELINE VISUAL SECTION */}
        <section className="bg-[#0D1B3E] py-24 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs font-bold text-[#1D6FBF] uppercase tracking-widest mb-3">Employer Pipeline</div>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-6 leading-tight">
                Track every employer from discovery to placement
              </h3>
              <p className="text-blue-100/70 text-lg mb-8 leading-relaxed">
                The Agency plan includes a built-in employer pipeline. Organize your outreach, track conversations, and never lose a potential client employer again.
              </p>
              <ul className="space-y-3">
                 <li className="flex gap-3 text-sm text-blue-200/80"><span className="text-[#1D6FBF] font-bold">→</span> Tag employers as Prospect, Contacted, Negotiating, or Client</li>
                 <li className="flex gap-3 text-sm text-blue-200/80"><span className="text-[#1D6FBF] font-bold">→</span> Share pipeline status across all 5 team seats in real time</li>
                 <li className="flex gap-3 text-sm text-blue-200/80"><span className="text-[#1D6FBF] font-bold">→</span> Save up to 2,000 employer profiles</li>
                 <li className="flex gap-3 text-sm text-blue-200/80"><span className="text-[#1D6FBF] font-bold">→</span> Export your full pipeline to CSV for CRM import</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
               <div className="flex gap-2 mb-4 border-b border-white/10 pb-3">
                 <div className="flex-1 text-center text-[10px] font-bold tracking-widest text-[#78B4E8] uppercase">Prospects</div>
                 <div className="flex-1 text-center text-[10px] font-bold tracking-widest text-[#1D6FBF] uppercase">Contacted</div>
                 <div className="flex-1 text-center text-[10px] font-bold tracking-widest text-[#4ECBA3] uppercase">Clients</div>
               </div>
               
               <div className="grid grid-cols-3 gap-3">
                  {/* Column 1 */}
                  <div className="space-y-2">
                     <div className="bg-white/10 border border-white/10 rounded-lg p-2.5 text-xs text-white">
                        ABC Trucking Ltd
                        <span className="block text-[#8AABCF] text-[10px] mt-1">Alberta · 12 LMIAs</span>
                     </div>
                     <div className="bg-white/10 border border-white/10 rounded-lg p-2.5 text-xs text-white">
                        Northern Health
                        <span className="block text-[#8AABCF] text-[10px] mt-1">BC · 8 LMIAs</span>
                     </div>
                     <div className="bg-white/10 border border-white/10 rounded-lg p-2.5 text-xs text-white">
                        Prairie Farms Inc
                        <span className="block text-[#8AABCF] text-[10px] mt-1">SK · 5 LMIAs</span>
                     </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-2">
                     <div className="bg-[#1D6FBF]/20 border border-[#1D6FBF]/50 rounded-lg p-2.5 text-xs text-white shadow-sm shadow-[#1D6FBF]/10">
                        Metro Hotel Group
                        <span className="block text-blue-200/80 text-[10px] mt-1">ON · 20 LMIAs · Called Apr 2</span>
                     </div>
                     <div className="bg-[#1D6FBF]/20 border border-[#1D6FBF]/50 rounded-lg p-2.5 text-xs text-white shadow-sm shadow-[#1D6FBF]/10">
                        Pacific Builders
                        <span className="block text-blue-200/80 text-[10px] mt-1">BC · 15 LMIAs · Email sent</span>
                     </div>
                  </div>

                  {/* Column 3 */}
                  <div className="space-y-2">
                     <div className="bg-[#0F7B5E]/20 border border-[#4ECBA3]/40 rounded-lg p-2.5 text-xs text-white shadow-sm shadow-[#4ECBA3]/10">
                        SK Health Board
                        <span className="block text-[#D0EFE6] text-[10px] mt-1">SK · Active client ✓</span>
                     </div>
                     <div className="bg-[#0F7B5E]/20 border border-[#4ECBA3]/40 rounded-lg p-2.5 text-xs text-white shadow-sm shadow-[#4ECBA3]/10">
                        Toronto Care Inc
                        <span className="block text-[#D0EFE6] text-[10px] mt-1">ON · 3 placements</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0D1B3E] pt-24 pb-24 px-6 text-center border-t-4 border-[#F5A623] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(184,58,110,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10">
             <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
                Ready to build your TFW pipeline?
             </h2>
             <p className="text-white/80 text-lg mb-10 font-light">
               Request a personalized demo of the Agency plan and see how JobMaze fits your team's workflow.
             </p>
              <div className="flex flex-wrap justify-center gap-4">
                 <Link 
                   href="/sign-up"
                   className="bg-white hover:bg-gray-100 text-[#0D1B3E] font-bold px-10 py-5 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 text-lg shadow-xl"
                 >
                   Request Agency Demo
                   <ArrowRight className="w-5 h-5 text-[#0D1B3E]" />
                 </Link>
                 <Link 
                   href="/for-immigration-consultants"
                   className="bg-transparent border-2 border-white/50 hover:border-white/90 hover:bg-white/10 text-white font-bold px-10 py-5 rounded-full transition-all inline-flex items-center gap-2 text-lg"
                 >
                   Are you an RCIC?
                 </Link>
              </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
