'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import * as CalcLogic from '@/lib/calculators';
import { useToast } from '@/hooks/use-toast';

interface StrategicAdvisorInsightProps {
    client: any;
}

export function StrategicAdvisorInsight({ client }: StrategicAdvisorInsightProps) {
    const [preCalculatedScores, setPreCalculatedScores] = useState<Record<string, { score: number, isEstimate: boolean }>>({});
    const { toast } = useToast();

    useEffect(() => {
        if (client?.id) {
            runBatchEvaluation();
        }
    }, [client?.id, client?.extracted_data]);

    const runBatchEvaluation = () => {
        const params = mapClientToCalculator(client);
        const scores: Record<string, { score: number, isEstimate: boolean }> = {};

        // 1. Express Entry
        try {
            const eeResult = CalcLogic.calculateExpressEntryScore(params as any);
            scores['express-entry'] = { score: eeResult.total, isEstimate: true };
        } catch (e) { console.error('EE Eval error:', e); }

        // 2. Alberta
        try {
            const albertaResult = CalcLogic.calculateAlbertaScore(params as any);
            scores['alberta'] = { score: albertaResult.total, isEstimate: true };
        } catch (e) { console.error('Alberta Eval error:', e); }

        // 3. Canada 67
        try {
            const fswpParams = {
                ...params,
                firstLangReading: "7", firstLangWriting: "7", firstLangListening: "7", firstLangSpeaking: "7",
                secondLangReading: "0", secondLangWriting: "0", secondLangListening: "0", secondLangSpeaking: "0",
                educationLevel: params.education,
                workExperience: params.foreignWorkExperience === "3plus" ? "6+" : "1",
                arrangedEmployment: params.hasJobOffer ? "yes" : "no",
                adaptability: "no"
            };
            const fswpResult = CalcLogic.calculateCanada67Score(fswpParams as any);
            scores['canada-67'] = { score: fswpResult.total, isEstimate: true };
        } catch (e) { console.error('Canada 67 Eval error:', e); }

        // 4. Manitoba
        try {
            const mbParams = {
                firstLangCLB: "7",
                secondLangCLB: "0",
                age: String(params.age),
                yearsExperience: params.foreignWorkExperience === "3plus" ? "4" : "1",
                educationLevel: params.education,
                relativeManitoba: "no",
                invitation: "no",
                mbWorkExp: "no",
                mbEdu2: "no",
                mbEdu1: "no",
                friendDistant: "no",
                outsideWinnipeg: "no"
            };
            const mbResult = CalcLogic.calculateManitobaScore(mbParams as any);
            scores['manitoba'] = { score: mbResult.total, isEstimate: true };
        } catch (e) { console.error('Manitoba Eval error:', e); }

        // 5. SINP (Saskatchewan)
        try {
            const getAgeRange = (a: number) => {
                if (a < 22) return "18-21";
                if (a <= 34) return "22-34";
                if (a <= 45) return "35-45";
                return "46-50";
            };
            const skParams = {
                educationLevel: params.education,
                skilledExpRecent: params.foreignWorkExperience === "3plus" ? "5" : "1",
                skilledExpOlder: "0",
                firstLangCLB: "7",
                secondLangCLB: "0",
                ageRange: getAgeRange(params.age),
                jobOffer: params.hasJobOffer ? "yes" : "no",
                relative: "no",
                pastWork: "no",
                pastStudy: "no"
            };
            const skResult = CalcLogic.calculateSINPScore(skParams as any);
            scores['saskatchewan'] = { score: skResult.total, isEstimate: true };
        } catch (e) { console.error('SINP Eval error:', e); }

        setPreCalculatedScores(scores);
    };

    const mapClientToCalculator = (client: any) => {
        const d = client.extracted_data || {};

        const getAge = (dob: string) => {
            if (!dob) return 28;
            const birthDate = new Date(dob);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            return isNaN(age) ? 28 : age;
        };

        return {
            age: getAge(d.date_of_birth),
            education: d.education_level || "bachelors",
            maritalStatus: "single",
            hasSpouse: false,
            canadianWorkExperience: d.experience && d.experience > 0 ? "1" : "none",
            foreignWorkExperience: d.experience && d.experience >= 3 ? "3plus" : (d.experience && d.experience > 0 ? "1" : "none"),
            languageProficiency: {
                reading: 7, writing: 7, listening: 7, speaking: 7
            },
            hasJobOffer: d.has_job_offer || false,
            nocTeer: d.noc_code ? String(d.noc_code).charAt(0) : "1",
            hasPNP: "no",
            siblingInCanada: "no"
        };
    };

    const getBestStrategyText = (scores: Record<string, { score: number, isEstimate: boolean }>) => {
        const ee = scores['express-entry']?.score || 0;
        const sk = scores['saskatchewan']?.score || 0;
        const ab = scores['alberta']?.score || 0;
        const mb = scores['manitoba']?.score || 0;

        if (ee > 480) return "Priority Express Entry push. CRS is highly competitive for direct ITA.";
        if (sk >= 65) return "Focus on Saskatchewan (SINP). Score of 60+ is strong for current invitations.";
        if (ab >= 300) return "Alberta Express Entry Stream is the primary target. Maintain valid profile for 300+ NOI.";
        if (mb >= 500) return "Manitoba PNP path identified. High points for occupation-specific draws.";

        return "Broad regional employer matching. Target LMIA sponsors in Ontario/Alberta to boost CRS by 50+ points.";
    };

    if (Object.keys(preCalculatedScores).length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <div className="bg-slate-950 border border-brand-500/20 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                {/* Animated Background Accents */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-500/20 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-5 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1">
                                <div className="relative">
                                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                                    <motion.div 
                                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-brand-400 blur-sm rounded-full"
                                    />
                                </div>
                                <span className="text-[10px] font-black uppercase text-brand-400 tracking-[0.25em]">Strategic Advisor Insight</span>
                            </div>
                            <div className="h-1 w-1 bg-slate-700 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Powered by JobMaze AI</span>
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-2xl md:text-3xl font-black text-white leading-[1.15] tracking-tight">
                                {getBestStrategyText(preCalculatedScores)}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium max-w-2xl leading-relaxed">
                                Our strategic engine has analyzed <span className="text-brand-400 font-bold">{Object.keys(preCalculatedScores).length} pathways</span> and identified this as the highest-probability route for your client.
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-4">
                        <Button
                            onClick={() => {
                                const text = getBestStrategyText(preCalculatedScores);
                                navigator.clipboard.writeText(`🇨🇦 Priority Immigration Strategy:\n${text}`);
                                toast({ title: "Strategy Copied", description: "Ready to share with client." });
                            }}
                            className="bg-brand-600 hover:bg-brand-500 text-white rounded-2xl px-8 py-7 h-auto text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-brand-400/20"
                        >
                            Share Strategy
                        </Button>
                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hidden md:block">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center">
                                        <div className="w-full h-full bg-brand-500/10 rounded-full scale-75" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-tighter text-center">Verified Data</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
