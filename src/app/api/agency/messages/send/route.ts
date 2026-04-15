import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

// POST /api/agency/messages/send
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const token = req.headers.get("authorization")?.split("Bearer ")[1];
        const { data: { user } } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { clientUrn, content } = await req.json();

        if (!clientUrn || !content) {
            return NextResponse.json({ error: "clientUrn and content are required" }, { status: 400 });
        }

        const adminSupabase = await createAdminClient();

        const { data, error } = await (adminSupabase.from('agency_client_messages') as any)
            .insert({
                client_urn: clientUrn,
                agency_id: user.id,
                sender_type: 'agency',
                content,
                read_at: new Date().toISOString() // Agency's own message is considered read
            })
            .select()
            .single();

        if (error) throw error;

        // Log to activity log
        await (adminSupabase.from('agency_activity_log') as any).insert({
            client_urn: clientUrn,
            agency_id: user.id,
            action_type: 'message_sent',
            description: `Sent message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            metadata: { message_id: data.id }
        }).then(() => {}).catch(() => {});

        return NextResponse.json({ success: true, message: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
