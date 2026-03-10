import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import JobAlertConfirmationEmail from '@/emails/job-alert-confirmation-template';
import { render } from '@react-email/components';

// Initialize a standard supabase admin client to bypass RLS for fetching users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, alertName, criteriaSummary } = body;

        if (!userId || !alertName) {
            return NextResponse.json(
                { error: 'Missing userId or alertName' },
                { status: 400 }
            );
        }

        // Fetch User Email securely on backend
        const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (userError || !user?.email) {
            console.error(`Could not find email for user ID ${userId}`, userError);
            return NextResponse.json({ error: 'User email not found' }, { status: 404 });
        }

        // Render React Email HTML
        const emailHtml = await render(
            JobAlertConfirmationEmail({
                userName: user.user_metadata?.name || 'Job Seeker',
                alertName: alertName,
                criteriaSummary: criteriaSummary || "Custom Search Criteria"
            })
        );

        // Dispatch via Nodemailer Utility
        await sendEmail({
            to: user.email,
            subject: `JobMaze: Your Job Alert "${alertName}" is active!`,
            html: emailHtml
        });

        console.log(`✅ Sent confirmation email for alert [${alertName}] to ${user.email}`);

        return NextResponse.json({ success: true, message: 'Confirmation email sent' });

    } catch (error: any) {
        console.error('Confirmation Email API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
