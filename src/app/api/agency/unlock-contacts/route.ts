import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { consumeCreditsIfNoPremium } from '@/lib/api/credits';
import db from '@/db';

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

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { jobIds, source } = await req.json();
        // jobIds: array of job IDs (numbers for lmia, strings for trending)
        // source: 'lmia' | 'trending' | 'mixed'

        if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
            return NextResponse.json({ error: 'Job IDs required' }, { status: 400 });
        }

        const creditCost = jobIds.length;

        // Check and deduct credits (1 per employer)
        const hasSufficient = await consumeCreditsIfNoPremium(user.id, creditCost);
        if (!hasSufficient) {
            return NextResponse.json({ 
                error: `Insufficient credits. You need ${creditCost} credit(s) to unlock ${creditCost} employer(s).`,
                code: 'INSUFFICIENT_CREDITS',
                required: creditCost
            }, { status: 402 });
        }

        // Fetch employer contact data from both LMIA and trending_job tables
        const contacts: any[] = [];

        // Try LMIA table - query by job ID or employer name
        try {
            const { data: lmiaData } = await (db as any)
                .from('lmia')
                .select('id, Employer, employer_phone, employer_email, employer_address, JobTitle, Province')
                .in('id', jobIds)
                .limit(50);

            if (lmiaData?.length) {
                lmiaData.forEach((row: any) => {
                    contacts.push({
                        id: row.id,
                        employer: row.Employer,
                        phone: row.employer_phone || null,
                        email: row.employer_email || null,
                        address: row.employer_address || null,
                        job_title: row.JobTitle,
                        location: row.Province,
                        source: 'lmia'
                    });
                });
            }
        } catch (e) {
            console.error('LMIA contact fetch error:', e);
        }

        // Try trending_job table 
        try {
            const { data: trendingData } = await (db as any)
                .from('trending_job')
                .select('id, employer, employer_phone, employer_email, employer_address, job_title, state')
                .in('id', jobIds)
                .limit(50);

            if (trendingData?.length) {
                trendingData.forEach((row: any) => {
                    contacts.push({
                        id: row.id,
                        employer: row.employer,
                        phone: row.employer_phone || null,
                        email: row.employer_email || null,
                        address: row.employer_address || null,
                        job_title: row.job_title,
                        location: row.state,
                        source: 'trending'
                    });
                });
            }
        } catch (e) {
            console.error('Trending contact fetch error:', e);
        }

        return NextResponse.json({ 
            contacts,
            creditsDeducted: creditCost,
            message: `${creditCost} credit(s) used to unlock ${contacts.length} employer contact(s).`
        });
    } catch (error: any) {
        console.error('Unlock contacts error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
