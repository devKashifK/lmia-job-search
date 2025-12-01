import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = Object.keys(process.env).filter(key => 
    !key.includes('SECRET') && !key.includes('KEY') && !key.includes('PASSWORD')
  );
  
  const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasPhonePeMerchantId = !!process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID;
  const hasPhonePeClientSecret = !!process.env.PHONEPE_CLIENT_SECRET;

  return NextResponse.json({
    envKeys: envVars,
    check: {
      SUPABASE_SERVICE_ROLE_KEY: hasSupabaseKey,
      NEXT_PUBLIC_PHONEPE_MERCHANT_ID: hasPhonePeMerchantId,
      PHONEPE_CLIENT_SECRET: hasPhonePeClientSecret,
    }
  });
}
