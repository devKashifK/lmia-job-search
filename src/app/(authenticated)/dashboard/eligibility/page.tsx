'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    History,
    CalcIcon,
    AlertCircle,
    Star,
    BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalculatorHub, CalculatorType } from '@/components/calculators/calculator-hub';
import { CalculatorPage } from '@/components/calculators/shared/calculator-page';
import { CALCULATOR_CONFIGS } from '@/components/calculators/configs';
import { useSession } from '@/hooks/use-session';
import { getUserProfile, UserProfile } from '@/lib/api/users';
import db from '@/db';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export default function EligibilityDashboard() {
    const { session } = useSession();
    const [selectedCalc, setSelectedCalc] = useState<CalculatorType | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetchData();
        }
    }, [session?.user?.id]);

    const fetchData = async () => {
        try {
            const [prof, hist] = await Promise.all([
                getUserProfile(session!.user.id),
                db.from('calculator_results')
                    .select('*')
                    .eq('user_id', session!.user.id)
                    .order('created_at', { ascending: false })
            ]);
            setProfile(prof);
            setHistory(hist.data || []);
        } catch (err) {
            console.error('Error fetching eligibility data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const mapProfileToCalculator = (prof: UserProfile) => {
        return {
            age: prof.experience ? "25" : "", // Heuristic: we don't have birthday in UserProfile yet
            workExperience: prof.experience || "",
            educationLevel: prof.education ? "bachelors" : ""
        };
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <AnimatePresence mode="wait">
                {!selectedCalc ? (
                    <motion.div
                        key="hub"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="space-y-2">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    PR Eligibility Suite
                                </Badge>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                                    Check Your Canada <span className="text-brand-600">Immigration Points</span>
                                </h1>
                                <p className="text-gray-500 font-medium max-w-xl">
                                    Evaluate your Profile against 9+ Canadian Provincial and Federal immigration streams. Your results are private and saved for your reference.
                                </p>
                            </div>
                            <Button variant="outline" className="rounded-xl font-bold text-xs h-11 px-6 border-gray-200">
                                <History className="w-4 h-4 mr-2" />
                                My Assessment History
                            </Button>
                        </div>

                        <CalculatorHub onSelect={setSelectedCalc} />

                        {history.length > 0 && (
                            <div className="space-y-4 pt-8 border-t border-gray-100">
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Your Saved Results</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {history.map((record) => (
                                        <Card key={record.id} className="border-gray-100 shadow-sm bg-gray-50/50">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider bg-white border-gray-200">
                                                        {record.calculator_type}
                                                    </Badge>
                                                    <span className="text-[10px] text-gray-400 font-bold">{format(new Date(record.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-2xl font-black text-gray-900">{record.score}</p>
                                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Points Score</p>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white border border-transparent hover:border-gray-200">
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedCalc(null)}
                            className="rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 -ml-2"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back to Hub
                        </Button>

                        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                            {CALCULATOR_CONFIGS[selectedCalc] ? (
                                <CalculatorPage
                                    config={CALCULATOR_CONFIGS[selectedCalc]}
                                    userId={session?.user?.id}
                                    initialData={profile ? mapProfileToCalculator(profile) : {}}
                                    onComplete={() => fetchData()}
                                />
                            ) : (
                                <div className="p-20 text-center space-y-4">
                                    <AlertCircle className="w-12 h-12 text-brand-200 mx-auto" />
                                    <div>
                                        <h3 className="font-bold text-gray-900 tracking-tight capitalize">
                                            {selectedCalc.replace('-', ' ')} Module Coming Soon
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">
                                            We're currently updating this calculator to reflect the latest 2024 program changes. Check back shortly.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const ArrowRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
