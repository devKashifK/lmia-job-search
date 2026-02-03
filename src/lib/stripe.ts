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
 * Get credit amount based on plan name
 */
export const getPlanCredits = (planName: string): number => {
    const creditMapping: Record<string, number> = {
        'Pay-as-you-go': 1,
        'Weekly Plan': 50,
        'Monthly Plan': 200,
    };

    return creditMapping[planName] || 0;
};
