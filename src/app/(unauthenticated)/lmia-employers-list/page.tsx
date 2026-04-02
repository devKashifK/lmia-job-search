'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, CheckCircle2, Lock, Unlock, Search, Building2, MapPin, 
  BarChart3, FileText, Check, Database, Globe
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';

export default function LMIAEmployersList() {
  return (
    <div className="min-h-screen bg-#F5F7FA flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-[#0d1b3e] pt-28 pb-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_0%,rgba(15,123,94,0.15)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center relative z-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-[#0F7B5E]/15 border border-[#0F7B5E]/25 text-[#4ECBA3] rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                📋 Updated 2026
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.05] tracking-tight mb-8">
                LMIA Approved <span className="text-[#F5A623] italic underline decoration-[#F5A623]/30 underline-offset-8">Employers List</span> Canada
              </h1>
              
              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Browse Canadian employers with a history of positive LMIA approvals. Search by province, industry, and number of approvals — sourced from ESDC public records.
              </p>

              <Link 
                href="/sign-up"
                className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0d1b3e] font-bold px-10 py-4 rounded-full transition-all inline-flex items-center gap-3 hover:-translate-y-0.5 shadow-xl shadow-[#F5A623]/10"
              >
                Get Full Access — Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <div className="text-[11px] text-blue-200/50 flex items-center gap-2 mt-6 uppercase tracking-widest font-bold">
                <Database className="w-3.5 h-3.5" />
                Data sourced from ESDC public records · Updated quarterly
              </div>
            </div>

            <div className="w-full lg:w-[480px] grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
                 <div className="text-3xl font-black text-white">12,400+</div>
                 <div className="text-[10px] font-bold text-blue-200/50 uppercase tracking-widest mt-2">Employers in database</div>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
                 <div className="text-3xl font-black text-[#F5A623]">80,000+</div>
                 <div className="text-[10px] font-bold text-blue-200/50 uppercase tracking-widest mt-2">Historical LMIA records</div>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
                 <div className="text-3xl font-black text-white">All 13</div>
                 <div className="text-[10px] font-bold text-blue-200/50 uppercase tracking-widest mt-2">Provinces & territories</div>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
                 <div className="text-3xl font-black text-[#4ECBA3]">5 yrs</div>
                 <div className="text-[10px] font-bold text-blue-200/50 uppercase tracking-widest mt-2">Historical data available</div>
               </div>
            </div>
          </div>
        </section>

        {/* STATS ROW */}
        <div className="bg-white border-b border-gray-100 py-8 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
               <div className="text-2xl md:text-3xl font-black text-[#0d1b3e] tracking-tight group-hover:text-[#1D6FBF] transition-colors">3,200+</div>
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ontario employers</div>
            </div>
            <div className="text-center group">
               <div className="text-2xl md:text-3xl font-black text-[#0d1b3e] tracking-tight group-hover:text-[#1D6FBF] transition-colors">2,100+</div>
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">BC employers</div>
            </div>
            <div className="text-center group">
               <div className="text-2xl md:text-3xl font-black text-[#0d1b3e] tracking-tight group-hover:text-[#1D6FBF] transition-colors">1,800+</div>
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Alberta employers</div>
            </div>
            <div className="text-center group">
               <div className="text-2xl md:text-3xl font-black text-[#0d1b3e] tracking-tight group-hover:text-[#0F7B5E] transition-colors">94%</div>
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Avg approval rate</div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* FILTERS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 flex flex-wrap gap-4 items-center shadow-sm relative z-20">
             <div className="relative flex-1 min-w-[240px]">
               <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input type="text" placeholder="Search employer name or industry…" className="w-full pl-10 pr-4 py-2.5 bg-[#f5f7fa] border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#1D6FBF] transition-all" />
             </div>
             
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Province</span>
                <select className="bg-[#f5f7fa] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#1D6FBF] cursor-pointer appearance-none min-w-[140px]">
                  <option>All Provinces</option>
                  <option>Ontario</option>
                  <option>British Columbia</option>
                  <option>Alberta</option>
                  <option>Saskatchewan</option>
                  <option>Manitoba</option>
                </select>
             </div>

             <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Industry</span>
                <select className="bg-[#f5f7fa] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#1D6FBF] cursor-pointer appearance-none min-w-[140px]">
                  <option>All Industries</option>
                  <option>Healthcare</option>
                  <option>Trucking</option>
                  <option>Construction</option>
                  <option>Hospitality</option>
                  <option>Agriculture</option>
                </select>
             </div>

             <span className="text-xs text-gray-400 ml-auto hidden xl:inline-block font-medium">
               Showing preview data · <Link href="/sign-up" className="text-[#1D6FBF] hover:underline font-bold">Sign up for full access</Link>
             </span>
          </div>

          {/* TABLE CONTAINER */}
          <div className="relative z-10">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
               {/* Table Header */}
               <div className="grid grid-cols-12 bg-[#0d1b3e] p-5 gap-4 hidden md:grid border-b border-white/5">
                 <div className="col-span-4 text-[10px] font-bold text-white/50 uppercase tracking-widest">Employer</div>
                 <div className="col-span-2 text-[10px] font-bold text-white/50 uppercase tracking-widest">Province</div>
                 <div className="col-span-2 text-[10px] font-bold text-white/50 uppercase tracking-widest">Industry</div>
                 <div className="col-span-2 text-[10px] font-bold text-white/50 uppercase tracking-widest text-center">Total LMIAs</div>
                 <div className="col-span-2 text-[10px] font-bold text-white/50 uppercase tracking-widest text-center">Approval Rate</div>
               </div>

               {/* Table Rows */}
               <div className="divide-y divide-gray-50">
                 {[
                   { name: 'Saskatchewan Health Authority', location: 'Regina, Saskatchewan', prov: 'SK', ind: 'Healthcare', count: 84, pct: 97, color: 'bg-[#0F7B5E]' },
                   { name: 'Vancouver Coastal Health', location: 'Vancouver, British Columbia', prov: 'BC', ind: 'Healthcare', count: 61, pct: 94, color: 'bg-[#0F7B5E]' },
                   { name: 'Pembina Pipeline Corporation', location: 'Calgary, Alberta', prov: 'AB', ind: 'Oil & Gas', count: 47, pct: 91, color: 'bg-[#0F7B5E]' },
                   { name: 'EllisDon Corporation', location: 'Toronto, Ontario', prov: 'ON', ind: 'Construction', count: 38, pct: 89, color: 'bg-[#0F7B5E]' },
                   { name: 'XTL Transport Inc', location: 'Mississauga, Ontario', prov: 'ON', ind: 'Trucking', count: 33, pct: 85, color: 'bg-[#1D6FBF]' },
                 ].map((row, i) => (
                   <div key={i} className="grid grid-cols-1 md:grid-cols-12 p-5 gap-4 items-center hover:bg-gray-50/80 transition-colors">
                     <div className="md:col-span-4">
                       <div className="font-bold text-gray-900 text-[15px] mb-0.5">{row.name}</div>
                       <div className="text-xs text-gray-500 font-medium">{row.location}</div>
                     </div>
                     <div className="md:col-span-2 text-[13px] text-gray-600 font-medium hidden md:block">{row.prov}</div>
                     <div className="md:col-span-2 text-[13px] text-gray-600 font-medium hidden md:block">{row.ind}</div>
                     <div className="md:col-span-2 text-center md:text-left flex justify-between md:block">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest md:hidden">Total LMIAs:</span>
                        <span className="font-black text-[#0d1b3e] text-lg md:text-base">{row.count}</span>
                     </div>
                     <div className="md:col-span-2">
                        <div className="flex justify-between items-center md:justify-center mb-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest md:hidden">Approval:</span>
                          <span className="text-[13px] font-black text-[#0F7B5E]">{row.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden hidden md:block">
                          <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }} />
                        </div>
                     </div>
                   </div>
                 ))}

                 {/* Blurred Rows */}
                 <div className="grid grid-cols-12 p-5 gap-4 items-center opacity-40 bg-gray-50/50 pointer-events-none hidden md:grid">
                     <div className="col-span-4">
                       <div className="font-bold text-gray-900 text-sm mb-0.5 blur-[5px] select-none">████████████ ████</div>
                       <div className="text-xs text-gray-400">Nova Scotia</div>
                     </div>
                     <div className="col-span-2 text-sm text-gray-400">NS</div>
                     <div className="col-span-2 text-sm text-gray-400">Healthcare</div>
                     <div className="col-span-2 flex justify-center"><Lock className="w-4 h-4 text-gray-300" /></div>
                     <div className="col-span-2 flex justify-center"><Lock className="w-4 h-4 text-gray-300" /></div>
                 </div>
                 <div className="grid grid-cols-12 p-5 gap-4 items-center opacity-25 bg-gray-50/50 pointer-events-none hidden md:grid">
                     <div className="col-span-4">
                       <div className="font-bold text-gray-900 text-sm mb-0.5 blur-[5px] select-none">███████ ███████████</div>
                       <div className="text-xs text-gray-400">British Columbia</div>
                     </div>
                     <div className="col-span-2 text-sm text-gray-400">BC</div>
                     <div className="col-span-2 text-sm text-gray-400">Technology</div>
                     <div className="col-span-2 flex justify-center"><Lock className="w-4 h-4 text-gray-300" /></div>
                     <div className="col-span-2 flex justify-center"><Lock className="w-4 h-4 text-gray-300" /></div>
                 </div>
               </div>
            </div>

            {/* GATE OVERLAY */}
            <div className="w-full absolute bottom-0 left-0 bg-gradient-to-t from-[#f5f7fa] via-[#f5f7fa]/98 to-transparent pt-40 pb-6 flex flex-col items-center justify-end -mb-8 z-30">
               <div className="bg-white border border-gray-200 rounded-[32px] p-8 md:p-12 max-w-xl w-[92%] text-center shadow-2xl relative z-40 transform hover:-translate-y-1 transition-all duration-300">
                 <div className="w-16 h-16 bg-[#d6e6f7] rounded-full flex items-center justify-center mx-auto mb-8 text-3xl shadow-inner group">
                   <div className="transform group-hover:scale-110 transition-transform">🔓</div>
                 </div>
                 <h3 className="text-3xl font-black text-[#0d1b3e] tracking-tight mb-4">Unlock the full database</h3>
                 <p className="text-gray-500 text-base mb-10 leading-relaxed font-medium">
                   You're seeing 5 of 12,400+ LMIA-approved employers. Sign up free to access the complete list with contact details, 5-year history, and real-time search.
                 </p>
                 <ul className="space-y-4 text-left mb-10 max-w-sm mx-auto">
                   <li className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                     <div className="w-5 h-5 rounded-full bg-[#0F7B5E]/10 flex items-center justify-center flex-shrink-0">
                       <Check className="w-3.5 h-3.5 text-[#0F7B5E] stroke-[3]" />
                     </div>
                     Full employer name & HR contacts
                   </li>
                   <li className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                     <div className="w-5 h-5 rounded-full bg-[#0F7B5E]/10 flex items-center justify-center flex-shrink-0">
                       <Check className="w-3.5 h-3.5 text-[#0F7B5E] stroke-[3]" />
                     </div>
                     5-year historical LMIA data
                   </li>
                   <li className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                     <div className="w-5 h-5 rounded-full bg-[#0F7B5E]/10 flex items-center justify-center flex-shrink-0">
                       <Check className="w-3.5 h-3.5 text-[#0F7B5E] stroke-[3]" />
                     </div>
                     Filter by volume and industry
                   </li>
                   <li className="flex items-center gap-3 text-[15px] font-bold text-gray-700">
                     <div className="w-5 h-5 rounded-full bg-[#0F7B5E]/10 flex items-center justify-center flex-shrink-0">
                       <Check className="w-3.5 h-3.5 text-[#0F7B5E] stroke-[3]" />
                     </div>
                     Export to CSV for your CRM
                   </li>
                 </ul>
                 <Link href="/sign-up" className="block w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0d1b3e] font-black py-5 rounded-[20px] transition-all shadow-xl shadow-[#F5A623]/20 text-lg">
                   Sign Up Free — No Card Needed
                 </Link>
                 <div className="text-[11px] font-bold text-gray-400 mt-6 uppercase tracking-widest uppercase">Free trial · Immigration professionals only</div>
               </div>
            </div>
            {/* SPacer to account for absolute overlay */}
            <div className="h-96 md:h-[480px] w-full"></div>
          </div>

          {/* SECTOR BREAKDOWN */}
          <div className="mt-24 md:mt-32 relative z-20">
             <div className="text-center max-w-2xl mx-auto mb-16">
               <div className="text-[11px] font-bold text-[#1D6FBF] uppercase tracking-[3px] mb-4">Professional Database</div>
               <h2 className="text-3xl md:text-[42px] font-black text-[#0d1b3e] tracking-tight mb-4">
                 Browse by Sector
               </h2>
               <p className="text-gray-500 font-medium">Top industries in the JobMaze LMIA employer database</p>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🏥', name: 'Healthcare', count: '3,200+ employers', link: '/lmia-jobs-healthcare' },
                  { icon: '🚛', name: 'Trucking', count: '1,800+ employers', link: '/lmia-jobs-trucking' },
                  { icon: '🏗️', name: 'Construction', count: '2,100+ employers', link: '/search?industry=Construction' },
                  { icon: '🏨', name: 'Hospitality', count: '1,500+ employers', link: '/search?industry=Hospitality' },
                  { icon: '🌾', name: 'Agriculture', count: '900+ employers', link: '/search?industry=Agriculture' },
                  { icon: '💻', name: 'Technology', count: '800+ employers', link: '/search?industry=Technology' },
                  { icon: '🏭', name: 'Manufacturing', count: '1,100+ employers', link: '/search?industry=Manufacturing' },
                  { icon: '🛒', name: 'Retail', count: '700+ employers', link: '/search?industry=Retail' },
                ].map((s, i) => (
                  <Link key={i} href={s.link} className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:border-[#1D6FBF]/30 hover:shadow-xl hover:-translate-y-1 transition-all group">
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300 inline-block">{s.icon}</div>
                    <div className="font-bold text-[#0d1b3e] text-[15px] mb-1">{s.name}</div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{s.count}</div>
                  </Link>
                ))}
             </div>
          </div>

          {/* SEO LINKS */}
          <div className="mt-24 pt-12 border-t border-gray-100 relative z-20">
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Related Resources</div>
             <div className="flex flex-wrap gap-3">
               <Link href="/what-is-lmia" className="bg-white border border-gray-200 text-gray-700 hover:text-[#1D6FBF] hover:border-[#1D6FBF]/30 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">📋 What is LMIA?</Link>
               <Link href="/lmia-processing-time" className="bg-white border border-gray-200 text-gray-700 hover:text-[#1D6FBF] hover:border-[#1D6FBF]/30 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">⏱ LMIA Processing Times</Link>
               <Link href="/lmia-jobs-ontario" className="bg-white border border-gray-200 text-gray-700 hover:text-[#1D6FBF] hover:border-[#1D6FBF]/30 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">🏙️ LMIA Jobs Ontario</Link>
               <Link href="/lmia-jobs-saskatchewan" className="bg-white border border-gray-200 text-gray-700 hover:text-[#1D6FBF] hover:border-[#1D6FBF]/30 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">🌾 LMIA Jobs Saskatchewan</Link>
               <Link href="/for-immigration-consultants" className="bg-white border border-gray-200 text-gray-700 hover:text-[#1D6FBF] hover:border-[#1D6FBF]/30 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm">⚖️ For RCICs</Link>
             </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
