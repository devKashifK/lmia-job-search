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

interface JobAlertEmailProps {
    userName?: string;
    alertName?: string;
    matchCount?: number;
    jobs?: {
        id: string;
        title: string;
        company: string;
        location: string;
        salary?: string;
        type?: string;
        postedAt: string;
        link: string;
    }[];
}

const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const JobAlertEmail = ({
    userName = "Job Seeker",
    alertName = "Software Engineer in Toronto",
    matchCount = 3,
    jobs = [
        {
            id: "1",
            title: "Senior Software Engineer",
            company: "TechCorp Inc.",
            location: "Toronto, ON",
            salary: "$120k - $150k",
            type: "Full-time",
            postedAt: "2 hours ago",
            link: `${baseUrl}/search`,
        },
        {
            id: "2",
            title: "Frontend Developer",
            company: "StartupXYZ",
            location: "Remote (Canada)",
            salary: "$90k - $110k",
            type: "Contract",
            postedAt: "5 hours ago",
            link: `${baseUrl}/search`,
        },
        {
            id: "3",
            title: "Full Stack Engineer",
            company: "Enterprise Solutions",
            location: "Vancouver, BC",
            salary: "$110k - $140k",
            type: "Full-time",
            postedAt: "1 day ago",
            link: `${baseUrl}/search`,
        },
    ],
}: JobAlertEmailProps) => {
    const previewText = `${matchCount} new jobs found for ${alertName}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
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
                <Body className="bg-gray-50 my-auto mx-auto font-sans text-gray-900 antialiased">
                    <Container className="border border-gray-200 my-[40px] mx-auto p-[20px] max-w-xl bg-white rounded-2xl shadow-sm">

                        {/* Logo */}
                        <Section className="mt-[24px]">
                            <div className="flex items-center gap-2">
                                <Img
                                    src={`${baseUrl}/logo.png`} // Assuming logo exists, or use a placeholder
                                    width="40"
                                    height="40"
                                    alt="JobMaze"
                                    className="rounded-lg"
                                />
                                <Text className="text-xl font-bold text-gray-900 tracking-tight ml-2 my-0">JobMaze</Text>
                            </div>
                        </Section>

                        <Heading className="text-gray-900 text-[24px] font-bold text-center p-0 my-[30px] mx-0">
                            {matchCount} New Jobs Found
                        </Heading>

                        <Text className="text-gray-500 text-[14px] leading-[24px] text-center mb-[32px]">
                            Hello {userName}, we found new opportunities matching your <strong>"{alertName}"</strong> alert.
                        </Text>

                        {/* Job Cards */}
                        <Section>
                            {jobs.map((job) => (
                                <Row key={job.id} className="mb-4 border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <Column className="p-4 bg-white">
                                        <Row>
                                            <Column>
                                                <Text className="text-[16px] font-semibold text-brand-700 m-0 p-0">
                                                    {job.title}
                                                </Text>
                                                <Text className="text-[14px] text-gray-500 m-0 mt-1">
                                                    {job.company} • {job.location}
                                                </Text>
                                            </Column>
                                        </Row>
                                        <Row className="mt-4">
                                            <Column>
                                                <div className="flex gap-2">
                                                    {job.salary && (
                                                        <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full font-medium mr-2">
                                                            {job.salary}
                                                        </span>
                                                    )}
                                                    <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full font-medium">
                                                        {job.type || 'Full-time'}
                                                    </span>
                                                </div>
                                            </Column>
                                            <Column align="right">
                                                <Button
                                                    href={job.link}
                                                    className="bg-brand-600 text-white text-[12px] font-semibold px-4 py-2 rounded-lg"
                                                >
                                                    View Job
                                                </Button>
                                            </Column>
                                        </Row>
                                    </Column>
                                </Row>
                            ))}
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                href={`${baseUrl}/dashboard/alerts`}
                                className="bg-white text-gray-900 border border-gray-200 text-[14px] font-medium px-6 py-3 rounded-full hover:bg-gray-50"
                            >
                                Manage Alerts
                            </Button>
                        </Section>

                        <Hr className="border-gray-200 mx-0 my-[26px]" />

                        <Text className="text-gray-400 text-[12px] leading-[20px] text-center">
                            You are receiving this email because you subscribed to Job Alerts on JobMaze.
                            <br />
                            <Link href={`${baseUrl}/dashboard/settings`} className="text-gray-400 underline">Unsubscribe</Link>
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default JobAlertEmail;
