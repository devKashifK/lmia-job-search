'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Clock,
  ChevronRight,
  Zap,
  Layout,
  Search as SearchIcon,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Button } from '@/components/ui/button';
import { getServerClient } from "./serverClient";
import { GET_ALL_POSTS } from "./queries";
import type { Post } from "./types";
import BlogClientComponents from "@/app/(unauthenticated)/blog/blog-client-components";
import { useSearchParams } from 'next/navigation';

export default function BlogPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || "";

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const client = getServerClient();
        const postsRes = await client.query<{ posts: { nodes: Post[] } }>({
          query: GET_ALL_POSTS,
          variables: { first: 100, search },
        });

        setAllPosts(postsRes.data?.posts?.nodes || []);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [search]);

  const filteredPosts = allPosts;
  const featuredPost = allPosts[0];
  const gridPosts = allPosts.slice(1);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-900">
      <Navbar />

      <main className="flex-1">
        {/* PROGRESSIVE HERO SECTION */}
        <section className="relative pt-48 pb-24 px-6 overflow-hidden bg-brand-900">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 pointer-events-none mix-blend-overlay" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                Insider Resources
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                The <span className="text-brand-400">Knowledge</span> <br />
                <span className="relative inline-block mt-2 underline decoration-brand-500/30 underline-offset-8 decoration-4">Maze</span>
              </h1>
              <p className="text-blue-100/60 text-lg md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-12">
                Expert LMIA guides, immigration updates, and industry insights curated specifically for professionals navigating the Canadian landscape.
              </p>

              {/* INTEGRATED SEARCH (Client Component) */}
              <div className="max-w-2xl mx-auto">
                <BlogClientComponents currentSearch={search} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURED MAG SECTION */}
        <AnimatePresence mode="wait">
          {featuredPost && !search && (
            <section className="py-24 px-6 relative -mt-12">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="group relative flex flex-col lg:flex-row bg-white rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-slate-200/50 hover:shadow-[0_48px_100px_-25px_rgba(0,0,0,0.2)] transition-all duration-700"
                  >
                    {/* Left: Info */}
                    <div className="flex-1 p-10 md:p-16 flex flex-col justify-between order-2 lg:order-1 relative z-10 bg-white">
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="bg-brand-900 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                            {featuredPost.categories?.nodes[0]?.name || "Featured"}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.ceil((featuredPost.content || "").split(" ").length / 200)} min read
                          </div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-brand-900 leading-[1.1] tracking-tight mb-6 group-hover:text-brand-500 transition-colors duration-500">
                          {featuredPost.title}
                        </h2>
                        <div 
                          className="text-slate-500 text-lg leading-relaxed mb-10 font-light line-clamp-3" 
                          dangerouslySetInnerHTML={{ __html: featuredPost.excerpt || "" }} 
                        />
                      </div>
                      <div className="inline-flex items-center gap-3 text-brand-900 font-black text-lg group-hover:gap-6 transition-all duration-500 group/btn">
                        Explore Full Article
                        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center group-hover/btn:bg-brand-900 group-hover/btn:text-white transition-colors">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Right: Media */}
                    <div className="flex-1 min-h-[400px] lg:min-h-auto relative overflow-hidden order-1 lg:order-2">
                      {featuredPost.featuredImage?.node.sourceUrl ? (
                        <img 
                          src={featuredPost.featuredImage.node.sourceUrl} 
                          alt={featuredPost.featuredImage.node.altText || featuredPost.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-brand-900 flex items-center justify-center">
                          <Layout className="w-24 h-24 text-white/5" />
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent hidden lg:block" />
                    </div>
                  </Link>
                </motion.div>
              </div>
            </section>
          )}
        </AnimatePresence>

        {/* FEED GRID */}
        <section className={`py-12 px-6 ${search ? 'pt-40' : ''}`}>
          <div className="max-w-6xl mx-auto">
            {search && (
              <div className="mb-12 border-b border-slate-100 pb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Search Results</h3>
                <h4 className="text-3xl font-black text-brand-900">Showing matches for "{search}"</h4>
              </div>
            )}

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {(search ? filteredPosts : gridPosts).map((post) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                  }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <div className="aspect-[16/10] w-full bg-slate-100 rounded-[2rem] overflow-hidden relative mb-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] group-hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-500">
                      {post.featuredImage?.node.sourceUrl ? (
                        <img 
                          src={post.featuredImage.node.sourceUrl} 
                          alt={post.featuredImage.node.altText || post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <Zap className="w-12 h-12 opacity-50" />
                        </div>
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/40 transition-colors duration-500 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white text-brand-900 flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75 shadow-xl">
                          <ChevronRight className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 px-2 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-brand-500 bg-brand-50 px-3 py-1 rounded">
                          {post.categories?.nodes[0]?.name || "Uncategorized"}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ""}
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-brand-900 leading-tight group-hover:text-brand-500 transition-colors duration-300">
                        {post.title}
                      </h3>
                      <div 
                        className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-normal" 
                        dangerouslySetInnerHTML={{ __html: post.excerpt || "" }} 
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {loading && allPosts.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[16/10] bg-slate-200 rounded-[2rem] mb-6" />
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
                    <div className="h-8 bg-slate-200 rounded w-full mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {filteredPosts.length === 0 && !loading && (
              <div className="text-center py-40 px-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <SearchIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 mb-2">Mystery Unsolved</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-light leading-relaxed">
                  We couldn't find any articles matching your search criteria. Try using different keywords or exploring popular categories.
                </p>
                <Button 
                  onClick={() => window.location.href = '/blog'}
                  variant="outline" 
                  className="mt-8 rounded-full border-slate-200 text-slate-600 hover:text-brand-900 px-8"
                >
                  View All Resources
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* PREMIUM NEWSLETTER */}
        <section className="py-24 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="bg-brand-900 rounded-[3rem] p-8 md:p-20 relative overflow-hidden text-center group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-125" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-500/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <Sparkles className="w-12 h-12 text-brand-400 mx-auto mb-8 animate-bounce" />
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-none">
                  Get the Weekly <br />
                  <span className="text-brand-400">LMIA Digest</span>
                </h2>
                <p className="text-blue-100/70 text-lg md:text-xl mb-12 font-light leading-relaxed">
                  Join 5,000+ immigration professionals receiving curated job trends, draw updates, and deep-dives every Monday.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
                  <div className="relative w-full">
                    <input
                      type="email"
                      placeholder="Enter your professional email"
                      className="h-16 w-full rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-blue-200/30 focus:outline-none focus:ring-4 focus:ring-brand-500/20 px-8 transition-all duration-300"
                    />
                  </div>
                  <Button className="h-16 w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-brand-900 px-10 rounded-2xl font-black text-lg shadow-xl shadow-brand-500/30 active:scale-95 transition-all">
                    Subscribe
                  </Button>
                </div>
                <p className="mt-8 text-blue-300/40 text-xs font-bold uppercase tracking-widest">
                  Secure · Spam-Free · Unsubscribe Anytime
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


