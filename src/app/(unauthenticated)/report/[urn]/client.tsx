'use client';

import React from 'react';
import { 
    CheckCircle2, 
    Circle, 
    Calendar, 
    ExternalLink, 
    Building2, 
    MapPin, 
    Target, 
    Zap, 
    Star,
    ArrowUpRight,
    Trophy,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ReportClientProps {
    strategy: any;
    agency: any;
    client: any;
    applications: any[];
    scores: any[];
}

export default function ReportClient({ strategy, agency, client, applications, scores }: ReportClientProps) {
    const roadmap = Array.isArray(strategy.strategy_roadmap) ? strategy.strategy_roadmap : [];
    const completedSteps = roadmap.filter((s: any) => s.completed).length;
    const progress = roadmap.length > 0 ? Math.round((completedSteps / roadmap.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
            {/* White-Label Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {agency.logo_url ? (
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                <Image src={agency.logo_url} alt={agency.company_name} fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                {agency.company_name?.charAt(0) || 'A'}
                            </div>
                        )}
                        <div>
                            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">
                                {agency.company_name || 'Your Agency'}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                Client Progress Portal
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-right hidden md:block">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Candidate</p>
                        <p className="text-sm font-black text-slate-900">{client?.full_name || 'Candidate'}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
                {/* Hero / Progress Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Search Progress</h2>
                                    <p className="text-sm text-slate-500 font-medium">Strategic immigration & job placement roadmap</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-brand-600">{progress}%</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Complete</p>
                                </div>
                            </div>
                            <Progress value={progress} className="h-4 bg-slate-100" />
                            
                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applications</p>
                                    <p className="text-xl font-black text-slate-900">{applications.length}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Benchmarks</p>
                                    <p className="text-xl font-black text-slate-900">{scores.length}</p>
                                </div>
                                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-xl font-black text-brand-700">Active</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                        <CardContent className="p-8 flex flex-col justify-between h-full">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <ShieldCheck className="w-5 h-5 text-brand-400" />
                                    </div>
                                    <h3 className="font-bold text-lg">Advisor Note</h3>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed italic">
                                    {strategy.internal_notes || "Your consultant is currently finalizing your strategic roadmap. Check back soon for detailed milestones."}
                                </p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Primary Advisor</p>
                                <p className="text-sm font-bold">{agency.contact_name || agency.company_name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{agency.contact_email}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Strategy Roadmap */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                             <Target className="w-4 h-4 text-brand-600" />
                             Strategic Roadmap
                        </h3>
                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white">
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {roadmap.length > 0 ? roadmap.map((step: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 relative">
                                            {idx !== roadmap.length - 1 && (
                                                <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%+8px)] bg-slate-100" />
                                            )}
                                            <div className="relative z-10 pt-1">
                                                {step.completed ? (
                                                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 bg-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <h4 className={cn(
                                                    "text-sm font-bold tracking-tight",
                                                    step.completed ? "text-slate-900" : "text-slate-400"
                                                )}>
                                                    {step.title}
                                                </h4>
                                                {step.description && (
                                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 opacity-50 italic text-sm text-slate-400">
                                            Roadmap initialization in progress...
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Timeline & Scoring */}
                    <div className="space-y-8">
                        {/* Application log */}
                        <div className="space-y-4">
                             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {applications.slice(0, 5).map((app: any) => (
                                    <Card key={app.id} className="border-none shadow-lg shadow-slate-200/30 bg-white hover:bg-slate-50/50 transition-colors group">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-white transition-colors">
                                                    <Building2 className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-900 truncate pr-2">{app.job_title}</h4>
                                                    <p className="text-[11px] text-slate-400 font-medium truncate">{app.employer_name} · {app.city}, {app.state}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-brand-50 text-brand-700 hover:bg-brand-100 border-none text-[10px] font-black tracking-wider uppercase px-2 py-1 shrink-0">
                                                {app.status}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                                {applications.length === 0 && (
                                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400 italic">No applications logged in the active pipeline yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Scores */}
                        <div className="space-y-4">
                             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-indigo-500" />
                                Eligibility Scores
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {scores.slice(0, 4).map((score: any) => (
                                    <Card key={score.id} className="border-none shadow-lg shadow-slate-200/30 bg-white p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">
                                                {score.calculator_type.replace('-', ' ')}
                                            </span>
                                            <Zap className={cn("w-3 h-3", score.score > 400 ? "text-amber-500" : "text-indigo-500")} />
                                        </div>
                                        <p className="text-2xl font-black text-slate-800 leading-none mb-1">
                                            {score.score}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Points Assessment</p>
                                    </Card>
                                ))}
                                {scores.length === 0 && (
                                    <div className="col-span-2 py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400 italic">Waitling for formal eligibility assessment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-slate-200 py-10">
                <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
                    <p className="text-xs text-slate-400 font-medium mb-4">
                        Official candidate report powered by JobMaze AI & {agency.company_name}
                    </p>
                    <div className="flex gap-4">
                        <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-bold">Confidential Candidate Information</Badge>
                        <Badge variant="outline" className="border-slate-200 text-slate-400 text-[10px] font-bold">Secure Dashboard</Badge>
                    </div>
                </div>
            </footer>
        </div>
    );
}
