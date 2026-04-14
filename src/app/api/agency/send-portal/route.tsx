import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import { ClientPortalInviteEmail } from "@/emails/client-portal-invite";
import { getAgencyProfile, getAgencyClient, getClientStrategy } from "@/lib/api/agency";

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

        const { clientId, urn } = await req.json();

        if (!clientId || !urn) {
            return NextResponse.json({ error: "Client ID and URN are required" }, { status: 400 });
        }

        // 1. Fetch Client, Agency, and Strategy Data
        const [client, agency, strategy] = await Promise.all([
            getAgencyClient(clientId),
            getAgencyProfile(user.id),
            getClientStrategy(urn)
        ]);

        if (!client || !client.email) {
            return NextResponse.json({ error: "Client or client email not found" }, { status: 404 });
        }

        const host = req.headers.get("host") || "jobmaze.ca";
        const protocol = host.includes("localhost") ? "http" : "https";
        const portalUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}/report/${urn}`;
        const accessPin = strategy?.access_pin || "1234";

        // 2. Render the professional email template
        const emailHtml = await render(
            <ClientPortalInviteEmail 
                clientName={client.full_name || "Candidate"}
                agencyName={agency.company_name || "Your Agency"}
                portalUrl={portalUrl}
                accessPin={accessPin}
                agencyLogo={agency.logo_url || undefined}
            />
        );

        // 3. Dispatch the email
        await sendEmail({
            to: client.email,
            subject: `Access Your Career Portal - ${agency.company_name}`,
            html: emailHtml
        });

        return NextResponse.json({ success: true, message: "Portal access email sent successfully" });

    } catch (error: any) {
        console.error("Send portal email error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
