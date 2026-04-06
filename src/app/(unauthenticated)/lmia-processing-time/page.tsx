'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, Clock, Info, CheckCircle2, AlertCircle,
  ChevronRight, Calendar, Zap, Timer, Search, Globe, Building2
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';

export default function LMIAProcessingTime() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-[#0D1B3E] pt-20 pb-16 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_120%,rgba(29,111,191,0.25)_0%,transparent_60%)] pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#1D6FBF]/20 border border-[#1D6FBF]/40 text-[#78B4E8] rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
              ⏱ Live Status · 2026 Update
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
              LMIA <span className="text-[#F5A623] italic">Processing Times</span> 2026
            </h1>

            <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-2xl mx-auto">
              How long does an LMIA take? View current processing estimates across all streams, from the 2-week Global Talent Stream to seasonal agriculture applications.
            </p>

            {/* Quick Glance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center shadow-xl">
                <Zap className="w-6 h-6 text-[#4ECBA3] mx-auto mb-3" />
                <div className="text-2xl font-black text-white leading-none mb-1">2 Weeks</div>
                <div className="text-[10px] text-blue-200/60 uppercase tracking-widest font-bold">Global Talent Stream</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center shadow-xl">
                <Timer className="w-6 h-6 text-[#F5A623] mx-auto mb-3" />
                <div className="text-2xl font-black text-white leading-none mb-1">8–16 Weeks</div>
                <div className="text-[10px] text-blue-200/60 uppercase tracking-widest font-bold">High-Wage Stream</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center shadow-xl">
                <Calendar className="w-6 h-6 text-[#78B4E8] mx-auto mb-3" />
                <div className="text-2xl font-black text-white leading-none mb-1">8–20 Weeks</div>
                <div className="text-[10px] text-blue-200/60 uppercase tracking-widest font-bold">Low-Wage Stream</div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN ARTICLE */}
        <div className="max-w-4xl mx-auto px-6 py-20">

          <article className="prose prose-gray max-w-none text-gray-700">
            <h2 className="text-3xl md:text-4xl font-black text-[#0D1B3E] tracking-tight mb-4">
              Current processing by stream
            </h2>
            <p className="mb-6 leading-relaxed">
              Employment and Social Development Canada (ESDC) processes thousands of Labour Market Impact Assessment (LMIA) applications every month. Processing times are not fixed; they fluctuate based on the <strong>total volume of applications</strong>, the <strong>specific stream</strong> you applied under, and the <strong>completeness</strong> of your application.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-12">
              <h3 className="text-lg font-bold text-[#0D1B3E] mb-4 flex items-center gap-2">⚠️ Factors that delay processing</h3>
              <ul className="space-y-3 m-0 list-none p-0">
                <li className="flex items-start gap-2.5 text-sm"><AlertCircle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" /> Incomplete recruitment documentation</li>
                <li className="flex items-start gap-2.5 text-sm"><AlertCircle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" /> Incorrect wage or TEER classification</li>
                <li className="flex items-start gap-2.5 text-sm"><AlertCircle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" /> Missing payment for the $1,000 application fee</li>
                <li className="flex items-start gap-2.5 text-sm"><AlertCircle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" /> High seasonal demand (especially in agriculture)</li>
              </ul>
            </div>

            <div className="space-y-6 mb-16">
              {[
                {
                  stream: 'Global Talent Stream (GTS)',
                  time: '2 Weeks',
                  status: 'Fastest',
                  color: 'bg-[#D0EFE6] text-[#0F7B5E]',
                  borderColor: 'border-[#0F7B5E]/30',
                  desc: 'Designed for technology and highly-skilled positions. ESDC maintains a 10-business-day (2-week) service standard for these applications if the employer is qualifying.'
                },
                {
                  stream: 'High-Wage Stream',
                  time: '8–16 Weeks',
                  status: 'Standard',
                  color: 'bg-[#D6E6F7] text-[#1D6FBF]',
                  borderColor: 'border-[#1D6FBF]/30',
                  desc: 'For positions paying at or above the provincial/territorial median wage. These currently face moderate delays due to high volume.'
                },
                {
                  stream: 'Low-Wage Stream',
                  time: '8–20 Weeks',
                  status: 'Slowest',
                  color: 'bg-[#FEF0D7] text-[#C47B12]',
                  borderColor: 'border-[#C47B12]/30',
                  desc: 'For positions paying below the provincial/territorial median wage. Often subject to more rigorous checks regarding the 10–20% cap on foreign workers.'
                },
                {
                  stream: 'In-Home Caregiver Stream',
                  time: '8–14 Weeks',
                  status: 'Stable',
                  color: 'bg-[#F5D5E5] text-[#B83A6E]',
                  borderColor: 'border-[#B83A6E]/30',
                  desc: 'Includes home child care and home support worker categories. Processing remains relatively stable compared to previous years.'
                },
              ].map((row, i) => (
                <div key={i} className={`bg-white border ${row.borderColor} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <div>
                      <h4 className="text-xl font-bold text-[#0D1B3E] mb-1">{row.stream}</h4>
                      <Badge className={`${row.color} border-none text-[10px] uppercase font-black`}>{row.status}</Badge>
                    </div>
                    <div className="text-3xl font-black text-[#0D1B3E]">{row.time}</div>
                  </div>
                  <p className="text-sm text-gray-500 m-0 leading-relaxed font-light">
                    {row.desc}
                  </p>
                </div>
              ))}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-[#0D1B3E] tracking-tight mb-12 text-center">
              Designed for the modern RCIC
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 font-light">
              <div>
                <h4 className="font-bold text-[#0D1B3E] mb-3">Apply ahead of time</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Never wait until a current work permit is about to expire. We recommend starting the LMIA process at least <strong>5 to 6 months</strong> before the foreign worker needs to start or renew their permit.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0D1B3E] mb-3">Check NOC compliance</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The most common reason for an LMIA rejection or delay is selecting the wrong NOC code for the job duties. Ensure your job description matches the National Occupational Classification exactly.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0D1B3E] mb-3">Document recruitment early</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The 4-week recruitment period is mandatory. Keep detailed logs of all Canadian applicants and why they weren't hired. ESDC will often ask for this during the review.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#0D1B3E] mb-3">Use the Online Portal</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Physical mail applications are significantly slower. Always use the ESDC LMIA Online portal to submit your documents and track progress.
                </p>
              </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="bg-[#0D1B3E] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[#1D6FBF]/10 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-6">
                  Looking for LMIA jobs?
                </h3>
                <p className="text-blue-100/70 mb-10 max-w-lg mx-auto font-light leading-relaxed">
                  Don't wait for processing times to drop. Start searching our database of 12,000+ already-approved LMIA employers today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/search" className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0D1B3E] font-bold px-8 py-4 rounded-full transition-all flex items-center gap-2">
                    Search Live LMIA Jobs
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/lmia-employers-list" className="bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-4 rounded-full transition-all border border-white/20">
                    View Approved Employers
                  </Link>
                </div>
              </div>
            </div>

            {/* EXTERNAL LINKS */}
            <div className="mt-16 pt-8 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400 mb-4">Official Resources & Trackers</p>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-widest text-[#1D6FBF]">
                <a href="https://www.canada.ca/en/employment-social-development/services/foreign-workers/lmia-processing-times.html" target="_blank" className="hover:underline flex items-center gap-1">ESDC Tracker <Globe className="w-3 h-3" /></a>
                <a href="https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/processing-times.html" target="_blank" className="hover:underline flex items-center gap-1">IRCC Work Permit Times <Globe className="w-3 h-3" /></a>
              </div>
            </div>

          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
