import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, planName, userId, userEmail, currency = 'cad' } = body;

        if (!stripe) {
            console.error('Stripe is not initialized. Check STRIPE_SECRET_KEY.');
            return NextResponse.json(
                { error: 'Payment service unavailable' },
                { status: 503 }
            );
        }

        if (!amount || !planName || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Initialize Supabase Admin Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Server configuration error: Missing database permissions' },
                { status: 500 }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Generate a temporary Merchant ID for tracking (optional, or use Stripe Session ID later)
        const tempTransactionId = `TXN_${userId.substring(0, 8)}_${Date.now()}`;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // 1. Create a Pending Transaction in Database
        const { error: dbError } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: userId,
                merchant_transaction_id: tempTransactionId, // Will update with Stripe ID later/or keep this
                amount: amount, // Store exact amount
                currency: currency,
                plan_name: planName,
                status: 'PENDING',
                metadata: {
                    provider: 'stripe',
                    api_version: 'v1',
                },
            });

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Failed to create transaction record' },
                { status: 500 }
            );
        }

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: `JobMaze - ${planName}`,
                            description: `Credits for ${planName}`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${appUrl}/payment/verify?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/payment/cancel`,
            customer_email: userEmail,
            metadata: {
                userId: userId,
                planName: planName,
                merchantTransactionId: tempTransactionId, // Link back to our DB record
            },
        });

        // 3. Update the transaction with Stripe Session ID (optional but good for tracking)
        await supabaseAdmin
            .from('transactions')
            .update({
                phonepe_transaction_id: session.id, // Reusing column for external ID
                metadata: {
                    provider: 'stripe',
                    stripe_session_id: session.id,
                }
            })
            .eq('merchant_transaction_id', tempTransactionId);

        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
        });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
