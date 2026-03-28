'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { getUserCredits, isUnlimitedPlan } from '@/lib/api/credits';

export type PlanType = 'free' | 'pay_as_you_go' | 'weekly' | 'monthly' | 'enterprise' | 'admin';

export interface PlanFeatures {
    planType: PlanType;
    isUnlimited: boolean;
    canViewEmployerContacts: boolean;
    canUseAIAnalysis: boolean;
    expiresAt: string | null;
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
    
    // Feature gating logic
    const canViewEmployerContacts = planType !== 'free'; // Only non-free plans see contacts
    const canUseAIAnalysis = ['monthly', 'enterprise', 'admin'].includes(planType);

    return {
        planType,
        isUnlimited,
        canViewEmployerContacts,
        canUseAIAnalysis,
        expiresAt: credits?.expires_at || null,
        isLoading,
    };
}
