'use client';
import dynamic from 'next/dynamic';
import Footer from '@/pages/homepage/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Mail, Phone, Building2 } from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import { HoverCard } from '@/components/ui/hover-card';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';

// Dynamically import the Map component with SSR disabled
const DynamicMap = dynamic(() => import('./map'), { ssr: false });

export default function ContactPage() {
  const { isMobile } = useMobile();

  return (
    <div className="min-h-screen bg-brand-50/80 flex flex-col">
      {isMobile ? (
        <MobileHeader title="Contact Us" showBack={true} />
      ) : (
        <Navbar />
      )}

      {/* Unified Hero + Get in Touch Section */}
      <section className="relative py-24 bg-white overflow-hidden">
        {/* Abstract SVG background */}
        <svg
          className="absolute left-1/2 top-0 -translate-x-1/2"
          width="900"
          height="400"
          fill="none"
        >
          <ellipse
            cx="450"
            cy="200"
            rx="400"
            ry="120"
            fill="url(#hero-gradient)"
            fillOpacity="0.15"
          />
          <defs>
            <linearGradient
              id="hero-gradient"
              x1="0"
              x2="900"
              y1="0"
              y2="400"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#bbf7d0" />
              <stop offset="1" stopColor="#4ade80" />
            </linearGradient>
          </defs>
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-12 max-w-xl mx-auto text-center border border-brand-100 mb-12">
            <span className="inline-flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-brand-500" />
              <span className="uppercase text-xs font-semibold text-brand-600 tracking-widest">
                Contact
              </span>
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              How can we help you?
            </h1>
            <p className="text-lg text-gray-600 mb-0">
              Our team is ready to answer your questions and support your
              journey.
            </p>
          </div>
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phone Card */}
            <HoverCard>
              <div className="bg-white/90 border border-brand-100 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600 mb-2">
                  Call us for immediate assistance.
                </p>
                <span className="text-brand-600 font-semibold">
                  +918810686447
                </span>
              </div>
            </HoverCard>
            {/* Email Card */}
            <HoverCard>
              <div className="bg-white/90 border border-brand-100 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 mb-2">
                  Email us for support or business inquiries.
                </p>
                <div className="flex flex-col gap-1">
                  <a
                    href="mailto:hello@jobmaze.ca"
                    className="text-brand-600 hover:underline font-medium"
                  >
                    info@jobmaze.ca
                  </a>
                  <a
                    href="mailto:support@jobmaze.ca"
                    className="text-brand-600 hover:underline font-medium"
                  >
                    support@jobmaze.ca
                  </a>
                </div>
              </div>
            </HoverCard>
            {/* Office Card */}
            <HoverCard>
              <div className="bg-white/90 border border-brand-100 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Office</h3>
                <p className="text-gray-600 mb-2">Visit our office.</p>
                <span className="text-brand-600 font-semibold">
                  GTR WORLDWIDE SERVICES PVT LTD
                </span>
                <span className="text-brand-600 font-semibold">
                  Kankaria Estate, 6, Little Russel St, Maidan, Midleton Row,
                  Park Street area, Kolkata, West Bengal 700071
                </span>
              </div>
            </HoverCard>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <Card className="border-none shadow-lg overflow-hidden rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-brand-500 to-red-600 border-b flex items-center gap-2">
              <MapPin className="w-5 h-5 text-white mr-2" />
              <CardTitle className="text-lg font-semibold text-white">
                Our Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DynamicMap />
            </CardContent>
          </Card>
        </div>
      </section>

      {!isMobile && <Footer />}
      {isMobile && <BottomNav />}
    </div>
  );
}
