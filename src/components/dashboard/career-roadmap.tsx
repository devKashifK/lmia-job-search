'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useToast } from '@/hooks/use-toast';
import { 
    Sparkles, 
    ClipboardList, 
    Plus, 
    Trash2, 
    Loader2, 
    ChevronRight,
    Zap,
    Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import db from '@/db';

export function CareerRoadmap() {
    const { profile, updateProfile, isLoading: isProfileLoading } = useUserProfile();
    const { toast } = useToast();
    
    const [roadmap, setRoadmap] = useState<any[]>([]);
    const [newStep, setNewStep] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAddingStep, setIsAddingStep] = useState(false);

    // Sync state with profile data
    useEffect(() => {
        if (profile?.career_roadmap) {
            setRoadmap(Array.isArray(profile.career_roadmap) ? profile.career_roadmap : []);
        }
    }, [profile]);

    const handleGenerate = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        try {
            const { data: { session } } = await db.auth.getSession();
            if (!session) {
                toast({ variant: 'destructive', title: 'Unauthorized', description: 'Please log in to generate your roadmap.' });
                return;
            }

            const response = await fetch('/api/generate-roadmap', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Generation failed');

            const newSteps = (result.steps as string[]).map((text, i) => ({
                id: `ai-${Date.now()}-${i}`,
                text,
                completed: false
            }));

            // Save to database
            const updatedRoadmap = [...roadmap, ...newSteps];
            await updateProfile({ career_roadmap: updatedRoadmap });
            
            toast({ 
                title: '✨ Roadmap Generated', 
                description: '7 strategic steps have been added to your career plan.' 
            });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddStep = async () => {
        if (!newStep.trim()) return;
        setIsAddingStep(true);
        const step = { id: Date.now().toString(), text: newStep, completed: false };
        const updated = [...roadmap, step];
        
        try {
            await updateProfile({ career_roadmap: updated });
            setNewStep('');
            toast({ title: 'Step Added', description: 'Goal successfully added to your roadmap.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsAddingStep(false);
        }
    };

    const toggleStep = async (id: string) => {
        const updated = roadmap.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
        setRoadmap(updated); // Optimistic
        try {
            await updateProfile({ career_roadmap: updated });
        } catch (err) {
            console.error('Failed to toggle step:', err);
        }
    };

    const removeStep = async (id: string) => {
        const updated = roadmap.filter(s => s.id !== id);
        setRoadmap(updated); // Optimistic
        try {
            await updateProfile({ career_roadmap: updated });
        } catch (err) {
            console.error('Failed to remove step:', err);
        }
    };

    if (isProfileLoading) {
        return (
            <Card className="p-8 border-gray-100 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading Career Plan...</p>
            </Card>
        );
    }

    const completedCount = roadmap.filter(s => s.completed).length;
    const progress = roadmap.length > 0 ? (completedCount / roadmap.length) * 100 : 0;

    return (
        <Card className="overflow-hidden border-gray-100 shadow-xl shadow-brand-900/5 bg-white flex flex-col h-full">
            {/* Header */}
            <div className="p-4 bg-gradient-to-br from-brand-900 to-indigo-950 text-white relative">
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                            <Sparkles className="w-4 h-4 text-brand-300 fill-brand-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">AI Career Roadmap</h3>
                            <p className="text-[10px] text-brand-200 mt-0.5">Personalized Canadian placement strategy</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar Area */}
                <div className="mt-5 space-y-2 relative z-10">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Milestones Reached</span>
                        <span className="text-brand-300">{completedCount} of {roadmap.length}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-brand-400 to-emerald-400"
                        />
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl" />
            </div>

            {/* Content Body */}
            <div className="flex-1 p-4 space-y-4">
                {/* Actions */}
                <div className="flex gap-2">
                    <Button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 h-9 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 text-[11px] font-bold rounded-xl transition-all shadow-none"
                    >
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-2" />}
                        {isGenerating ? 'Strategizing...' : (roadmap.length > 0 ? 'Update Roadmap' : 'Generate Roadmap')}
                    </Button>
                </div>

                {/* Add Step */}
                <div className="flex gap-2 group">
                    <input 
                        placeholder="Add secondary goal..."
                        className="flex-1 h-9 px-3 text-[11px] bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/10 font-medium transition-all"
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                        disabled={isAddingStep}
                    />
                    <Button 
                        size="sm" 
                        onClick={handleAddStep} 
                        disabled={isAddingStep || !newStep.trim()} 
                        className="h-9 w-9 bg-gray-900 hover:bg-black rounded-xl p-0 shadow-lg shadow-gray-200/50"
                    >
                        {isAddingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Steps List */}
                <div className="space-y-2 max-h-[300px] overflow-auto pr-1 custom-scrollbar min-h-[150px]">
                    <AnimatePresence initial={false}>
                        {roadmap.map((step, idx) => (
                            <motion.div 
                                key={step.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-start gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100/50 rounded-xl transition-all group"
                            >
                                <Checkbox 
                                    id={step.id} 
                                    checked={step.completed} 
                                    onCheckedChange={() => toggleStep(step.id)}
                                    className="mt-0.5 w-4 h-4 border-gray-200 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600 rounded-md"
                                />
                                <div className="flex-1 leading-tight">
                                    <Label 
                                        htmlFor={step.id}
                                        className={`text-[11px] font-bold cursor-pointer transition-all leading-relaxed ${step.completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}
                                    >
                                        {step.text}
                                    </Label>
                                </div>
                                <button 
                                    onClick={() => removeStep(step.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all shrink-0"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {roadmap.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-60">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-gray-200" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Launch Roadmap</p>
                                <p className="text-[9px] text-gray-300 max-w-[150px] mx-auto mt-1">Generate your AI strategy to start tracking your Canadian job search.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    Powered by JobMaze AI
                </p>
            </div>
        </Card>
    );
}
