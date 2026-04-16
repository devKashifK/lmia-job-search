'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
    Zap,
    TrendingUp,
    GraduationCap,
    Languages,
    Briefcase,
    RotateCcw,
    Sparkles,
    Loader2,
    Send,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PoolAnalytics } from './pool-analytics';
import { calculateExpressEntryScore, CRSInputs } from '@/lib/calculators/express-entry';
import { useAgencyClients } from '@/hooks/use-agency-clients';
import { useToast } from '@/hooks/use-toast';

interface ClientSimulatorProps {
    client: any;
}

export function ClientSimulator({ client }: ClientSimulatorProps) {
    const { updateClient, isUpdating } = useAgencyClients();
    const { toast } = useToast();
    const d = client?.extracted_data || {};

    // Initial State Mapper
    const getInitialState = () => {
        const maritalStatus = "single"; // Default for simulation
        return {
            age: "30",
            educationLevel: d.education_level || "bachelors",
            firstLangCLB: 7,
            canadianExperience: "0",
            foreignExperience: d.experience && d.experience >= 3 ? "3" : "1",
            maritalStatus,
            jobOffer: "no",
            hasPNP: "no",
            siblingInCanada: "no"
        };
    };

    const [sim, setSim] = useState(getInitialState());

    // Calculate simulated score
    const simulatedScore = useMemo(() => {
        const inputs: CRSInputs = {
            maritalStatus: sim.maritalStatus,
            spouseCitizen: "no",
            spouseComing: "no",
            age: sim.age,
            educationLevel: sim.educationLevel,
            hasCanadianEducation: "no",
            canadianEducationLevel: "none",
            languageTestValid: "yes",
            firstLangSpeaking: String(sim.firstLangCLB),
            firstLangListening: String(sim.firstLangCLB),
            firstLangReading: String(sim.firstLangCLB),
            firstLangWriting: String(sim.firstLangCLB),
            otherResults: "no",
            secondLangSpeaking: "0",
            secondLangListening: "0",
            secondLangReading: "0",
            secondLangWriting: "0",
            canadianExperience: sim.canadianExperience,
            foreignExperience: sim.foreignExperience,
            certificateQualification: "no",
            jobOffer: sim.jobOffer,
            jobOfferNocLevel: "1",
            hasPNP: sim.hasPNP,
            siblingInCanada: sim.siblingInCanada,
            spouseEducation: "none",
            spouseCanadianExperience: "0",
            spouseLangSpeaking: "0",
            spouseLangListening: "0",
            spouseLangReading: "0",
            spouseLangWriting: "0"
        };
        return calculateExpressEntryScore(inputs).total;
    }, [sim]);

    const handleReset = () => setSim(getInitialState());

    const handleSendSimulatedRoadmap = async () => {
        try {
            const growthSummary = `🇨🇦 Profile Growth Simulation\n\nTarget Score: ${simulatedScore} PTS\n\nKey Improvements:\n- English: CLB ${sim.firstLangCLB}\n- Education: ${sim.educationLevel.replace('Plus', '+')}\n- Canadian Experience: ${sim.canadianExperience} Year(s)\n\nThis growth profile reaches "Competitive" status for 2024 category-based draws. Next step: Update documentation to reflect these targets.`;

            // 1. Copy to clipboard
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(growthSummary);
            }

            // 2. Log in interaction history
            const newEntry = {
                id: Date.now().toString(),
                employer: 'Growth Strategy',
                type: 'proposal_sent',
                notes: `Sent simulation results to candidate. Targeted score: ${simulatedScore}. Improvements: CLB ${sim.firstLangCLB}, ${sim.educationLevel}. Profile summary copied to clipboard.`,
                timestamp: new Date().toISOString(),
                recruiter_id: client.agency_id
            };

            const currentLog = Array.isArray(client.outreach_log) ? client.outreach_log : [];
            await updateClient({
                id: client.id,
                updates: { outreach_log: [newEntry, ...currentLog] }
            });

            toast({
                title: "Roadmap Shared",
                description: "Simulation summary copied to clipboard and logged to history."
            });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Send Error', description: err.message });
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Control Panel */}
                <Card className="lg:col-span-2 border-gray-100 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/10 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                                <Zap className="w-4 h-4 text-brand-500 fill-brand-500" />
                                Growth Simulator
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="h-7 text-[10px] font-bold text-gray-400 hover:text-brand-600 px-2 rounded-xl"
                            >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reset
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                        {/* Language Slider */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Languages className="w-3.5 h-3.5" />
                                    English Proficiency (CLB)
                                </Label>
                                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-xl border border-brand-100">
                                    CLB {sim.firstLangCLB}
                                </span>
                            </div>
                            <Slider
                                value={[sim.firstLangCLB]}
                                min={4}
                                max={10}
                                step={1}
                                onValueChange={([v]) => setSim(p => ({ ...p, firstLangCLB: v }))}
                                className="py-2"
                            />
                            <div className="flex justify-between text-[8px] font-bold text-gray-300">
                                <span>BASIC</span>
                                <span>COMPETITIVE</span>
                                <span>EXPERT</span>
                            </div>
                        </div>

                        {/* Education Toggle */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <GraduationCap className="w-3.5 h-3.5" />
                                Education Level
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'bachelorsPlus', label: "Bachelor's" },
                                    { id: 'masters', label: "Master's" },
                                    { id: 'doctoral', label: "Doctoral" }
                                ].map((edu) => (
                                    <button
                                        key={edu.id}
                                        onClick={() => setSim(p => ({ ...p, educationLevel: edu.id }))}
                                        className={cn(
                                            "px-3 py-2 rounded-xl text-[10px] font-bold border transition-all text-left",
                                            sim.educationLevel === edu.id
                                                ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                                : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        {edu.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Canadian Experience */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" />
                                Canadian Work Exp.
                            </Label>
                            <div className="flex gap-2">
                                {[
                                    { id: '0', label: "None" },
                                    { id: '1', label: "1 Year" },
                                    { id: '2', label: "2+ Yrs" }
                                ].map((exp) => (
                                    <button
                                        key={exp.id}
                                        onClick={() => setSim(p => ({ ...p, canadianExperience: exp.id }))}
                                        className={cn(
                                            "flex-1 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all",
                                            sim.canadianExperience === exp.id
                                                ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                                                : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        {exp.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 bg-brand-50/50 rounded-xl p-4 border border-brand-100 border-dashed">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-brand-900 uppercase tracking-tight">Growth Insight</p>
                                    <p className="text-[10px] text-brand-700 font-medium leading-relaxed mt-1">
                                        Improving from CLB 7 to CLB 9 can trigger high-value <b>Transferability Points</b>, often adding 50+ points to the CRS score.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Result Panel */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="">
                        <PoolAnalytics currentScore={simulatedScore} />
                    </div>

                    <Card className="border-brand-100 bg-brand-50/20 overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-brand-100 text-brand-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight underline decoration-brand-500 decoration-4 underline-offset-4">
                                    Simulated Potential: {simulatedScore}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
                                    "Based on your simulation, the candidate would reach <b>Competitive status</b> in the 2024 STEM draws."
                                </p>
                            </div>
                            <Button
                                onClick={handleSendSimulatedRoadmap}
                                disabled={isUpdating}
                                className="bg-gray-900 text-white hover:bg-black rounded-xl font-bold text-[10px] px-6 h-9 uppercase tracking-widest shadow-md gap-2"
                            >
                                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                {isUpdating ? 'Saving...' : 'Send Simulated Roadmap'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
