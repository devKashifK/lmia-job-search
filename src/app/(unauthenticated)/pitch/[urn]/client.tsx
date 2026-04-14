'use client';

import React from 'react';
import { ClientPitchDeck } from "@/components/agency/modules/client-pitch-deck";
import { ShieldCheck, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface PitchClientProps {
    agency: any;
    client: any;
}

export default function PitchClient({ agency, client }: PitchClientProps) {
    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col items-center p-6 md:p-12">
            {/* Header / Brand Anchor */}
            <header className="w-full max-w-4xl flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <img src="/job_maze_favicon_.svg" alt="JobMaze" className="h-8 w-8 object-contain" />
                    <div>
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">JobMaze Portal</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Verified Placement Profile</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presented By</span>
                    <div className="h-4 w-[1px] bg-slate-100 mx-1" />
                    {agency.logo_url ? (
                        <div className="flex items-center gap-2">
                             <img src={agency.logo_url} alt={agency.company_name} className="h-6 w-6 object-contain" />
                             <span className="text-xs font-black text-slate-900 uppercase truncate max-w-[120px]">{agency.company_name}</span>
                        </div>
                    ) : (
                        <span className="text-xs font-black text-slate-900 uppercase">{agency.company_name}</span>
                    )}
                </div>
            </header>

            {/* Main Pitch Deck Container */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl"
            >
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none mb-1">Confidential Professional Profile</p>
                        <p className="text-[11px] text-amber-800 font-medium">This profile is anonymized for privacy. Contact the issuing agency for a full CV and direct introduction.</p>
                    </div>
                </div>

                <ClientPitchDeck client={client} />
            </motion.div>

            {/* Footer */}
            <footer className="w-full max-w-4xl mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 grayscale">
                <div className="flex items-center gap-3">
                    <img src="/job_maze_favicon_.svg" alt="JobMaze" className="h-6 w-6 object-contain" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">JobMaze Global Recruitment Network</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">© {new Date().getFullYear()} Protected Candidate Portfolio</p>
            </footer>
        </div>
    );
}
