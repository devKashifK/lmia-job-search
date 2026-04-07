
import { NextResponse } from 'next/server';
import { getMarketStats } from '@/lib/api/analytics';
import { createClient } from '@/utils/supabase/server';
import { verifyPremiumAccess } from '@/lib/api/credits';

export const dynamic = 'force-dynamic'; // Ensure real-time data

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // High-level market stats are public to all logged-in users
        const stats = await getMarketStats();
        return NextResponse.json(stats);
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error in /api/market-stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch market stats' },
            { status: 500 }
        );
    }
}
