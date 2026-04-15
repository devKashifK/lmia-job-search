import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

// GET /api/report/[urn]/documents — Candidate sees their document requests
export async function GET(req: NextRequest, { params }: { params: Promise<{ urn: string }> }) {
    try {
        const { urn: rawUrn } = await params;
        const urn = rawUrn.toLowerCase(); // Standardize to lowercase
        const adminSupabase = await createAdminClient();
        const pin = req.headers.get("x-pin");

        // Access is granted based on the URN. PIN is handled at the UI entry gate.
        console.log(`[CANDIDATE API] Fetching docs for URN: "${urn}"`);
        
        const { data, error } = await (adminSupabase.from('agency_client_documents') as any)
            .select('id, name, category, status, required, request_note, file_name, file_size, rejection_reason, uploaded_at, reviewed_at, created_at, client_urn')
            .ilike('client_urn', urn) // ilike handles case insensitivity anyway, but normalization is safer
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[CANDIDATE API] Select Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[CANDIDATE API] Found ${data?.length || 0} documents for ${urn}`);
        return NextResponse.json({ documents: data || [] });
    } catch (error: any) {
        console.error('[CANDIDATE API] Global Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
