'use client';

import React, { useState, useEffect } from 'react';
import db from '@/db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Save, Plus, Trash2, ClipboardList, PenLine, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAgencyStrategy } from '@/hooks/use-agency-clients';

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
        const updated = [...currentRoadmap, { id: Date.now().toString(), text: newStep, completed: false }];

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

            const newSteps = (result.steps as string[]).map((text, i) => ({
                id: `ai-${Date.now()}-${i}`,
                text,
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

    if (isLoadingStrategy) {
        return (
            <div className="flex items-center justify-center h-48 bg-gray-50/50 rounded-xl border border-dashed border-gray-100">
                <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                <span className="ml-3 text-xs font-medium text-gray-400">Loading strategy...</span>
            </div>
        );
    }

    const itemVariants = (completed: boolean) => `text-xs font-medium cursor-pointer transition-all ${completed ? 'text-gray-300 line-through' : 'text-gray-700'}`;

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
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-brand-600" />
                    Candidate Roadmap
                </h3>
                <button
                    onClick={handleGenerateRoadmap}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-gradient-to-r from-violet-500 to-brand-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                >
                    {isGenerating
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Sparkles className="w-3 h-3" />}
                    {isGenerating ? 'Generating...' : 'Our Recommendations'}
                </button>

                <div className="flex gap-2">
                    <input
                        placeholder="Add next strategic step..."
                        className="flex-1 h-9 px-3 text-xs bg-gray-50/50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 font-medium"
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                        disabled={isAddingStep}
                    />
                    <Button
                        size="sm"
                        onClick={handleAddStep}
                        disabled={isAddingStep || !newStep.trim()}
                        className="h-9 bg-brand-600 rounded-lg shadow-sm shadow-brand-500/20"
                    >
                        {isAddingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-auto pr-1 custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {roadmap.map((step) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                            >
                                <Checkbox
                                    id={step.id}
                                    checked={step.completed}
                                    onCheckedChange={() => toggleStep(step.id)}
                                    className="w-4 h-4 border-gray-200 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                                />
                                <Label
                                    htmlFor={step.id}
                                    className={itemVariants(step.completed)}
                                >
                                    {step.text}
                                </Label>
                                <button
                                    onClick={() => removeStep(step.id)}
                                    className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {roadmap.length === 0 && (
                        <div className="text-center py-10 text-gray-300 border border-dashed border-gray-100 rounded-xl bg-gray-50/20">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Strategy Pipeline Empty</p>
                            <p className="text-[9px] text-gray-400 mt-1 max-w-[150px] mx-auto font-medium">Define clear actions to accelerate placement for this candidate.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

const itemVariants = (completed: boolean) =>
    `text-[11px] font-medium transition-all ${completed ? "text-gray-300 line-through" : "text-gray-600"}`;
