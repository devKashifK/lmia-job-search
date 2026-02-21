import { NextRequest, NextResponse } from 'next/server';

// In a real production app, this would write to Redis or a Database.
// For now, we'll log it and return a "forbidden" response to scare the bot.

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.warn(`[BOT TRAP TRIGGERED] IP: ${ip}, UA: ${userAgent}`);

    // Here you would add the IP to a blocked list in your DB/Redis
    // await db.from('banned_ips').insert({ ip, reason: 'honeypot_trap' });

    return new NextResponse('Access Denied', { status: 403 });
}
