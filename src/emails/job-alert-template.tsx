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
                                {matchCount} New Jobs Found
                            </Heading>
                        </Section>

                        <Section className="p-8 pb-4">
                            <Text className="text-gray-700 text-[16px] leading-[26px] mb-2 font-medium">
                                Hi {userName},
                            </Text>
                            <Text className="text-gray-500 text-[15px] leading-[24px] mb-8">
                                We found new opportunities matching your <strong>"{alertName}"</strong> alert. Let's get you applying!
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
                        </Section>

                        {/* Footer */}
                        <Section className="px-8 pb-8">
                            <Hr className="border-gray-200 mt-10 mb-8" />
                            <Text className="text-gray-400 text-[12px] leading-[20px] text-center max-w-[400px] mx-auto m-0">
                                You are receiving this email because you subscribed to receive alerts for "{alertName}".
                                <br /><br />
                                <Link href={`${baseUrl}/dashboard/alerts`} className="text-brand-600 hover:text-brand-700 underline font-medium">Manage Alerts</Link>
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

export default JobAlertEmail;
