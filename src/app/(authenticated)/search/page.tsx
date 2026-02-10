'use client';
import { SearchBox } from '@/components/ui/search-box';
import { SearchFeatures } from '@/components/search/features';
import { motion } from 'framer-motion';
import Footer from '@/pages/homepage/footer';
import { BottomNav } from '@/components/mobile/bottom-nav';
import Navbar from '@/components/ui/nabvar';
import useMobile from '@/hooks/use-mobile';


export default function Page() {
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white min-h-screen flex flex-col">
      <Navbar className="" />

      <main className="flex-grow pt-20 pb-16">
        {/* Added pt-20 to clear fixed navbar if needed, though SearchBox has its own padding */}


        {/* The Enhanced Search Box */}
        <SearchBox />

        {/* Features section with animation */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-7xl mx-auto px-6 mt-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                Why Use Our Job Search?
              </h2>
              <p className="text-gray-600 mt-2">
                Discover what makes our platform different
              </p>
            </div>

            <SearchFeatures />

            {/* Understanding Data Section */}
            <div className="mt-20 border-t border-gray-100 pt-16">
              <div className="bg-brand-50 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    New to the Canadian Job Market?
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Understanding NOC codes is crucial for your immigration journey.
                    Search by NOC to find jobs that match your eligibility.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                    <a
                      href="/resources/noc-codes"
                      className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-lg hover:shadow-brand-600/25"
                    >
                      Browse NOC Guide
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {!isMobile && <Footer />}
      {isMobile && <BottomNav />}
    </div>
  );
}
