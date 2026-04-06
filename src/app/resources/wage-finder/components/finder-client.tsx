'use client';

import * as React from 'react';
import { useState } from 'react';
import { NocSummary, NocProfile } from '@/lib/noc-service';
import { WageSearch } from './wage-search';
import { WageChart } from './wage-chart';
import { fetchNocDetails } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowRight, LayoutDashboard, Database, BarChart3, TrendingUp, DollarSign, MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface WageFinderClientProps {
    initialSummaries: NocSummary[];
}

export default function WageFinderClient({ initialSummaries }: WageFinderClientProps) {
    const [selectedNoc, setSelectedNoc] = useState<NocProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAnnual, setIsAnnual] = useState(false);

    const handleSelect = async (code: string) => {
        setLoading(true);
        try {
            const details = await fetchNocDetails(code);
            setSelectedNoc(details);
        } catch (error) {
            console.error("Failed to fetch NOC details:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate top region and wage stats
    const topRegionData = React.useMemo(() => {
        if (!selectedNoc?.salaryProspects) return null;
        const validProspects = selectedNoc.salaryProspects.filter(p => p.region !== 'Canada');
        if (validProspects.length === 0) return null;
        return [...validProspects].sort((a, b) => parseFloat(b.median) - parseFloat(a.median))[0];
    }, [selectedNoc]);

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest">NOC Real-time Salary Analytics</h2>
                <h1 className="text-4xl md:text-5xl font-black text-emerald-950 tracking-tight">Wage Finder</h1>
                <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg">
                    Instantly research inter-provincial wage distributions for any Canadian profession. High-fidelity data for 511+ NOC classifications.
                </p>
                <div className="pt-6">
                    <WageSearch summaries={initialSummaries} onSelect={handleSelect} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Skeleton className="h-32 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
                        </div>
                    </motion.div>
                ) : selectedNoc ? (
                    <motion.div
                        key={selectedNoc.code}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        {/* Summary Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-xl shadow-emerald-900/5">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Analyzing Classification</h3>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase tracking-tighter text-[9px] px-2">Market Certified</Badge>
                                </div>
                                <h2 className="text-3xl font-black text-emerald-950 mb-4 tracking-tight">{selectedNoc.title}</h2>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-emerald-950 text-emerald-100 rounded-lg text-xs font-bold tracking-tight">NOC {selectedNoc.code}</span>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold ring-1 ring-emerald-100 italic">{selectedNoc.classification?.teer || 'N/A'}</span>
                                    {selectedNoc.commonJobTitles?.slice(0, 3).map((title, i) => (
                                        <span key={i} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold border border-gray-100 uppercase tracking-wider">{title}</span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <Link href={`/resources/noc-codes/${selectedNoc.code}`}>
                                    <Button className="bg-white border-2 border-emerald-100 text-emerald-900 hover:bg-emerald-50 font-bold rounded-2xl px-6 h-11 group transition-all active:scale-95">
                                        View Full Profile <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Top Performance Analytics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-emerald-950 border-none rounded-[2rem] shadow-xl overflow-hidden relative group">
                                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-24 h-24 text-white" />
                                </div>
                                <CardContent className="pt-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-emerald-800 rounded-lg"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
                                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Growth Outlook</span>
                                    </div>
                                    <div className="text-2xl font-black text-white mb-1">
                                        {selectedNoc.jobOutlook?.[0]?.toLowerCase().includes('good') ? 'High Growth' : 'Stable'}
                                    </div>
                                    <p className="text-xs text-emerald-300/70 font-medium line-clamp-1">{selectedNoc.jobOutlook?.[0]}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-none rounded-[2rem] shadow-xl ring-1 ring-emerald-100/50 overflow-hidden relative group">
                                <CardContent className="pt-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-amber-50 rounded-lg"><MapPin className="w-4 h-4 text-amber-600" /></div>
                                        <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Top Paying Region</span>
                                    </div>
                                    <div className="text-2xl font-black text-gray-900 mb-1">
                                        {topRegionData?.region || 'National'}
                                    </div>
                                    <p className="text-xs text-amber-600 font-bold">
                                        Avg. ${parseFloat(topRegionData?.median || '0').toLocaleString()}/hr
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-emerald-50/50 border-emerald-100 rounded-[2rem] shadow-sm overflow-hidden border">
                                <CardContent className="pt-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-emerald-100 rounded-lg"><DollarSign className="w-4 h-4 text-emerald-700" /></div>
                                        <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Market Comparison</span>
                                    </div>
                                    <div className="text-2xl font-black text-emerald-950 mb-1">
                                        Above Average
                                    </div>
                                    <p className="text-xs text-emerald-700/70 font-medium italic">Relative to general market median</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Chart Component */}
                        <WageChart
                            data={selectedNoc.salaryProspects || []}
                            title={`${selectedNoc.title}`}
                            isAnnual={isAnnual}
                            onToggle={setIsAnnual}
                        />

                        {/* Comparison Table / Info */}
                        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-emerald-950 text-white overflow-hidden">
                            <CardHeader className="p-10 pb-4">
                                <CardTitle className="text-2xl font-black flex items-center gap-3">
                                    <LayoutDashboard className="w-6 h-6 text-emerald-400" />
                                    Strategic Market Context
                                </CardTitle>
                                <CardDescription className="text-emerald-300/80 font-medium text-base">How this classification fits into the current Canadian economy.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 pt-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">Demand Analysis</h4>
                                    <p className="text-emerald-50/80 leading-relaxed text-sm">
                                        {selectedNoc.labourMarketDemand?.[0] || "The median wage reflects the current labour market pressure for this classification. High inter-provincial variance suggests specialized demand in specific sectors."}
                                    </p>
                                    <div className="pt-4 flex items-center gap-4">
                                        <div className="p-2 bg-emerald-900 rounded-xl"><Database className="w-5 h-5 text-emerald-400" /></div>
                                        <div className="text-xs font-bold opacity-70 italic">Data derived from 2024 LMI reporting cycles.</div>
                                    </div>
                                </div>
                                <div className="bg-emerald-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">Career Engagement</h4>
                                    <p className="text-sm font-medium leading-relaxed">
                                        Ready to leverage this {isAnnual ? 'annual' : 'hourly'} earning potential in the active market?
                                    </p>
                                    <Link href={`/search/lmia/all?t=lmia&noc=${selectedNoc.code}`} className="block">
                                        <Button className="w-full bg-white hover:bg-emerald-50 text-emerald-950 font-black rounded-2xl h-14 group transition-all shadow-xl shadow-white/5">
                                            Search Job Openings <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center space-y-6"
                    >
                        <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100 shadow-inner">
                            <BarChart3 className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-emerald-900">Search for a NOC Classification to begin</h3>
                            <p className="text-gray-400 text-sm max-w-sm mx-auto">Select a profession from the search bar above to see a detailed regional wage breakdown.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
