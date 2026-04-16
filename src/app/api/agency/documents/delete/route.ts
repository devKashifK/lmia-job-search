import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

// DELETE /api/agency/documents/delete?documentId=...
// Agency deletes a document request
export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const token = req.headers.get("authorization")?.split("Bearer ")[1];
        const { data: { user } } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const documentId = searchParams.get('documentId');

        if (!documentId) {
            return NextResponse.json({ error: "documentId is required" }, { status: 400 });
        }

        const adminSupabase = await createAdminClient();

        // 1. Fetch doc first to check ownership and get file_url/client_urn
        const { data: doc, error: fetchError } = await (adminSupabase.from('agency_client_documents') as any)
            .select('id, name, client_urn, file_url, agency_id')
            .eq('id', documentId)
            .eq('agency_id', user.id)
            .single();

        if (fetchError || !doc) {
            return NextResponse.json({ error: "Document not found or access denied" }, { status: 404 });
        }

        // 2. Delete file from storage if it exists
        if (doc.file_url) {
            try {
                // Extract file path from public URL
                // URL looks like: .../storage/v1/object/public/resumes/documents/[urn]/[id]/[timestamp].ext
                const urlParts = doc.file_url.split('/resumes/');
                if (urlParts.length > 1) {
                    const filePath = urlParts[1];
                    await adminSupabase.storage.from('resumes').remove([filePath]);
                }
            } catch (storageError) {
                console.error('[delete-document] Storage cleanup error:', storageError);
                // Continue with DB deletion even if storage cleanup fails
            }
        }

        // 3. Delete the record
        const { error: deleteError } = await (adminSupabase.from('agency_client_documents') as any)
            .delete()
            .eq('id', documentId)
            .eq('agency_id', user.id);

        if (deleteError) throw deleteError;

        // 4. Log to activity log
        await (adminSupabase.from('agency_activity_log') as any).insert({
            client_urn: doc.client_urn,
            agency_id: user.id,
            action_type: 'doc_request_deleted',
            description: `Deleted document request: ${doc.name}`,
            metadata: { document_id: documentId, document_name: doc.name }
        }).then(() => {}).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[delete-document]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
