'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction, ToastDismiss } from '@/components/ui/toast';
import { useRouter, useSearchParams } from 'next/navigation';
import db from '@/db';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CrossTableCheckerProps {
    currentSearchType: 'lmia' | 'hot_leads';
    field: string;
    query: string; // The search term (e.g., "Toronto", "Cook")
}

export function CrossTableChecker({
    currentSearchType,
    field,
    query,
}: CrossTableCheckerProps) {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasCheckedRef = useRef(false);

    // Map fields between tables
    // Trending (hot_leads) keys <-> LMIA keys
    const getOtherTableField = (
        currentType: 'lmia' | 'hot_leads',
        currentField: string
    ): string | null => {
        const f = currentField.toLowerCase();

        // Direct matches
        if (['city', 'employer', 'noc_code', 'job_title'].includes(f)) return f;

        if (currentType === 'hot_leads') {
            // Trending -> LMIA
            if (f === 'state') return 'territory';
            if (f === 'category') return 'program';
        } else {
            // LMIA -> Trending
            if (f === 'territory') return 'state';
            if (f === 'program') return 'category';
        }

        return null;
    };

    useEffect(() => {
        // 1. Loop Prevention: Don't check if we just came from a cross-table redirect
        if (searchParams?.get('ref') === 'cross_table') return;

        // Only run if we have a valid query and haven't checked yet
        if (!query || query === 'all' || hasCheckedRef.current) return;

        // Only run for specific fields as requested
        const allowedFields = [
            'city',
            'state', 'territory',
            'category', 'program',
            'employer',
            'noc_code'
        ];

        if (!allowedFields.includes(field.toLowerCase())) return;

        const checkOtherTable = async () => {
            hasCheckedRef.current = true;

            const otherType = currentSearchType === 'lmia' ? 'hot_leads' : 'lmia';
            const otherTable = otherType === 'lmia' ? 'lmia' : 'trending_job';
            const otherField = getOtherTableField(currentSearchType, field);

            if (!otherField) return;

            try {
                const { count, error } = await db
                    .from(otherTable)
                    .select('*', { count: 'exact', head: true })
                    .ilike(otherField, `%${query}%`);

                if (error) {
                    console.error('Cross-table check error:', error);
                    return;
                }

                if (count && count > 0) {
                    const otherLabel = otherType === 'lmia' ? 'LMIA' : 'Trending Jobs';

                    toast({
                        title: (
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/50 ring-1 ring-amber-200/60">
                                    <Sparkles className="h-4 w-4 text-amber-600 fill-amber-600" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-gray-900 text-sm">Smart Match Found</span>
                                </div>
                            </div>
                        ) as any,
                        description: (
                            <div className="mt-2 pl-11">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    We found <span className="font-bold text-gray-900 bg-brand-50 px-1 py-0.5 rounded border border-brand-100">{count} matches</span> in the <span className="font-medium text-gray-900">{otherLabel}.</span>
                                </p>
                            </div>
                        ) as any,
                        // Force vertical layout to prevent button from squishing text
                        className: "flex flex-col items-start !space-x-0 !gap-3 shadow-2xl border-border/60 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 p-5 rounded-2xl ring-1 ring-black/5 max-w-[400px]",
                        action: (
                            <div className="flex items-center gap-3 w-full mt-1">
                                <ToastAction
                                    altText="View Results"
                                    className="flex-1 justify-center bg-brand-600 hover:bg-brand-700 text-white border-0 rounded-lg px-3 h-9 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] group"
                                    onClick={() => {
                                        const typeSegment = otherType === 'lmia' ? 'lmia' : 'hot-leads';
                                        const tParam = otherType === 'lmia' ? 'lmia' : 'trending_job';
                                        const url = `/search/${typeSegment}/${encodeURIComponent(query)}?field=${otherField}&t=${tParam}&ref=cross_table`;
                                        router.push(url);
                                    }}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>Show me</span>
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </ToastAction>

                                {/* We cast this as any because ToastActionElement type might be strict, but React renders it fine */}
                                {/* @ts-ignore */}
                                <ToastDismiss className="flex-1 justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-0 rounded-lg px-3 h-9 text-sm font-medium transition-all duration-200 shadow-sm active:scale-[0.98]">
                                    Dismiss
                                </ToastDismiss>
                            </div>
                        ) as any,
                        duration: 10000,
                    });

                }
            } catch (err) {
                console.error('Failed to check other table:', err);
            }
        };

        checkOtherTable();
    }, [currentSearchType, field, query, toast, router, searchParams]);

    // Reset check when query changes (but not on initial mount if ref is present)
    useEffect(() => {
        // If query changed, we should reset the check, but still respect the ref param logic in the main effect
        hasCheckedRef.current = false;
    }, [query, field, currentSearchType]);

    return null;
}
