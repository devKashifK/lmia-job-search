import { Suspense } from 'react';
import { getAllNocSummaries } from '@/lib/noc-service';
import { NocSearch } from '@/components/resources/noc-search';
import { NocIndexClient } from '@/components/resources/noc-index-client';
import { Metadata } from 'next';
import { Search, Briefcase, GraduationCap } from 'lucide-react';
import BackgroundWrapper from '@/components/ui/background-wrapper';

export const metadata: Metadata = {
    title: 'Canada NOC Codes Database – Job Classification',
    description: 'Browse the complete Canadian NOC code database to understand occupations, TEER levels, and job classifications.',
    keywords: ['noc codes canada', 'canada occupation list'],
};

export default async function NocIndexPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || '';
    const allNocs = await getAllNocSummaries();

    return (
        <BackgroundWrapper>
            <div className="relative overflow-hidden">
                {/* Hero Section */}
                <div className="relative pt-16 pb-20 sm:pt-24 sm:pb-32">
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <div className="mx-auto max-w-3xl">
                            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-brand-50 border border-brand-100">
                                <span className="text-sm font-semibold text-brand-700 tracking-wide uppercase">
                                    Official NOC 2021 Guide
                                </span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
                                Find Your <span className="text-brand-600">NOC Code</span>
                            </h1>
                            <p className="mt-4 text-xl text-gray-600 mb-10 leading-relaxed">
                                The National Occupational Classification (NOC) is Canada&apos;s system for describing occupations.
                                Find your code to determine eligibility for immigration programs like Express Entry.
                            </p>

                            <div className="max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-brand-900/5 ring-1 ring-gray-200/50">
                                <Suspense fallback={<div className="h-12 bg-gray-100 rounded-xl animate-pulse" />}>
                                    <NocSearch />
                                </Suspense>
                            </div>

                            <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Search className="w-4 h-4 text-brand-500" />
                                    <span>Search by Job Title</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4 text-brand-500" />
                                    <span>Find Duties</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-brand-500" />
                                    <span>Check TEER Level</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Logic (Client Side) */}
                <NocIndexClient allNocs={allNocs} initialQuery={query} />
            </div>
        </BackgroundWrapper>
    );
}
