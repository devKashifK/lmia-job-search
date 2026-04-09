import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import db from "@/db";
import { parseAgencyResume } from "@/lib/api/internal/agency-parser";

export const maxDuration = 300;

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

        const { clientId, resumeUrl } = await req.json();

        if (!clientId || !resumeUrl) {
            return NextResponse.json({ error: "Client ID and Resume URL are required" }, { status: 400 });
        }

        // 0. Use Admin Client for secure operations
        const adminClient = await (await import("@/utils/supabase/server")).createAdminClient();

        // 1. Download file securely using Admin Storage Client
        // Extract the relative path from the public/authenticated URL
        // URL format: .../storage/v1/object/[public|authenticated]/agency-resumes/[user-id]/[filename]
        const pathMatch = resumeUrl.match(/agency-resumes\/(.+)$/);
        const storagePath = pathMatch ? pathMatch[1] : null;

        if (!storagePath) {
            throw new Error("Invalid resume URL format - could not extract storage path");
        }

        const { data: fileData, error: downloadError } = await adminClient.storage
            .from('agency-resumes')
            .download(storagePath);

        if (downloadError || !fileData) {
            console.error("Storage download error:", downloadError);
            throw new Error(`Failed to download resume from storage: ${downloadError?.message || 'Empty file'}`);
        }

        const buffer = Buffer.from(await fileData.arrayBuffer());

        // 2. Fetch DB Context
        let dbContext: { jobTitles: string[], nocCodes: string[], employers: string[] } = { jobTitles: [], nocCodes: [], employers: [] };
        try {
            const [lmiaTitles, trendingTitles, lmiaNocs, lmiaEmployers, trendingEmployers] = await Promise.all([
                (db as any).rpc('get_distinct_values_with_count', { table_name: 'lmia', column_name: 'JobTitle' }),
                (db as any).rpc('get_distinct_values_with_count', { table_name: 'trending_job', column_name: 'job_title' }),
                (db as any).rpc('get_distinct_values_with_count', { table_name: 'lmia', column_name: 'noc_code' }),
                (db as any).rpc('get_distinct_values_with_count', { table_name: 'lmia', column_name: 'Employer' }),
                (db as any).rpc('get_distinct_values_with_count', { table_name: 'trending_job', column_name: 'employer' })
            ]);

            const allTitles = [...(lmiaTitles.data || []), ...(trendingTitles.data || [])].map((r: any) => r.name);
            const allEmployers = [...(lmiaEmployers.data || []), ...(trendingEmployers.data || [])].map((r: any) => r.name);
            
            dbContext.jobTitles = [...new Set(allTitles)].filter(t => t && t.length > 2).slice(0, 100);
            dbContext.nocCodes = (lmiaNocs.data || []).map((r: any) => String(r.name)).slice(0, 100);
            dbContext.employers = [...new Set(allEmployers)].filter(e => e && e.length > 2).slice(0, 100);
        } catch (dbErr) {
            console.error("Context fetch error:", dbErr);
        }

        // 3. Parse
        const mimeType = "application/pdf"; // Assume or detect from URL if possible
        const profileData = await parseAgencyResume(buffer, mimeType, resumeUrl, dbContext);

        // 3.5 Database-Verified Employers
        try {
            const { data: dbEmployers } = await (db as any).rpc('get_matching_employers', {
                p_noc_codes: profileData.recommended_noc_codes || [],
                p_job_titles: profileData.recommended_job_titles || []
            });

            if (dbEmployers && dbEmployers.length > 0) {
                profileData.recommended_employers = dbEmployers.map((e: any) => e.name);
            }
        } catch (rpcErr) {
            console.error("Employer matching RPC error:", rpcErr);
        }

        // 3.6 Ensure Canadian Target Location
        // If the extracted location is outside Canada and AI suggested a target province, use it
        if (profileData.target_canadian_province) {
            profileData.location = profileData.target_canadian_province;
        }

        // 4. Use Admin Client for database update to ensure RLS doesn't block refresh 
        // after user identity has already been verified by getUser()
        const { data: updatedClient, error: updateError } = await (adminClient.from('agency_clients') as any)
            .update({
                full_name: profileData.name || undefined,
                email: profileData.email || undefined,
                phone: profileData.phone || undefined,
                extracted_data: profileData
            })
            .eq('id', clientId)
            .select()
            .single();

        if (updateError) {
            console.error("Database update error during re-analysis:", updateError);
            throw new Error(`Failed to update client record: ${updateError.message}`);
        }

        return NextResponse.json({ success: true, client: updatedClient });

    } catch (error: any) {
        console.error("Re-analyze error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
