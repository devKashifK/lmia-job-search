'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { getUserCredits, isUnlimitedPlan } from '@/lib/api/credits';

export type PlanType = 'free' | 'pay_as_you_go' | 'weekly' | 'monthly' | 'starter' | 'pro' | 'advanced' | 'enterprise' | 'admin';

export interface PlanFeatures {
    planType: PlanType;
    isUnlimited: boolean;
    canViewEmployerContacts: boolean;
    canUseAIAnalysis: boolean;
    canUseComparator: boolean;
    expiresAt: string | null;
    creditRemaining: number;
    isLoading: boolean;
}

export function usePlanFeatures(): PlanFeatures {
    const { session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [credits, setCredits] = useState<any>(null);

    useEffect(() => {
        const fetchCredits = async () => {
            if (session?.user?.id) {
                try {
                    const data = await getUserCredits(session.user.id);
                    setCredits(data);
                } catch (error) {
                    console.error('Error fetching plan features:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchCredits();
    }, [session?.user?.id]);

    const planType = (credits?.plan_type as PlanType) || 'free';
    const isUnlimited = isUnlimitedPlan(credits);
    const creditRemaining = isUnlimited ? Infinity : (credits?.total_credit ?? 0) - (credits?.used_credit ?? 0);
    
    // Feature gating logic
    const premiumPlans = ['weekly', 'monthly', 'starter', 'pro', 'advanced', 'enterprise', 'admin'];
    const canViewEmployerContacts = premiumPlans.includes(planType);
    const canUseAIAnalysis = ['weekly', 'monthly', 'starter', 'pro', 'advanced', 'enterprise', 'admin'].includes(planType);
    const canUseComparator = ['weekly', 'monthly', 'starter', 'pro', 'advanced', 'enterprise', 'admin'].includes(planType);

    return {
        planType,
        isUnlimited,
        canViewEmployerContacts,
        canUseAIAnalysis,
        canUseComparator,
        expiresAt: credits?.expires_at || null,
        creditRemaining,
        isLoading,
    };
}
