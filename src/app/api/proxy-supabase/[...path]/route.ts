import { NextRequest } from 'next/server';

// Match all supported HTTP methods
export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function POST(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function PUT(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function PATCH(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function DELETE(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }
export async function OPTIONS(request: NextRequest, props: { params: Promise<{ path: string[] }> }) { return proxyRequest(request, props); }

async function proxyRequest(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    const params = await props.params;
    const pathArray = params.path || [];
    const targetPath = '/' + pathArray.join('/');

    // Accept both runtime-secret vars and NEXT_PUBLIC_ build-time vars
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('[proxy-supabase] Missing env vars. Set SUPABASE_URL and SUPABASE_KEY on the server.');
        return new Response('Supabase configuration missing', { status: 500 });
    }

    // Construct the target URL
    const url = new URL(targetPath + request.nextUrl.search, supabaseUrl);

    // Forward exactly the headers the client sent, plus the secure credentials
    const headers = new Headers(request.headers);
    headers.set('apikey', supabaseKey);

    // Only set Authorization to anon key if the client sent our dummy key.
    // If they sent a real JWT (Bearer eyJ...), we MUST preserve it for RLS!
    const authHeader = headers.get('Authorization');
    if (!authHeader || authHeader === 'Bearer hidden-key') {
        headers.set('Authorization', `Bearer ${supabaseKey}`);
    }

    // Remove host headers from original request to prevent TLS/routing issues at destination
    headers.delete('host');
    headers.delete('x-forwarded-host');

    // Get the request body if it exists (don't try for GET/HEAD/OPTIONS)
    let body = null;
    let duplex: 'half' | undefined = undefined;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !!request.body) {
        // Just pass the stream through
        body = request.body;
        // Node.js requires duplex: 'half' when body is a ReadableStream
        duplex = 'half';
    }

    try {
        const response = await fetch(url.toString(), {
            method: request.method,
            headers,
            body,
            duplex,
            // Don't follow redirects automatically, let the client handle them
            redirect: 'manual',
            // Allow all caching headers to pass through naturally
            cache: 'no-store'
        } as RequestInit);

        // Forward exactly the response headers back to the client
        const responseHeaders = new Headers(response.headers);

        // Return the proxy response
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('Error in proxy request:', error);
        return new Response('Proxy Error', { status: 502 });
    }
}
