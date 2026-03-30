
import { NextResponse } from 'next/server';
import { getMarketStats } from '@/lib/api/analytics';
import { createClient } from '@/utils/supabase/server';
import { verifyPremiumAccess } from '@/lib/api/credits';

export const dynamic = 'force-dynamic'; // Ensure real-time data

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isPremium = await verifyPremiumAccess(user.id);
        if (!isPremium) {
            return NextResponse.json(
                { error: 'Premium Plan Required' },
                { status: 403 }
            );
        }

        const stats = await getMarketStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error in /api/market-stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch market stats' },
            { status: 500 }
        );
    }
}
