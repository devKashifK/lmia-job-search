'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Lock, Share2, Building2, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

    const handleSendEmail = async () => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <img src="/job_maze_favicon_.svg" alt="JobMaze" className="w-6 h-6 invert brightness-0" />
                </div>
                <div className="space-y-0.5">
                    <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">JobMaze Command Center</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Candidate Ecosystem & Access Control</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button
                    variant="outline"
                    onClick={() => window.open(`/report/${client.urn}`, '_blank')}
                    className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-gray-200 hover:bg-gray-50 transition-all font-bold"
                >
                    <Globe className="w-3.5 h-3.5 mr-2" />
                    Preview Portal
                </Button>

                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 h-9 gap-3">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Lock className="w-3 h-3 text-brand-600" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Access PIN</span>
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
                        className="w-12 h-6 p-0 border-none bg-transparent text-center text-xs font-black focus:ring-0 rounded text-brand-700"
                        placeholder="0000"
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={handleSharePitchDeck}
                    className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-brand-200 text-brand-700 hover:bg-brand-50 transition-all font-bold"
                >
                    <Share2 className="w-3.5 h-3.5 mr-2" />
                    Share Pitch Deck
                </Button>

                <Button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 transition-all font-bold disabled:opacity-70"
                >
                    {isSendingEmail ? (
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                        <Mail className="w-3.5 h-3.5 mr-2" />
                    )}
                    Send via Email
                </Button>

                {/* <Button 
                    onClick={handleSharePortal} 
                    className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 transition-all font-bold"
                >
                    <Share2 className="w-3.5 h-3.5 mr-2" />
                    Share Report
                </Button> */}
            </div>
        </motion.div>
    );
}
