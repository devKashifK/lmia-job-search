import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import mammoth from "mammoth";
import db from "@/db";
import { parseAgencyResume } from "@/lib/api/internal/agency-parser";

// Initialize Gemini with key validation
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

export const maxDuration = 300; // Increased timeout for multi-resume processing

function generateURN() {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0').toUpperCase().substring(0, 4);
    return `JBZ-${year}-${randomHex}`;
}


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
            console.error("Upload Error: No authenticated user found.");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use Admin Client to bypass flaky Storage RLS after manual auth check
        const adminClient = await (await import("@/utils/supabase/server")).createAdminClient();

        const formData = await req.formData();
        const files = formData.getAll('resumes') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const results = [];

        for (const file of files) {
            try {
                // 1. Upload to Supabase Storage using Admin Client
                const fileExt = file.name.split('.').pop();
                const randomName = `${Math.random().toString(36).substring(2, 10)}`;
                const fileName = `${randomName}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await adminClient.storage
                    .from('agency-resumes')
                    .upload(filePath, file, { 
                        upsert: true,
                        contentType: file.type 
                    });

                if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

                const { data: { publicUrl } } = adminClient.storage
                    .from('agency-resumes')
                    .getPublicUrl(filePath);

                // 1.5 Fetch DB Context for AI GUIDANCE (Enriched from both tables)
                let dbContext: { jobTitles: string[], nocCodes: string[], employers: string[] } = { 
                    jobTitles: [], 
                    nocCodes: [], 
                    employers: [] 
                };
                try {
                    const [lmiaTitles, trendingTitles, lmiaNocs, lmiaEmployers, trendingEmployers] = await Promise.all([
                        (db as any).rpc('get_distinct_values_with_count', { table_name: 'lmia', column_name: 'JobTitle' }),
                        (db as any).rpc('get_distinct_values_with_count', { table_name: 'trending_job', column_name: 'job_title' }),
                        (db as any).rpc('get_distinct_values_with_count', { table_name: 'lmia', column_name: 'noc_code' }),
                        (db as any).rpc('get_distinct_values_with_count', { table_name: 'lmia', column_name: 'Employer' }),
                        (db as any).rpc('get_distinct_values_with_count', { table_name: 'trending_job', column_name: 'employer' })
                    ]);

                    // Merge and Deduplicate
                    const allTitles = [...(lmiaTitles.data || []), ...(trendingTitles.data || [])].map((r: any) => r.name);
                    const allEmployers = [...(lmiaEmployers.data || []), ...(trendingEmployers.data || [])].map((r: any) => r.name);
                    
                    dbContext.jobTitles = [...new Set(allTitles)].filter(t => t && t.length > 2);
                    dbContext.nocCodes = (lmiaNocs.data || []).map((r: any) => String(r.name));
                    dbContext.employers = [...new Set(allEmployers)].filter(e => e && e.length > 2);
                } catch (dbErr) {
                    console.error("Context fetch error:", dbErr);
                }

                // 2. Process File Content using ISOLATED utility
                const buffer = Buffer.from(await file.arrayBuffer());
                const profileData = await parseAgencyResume(buffer, file.type, file.name, dbContext);

                // 3. Final Step: Database-Verified Employers
                // After AI analysis, we verify which companies actually hire for these roles
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

                // 4. Save to Database using Admin Client
                const urn = `CL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                const { data: clientRecord, error: dbError } = await (adminClient.from('agency_clients') as any)
                    .insert({
                        agency_id: user.id,
                        urn,
                        full_name: profileData.name || file.name.split('.')[0],
                        email: profileData.email || "",
                        phone: profileData.phone || "",
                        resume_url: publicUrl,
                        extracted_data: profileData,
                        status: 'active'
                    })
                    .select()
                    .single();

                if (dbError) throw new Error(`Database error: ${dbError.message}`);

                results.push({ success: true, fileName: file.name, client: clientRecord });
            } catch (err: any) {
                console.error(`Error processing ${file.name}:`, err);
                results.push({ success: false, fileName: file.name, error: err.message });
            }
        }

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error("Master upload error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
