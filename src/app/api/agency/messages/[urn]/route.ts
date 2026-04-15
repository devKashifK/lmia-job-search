import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

// GET /api/agency/messages/[urn] - Fetch full thread for a client
export async function GET(req: NextRequest, { params }: { params: Promise<{ urn: string }> }) {
    try {
        const { urn: rawUrn } = await params;
        const urn = rawUrn.toLowerCase(); // Standardize to lowercase
        const supabase = await createClient();
        const token = req.headers.get("authorization")?.split("Bearer ")[1];
        const { data: { user } } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const adminSupabase = await createAdminClient();

        const { data, error } = await (adminSupabase.from('agency_client_messages') as any)
            .select('*')
            .ilike('client_urn', urn)
            .eq('agency_id', user.id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Mark messages as read (where sender was candidate)
        await (adminSupabase.from('agency_client_messages') as any)
            .update({ read_at: new Date().toISOString() }) // Using read_at for timestamped read status
            .eq('client_urn', params.urn)
            .eq('agency_id', user.id)
            .eq('sender_type', 'candidate')
            .is('read_at', null);

        return NextResponse.json({ messages: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
