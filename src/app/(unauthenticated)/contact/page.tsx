'use client';
import dynamic from 'next/dynamic';
import Footer from '@/pages/homepage/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Mail, Phone, Building2, ExternalLink } from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import useMobile from '@/hooks/use-mobile';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';
import { motion } from 'framer-motion';

// Dynamically import the Map component with SSR disabled
const DynamicMap = dynamic(() => import('./map'), { ssr: false });

export default function ContactPage() {
  const { isMobile } = useMobile();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      {isMobile ? (
        <MobileHeader title="Contact Us" showBack={true} />
      ) : (
        <Navbar />
      )}

      <main className="flex-grow">
        {/* Hero Section - Clean & Modern */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          {/* Subtle background mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 -z-10" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50/50 rounded-full blur-3xl -mr-32 -mt-32 -z-20" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                We're Here to Help
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                Let's Start a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-500">Conversation</span>
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-light">
                Have questions about our API, enterprise plans, or just want to say hello? We'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Cards Section - Refined Layout */}
        <section className="bg-white relative z-20 pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Phone Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-brand-100/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-3xl" />
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                  Mon-Fri from 9am to 6pm EST.
                </p>
                <a href="tel:+18881234567" className="inline-flex items-center text-lg font-bold text-gray-900 hover:text-brand-600 transition-colors">
                  +1 (888) 123-4567 <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </motion.div>

              {/* Email Card - Featured */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="group relative bg-white rounded-3xl p-8 border border-brand-200 shadow-2xl shadow-brand-100/30 hover:-translate-y-2 hover:shadow-brand-200/40 transition-all duration-300 ring-1 ring-brand-100"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-3xl" />
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                  For general inquiries and support.
                </p>
                <div className="flex flex-col gap-2">
                  <a href="mailto:info@jobmaze.ca" className="inline-flex items-center text-lg font-bold text-gray-900 hover:text-brand-600 transition-colors">
                    info@jobmaze.ca <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a href="mailto:support@jobmaze.ca" className="inline-flex items-center text-lg font-bold text-gray-900 hover:text-brand-600 transition-colors">
                    support@jobmaze.ca <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </motion.div>

              {/* Office Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-brand-100/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-3xl" />
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Headquarters</h3>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                  Come say hello at our office.
                </p>
                <div className="text-gray-900 font-bold text-sm">
                  Little Russel St, Kolkata <br />
                  <span className="text-gray-500 font-normal">West Bengal 700071</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section - Seamless Integration */}
        <section className="bg-gray-50 pt-24 pb-24 border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
              <p className="text-gray-500">Find us on the map below.</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200 ring-8 ring-white">
                <div className="absolute inset-0 pointer-events-none border border-gray-200/50 rounded-[2.5rem] z-10" />
                {/* Map Container */}
                <div className="h-[450px] bg-gray-100">
                  <DynamicMap />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {!isMobile && <Footer />}
      {isMobile && <BottomNav />}
    </div>
  );
}
