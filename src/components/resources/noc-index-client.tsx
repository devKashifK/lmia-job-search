'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { NocSummary } from '@/lib/noc-service';
import { NocCard } from './noc-card';
import { ResumeUpload } from '@/components/profile/resume-upload';
import { 
    BookOpen, 
    FileText, 
    Sparkles, 
    ArrowRight, 
    CheckCircle2,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface NocIndexClientProps {
    allNocs: NocSummary[];
}

export function NocIndexClient({ allNocs }: NocIndexClientProps) {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const { session } = useSession();
    const { preferences } = useUserPreferences();
    
    // Sort and filter NOCs
    const filteredAndSortedNocs = useMemo(() => {
        const query = initialQuery.toLowerCase();
        
        // 1. Filter by query
        const filtered = allNocs.filter((noc) =>
            noc.code.includes(query) || noc.title.toLowerCase().includes(query)
        );
        
        // 2. Sort by preference
        const preferredCodes = preferences?.preferred_noc_codes || [];
        
        return [...filtered].sort((a, b) => {
            const aIsPreferred = preferredCodes.includes(a.code);
            const bIsPreferred = preferredCodes.includes(b.code);
            
            if (aIsPreferred && !bIsPreferred) return -1;
            if (!aIsPreferred && bIsPreferred) return 1;
            return 0;
        });
    }, [allNocs, initialQuery, preferences]);

    const preferredCodes = preferences?.preferred_noc_codes || [];
    const hasResume = !!session?.user?.user_metadata?.resume_url;

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
            
            {/* Personalization Banner */}
            <AnimatePresence mode="wait">
                {!session ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12"
                    >
                        <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-brand-50/50 p-8 shadow-sm text-center md:text-left">
                            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                                <Sparkles className="w-64 h-64 text-brand-600" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" />
                                        Personalized Recommendations
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        Sign in to find your <span className="text-brand-600">perfect NOC code</span>
                                    </h2>
                                    <p className="text-gray-600 text-lg">
                                        Upload your resume after signing in to automatically identify and highlight the best NOC matches for your immigration journey.
                                    </p>
                                </div>
                                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                                    <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-brand-500/20">
                                        <Link href="/auth/signin">Sign In & Upload</Link>
                                    </Button>
                                    <Button asChild variant="ghost" className="rounded-xl px-8 h-12 font-medium text-gray-600 hover:text-brand-700 hover:bg-white">
                                        <Link href="/auth/signup">Create Account</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : session && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        {!hasResume ? (
                            <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-white p-8 shadow-sm">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                    <Sparkles className="w-64 h-64 text-brand-600" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
                                            <Sparkles className="w-3 h-3" />
                                            Personalize Your Guide
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                            Find your perfect <span className="text-brand-600">NOC match</span>.
                                        </h2>
                                        <p className="text-gray-600 max-w-lg">
                                            Upload your resume and we&apos;ll automatically identify the best NOC codes for your experience, helping you find relevant LMIA jobs faster.
                                        </p>
                                        <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
                                            <Button asChild variant="outline" className="rounded-xl border-gray-200">
                                                <Link href="/dashboard/profile">Go to Profile</Link>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-80 shrink-0 bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
                                        <ResumeUpload 
                                            onUploadComplete={() => window.location.reload()}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : preferredCodes.length > 0 ? (
                            <div className="bg-brand-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-brand-900/10">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <CheckCircle2 className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Personalized Guide Ready</h3>
                                            <p className="text-brand-100 text-sm">We&apos;ve highlighted {preferredCodes.length} NOC codes based on your profile.</p>
                                        </div>
                                    </div>
                                    <Button asChild className="bg-white text-brand-700 hover:bg-brand-50 rounded-xl px-6 h-11 font-bold">
                                        <Link href="/dashboard/profile">Update Preferences</Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-900 rounded-3xl p-6 md:p-8 text-white shadow-xl">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                            <Info className="w-7 h-7 text-brand-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Select Your Preferences</h3>
                                            <p className="text-gray-400 text-sm">Your resume is uploaded. Now select your preferred NOC codes on your profile.</p>
                                        </div>
                                    </div>
                                    <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white border-none rounded-xl px-6 h-11 font-bold">
                                        <Link href="/dashboard/profile">Select NOC Codes</Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List Header */}
            <div className="border-b border-gray-200 pb-5 mb-8 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                    {initialQuery ? `Search Results: ${filteredAndSortedNocs.length}` : `Browsing All ${allNocs.length} Occupations`}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    NOC 2021 Version
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedNocs.length > 0 ? (
                    filteredAndSortedNocs.map((noc) => (
                        <div key={noc.code} className="h-full transform transition-all duration-200 hover:-translate-y-1">
                            <NocCard 
                                noc={noc} 
                                isPreferred={preferredCodes.includes(noc.code)} 
                            />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No occupations found</h3>
                        <p className="text-gray-500 mt-1">
                            We couldn&apos;t find any matches for &quot;{initialQuery}&quot;.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
