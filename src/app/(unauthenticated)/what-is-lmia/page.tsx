'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, CheckCircle2, Info, ArrowUpRight, 
  Clock, ShieldCheck, HelpCircle, GraduationCap, 
  ChevronRight, Bookmark, Search, Database, Scale, 
  Building2, FileText, Check, Landmark, UserCheck
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';

export default function WhatIsLMIAPage() {
  const [activeSection, setActiveSection] = useState('what-is');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['what-is', 'who-needs', 'streams', 'process', 'processing-time', 'cost', 'express-entry', 'find-jobs'];
      const scrollPosition = window.scrollY + 160;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-[#0d1b3e] pt-28 pb-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_110%,rgba(29,111,191,0.2)_0%,transparent_65%)] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[11px] font-bold text-blue-200 tracking-[1.5px] uppercase mb-8">
              📋 Complete Guide · Updated 2026
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-black text-white leading-[1.05] tracking-tight mb-8">
              What is an <span className="text-[#F5A623] italic">LMIA</span>?
            </h1>
            
            <p className="text-[#8AABCF] text-lg md:text-xl leading-relaxed mb-12 font-light max-w-2xl mx-auto">
              The complete guide to Canada's Labour Market Impact Assessment — everything professionals, employers, and foreign workers need to know.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left backdrop-blur-md">
              <div className="text-[10px] font-bold text-[#4ECBA3] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4ECBA3] animate-pulse"></span>
                📌 Quick Answer
              </div>
              <p className="text-white/90 text-[17px] leading-relaxed font-light">
                An <strong>LMIA (Labour Market Impact Assessment)</strong> is a document issued by ESDC that confirms a Canadian employer was unable to find a qualified Canadian citizen or permanent resident to fill a position, and therefore has permission to hire a foreign worker. A <strong className="text-[#F5A623]">positive LMIA</strong> is required before most employers can offer a foreign worker an employer-specific work permit.
              </p>
            </div>
          </div>
        </section>

        {/* QUICK NAV / JUMP TO */}
        <div className="bg-[#f5f7fa] border-b border-gray-200 sticky top-16 z-40 overflow-x-auto overflow-y-hidden scrollbar-hide py-4 px-6 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center gap-2 whitespace-nowrap">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-4">Jump to:</span>
            {[
              { id: 'what-is', label: 'What is LMIA' },
              { id: 'who-needs', label: 'Who needs one' },
              { id: 'streams', label: 'LMIA streams' },
              { id: 'process', label: 'The process' },
              { id: 'processing-time', label: 'Processing time' },
              { id: 'cost', label: 'Cost' },
              { id: 'express-entry', label: 'Express Entry' },
              { id: 'find-jobs', label: 'Find LMIA jobs' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-[13px] font-bold px-4 py-2 rounded-full transition-all ${
                  activeSection === link.id 
                    ? 'bg-[#1D6FBF] text-white' 
                    : 'text-gray-500 hover:bg-white hover:shadow-sm'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT LAYOUT */}
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* ARTICLE CONTENT */}
          <article className="lg:col-span-8 space-y-16">
            
            {/* SECTION 1: WHAT IS */}
            <section id="what-is" className="scroll-mt-32">
              <h2 className="text-3xl md:text-[40px] font-black text-[#0d1b3e] tracking-tight mb-8">What is an LMIA?</h2>
              <p className="text-[#374151] text-lg leading-relaxed mb-6 font-light">
                The <strong>Labour Market Impact Assessment (LMIA)</strong> is Canada's primary mechanism for ensuring that hiring a foreign worker does not negatively impact Canadian workers. Before most Canadian employers can hire a Temporary Foreign Worker (TFW), they must apply to Employment and Social Development Canada (ESDC) for an LMIA.
              </p>
              <p className="text-[#374151] text-lg leading-relaxed mb-8 font-light">
                The LMIA process requires employers to demonstrate that:
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'They have made genuine efforts to recruit a Canadian citizen or permanent resident',
                  'No qualified Canadian workers were available for the role',
                  'The employment of a foreign worker will not negatively affect Canadian employment',
                  'Wages and working conditions meet or exceed provincial standards'
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-[#1D6FBF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#1D6FBF] stroke-[3]" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-[#D6E6F7]/50 border border-[#1D6FBF]/20 rounded-2xl p-8">
                <div className="text-[10px] font-bold text-[#1D6FBF] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  📌 Positive vs Negative LMIA
                </div>
                <p className="text-gray-700 text-[15px] leading-relaxed">
                  A <strong>positive LMIA</strong> approves the employer's application — the foreign worker can then use it to apply for a work permit. A <strong>negative LMIA</strong> means the application was rejected and the employer cannot hire a foreign worker for that position under that application.
                </p>
              </div>
            </section>

            <div className="h-px bg-gray-100" />

            {/* SECTION 2: WHO NEEDS */}
            <section id="who-needs" className="scroll-mt-32">
              <h2 className="text-3xl font-black text-[#0d1b3e] tracking-tight mb-8">Who needs an LMIA?</h2>
              <p className="text-gray-600 mb-8 font-light text-[17px]">
                Most Canadian employers who want to hire a foreign worker through the <strong>Temporary Foreign Worker Program (TFWP)</strong> must obtain an LMIA. However, some work permit categories are LMIA-exempt.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                   <h3 className="text-lg font-black text-[#0d1b3e] flex items-center gap-2 uppercase tracking-wide">
                     <Building2 className="w-5 h-5 text-[#1D6FBF]" />
                     Requires LMIA (TFWP)
                   </h3>
                   <ul className="space-y-4">
                     {[
                       'Skilled and semi-skilled occupations',
                       'Seasonal Agricultural Worker Program (SAWP)',
                       'Most tech workers outside GTS',
                       'Any employer-specific (closed) work permit'
                     ].map((t, i) => (
                       <li key={i} className="flex gap-3 text-sm text-gray-700 font-medium leading-relaxed">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#1D6FBF] mt-2 flex-shrink-0" />
                         {t}
                       </li>
                     ))}
                   </ul>
                </div>
                <div className="space-y-6">
                   <h3 className="text-lg font-black text-[#0d1b3e] flex items-center gap-2 uppercase tracking-wide">
                     <GraduationCap className="w-5 h-5 text-[#0F7B5E]" />
                     LMIA-Exempt (IMP)
                   </h3>
                   <ul className="space-y-4 text-sm text-gray-700 font-medium italic">
                     {[
                       'Intra-company transferees (ICT)',
                       'CUSMA / USMCA trade professionals',
                       'International Experience Canada (IEC)',
                       'Open work permits (Graduates, Spouses)'
                     ].map((t, i) => (
                       <li key={i} className="flex gap-3 leading-relaxed">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#0F7B5E] mt-2 flex-shrink-0" />
                         {t}
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-100" />

            {/* SECTION 3: STREAMS */}
            <section id="streams" className="scroll-mt-32">
              <h2 className="text-3xl font-black text-[#0d1b3e] tracking-tight mb-8">LMIA streams explained</h2>
              <p className="text-gray-600 mb-10 font-light text-[17px]">
                ESDC administers several different LMIA streams, each designed for a specific type of employment situation.
              </p>
              
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-10 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#0d1b3e] text-white/70 uppercase tracking-widest text-[10px] font-bold">
                      <th className="p-5 border-b border-white/5">Stream</th>
                      <th className="p-5 border-b border-white/5">Target</th>
                      <th className="p-5 border-b border-white/5">Processing</th>
                      <th className="p-5 border-b border-white/5">Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { s: 'High-Wage Stream', t: 'Wages at/above provincial median', p: '2–5 months', r: 'Transition plan required' },
                      { s: 'Low-Wage Stream', t: 'Wages below provincial median', p: '2–5 months', r: 'Cap on TFW workforce (10-20%)' },
                      { s: 'Global Talent Stream', t: 'Tech & highly-skilled', p: '2 weeks', r: 'Employer-specific validation', highlighted: true },
                      { s: 'Agricultural Stream', t: 'Primary agriculture employers', p: 'Seasonal', r: 'Housing & transit compliance' },
                    ].map((row, i) => (
                      <tr key={i} className={`hover:bg-gray-50 transition-colors ${row.highlighted ? 'bg-[#0F7B5E]/5' : ''}`}>
                        <td className="p-5 font-bold text-[#0d1b3e]">{row.s}</td>
                        <td className="p-5 text-gray-500">{row.t}</td>
                        <td className="p-5">
                          {row.highlighted ? (
                            <span className="bg-[#0F7B5E]/10 text-[#0F7B5E] text-[11px] font-black px-2 py-1 rounded-full uppercase tracking-wider">{row.p}</span>
                          ) : <span className="text-gray-500">{row.p}</span>}
                        </td>
                        <td className="p-5 text-gray-500 italic text-xs">{row.r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-[#FEF0D7] border border-[#F5A623]/20 rounded-2xl p-8">
                <div className="text-[10px] font-bold text-[#C47B12] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  ⚡ Global Talent Stream — the fast track
                </div>
                <p className="text-orange-950/80 text-[15px] leading-relaxed font-medium">
                  The Global Talent Stream offers a 2-week processing standard — by far the fastest LMIA stream. It's designed for technology and highly-skilled positions. Eligible job titles include software engineers, data scientists, product managers, and more.
                </p>
              </div>
            </section>

            <div className="h-px bg-gray-100" />

            {/* SECTION 4: PROCESS */}
            <section id="process" className="scroll-mt-32">
              <h2 className="text-3xl font-black text-[#0d1b3e] tracking-tight mb-8">The LMIA application process</h2>
              <p className="text-gray-600 mb-12 font-light text-[17px]">
                The LMIA process is initiated by the <strong>employer</strong>, not the foreign worker. Here is the 6-step overview.
              </p>
              
              <div className="space-y-0 relative">
                 <div className="absolute left-[24px] top-4 bottom-4 w-0.5 bg-gray-100 hidden md:block" />
                 {[
                   { t: 'Employer advertises the position', d: 'The employer must post the job on Job Bank Canada and 2 other channels for at least 4 weeks.' },
                   { t: 'Employer submits application to ESDC', d: 'Employer submits recruitment evidence and a $1,000 CAD application fee per position.' },
                   { t: 'ESDC reviews the application', d: 'ESDC assesses the employer\'s recruitment efforts, wage compliance, and labour market impact.' },
                   { t: 'ESDC issues a decision', d: 'If approved, ESDC issues a positive LMIA validation letter valid for 18 months.' },
                   { t: 'Employer shares LMIA with worker', d: 'The worker uses the LMIA and job offer to apply for an employer-specific work permit.' },
                   { t: 'IRCC processes the work permit', d: 'IRCC makes the final decision on admissibility and eligibility to work in Canada.' },
                 ].map((step, i) => (
                   <div key={i} className="flex gap-8 py-8 border-b border-gray-50 last:border-0 relative">
                     <div className="w-12 h-12 rounded-full bg-[#1D6FBF] text-white flex items-center justify-center font-black text-lg z-10 flex-shrink-0 shadow-lg shadow-[#1D6FBF]/20">
                       {i + 1}
                     </div>
                     <div className="pt-1">
                       <h4 className="text-lg font-black text-[#0d1b3e] mb-2">{step.t}</h4>
                       <p className="text-gray-500 font-medium text-[15px] leading-relaxed max-w-xl">{step.d}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </section>

            <div className="h-px bg-gray-100" />

            {/* SECTION 5: PROCESSING TIME */}
            <section id="processing-time" className="scroll-mt-32">
              <div className="flex items-center gap-2 text-[11px] font-black text-[#1D6FBF] tracking-[2px] uppercase mb-4">
                <Clock className="w-4 h-4" /> Updated 2026
              </div>
              <h2 className="text-3xl font-black text-[#0d1b3e] tracking-tight mb-8">LMIA processing time 2026</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                 {[
                   { l: 'Global Talent Stream', v: '2 Weeks' },
                   { l: 'High-Wage Stream', v: '8–16 Weeks' },
                   { l: 'Low-Wage Stream', v: '8–20 Weeks' },
                   { l: 'In-Home Caregiver', v: '8–14 Weeks' },
                 ].map((t, i) => (
                   <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 flex justify-between items-center shadow-sm">
                     <span className="font-bold text-gray-900">{t.l}</span>
                     <span className="bg-[#1D6FBF]/10 text-[#1D6FBF] text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">{t.v}</span>
                   </div>
                 ))}
              </div>
              
              <div className="bg-[#f5f7fa] border border-gray-200 rounded-2xl p-8">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  💡 Tip for immigration professionals
                </div>
                <p className="text-gray-600 text-[15px] leading-relaxed font-medium italic">
                  Advise clients to factor in LMIA processing time when planning. For work permit extensions, employers should apply 4–5 months before expiration.
                </p>
              </div>
            </section>

            <div className="h-px bg-gray-100" />

            {/* SECTION 6: COST */}
            <section id="cost" className="scroll-mt-32">
              <h2 className="text-3xl font-black text-[#0d1b3e] tracking-tight mb-8">How much does an LMIA cost?</h2>
              <p className="text-[#374151] text-lg leading-relaxed mb-8 font-light">
                The standard LMIA application fee is <strong>$1,000 CAD per position</strong>. This fee is non-refundable.
              </p>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-10">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Exceptions — No fee required</h4>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
                   {[
                     'Primary agriculture positions (SAWP)',
                     'Wages in the top 10th percentile nationally',
                     'Northern and remote areas designated by ESDC',
                     'Some live-in caregiver positions'
                   ].map((item, i) => (
                     <div key={i} className="flex gap-3 text-sm text-gray-700 font-bold items-center">
                       <CheckCircle2 className="w-5 h-5 text-[#4ECBA3] flex-shrink-0" />
                       {item}
                     </div>
                   ))}
                </div>
              </div>
              <p className="text-sm text-red-600 font-bold italic">
                ⚠️ Employers are legally prohibited from recovering or deducting the LMIA application fee from the foreign worker's wages.
              </p>
            </section>

            <div className="h-px bg-gray-100" />

            {/* SECTION 7: EXPRESS ENTRY */}
            <section id="express-entry" className="scroll-mt-32">
              <h2 className="text-3xl font-black text-[#0d1b3e] tracking-tight mb-8">LMIA and Express Entry</h2>
              <p className="text-[#374151] text-lg leading-relaxed mb-10 font-light">
                A valid job offer supported by a positive LMIA significantly boosts CRS scores under Canada's Express Entry system.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                 <div className="bg-[#1d6fbf] rounded-2xl p-8 text-white relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
                      <Landmark className="w-24 h-24" />
                    </div>
                    <div className="text-5xl font-black mb-4">+200</div>
                    <div className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">CRS points</div>
                    <p className="text-white/90 text-sm font-light leading-relaxed">
                      For TEER 0 Senior Manager positions (NOC 00011–00015) with a positive LMIA.
                    </p>
                 </div>
                 <div className="bg-[#0F7B5E] rounded-2xl p-8 text-white relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
                      <UserCheck className="w-24 h-24" />
                    </div>
                    <div className="text-5xl font-black mb-4">+50</div>
                    <div className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">CRS points</div>
                    <p className="text-white/90 text-sm font-light leading-relaxed">
                      For TEER 0, 1, 2, or 3 positions with a positive LMIA.
                    </p>
                 </div>
              </div>
              
              <div className="bg-[#EAF5F2] border border-[#0F7B5E]/20 rounded-2xl p-10 flex flex-col md:flex-row items-center gap-10">
                 <div className="flex-1">
                   <h4 className="text-xl font-black text-[#0F7B5E] mb-4">Finding LMIA job offers with JobMaze</h4>
                   <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                     JobMaze helps immigration professionals identify LMIA-approved employers across all provinces. Filter by NOC code and TEER level to find the strongest opportunities.
                   </p>
                   <Link href="/sign-up" className="inline-flex items-center gap-2 text-[#0F7B5E] font-black text-[15px] hover:underline decoration-2 underline-offset-4">
                     Browse LMIA Jobs Now <ArrowRight className="w-4 h-4" />
                   </Link>
                 </div>
                 <div className="w-32 h-32 bg-[#0F7B5E]/5 shadow-inner rounded-full flex items-center justify-center text-5xl">🎯</div>
              </div>
            </section>

            <div className="h-px bg-gray-100" />

            {/* SECTION 8: FIND JOBS */}
            <section id="find-jobs" className="scroll-mt-32">
              <h2 className="text-3xl font-black text-[#0d1b3e] tracking-tight mb-8">How to find LMIA jobs for clients</h2>
              <p className="text-gray-600 mb-10 font-light text-[17px]">
                Manual research is fragmented. Here are the 4 most effective ways immigration professionals find LMIA opportunities:
              </p>
              
              <div className="grid gap-6">
                {[
                  { t: 'JobMaze.ca', d: 'The dedicated LMIA job board for professionals. Search by province, NOC, TEER, and LMIA status.', l: 'Start searching →', link: '/search' },
                  { t: 'Job Bank Canada', d: 'Government job board. Look for employers flagged for LMIA during the mandatory 4-week window.', l: 'Visit Job Bank', link: 'https://www.jobbank.gc.ca' },
                  { t: 'Direct Outreach', d: 'Identify employers with LMIA history and contact their HR departments regarding current needs.', l: 'View Employer History', link: '/lmia-employers-list' },
                  { t: 'Public ESDC Data', d: 'Official quarterly disclosure of positive LMIAs. Useful for deep sector research and trends.', l: 'Access Data', link: 'https://open.canada.ca' },
                ].map((item, i) => (
                  <div key={i} className="group p-6 bg-white border border-gray-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all hover:border-[#1D6FBF]/20">
                    <div>
                       <h5 className="font-black text-[#0d1b3e] mb-1">{item.t}</h5>
                       <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-sm">{item.d}</p>
                    </div>
                    <Link href={item.link} className="text-[#1D6FBF] font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      {item.l} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>

          </article>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-8 sticky top-36">
            
            {/* TOC */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
               <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Table of Contents</h4>
               <nav className="flex flex-col gap-1">
                 {[
                   { id: 'what-is', label: 'What is an LMIA?' },
                   { id: 'who-needs', label: 'Who needs one?' },
                   { id: 'streams', label: 'LMIA streams' },
                   { id: 'process', label: 'The application process' },
                   { id: 'processing-time', label: 'Processing times 2026' },
                   { id: 'cost', label: 'Cost & fees' },
                   { id: 'express-entry', label: 'LMIA & Express Entry' },
                   { id: 'find-jobs', label: 'How to find LMIA jobs' },
                 ].map((link) => (
                   <button
                     key={link.id}
                     onClick={() => scrollToSection(link.id)}
                     className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                       activeSection === link.id 
                         ? 'bg-[#EAF2FA] text-[#1D6FBF]' 
                         : 'text-gray-500 hover:bg-gray-50'
                     }`}
                   >
                     <ChevronRight className={`w-3 h-3 ${activeSection === link.id ? 'opacity-100' : 'opacity-0'}`} />
                     {link.label}
                   </button>
                 ))}
               </nav>
            </div>

            {/* QUICK FACTS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
               <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Quick Facts</h4>
               <div className="space-y-4">
                 {[
                   { l: 'Issued by', v: 'ESDC' },
                   { l: 'Application Fee', v: '$1,000 CAD' },
                   { l: 'Validity', v: '18 Months' },
                   { l: 'GTS Processing', v: '2 Weeks' },
                   { l: 'Standard', v: '8–20 Weeks' },
                 ].map((f, i) => (
                   <div key={i} className="flex justify-between items-center text-[13px] pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                     <span className="text-gray-400 font-medium">{f.l}</span>
                     <span className="font-bold text-[#0d1b3e]">{f.v}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* SIDEBAR CTA */}
            <div className="bg-[#0d1b3e] rounded-[32px] p-10 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.15),transparent_50%)]" />
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform">
                   <Search className="w-8 h-8 text-[#F5A623]" />
                 </div>
                 <h4 className="text-2xl font-black text-white mb-3">Search LMIA Jobs</h4>
                 <p className="text-blue-100/60 text-sm mb-10 leading-relaxed max-w-[200px] mx-auto font-light">
                   Find LMIA-approved positions for your clients — updated daily.
                 </p>
                 <Link href="/sign-up" className="block w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0d1b3e] font-black py-4 rounded-2xl transition-all shadow-xl shadow-[#F5A623]/20">
                   Start Free Trial
                 </Link>
               </div>
            </div>

          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
