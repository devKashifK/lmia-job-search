'use client';

import React, { useState, useEffect } from 'react';
import {
    Calculator,
    History,
    ChevronLeft,
    ArrowRight,
    Plus,
    Filter,
    BadgeCheck,
    Languages,
    Share2,
    Send,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalculatorHub, CalculatorType } from '@/components/calculators/calculator-hub';
import { CalculatorPage } from '@/components/calculators/shared/calculator-page';
import { CALCULATOR_CONFIGS } from '@/components/calculators/configs';
import { AgencyClient } from '@/lib/api/agency';
import db from '@/db';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as CalcLogic from '@/lib/calculators';
import { PoolAnalytics } from './pool-analytics';
import { useAgencyClients } from '@/hooks/use-agency-clients';
import { useSession } from '@/hooks/use-session';
import { motion, AnimatePresence } from 'framer-motion';


interface ClientCalculatorsProps {
    client: any;
}

export function ClientCalculators({ client }: ClientCalculatorsProps) {
    const [selectedCalc, setSelectedCalc] = useState<CalculatorType | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [preCalculatedScores, setPreCalculatedScores] = useState<Record<string, { score: number, isEstimate: boolean }>>({});
    const historyRef = React.useRef<HTMLElement>(null);
    const { toast } = useToast();
    const { updateClient } = useAgencyClients();
    const { session } = useSession();

    useEffect(() => {
        fetchHistory();
        runBatchEvaluation();
    }, [client.id]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await db
                .from('calculator_results')
                .select('*')
                .eq('client_id', client.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (err: any) {
            console.error('Error fetching history:', err);
        } finally {
            setIsLoading(false);
        }
    };

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
            if (!dob) return 28; // Default young competitive age
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

    const handleShareAssessment = async (calcType: string, score: number) => {
        try {
            const programName = calcType.replace('-', ' ').toUpperCase();
            const summaryText = `🇨🇦 JobMaze Eligibility Assessment\nProgram: ${programName}\nScore: ${score} Points\nStatus: Potential (Based on extracted resume data)\nNext Steps: View your detailed roadmap in the Agency Portal.`;

            // 1. Copy to clipboard
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(summaryText);
            }

            // 2. Log in interaction history
            const newEntry = {
                id: Date.now().toString(),
                employer: 'Internal Assessment',
                type: 'evaluation_sent',
                notes: `Shared ${programName} results. Score: ${score} points. Assessment summary copied to clipboard.`,
                timestamp: new Date().toISOString(),
                recruiter_id: client.agency_id
            };

            const outreachLog = Array.isArray(client.outreach_log) ? client.outreach_log : [];
            await updateClient({
                id: client.id,
                updates: { outreach_log: [newEntry, ...outreachLog] }
            });

            toast({
                title: "Evaluation Shared",
                description: "Assessment summary copied to clipboard and logged to history."
            });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Share Error', description: err.message });
        }
    };

    const handleBack = () => {
        setSelectedCalc(null);
        fetchHistory(); // Refresh history after evaluation
    };

    // If a calculator is selected, show the form
    if (selectedCalc) {
        const config = CALCULATOR_CONFIGS[selectedCalc];
        if (!config) return <div>Calculator not found</div>;

        return (
            <div className="space-y-4">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="h-8 text-xs font-bold text-gray-500 hover:text-brand-600 gap-2 mb-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Hub
                </Button>
                <CalculatorPage
                    config={config}
                    initialData={mapClientToCalculator(client)}
                    clientId={client.id}
                    userId={session?.user?.id}
                    onComplete={handleBack}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <div className="p-1.5 bg-brand-600 rounded-lg text-white">
                            <Calculator className="w-5 h-5" />
                        </div>
                        Eligibility Lab
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">Run formal assessments and compare scores against pool benchmarks.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold text-[11px] uppercase tracking-wider h-9"
                        onClick={() => {
                            if (history.length > 0) {
                                (historyRef.current as any)?.scrollIntoView({ behavior: 'smooth' });
                            } else {
                                toast({
                                    title: "No evaluations yet",
                                    description: "Create your first evaluation to view logs."
                                });
                            }
                        }}
                    >
                        <History className="w-3.5 h-3.5 mr-2" />
                        View Logs
                    </Button>
                </div>
            </div>

            <div id="eligibility-hub-title" className="space-y-6">

                {preCalculatedScores['express-entry'] && (
                    <PoolAnalytics currentScore={preCalculatedScores['express-entry'].score} />
                )}
                <CalculatorHub
                    onSelect={setSelectedCalc}
                    scores={preCalculatedScores}
                    onShare={(type, score) => handleShareAssessment(type, score)}
                />
            </div>

            <div ref={historyRef as any} className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saved Evaluations</h3>
                </div>

                {history.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {history.map((result) => (
                            <Card key={result.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                            <BadgeCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-tight">{result.calculator_type.replace('-', ' ')}</h4>
                                                <Badge className="bg-brand-50 text-brand-700 border-brand-100 text-[10px] font-black h-5 px-1.5">
                                                    {result.score} PTS
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-gray-400 font-bold">{format(new Date(result.created_at), 'MMM dd, yyyy')}</span>
                                                <span className="text-[10px] text-gray-200">|</span>
                                                <span className="text-[10px] text-gray-400 font-bold">Ref: {result.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-300 hover:text-brand-600 rounded-lg">
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 italic">
                        <History className="w-8 h-8 text-gray-200 mb-3" />
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No evaluation history</p>
                    </div>
                )}
            </div>
        </div>
    );
}
