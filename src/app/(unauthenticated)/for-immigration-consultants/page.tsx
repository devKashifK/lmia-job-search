'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, ChevronRight, Activity, MapPin, Search, Tag,
  Download, Target, Layers, FileText, UserPlus, Clock, Eye, Briefcase
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';

export default function ForImmigrationConsultants() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_50%,rgba(29,111,191,0.25)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-100 border border-brand-200 text-brand-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
                ⚖️ Built for RCICs
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight mb-6">
                The <span className="text-amber-400">LMIA search tool</span> your practice has been missing
              </h1>

              <p className="text-blue-100/70 text-lg leading-relaxed mb-10 font-light max-w-xl">
                Stop spending 4+ hours per client hunting LMIA jobs manually. JobMaze gives immigration consultants a searchable, daily-updated database of LMIA-eligible positions across all of Canada.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link
                  href="/sign-up"
                  className="bg-amber-400 hover:bg-amber-400/90 text-brand-900 font-bold px-10 py-5 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 text-lg shadow-xl shadow-amber-100"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 text-brand-900" />
                </Link>
                <Link
                  href="#workflow"
                  className="text-white/70 hover:text-white font-medium px-6 py-4 transition-all flex items-center gap-2"
                >
                  See how it works <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">10,000+</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Active LMIA listings</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">4.8 hrs</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Saved per client</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">All 13</div>
                  <div className="text-[11px] text-blue-200/60 uppercase tracking-wider mt-1 font-medium">Provinces covered</div>
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW COMPONENT */}
            <div className="relative space-y-3">
              {/* Card 1 */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-[10px] font-bold tracking-widest uppercase text-brand-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                  Live LMIA Search
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-brand-50 text-brand-600 border-brand-200 uppercase text-[10px] tracking-wider py-1 px-2.5">Saskatchewan</Badge>
                  <Badge variant="outline" className="bg-brand-50 text-brand-600 border-brand-200 uppercase text-[10px] tracking-wider py-1 px-2.5">Healthcare</Badge>
                  <Badge variant="outline" className="bg-brand-50 text-brand-600 border-brand-200 uppercase text-[10px] tracking-wider py-1 px-2.5">TEER 1–2</Badge>
                  <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10 uppercase text-[10px] tracking-wider py-1 px-2.5">+3 filters</Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="bg-white/[0.06] rounded-lg p-2.5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="text-sm font-medium text-white truncate flex-1">Registered Nurse — Regina Health Authority</div>
                    <Badge className="bg-emerald-200 text-emerald-500 border border-emerald-200 whitespace-nowrap text-[10px]">LMIA Approved</Badge>
                  </div>
                  <div className="bg-white/[0.06] rounded-lg p-2.5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="text-sm font-medium text-white truncate flex-1">Licensed Practical Nurse — Saskatoon Medical</div>
                    <Badge className="bg-emerald-200 text-emerald-500 border border-emerald-200 whitespace-nowrap text-[10px]">LMIA Approved</Badge>
                  </div>
                  <div className="bg-white/[0.06] rounded-lg p-2.5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
                    <div className="text-sm font-medium text-white truncate flex-1">Medical Lab Technician — SK Health Board</div>
                    <Badge className="bg-brand-200 text-brand-400 border border-brand-300 whitespace-nowrap text-[10px]">LMIA Eligible</Badge>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                <div className="text-[10px] font-bold tracking-widest uppercase text-brand-400 mb-3">
                  ⏱ Time Saved This Week
                </div>
                <div className="bg-amber-100/50 border border-amber-200 rounded-xl p-3 px-4 flex items-center gap-4">
                  <div className="text-3xl font-black text-amber-500">4.8h</div>
                  <div className="text-xs text-amber-900/70 leading-relaxed">
                    Average time saved per RCIC per client search vs. manual research
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                <div className="text-[10px] font-bold tracking-widest uppercase text-brand-400 mb-3">
                  📋 Client Match: Priya S. — NOC 31301
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 px-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="text-sm font-medium text-emerald-900 flex-1">3 strong matches found in Saskatchewan</div>
                  <Badge className="bg-emerald-200 text-emerald-700 border border-emerald-200 whitespace-nowrap text-[10px]">Export Ready</Badge>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PROBLEMS & SOLUTIONS COMPONENT */}
        <section className="py-24 px-6 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">The Problem</div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-900 tracking-tight mb-4">
              LMIA research is eating your billable hours
            </h2>
            <p className="text-gray-500 text-lg mb-14 max-w-2xl">
              Every RCIC knows the frustration. Manual LMIA job research is slow, scattered, and error-prone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white border text-center border-gray-200 rounded-2xl p-8 relative overflow-hidden group hover:border-red-200 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500" />
                <div className="text-4xl mb-4">⏳</div>
                <h3 className="text-lg font-bold text-brand-900 mb-3">Hours lost per client</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Cross-referencing ESDC records, job boards, and employer databases for each client takes 3–5 hours of unbillable research time.
                </p>
              </div>
              <div className="bg-white border text-center border-gray-200 rounded-2xl p-8 relative overflow-hidden group hover:border-red-200 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500" />
                <div className="text-4xl mb-4">🗂️</div>
                <h3 className="text-lg font-bold text-brand-900 mb-3">Scattered data sources</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  LMIA data lives across ESDC portals, Job Bank, and dozens of industry sites — none of which are built for immigration professionals.
                </p>
              </div>
              <div className="bg-white border text-center border-gray-200 rounded-2xl p-8 relative overflow-hidden group hover:border-red-200 transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500" />
                <div className="text-4xl mb-4">📉</div>
                <h3 className="text-lg font-bold text-brand-900 mb-3">Stale listings waste effort</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  By the time you find a promising listing, it may be months old. Acting on expired data is a frustrating dead end for you and your client.
                </p>
              </div>
            </div>

            <div className="flex justify-center mb-12 relative">
              <div className="bg-white px-6 py-2 text-sm font-bold text-brand-600 tracking-widest uppercase relative z-10 border border-brand-50 rounded-full">↓ JobMaze solves all three ↓</div>
              <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border text-center border-brand-50 rounded-2xl p-8 relative overflow-hidden group hover:border-brand-200 transition-colors shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-emerald-500" />
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-bold text-brand-900 mb-3">5-minute LMIA searches</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  One search, every province, all industries, filtered by NOC and TEER. What took hours takes minutes.
                </p>
              </div>
              <div className="bg-white border text-center border-brand-50 rounded-2xl p-8 relative overflow-hidden group hover:border-brand-200 transition-colors shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-emerald-500" />
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-brand-900 mb-3">One centralized database</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  ESDC records, Job Bank, employer directories — all aggregated and cleaned into a single searchable platform.
                </p>
              </div>
              <div className="bg-white border text-center border-brand-50 rounded-2xl p-8 relative overflow-hidden group hover:border-brand-200 transition-colors shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-emerald-500" />
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-lg font-bold text-brand-900 mb-3">Updated every 24 hours</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  New listings every morning. Expired listings flagged. You always work with today's data, never yesterday's.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 px-6 bg-white border-b border-gray-100" id="features">
          <div className="max-w-6xl mx-auto">
            <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">Features for RCICs</div>
            <h2 className="text-3xl md:text-4xl font-black text-brand-900 tracking-tight mb-12 text-center">
              Designed for the modern RCIC
            </h2>

            <div className="space-y-24">
              {/* Feature 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">Smart Search</div>
                  <h3 className="text-3xl font-black text-brand-900 tracking-tight mb-4">NOC & TEER-matched job search</h3>
                  <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                    Filter LMIA jobs directly by your client's NOC code and TEER level. Stop guessing which jobs qualify — JobMaze shows you exactly which positions align with your client's immigration pathway.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Search by NOC code, job title, or keyword</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Filter by TEER 0–5 for pathway eligibility</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Cross-reference with Express Entry CRS job offer requirements</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Save searches per client with custom labels</span></li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex px-2 pb-4 mb-4 border-b border-gray-200 items-center justify-start gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-amber-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-xs font-bold text-gray-500 ml-2">LMIA Job Search — JobMaze</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4 px-2">
                    <Badge variant="outline" className="bg-brand-50 text-brand-600 border-brand-200 uppercase text-[10px] tracking-wider py-1">NOC 31301</Badge>
                    <Badge variant="outline" className="bg-brand-50 text-brand-600 border-brand-200 uppercase text-[10px] tracking-wider py-1">TEER 1</Badge>
                    <Badge variant="outline" className="bg-brand-50 text-brand-600 border-brand-200 uppercase text-[10px] tracking-wider py-1">Ontario</Badge>
                    <Badge variant="outline" className="bg-white text-gray-500 border-gray-200 uppercase text-[10px] tracking-wider py-1">Wage $35+</Badge>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">🏥</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">Registered Nurse – Toronto General</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">Toronto, ON · $38–44/hr · Full-time</div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap text-[10px]">LMIA ✓</Badge>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">🏥</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">RN – Scarborough Health Network</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">Scarborough, ON · $36–42/hr · Full-time</div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap text-[10px]">LMIA ✓</Badge>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">🏥</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">Staff Nurse – Brampton Civic Hospital</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">Brampton, ON · $37–40/hr · Full-time</div>
                      </div>
                      <Badge className="bg-brand-50 text-brand-600 border border-brand-100 whitespace-nowrap text-[10px]">Eligible</Badge>
                    </div>
                  </div>
                  <div className="text-center pt-4 text-xs text-gray-400 font-medium">47 results · Updated 6 hours ago</div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1 bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex px-2 pb-4 mb-4 border-b border-gray-200 items-center justify-start gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-amber-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-xs font-bold text-gray-500 ml-2">Saved Searches — JobMaze</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-white border border-brand-200 shadow-sm rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center text-xl">👤</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">Priya S. — Nurse · SK</div>
                        <div className="text-xs text-gray-500 mt-0.5">3 shortlisted · Last updated today</div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap text-[10px]">Active</Badge>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center text-xl">👤</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">Raj P. — Trucker · AB</div>
                        <div className="text-xs text-gray-500 mt-0.5">5 shortlisted · 2 contacted</div>
                      </div>
                      <Badge className="bg-brand-50 text-brand-600 border border-brand-100 whitespace-nowrap text-[10px]">In Progress</Badge>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center text-xl">👤</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">Aisha M. — IT · BC</div>
                        <div className="text-xs text-gray-500 mt-0.5">8 shortlisted · Exported</div>
                      </div>
                      <Badge className="bg-amber-50 text-amber-600 border border-amber-600/20 whitespace-nowrap text-[10px]">Export Done</Badge>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">Client Management</div>
                  <h3 className="text-3xl font-black text-brand-900 tracking-tight mb-4">Manage 20 clients, not 20 tabs</h3>
                  <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                    Save individual searches per client, tag listings as shortlisted or contacted, and export client-ready reports — all within a single JobMaze account.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Save unlimited named searches (one per client)</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Tag jobs as Reviewed, Shortlisted, or Contacted</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Export PDF or CSV reports for client presentations</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">90-day search history automatically archived</span></li>
                  </ul>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">Employer Intelligence</div>
                  <h3 className="text-3xl font-black text-brand-900 tracking-tight mb-4">Full employer LMIA history at a glance</h3>
                  <p className="text-gray-500 text-lg mb-6 leading-relaxed">
                    Before you advise a client to pursue an employer, check their full LMIA track record. See how many applications they've filed, approval rates, and sectors — all sourced from ESDC public records.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">View full LMIA application history per employer</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">See approval vs. rejection rates</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Compliance flags from ESDC non-compliance records</span></li>
                    <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /><span className="text-gray-700">Direct employer contact details (name, phone, email)</span></li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex px-2 pb-4 mb-4 border-b border-gray-200 items-center justify-start gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-amber-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-xs font-bold text-gray-500 ml-2">Employer Profile — JobMaze</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-base font-bold text-brand-900 mb-1">Regina Health Authority</div>
                    <div className="text-xs text-gray-500 mb-5 pb-5 border-b border-gray-100 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Healthcare · Regina, Saskatchewan</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-black text-emerald-700">24</div>
                        <div className="text-[10px] text-emerald-700 font-medium uppercase mt-1 tracking-wider">Total LMIAs</div>
                      </div>
                      <div className="bg-brand-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-black text-brand-600">96%</div>
                        <div className="text-[10px] text-brand-600 font-medium uppercase mt-1 tracking-wider">Approval Rate</div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-black text-amber-600">2026</div>
                        <div className="text-[10px] text-amber-600 font-medium uppercase mt-1 tracking-wider">Last Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="bg-brand-900 py-24 px-6 border-b border-white/5" id="workflow">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <div className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-3">How It Works</div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                From client intake to job match in 5 minutes
              </h2>
              <p className="text-blue-100/70 text-lg font-light">
                A simple workflow that fits directly into your existing RCIC practice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand-600 to-emerald-500 z-0" />

              {[
                { step: '1', title: 'Get client details', desc: 'Collect NOC code, TEER level, target province, and wage expectations' },
                { step: '2', title: 'Search JobMaze', desc: 'Enter client criteria into the search — results appear instantly' },
                { step: '3', title: 'Filter & shortlist', desc: 'Tag the best matches, review employer LMIA history, check wages' },
                { step: '4', title: 'Export & present', desc: 'Download a client-ready report with job details and employer contacts' },
                { step: '5', title: 'Advise & act', desc: 'Use verified data to advise clients and begin employer outreach' },
              ].map((s, i) => (
                <div key={i} className="text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-brand-800 border-2 border-brand-600 flex items-center justify-center font-black text-white text-xl mx-auto mb-6 shadow-xl">
                    {s.step}
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{s.title}</h4>
                  <p className="text-sm text-blue-200/60 px-2 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">What RCICs Say</div>
              <h2 className="text-3xl md:text-4xl font-black text-brand-900 tracking-tight mb-4">
                Real results from real consultants
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-200 transition-colors shadow-sm">
                <div className="text-amber-400 text-sm tracking-widest mb-4">★★★★★</div>
                <p className="text-gray-700 italic leading-relaxed mb-6">
                  "I used to spend half my Monday mornings on LMIA research. JobMaze cut that down to 20 minutes. My clients are getting faster, better-matched options now."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm tracking-tight">SP</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Simran P.</div>
                    <div className="text-xs text-gray-500">RCIC · Ontario</div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-200 transition-colors shadow-sm">
                <div className="text-amber-400 text-sm tracking-widest mb-4">★★★★★</div>
                <p className="text-gray-700 italic leading-relaxed mb-6">
                  "The TEER filter is a game-changer. I can match a client's NOC code to eligible positions in seconds. The employer LMIA history is incredibly valuable for due diligence."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm tracking-tight">RK</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Ravi K.</div>
                    <div className="text-xs text-gray-500">RCIC · British Columbia</div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-200 transition-colors shadow-sm">
                <div className="text-amber-400 text-sm tracking-widest mb-4">★★★★★</div>
                <p className="text-gray-700 italic leading-relaxed mb-6">
                  "Handling 30+ active clients was becoming impossible. JobMaze's saved searches let me organize every client's job search in one place. It's the tool I didn't know I needed."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm tracking-tight">AM</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Ayesha M.</div>
                    <div className="text-xs text-gray-500">RCIC · Saskatchewan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-900 pt-24 pb-24 px-6 text-center border-t-4 border-amber-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(29,111,191,0.3)_0%,transparent_70%)] pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
              Ready to save 4+ hours per client?
            </h2>
            <p className="text-blue-100/70 text-lg mb-10 font-light">
              Join hundreds of RCICs who have made JobMaze the backbone of their LMIA research workflow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="bg-white hover:bg-gray-100 text-brand-900 font-bold px-10 py-5 rounded-full transition-all inline-flex items-center gap-2 hover:-translate-y-1 text-lg shadow-xl"
              >
                Start Free Trial — No Card Needed
                <ArrowRight className="w-5 h-5 text-brand-900" />
              </Link>
              <Link
                href="/for-recruiters"
                className="bg-transparent border-2 border-white/30 hover:border-white/70 text-white/90 hover:text-white font-bold px-10 py-5 rounded-full transition-all inline-flex items-center gap-2 text-lg"
              >
                For Recruiters & Agencies
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
