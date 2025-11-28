import { NextRequest, NextResponse } from 'next/server';
import { initiatePayment, generateTransactionId, formatAmountToPaise } from '@/lib/phonepe';
import { PaymentRequest, PhonePePaymentPayload } from '@/types/payment';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: PaymentRequest = await request.json();
    const { amount, currency, planName, userId, userPhone } = body;

    // Validate required fields
    if (!amount || !planName || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, planName, userId' },
        { status: 400 }
      );
    }

    // Only support INR payments via PhonePe
    if (currency !== 'INR') {
      return NextResponse.json(
        { error: 'PhonePe only supports INR payments. Please select INR currency.' },
        { status: 400 }
      );
    }

    // Initialize Supabase Service Role Client
    // This is required to bypass RLS policies for backend operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
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

    // Generate unique transaction ID
    const merchantTransactionId = generateTransactionId(userId);

    // Get app URL from environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Create payment payload for v2
    const paymentPayload: PhonePePaymentPayload = {
      merchantId: process.env.NEXT_PUBLIC_PHONEPE_CLIENT_ID!,
      merchantTransactionId,
      merchantUserId: userId,
      amount: formatAmountToPaise(amount),
      redirectUrl: `${appUrl}/payment/verify?transactionId=${merchantTransactionId}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${appUrl}/api/payment/callback`,
      mobileNumber: userPhone,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // Save initial transaction record in database using Admin Client
    const { error: dbError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        merchant_transaction_id: merchantTransactionId,
        amount,
        currency,
        plan_name: planName,
        status: 'PENDING',
        metadata: {
          payment_payload: paymentPayload,
          api_version: 'v2',
        },
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create transaction record: ' + dbError.message },
        { status: 500 }
      );
    }

    // Initiate payment with PhonePe v2
    const paymentResponse = await initiatePayment(paymentPayload);
    
    // Handle response
    const redirectUrl = paymentResponse.data?.instrumentResponse?.redirectInfo?.url || paymentResponse.data?.redirectUrl;

    if (!redirectUrl) {
       // If initiation failed, mark as failed
       await supabaseAdmin
        .from('transactions')
        .update({ status: 'FAILED' })
        .eq('merchant_transaction_id', merchantTransactionId);

       throw new Error('No redirect URL received from PhonePe');
    }

    return NextResponse.json({
      success: true,
      transactionId: merchantTransactionId,
      paymentUrl: redirectUrl,
      message: 'Payment initiated successfully',
    });

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
