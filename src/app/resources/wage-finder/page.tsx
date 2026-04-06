import { Metadata } from 'next';
import { fetchNocSummaries } from './actions';
import WageFinderClient from './components/finder-client';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import { Briefcase, DollarSign, TrendingUp, Search } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Wage Finder & Salary Trends | Canada JobMaze',
    description: 'Explore median, high, and low wages for all 511+ NOC occupations in Canada. Find the best provinces for your career with our real-time salary visualization tool.',
    keywords: ['canada wages', 'NOC salary', 'job salaries canada', 'wage finder', 'LMIA salary requirements'],
};

export default async function WageFinderPage() {
    const summaries = await fetchNocSummaries();

    return (
        <BackgroundWrapper className="min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
                <div className="relative">
                    {/* Background Accents */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

                    <WageFinderClient initialSummaries={summaries} />
                </div>

                {/* Info Section */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-emerald-100 pt-20">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                            <Database className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-950">Authoritative Data</h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">
                            Our records are synchronized with 2024 Canadian Labour Market Information (LMI) reports and official NOC 2021 classifications.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                            <TrendingUp className="w-6 h-6 text-amber-600" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-950">Market Comparison</h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">
                            Compare wages across all Canadian provinces to identify the most lucrative markets for your specific skill set and experience level.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                            <Search className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-950">Unified Search</h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">
                            Search by any official NOC code (e.g., 21232) or standard job titles to instantly retrieve the corresponding salary analytics.
                        </p>
                    </div>
                </div>
            </main>
        </BackgroundWrapper>
    );
}

function Database(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5V19A9 3 0 0 0 21 19V5" />
            <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
    )
}
