import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function POST(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function PUT(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function PATCH(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function DELETE(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function OPTIONS(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }

async function proxyRequest(
    request: NextRequest,
    props: { params: Promise<{ path: string[] }> }
) {
    const params = await props.params;
    const pathArray = params.path || [];
    const targetPath = '/' + pathArray.join('/');

    // Prefer server-only runtime env vars, fall back to NEXT_PUBLIC_ (build-time baked)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('[proxy-supabase] Missing env vars. Set SUPABASE_URL and SUPABASE_KEY.');
        return new Response('Supabase configuration missing', { status: 500 });
    }

    // Build the upstream URL
    const targetUrl = new URL(targetPath, supabaseUrl);
    request.nextUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
    });

    // Build a clean set of headers — only forward what Supabase needs
    const forwardHeaders = new Headers();

    const contentType = request.headers.get('content-type');
    if (contentType) forwardHeaders.set('content-type', contentType);

    const accept = request.headers.get('accept');
    if (accept) forwardHeaders.set('accept', accept);

    // Always inject real credentials
    forwardHeaders.set('apikey', supabaseKey);

    // Preserve real user JWTs (Bearer eyJ...) for RLS; replace dummy 'hidden-key'
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader !== 'Bearer hidden-key') {
        forwardHeaders.set('authorization', authHeader);
    } else {
        forwardHeaders.set('authorization', `Bearer ${supabaseKey}`);
    }

    // Forward Supabase-specific optional headers
    for (const h of ['x-client-info', 'x-supabase-api-version', 'prefer', 'range']) {
        const v = request.headers.get(h);
        if (v) forwardHeaders.set(h, v);
    }

    // Buffer the body — avoids duplex/ReadableStream issues in various Node.js runtimes
    let body: ArrayBuffer | undefined;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        try {
            const buf = await request.arrayBuffer();
            if (buf.byteLength > 0) body = buf;
        } catch (e) {
            console.error('[proxy-supabase] Failed to read request body:', e);
        }
    }

    try {
        const response = await fetch(targetUrl.toString(), {
            method: request.method,
            headers: forwardHeaders,
            body,
            cache: 'no-store',
        });

        // Forward response headers, skipping hop-by-hop ones
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            if (!['connection', 'keep-alive', 'transfer-encoding', 'upgrade'].includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        if (targetPath.includes('agency_profiles')) {
            console.log(`[proxy-debug] Profiles status: ${response.status} ${response.statusText}`);
        }

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[proxy-supabase] Upstream fetch failed:', message, '| target:', targetUrl.toString());
        return new Response(`Proxy Error: ${message}`, { status: 502 });
    }
}
