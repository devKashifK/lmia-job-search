import { NextRequest, NextResponse } from 'next/server';
import { getPlanCredits } from '@/lib/phonepe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let paymentData;
    if (body.response) {
        const decodedResponse = Buffer.from(body.response, 'base64').toString('utf-8');
        paymentData = JSON.parse(decodedResponse);
    } else {
        paymentData = body;
    }

    const merchantTransactionId = paymentData.data?.merchantTransactionId;
    const transactionId = paymentData.data?.transactionId;
    const state = paymentData.data?.state || paymentData.code;
    const responseCode = paymentData.code;

    if (!merchantTransactionId) {
        return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    // Initialize Supabase Service Role Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch transaction
    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('merchant_transaction_id', merchantTransactionId)
      .single();

    if (fetchError || !transaction) {
      console.error('Transaction not found:', merchantTransactionId);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Update transaction
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({
        phonepe_transaction_id: transactionId,
        status: state === 'PAYMENT_SUCCESS' || state === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
        payment_method: paymentData.data?.paymentInstrument?.type,
        updated_at: new Date().toISOString(),
        metadata: {
          ...transaction.metadata,
          callback_response: paymentData,
          response_code: responseCode,
        },
      })
      .eq('merchant_transaction_id', merchantTransactionId);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
      return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }

    // Add credits if successful
    if (state === 'PAYMENT_SUCCESS' || state === 'SUCCESS') {
      const creditsToAdd = getPlanCredits(transaction.plan_name);

      const { data: currentCredits } = await supabaseAdmin
        .from('credits')
        .select('*')
        .eq('id', transaction.user_id)
        .single();

      if (currentCredits) {
        const newTotalCredits = (currentCredits.total_credit || 0) + creditsToAdd;
        await supabaseAdmin
          .from('credits')
          .update({ total_credit: newTotalCredits })
          .eq('id', transaction.user_id);
      }
    }

    return NextResponse.json({ success: true, message: 'Callback processed successfully' });

  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
