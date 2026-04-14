import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
    Row,
    Column,
} from "@react-email/components";
import * as React from "react";

interface ClientPortalInviteEmailProps {
    clientName?: string;
    agencyName?: string;
    portalUrl?: string;
    accessPin?: string;
    agencyLogo?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobmaze.ca";

export const ClientPortalInviteEmail = ({
    clientName = "Candidate",
    agencyName = "JobMaze Agency",
    portalUrl = "https://jobmaze.ca/report/demo-urn",
    accessPin = "1234",
    agencyLogo,
}: ClientPortalInviteEmailProps) => {
    const previewText = `Welcome to your career portal at ${agencyName}.`;

    return (
        <Html>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: {
                                    50: "#f0fdf4",
                                    100: "#dcfce7",
                                    500: "#22c55e",
                                    600: "#16a34a",
                                    700: "#15803d",
                                    900: "#14532d",
                                },
                            },
                        },
                    },
                }}
            >
                <Head />
                <Preview>{previewText}</Preview>
                <Body className="bg-gray-50 my-auto mx-auto font-sans text-gray-800 antialiased py-8">
                    <Container className="border border-gray-100 my-[20px] mx-auto max-w-[580px] bg-white rounded-2xl shadow-md overflow-hidden">
                        
                        {/* Branding Header */}
                        <Section className="p-8 pb-4">
                            <Row>
                                <Column>
                                    <Img
                                        src="https://jobmaze.ca/job_maze_favicon_.svg"
                                        width="32"
                                        height="32"
                                        alt="JobMaze"
                                        className="mb-4"
                                    />
                                </Column>
                                {agencyLogo && (
                                    <Column align="right">
                                        <Img
                                            src={agencyLogo}
                                            height="32"
                                            alt={agencyName}
                                            className="mb-4 object-contain"
                                        />
                                    </Column>
                                )}
                            </Row>
                            <Heading className="text-gray-900 text-[24px] font-black p-0 m-0 tracking-tight leading-tight uppercase">
                                Your Career Portal is Ready
                            </Heading>
                            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                                Presented by {agencyName} • Powered by JobMaze
                            </Text>
                        </Section>

                        {/* Main Content */}
                        <Section className="px-8 pb-8">
                            <Text className="text-gray-700 text-[16px] leading-[26px] mb-4">
                                Hi {clientName},
                            </Text>
                            <Text className="text-gray-600 text-[15px] leading-[26px] mb-8">
                                Your professional career dashboard and immigration roadmap are now live. You can track your job search progress, view strategic insights, and prepare for interviews directly through this secure link.
                            </Text>

                            {/* PIN Box */}
                            <Section className="bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center mb-10">
                                <Text className="text-brand-900 text-[10px] font-black uppercase tracking-widest leading-none mb-3">
                                    Secure Access PIN
                                </Text>
                                <Text className="text-brand-700 text-[32px] font-black tracking-[0.5em] m-0 p-0 leading-none">
                                    {accessPin}
                                </Text>
                                <Text className="text-brand-800/60 text-[10px] font-medium mt-3">
                                    Keep this code private. You will need it to unlock your portal.
                                </Text>
                            </Section>

                            <Section className="text-center">
                                <Button
                                    href={portalUrl}
                                    className="bg-brand-600 outline-none border-none text-white text-[15px] font-black uppercase tracking-widest px-10 py-5 rounded-xl hover:bg-brand-700 shadow-xl shadow-brand-500/20 w-fit"
                                >
                                    Open Your Portal
                                </Button>
                            </Section>

                            <Text className="text-gray-500 text-[13px] leading-[24px] text-center mt-12">
                                Alternatively, you can copy and paste this link into your browser:
                                <br />
                                <Link href={portalUrl} className="text-brand-600 hover:text-brand-700 underline font-medium break-all">{portalUrl}</Link>
                            </Text>

                            <Hr className="border-gray-100 mt-12 mb-8" />

                            <Row>
                                <Column>
                                    <Text className="text-gray-400 text-[11px] leading-[18px]">
                                        © {new Date().getFullYear()} {agencyName}. All rights reserved.
                                        <br />
                                        Sent via JobMaze Immigration Intelligence.
                                    </Text>
                                </Column>
                                <Column align="right">
                                    <Link href="https://jobmaze.ca" className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">JobMaze.ca</Link>
                                </Column>
                            </Row>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ClientPortalInviteEmail;
