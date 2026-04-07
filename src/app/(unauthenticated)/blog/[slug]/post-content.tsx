"use client";

import { CalendarIcon, ClockIcon, ArrowLeft, Share2, Twitter, Linkedin, Facebook } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import parse from "html-react-parser";
import type { Post } from "../types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PostContent({ post }: { post: Post | null }) {
    if (!post) {
        notFound();
    }

    const img = post.featuredImage?.node;
    const readingTime = Math.ceil((post.content || "").split(" ").length / 200);

    return (
        <article className="max-w-screen-xl mx-auto px-6 pb-24">
            {/* Back to Feed Link (Desktop) */}
            <div className="hidden lg:block mb-12">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-slate-400 hover:text-brand-900 transition-colors group text-xs font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeft className="w-4 h-4 mr-3 transition-transform group-hover:-translate-x-1" />
                    Back to Feed
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-16">
                {/* Main Content Column */}
                <div className="lg:w-2/3">
                    <header className="mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center gap-3 bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {post.categories?.nodes[0]?.name || "Article"}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-brand-900 leading-[1.1] tracking-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                                        JM
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-brand-900 font-black">JobMaze</span>
                                        <span className="text-xs">{post.date ? format(new Date(post.date), "MMM dd, yyyy") : "Recent"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-slate-50 px-4 py-2 rounded-2xl">
                                    <ClockIcon className="w-4 h-4" />
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
                            className="relative aspect-[16/9] mb-16 group"
                        >
                            <div className="absolute inset-0 bg-brand-900/10 rounded-[2.5rem] -rotate-1 group-hover:rotate-0 transition-transform duration-700" />
                            <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 ring-1 ring-slate-100">
                                <img
                                    src={img.sourceUrl}
                                    alt={img.altText || post.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            {img.altText && (
                                <p className="mt-4 text-center text-xs text-slate-400 font-medium tracking-wide">
                                    &mdash; {img.altText}
                                </p>
                            )}
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
                                prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8
                                prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6
                                prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:mb-8
                                prose-strong:text-brand-900 prose-strong:font-black
                                prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-brand-50/50 
                                prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-xl
                                prose-blockquote:text-brand-900 prose-blockquote:font-medium prose-blockquote:not-italic
                                prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-16
                                prose-a:text-brand-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                                prose-li:text-slate-600 prose-li:mb-2
                                prose-ul:list-disc prose-ul:marker:text-brand-500
                            "
                        >
                            {parse(post.content || "")}
                        </motion.div>
                    </div>

                    {/* Footer Share Section */}
                    <footer className="mt-24 pt-12 border-t border-slate-100">
                        <div className="bg-slate-50 rounded-[2.5rem] p-10 md:p-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="max-w-sm">
                                <h3 className="text-2xl font-black text-brand-900 mb-4">Did you find this helpful?</h3>
                                <p className="text-slate-500 font-medium">Spread the knowledge with your colleagues and partners.</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button
                                    variant="outline"
                                    className="h-14 px-8 rounded-2xl border-slate-200 hover:border-brand-500 hover:text-brand-900 hover:bg-brand-50 font-bold gap-3"
                                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, "_blank")}
                                >
                                    <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                                    Twitter
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-14 px-8 rounded-2xl border-slate-200 hover:border-brand-500 hover:text-brand-900 hover:bg-brand-50 font-bold gap-3"
                                    onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`, "_blank")}
                                >
                                    <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                                    LinkedIn
                                </Button>
                            </div>
                        </div>
                    </footer>
                </div>

                {/* Right Sidebar (Desktop only) */}
                <aside className="hidden lg:block lg:w-1/3">
                    <div className="sticky top-40 space-y-12">
                        {/* Newsletter Mini Card */}
                        <div className="bg-brand-900 p-8 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10">
                                <h4 className="text-xl font-black text-white mb-4 leading-tight">Weekly LMIA <br />Updates</h4>
                                <p className="text-blue-100/50 text-sm mb-6 leading-relaxed">Join 5,000+ professionals and stay ahead of the curve.</p>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4 transition-all"
                                />
                                <Button className="w-full h-12 bg-brand-500 hover:bg-brand-400 text-brand-900 font-black rounded-xl">
                                    Get Updates
                                </Button>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-6 px-4">
                            <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Share This Article</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")}
                                    className="flex items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 hover:text-brand-900"
                                >
                                    <Facebook className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigator.share?.({ url: window.location.href })}
                                    className="flex items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 hover:text-brand-900"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </article>
    );
}
