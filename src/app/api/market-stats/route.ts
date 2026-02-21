
import { NextResponse } from 'next/server';
import { getMarketStats } from '@/lib/api/analytics';

export const dynamic = 'force-dynamic'; // Ensure real-time data

export async function GET() {
    try {
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
