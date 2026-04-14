import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

const ALLOWED_FIELDS = [
    'age', 
    'experience_years', 
    'education_level', 
    'language_clb', 
    'noc_teer', 
    'job_offer'
];

export async function POST(req: NextRequest) {
    try {
        const { urn, pin, updates } = await req.json();

        if (!urn || !pin || !updates) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = await createAdminClient();

        // 1. Verify PIN and URN
        const { data: strategy, error: stratError } = await (supabase.from('agency_client_strategies') as any)
            .select('access_pin, client_urn')
            .ilike('client_urn', urn)
            .single();

        if (stratError || !strategy) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        if (strategy.access_pin !== pin) {
            return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
        }

        // 2. Fetch current client data to merge
        const { data: client, error: clientError } = await (supabase.from('agency_clients') as any)
            .select('id, extracted_data')
            .ilike('urn', urn)
            .single();

        if (clientError || !client) {
            return NextResponse.json({ error: "Client record missing" }, { status: 404 });
        }

        // 3. Filter updates to allowed fields only
        const filteredUpdates: any = {};
        for (const key of ALLOWED_FIELDS) {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key];
            }
        }

        if (Object.keys(filteredUpdates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        // 4. Merge and Update
        const newExtractedData = {
            ...(client.extracted_data || {}),
            ...filteredUpdates,
            updated_by: 'public_portal'
        };

        const { data: updatedClient, error: updateError } = await (supabase.from('agency_clients') as any)
            .update({
                extracted_data: newExtractedData,
                updated_at: new Date().toISOString()
            })
            .eq('id', client.id)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({ 
            success: true, 
            message: "Profile updated successfully",
            updatedData: updatedClient.extracted_data 
        });

    } catch (error: any) {
        console.error("Public update error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
