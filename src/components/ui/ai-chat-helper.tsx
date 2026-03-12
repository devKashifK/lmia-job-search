'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, ListFilter, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    content: string;
}

interface AIChatHelperProps {
    searchContext: Record<string, unknown>[];
    className?: string; // To style the "Summarize This Base" button
}

export function AIChatHelper({ searchContext = [], className }: AIChatHelperProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Clean and minimal context to avoid token limits
    const getMinimalContext = () => {
        // Increase context depth but ensure we don't grab raw massive objects
        return searchContext.slice(0, 30).map(job => ({
            jobTitle: job.job_title || job.jobTitle || job.occupation_title,
            employer: job.employer || job.operating_name,
            city: job.city,
            state: job.state || job.territory,
            noc_code: job.noc_code,
            date: job.date_of_job_posting || job.lmia_year,
            salary: job.median_wage || job.salary || job.wage || 'Not specified',
            positions: job.approved_positions || 'Unknown',
            description: job.job_description ? job.job_description.substring(0, 300) + '...' : 'No description',
            requirements: job.job_requirements ? job.job_requirements.substring(0, 200) + '...' : 'No requirements listed'
        }));
    };

    const handleSendMessage = async (customPrompt?: string) => {
        const textToSend = customPrompt || inputValue.trim();
        if (!textToSend || isLoading) return;

        if (!customPrompt) {
            setInputValue('');
        }

        // Add user message to UI immediately
        const newUserMessage: Message = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        // In case the modal wasn't open yet (e.g., clicking Summarize button)
        setIsOpen(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, newUserMessage],
                    contextData: getMinimalContext()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch AI response');
            }

            const data = await response.json();

            setMessages(prev => [...prev, { role: 'model', content: data.text }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'model',
                content: 'Sorry, I encountered an error while analyzing the data. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSummarizeClick = () => {
        if (messages.length === 0) {
            handleSendMessage("Please summarize the overall trends, top hiring companies, and common locations based on the current job search results.");
        } else {
            setIsOpen(true);
        }
    };

    return (
        <>
            {/* Summarize This Base Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={handleSummarizeClick}
                className={cn("h-8 gap-1.5 bg-white text-gray-700 hover:text-brand-600 hover:bg-brand-50 border-gray-200 shadow-sm text-xs rounded-full px-4 transition-all hover:border-brand-200", className)}
            >
                <ListFilter className="w-3.5 h-3.5" />
                Summarize This Base
            </Button>

            {/* Floating Spark Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group outline-none",
                    isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100",
                    "bg-white border text-blue-600 hover:border-blue-200"
                )}
            >
                <Sparkles className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" fill="currentColor" />
            </button>

            {/* Chat Modal / Drawer */}
            <div
                className={cn(
                    "fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 transform outline-none origin-bottom-right",
                    isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 pointer-events-none translate-y-10"
                )}
                style={{ height: 'min(600px, calc(100vh - 2rem))' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-none text-sm">JobMaze AI</h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">Ask questions about these results</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                            <Bot className="w-10 h-10 text-gray-400" />
                            <p className="text-sm text-gray-500 max-w-[200px]">
                                I can see the {searchContext.length} jobs currently on your screen. What would you like to know about them?
                            </p>
                        </div>
                    ) : (
                        messages.map((m, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex max-w-[85%]",
                                    m.role === 'user' ? "ml-auto" : "mr-auto"
                                )}
                            >
                                <div
                                    className={cn(
                                        "px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed",
                                        m.role === 'user'
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50"
                                    )}
                                >
                                    {m.role === 'user' ? (
                                        m.content
                                    ) : (
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex mr-auto max-w-[85%]">
                            <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-bl-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                <span className="text-[13px] text-gray-500">Analyzing jobs...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        className="flex items-end gap-2"
                    >
                        <div className="relative flex-1">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about salaries, locations..."
                                className="pr-10 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors text-sm h-10"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!inputValue.trim() || isLoading}
                            className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
