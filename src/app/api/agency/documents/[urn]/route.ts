import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ urn: string }> }) {
    try {
        const { urn: rawUrn } = await params;
        const urn = rawUrn.toLowerCase();
        const supabase = await createClient();
        const token = req.headers.get("authorization")?.split("Bearer ")[1];
        const { data: { user } } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const adminSupabase = await createAdminClient();
        
        const { data, error } = await (adminSupabase.from('agency_client_documents') as any)
            .select('*')
            .ilike('client_urn', urn)
            .eq('agency_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ documents: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
