"use client";

import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import Footer from "@/sections/homepage/footer";
import Navbar from "@/components/ui/nabvar";

interface BlogLayoutProps {
    children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-brand-500/30 selection:text-brand-900">
            <Navbar />
            
            {/* Reading Progress Bar (Fixed) */}
            <motion.div
                className="fixed top-0 left-0 right-0 z-[110] h-1.5 bg-brand-500 origin-left shadow-[0_2px_10px_rgba(15,123,94,0.3)]"
                style={{ scaleX }}
            />

            <main className="flex-1 relative">
                {/* Minimal Sticky Sub-header */}
                <div
                    className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                        isScrolled 
                        ? "translate-y-0 opacity-100 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm" 
                        : "-translate-y-4 opacity-0 pointer-events-none"
                    }`}
                >
                    <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="flex items-center text-slate-500 hover:text-brand-900 transition-colors group text-sm font-bold uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Feed
                        </Link>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigator.share?.({ url: window.location.href })}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-brand-900 transition-all"
                                title="Share article"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="pt-24 lg:pt-32">
                    {children}
                </div>
            </main>

            <Footer />
        </div>
    );
}

