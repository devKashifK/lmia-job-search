'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getTrendingRoles, getRegionalHotspots, getCategorizedCompanies, getDistinctCompanies } from '@/lib/api/analysis';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePlanFeatures } from '@/hooks/use-plan-features';
import { useCreditUnlock } from '@/components/ui/credit-unlock-dialog';
import { useSession } from '@/hooks/use-session';
import { consumeCreditsIfNoPremium } from '@/lib/api/credits';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import db from '@/db';

interface CompanySearchBarProps {
    className?: string;
    placeholder?: string;
    autoFocus?: boolean;
}

export function CompanySearchBar({
    className,
    placeholder = "Search for a company (e.g. Amazon, Google)...",
    autoFocus = false,
}: CompanySearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { canUseAIAnalysis, creditRemaining } = usePlanFeatures();
    const { showUnlockDialog, CreditUnlockComponent } = useCreditUnlock();
    const { session, loading: isSessionLoading } = useSession();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isUnlocking, setIsUnlocking] = useState(false);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions
    const { data: suggestions = [], isLoading } = useQuery({
        queryKey: ['company-search-suggestions', query],
        queryFn: async () => {
            if (!query || query.length < 2) return [];

            // Try checking trending_job first
            const { data: trendingData, error: trendingError } = await db
                .from('trending_job')
                .select('employer')
                .ilike('employer', `%${query}%`)
                .limit(5);

            // Also check LMIA
            const { data: lmiaData, error: lmiaError } = await db
                .from('lmia')
                .select('employer')
                .ilike('employer', `%${query}%`)
                .limit(5);

            const combined = [
                ...(trendingData?.map((d: any) => d.employer) || []),
                ...(lmiaData?.map((d: any) => d.employer) || [])
            ];

            // Deduplicate and take top 5
            return Array.from(new Set(combined)).slice(0, 5);
        },
        enabled: query.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 mins
    });

    const checkAndRedirect = async (companyName: string) => {
        const company = companyName.trim();
        if (!company) return;

        // Ensure session is loaded before checking gating
        if (isSessionLoading) return;

        if (!session?.user?.id) {
            router.push(`/analysis/${encodeURIComponent(company)}`);
            return;
        }

        const lockKey = `unlocked_analysis_${session.user.id}_${company}`;
        const isLocallyUnlocked = localStorage.getItem(lockKey) === 'true';

        if (canUseAIAnalysis || isLocallyUnlocked) {
            router.push(`/analysis/${encodeURIComponent(company)}`);
            return;
        }

        // Show unlock dialog
        showUnlockDialog({
            title: 'Unlock Company Analysis',
            description: `Unlock deep-dive analytics and AI insights for ${company}. This will use 100 credits.`,
            creditAmount: 100,
            userCredits: creditRemaining === Infinity ? 999 : creditRemaining,
            onConfirm: async () => {
                setIsUnlocking(true);
                try {
                    const success = await consumeCreditsIfNoPremium(session.user.id, 100);
                    if (success) {
                        localStorage.setItem(lockKey, 'true');
                        queryClient.invalidateQueries({ queryKey: ['credits', session.user.id] });
                        toast({
                            title: 'Analysis Unlocked',
                            description: `100 credits deducted for ${company}.`,
                        });
                        router.push(`/analysis/${encodeURIComponent(company)}`);
                    } else {
                        toast({
                            title: 'Insufficient Credits',
                            description: 'You need 100 credits to unlock this analysis.',
                            variant: 'destructive',
                        });
                        router.push('/dashboard/credits');
                    }
                } catch (error) {
                    console.error('Error unlocking:', error);
                } finally {
                    setIsUnlocking(false);
                }
            }
        });
    };

    const handleSelect = (e: React.MouseEvent, company: string) => {
        e.preventDefault();
        e.stopPropagation();
        setQuery(company);
        setIsOpen(false);
        checkAndRedirect(company);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query) {
            checkAndRedirect(query);
        }
    };

    return (
        <div ref={wrapperRef} className={cn("relative w-full max-w-2xl mx-auto", className)}>
            <CreditUnlockComponent />
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="block w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-md border border-brand-100 rounded-2xl shadow-lg shadow-brand-900/5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all text-base sm:text-lg"
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 text-brand-400 animate-spin mr-2" />
                    ) : (
                        <Button
                            type="submit"
                            size="sm"
                            className="h-9 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium"
                        >
                            Analyze
                        </Button>
                    )}
                </div>
            </form>

            <AnimatePresence>
                {isOpen && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Suggested Companies
                            </div>
                            {suggestions.map((company, index) => (
                                <button
                                    key={`${company}-${index}`}
                                    type="button"
                                    onClick={(e) => handleSelect(e, company)}
                                    className="w-full flex items-center px-4 py-3 hover:bg-brand-50/50 transition-all text-left group"
                                >
                                    <div className="flex-shrink-0 mr-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <span className="text-gray-700 font-medium group-hover:text-gray-900 truncate">
                                        {company}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
