'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Lock, Share2, Building2, Mail, Loader2, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Badge } from '@/components/ui/badge';
import { useAgencyStrategy } from '@/hooks/use-agency-clients';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/use-session';

interface StrategicCommandProps {
    client: any;
}

export function StrategicCommand({ client }: StrategicCommandProps) {
    const { strategy, updateStrategy } = useAgencyStrategy(client.urn);
    const { toast } = useToast();
    const { session } = useSession();
    const [accessPin, setAccessPin] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    
    // Outreach State
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    useEffect(() => {
        if (strategy) {
            setAccessPin(strategy.access_pin || '');

            // Auto-generate PIN if missing
            if (!strategy.access_pin) {
                const autoPin = Math.floor(1000 + Math.random() * 9000).toString();
                setAccessPin(autoPin);
                updateStrategy({ access_pin: autoPin });
            }
        }
    }, [strategy]);

    const handleSharePortal = () => {
        const portalUrl = `${window.location.protocol}//${window.location.host}/report/${client.urn}`;
        navigator.clipboard.writeText(portalUrl);
        toast({ title: "Portal Link Copied", description: "Standard client link is on your clipboard." });
    };

    const handleSharePitchDeck = () => {
        const pitchUrl = `${window.location.protocol}//${window.location.host}/pitch/${client.urn}`;
        navigator.clipboard.writeText(pitchUrl);
        toast({ title: "Pitch Deck Link Copied", description: "Blind employer link is on your clipboard." });
    };

    const handleSendPortalInvite = async () => {
        if (!client.email) {
            toast({
                title: "Email Missing",
                description: "This client does not have an email address associated with their profile.",
                variant: "destructive"
            });
            return;
        }

        setIsSendingEmail(true);
        try {
            const response = await fetch('/api/agency/send-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
                },
                body: JSON.stringify({ clientId: client.id, urn: client.urn })
            });

            const result = await response.json();
            if (result.success) {
                toast({
                    title: "Access Email Sent",
                    description: `Portal credentials successfully dispatched to ${client.email}`
                });
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
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <img src="/ll.png" alt="JobMaze" className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-gray-900 tracking-tight uppercase">Command Center</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Candidate Ecosystem & Access Control</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button
                    variant="outline"
                    onClick={() => window.open(`/report/${client.urn}`, '_blank')}
                    className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border-gray-200 hover:bg-gray-50 transition-all font-bold"
                >
                    <Globe className="w-3.5 h-3.5 mr-2" />
                    Preview Portal
                </Button>

                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 h-9 gap-3">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Lock className="w-3 h-3 text-brand-600" />
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Access PIN</span>
                    </div>
                    <InputOTP
                        maxLength={4}
                        value={accessPin}
                        onChange={(val) => {
                            setAccessPin(val);
                        }}
                        onBlur={() => {
                            if (accessPin.length === 4 && accessPin !== strategy?.access_pin) {
                                updateStrategy({ access_pin: accessPin });
                                toast({ title: "PIN Updated", description: `Security code set to ${accessPin}` });
                            }
                        }}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} className="w-6 h-6 p-0 border-none bg-transparent text-center text-xs font-bold text-brand-700" />
                            <InputOTPSlot index={1} className="w-6 h-6 p-0 border-none bg-transparent text-center text-xs font-bold text-brand-700" />
                            <InputOTPSlot index={2} className="w-6 h-6 p-0 border-none bg-transparent text-center text-xs font-bold text-brand-700" />
                            <InputOTPSlot index={3} className="w-6 h-6 p-0 border-none bg-transparent text-center text-xs font-bold text-brand-700" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border-brand-200 text-brand-700 hover:bg-brand-50 transition-all font-bold"
                        >
                            <Share2 className="w-3.5 h-3.5 mr-2" />
                            Share Pitch Deck
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-xl sm:rounded-xl border-gray-100 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight text-gray-900">
                                Share Candidate Deck
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-gray-500 leading-relaxed">
                                Share a blind, professional profile of **{client.full_name}** with potential employers.
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="link" className="mt-4">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-xl h-10">
                                <TabsTrigger value="link" className="rounded-xl text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Direct Link
                                </TabsTrigger>
                                <TabsTrigger value="email" className="rounded-xl text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    Send to Employer
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="link" className="space-y-4 pt-4">
                                <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest mb-1.5">Pitch Deck URL</p>
                                        <p className="text-xs font-bold text-gray-600 truncate opacity-60">
                                            {`${typeof window !== 'undefined' ? window.location.origin : ''}/pitch/${client.urn}`}
                                        </p>
                                    </div>
                                    <Button 
                                        size="sm"
                                        onClick={() => handleSharePitchDeck()}
                                        className="bg-white hover:bg-brand-50 text-brand-600 border border-brand-100 rounded-xl h-8 px-4 text-[10px] font-bold uppercase shadow-none"
                                    >
                                        Copy Link
                                    </Button>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium text-center">
                                     Employers will see a blind profile without personal contact info.
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
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Recipient Name (Optional)</Label>
                                        <Input 
                                            placeholder="Hiring Manager" 
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
                                    Send Pitch Deck
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>

                <Button
                    onClick={handleSendPortalInvite}
                    disabled={isSendingEmail}
                    className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 transition-all font-bold disabled:opacity-70"
                >
                    {isSendingEmail ? (
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                        <Mail className="w-3.5 h-3.5 mr-2" />
                    )}
                    Send Portal Access
                </Button>

                {/* <Button 
                    onClick={handleSharePortal} 
                    className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 transition-all font-bold"
                >
                    <Share2 className="w-3.5 h-3.5 mr-2" />
                    Share Report
                </Button> */}
            </div>
        </motion.div>
    );
}
