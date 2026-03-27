import { NextRequest, NextResponse } from 'next/server';
import { getPlanDetails } from '@/lib/phonepe';
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

    // Process plan if successful
    if (state === 'PAYMENT_SUCCESS' || state === 'SUCCESS') {
      const planDetails = getPlanDetails(transaction.plan_name);
      
      // Calculate expiration date if duration is provided
      const expiresAt = planDetails.durationDays 
        ? new Date(Date.now() + planDetails.durationDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data: currentCredits, error: creditFetchError } = await supabaseAdmin
        .from('credits')
        .select('*')
        .eq('id', transaction.user_id)
        .single();

      if (creditFetchError && creditFetchError.code !== 'PGRST116') {
        console.error('Error fetching credits:', creditFetchError);
        // Continue anyway or return error? Let's try to upsert.
      }

      if (currentCredits) {
        const newTotalCredits = (currentCredits.total_credit || 0) + planDetails.credits;
        const { error: finalUpdateError } = await supabaseAdmin
          .from('credits')
          .update({ 
            total_credit: newTotalCredits,
            plan_type: planDetails.planType,
            expires_at: expiresAt,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.user_id);
          
        if (finalUpdateError) console.error('Error updating credits row:', finalUpdateError);
      } else {
        // Create initial credit record if not exists
        const { error: insertError } = await supabaseAdmin
          .from('credits')
          .insert({
            id: transaction.user_id,
            total_credit: planDetails.credits,
            used_credit: 0,
            plan_type: planDetails.planType,
            expires_at: expiresAt,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) console.error('Error inserting credits row:', insertError);
      }
    }

    return NextResponse.json({ success: true, message: 'Callback processed successfully' });

  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
