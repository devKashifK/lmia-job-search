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
} from "@react-email/components";
import * as React from "react";

interface AuthConfirmationEmailProps {
    confirmationUrl?: string;
    token?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://jobmaze.ca";

export const AuthConfirmationEmail = ({
    confirmationUrl = "{{ .ConfirmationURL }}",
    token = "{{ .Token }}",
}: AuthConfirmationEmailProps) => {
    const previewText = "Please verify your email address to join JobMaze.";

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
                                Confirm Your Email
                            </Heading>
                        </Section>

                        {/* Body Content */}
                        <Section className="p-8">
                            <Text className="text-gray-700 text-[16px] leading-[26px] mb-6 font-medium">
                                Welcome to Job Maze!
                            </Text>

                            <Text className="text-gray-600 text-[15px] leading-[26px] mb-8">
                                Please verify your email address. This ensures we can securely recover your account and send you important job alerts.
                            </Text>

                            <Section className="text-center mt-4 mb-4">
                                <Button
                                    href={confirmationUrl}
                                    className="bg-brand-600 outline-none border-none text-white text-[15px] font-bold px-8 py-4 rounded-xl hover:bg-brand-700 shadow-sm transition-all shadow-brand-500/20 w-fit"
                                >
                                    Verify Email Address
                                </Button>
                            </Section>

                            <Text className="text-gray-500 text-[14px] leading-[24px] text-center mt-8">
                                Alternatively, you can enter this code manually:
                                <br />
                                <strong className="text-gray-800 text-[20px] tracking-widest mt-2 inline-block">{token}</strong>
                            </Text>

                            <Hr className="border-gray-200 mt-10 mb-8" />

                            <Text className="text-gray-400 text-[12px] leading-[20px] text-center max-w-[400px] mx-auto">
                                If you did not create an account with JobMaze, you can safely ignore this email.
                                <br /><br />
                                <Link href={`${baseUrl}`} className="text-brand-600 hover:text-brand-700 underline font-medium">Job Maze Inc.</Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default AuthConfirmationEmail;
