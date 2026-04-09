'use client';

import React, { useState, useEffect } from 'react';
import db from '@/db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Save, Plus, Trash2, ClipboardList, PenLine, Loader2, Sparkles, BadgeCheck, MessageSquareQuote, ChevronRight, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAgencyStrategy } from '@/hooks/use-agency-clients';
import { cn } from '@/lib/utils';

interface ClientStrategyProps {
    client: any;
}

export function ClientStrategy({ client }: ClientStrategyProps) {
    const { strategy, updateStrategy, isLoading: isLoadingStrategy } = useAgencyStrategy(client.urn);
    const { toast } = useToast();

    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [roadmap, setRoadmap] = useState<any[]>([]);
    const [newStep, setNewStep] = useState('');

    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [isAddingStep, setIsAddingStep] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);
    const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);

    // Sync state when strategy data loads or updates
    useEffect(() => {
        if (strategy) {
            if (!isEditingNotes) setNotes(strategy.internal_notes || '');
            setRoadmap(Array.isArray(strategy.strategy_roadmap) ? strategy.strategy_roadmap : []);
        }
    }, [strategy, isEditingNotes]);

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        try {
            await updateStrategy({ internal_notes: notes, strategy_roadmap: roadmap });
            setIsEditingNotes(false);
            toast({ title: "Notes Saved", description: "Strategic notes persisted." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Save Error", description: err.message });
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleAddStep = async () => {
        if (!newStep.trim()) return;

        setIsAddingStep(true);
        const originalStep = newStep;
        const currentRoadmap = Array.isArray(roadmap) ? roadmap : [];
        const updated = [...currentRoadmap, { id: Date.now().toString(), title: newStep, description: '', completed: false }];

        // Optimistic UI
        setRoadmap(updated);
        setNewStep('');

        try {
            await updateStrategy({ internal_notes: notes, strategy_roadmap: updated });
            toast({ title: "Goal Added", description: `"${originalStep}" added to roadmap.` });
        } catch (err: any) {
            setRoadmap(currentRoadmap);
            setNewStep(originalStep);
            toast({ variant: "destructive", title: "Roadmap Error", description: err.message });
        } finally {
            setIsAddingStep(false);
        }
    };

    const toggleStep = async (id: string) => {
        const updated = roadmap.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
        setRoadmap(updated);
        try {
            await updateStrategy({ internal_notes: notes, strategy_roadmap: updated });
        } catch (err) {
            console.error('Error toggling step:', err);
        }
    };

    const removeStep = async (id: string) => {
        const updated = roadmap.filter(s => s.id !== id);
        setRoadmap(updated);
        try {
            await updateStrategy({ internal_notes: notes, strategy_roadmap: updated });
        } catch (err) {
            console.error('Error removing step:', err);
        }
    };

    const handleGenerateRoadmap = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const { data: { session } } = await db.auth.getSession();
            if (!session) {
                toast({ variant: 'destructive', title: 'Session Expired', description: 'Please log in again to generate roadmaps.' });
                return;
            }

            const response = await fetch('/api/agency/generate-roadmap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ clientData: client?.extracted_data || {} })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Generation failed');

            const newSteps = (result.steps as any[]).map((step, i) => ({
                id: `ai-${Date.now()}-${i}`,
                title: step.title || '',
                description: step.description || '',
                completed: false
            }));

            // Animate steps in one by one
            const currentRoadmap = Array.isArray(roadmap) ? roadmap : [];
            for (let i = 0; i < newSteps.length; i++) {
                await new Promise(r => setTimeout(r, 200));
                setRoadmap(prev => [...(Array.isArray(prev) ? prev : currentRoadmap), newSteps[i]]);
            }

            // Save the final state
            const finalRoadmap = [...currentRoadmap, ...newSteps];
            await updateStrategy({ internal_notes: notes, strategy_roadmap: finalRoadmap });
            toast({ title: '✨ Roadmap Generated', description: '7 strategic steps have been added.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Generation Failed', description: err.message });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateInterviewPrep = async () => {
        if (isGeneratingPrep) return;
        setIsGeneratingPrep(true);
        try {
            const { data: { session } } = await db.auth.getSession();
            if (!session) throw new Error('Unauthorized');

            const response = await fetch('/api/agency/generate-interview-prep', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ clientData: client?.extracted_data || {} })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Generation failed');

            setInterviewQuestions(result.questions);
            toast({ title: '🎯 Interview Guide Ready', description: 'Custom coaching questions have been generated.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Coaching Error', description: err.message });
        } finally {
            setIsGeneratingPrep(false);
        }
    };

    const progress = roadmap.length > 0 
        ? Math.round((roadmap.filter(s => s.completed).length / roadmap.length) * 100) 
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Internal Notes Panel */}
            <Card className="p-4 border-gray-100 shadow-sm flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <PenLine className="w-4 h-4 text-brand-600" />
                        Case Internal Notes
                    </h3>
                    <div className="flex items-center gap-2">
                        {isEditingNotes ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes}
                                className="h-8 text-[11px] font-bold text-brand-600 hover:bg-brand-50"
                            >
                                {isSavingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                                {isSavingNotes ? 'Saving...' : 'Save Notes'}
                            </Button>
                        ) : null}
                    </div>
                </div>

                {isEditingNotes ? (
                    <Textarea
                        placeholder="Document strategy, interview feedback, or specific challenges for this candidate..."
                        className="flex-1 min-h-[200px] text-xs leading-relaxed border-gray-100 focus:ring-brand-500/20 resize-none bg-gray-50/50"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={isSavingNotes}
                        autoFocus
                    />
                ) : (
                    <div
                        className="flex-1 min-h-[200px] p-4 bg-gray-50/30 rounded-xl border border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer group overflow-auto"
                        onClick={() => setIsEditingNotes(true)}
                    >
                        {notes ? (
                            <div className="relative h-full text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {notes}
                                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-gray-100 rounded text-brand-600 transition-opacity">
                                    <PenLine className="w-3 h-3" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
                                    <PenLine className="w-5 h-5 text-brand-600" />
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium">Click to add case notes</p>
                            </div>
                        )}
                    </div>
                )}
                <p className="text-[9px] text-gray-400 italic">This section is visible only to agency members.</p>
            </Card>

            {/* Strategic Roadmap Panel */}
            <Card className="p-4 border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-brand-600" />
                        Strategic Roadmap
                    </h3>
                    <div className="flex items-center gap-3">
                        {roadmap.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-brand-600"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-brand-600">{progress}%</span>
                            </div>
                        )}
                        <button
                            onClick={handleGenerateRoadmap}
                            disabled={isGenerating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-gradient-to-r from-violet-500 to-brand-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                        >
                            {isGenerating
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Sparkles className="w-3 h-3" />}
                            {isGenerating ? 'Generating...' : 'AI Strategy'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100 max-h-[450px] overflow-auto pr-1">
                    <AnimatePresence initial={false}>
                        {roadmap.map((step, idx) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative pl-10 group"
                            >
                                <div 
                                    className={cn(
                                        "absolute left-0 top-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all z-10 bg-white",
                                        step.completed 
                                            ? "border-brand-600 bg-brand-600 text-white" 
                                            : "border-gray-200 text-gray-300"
                                    )}
                                    onClick={() => toggleStep(step.id)}
                                >
                                    {step.completed ? (
                                        <BadgeCheck className="w-4 h-4" />
                                    ) : (
                                        <span className="text-[10px] font-bold">{idx + 1}</span>
                                    )}
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className={cn(
                                            "text-[12px] font-bold tracking-tight transition-all",
                                            step.completed ? "text-gray-300 line-through" : "text-gray-900"
                                        )}>
                                            {typeof step === 'string' ? step : (step.title || step.text || 'Untitled Step')}
                                        </h4>
                                        <button
                                            onClick={() => removeStep(step.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                    {step.description && (
                                        <p className={cn(
                                            "text-[11px] leading-relaxed transition-all",
                                            step.completed ? "text-gray-200" : "text-gray-500 font-medium"
                                        )}>
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {roadmap.length === 0 && (
                        <div className="text-center py-20 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl mx-10">
                            <Sparkles className="w-8 h-8 text-brand-100 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Strategy Pending</p>
                            <p className="text-[9px] text-gray-300 mt-2 max-w-[140px] mx-auto font-bold uppercase tracking-tighter">Click 'AI Strategy' to generate a roadmap.</p>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <div className="flex gap-2">
                        <input
                            placeholder="Add manual strategy goal..."
                            className="flex-1 h-9 px-3 text-[11px] bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 font-bold"
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                            disabled={isAddingStep}
                        />
                        <Button
                            size="sm"
                            onClick={handleAddStep}
                            disabled={isAddingStep || !newStep.trim()}
                            className="h-9 w-9 p-0 bg-brand-600 rounded-xl shadow-md shadow-brand-500/10"
                        >
                            {isAddingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* AI Interview Coaching Hub */}
            <Card className="md:col-span-2 p-6 border-brand-100 bg-brand-50/10 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-base font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                            <MessageSquareQuote className="w-5 h-5 text-brand-600" />
                            Interview Coaching Hub
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">NOC-Specific Behavioral & Technical Prep</p>
                    </div>
                    <Button
                        onClick={handleGenerateInterviewPrep}
                        disabled={isGeneratingPrep}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-black text-[10px] uppercase tracking-widest px-6 h-9 rounded-xl shadow-lg shadow-brand-200 transition-all"
                    >
                        {isGeneratingPrep ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
                        {isGeneratingPrep ? 'Analyzing NOC...' : 'Generate Prep Guide'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interviewQuestions.length > 0 ? (
                        <AnimatePresence>
                            {interviewQuestions.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3 hover:border-brand-200 transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 text-[10px] font-black shrink-0">
                                            {idx + 1}
                                        </div>
                                        <h4 className="text-[12px] font-bold text-gray-900 leading-tight pt-0.5">
                                            {item.question}
                                        </h4>
                                    </div>
                                    
                                    <div className="pl-9 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <ChevronRight className="w-3 h-3 text-gray-400 mt-0.5" />
                                            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                                <span className="font-black text-gray-900 uppercase text-[9px] mr-1">Rationale:</span>
                                                {item.rationale}
                                            </p>
                                        </div>
                                        <div className="bg-amber-50 rounded-lg p-2 flex items-start gap-2 border border-amber-100/50">
                                            <Lightbulb className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                                            <p className="text-[9px] text-amber-800 leading-relaxed font-bold">
                                                <span className="uppercase text-[8px] mr-1 underline">STAR Tip:</span>
                                                {item.star_tip}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="md:col-span-2 py-12 flex flex-col items-center justify-center text-center space-y-3 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-300">
                                <MessageSquareQuote className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Coaching Pending</p>
                                <p className="text-[9px] text-gray-300 max-w-[180px] font-bold uppercase tracking-tighter">Prepare this candidate for Canadian market success.</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
