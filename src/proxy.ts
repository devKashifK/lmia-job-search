import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting (per instance)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

const BLOCKED_USER_AGENTS = [
    'python-requests',
    'curl',
    'wget',
    'scrapy',
    'bot',
    'spider',
    'crawler',
];

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// Mock Blocklist - In production, use Redis/KV or Database
const BLOCKED_IPS = new Set(['1.2.3.4']); // Example

export async function proxy(request: NextRequest) {
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

    // 0. Check Blocklist (Bot Trap Result)
    if (BLOCKED_IPS.has(ip)) {
        return new NextResponse('Access Denied', { status: 403 });
    }

    // 1. Block known scraping tools
    if (BLOCKED_USER_AGENTS.some(ua => userAgent.includes(ua))) {
        // Allow Google/Bing bots if verified (hard to verify without IP check, but basic check helps)
        if (!userAgent.includes('googlebot') && !userAgent.includes('bingbot')) {
            return new NextResponse('Access Denied', { status: 403 });
        }
    }

    // Skip rate limiting for static assets
    if (request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static')) {
        return NextResponse.next();
    }

    // 2. Rate Limiting
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > RATE_LIMIT_WINDOW) {
        record.count = 1;
        record.lastReset = now;
    } else {
        record.count++;
    }

    rateLimitMap.set(ip, record);

    if (record.count > MAX_REQUESTS) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    return NextResponse.next();
}
