import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/phonepe';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    // Check PhonePe status
    const statusResponse = await checkPaymentStatus(transactionId);

    // Update local database
    if (statusResponse.success || statusResponse.code === 'SUCCESS') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      if (supabaseServiceKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const data = statusResponse.data;
        const state = data?.state || statusResponse.code;

        await supabaseAdmin
          .from('transactions')
          .update({
            phonepe_transaction_id: data?.transactionId,
            status: String(state) === 'PAYMENT_SUCCESS' || String(state) === 'SUCCESS' ? 'SUCCESS' : String(state),
            payment_method: data?.paymentInstrument?.type,
            updated_at: new Date().toISOString(),
            metadata: {
              status_response: data,
              response_code: statusResponse.code,
            },
          })
          .eq('merchant_transaction_id', transactionId);
      }
    }

    return NextResponse.json({
      success: true,
      status: statusResponse.data?.state || statusResponse.code,
      transactionId: statusResponse.data?.transactionId,
      amount: statusResponse.data?.amount,
      responseCode: statusResponse.code,
    });

  } catch (error: any) {
    console.error('Payment status check error:', error);
    return NextResponse.json({ error: error.message || 'Failed to check payment status' }, { status: 500 });
  }
}
