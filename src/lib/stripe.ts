import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    console.warn('STRIPE_SECRET_KEY is missing. Payment features will not work.');
}

export const stripe = stripeKey
    ? new Stripe(stripeKey, {
        typescript: true,
    })
    : (null as unknown as Stripe);


/**
 * Get plan details based on plan name
 * Handles suffixes like "(monthly)" and "(annual)"
 */
export const getPlanDetails = (planName: string) => {
    const plans: Record<string, { credits: number; planType: string; durationDays?: number }> = {
        // Individual Plans
        'Explorer (monthly)': { credits: 500, planType: 'explorer' },
        'Explorer (annual)': { credits: 500, planType: 'explorer' },
        
        'Starter (monthly)': { credits: 400, planType: 'starter', durationDays: 30 },
        'Starter (annual)': { credits: 500, planType: 'starter', durationDays: 365 },
        
        'Pro (monthly)': { credits: 900, planType: 'pro', durationDays: 30 },
        'Pro (annual)': { credits: 1100, planType: 'pro', durationDays: 365 },
        
        'Elite (monthly)': { credits: 2000, planType: 'elite', durationDays: 30 },
        'Elite (annual)': { credits: 2500, planType: 'elite', durationDays: 365 },

        // Agency Plans
        'Agency Starter (monthly)': { credits: 1500, planType: 'agency_starter', durationDays: 30 },
        'Agency Starter (annual)': { credits: 2000, planType: 'agency_starter', durationDays: 365 },
        
        'Agency Pro (monthly)': { credits: 5000, planType: 'agency_pro', durationDays: 30 },
        'Agency Pro (annual)': { credits: 6000, planType: 'agency_pro', durationDays: 365 },
        
        'Agency Elite (monthly)': { credits: 15000, planType: 'agency_elite', durationDays: 30 },
        'Agency Elite (annual)': { credits: 18000, planType: 'agency_elite', durationDays: 365 },

        // Legacy / Admin support
        'admin': { credits: 0, planType: 'admin' },
    };

    return plans[planName] || { credits: 0, planType: 'explorer' };
};

/**
 * Get credit amount based on plan name (legacy helper)
 */
export const getPlanCredits = (planName: string): number => {
    return getPlanDetails(planName).credits;
};
