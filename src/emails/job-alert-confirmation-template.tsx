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

interface JobAlertConfirmationEmailProps {
    userName?: string;
    alertName?: string;
    criteriaSummary?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const JobAlertConfirmationEmail = ({
    userName = "Job Seeker",
    alertName = "Software Engineer in Toronto",
    criteriaSummary = "Software Engineer in Toronto, ON",
}: JobAlertConfirmationEmailProps) => {
    const previewText = `Your Job Maze Alert "${alertName}" is now active!`;

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

                        {/* Header Banner */}
                        <Section className="p-8 text-center bg-white border-b border-gray-100">
                            <Img
                                src="https://jobmaze.ca/logo.svg"
                                width="160"
                                alt="JobMaze"
                                className="mx-auto mb-6 object-contain"
                            />
                            <Heading className="text-gray-900 text-[26px] font-extrabold p-0 m-0 tracking-tight">
                                Your Job Alert is Active!
                            </Heading>
                        </Section>

                        {/* Body Content */}
                        <Section className="p-8">
                            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6 font-medium">
                                Hi {userName},
                            </Text>

                            <Text className="text-gray-600 text-[15px] leading-[26px] mb-8">
                                We will keep a close eye on the job market and notify you automatically as soon as highly relevant positions match your preferences.
                            </Text>

                            <Section className="bg-brand-50 rounded-xl p-6 mb-8 border-l-4 border-brand-500">
                                <Text className="text-brand-900 text-[13px] font-bold uppercase tracking-wider m-0 mb-2">
                                    Alert Details
                                </Text>
                                <Text className="text-gray-800 text-[16px] font-medium m-0">
                                    {alertName}
                                </Text>
                                <Text className="text-gray-500 text-[14px] leading-relaxed mt-2 mb-0">
                                    {criteriaSummary}
                                </Text>
                            </Section>

                            <Section className="text-center mt-8 mb-4">
                                <Button
                                    href={`${baseUrl}/dashboard/alerts`}
                                    className="bg-brand-600 outline-none border-none text-white text-[15px] font-bold px-8 py-4 rounded-xl hover:bg-brand-700 shadow-sm transition-all shadow-brand-500/20 w-fit"
                                >
                                    Manage Job Alerts
                                </Button>
                            </Section>

                            <Hr className="border-gray-200 mt-10 mb-8" />

                            <Text className="text-gray-400 text-[12px] leading-[20px] text-center max-w-[400px] mx-auto">
                                You are receiving this email because you created a Job Alert on JobMaze. You can update your preferences or unsubscribe at any time.
                                <br /><br />
                                <Link href={`${baseUrl}/dashboard/alerts`} className="text-brand-600 hover:text-brand-700 underline font-medium">Manage Preferences</Link>
                                {' • '}
                                <Link href={`${baseUrl}/dashboard/settings`} className="text-brand-600 hover:text-brand-700 underline font-medium">Unsubscribe</Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default JobAlertConfirmationEmail;
