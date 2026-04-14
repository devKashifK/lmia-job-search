'use client';

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
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
    ShieldCheck,
    MessageSquareQuote,
    Lightbulb,
    AlertCircle,
    FileText,
    Lock,
    ChevronRight,
    History,
    Plus,
    Sparkles,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface ReportClientProps {
    strategy: any;
    agency: any;
    client: any;
    applications: any[];
    scores: any[];
}

const CRITICAL_FIELDS = [
    {
        key: 'age',
        label: 'Age',
        type: 'number',
        placeholder: 'e.g., 28'
    },
    {
        key: 'experience_years',
        label: 'Work Experience',
        type: 'number',
        placeholder: 'Total years'
    },
    {
        key: 'education_level',
        label: 'Education',
        type: 'select',
        options: [
            { label: 'Secondary / High School', value: 'high_school' },
            { label: 'Trade / Diploma', value: 'diploma' },
            { label: 'Bachelors Degree', value: 'bachelors' },
            { label: 'Masters Degree', value: 'masters' },
            { label: 'PhD / Doctoral', value: 'phd' }
        ]
    },
    {
        key: 'language_clb',
        label: 'English (CLB)',
        type: 'select',
        options: [
            { label: 'CLB 4 (Basic)', value: '4' },
            { label: 'CLB 5', value: '5' },
            { label: 'CLB 6', value: '6' },
            { label: 'CLB 7 (Competent)', value: '7' },
            { label: 'CLB 8', value: '8' },
            { label: 'CLB 9 (Advanced)', value: '9' },
            { label: 'CLB 10 (Native)', value: '10' }
        ]
    },
    {
        key: 'noc_teer',
        label: 'NOC TEER Level',
        type: 'select',
        options: [
            { label: 'TEER 0 (Management)', value: '0' },
            { label: 'TEER 1 (Professional)', value: '1' },
            { label: 'TEER 2 (Technical)', value: '2' },
            { label: 'TEER 3 (Admin/Trade)', value: '3' },
            { label: 'TEER 4 (Intermediate)', value: '4' },
            { label: 'TEER 5 (Labour)', value: '5' }
        ]
    },
    {
        key: 'job_offer',
        label: 'Canadian Job Offer',
        type: 'select',
        options: [
            { label: 'Yes (Valid Offer)', value: 'yes' },
            { label: 'No (N/A)', value: 'no' }
        ]
    }
];

