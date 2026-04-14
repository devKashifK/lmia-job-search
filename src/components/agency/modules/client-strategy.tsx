'use client';

import React, { useState, useEffect } from 'react';
import db from '@/db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Plus, Trash2, ClipboardList, PenLine, Loader2, Sparkles, BadgeCheck, MessageSquareQuote, ChevronRight, Lightbulb, Share2, History, Globe, ExternalLink, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAgencyStrategy } from '@/hooks/use-agency-clients';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface ClientStrategyProps {
    client: any;
}

export function ClientStrategy({ client }: ClientStrategyProps) {
    const { strategy, updateStrategy, isLoading: isLoadingStrategy } = useAgencyStrategy(client.urn);
    const { toast } = useToast();

    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [roadmap, setRoadmap] = useState<any[]>([]);
    const [accessPin, setAccessPin] = useState('');
    const [newStep, setNewStep] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [isAddingStep, setIsAddingStep] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);
    const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);

    useEffect(() => {
        if (strategy) {
            if (!isEditingNotes) setNotes(strategy.internal_notes || '');
            setRoadmap(Array.isArray(strategy.strategy_roadmap) ? strategy.strategy_roadmap : []);
            setInterviewQuestions(Array.isArray(strategy.interview_questions) ? strategy.interview_questions : []);
            setAccessPin(strategy.access_pin || '');

            // Auto-generate PIN if missing
            if (!strategy.access_pin) {
                const autoPin = Math.floor(1000 + Math.random() * 9000).toString();
                setAccessPin(autoPin);
                updateStrategy({ access_pin: autoPin });
            }
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
            if (!session) throw new Error('Session Expired');
            const response = await fetch('/api/agency/generate-roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
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
            const finalRoadmap = [...roadmap, ...newSteps];
            setRoadmap(finalRoadmap);
            await updateStrategy({ internal_notes: notes, strategy_roadmap: finalRoadmap });
            toast({ title: '✨ Roadmap Generated', description: 'Strategic steps added.' });
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ clientData: client?.extracted_data || {} })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Generation failed');
            const questions = result.questions || [];
            setInterviewQuestions(questions);
            await updateStrategy({ internal_notes: notes, strategy_roadmap: roadmap, interview_questions: questions });
            toast({ title: '🎯 Interview Guide Ready', description: 'Coaching questions generated.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Coaching Error', description: err.message });
        } finally {
            setIsGeneratingPrep(false);
        }
    };

    const progress = roadmap.length > 0 
        ? Math.round((roadmap.filter(s => s.completed).length / roadmap.length) * 100) 
        : 0;

    const handleSharePortal = () => {
        const portalUrl = `${window.location.host}/report/${client.urn}`;
        navigator.clipboard.writeText(portalUrl);
        toast({ title: "Portal Link Copied", description: "You can now share this report." });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Strategic Command</h2>
                    <p className="text-xs text-gray-500 font-medium">Manage roadmap, interview coaching, and client-facing transparency.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => window.open(`/report/${client.urn}`, '_blank')} className="h-10 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200">
                        <Globe className="w-3.5 h-3.5 mr-2" />
                        Preview Portal
                    </Button>
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 h-10 gap-3">
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Lock className="w-3 h-3 text-brand-600" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Access PIN</span>
                        </div>
                        <Input 
                            value={accessPin}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setAccessPin(val);
                            }}
                            onBlur={() => {
                                if (accessPin.length === 4 && accessPin !== strategy?.access_pin) {
                                    updateStrategy({ access_pin: accessPin });
                                    toast({ title: "PIN Updated", description: `Security code set to ${accessPin}` });
                                }
                            }}
                            className="w-14 h-6 p-0 text-center text-xs font-black bg-white border-brand-200 focus:ring-0 rounded text-brand-700"
                            placeholder="0000"
                        />
                    </div>
                    <Button onClick={handleSharePortal} className="h-10 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20">
                        <Share2 className="w-3.5 h-3.5 mr-2" />
                        Share Progress Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 border-gray-100 shadow-sm flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <PenLine className="w-4 h-4 text-brand-600" />
                            Case Internal Notes
                        </h3>
                        {isEditingNotes && (
                            <Button variant="ghost" size="sm" onClick={handleSaveNotes} disabled={isSavingNotes} className="h-8 text-[11px] font-bold text-brand-600">
                                {isSavingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                                Save Notes
                            </Button>
                        )}
                    </div>
                    {isEditingNotes ? (
                        <Textarea
                            placeholder="Document strategy..."
                            className="flex-1 min-h-[200px] text-xs leading-relaxed border-gray-100 focus:ring-brand-500/20 resize-none bg-gray-50/50"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isSavingNotes}
                            autoFocus
                        />
                    ) : (
                        <div className="flex-1 min-h-[200px] p-4 bg-gray-50/30 rounded-xl border border-dashed border-gray-200 cursor-pointer group" onClick={() => setIsEditingNotes(true)}>
                            {notes ? (
                                <div className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">{notes}</div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-60">
                                    <PenLine className="w-5 h-5 text-brand-600" />
                                    <p className="text-[11px] text-gray-500">Click to add case notes</p>
                                </div>
                            )}
                        </div>
                    )}
                    <p className="text-[9px] text-gray-400 italic">Internal only.</p>
                </Card>

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
                                        <div className="h-full bg-brand-600" style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-brand-600">{progress}%</span>
                                </div>
                            )}
                            <Button onClick={handleGenerateRoadmap} disabled={isGenerating} size="sm" className="h-8 text-[10px] font-bold bg-brand-600 text-white">
                                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                AI Strategy
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-auto pr-1">
                        {roadmap.map((step, idx) => (
                            <div key={step.id} className="flex gap-3 group">
                                <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer", step.completed ? "border-brand-600 bg-brand-600 text-white" : "border-gray-200 text-gray-300")} onClick={() => toggleStep(step.id)}>
                                    {step.completed ? <BadgeCheck className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className={cn("text-[12px] font-bold truncate", step.completed ? "text-gray-300 line-through" : "text-gray-900")}>{step.title}</h4>
                                        <button onClick={() => removeStep(step.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                    {step.description && <p className={cn("text-[11px]", step.completed ? "text-gray-200" : "text-gray-500")}>{step.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input placeholder="Add goal..." className="flex-1 h-9 px-3 text-[11px] border border-gray-100 rounded-xl" value={newStep} onChange={(e) => setNewStep(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddStep()} />
                        <Button size="sm" onClick={handleAddStep} className="h-9 w-9 p-0 bg-brand-600 rounded-xl"><Plus className="w-4 h-4" /></Button>
                    </div>
                </Card>

                <Card className="md:col-span-2 p-6 border-brand-100 bg-brand-50/10 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase">
                                <MessageSquareQuote className="w-4 h-4 text-brand-600" />
                                Interview Coaching Hub
                            </h3>
                        </div>
                        <Button onClick={handleGenerateInterviewPrep} disabled={isGeneratingPrep} className="bg-brand-600 text-white font-black text-[10px] uppercase h-8 px-4 rounded-xl">
                            {isGeneratingPrep ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                            Generate Prep
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {interviewQuestions.length > 0 ? interviewQuestions.map((item, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-100 space-y-2">
                                <div className="flex gap-3">
                                    <span className="w-5 h-5 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 text-[10px] font-black">{idx + 1}</span>
                                    <h4 className="text-[12px] font-bold text-gray-900 leading-tight">{item.question}</h4>
                                </div>
                                <div className="pl-8 space-y-2">
                                    <p className="text-[10px] text-gray-500 font-medium"><span className="font-black text-gray-900 uppercase text-[9px] mr-1">Rationale:</span>{item.rationale}</p>
                                    <div className="bg-amber-50 rounded-lg p-2 border border-amber-100/50 flex gap-2">
                                        <Lightbulb className="w-3 h-3 text-amber-600 shrink-0" />
                                        <p className="text-[9px] text-amber-800 font-bold"><span className="uppercase text-[8px] mr-1 underline">Tip:</span>{item.star_tip}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="md:col-span-2 py-8 text-center text-gray-300">
                                <MessageSquareQuote className="w-6 h-6 mx-auto mb-2 opacity-20" />
                                <p className="text-[10px] uppercase font-black">Coaching Pending</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="md:col-span-2 p-6 border-gray-100 bg-white shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-brand-600" />
                        Outreach Activity History
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="pb-2">Employer</th>
                                    <th className="pb-2">Strategy Note</th>
                                    <th className="pb-2 text-right">Performed At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {Array.isArray(client.outreach_log) && client.outreach_log.length > 0 ? client.outreach_log.map((log: any, idx: number) => (
                                    <tr key={log.id || idx} className="text-[11px]">
                                        <td className="py-3 font-bold text-gray-900 uppercase">{log.employer}</td>
                                        <td className="py-3 text-gray-500 max-w-md truncate">{log.notes}</td>
                                        <td className="py-3 text-right text-gray-400">{log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm') : 'Recently'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="py-8 text-center text-[10px] text-gray-300 uppercase font-black">No outreach recorded</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
