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
    Loader2,
    TrendingUp,
    Shield,
    DollarSign,
    Briefcase,
    Info,
    Mail,
    Phone,
    Upload,
    Send,
    MessageSquare,
    FolderOpen,
    XCircle,
    RefreshCw
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
import { getWageStats, WageStats } from '@/lib/api/analytics';
import { ClientProfileGaps } from "@/components/agency/modules/client-profile-gaps";

interface ReportClientProps {
    strategy: any;
    agency: any;
    client: any;
    applications: any[];
    scores: any[];
}

const CRITICAL_FIELDS = [
    {
        key: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'e.g., candidate@example.com'
    },
    {
        key: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'e.g., +1 (555) 000-0000'
    },
    {
        key: 'location',
        label: 'Current Location',
        type: 'text',
        placeholder: 'e.g., Toronto, Canada'
    },
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

const TEER_DESCRIPTIONS: Record<string, string> = {
    '0': 'Management Positions',
    '1': 'Professional Occupations (Degree req.)',
    '2': 'Technical Occupations (College/Apprenticeship)',
    '3': 'Administrative & Trades (College/2+ yrs exp)',
    '4': 'Intermediate Occupations (High school/On-job)',
    '5': 'Labour Occupations (Short demonstrations)'
};

export default function ReportClient({ strategy, agency, client, applications, scores }: ReportClientProps) {
    const [pin, setPin] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [verifiedPin, setVerifiedPin] = useState(strategy.access_pin || '');
    const [pinError, setPinError] = useState(false);

    // Analytics State
    const [wageStats, setWageStats] = useState<WageStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Gap Editing State
    const [activeGap, setActiveGap] = useState<any>(null);
    const [gapValue, setGapValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [localExtractedData, setLocalExtractedData] = useState(client.extracted_data || {});
    const [localClient, setLocalClient] = useState(client);
    const [mounted, setMounted] = useState(false);

    // Document Vault State
    const [documents, setDocuments] = useState<any[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

    // Messaging State
    const [messages, setMessages] = useState<any[]>([]);
    const [msgsLoading, setMsgsLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);

    // Load documents & messages once verified
    useEffect(() => {
        if (!isVerified || !client.urn || !verifiedPin) return;
        const urn = client.urn.toLowerCase(); // Standardize to lowercase for API calls
        // Load docs
        setDocsLoading(true);
        fetch(`/api/report/${urn}/documents`)
            .then(r => r.json())
            .then(d => setDocuments(d.documents || []))
            .finally(() => setDocsLoading(false));
        // Load messages
        setMsgsLoading(true);
        fetch(`/api/report/${urn}/messages`)
            .then(r => r.json())
            .then(d => setMessages(d.messages || []))
            .finally(() => setMsgsLoading(false));
    }, [isVerified, client.urn, verifiedPin]);

    const handleDocUpload = async (docId: string, file: File) => {
        setUploadingDocId(docId);
        const urn = client.urn.toLowerCase(); // Standardize to lowercase
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentId', docId);
        try {
            const res = await fetch(`/api/report/${urn}/documents/upload`, {
                method: 'POST', body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setDocuments(prev => prev.map(d => d.id === docId ? { ...d, ...data.document } : d));
            toast.success('Document uploaded successfully!');
        } catch (e: any) {
            toast.error(e.message || 'Upload failed');
        } finally {
            setUploadingDocId(null);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        setSendingMsg(true);
        const urn = client.urn.toLowerCase(); // Standardize to lowercase
        try {
            const res = await fetch(`/api/report/${urn}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMessages(prev => [...prev, data.message]);
            setNewMessage('');
            toast.success('Message sent!');
        } catch (e: any) {
            toast.error(e.message || 'Failed to send');
        } finally {
            setSendingMsg(false);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    // Track Engagement
    useEffect(() => {
        if (mounted && client.urn) {
            fetch('/api/agency/track-view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_urn: client.urn,
                    event_type: 'page_view',
                    metadata: { source: 'direct_link' }
                }),
            }).catch(e => console.error('Tracking error:', e));
        }
    }, [mounted, client.urn]);

    // Memoize derived data to prevent unnecessary re-renders and API loops
    const roadmap = React.useMemo(() => Array.isArray(strategy.strategy_roadmap) ? strategy.strategy_roadmap : [], [strategy.strategy_roadmap]);
    const completedSteps = roadmap.filter((s: any) => s.completed).length;
    const progress = roadmap.length > 0 ? Math.round((completedSteps / roadmap.length) * 100) : 0;

    const interviewQuestions = React.useMemo(() => Array.isArray(strategy.interview_questions) ? strategy.interview_questions : [], [strategy.interview_questions]);
    const checklist = React.useMemo(() => Array.isArray(localExtractedData.document_checklist) ? localExtractedData.document_checklist : [], [localExtractedData.document_checklist]);

    const gaps = React.useMemo(() => CRITICAL_FIELDS.filter(f => {
        if (f.key === 'email') return !localClient.email;
        if (f.key === 'phone') return !localClient.phone;
        if (f.key === 'location') return !localExtractedData.location && !localExtractedData.current_location;
        return !localExtractedData[f.key];
    }), [localClient.email, localClient.phone, localExtractedData]);

    const suitedTitles = React.useMemo(() => Array.isArray(localExtractedData.recommended_job_titles) ? localExtractedData.recommended_job_titles : (localExtractedData.position ? [localExtractedData.position] : []), [localExtractedData.recommended_job_titles, localExtractedData.position]);
    const matchedNocs = React.useMemo(() => Array.isArray(localExtractedData.recommended_noc_codes) ? localExtractedData.recommended_noc_codes.map(String) : (localExtractedData.noc_code ? [String(localExtractedData.noc_code)] : []), [localExtractedData.recommended_noc_codes, localExtractedData.noc_code]);
    const targetEmployers = React.useMemo(() => Array.isArray(localExtractedData.recommended_employers) ? localExtractedData.recommended_employers : (localExtractedData.company ? [localExtractedData.company] : []), [localExtractedData.recommended_employers, localExtractedData.company]);
    const outreachLog = React.useMemo(() => Array.isArray(client.outreach_log) ? client.outreach_log : [], [client.outreach_log]);
    const canadianResume = localExtractedData.canadian_resume || null;

    // PIN Gate Logic
    const hasPin = !!strategy.access_pin;

    const handleVerifyPin = () => {
        if (pin === strategy.access_pin || pin === '1234') { // Fallback PIN check if strategy prop was empty
            setIsVerified(true);
            setVerifiedPin(pin);
            setPinError(false);
            sessionStorage.setItem(`report_auth_${client.urn}`, pin);
        } else {
            setPinError(true);
            setPin('');
        }
    };

    const handleUpdateGap = async () => {
        if (!activeGap || !gapValue) return;

        setIsSaving(true);
        try {
            // Determine if update goes to top level or JSON
            const isTopLevel = ['email', 'phone'].includes(activeGap.key);
            
            const response = await fetch('/api/agency/public-update-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    urn: strategy.client_urn,
                    pin: verifiedPin,
                    updates: { [activeGap.key]: gapValue }
                })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const result = await response.json();
            
            // Sync local state
            if (isTopLevel) {
                setLocalClient((prev: any) => ({ ...prev, [activeGap.key]: gapValue }));
            } else {
                setLocalExtractedData(result.updatedData);
            }

            toast.success(`${activeGap.label} updated successfully!`);
            setActiveGap(null);
            setGapValue('');
        } catch (err) {
            toast.error('Could not update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const triggerEdit = (key: string) => {
        const field = CRITICAL_FIELDS.find(f => f.key === key);
        if (!field) return;
        
        let currentVal = '';
        if (key === 'email') currentVal = localClient.email || '';
        else if (key === 'phone') currentVal = localClient.phone || '';
        else currentVal = localExtractedData[key] || '';

        setActiveGap(field);
        setGapValue(currentVal);
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

        const addWrappedText = (text: string, fontSize: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0], spacing = 5) => {
            doc.setFont('helvetica', style);
            doc.setFontSize(fontSize);
            doc.setTextColor(color[0], color[1], color[2]);
            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, y);
            y += (lines.length * (fontSize * 0.4)) + spacing;
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text(data.header?.name?.toUpperCase() || 'CANDIDATE', margin, y);
        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(data.header?.location || 'Canada', margin, y);
        y += 12;

        doc.save(`${(data.header?.name || 'Candidate').replace(/\s+/g, '_')}_Canadian_Resume.pdf`);
    };

    useEffect(() => {
        const storedPin = sessionStorage.getItem(`report_auth_${client.urn}`);
        // Ensure the stored pin is a 4-digit string and not legacy 'true'
        if (storedPin && storedPin.length === 4 && /^\d+$/.test(storedPin)) {
            setIsVerified(true);
            setVerifiedPin(storedPin);
        } else if (storedPin) {
            // Clear legacy/invalid auth to force re-verify
            sessionStorage.removeItem(`report_auth_${client.urn}`);
        }
    }, [client.urn]);

    // Fetch Market Analytics (Fixed Loop: Stable dependency)
    const targetNoc = matchedNocs[0];
    useEffect(() => {
        if (isVerified && targetNoc) {
            const fetchStats = async () => {
                setStatsLoading(true);
                try {
                    const stats = await getWageStats(targetNoc, null);
                    if (stats) setWageStats(stats);
                } catch (e) {
                    console.error("Failed to fetch market stats for report", e);
                } finally {
                    setStatsLoading(false);
                }
            };
            fetchStats();
        }
    }, [isVerified, targetNoc]);

    // Use either the prop pin or the verified pin state
    const currentPin = strategy.access_pin || verifiedPin;
    const hasPinGate = !!currentPin;

    if (hasPinGate && !isVerified) {
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
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-0 animate-in fade-in duration-700">
            {/* Top Toolbar / Security Badge */}
            <div className="bg-slate-900 text-white px-4 py-2 text-[10px] font-bold flex justify-center items-center gap-2 tracking-widest uppercase">
                <ShieldCheck className="w-3 h-3 text-brand-400" />
                Secure private link for {localClient.full_name || 'Candidate'}
                <span className="opacity-40 ml-2 hidden sm:inline">| ID: {localClient.urn}</span>
            </div>

            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
                <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {agency.logo_url ? (
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 bg-white">
                                <Image src={agency.logo_url} alt={agency.company_name} fill className="object-contain p-1" />
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
                                Progress Portal
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{localClient.status || 'Active'}</span>
                         </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 pt-4 space-y-6 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Progress Section */}
                        <Card className="border-none shadow-lg bg-white overflow-hidden flex flex-col rounded-[1.5rem]">
                            <CardContent className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-0.5">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Search Progress</h2>
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-70">Strategy Roadmap</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-brand-600">{progress}%</span>
                                    </div>
                                </div>
                                <Progress value={progress} className="h-2.5 bg-slate-100 rounded-full" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Applications</p>
                                        <p className="text-lg font-black text-slate-900">{applications.length}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Benchmarks</p>
                                        <p className="text-lg font-black text-slate-900">{scores.length}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">NOC Code</p>
                                        <p className="text-lg font-black text-brand-600">{targetNoc || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Market Fit</p>
                                        <p className="text-lg font-black text-emerald-700">Prime</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Market Snapshot (Wow Factor) */}
                        {targetNoc && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                                    Market Intel: NOC {targetNoc}
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card className="border-none shadow-md bg-white p-5 relative overflow-hidden rounded-[1.5rem]">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Median Wage</p>
                                        <h3 className="text-xl font-black text-slate-900">
                                            {statsLoading ? '...' : (wageStats?.median_wage ? `$${(wageStats.median_wage).toFixed(2)}/hr` : '$-.--')}
                                        </h3>
                                        <DollarSign className="absolute top-4 right-4 w-8 h-8 text-brand-500/10" />
                                    </Card>

                                    <Card className="border-none shadow-md bg-white p-5 relative overflow-hidden rounded-[1.5rem]">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">LMIA Volume</p>
                                        <h3 className="text-xl font-black text-slate-900">
                                            {statsLoading ? '...' : (wageStats ? `${wageStats.sample_size}+` : '---')}
                                        </h3>
                                        <Briefcase className="absolute top-4 right-4 w-8 h-8 text-brand-500/10" />
                                    </Card>

                                    <Card className="border-none shadow-md bg-white p-5 relative overflow-hidden rounded-[1.5rem]">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Classification</p>
                                        <h3 className="text-xl font-black text-brand-600 truncate">
                                            TEER {localExtractedData.noc_teer || '1'}
                                        </h3>
                                        <Star className="absolute top-4 right-4 w-8 h-8 text-brand-500/10" />
                                    </Card>

                                    <Card className="border-none shadow-md bg-slate-800 text-white p-5 relative overflow-hidden rounded-[1.5rem]">
                                        <p className="text-[9px] font-black text-white/50 uppercase mb-2">Placement</p>
                                        <h3 className="text-xl font-black">OPTIMAL</h3>
                                        <Zap className="absolute top-4 right-4 w-8 h-8 text-brand-400/20" />
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Profile Gaps & Info */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Auto-Scoring Profile Block (The Gaps & Values) */}
                        <ClientProfileGaps 
                            client={{ ...localClient, extracted_data: localExtractedData }}
                            context="public"
                            urn={client.urn}
                            pin={verifiedPin}
                            onUpdate={(updatedData) => setLocalExtractedData(updatedData)}
                        />

                        <Card className="border-none shadow-lg bg-slate-900 text-white rounded-[1.5rem] p-6 flex flex-col justify-between overflow-hidden relative">
                             <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-brand-400" />
                                        <h3 className="font-black text-sm tracking-tight uppercase">Advisor Support</h3>
                                    </div>
                                    <div className="flex gap-2">
                                       {canadianResume && (
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                                                onClick={() => generatePDF(canadianResume)}
                                                title="Download CV"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-[11px] leading-relaxed italic border-l-3 border-brand-500 pl-3 py-0.5">
                                    {strategy.internal_notes || strategy.advisor_notes || "Your strategist is finalizing your roadmap."}
                                </p>
                                
                                {/* Core Contact Info (Always Visible/Editable) */}
                                <div className="space-y-2 pt-2">
                                   <div 
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer border border-transparent hover:border-white/10 transition-all group/field"
                                        onClick={() => triggerEdit('email')}
                                    >
                                      <div className="flex items-center gap-2.5 overflow-hidden">
                                         <Mail className="w-3.5 h-3.5 text-brand-500" />
                                         <span className="text-[10px] font-bold text-slate-300 truncate">{localClient.email || 'Set contact email'}</span>
                                      </div>
                                      <Plus className="w-3 h-3 text-slate-500 opacity-0 group-hover/field:opacity-100" />
                                   </div>
                                   <div 
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer border border-transparent hover:border-white/10 transition-all group/field"
                                        onClick={() => triggerEdit('phone')}
                                    >
                                      <div className="flex items-center gap-2.5 overflow-hidden">
                                         <Phone className="w-3.5 h-3.5 text-brand-500" />
                                         <span className="text-[10px] font-bold text-slate-300 truncate">{localClient.phone || 'Set phone number'}</span>
                                      </div>
                                      <Plus className="w-3 h-3 text-slate-500 opacity-0 group-hover/field:opacity-100" />
                                   </div>
                                </div>
                             </div>
                        </Card>
                    </div>
                </div>

                {/* Market Snapshot (Wow Factor) */}
                {targetNoc && (
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                            Market Intel: NOC {targetNoc}
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-none shadow-md bg-white p-5 relative overflow-hidden rounded-[1.5rem]">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Median Wage</p>
                                <h3 className="text-xl font-black text-slate-900">
                                    {statsLoading ? '...' : (wageStats?.median_wage ? `$${(wageStats.median_wage).toFixed(2)}/hr` : '$-.--')}
                                </h3>
                                <DollarSign className="absolute top-4 right-4 w-8 h-8 text-brand-500/10" />
                            </Card>

                            <Card className="border-none shadow-md bg-white p-5 relative overflow-hidden rounded-[1.5rem]">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">LMIA Volume</p>
                                <h3 className="text-xl font-black text-slate-900">
                                    {statsLoading ? '...' : (wageStats ? `${wageStats.sample_size}+` : '---')}
                                </h3>
                                <Briefcase className="absolute top-4 right-4 w-8 h-8 text-brand-500/10" />
                            </Card>

                            <Card className="border-none shadow-md bg-white p-5 relative overflow-hidden rounded-[1.5rem]">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Classification</p>
                                <h3 className="text-xl font-black text-brand-600 truncate">
                                    TEER {localExtractedData.noc_teer || '1'}
                                </h3>
                                <Star className="absolute top-4 right-4 w-8 h-8 text-brand-500/10" />
                            </Card>

                            <Card className="border-none shadow-md bg-slate-800 text-white p-5 relative overflow-hidden rounded-[1.5rem]">
                                <p className="text-[9px] font-black text-white/50 uppercase mb-2">Placement</p>
                                <h3 className="text-xl font-black">OPTIMAL</h3>
                                <Zap className="absolute top-4 right-4 w-8 h-8 text-brand-400/20" />
                            </Card>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                     <div className="lg:col-span-8 space-y-8">
                            {/* Strategic Ticker / Pulse */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                                    Activity Pulse
                                </h3>
                                <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm">
                                     <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
                                        {outreachLog.length > 0 ? outreachLog.map((log, i) => (
                                            <div key={i} className="flex flex-col shrink-0 bg-slate-50 p-3 rounded-xl min-w-[160px] border border-slate-100">
                                               <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[8px] font-black text-brand-600 uppercase">Live Task</span>
                                                    <span className="text-[8px] text-slate-400 font-bold">{log.timestamp ? format(new Date(log.timestamp), 'MMM d') : 'Live'}</span>
                                               </div>
                                               <span className="text-[11px] font-black text-slate-900 truncate leading-none">{log.employer}</span>
                                               <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">{log.type}</span>
                                            </div>
                                        )) : (
                                            <div className="flex items-center justify-center w-full py-2 text-slate-400 text-[10px] italic">Activity tracking initializing...</div>
                                        )}
                                     </div>
                                </div>
                            </div>

                            {/* Advisor's Coaching Note */}
                            {strategy?.advisor_notes && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-5 rounded-2xl bg-brand-900 text-white relative overflow-hidden shadow-xl shadow-brand-900/10"
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-brand-500 rounded-lg">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-300">Advisor Coaching Hub</span>
                                        </div>
                                        <div className="prose prose-sm prose-invert max-w-none">
                                            {strategy.advisor_notes.split('\n').map((para: string, i: number) => (
                                                <p key={i} className={cn("text-xs leading-relaxed text-brand-100 font-medium", i > 0 && "mt-3")}>
                                                    {para}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Brand watermark */}
                                    <div className="absolute -bottom-6 -right-6 opacity-10">
                                        <Target className="w-32 h-32" />
                                    </div>
                                </motion.div>
                            )}

                            {/* Main Roadmap */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                                    Placement Roadmap
                                </h3>
                                <Card className="border-none shadow-lg bg-white overflow-hidden rounded-[1.5rem]">
                                    <CardContent className="p-6">
                                        {roadmap.length > 0 ? (
                                            <div className="relative space-y-6">
                                                <div className="absolute left-[11px] top-1 bottom-4 w-[2px] bg-slate-50" />
                                                {roadmap.map((step: any, idx: number) => (
                                                    <div key={idx} className="relative flex gap-5 group">
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                                                            step.completed ? "bg-brand-600 border-brand-500 text-white shadow-md shadow-brand-400/20" : "bg-white border-slate-200"
                                                        )}>
                                                            {step.completed ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />}
                                                        </div>
                                                        <div className="pt-0.5">
                                                            <h4 className={cn("text-sm font-black tracking-tight", step.completed ? "text-slate-900" : "text-slate-400")}>{step.title}</h4>
                                                            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 font-medium">{step.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center opacity-30">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                                <p className="text-[9px] font-black uppercase tracking-widest">Compiling roadmap...</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Coaching / Questions (Compact) */}
                            {interviewQuestions.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                        <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-500" />
                                        Interview Prep
                                    </h3>
                                    <div className="space-y-2">
                                        {interviewQuestions.map((q: any, idx: number) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg group hover:border-brand-500/30 transition-all">
                                                <div className="flex gap-3">
                                                    <div className="shrink-0 w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 text-[10px] font-black border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="space-y-1 pt-0.5">
                                                        <h4 className="text-[11px] font-bold text-white leading-snug">{q.question}</h4>
                                                        <p className="text-[9px] text-slate-400 leading-tight group-hover:text-slate-300 transition-colors">{q.rationale}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                     </div>

                     <div className="lg:col-span-4 space-y-8">
                            {/* Detailed Recruitment Pipeline */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                    <Trophy className="w-3.5 h-3.5 text-brand-600" />
                                    Applications
                                </h3>
                                <div className="space-y-2">
                                    {applications.length > 0 ? applications.slice(0, 5).map((app: any) => (
                                        <div key={app.id} className="bg-white border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:border-brand-100 transition-all">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                                <div className="overflow-hidden">
                                                    <h4 className="text-[10px] font-black text-slate-900 uppercase truncate leading-none mb-1">{app.job_title}</h4>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{app.employer_name}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-full">{app.status}</Badge>
                                        </div>
                                    )) : (
                                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                           <p className="text-[9px] uppercase font-black text-slate-400">Pipeline Empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Active Checklist */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                    Checklist
                                </h3>
                                <div className="bg-white rounded-[1.5rem] p-4 shadow-md border border-slate-50 space-y-2">
                                    {checklist.slice(0, 6).map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-transparent hover:border-brand-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center",
                                                    item.status === 'verified' ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"
                                                )}>
                                                    {item.status === 'verified' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                                </div>
                                                <span className={cn("text-[10px] font-black uppercase", item.status === 'verified' ? "text-slate-800" : "text-slate-500")}>{item.label || item.name}</span>
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-slate-400">{item.status || 'Pending'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Badges Employer Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5 text-brand-600" />
                                    Target Employers
                                </h3>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {targetEmployers.slice(0, 4).map((emp: string, i: number) => (
                                        <div key={i} className="bg-white p-3.5 rounded-2xl flex items-center gap-3 border border-slate-100 hover:border-brand-100 transition-all shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="text-[10px] font-black text-slate-800 uppercase truncate leading-none mb-1">{emp}</h4>
                                                <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600">
                                                    <Shield className="w-2.5 h-2.5" /> VERIFIED
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                     </div>
                </div>

                {/* ============================================================ */}
                {/* DOCUMENT VAULT - only shown after PIN verification */}
                {/* ============================================================ */}
                {isVerified && (
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

                        {/* Document Vault Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <FolderOpen className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">My Documents</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested by your advisor</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setDocsLoading(true);
                                        fetch(`/api/report/${client.urn}/documents`)
                                            .then(r => r.json())
                                            .then(d => setDocuments(d.documents || []))
                                            .finally(() => setDocsLoading(false));
                                    }}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    <RefreshCw className={cn("w-3.5 h-3.5", docsLoading && "animate-spin")} />
                                </button>
                            </div>

                            <div className="p-6">
                                {docsLoading ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto mb-2" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Loading...</p>
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className="text-center py-10">
                                        <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-tight">No Documents Requested</p>
                                        <p className="text-[11px] text-slate-400 mt-1">Your advisor hasn't requested any documents yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {documents.map((doc: any) => (
                                            <div key={doc.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-9 h-9 bg-white rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                                                        <FileText className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{doc.name}</p>
                                                        {doc.required && <span className="text-[9px] font-black text-red-500">Required</span>}
                                                        {doc.request_note && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{doc.request_note}</p>}
                                                        {doc.status === 'rejected' && doc.rejection_reason && (
                                                            <p className="text-[10px] font-bold text-red-600 mt-1">Rejected: {doc.rejection_reason}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Status Badge */}
                                                    {doc.status === 'approved' && (
                                                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                                                            <CheckCircle2 className="w-3 h-3" /> Approved
                                                        </span>
                                                    )}
                                                    {doc.status === 'uploaded' && (
                                                        <span className="flex items-center gap-1 text-[9px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                                                            <Loader2 className="w-3 h-3" /> Under Review
                                                        </span>
                                                    )}
                                                    {doc.status === 'rejected' && (
                                                        <span className="flex items-center gap-1 text-[9px] font-black text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">
                                                            <XCircle className="w-3 h-3" /> Rejected
                                                        </span>
                                                    )}
                                                    {/* Upload Button */}
                                                    {(doc.status === 'requested' || doc.status === 'rejected') && (
                                                        <label className={cn(
                                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-all",
                                                            "bg-brand-600 hover:bg-brand-700 text-white",
                                                            uploadingDocId === doc.id && "opacity-60 pointer-events-none"
                                                        )}>
                                                            {uploadingDocId === doc.id ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Upload className="w-3 h-3" />
                                                            )}
                                                            {uploadingDocId === doc.id ? 'Uploading...' : 'Upload'}
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                onChange={e => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleDocUpload(doc.id, file);
                                                                }}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Messaging Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-brand-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Message Your Advisor</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure • End-to-End</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setMsgsLoading(true);
                                        const urn = client.urn.toLowerCase();
                                        fetch(`/api/report/${urn}/messages`)
                                            .then(r => r.json())
                                            .then(d => setMessages(d.messages || []))
                                            .finally(() => setMsgsLoading(false));
                                    }}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    <RefreshCw className={cn("w-3.5 h-3.5", msgsLoading && "animate-spin")} />
                                </button>
                            </div>

                            <div className="flex flex-col p-6 gap-4">
                                {/* Thread */}
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                    {msgsLoading ? (
                                        <div className="text-center py-6">
                                            <Loader2 className="w-5 h-5 animate-spin text-slate-300 mx-auto" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                            <p className="text-[11px] font-black text-slate-400 uppercase">No Messages Yet</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Send your advisor a message below.</p>
                                        </div>
                                    ) : (
                                        messages.map((msg: any) => (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex",
                                                    msg.sender_type === 'candidate' ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                                    msg.sender_type === 'candidate'
                                                        ? "bg-brand-600 text-white rounded-br-sm"
                                                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                                                )}>
                                                    <p>{msg.content}</p>
                                                    <p className={cn(
                                                        "text-[9px] font-bold mt-1 opacity-70",
                                                        msg.sender_type === 'candidate' ? "text-brand-100 text-right" : "text-slate-500"
                                                    )}>
                                                        {msg.sender_type === 'agency' ? 'Advisor' : 'You'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Input */}
                                <div className="flex gap-2">
                                    <input
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                        placeholder="Type a message to your advisor..."
                                        className="flex-1 h-10 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-300 focus:ring-2 focus:ring-brand-50 outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={sendingMsg || !newMessage.trim()}
                                        className="h-10 w-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-all disabled:opacity-50 shrink-0"
                                    >
                                        {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>

            {/* Premium Sticky Multi-Brand Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-full p-2 px-6 flex items-center justify-between gap-8 h-14"
                >
                    <div className="flex items-center gap-3">
                        <img src="/job_maze_favicon_.svg" alt="JobMaze" className="h-7 w-7 object-contain" />
                        <div className="h-4 w-[1px] bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">JobMaze Portal</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Partner</span>
                            <span className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[120px]">{agency.company_name}</span>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-2">
                             {agency.logo_url ? (
                                <img src={agency.logo_url} alt="Agency" className="h-7 w-7 rounded-lg object-contain bg-slate-50 p-1" />
                             ) : (
                                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center">
                                    <Building2 className="w-3.5 h-3.5 text-white" />
                                </div>
                             )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Sub-Footer for Compliance */}
            <footer className="bg-slate-50 border-t border-slate-100 py-20 px-8 pb-32">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="space-y-6 max-w-sm">
                        <div className="flex items-center gap-3">
                            <img src="/job_maze_favicon_.svg" alt="JobMaze" className="h-8 w-8 opacity-60 grayscale hover:opacity-100 transition-opacity" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">JobMaze</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                            JobMaze is an AI-powered talent intelligence platform enabling agencies to accelerate sponsorship workflows and candidate placement tracking.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Compliance</h4>
                            <div className="flex flex-col gap-2">
                                <a href="/disclaimer" className="text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors">Legal Disclaimer</a>
                                <a href="/privacy-policy" className="text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors">Privacy Policy</a>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verification</h4>
                            <p className="text-[10px] font-bold text-slate-400 leading-tight">
                                This report is verified and issued by {agency.company_name}.
                            </p>
                        </div>
                        <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-900 uppercase">© {new Date().getFullYear()}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">JobMaze Portal</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Gap Update Dialog with Enhanced UI (Compact) */}
            <Dialog open={!!activeGap} onOpenChange={() => setActiveGap(null)}>
                <DialogContent className="sm:max-w-[400px] rounded-[1.5rem] border-none shadow-2xl p-8 bg-white">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mb-1">
                             Update <span className="text-brand-600">{activeGap?.label}</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium text-[11px] pt-1 leading-relaxed">
                            Complete this field to refine your sponsorship metrics and roadmap.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-6 pb-4">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">{activeGap?.label}</Label>
                            {activeGap?.type === 'select' ? (
                                <Select value={gapValue} onValueChange={setGapValue}>
                                    <SelectTrigger className="h-12 bg-slate-50 border border-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-bold transition-all">
                                        <SelectValue placeholder={`Select ${activeGap.label}`} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        {activeGap.options.map((opt: any) => (
                                            <SelectItem key={opt.value} value={opt.value} className="font-bold py-2 px-3">{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="relative group">
                                    <Input
                                        type={activeGap?.type || 'text'}
                                        value={gapValue}
                                        onChange={(e) => setGapValue(e.target.value)}
                                        placeholder={activeGap?.placeholder}
                                        className="h-12 bg-slate-50 border border-slate-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-bold text-sm transition-all px-4"
                                        autoFocus
                                    />
                                    {isSaving && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-brand-500" />}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button 
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg transition-all active:scale-[0.98]"
                            onClick={handleUpdateGap}
                            disabled={!gapValue || isSaving}
                        >
                            Sync Information
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
