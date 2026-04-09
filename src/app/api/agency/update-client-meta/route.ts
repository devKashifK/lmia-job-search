import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.split("Bearer ")[1];

        const supabase = await createClient();
        let user;

        if (token) {
            const { data } = await supabase.auth.getUser(token);
            user = data?.user;
        } else {
            const { data } = await supabase.auth.getUser();
            user = data?.user;
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { clientId, extractedData } = await req.json();

        if (!clientId || !extractedData) {
            return NextResponse.json({ error: "Client ID and Data are required" }, { status: 400 });
        }

        // Use Admin Client for database update
        const adminClient = await (await import("@/utils/supabase/server")).createAdminClient();
        
        const { data: updatedClient, error: updateError } = await (adminClient.from('agency_clients') as any)
            .update({
                extracted_data: extractedData
            })
            .eq('id', clientId)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, client: updatedClient });

    } catch (error: any) {
        console.error("Update meta error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