export default function ReportClient({ strategy, agency, client, applications, scores }: ReportClientProps) {
    const [pin, setPin] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [pinError, setPinError] = useState(false);

    // Gap Editing State
    const [activeGap, setActiveGap] = useState<any>(null);
    const [gapValue, setGapValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [localExtractedData, setLocalExtractedData] = useState(client.extracted_data || {});

    const roadmap = Array.isArray(strategy.strategy_roadmap) ? strategy.strategy_roadmap : [];
    const completedSteps = roadmap.filter((s: any) => s.completed).length;
    const progress = roadmap.length > 0 ? Math.round((completedSteps / roadmap.length) * 100) : 0;

    const interviewQuestions = Array.isArray(strategy.interview_questions) ? strategy.interview_questions : [];
    const checklist = Array.isArray(localExtractedData.document_checklist) ? localExtractedData.document_checklist : [];

    const gaps = CRITICAL_FIELDS.filter(f => !localExtractedData[f.key]);
    const suitedTitles = Array.isArray(localExtractedData.recommended_job_titles) ? localExtractedData.recommended_job_titles : (localExtractedData.position ? [localExtractedData.position] : []);
    const matchedNocs = Array.isArray(localExtractedData.recommended_noc_codes) ? localExtractedData.recommended_noc_codes.map(String) : (localExtractedData.noc_code ? [String(localExtractedData.noc_code)] : []);
    const targetEmployers = Array.isArray(localExtractedData.recommended_employers) ? localExtractedData.recommended_employers : (localExtractedData.company ? [localExtractedData.company] : []);
    const outreachLog = Array.isArray(client.outreach_log) ? client.outreach_log : [];
    const canadianResume = localExtractedData.canadian_resume || null;

    // PIN Gate Logic
    const hasPin = !!strategy.access_pin;

    const handleVerifyPin = () => {
        if (pin === strategy.access_pin) {
            setIsVerified(true);
            setPinError(false);
            sessionStorage.setItem(`report_auth_${client.urn}`, 'true');
        } else {
            setPinError(true);
            setPin('');
        }
    };

    const handleUpdateGap = async () => {
        if (!activeGap || !gapValue) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/agency/public-update-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    urn: strategy.client_urn,
                    pin: strategy.access_pin,
                    updates: { [activeGap.key]: gapValue }
                })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const result = await response.json();
            setLocalExtractedData(result.updatedData);

            toast.success(`${activeGap.label} updated successfully!`);
            setActiveGap(null);
            setGapValue('');
        } catch (err) {
            toast.error('Could not update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const generatePDF = (data: any) => {
        if (!data) return;

        const doc = new jsPDF({
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true
        });

        const margin = 20;
        const pageWidth = 210;
        const contentWidth = pageWidth - (2 * margin);
        let y = margin;

        // Helper to add multiline text and update Y
        const addWrappedText = (text: string, fontSize: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0], spacing = 5) => {
            doc.setFont('helvetica', style);
            doc.setFontSize(fontSize);
            doc.setTextColor(color[0], color[1], color[2]);

            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, y);
            y += (lines.length * (fontSize * 0.4)) + spacing;
        };

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text(data.header.name.toUpperCase(), margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        let currentX = margin;
        const separator = '  |  ';
        const separatorWidth = doc.getTextWidth(separator);

        // Location
        doc.text(data.header.location, currentX, y);
        currentX += doc.getTextWidth(data.header.location);

        // Contact items
        data.header.contact.forEach((item: string) => {
            // Draw separator
            doc.setTextColor(200, 200, 200);
            doc.text(separator, currentX, y);
            currentX += separatorWidth;

            // Draw item
            const isEmail = item.includes('@') && !item.startsWith('http');
            const isLinkedin = item.includes('linkedin.com/in/');
            const isLink = item.startsWith('http') || item.includes('linkedin.com') || item.includes('github.com');
            const href = isEmail ? `mailto:${item}` : isLink ? (item.startsWith('http') ? item : `https://${item}`) : null;
            const displayText = isLinkedin ? 'LinkedIn' : (isLink && !isEmail) ? 'Portfolio' : item;

            const itemWidth = doc.getTextWidth(displayText);
            if (href) {
                doc.setTextColor(0, 102, 204);
                doc.text(displayText, currentX, y);
                doc.link(currentX, y - 4, itemWidth, 5, { url: href });
            } else {
                doc.setTextColor(80, 80, 80);
                doc.text(displayText, currentX, y);
            }
            currentX += itemWidth;
        });

        y += 12;
        doc.setTextColor(0, 0, 0); // Reset to black

        // Sections
        const renderSectionHeader = (title: string) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(title.toUpperCase(), margin, y);
            y += 2;
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
        };

        // Professional Summary
        renderSectionHeader('Professional Summary');
        addWrappedText(data.professional_summary, 10, 'normal', [60, 60, 60], 8);

        // Skills
        if (data.skills && data.skills.length > 0) {
            renderSectionHeader('Technical Skills');
            data.skills.forEach((skillGroup: string) => {
                addWrappedText(skillGroup, 10, 'normal', [0, 0, 0], 4);
            });
            y += 4;
        }

        // Work Experience
        if (data.work_experience && data.work_experience.length > 0) {
            renderSectionHeader('Professional Experience');
            data.work_experience.forEach((job: any) => {
                // Job Title & Dates
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                const jobDateWidth = doc.getTextWidth(job.date);
                const availableWidth = contentWidth - jobDateWidth - 5;
                const roleLines = doc.splitTextToSize(job.role, availableWidth);

                doc.text(roleLines, margin, y);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(job.date, pageWidth - margin - jobDateWidth, y);

                y += (roleLines.length * 5) + 1;

                // Company & Location
                doc.setFont('helvetica', 'italic');
                doc.text(`${job.company} - ${job.location}`, margin, y);
                y += 6;

                // Bullets
                doc.setFont('helvetica', 'normal');
                job.bullets.forEach((bullet: string) => {
                    // Ensure bullet is a single line indicator
                    const bulletText = `• ${bullet}`;
                    const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
                    doc.text(lines, margin + 2, y);
                    y += (lines.length * 4.5) + 1;

                    if (y > 270) {
                        doc.addPage();
                        y = margin;
                    }
                });
                y += 4;
            });
        }

        // Projects
        if (data.projects && data.projects.length > 0) {
            if (y > 240) { doc.addPage(); y = margin; }
            renderSectionHeader('Key Projects');
            data.projects.forEach((proj: any) => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text(proj.name, margin, y);
                y += 5;
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(10);
                doc.text(`Tech Stack: ${proj.tech_stack}`, margin, y);
                y += 5;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                proj.bullets.forEach((bullet: string) => {
                    const bulletText = `• ${bullet}`;
                    const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
                    doc.text(lines, margin + 2, y);
                    y += (lines.length * 4.5) + 1;
                });
                y += 4;
            });
        }

        // Education
        if (data.education && data.education.length > 0) {
            if (y > 250) { doc.addPage(); y = margin; }
            renderSectionHeader('Education');
            data.education.forEach((edu: any) => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                const eduDateWidth = doc.getTextWidth(edu.date);
                const availableWidth = contentWidth - eduDateWidth - 5;
                const degreeLines = doc.splitTextToSize(edu.degree, availableWidth);

                doc.text(degreeLines, margin, y);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(edu.date, pageWidth - margin - eduDateWidth, y);

                y += (degreeLines.length * 5);
                doc.text(`${edu.institution}, ${edu.location}`, margin, y);
                y += 8;
            });
        }

        doc.save(`${data.header.name.replace(/\s+/g, '_')}_Canadian_Resume.pdf`);
    };

    useEffect(() => {
        const authed = sessionStorage.getItem(`report_auth_${client.urn}`);
        if (authed === 'true') setIsVerified(true);
    }, [client.urn]);

    if (hasPin && !isVerified) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10 text-center space-y-8"
                >
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-brand-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-brand-500/20 mb-6">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">Secure Portal</h1>
                        <p className="text-slate-400 text-sm font-medium">
                            This strategic report is protected by <b>{agency.company_name}</b>.<br />
                            Please enter the 4-digit PIN shared with you.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-center gap-3">
                            <input
                                type="password"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setPin(val);
                                    if (val.length === 4) setPinError(false);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && pin.length === 4 && handleVerifyPin()}
                                className={cn(
                                    "w-full h-20 text-center text-4xl font-black bg-slate-900 border-2 rounded-2xl tracking-[1em] pl-[0.5em] transition-all focus:ring-4 focus:ring-brand-500/20 outline-none",
                                    pinError ? "border-red-500 animate-shake" : "border-slate-800 focus:border-brand-500"
                                )}
                                placeholder="0000"
                                autoFocus
                            />
                        </div>

                        {pinError && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Incorrect PIN. Please try again.</p>}

                        <Button
                            onClick={handleVerifyPin}
                            disabled={pin.length < 4}
                            className="w-full h-14 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-600/20"
                        >
                            Access Report
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 animate-in fade-in duration-700">
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

            <main className="max-w-6xl mx-auto px-4 pt-8 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden flex flex-col">
                        <CardContent className="p-8 flex-1">
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applications</p>
                                    <p className="text-xl font-black text-slate-900">{applications.length}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Benchmarks</p>
                                    <p className="text-xl font-black text-slate-900">{scores.length}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">NOC Focused</p>
                                    <p className="text-xl font-black text-slate-900">{matchedNocs.length > 0 ? matchedNocs[0] : 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 text-center">
                                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-xl font-black text-brand-700">Active</p>
                                </div>
                            </div>
                        </CardContent>
                        <AnimatePresence>
                            {gaps.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="bg-amber-50 border-t border-amber-100 px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-amber-900 uppercase tracking-tight">Auto-Scoring Blocks ({gaps.length} Gaps)</p>
                                            <p className="text-[10px] text-amber-600 font-medium">Add these details to unlock your full eligibility scorecard.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {gaps.map(gap => (
                                            <Badge
                                                key={gap.key}
                                                variant="outline"
                                                className="bg-white border-amber-200 text-amber-700 text-[9px] font-bold uppercase tracking-tighter cursor-pointer hover:bg-amber-100 transition-colors flex items-center gap-1"
                                                onClick={() => {
                                                    setActiveGap(gap);
                                                    setGapValue(localExtractedData[gap.key] || '');
                                                }}
                                            >
                                                <Plus className="w-2.5 h-2.5" />
                                                {gap.label}
                                            </Badge>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                {canadianResume && (
                                    <div className="pt-4">
                                        <Button
                                            variant="secondary"
                                            className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl"
                                            onClick={() => generatePDF(canadianResume)}
                                        >
                                            <FileText className="w-4 h-4 mr-2 text-brand-600" />
                                            Download Canadian Resume
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Primary Advisor</p>
                                <p className="text-sm font-bold">{agency.contact_name || agency.company_name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{agency.contact_email}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-12">
                        {/* Strategic Journey */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-brand-600" />
                                    Strategic Journey
                                </h3>
                                {roadmap.length > 0 && (
                                    <Badge variant="outline" className="text-[9px] font-black text-brand-600 border-brand-100 bg-brand-50">
                                        {progress}% COMPLETE
                                    </Badge>
                                )}
                            </div>
                            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                                <CardContent className="p-8 relative">
                                    {roadmap.length > 0 ? (
                                        <div className="relative space-y-8">
                                            <div className="absolute left-[11px] top-2 bottom-6 w-[2px] bg-slate-100" />
                                            {roadmap.map((step: any, idx: number) => (
                                                <div key={idx} className="relative flex gap-6 group">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                                                        step.completed ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-slate-200"
                                                    )}>
                                                        {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                                                    </div>
                                                    <div className="pt-0.5">
                                                        <h4 className={cn("text-sm font-bold tracking-tight", step.completed ? "text-slate-900" : "text-slate-500")}>{step.title}</h4>
                                                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{step.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-slate-400 italic text-sm">Roadmap initialization in progress...</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Interview Readiness */}
                        <div className="space-y-4 ">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <MessageSquareQuote className="w-4 h-4 text-brand-500" />
                                Interview Readiness & AI Coaching
                            </h3>
                            <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden max-h-[1000px] overflow-y-auto">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Zap className="w-32 h-32 text-white" />
                                </div>
                                {interviewQuestions.length > 0 ? (
                                    <div className="space-y-6 relative z-10">
                                        {interviewQuestions.map((q: any, idx: number) => (
                                            <div key={idx} className="space-y-3 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                                                <div className="flex gap-4">
                                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-black text-sm">{idx + 1}</span>
                                                    <h4 className="text-[13px] font-bold text-white leading-relaxed pt-1.5">{q.question}</h4>
                                                </div>
                                                <div className="pl-12 space-y-4">
                                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Advisor Rationale</p>
                                                        </div>
                                                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{q.rationale}</p>
                                                    </div>
                                                    <div className="bg-brand-500/10 p-4 rounded-2xl border border-brand-500/20 relative group">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Star className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
                                                            <p className="text-[9px] text-brand-400 font-bold uppercase tracking-widest">Strategic Coaching Tip</p>
                                                        </div>
                                                        <p className="text-[11px] text-brand-100/90 leading-relaxed italic font-medium">{q.star_tip}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center relative z-10">
                                        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-4 opacity-50" />
                                        <p className="text-slate-400 italic text-sm font-medium">Interview preparation is being tailored for your professional profile.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-12">
                        {/* Document Verification Hub */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                Interactive Document Hub
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {checklist.map((item: any, i: number) => (
                                    <Card key={i} className="border-none shadow-lg bg-white p-5 group hover:bg-slate-50 transition-all duration-300 rounded-[2rem]">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        item.status === 'verified' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500"
                                                    )} />
                                                    <h4 className="text-sm font-black text-slate-900 tracking-tight">{item.label || item.name}</h4>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed pr-4">{item.description || `Required for ${item.category || 'Strategic Processing'}.`}</p>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Badge className={cn(
                                                        "text-[8px] font-black uppercase px-2 py-0.5",
                                                        item.status === 'verified' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                                                    )}>
                                                        {item.status || 'Pending Review'}
                                                    </Badge>
                                                    {item.expiry && <span className="text-[9px] text-slate-400 font-bold uppercase">Expires {item.expiry}</span>}
                                                </div>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-colors">
                                                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {checklist.length === 0 && (
                                    <div className="py-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 text-slate-400 text-xs italic">
                                        Your tailored document checklist is being compiled by our strategists.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recruitment Focus */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <Target className="w-4 h-4 text-brand-600" />
                                Recruitment Focus
                            </h3>
                            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white p-6 space-y-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suited Job Titles</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suitedTitles.map((title: string, i: number) => (
                                            <Badge key={i} className="bg-emerald-500 text-white border-none py-1.5 px-3 text-[10px] font-bold rounded-lg truncate max-w-[200px]">{title}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matched NOC Codes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {matchedNocs.map((noc: string, i: number) => (
                                            <Badge key={i} className="bg-amber-500 text-white border-none py-1 px-2.5 text-[10px] font-black rounded-lg">{noc}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Employers</p>
                                    <div className="flex flex-wrap gap-2">
                                        {targetEmployers.map((emp: string, i: number) => (
                                            <Badge key={i} variant="outline" className="bg-slate-900 text-white border-none py-1.5 px-3 text-[10px] font-bold rounded-lg">{emp}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Interaction History */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <History className="w-4 h-4 text-emerald-500" />
                                Interaction History
                            </h3>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {outreachLog.length > 0 ? outreachLog.map((entry: any, i: number) => (
                                    <Card key={i} className="border-none shadow-lg bg-white p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{entry.employer || 'System Event'}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-brand-600 uppercase tracking-tighter">{entry.type || 'Activity'}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold">{entry.timestamp ? format(new Date(entry.timestamp), 'MMM d, h:mm a') : 'Recent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{entry.notes}</p>
                                    </Card>
                                )) : <div className="py-8 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-slate-400 text-xs italic">No activity logged yet.</div>}
                            </div>
                        </div>

                        {/* Pipeline */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-indigo-500" />
                                Recruitment Pipeline
                            </h3>
                            <div className="space-y-3">
                                {applications.slice(0, 5).map((app: any) => (
                                    <Card key={app.id} className="border-none shadow-lg bg-white p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                                <Building2 className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-[12px] font-black text-slate-900 uppercase truncate pr-2">{app.job_title}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold truncate">{app.employer_name}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-brand-50 text-brand-700 border-none text-[9px] font-black uppercase px-2 py-1">{app.status}</Badge>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Eligibility Scores */}
                <div className="space-y-6 pt-12 border-t border-slate-200">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-brand-600" />
                        Eligibility Assessment Grid
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {scores.length > 0 ? scores.map((score: any) => (
                            <Card key={score.id} className="border-none shadow-lg bg-white p-5 space-y-4">
                                <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-2">{score.calculator_type.replace('-', ' ')}</span>
                                    <p className="text-3xl font-black text-slate-900">{score.score}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Verified Points</p>
                                </div>
                                <Badge className="bg-brand-50 text-brand-700 border-none text-[8px] font-black px-2 py-0.5 uppercase">POTENTIAL RANK</Badge>
                            </Card>
                        )) : <div className="col-span-full py-12 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 italic text-sm">Eligibility scorecard pending assessment.</div>}
                    </div>
                </div>
            </main>

            <footer className="mt-20 border-t border-slate-200 py-12 bg-white text-center">
                <ShieldCheck className="w-6 h-6 text-brand-600 mx-auto mb-6" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Managed by {agency.company_name} · Secure Candidate Report</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Badge variant="outline" className="text-[9px] font-black uppercase px-3 py-1">Confidential Information</Badge>
                    <Badge variant="outline" className="text-[9px] font-black uppercase px-3 py-1">JobMaze Verified</Badge>
                    <Badge variant="outline" className="text-[9px] font-black uppercase px-3 py-1">256-bit Secure</Badge>
                </div>
            </footer>

            <Dialog open={!!activeGap} onOpenChange={(open) => !open && setActiveGap(null)}>
                <DialogContent className="sm:max-w-[400px] rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Complete Your Profile</DialogTitle>
                        <DialogDescription className="text-sm font-medium">Adding your <b>{activeGap?.label}</b> helps us calculate your eligibility benchmarks more accurately.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{activeGap?.label}</Label>
                        {activeGap?.type === 'select' ? (
                            <Select value={gapValue} onValueChange={setGapValue}>
                                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50"><SelectValue placeholder={`Select ${activeGap.label}`} /></SelectTrigger>
                                <SelectContent className="rounded-xl">{activeGap.options?.map((opt: any) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                            </Select>
                        ) : (
                            <Input type={activeGap?.type} placeholder={activeGap?.placeholder} value={gapValue} onChange={(e) => setGapValue(e.target.value)} className="rounded-xl border-slate-100 bg-slate-50" />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setActiveGap(null)} className="font-bold text-slate-400">Cancel</Button>
                        <Button onClick={handleUpdateGap} disabled={isSaving || !gapValue} className="bg-brand-600 hover:bg-brand-500 text-white font-black uppercase tracking-widest text-xs px-8 shadow-lg shadow-brand-600/20">{isSaving ? "Updating..." : "Update Profile"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
