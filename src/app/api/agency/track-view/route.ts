import { NextResponse } from 'next/server';
import db from '@/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { client_urn, event_type = 'page_view', metadata = {} } = body;

        if (!client_urn) {
            return NextResponse.json({ error: 'Client URN is required' }, { status: 400 });
        }

        // 1. Identify the agency associated with this client
        // Use MaybeSingle to avoid error if client doesn't exist yet
        const { data: client, error: clientError } = await db
            .from('agency_clients')
            .select('agency_id, id')
            .eq('urn', client_urn)
            .maybeSingle();

        if (clientError || !client) {
            // We silent fail for the tracking ping if the client is invalid 
            // to avoid revealing URN validity to scrapers
            return NextResponse.json({ success: true, masked: true });
        }

        // 2. Log the interaction
        const userAgent = request.headers.get('user-agent') || 'unknown';
        
        const { error: logError } = await db
            .from('agency_portal_views')
            .insert({
                client_urn,
                agency_id: client.agency_id,
                event_type,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString()
                },
                user_agent: userAgent
            });

        if (logError) {
            console.error('[track-view] Insert error:', logError);
            // Non-blocking for the client
        }

        // 3. Increment counters in strategy for quick lookup
        // We do this asynchronously to avoid slowing down the client
        db.rpc('increment_client_engagement', { target_urn: client_urn })
            .then(({ error }) => {
                if (error) console.error('[track-view] RPC error:', error);
            });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[track-view] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
