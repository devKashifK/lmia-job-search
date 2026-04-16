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

interface PitchDeckInviteEmailProps {
    candidateTitle?: string;
    agencyName?: string;
    pitchUrl?: string;
    agencyLogo?: string;
    recipientName?: string;
}

export const PitchDeckInviteEmail = ({
    candidateTitle = "Qualified Candidate",
    agencyName = "JobMaze Agency",
    pitchUrl = "https://jobmaze.ca/pitch/demo-urn",
    agencyLogo,
    recipientName = "Hiring Manager",
}: PitchDeckInviteEmailProps) => {
    const previewText = `New Candidate Introduction: ${candidateTitle} via ${agencyName}.`;

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
                        <Section className="bg-slate-900 p-10 text-center">
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
                            <Heading className="text-white text-[28px] font-black p-0 m-0 tracking-tighter leading-tight uppercase italic">
                                CANDIDATE INTRODUCTION
                            </Heading>
                            <Text className="text-brand-500/80 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
                                EXCLUSIVE TALENT ADVISORY
                            </Text>
                        </Section>

                        <Section className="p-10">
                            {/* Agency Attribution */}
                            <Row className="mb-10 items-center">
                                <Column>
                                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest m-0">
                                        PRESENTED TO YOU BY
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
                                Hello {recipientName},
                            </Text>
                            <Text className="text-slate-600 text-[15px] leading-[26px] mb-8 font-medium">
                                We are pleased to introduce a highly qualified candidate for a potential **{candidateTitle}** role within your organization. 
                                <br /><br />
                                This blind profile contains their full skills matrix, experience breakdown, and verified credentials, curated by our talent strategy team at **{agencyName}**.
                            </Text>

                            <Section className="text-center bg-slate-50 rounded-3xl p-10 border border-slate-100 mb-10">
                                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">
                                    ACCESS COMPREHENSIVE DOSSIER
                                </Text>
                                <Button
                                    href={pitchUrl}
                                    className="bg-brand-600 border-none text-white text-[14px] font-black uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-500/20 w-fit cursor-pointer"
                                >
                                    VIEW PITCH DECK
                                </Button>
                            </Section>

                            <Text className="text-slate-400 text-[12px] leading-[24px] text-center font-medium px-4">
                                To protect candidate privacy, some personal identifiers have been removed. Full contact details are available upon your request to {agencyName}.
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
                        This is a professional introduction sent on behalf of {agencyName}. If you have any questions regarding this candidate, please reply to this email or contact the agency directly.
                    </Text>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default PitchDeckInviteEmail;
