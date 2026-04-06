'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Clock,
  Search,
  Mail,
  ChevronRight,
  Zap,
  BookOpen
} from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = [
  'All posts',
  'LMIA Guides',
  'Work Permits',
  'Express Entry',
  'Provincial Programs',
  'For RCICs',
  'News & Updates'
];

const blogPosts = [
  {
    title: 'TR to PR Pathway Canada 2026 — Full Breakdown',
    excerpt: 'Who qualifies, how to apply, and what LMIA jobs help your clients transition to permanent residence. Updated with the latest eligibility criteria.',
    category: 'Immigration Pathway',
    color: 'emerald',
    date: 'Mar 2026',
    readTime: '12 min read',
    href: '/blog/tr-to-pr-pathway'
  },
  {
    title: 'LMIA Processing Times 2026 — By Stream & Province',
    excerpt: 'Current ESDC processing time data for every LMIA stream. Global Talent Stream, High-Wage, Low-Wage, Agricultural, and more.',
    category: 'Processing Times',
    color: 'amber',
    date: 'Apr 2026',
    readTime: '8 min read',
    href: '/blog/lmia-processing-time'
  },
  {
    title: 'How to Extend a Work Permit in Canada — Step-by-Step Guide 2026',
    excerpt: 'A complete guide to work permit extension in Canada — who is eligible, what documents are needed, and how long it takes.',
    category: 'Work Permits',
    color: 'pink',
    date: 'Mar 2026',
    readTime: '10 min read',
    href: '/blog/work-permit-extension'
  },
  {
    title: 'LMIA vs Work Permit — What\'s the Difference?',
    excerpt: 'Many clients confuse LMIAs with work permits. This guide explains exactly how they relate, what each document does, and when you need both.',
    category: 'LMIA Basics',
    color: 'blue',
    date: 'Feb 2026',
    readTime: '7 min read',
    href: '/blog/lmia-vs-work-permit'
  },
  {
    title: 'Spousal Open Work Permit (SOWP) 2026 — Eligibility & Application',
    excerpt: 'Who qualifies for a spousal open work permit in 2026, TEER requirements, how to apply, and common mistakes to avoid.',
    category: 'Work Permits',
    color: 'emerald',
    date: 'Mar 2026',
    readTime: '9 min read',
    href: '/blog/spousal-open-work-permit'
  },
  {
    title: 'How an LMIA Job Offer Boosts Your Express Entry CRS Score',
    excerpt: 'A detailed breakdown of how a valid LMIA-backed job offer adds up to 200 CRS points to an Express Entry profile — and how to find qualifying employers.',
    category: 'Express Entry',
    color: 'amber',
    date: 'Apr 2026',
    readTime: '11 min read',
    href: '/blog/express-entry-lmia'
  },
  {
    title: 'SINP Jobs 2026 — How to Find LMIA Jobs for Saskatchewan PNP',
    excerpt: 'A guide to using LMIA job listings to support Saskatchewan Immigrant Nominee Program (SINP) applications in 2026.',
    category: 'Saskatchewan',
    color: 'pink',
    date: 'Apr 2026',
    readTime: '9 min read',
    href: '/blog/sinp-jobs'
  },
  {
    title: 'Canada PR Application — A Complete Guide for Immigration Consultants',
    excerpt: 'An end-to-end overview of Canada\'s permanent residence pathways — Express Entry, PNP, family class, and more. With links to LMIA job resources.',
    category: 'PR Pathways',
    color: 'blue',
    date: 'Mar 2026',
    readTime: '14 min read',
    href: '/blog/canada-pr-application'
  },
  {
    title: 'Family Sponsorship Canada 2026 — Complete Application Guide',
    excerpt: 'Everything you need to know about sponsoring a family member for Canadian permanent residence — eligibility, documents, timelines, and common issues.',
    category: 'Family Immigration',
    color: 'emerald',
    date: 'Feb 2026',
    readTime: '13 min read',
    href: '/blog/family-sponsorship'
  },
  {
    title: 'LMIA Approved Employers List Canada — How to Find & Use It',
    excerpt: 'How to find, verify, and use ESDC\'s LMIA employer data to identify the best job opportunities for your immigration clients.',
    category: 'Employer Research',
    color: 'amber',
    date: 'Apr 2026',
    readTime: '8 min read',
    href: '/blog/lmia-employers-list'
  },
  {
    title: 'How RCICs Use JobMaze to Save 4+ Hours Per Client',
    excerpt: 'A look at how Regulated Canadian Immigration Consultants are using JobMaze to streamline LMIA research and take on more clients.',
    category: 'For RCICs',
    color: 'pink',
    date: 'Mar 2026',
    readTime: '6 min read',
    href: '/blog/for-rcics'
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-brand-900 pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_120%,rgba(15,123,94,0.2)_0%,transparent_65%)] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="text-brand-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Immigration Guides</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              The JobMaze Blog
            </h1>
            <p className="text-blue-100/70 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              LMIA guides, immigration updates, and practical resources for Canadian immigration professionals.
            </p>
          </div>
        </section>

        {/* FEATURED POST */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/what-is-lmia"
              className="group block bg-brand-900 rounded-3xl overflow-hidden shadow-2xl hover:shadow-brand-900/20 transition-all duration-500"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 md:p-12">
                  <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
                    <Zap className="w-3 h-3" />
                    Featured Guide
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-4 group-hover:text-amber-400 transition-colors">
                    What is an LMIA? The Complete 2026 Guide
                  </h2>
                  <p className="text-blue-100/70 text-lg leading-relaxed mb-8 font-light">
                    Everything immigration professionals need to know about Canada's Labour Market Impact Assessment — streams, costs, processing times, and more.
                  </p>
                  <div className="flex items-center gap-3 text-amber-400 font-bold group-hover:gap-5 transition-all">
                    Read the full guide
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white/5 p-8 md:p-12 flex flex-col justify-center border-l border-white/10">
                  <div className="text-blue-300/60 text-xs font-bold uppercase tracking-widest mb-6">Quick Answer</div>
                  <p className="text-blue-50 text-lg leading-relaxed mb-8">
                    An LMIA is a document issued by ESDC confirming a Canadian employer could not find a qualified Canadian for a position — allowing them to hire a foreign worker.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">$1,000</div>
                      <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold">App Fee</div>
                    </div>
                    <div className="text-center border-x border-white/10 px-2">
                      <div className="text-2xl font-black text-white">18 mo</div>
                      <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold">Valid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">2 wks</div>
                      <div className="text-[10px] text-blue-300/50 uppercase tracking-widest font-bold">GTS Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* CATEGORIES & BLOG GRID */}
        <section className="pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            {/* SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 py-8 border-y border-slate-200">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <button
                    key={i}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${i === 0
                      ? 'bg-brand-500 text-white shadow-brand-500/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-500/50 hover:text-brand-600'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search articles..."
                  className="pl-11 rounded-full border-slate-200 focus-visible:ring-brand-500 bg-white"
                />
              </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, i) => (
                <Link
                  key={i}
                  href={post.href}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`h-1.5 w-full bg-${post.color}-500`} />
                  <div className="p-6">
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-3 text-${post.color}-600`}>
                      {post.category}
                    </div>
                    <h3 className="text-xl font-bold text-brand-900 leading-snug mb-3 group-hover:text-brand-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <div className="bg-slate-50 text-brand-900 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* PAGINATION (MOCK) */}
            <div className="flex justify-center mt-16">
              <Button variant="outline" className="rounded-full px-8 py-6 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand-600 font-bold gap-2">
                Load More Articles
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* NEWSLETTER SECTION */}
        <section className="bg-brand-900 py-20 px-6 overflow-hidden relative border-t-4 border-emerald-500">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Get the weekly LMIA digest
            </h2>
            <p className="text-blue-100/70 text-lg mb-10 max-w-xl mx-auto font-light leading-relaxed">
              New LMIA job listings, draw updates, and immigration news — delivered to your inbox every Monday.
            </p>
            <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto mb-6">
              <Input
                type="email"
                placeholder="RCIC@immigration.ca"
                className="h-12 rounded-full border-white/10 bg-white/5 text-white placeholder:text-blue-200/30 focus-visible:ring-emerald-500 px-6 min-w-[280px]"
              />
              <Button className="h-12 w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-brand-900 px-8 rounded-full font-bold shadow-lg shadow-amber-400/20 transition-all active:scale-95 whitespace-nowrap">
                Subscribe Now
              </Button>
            </form>
            <div className="text-blue-300/40 text-xs font-medium">
              Join 500+ immigration professionals · Unsubscribe anytime
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
