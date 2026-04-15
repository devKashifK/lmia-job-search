import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

// PATCH /api/agency/documents/review
// Agency approves or rejects an uploaded document
export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createClient();
        const token = req.headers.get("authorization")?.split("Bearer ")[1];
        const { data: { user } } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { documentId, action, rejectionReason } = await req.json();
        const status = action; // Use action as status

        if (!documentId || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: "documentId and valid status (approved/rejected) are required" }, { status: 400 });
        }

        const adminSupabase = await createAdminClient();

        // Fetch doc first to get client_urn for activity logging
        const { data: doc, error: fetchError } = await (adminSupabase.from('agency_client_documents') as any)
            .select('client_urn, name')
            .eq('id', documentId)
            .eq('agency_id', user.id)
            .single();

        if (fetchError || !doc) {
            return NextResponse.json({ error: "Document not found or access denied" }, { status: 404 });
        }

        const { data, error } = await (adminSupabase.from('agency_client_documents') as any)
            .update({
                status,
                rejection_reason: status === 'rejected' ? rejectionReason : null,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', documentId)
            .eq('agency_id', user.id)
            .select()
            .single();

        if (error) throw error;

        // Log to activity log
        await (adminSupabase.from('agency_activity_log') as any).insert({
            client_urn: doc.client_urn,
            agency_id: user.id,
            action_type: status === 'approved' ? 'doc_approved' : 'doc_rejected',
            description: `${status === 'approved' ? 'Approved' : 'Rejected'} document: ${doc.name}`,
            metadata: { document_id: documentId, document_name: doc.name, status, reason: rejectionReason }
        }).then(() => {}).catch(() => {});

        return NextResponse.json({ success: true, document: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
