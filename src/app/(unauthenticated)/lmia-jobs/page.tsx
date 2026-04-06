'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  MapPin,
  Filter,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Lock
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const jobListings = [
  {
    title: 'Registered Nurse',
    employer: 'Saskatchewan Health Authority',
    location: 'Regina, SK',
    wage: '$36–44/hr',
    noc: '31301',
    teer: '1',
    industry: 'Healthcare',
    status: 'LMIA Approved',
    icon: '🏥',
    color: 'emerald'
  },
  {
    title: 'Long-Haul Truck Driver',
    employer: 'Prairie Logistics Inc',
    location: 'Calgary, AB',
    wage: '$28–34/hr',
    noc: '73300',
    teer: '3',
    industry: 'Trucking',
    status: 'LMIA Approved',
    icon: '🚛',
    color: 'amber'
  },
  {
    title: 'Software Developer',
    employer: 'Shopify Canada',
    location: 'Ottawa, ON',
    wage: '$90–115k/yr',
    noc: '21232',
    teer: '1',
    industry: 'Technology',
    status: 'LMIA Eligible',
    icon: '💻',
    color: 'blue'
  },
  {
    title: 'Carpenter',
    employer: 'EllisDon Corporation',
    location: 'Toronto, ON',
    wage: '$38–46/hr',
    noc: '72310',
    teer: '2',
    industry: 'Construction',
    status: 'LMIA Approved',
    icon: '🏗️',
    color: 'amber'
  }
];

