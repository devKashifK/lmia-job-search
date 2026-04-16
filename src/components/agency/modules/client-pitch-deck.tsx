'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText,
    Download,
    Share2,
    ShieldCheck,
    Trophy,
    BadgeCheck,
    Briefcase,
    Globe,
    ExternalLink,
    Mail,
    Loader2,
    Link as LinkIcon
} from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/use-session';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { calculateCandidateScore } from '@/lib/utils/scoring_utils';

interface ClientPitchDeckProps {
    client: any;
}

export function ClientPitchDeck({ client }: ClientPitchDeckProps) {
    const data = client?.extracted_data || {};
    const score = calculateCandidateScore(data);

    const { toast } = useToast();
    const { session } = useSession();
    const [isSendingEmail, setIsSendingEmail] = React.useState(false);
    const [recipientEmail, setRecipientEmail] = React.useState('');
    const [recipientName, setRecipientName] = React.useState('');
    const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleSharePitchDeck = () => {
        const pitchUrl = `${window.location.protocol}//${window.location.host}/pitch/${client.urn}`;
        navigator.clipboard.writeText(pitchUrl);
        toast({ title: "Pitch Deck Link Copied", description: "Blind employer link is on your clipboard." });
    };

    const handleSendOutreach = async () => {
        if (!recipientEmail) {
            toast({ title: "Email Required", description: "Please enter the employer's email address.", variant: "destructive" });
            return;
        }

        setIsSendingEmail(true);
        try {
            const response = await fetch('/api/agency/send-pitch-deck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
                },
                body: JSON.stringify({ 
                    clientId: client.id, 
                    urn: client.urn,
                    recipientEmail,
                    recipientName 
                })
            });

            const result = await response.json();
            if (result.success) {
                toast({
                    title: "Pitch Deck Shared",
                    description: `Professional introduction sent to ${recipientEmail}`
                });
                setIsShareDialogOpen(false);
                setRecipientEmail('');
                setRecipientName('');
            } else {
                throw new Error(result.error || "Failed to send email");
            }
        } catch (error: any) {
            toast({
                title: "Dispatch Error",
                description: error.message || "An unexpected error occurred while sending the email.",
                variant: "destructive"
            });
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employer Marketing Toolkit</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Anonymized profile for professional outreach.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="h-9 rounded-xl border-gray-200 text-[10px] font-bold gap-2 px-4 shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Save PDF
                    </Button>
                    
                    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                className="h-9 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold gap-2 px-4 shadow-lg shadow-brand-500/20"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                Share Deck
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-xl border-gray-100 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold tracking-tight text-gray-900">
                                    Share Candidate Deck
                                </DialogTitle>
                                <DialogDescription className="text-xs font-medium text-gray-500 leading-relaxed">
                                    Direct share with potential employers. Link is blind and anonymized.
                                </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="link" className="mt-4">
                                <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-xl h-10">
                                    <TabsTrigger value="link" className="rounded-xl text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                        Copy Link
                                    </TabsTrigger>
                                    <TabsTrigger value="email" className="rounded-xl text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                        Send Email
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="link" className="space-y-4 pt-4">
                                    <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest mb-1.5">Direct Pitch URL</p>
                                            <p className="text-xs font-bold text-gray-600 truncate opacity-60">
                                                {`${typeof window !== 'undefined' ? window.location.origin : ''}/pitch/${client.urn}`}
                                            </p>
                                        </div>
                                        <Button 
                                            size="sm"
                                            onClick={handleSharePitchDeck}
                                            className="bg-white hover:bg-brand-50 text-brand-600 border border-brand-100 rounded-xl h-8 px-4 text-[10px] font-bold uppercase shadow-none"
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium text-center italic">
                                         * Employers see a blind profile. Privacy protected.
                                    </p>
                                </TabsContent>

                                <TabsContent value="email" className="space-y-4 pt-4">
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Recipient Email</Label>
                                            <Input 
                                                placeholder="recruiter@employer.com" 
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                className="h-10 rounded-xl border-gray-100 focus:border-brand-500 bg-gray-50/50 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Company Name</Label>
                                            <Input 
                                                placeholder="Target Hiring Company" 
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                                className="h-10 rounded-xl border-gray-100 focus:border-brand-500 bg-gray-50/50 text-sm font-bold"
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-500/20 disabled:opacity-70 transition-all font-bold"
                                        onClick={handleSendOutreach}
                                        disabled={isSendingEmail}
                                    >
                                        {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                                        Dispatch Profile
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* The Pitch Deck One-Pager (Printable Area) */}
            <div className="printable-area bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden print:shadow-none print:border-none p-6 md:p-8 relative print:m-0 print:p-8 print:w-full">
                {/* Branding Watermark */}
                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-20 print:opacity-100">
                    <Globe className="w-3 h-3 text-brand-600" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-brand-900 border-l border-brand-200 pl-2">JobMaze Verified</span>
                </div>

                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-50 pb-6 print:flex-row print:items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Badge 
                                    className="bg-brand-600 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-xl border-none shadow-sm print:bg-brand-600 print:text-white"
                                >
                                    Candidate #{client.urn?.split('-')[1] || 'JM1024'}
                                </Badge>
                                <span className="text-gray-300 text-xs">|</span>
                                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">{data.location || 'Based in Canada'}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tighter leading-none">
                                {data.position || 'Senior Professional'}
                            </h1>
                            <p className="text-xs text-brand-600 font-bold max-w-xl leading-relaxed">
                                Expert in {Array.isArray(data.skills) ? data.skills.slice(0, 3).join(', ') : 'strategic operations'} with {data.experience || 0}+ years of international experience.
                            </p>
                        </div>

                        <div className="shrink-0 flex flex-col items-center p-4 bg-brand-50 rounded-xl border border-brand-100/50 print:bg-brand-50 print:border-brand-100">
                            <div className="text-2xl font-bold text-brand-900 tracking-tighter leading-none">{score}%</div>
                            <div className="text-[7px] font-bold text-brand-600 uppercase tracking-widest mt-1">Readiness Score</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-3">
                        {/* Summary Column */}
                        <div className="md:col-span-2 space-y-6 print:col-span-2">
                            <section className="space-y-2">
                                <h2 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-brand-500" />
                                    Executive Summary
                                </h2>
                                <p className="text-gray-600 text-[11px] leading-relaxed font-medium">
                                    "{data.bio || 'Highly qualified professional with a strong track record of success in their field.'}"
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Trophy className="w-3 h-3 text-brand-500" />
                                    Competitive Edge
                                </h2>
                                <div className="grid grid-cols-2 gap-3 print:grid-cols-2">
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 print:bg-gray-50">
                                        <BadgeCheck className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-[8px] font-bold text-gray-900 uppercase">Status</p>
                                            <p className="text-[10px] text-gray-500 font-bold">LMIA Ready</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 print:bg-gray-50">
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-[8px] font-bold text-gray-900 uppercase">Mobility</p>
                                            <p className="text-[10px] text-gray-500 font-bold">Open Access</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Specs Column */}
                        <div className="space-y-6">
                            <section className="space-y-3">
                                <h2 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Verified Skills</h2>
                                <div className="flex flex-wrap gap-1.5">
                                    {(typeof data.skills === 'string' ? data.skills.split(',') : (Array.isArray(data.skills) ? data.skills : [])).slice(0, 8).map((skill: string, i: number) => (
                                        <Badge 
                                            key={i} 
                                            variant="secondary"
                                            className="px-2 py-1 bg-brand-50 text-brand-700 text-[9px] font-bold rounded-xl border border-brand-100 shadow-none hover:bg-brand-100 transition-colors print:bg-brand-50 print:border-brand-100"
                                        >
                                            {skill.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">NOC Compliance</h2>
                                <div className="p-4 bg-gray-900 rounded-xl text-white space-y-2 print:bg-gray-900 print:text-white">
                                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Target Code</p>
                                    <div className="flex items-end justify-between">
                                        <span className="text-xl font-bold tracking-tighter leading-none">{data.noc_code || 'NOC 1121'}</span>
                                        <Badge className="bg-brand-400/20 text-brand-400 border-none text-[8px] font-bold uppercase px-1.5 py-0 rounded-xl">Verified</Badge>
                                    </div>
                                    <div className="w-full h-0.5 bg-white/10 rounded-xl overflow-hidden">
                                        <div className="h-full w-full bg-brand-500" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Footer / Protection */}
                    <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 print:flex-row print:justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                            <ShieldCheck className="w-4 h-4" />
                            <p className="text-[8px] font-bold uppercase tracking-widest leading-none">Restricted Commercial Client Profile</p>
                        </div>
                        <p className="text-[9px] font-bold text-brand-900 uppercase tracking-tighter opacity-10">ID: {client.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* Print Styling */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible !important;
                    }
                    .printable-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 40px !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    /* Ensure background colors print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
