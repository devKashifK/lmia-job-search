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

export const ClientPortalInviteEmail = ({
    clientName = "Candidate",
    agencyName = "JobMaze Agency",
    portalUrl = "https://jobmaze.ca/report/demo-urn",
    accessPin = "1234",
    agencyLogo,
}: ClientPortalInviteEmailProps) => {
    const previewText = `Your secure career portal is ready at ${agencyName}.`;

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
                                    800: "#166534",
                                    900: "#14532d",
                                },
                            },
                        },
                    },
                }}
            >
                <Head />
                <Preview>{previewText}</Preview>
                <Body className="bg-slate-50 my-auto mx-auto font-sans text-slate-900 antialiased py-10">
                    <Container className="border border-slate-200 my-[20px] mx-auto max-w-[600px] bg-white rounded-3xl shadow-xl overflow-hidden">
                        
                        {/* Premium Header */}
                        <Section className="bg-brand-900 p-10 text-center">
                            <Row className="mb-8">
                                <Column align="center">
                                    <div className="bg-white/10 p-2.5 rounded-xl inline-block border border-white/20">
                                        <Img
                                            src="https://jobmaze.ca/job_maze_favicon_.svg"
                                            width="28"
                                            height="28"
                                            alt="JobMaze"
                                            className="invert brightness-0"
                                        />
                                    </div>
                                </Column>
                            </Row>
                            <Heading className="text-white text-[32px] font-black p-0 m-0 tracking-tighter leading-tight uppercase italic">
                                YOUR CAREER PORTAL IS READY
                            </Heading>
                            <Text className="text-brand-500/80 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
                                PREMIER IMMIGRATION INTELLIGENCE
                            </Text>
                        </Section>

                        <Section className="p-10">
                            {/* Agency Attribution */}
                            <Row className="mb-10 items-center">
                                <Column>
                                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest m-0">
                                        OFFICIALLY PRESENTED BY
                                    </Text>
                                    <Text className="text-slate-900 text-[16px] font-bold m-0 mt-1">
                                        {agencyName}
                                    </Text>
                                </Column>
                                {agencyLogo && (
                                    <Column align="right">
                                        <Img
                                            src={agencyLogo}
                                            height="40"
                                            alt={agencyName}
                                            className="object-contain"
                                        />
                                    </Column>
                                )}
                            </Row>

                            <Text className="text-slate-800 text-[18px] font-bold leading-[28px] mb-4">
                                Hello {clientName},
                            </Text>
                            <Text className="text-slate-600 text-[15px] leading-[26px] mb-8 font-medium">
                                Your exclusive career dashboard and strategic immigration roadmap are now fully activated. This secure environment has been curated by **{agencyName}** to track your progress and maximize your success.
                            </Text>

                            {/* Premium PIN Box */}
                            <Section className="bg-brand-50/50 border-2 border-brand-100 rounded-[2rem] p-8 text-center mb-10">
                                <Text className="text-brand-900 text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-4">
                                    SECURE ACCESS KEY
                                </Text>
                                <Section className="bg-white p-6 rounded-2xl border border-brand-100 shadow-sm inline-block min-w-[200px]">
                                    <Text className="text-brand-600 text-[42px] font-black tracking-[0.6em] m-0 p-0 leading-none mr-[-0.6em]">
                                        {accessPin}
                                    </Text>
                                </Section>
                                <Text className="text-slate-400 text-[10px] font-bold mt-6 italic">
                                    Confidential code. Required for portal authentication.
                                </Text>
                            </Section>

                            <Section className="text-center">
                                <Button
                                    href={portalUrl}
                                    className="bg-brand-600 border-none text-white text-[16px] font-black uppercase tracking-widest px-12 py-6 rounded-2xl hover:bg-brand-700 shadow-2xl shadow-brand-500/40 w-fit cursor-pointer"
                                >
                                    ACCESS YOUR PORTAL
                                </Button>
                            </Section>

                            <Text className="text-slate-400 text-[12px] leading-[24px] text-center mt-12 font-medium">
                                Trouble clicking the button? Copy and paste this secure link:
                                <br />
                                <Link href={portalUrl} className="text-brand-600 hover:text-brand-700 underline font-black">{portalUrl}</Link>
                            </Text>

                            <Hr className="border-slate-100 mt-12 mb-10" />

                            <Row className="items-center">
                                <Column>
                                    <Text className="text-slate-300 text-[10px] leading-[18px] font-bold uppercase tracking-widest">
                                        © {new Date().getFullYear()} {agencyName}
                                        <br />
                                        <span className="text-slate-300/50">POWERED BY JOBMAZE INTELLIGENCE</span>
                                    </Text>
                                </Column>
                                <Column align="right">
                                    <Link href="https://jobmaze.ca" className="text-slate-300 text-[12px] font-black uppercase tracking-widest hover:text-brand-600 transition-colors">JOBMAZE.CA</Link>
                                </Column>
                            </Row>
                        </Section>
                    </Container>
                    
                    <Text className="text-slate-400 text-[10px] text-center px-10 max-w-[600px] mx-auto leading-relaxed">
                        This is a secure communication sent on behalf of {agencyName}. If you were not expecting this message, please contact the agency directly or ignore this email.
                    </Text>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ClientPortalInviteEmail;
