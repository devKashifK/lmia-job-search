import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const token = req.headers.get("authorization")?.split("Bearer ")[1];
        const { data: { user } } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { clientUrn: rawUrn, documents } = await req.json();
        const clientUrn = rawUrn.toLowerCase(); // Normalize to lowercase

        if (!clientUrn || !documents?.length) {
            return NextResponse.json({ error: "clientUrn and documents are required" }, { status: 400 });
        }

        // Use Admin Client to bypass RLS since we've manually verified the user
        // and we are explicitly setting/checking agency_id
        const adminSupabase = await createAdminClient();

        // Ensure a strategy record exists (so a PIN is generated and the portal is accessible)
        const { data: existingStrategy } = await (adminSupabase.from('agency_client_strategies') as any)
            .select('id')
            .ilike('client_urn', clientUrn)
            .maybeSingle();

        if (!existingStrategy) {
            await (adminSupabase.from('agency_client_strategies') as any).insert({
                client_urn: clientUrn,
                agency_id: user.id,
                access_pin: '1234', // Default PIN for new portals
                strategy_roadmap: [],
            });
        }

        const rows = documents.map((doc: any) => ({
            client_urn: clientUrn,
            agency_id: user.id,
            name: doc.name,
            category: doc.category || 'general',
            required: doc.required ?? true,
            request_note: doc.request_note || null,
            status: 'requested',
        }));

        const { data, error } = await (adminSupabase.from('agency_client_documents') as any)
            .insert(rows)
            .select();

        if (error) throw error;

        // Log to activity log
        await (adminSupabase.from('agency_activity_log') as any).insert({
            client_urn: clientUrn,
            agency_id: user.id,
            action_type: 'doc_requested',
            description: `Requested ${rows.length} document(s): ${rows.map((r: any) => r.name).join(', ')}`,
            metadata: { document_count: rows.length, document_names: rows.map((r: any) => r.name) }
        }).then(() => {}).catch(() => {});

        return NextResponse.json({ success: true, documents: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