export default function LMIAJobsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(15,123,94,0.18)_0%,transparent_55%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
              Browse LMIA Jobs in Canada
            </h1>
            <p className="text-blue-100/70 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-12">
              10,000+ LMIA-approved and LMIA-eligible positions · Updated daily · All provinces
            </p>

            {/* SEARCH BAR (MOCKUP) */}
            <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/50" />
                <Input
                  placeholder="Job title or NOC code..."
                  className="h-12 bg-white/10 border-transparent placeholder:text-blue-200/30 text-white rounded-xl pl-11 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="relative w-full md:w-48 lg:w-56">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/50" />
                <select className="h-12 w-full bg-white/10 border-transparent text-white rounded-xl pl-11 pr-4 focus:ring-emerald-500 appearance-none text-sm font-medium">
                  <option className="bg-brand-900 text-white">All Provinces</option>
                  <option className="bg-brand-900 text-white">Ontario</option>
                  <option className="bg-brand-900 text-white">BC</option>
                  <option className="bg-brand-900 text-white">Alberta</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/30 pointer-events-none" />
              </div>
              <Button className="h-12 bg-amber-400 hover:bg-amber-500 text-brand-900 font-black px-8 rounded-xl transition-all">
                Search Jobs
              </Button>
            </div>
          </div>
        </section>

        {/* MAIN LAYOUT */}
        <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
          {/* SIDEBAR FILTERS (MOCKUP) */}
          <aside className="hidden lg:block space-y-8">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-brand-900 uppercase tracking-widest flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
              </div>

              <div className="space-y-8">
                {/* FILTER GROUP */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">LMIA Status</div>
                  <div className="space-y-3">
                    {[
                      { label: 'LMIA Approved', checked: true },
                      { label: 'LMIA Eligible', checked: true }
                    ].map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border ${opt.checked ? 'bg-brand-500 border-brand-500' : 'border-slate-200 bg-white'} flex items-center justify-center transition-all`}>
                          {opt.checked && <ShieldCheck className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${opt.checked ? 'text-brand-900' : 'text-slate-500 group-hover:text-brand-600'}`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Industry</div>
                  <div className="space-y-3">
                    {['Healthcare', 'Trucking', 'Construction', 'Hospitality', 'Agriculture', 'Technology'].map((ind, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded border border-slate-200 bg-white flex items-center justify-center transition-all group-hover:border-brand-500/50" />
                        <span className="text-sm font-medium text-slate-500 group-hover:text-brand-600">
                          {ind}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">TEER Level</div>
                  <div className="space-y-3 text-sm font-medium text-slate-500">
                    {['TEER 0', 'TEER 1', 'TEER 2', 'TEER 3', 'TEER 4'].map((teer, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded border border-slate-200 bg-white group-hover:border-brand-500/50" />
                        <span>{teer}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* JOB LISTING AREA */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-brand-900 tracking-tight">10,247 LMIA Jobs Found</h2>
                <p className="text-slate-400 text-sm italic mt-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  Showing real-time vacancies for 2026
                </p>
              </div>
              <select className="h-10 bg-white border border-slate-200 rounded-lg px-4 text-xs font-bold uppercase tracking-widest text-slate-600 focus:ring-brand-500 cursor-pointer">
                <option>Sort by: Most Recent</option>
                <option>Highest Wage</option>
                <option>Most Relevant</option>
              </select>
            </div>

            {/* JOB CARDS */}
            <div className="space-y-4">
              {jobListings.map((job, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:shadow-2xl hover:shadow-slate-100 hover:border-brand-500/30 transition-all group flex flex-col md:flex-row gap-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl flex-shrink-0">
                    {job.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-brand-900 group-hover:text-brand-500 transition-colors mb-1">
                      {job.title}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium mb-4 flex items-center gap-1.5">
                      {job.employer}
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-slate-400">{job.location}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`bg-${job.color}-500/10 text-${job.color}-600 border-${job.color}-500/20 text-[10px] font-black tracking-widest uppercase`}>
                        {job.status}
                      </Badge>
                      <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-black tracking-widest uppercase">
                        NOC {job.noc}
                      </Badge>
                      <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-black tracking-widest uppercase">
                        TEER {job.teer}
                      </Badge>
                      <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-black tracking-widest uppercase">
                        {job.industry}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                    <div className="text-brand-900 font-black text-xl tracking-tight">
                      {job.wage}
                    </div>
                    <Button className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full px-6 text-sm h-10 group-hover:scale-105 transition-all">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}

              {/* LOCKED JOBS (FADED) */}
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 opacity-40 blur-[1px] select-none pointer-events-none flex flex-col md:flex-row gap-6 relative"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl">💼</div>
                  <div className="flex-1">
                    <div className="w-1/2 h-5 bg-slate-200 rounded-md mb-2" />
                    <div className="w-1/4 h-3 bg-slate-100 rounded-md mb-4" />
                    <div className="flex gap-2">
                      <div className="w-20 h-5 bg-slate-100 rounded-full" />
                      <div className="w-16 h-5 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                  <div className="w-full md:w-32 h-10 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>

            {/* GATE BANNER */}
            <div className="mt-12 bg-brand-900 rounded-[32px] p-10 md:p-16 text-center overflow-hidden relative border-4 border-amber-400/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-6 shadow-2xl shadow-amber-400/20">
                  <Lock className="w-8 h-8 text-brand-900" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                  Showing 4 of 10,247 listings
                </h2>
                <p className="text-blue-100/70 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                  Sign up free to access all listings — including full employer contacts, LMIA history, and direct application details.
                </p>
                <Link
                  href="/sign-up"
                  className="bg-amber-400 hover:bg-amber-500 text-brand-900 font-black px-12 py-5 rounded-full text-lg shadow-2xl shadow-amber-400/30 transition-all inline-flex items-center gap-3 hover:-translate-y-1"
                >
                  Sign Up Free — Unlock All Jobs
                  <ArrowRight className="w-6 h-6" />
                </Link>
                <div className="mt-8 text-blue-300/40 text-sm font-medium flex items-center justify-center gap-6">
                  <span className="flex items-center gap-1.5">No credit card needed</span>
                  <span className="flex items-center gap-1.5 text-blue-300/60 font-bold tracking-widest">•</span>
                  <span className="flex items-center gap-1.5">Search all Provinces</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
