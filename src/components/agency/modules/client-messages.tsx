'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Loader2, User, Building2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface Message {
    id: string;
    sender_type: 'agency' | 'candidate';
    content: string;
    created_at: string;
    read_at: string | null;
}

interface ClientMessagesProps {
    clientUrn: string;
    clientName: string;
    agencyName: string;
}

export function ClientMessages({ clientUrn, clientName, agencyName }: ClientMessagesProps) {
    const { session } = useSession();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['agency-messages', clientUrn],
        queryFn: async () => {
            const res = await fetch(`/api/agency/messages/${clientUrn}`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            const json = await res.json();
            return json.messages as Message[];
        },
        enabled: !!clientUrn && !!session,
        refetchInterval: 10000, 
    });

    const sendMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/agency/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ clientUrn, content: newMessage }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['agency-messages', clientUrn] });
        },
        onError: (e: any) => toast({ title: 'Failed to send', description: e.message, variant: 'destructive' })
    });

    const messages = data || [];
    const unreadCount = messages.filter(m => m.sender_type === 'candidate' && !m.read_at).length;

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && newMessage.trim()) {
            sendMutation.mutate();
        }
    };

    return (
        <div className="flex flex-col h-[460px] bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden font-medium">
            {/* Header */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center border border-brand-100/50 shadow-sm relative">
                        <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-none mb-0.5">Secure Thread</h3>
                        <div className="flex items-center gap-2">
                             <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{messages.length} Total</p>
                            {unreadCount > 0 && (
                                <span className="bg-brand-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse whitespace-nowrap">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['agency-messages', clientUrn] })}
                    className="p-1 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-brand-600 transition-all"
                >
                    <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                </button>
            </div>

            {/* Thread Area */}
            <div className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed p-3 space-y-2.5 scrollbar-none">
                {isLoading && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-300" />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Syncing...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-[200px] mx-auto opacity-50">
                        <MessageSquare className="w-5 h-5 text-slate-200 mb-2" />
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-tight mb-1">Empty Thread</h4>
                        <p className="text-[9px] text-slate-500 leading-tight">Start the conversation below.</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {messages.map((msg, idx) => {
                            const isAgency = msg.sender_type === 'agency';
                            const showDate = idx === 0 || 
                                new Date(msg.created_at).toDateString() !== new Date(messages[idx-1].created_at).toDateString();

                            return (
                                <React.Fragment key={msg.id}>
                                    {showDate && (
                                        <div className="flex items-center gap-2 py-1">
                                            <div className="flex-1 h-px bg-slate-100" />
                                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest px-2">
                                                {format(new Date(msg.created_at), 'MMM d, yyyy')}
                                            </span>
                                            <div className="flex-1 h-px bg-slate-100" />
                                        </div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, x: isAgency ? 3 : -3 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn("flex items-start gap-2", isAgency ? "flex-row-reverse" : "flex-row")}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded-md flex items-center justify-center shrink-0 shadow-sm border",
                                            isAgency ? "bg-gradient-to-br from-brand-500 to-brand-600 border-brand-400" : "bg-white border-slate-100"
                                        )}>
                                            {isAgency 
                                                ? <Building2 className="w-3 h-3 text-white" />
                                                : <User className="w-3 h-3 text-slate-300" />
                                            }
                                        </div>

                                        <div className={cn("max-w-[88%] space-y-0.5", isAgency ? "items-end" : "items-start", "flex flex-col")}>
                                            <div className={cn(
                                                "px-3 py-2 rounded-xl text-[11.5px] leading-tight shadow-sm",
                                                isAgency
                                                    ? "bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-tr-none"
                                                    : "bg-white border border-slate-100 text-slate-800 rounded-tl-none whitespace-pre-wrap"
                                            )}>
                                                {msg.content}
                                            </div>
                                            <div className={cn("px-1 flex items-center gap-1", isAgency ? "flex-row-reverse" : "flex-row")}>
                                                <span className="text-[7px] font-bold text-slate-300 uppercase">
                                                    {format(new Date(msg.created_at), 'hh:mm a')}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input System */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 shrink-0">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <Textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Reply..."
                        className="resize-none text-[11.5px] border-none focus-visible:ring-0 min-h-[36px] max-h-[80px] px-3 py-2 text-slate-700 font-medium placeholder:text-slate-300 scrollbar-none"
                    />
                    <div className="flex items-center justify-between px-2 pb-1.5">
                        <div className="flex items-center gap-1 opacity-50">
                             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                             <p className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter">Sync Active</p>
                        </div>
                        <Button
                            onClick={() => sendMutation.mutate()}
                            disabled={sendMutation.isPending || !newMessage.trim()}
                            className={cn(
                                "h-7 px-3 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all",
                                newMessage.trim() 
                                    ? "bg-brand-600 hover:bg-brand-700 text-white" 
                                    : "bg-slate-100 text-slate-300"
                            )}
                        >
                            {sendMutation.isPending ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-2.5 h-2.5 mr-1" />
                                    Send
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
