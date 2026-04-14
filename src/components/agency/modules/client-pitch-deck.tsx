'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText,
    Download,
    Share2,
    ShieldCheck,
    Trophy,
    BadgeCheck,
    Briefcase,
    Globe,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { calculateCandidateScore } from '@/lib/utils/scoring_utils';

interface ClientPitchDeckProps {
    client: any;
}

export function ClientPitchDeck({ client }: ClientPitchDeckProps) {
    const data = client?.extracted_data || {};
    const score = calculateCandidateScore(data);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Employer Marketing Toolkit</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Anonymized profile for professional outreach.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="h-9 rounded-xl border-gray-200 text-[10px] font-bold gap-2 px-4 shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Save PDF
                    </Button>
                    {/* <Button 
                        className="h-9 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold gap-2 px-4 shadow-lg shadow-brand-500/20"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share Deck
                    </Button> */}
                </div>
            </div>

            {/* The Pitch Deck One-Pager (Printable Area) */}
            <div className="printable-area bg-white border border-gray-100 rounded-[1.5rem] shadow-xl overflow-hidden print:shadow-none print:border-none p-6 md:p-8 relative print:m-0 print:p-8 print:w-full">
                {/* Branding Watermark */}
                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-20 print:opacity-100">
                    <Globe className="w-3 h-3 text-brand-600" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-brand-900 border-l border-brand-200 pl-2">JobMaze Verified</span>
                </div>

                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-50 pb-6 print:flex-row print:items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="bg-brand-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full print:bg-brand-600 print:text-white">Candidate #{client.urn?.split('-')[1] || 'JM1024'}</span>
                                <span className="text-gray-300 text-xs">|</span>
                                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">{data.location || 'Based in Canada'}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter leading-none">
                                {data.position || 'Senior Professional'}
                            </h1>
                            <p className="text-xs text-brand-600 font-bold max-w-xl leading-relaxed">
                                Expert in {Array.isArray(data.skills) ? data.skills.slice(0, 3).join(', ') : 'strategic operations'} with {data.experience || 0}+ years of international experience.
                            </p>
                        </div>

                        <div className="shrink-0 flex flex-col items-center p-4 bg-brand-50 rounded-2xl border border-brand-100/50 print:bg-brand-50 print:border-brand-100">
                            <div className="text-2xl font-black text-brand-900 tracking-tighter leading-none">{score}%</div>
                            <div className="text-[7px] font-black text-brand-600 uppercase tracking-widest mt-1">Readiness Score</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-3">
                        {/* Summary Column */}
                        <div className="md:col-span-2 space-y-6 print:col-span-2">
                            <section className="space-y-2">
                                <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-brand-500" />
                                    Executive Summary
                                </h2>
                                <p className="text-gray-600 text-[11px] leading-relaxed font-medium italic">
                                    "{data.bio || 'Highly qualified professional with a strong track record of success in their field.'}"
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Trophy className="w-3 h-3 text-brand-500" />
                                    Competitive Edge
                                </h2>
                                <div className="grid grid-cols-2 gap-3 print:grid-cols-2">
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 print:bg-gray-50">
                                        <BadgeCheck className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-[8px] font-black text-gray-900 uppercase">Status</p>
                                            <p className="text-[10px] text-gray-500 font-bold">LMIA Ready</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 print:bg-gray-50">
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-[8px] font-black text-gray-900 uppercase">Mobility</p>
                                            <p className="text-[10px] text-gray-500 font-bold">Open Access</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Specs Column */}
                        <div className="space-y-6">
                            <section className="space-y-3">
                                <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verified Skills</h2>
                                <div className="flex flex-wrap gap-1.5">
                                    {(typeof data.skills === 'string' ? data.skills.split(',') : (Array.isArray(data.skills) ? data.skills : [])).slice(0, 8).map((skill: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-brand-50 text-brand-700 text-[9px] font-black rounded-md border border-brand-100 print:bg-brand-50 print:border-brand-100">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">NOC Compliance</h2>
                                <div className="p-4 bg-gray-900 rounded-2xl text-white space-y-2 print:bg-gray-900 print:text-white">
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Target Code</p>
                                    <div className="flex items-end justify-between">
                                        <span className="text-xl font-black tracking-tighter leading-none">{data.noc_code || 'NOC 1121'}</span>
                                        <span className="text-[8px] font-bold text-brand-400 uppercase">Verified</span>
                                    </div>
                                    <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-brand-500" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer / Protection */}
                    <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 print:flex-row print:justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                            <ShieldCheck className="w-4 h-4" />
                            <p className="text-[8px] font-bold uppercase tracking-widest leading-none">Restricted Commercial Client Profile</p>
                        </div>
                        <p className="text-[9px] font-black text-brand-900 uppercase tracking-tighter opacity-10">ID: {client.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* Print Styling */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible !important;
                    }
                    .printable-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 40px !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    /* Ensure background colors print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
