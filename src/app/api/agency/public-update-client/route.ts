import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

const ALLOWED_FIELDS = [
    'email',
    'phone',
    'location',
    'current_location',
    'age', 
    'experience_years', 
    'education_level', 
    'language_clb', 
    'second_language_clb',
    'noc_teer', 
    'job_offer',
    'marital_status',
    'spouse_accompanying',
    'has_canadian_education',
    'canadian_experience_years',
    'foreign_experience_years',
    'has_canadian_sibling',
    'has_pnp',
    'provincial_ties',
    'target_region',
    'skilled_exp_recent',
    'skilled_exp_older',
    'job_offer_wage', 
    'has_bc_experience',
    'has_bc_education'
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
            .select('id, email, phone, extracted_data')
            .ilike('urn', urn)
            .single();

        if (clientError || !client) {
            return NextResponse.json({ error: "Client record missing" }, { status: 404 });
        }

        // 3. Filter updates and separate top-level vs JSON
        const filteredJsonUpdates: any = {};
        const topLevelUpdates: any = {};

        for (const key of ALLOWED_FIELDS) {
            if (updates[key] !== undefined) {
                if (key === 'email' || key === 'phone') {
                    topLevelUpdates[key] = updates[key];
                } else {
                    filteredJsonUpdates[key] = updates[key];
                }
            }
        }

        if (Object.keys(filteredJsonUpdates).length === 0 && Object.keys(topLevelUpdates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        // 4. Merge JSON and Update
        const newExtractedData = {
            ...(client.extracted_data || {}),
            ...filteredJsonUpdates,
            updated_by: 'public_portal'
        };

        const { data: updatedClient, error: updateError } = await (supabase.from('agency_clients') as any)
            .update({
                ...topLevelUpdates,
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
