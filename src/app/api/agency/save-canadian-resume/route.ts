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

        const { clientId, resumeData } = await req.json();

        if (!clientId || !resumeData) {
            return NextResponse.json({ error: "Client ID and Resume Data are required" }, { status: 400 });
        }

        // Use Admin Client to bypass RLS for updating internal field
        const adminClient = await (await import("@/utils/supabase/server")).createAdminClient();

        // Fetch current extracted_data
        const { data: client, error: fetchError } = await adminClient
            .from('agency_clients')
            .select('extracted_data')
            .eq('id', clientId)
            .single();

        if (fetchError) throw fetchError;

        const updatedData = {
            ...(client.extracted_data || {}),
            canadian_resume: resumeData
        };

        const { error: updateError } = await adminClient
            .from('agency_clients')
            .update({ extracted_data: updatedData })
            .eq('id', clientId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Save resume error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
