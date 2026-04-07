"use client";

import {
    ClockIcon,
    ArrowLeft,
    Share2,
    Twitter,
    Linkedin,
    Facebook,
    ArrowRight,
    Search,
    LayoutDashboard
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import parse, { domToReact, HTMLReactParserOptions, Element } from "html-react-parser";
import type { Post } from "../types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React, { useMemo, useState, useEffect } from "react";
import { getLiveFeedCounts } from "@/lib/api/jobs";
import { getProvinces } from "@/lib/api/locations";
import { useSession } from "@/hooks/use-session";

export default function PostContent({ post }: { post: Post | null }) {
    const { user } = useSession();
    const [stats, setStats] = useState({ jobs: "10,000+", provinces: "All 13" });

    useEffect(() => {
        async function fetchStats() {
            try {
                const [counts, provinces] = await Promise.all([
                    getLiveFeedCounts(),
                    getProvinces()
                ]);
                setStats({
                    jobs: (counts.totalLmias || 10000).toLocaleString() + "+",
                    provinces: provinces.length > 0 ? provinces.length.toString() : "All 13"
                });
            } catch (error) {
                console.error("Error fetching sidebar stats:", error);
            }
        }
        fetchStats();
    }, []);

    if (!post) {
        notFound();
    }

    const img = post.featuredImage?.node;
    const readingTime = Math.ceil((post.content || "").split(" ").length / 200);

    // Extract headings for Table of Contents
    const toc = useMemo(() => {
        const headings: { id: string; text: string }[] = [];
        const content = post.content || "";
        const h2Regex = /<h2[^>]*>(.*?)<\/h2>/g;
        let match;
        let index = 0;

        while ((match = h2Regex.exec(content)) !== null) {
            const text = match[1].replace(/<[^>]*>?/gm, ''); // strip any nested tags
            const id = `heading-${index++}`;
            headings.push({ id, text });
        }
        return headings;
    }, [post.content]);

    // Options for html-react-parser to add IDs to h2 tags
    const options: HTMLReactParserOptions = {
        replace: (domNode) => {
            if (domNode instanceof Element && domNode.name === 'h2') {
                const text = (domNode.children[0] as any)?.data || "";
                const id = toc.find(t => t.text === text)?.id;
                if (id) {
                    return (
                        <h2 id={id} className="text-3xl md:text-4xl font-black text-brand-900 mt-16 mb-8 tracking-tight scroll-mt-24">
                            {domToReact(domNode.children as any, options)}
                        </h2>
                    );
                }
            }
        }
    };

    return (
        <article className="max-w-screen-xl mx-auto px-6 pb-24">
            {/* Back to Feed Link (Desktop) */}
            <div className="hidden lg:block mb-8">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-slate-400 hover:text-brand-900 transition-colors group text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Feed
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
                {/* Main Content Column */}
                <div className="lg:w-2/3">
                    <header className="mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-5"
                        >
                            <div className="inline-flex items-center gap-3 bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {post.categories?.nodes[0]?.name || "Article"}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-900 leading-[1.1] tracking-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                                        JM
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-brand-900 font-black">JobMaze</span>
                                        <span className="text-xs">{post.date ? format(new Date(post.date), "MMM dd, yyyy") : "Recent"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-xl">
                                    <ClockIcon className="w-3.5 h-3.5" />
                                    <span>{readingTime} min read</span>
                                </div>
                            </div>
                        </motion.div>
                    </header>

                    {/* Featured Image Section */}
                    {img?.sourceUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative aspect-[16/9] mb-12 group"
                        >
                            <div className="absolute inset-0 bg-brand-900/10 rounded-[2rem] -rotate-1 group-hover:rotate-0 transition-transform duration-700" />
                            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 ring-1 ring-slate-100/50">
                                <img
                                    src={img.sourceUrl}
                                    alt={img.altText || post.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </motion.div>
                    )}

                    {/* Article Body */}
                    <div className="relative">
                        {/* Decorative side accent */}
                        <div className="absolute top-0 -left-12 bottom-0 w-px bg-gradient-to-b from-brand-500/50 via-slate-100 to-transparent hidden xl:block" />

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="prose prose-slate prose-lg max-w-none 
                                prose-headings:text-brand-900 prose-headings:font-black prose-headings:tracking-tight
                                prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6
                                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-5
                                prose-p:text-slate-600 prose-p:leading-[1.7] prose-p:mb-6
                                prose-strong:text-brand-900 prose-strong:font-black
                                prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-brand-50/50 
                                prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-xl
                                prose-blockquote:text-brand-900 prose-blockquote:font-medium prose-blockquote:not-italic
                                prose-img:rounded-[1.5rem] prose-img:shadow-2xl prose-img:my-10
                                prose-a:text-brand-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                                prose-li:text-slate-600 prose-li:mb-1
                                prose-ul:list-disc prose-ul:marker:text-brand-500
                            "
                        >
                            {parse(post.content || "", options)}
                        </motion.div>
                    </div>

                    {/* Footer Share Section */}
                    <footer className="mt-20 pt-10 border-t border-slate-100">
                        <div className="bg-slate-50 rounded-[2rem] p-10 md:p-12 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="max-w-sm">
                                <h3 className="text-xl font-black text-brand-900 mb-3">Did you find this helpful?</h3>
                                <p className="text-slate-500 text-sm font-medium">Spread the knowledge with your colleagues and partners.</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 rounded-xl border-slate-200 hover:border-brand-500 hover:text-brand-900 hover:bg-brand-50 font-bold gap-3 text-sm"
                                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, "_blank")}
                                >
                                    <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                                    Twitter
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 rounded-xl border-slate-200 hover:border-brand-500 hover:text-brand-900 hover:bg-brand-50 font-bold gap-3 text-sm"
                                    onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`, "_blank")}
                                >
                                    <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                                    LinkedIn
                                </Button>
                            </div>
                        </div>
                    </footer>
                </div>

                {/* Right Sidebar (Desktop only) */}
                <aside className="hidden lg:block lg:w-1/3">
                    <div className="sticky top-40 space-y-8">
                        {/* IN THIS ARTICLE (TOC) - Compact Style */}
                        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-8 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#576483] mb-8 leading-none">In This Article</h4>
                            <ul className="space-y-6">
                                {toc.length > 0 ? toc.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                                            className="text-[14px] font-medium text-[#576483] hover:text-brand-600 transition-colors text-left leading-tight"
                                        >
                                            {item.text}
                                        </button>
                                    </li>
                                )) : (
                                    <li className="text-[14px] font-medium text-slate-400 font-italic">Analyzing Article...</li>
                                )}
                            </ul>
                        </div>

                        {/* State-Aware Sidebar CTA - Logged in vs Logged out */}
                        {user ? (
                            /* Logged-In Version (Compact & Professional) */
                            <div className="bg-[#0B1221] rounded-[1.5rem] p-8 relative overflow-hidden group">
                                <Search className="absolute -top-4 -right-4 w-24 h-24 text-white/5 group-hover:text-white/[0.08] transition-colors" />
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-white mb-2 leading-tight">Find Your Next <br />Opportunity</h3>
                                    <p className="text-slate-400 text-xs mb-8 leading-relaxed max-w-[200px]">
                                        Discover 10,000+ listings tailored to your profile.
                                    </p>
                                    <Link href="/search">
                                        <Button className="w-full h-12 bg-brand-500 hover:bg-brand-400 text-[#0B1221] font-black rounded-xl text-sm transition-all gap-2">
                                            <Search className="w-4 h-4" />
                                            Go to Search
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* Logged-Out Version (Original High-Conversion Style) */
                            <div className="bg-[#0B1221] rounded-[1.5rem] p-8 relative overflow-hidden text-center group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-white mb-2 leading-tight">Search LMIA Jobs</h3>
                                    <p className="text-slate-400 text-[11px] mb-8 leading-relaxed mx-auto max-w-[200px]">
                                        10,000+ listings. All provinces. Updated daily.
                                    </p>
                                    <Link href="/sign-up">
                                        <Button className="w-full h-12 bg-[#F9A825] hover:bg-[#F57F17] text-[#0B1221] font-black rounded-full text-sm shadow-xl shadow-amber-500/10 active:scale-95 transition-all gap-2">
                                            Start Free Trial
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* QUICK STATS Scorecard - Compact Layout */}
                        <div className="bg-white border border-slate-100 rounded-[1.5rem] p-8 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#576483] mb-8 leading-none">Quick Stats</h4>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between group">
                                    <span className="text-[13px] font-medium text-[#576483]">Active LMIA jobs</span>
                                    <span className="text-[13px] font-black text-[#0B1221]">{stats.jobs}</span>
                                </div>
                                <div className="h-px bg-slate-50 w-full" />
                                <div className="flex items-center justify-between group">
                                    <span className="text-[13px] font-medium text-[#576483]">Provinces covered</span>
                                    <span className="text-[13px] font-black text-[#0B1221]">{stats.provinces}</span>
                                </div>
                                <div className="h-px bg-slate-50 w-full" />
                                <div className="flex items-center justify-between group">
                                    <span className="text-[13px] font-medium text-[#576483]">Updated</span>
                                    <span className="text-[13px] font-black text-[#10B981]">Daily</span>
                                </div>
                                <div className="h-px bg-slate-50 w-full" />
                                <div className="flex items-center justify-between group text-brand-600">
                                    <span className="text-[13px] font-medium">Free trial</span>
                                    <span className="text-[13px] font-black">No card needed</span>
                                </div>
                            </div>
                        </div>

                        {/* Minimal Footer Socials */}
                        <div className="flex items-center justify-center gap-5 pt-2">
                            {[Twitter, Linkedin, Facebook, Share2].map((Icon, i) => (
                                <button
                                    key={i}
                                    className="text-slate-300 hover:text-brand-900 transition-colors"
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </article>
    );
}
