import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import JobAlertEmail from '@/emails/job-alert-template';
import { render } from '@react-email/components';
import { subDays, subHours } from 'date-fns';

// Initialize a standard supabase admin client to bypass RLS for fetching users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        // 1. Verify Authorization Header
        const authHeader = request.headers.get('authorization');
        if (
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('--- Starting Job Alert Processing ---');
        let emailsSent = 0;
        let processingErrors = 0;

        // 2. Fetch Active Job Alerts
        const { data: alerts, error: alertsError } = await supabaseAdmin
            .from('job_alerts')
            .select('*')
            .eq('is_active', true);

        if (alertsError) throw alertsError;
        if (!alerts || alerts.length === 0) {
            return NextResponse.json({ message: 'No active alerts found', emailsSent: 0 });
        }

        console.log(`Found ${alerts.length} active alerts to process.`);

        // 3. Process Each Alert
        for (const alert of alerts) {
            try {
                // Parse Criteria
                const criteria = typeof alert.criteria === 'string'
                    ? JSON.parse(alert.criteria)
                    : alert.criteria;

                // Determine the Time Window based on frequency
                let timeWindow;
                const now = new Date();
                if (alert.frequency === 'daily') {
                    timeWindow = subDays(now, 1).toISOString();
                } else if (alert.frequency === 'weekly') {
                    timeWindow = subDays(now, 7).toISOString();
                } else if (alert.frequency === 'instant') {
                    // For cron, "instant" usually means check last X hours based on cron frequency.
                    // Assuming cron runs hourly:
                    timeWindow = subHours(now, 1).toISOString();
                } else {
                    timeWindow = subDays(now, 1).toISOString(); // Default to Daily
                }

                // Temporary Match Holder
                const matchedJobs: any[] = [];
                const maxMatches = 5;

                // 4. Query trending_jobs based on criteria
                let trendingQuery = supabaseAdmin
                    .from('trending_jobs')
                    .select('id, title, company, location, date_posted, url')
                    .gte('created_at', timeWindow)
                    .order('created_at', { ascending: false })
                    .limit(maxMatches);

                if (criteria.title) trendingQuery = trendingQuery.ilike('title', `%${criteria.title}%`);
                if (criteria.location) trendingQuery = trendingQuery.ilike('location', `%${criteria.location}%`);
                if (criteria.province) trendingQuery = trendingQuery.ilike('location', `%${criteria.province}%`);
                if (criteria.company) trendingQuery = trendingQuery.ilike('company', `%${criteria.company}%`);

                const { data: trendingResults } = await trendingQuery;
                if (trendingResults) matchedJobs.push(...trendingResults.map(job => ({ ...job, type: 'Trending' })));


                // 5. Query lmia_approved_employers based on criteria
                // Note: LMIA database structure implies company-level focus, but some users might search LMIA tables via alert.
                if (matchedJobs.length < maxMatches) {
                    let lmiaQuery = supabaseAdmin
                        .from('lmia_approved_employers')
                        .select('id, employer_name, city, province, occupation, approved_lmia, created_at')
                        .gte('created_at', timeWindow)
                        .order('created_at', { ascending: false })
                        .limit(maxMatches - matchedJobs.length);

                    if (criteria.title) lmiaQuery = lmiaQuery.ilike('occupation', `%${criteria.title}%`);
                    if (criteria.location) lmiaQuery = lmiaQuery.ilike('city', `%${criteria.location}%`);
                    if (criteria.province) lmiaQuery = lmiaQuery.ilike('province', `%${criteria.province}%`);
                    if (criteria.company) lmiaQuery = lmiaQuery.ilike('employer_name', `%${criteria.company}%`);
                    if (criteria.noc_code) lmiaQuery = lmiaQuery.eq('noc_code', criteria.noc_code);

                    const { data: lmiaResults } = await lmiaQuery;
                    if (lmiaResults) {
                        matchedJobs.push(...lmiaResults.map(job => ({
                            id: job.id,
                            title: job.occupation,
                            company: job.employer_name,
                            location: `${job.city}, ${job.province}`,
                            type: 'LMIA Approved',
                            postedAt: job.created_at,
                            link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/compare?source=lmia&q=${encodeURIComponent(job.employer_name)}`
                        })));
                    }
                }

                // 6. Send Email if there are matches
                if (matchedJobs.length > 0) {
                    // Get User Email - Assuming alert.id = auth.users.id
                    // (Since standard users don't have access to auth.users, we use admin client)
                    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(alert.user_id || alert.id);

                    if (userError || !user?.email) {
                        console.error(`Could not find email for user ID ${alert.id}`, userError);
                        continue;
                    }

                    // Format Jobs for Email Template Component
                    const formattedJobs = matchedJobs.map(job => ({
                        id: job.id.toString(),
                        title: job.title,
                        company: job.company || job.employer_name,
                        location: job.location,
                        type: job.type,
                        postedAt: new Date(job.date_posted || job.postedAt || job.created_at || new Date()).toLocaleDateString(),
                        link: job.url || job.link || `${process.env.NEXT_PUBLIC_APP_URL}/search`
                    }));

                    // Render React Email HTML
                    const emailHtml = await render(
                        JobAlertEmail({
                            userName: user.user_metadata?.name || 'Job Seeker',
                            alertName: alert.name,
                            matchCount: formattedJobs.length,
                            jobs: formattedJobs
                        })
                    );

                    // Dispatch via Nodemailer Utility
                    await sendEmail({
                        to: user.email,
                        subject: `JobMaze: We found ${formattedJobs.length} new jobs for "${alert.name}"`,
                        html: emailHtml
                    });

                    emailsSent++;
                    console.log(`✅ Sent alert [${alert.name}] to ${user.email} with ${formattedJobs.length} matches.`);

                    // 7. Update last_triggered (Optional, requires DB column)
                    // await supabaseAdmin.from('job_alerts').update({ last_triggered: new Date().toISOString() }).eq('id', alert.id);
                }

            } catch (err) {
                console.error(`Failed to process alert ${alert.id}:`, err);
                processingErrors++;
            }
        }

        console.log('--- Finished Job Alert Processing ---');
        return NextResponse.json({
            message: 'Cron job completed',
            emailsSent,
            processingErrors,
        });

    } catch (error: any) {
        console.error('Master Cron Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
