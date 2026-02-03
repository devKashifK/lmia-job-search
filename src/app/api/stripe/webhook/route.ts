import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPlanCredits } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Disable next.js body parsing (Stripe needs raw body), 
// but in App Router we get raw body via request.text() so no config needed like Pages Router.

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing');
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve metadata
        const userId = session.metadata?.userId;
        const planName = session.metadata?.planName;
        const merchantTransactionId = session.metadata?.merchantTransactionId;

        if (!userId || !merchantTransactionId || !planName) {
            console.error('Missing metadata in Stripe session');
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        // Initialize Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        try {
            // 1. Update Transaction to SUCCESS
            const { error: updateError } = await supabaseAdmin
                .from('transactions')
                .update({
                    status: 'SUCCESS',
                    updated_at: new Date().toISOString(),
                    payment_method: 'stripe',
                    metadata: {
                        stripe_payment_intent: session.payment_intent,
                        stripe_status: session.payment_status
                    }
                })
                .eq('merchant_transaction_id', merchantTransactionId);

            if (updateError) {
                console.error('Failed to update transaction:', updateError);
                throw updateError;
            }

            // 2. Grant Credits
            const creditsToAdd = getPlanCredits(planName);

            const { data: currentCredits } = await supabaseAdmin
                .from('credits')
                .select('*')
                .eq('id', userId)
                .single();

            if (currentCredits) {
                const newTotalCredits = (currentCredits.total_credit || 0) + creditsToAdd;
                await supabaseAdmin
                    .from('credits')
                    .update({ total_credit: newTotalCredits })
                    .eq('id', userId);

                console.log(`Granted ${creditsToAdd} credits to user ${userId}`);
            } else {
                // Fallback: If no credit record exists (shouldn't happen for reg user, but safe to handle)
                // You might want to insert a new row or log an error
                console.error(`User ${userId} not found in credits table`);
            }

        } catch (err) {
            console.error('Error processing webhook logic:', err);
            return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
