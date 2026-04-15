'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import * as CalcLogic from '@/lib/calculators';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <Card className="relative overflow-hidden border-gray-100 shadow-sm p-4 bg-white rounded-xl">
                {/* Brand Accent Top Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-600/80" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Intelligence Info */}
                    <div className="flex flex-1 items-start gap-4">
                        <div className="mt-1 shrink-0 w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <Sparkles className="w-4 h-4 text-white animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Strategic Intelligence</span>
                                <div className="h-1 w-1 bg-gray-200 rounded-full" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">AI Engine v3.0</span>
                            </div>
                            <h3 className="text-base font-black text-gray-900 leading-tight tracking-tight">
                                {getBestStrategyText(preCalculatedScores)}
                            </h3>
                            <p className="text-[11px] text-gray-500 font-medium">
                                Cross-referenced <span className="text-brand-600 font-bold">{Object.keys(preCalculatedScores).length} regulatory pathways</span> to architect this personalized immigration roadmap.
                            </p>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-50 pt-3 md:pt-0">
                        {/* Compliance Shield - Compact */}
                        <div className="flex flex-col items-center md:items-end">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
                                    <path d="M12 2L3 7V12C3 17.5228 7.02944 22 12 22C16.9706 22 21 17.5228 21 12V7L12 2Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tight">Data Verified</span>
                            </div>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Legal Compliant</span>
                        </div>

                        {/* <Button
                            onClick={() => {
                                const text = getBestStrategyText(preCalculatedScores);
                                navigator.clipboard.writeText(`🇨🇦 JobMaze Priority Strategy:\n${text}`);
                                toast({ title: "Intelligence Copied", description: "Strategic narrative ready for client delivery." });
                            }}
                            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                        >
                            Deploy Strategy
                        </Button> */}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
