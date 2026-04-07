import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from 'sonner';
import { SessionProvider } from '@/hooks/use-session';
import ReactQueryProvider from './react-query-provider';
import { SheetProvider } from '@/context/sheet-context';
import { ThemeProvider } from '@/components/ui/theme-provider';
import ClientLayout from './client-layout';
import Script from 'next/script';
import { ControlContextProvider } from '@/context/control';
import { TrialProvider } from '@/context/trial';
import { PreventCopyPaste } from '@/components/security/prevent-copy-paste';
import Honeypot from '@/components/security/honeypot';

const baseFont = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jobmaze.ca'),
  title: 'JobMaze – AI Job Search Platform for Canada Jobs',
  description: 'Discover jobs across Canada with JobMaze. Search real-time vacancies, LMIA opportunities, and immigration-friendly jobs with powerful AI search tools.',
  keywords: ['canada jobs', 'lmia jobs canada', 'job search canada', 'noc job search', 'jobmaze'],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://jobmaze.ca',
    title: 'JobMaze – AI Job Search Platform for Canada Jobs',
    description: 'Discover jobs across Canada with JobMaze. Search real-time vacancies, LMIA opportunities, and immigration-friendly jobs with powerful AI search tools.',
    siteName: 'JobMaze',
    images: [{
      url: '/feature_image_jobmaze.svg',
      width: 1200,
      height: 630,
      alt: 'JobMaze – AI Job Search Platform for Canada Jobs',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobMaze – AI Job Search Platform for Canada Jobs',
    description: 'Discover jobs across Canada with JobMaze. Search real-time vacancies, LMIA opportunities, and immigration-friendly jobs with powerful AI search tools.',
    images: ['/feature_image_jobmaze.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={baseFont.variable}>
      <body className={baseFont.className} suppressHydrationWarning>
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "u1pca7jweu");
            `,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZYBB5TFE36"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZYBB5TFE36', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <TrialProvider>
          <SessionProvider>
            <ControlContextProvider>
              <ReactQueryProvider>
                <SheetProvider>
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                  >
                    <PreventCopyPaste />
                    <ClientLayout>
                      <Honeypot />
                      {children}
                    </ClientLayout>
                    <Toaster />
                    <Sonner position="top-right" richColors closeButton />
                  </ThemeProvider>
                </SheetProvider>
              </ReactQueryProvider>
            </ControlContextProvider>
          </SessionProvider>
        </TrialProvider>
      </body>
    </html>
  );
}
