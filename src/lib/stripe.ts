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
 */
export const getPlanDetails = (planName: string) => {
    const plans: Record<string, { credits: number; planType: string; durationDays?: number }> = {
        'Free Plan': { credits: 5, planType: 'free' },
        'Pay-as-you-go': { credits: 1, planType: 'pay_as_you_go' },
        'Pay-as-you-go Bundle': { credits: 10, planType: 'pay_as_you_go' },
        'Weekly Plan': { credits: 0, planType: 'weekly', durationDays: 7 },
        'Monthly Plan': { credits: 0, planType: 'monthly', durationDays: 30 },
        'Starter Plan': { credits: 150, planType: 'starter', durationDays: 30 },
        'Pro Plan': { credits: 0, planType: 'pro', durationDays: 30 },
        'Advanced Intelligence': { credits: 0, planType: 'advanced', durationDays: 30 },
        'Enterprise': { credits: 0, planType: 'enterprise', durationDays: 30 },
    };

    return plans[planName] || { credits: 0, planType: 'free' };
};

/**
 * Get credit amount based on plan name (legacy helper)
 */
export const getPlanCredits = (planName: string): number => {
    return getPlanDetails(planName).credits;
};
