import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import { PitchDeckInviteEmail } from "@/emails/pitch-deck-invite";
import { getAgencyProfile, getAgencyClient } from "@/lib/api/agency";

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

        const { clientId, urn, recipientEmail, recipientName } = await req.json();

        if (!clientId || !urn || !recipientEmail) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch Client and Agency Data
        const [client, agency] = await Promise.all([
            getAgencyClient(clientId),
            getAgencyProfile(user.id)
        ]);

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        const host = req.headers.get("host") || "jobmaze.ca";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`).replace(/\/$/, "");
        const pitchUrl = `${baseUrl}/pitch/${urn}`;

        let normalizedLogo = agency.logo_url;
        if (normalizedLogo && normalizedLogo.startsWith("/")) {
            normalizedLogo = `${baseUrl}${normalizedLogo}`;
        }

        // 2. Render the pitch deck invitation template
        const emailHtml = await render(
            <PitchDeckInviteEmail 
                candidateTitle={client.extracted_data?.position || "Qualified Candidate"}
                agencyName={agency.company_name || "Your Agency"}
                pitchUrl={pitchUrl}
                agencyLogo={normalizedLogo || undefined}
                recipientName={recipientName || "Hiring Professional"}
            />
        );

        // 3. Dispatch the email
        await sendEmail({
            to: recipientEmail,
            subject: `Candidate Introduction: ${client.extracted_data?.position || 'Top Talent'} via ${agency.company_name}`,
            html: emailHtml
        });

        return NextResponse.json({ success: true, message: "Pitch deck shared successfully via email" });

    } catch (error: any) {
        console.error("Send pitch deck email error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
