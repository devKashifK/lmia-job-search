import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

// GET /api/report/[urn]/messages — Candidate fetches their thread
export async function GET(req: NextRequest, { params }: { params: Promise<{ urn: string }> }) {
    try {
        const { urn: rawUrn } = await params;
        const urn = rawUrn.toLowerCase(); // Standardize to lowercase
        const adminSupabase = await createAdminClient();
        
        // Access is granted based on the URN. PIN is handled at the UI entry gate.
        const { data, error } = await (adminSupabase.from('agency_client_messages') as any)
            .select('id, sender_type, content, created_at, read_at')
            .ilike('client_urn', urn)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ messages: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/report/[urn]/messages — Candidate sends a reply (PIN authenticated)
export async function POST(req: NextRequest, { params }: { params: Promise<{ urn: string }> }) {
    try {
        const { urn: rawUrn } = await params;
        const urn = rawUrn.toLowerCase(); // Standardize to lowercase
        const adminSupabase = await createAdminClient();
        const { content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: "content is required" }, { status: 400 });
        }

        // Fetch strategy/client to get agency_id and the CORRECT CASING of the URN for the foreign key
        const { data: clientData } = await (adminSupabase.from('agency_clients') as any)
            .select('urn, agency_id')
            .ilike('urn', urn)
            .maybeSingle();

        if (!clientData) {
            return NextResponse.json({ error: "Session setup incomplete" }, { status: 404 });
        }

        const { data, error } = await (adminSupabase.from('agency_client_messages') as any)
            .insert({
                client_urn: clientData.urn, // Use the actual URN from the DB to satisfy FK
                agency_id: clientData.agency_id,
                sender_type: 'candidate',
                content: content.trim(),
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, message: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
