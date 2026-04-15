import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

// GET /api/agency/draws
// Returns recent IRCC draw history + eligible client counts per draw
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const token = req.headers.get("authorization")?.split("Bearer ")[1];
        const { data: { user } } = token
            ? await supabase.auth.getUser(token)
            : await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const adminSupabase = await createAdminClient();

        // 1. Fetch recent draws
        const { data: draws, error: drawError } = await (adminSupabase.from('ircc_draw_history') as any)
            .select('*')
            .order('draw_date', { ascending: false })
            .limit(10);

        if (drawError) throw drawError;

        // 2. Fetch clients with CRS data for this agency
        const { data: clients, error: clientError } = await (adminSupabase.from('agency_clients') as any)
            .select('urn, full_name, extracted_data')
            .eq('agency_id', user.id);

        if (clientError) throw clientError;

        // Filter clients who have valid CRS in extracted_data
        const clientsWithCRS = (clients || []).filter(c => c.extracted_data?.crs_score).map(c => ({
            urn: c.urn,
            full_name: c.full_name,
            crs_score: parseInt(c.extracted_data.crs_score)
        }));

        // 3. Compute eligibility for each draw
        const drawsWithEligibility = draws.map(draw => {
            const eligibleClients = clientsWithCRS.filter(c => c.crs_score >= draw.min_crs);
            const nearEligibleClients = clientsWithCRS.filter(c => c.crs_score < draw.min_crs && c.crs_score >= draw.min_crs - 50);

            return {
                ...draw,
                eligible_clients: eligibleClients,
                near_eligible_clients: nearEligibleClients,
                eligible_count: eligibleClients.length,
                near_eligible_count: nearEligibleClients.length
            };
        });

        return NextResponse.json({
            draws: drawsWithEligibility,
            total_clients: clientsWithCRS.length
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
