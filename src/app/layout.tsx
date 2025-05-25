import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/hooks/use-session";
import ReactQueryProvider from "./react-query-provider";
import { SheetProvider } from "@/context/sheet-context";
import { ThemeProvider } from "@/components/ui/theme-provider";
import ClientLayout from "./client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Maze - LMIA Job Search",
  description: "Find LMIA jobs in Canada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ReactQueryProvider>
            <SheetProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <ClientLayout>{children}</ClientLayout>
                <Toaster />
              </ThemeProvider>
            </SheetProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
