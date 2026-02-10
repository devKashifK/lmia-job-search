import { Suspense } from 'react';
import { getAllNocSummaries } from '@/lib/noc-service';
import { NocSearch } from '@/components/resources/noc-search';
import { NocCard } from '@/components/resources/noc-card';
import { Metadata } from 'next';
import { BookOpen, Search, Briefcase, GraduationCap } from 'lucide-react';
import BackgroundWrapper from '@/components/ui/background-wrapper';

export const metadata: Metadata = {
    title: 'NOC Codes Guide | LMIA Job Matches',
    description: 'Complete guide to National Occupational Classification (NOC) codes for Canadian immigration and job search.',
};

export default async function NocIndexPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const query = params.q?.toLowerCase() || '';
    const allNocs = await getAllNocSummaries();

    const filteredNocs = allNocs.filter((noc) =>
        noc.code.includes(query) || noc.title.toLowerCase().includes(query)
    );

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
                                The National Occupational Classification (NOC) is Canada's system for describing occupations.
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

                {/* Content Grid */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
                    <div className="border-b border-gray-200 pb-5 mb-8 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">
                            Browsing {filteredNocs.length} Occupations
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            NOC 2021 Version
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {(filteredNocs.length > 0 ? (
                            filteredNocs.map((noc) => (
                                <div key={noc.code} className="h-full transform transition-all duration-200 hover:-translate-y-1">
                                    <NocCard noc={noc} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No occupations found</h3>
                                <p className="text-gray-500 mt-1">
                                    We couldn&apos;t find any matches for &quot;{query}&quot;. Try generic terms like &quot;Manager&quot; or &quot;Engineer&quot;.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
}
