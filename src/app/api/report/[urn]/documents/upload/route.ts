import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

// POST /api/report/[urn]/documents/upload — Candidate uploads a requested document
export async function POST(req: NextRequest, { params }: { params: Promise<{ urn: string }> }) {
    try {
        const { urn: rawUrn } = await params;
        const urn = rawUrn.toLowerCase();
        const adminSupabase = await createAdminClient();
        const formData = await req.formData();
        
        const file = formData.get('file') as File;
        const documentId = formData.get('documentId') as string;

        console.log(`[UPLOAD API] Processing upload for URN: ${urn}, DocID: ${documentId}`);

        if (!file || !documentId) {
            return NextResponse.json({ error: "file and documentId are required" }, { status: 400 });
        }

        // Verify document belongs to this urn (using admin client to ensure we can read)
        const { data: doc, error: selectError } = await (adminSupabase.from('agency_client_documents') as any)
            .select('id, name, agency_id, client_urn')
            .eq('id', documentId)
            .ilike('client_urn', urn)
            .maybeSingle();

        if (selectError) {
            console.error('[UPLOAD API] Select error:', selectError);
            return NextResponse.json({ error: selectError.message }, { status: 500 });
        }

        if (!doc) {
            console.warn(`[UPLOAD API] Document ${documentId} not found for URN ${urn}`);
            return NextResponse.json({ error: "Document request not found" }, { status: 404 });
        }

        console.log(`[UPLOAD API] Found document: ${doc.name}. Proceeding with storage...`);

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const filePath = `documents/${params.urn}/${documentId}/${Date.now()}.${fileExt}`;
        
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await adminSupabase.storage
            .from('resumes')
            .upload(filePath, arrayBuffer, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = adminSupabase.storage.from('resumes').getPublicUrl(filePath);

        // Update the document record
        const { data: updated, error: updateError } = await (adminSupabase.from('agency_client_documents') as any)
            .update({
                file_url: publicUrl,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type,
                status: 'uploaded',
                uploaded_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', documentId)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, document: updated });
    } catch (error: any) {
        console.error('[upload-document]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
