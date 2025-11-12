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
import Script from 'next/script'; // 👈 add this
import { ControlContextProvider } from '@/context/control';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Maze - LMIA Job Search',
  description: 'Find LMIA jobs in Canada',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Microsoft Clarity */}
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
        {/* Google tag (gtag.js) */}
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
        {/* <ControlContextProvider> */}
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
                <Sonner position="top-right" richColors closeButton />
              </ThemeProvider>
            </SheetProvider>
          </ReactQueryProvider>
        </SessionProvider>
        {/* </ControlContextProvider> */}
      </body>
    </html>
  );
}
