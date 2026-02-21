'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, ArrowRight, PieChart } from 'lucide-react';
import Navbar from '@/components/ui/nabvar';
import Footer from '@/sections/homepage/footer';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { BottomNav } from '@/components/mobile/bottom-nav';
import useMobile from '@/hooks/use-mobile';
import { CompanySearchBar } from '@/components/analysis/company-search-bar';
import { CompanyTierList } from '@/components/analysis/company-tier-list';
import { TopCompaniesList } from '@/components/analysis/top-companies-list';
import { CategorizedCompanies } from '@/components/analysis/categorized-companies';
import MarketStats from '@/components/analysis/market-stats';
import { FeaturedCompany } from '@/components/analysis/featured-company';
import { Button } from '@/components/ui/button';
import CustomLink from '@/components/ui/CustomLink';

function Analysis() {
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <BackgroundWrapper>
        {/* Navbar */}
        {!isMobile && <Navbar />}
        {isMobile && <MobileHeader title="Analysis" />}

        <div className={isMobile ? 'min-h-screen pt-4 pb-24' : 'min-h-screen pt-32 pb-20'}>
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-brand-50/50 via-white/20 to-transparent pointer-events-none -z-10" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-100/30 rounded-full blur-[100px] -mr-32 -mt-32 opacity-60 animate-pulse-slow -z-10" />
          <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[80px] -ml-20 opacity-40 -z-10" />

          <div className={isMobile ? 'container mx-auto px-4' : 'container mx-auto px-6'}>

            {/* Hero Section */}
            <div className="text-center mb-12 lg:mb-16 relative max-w-5xl mx-auto">
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
                  Data Intelligence
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                  Unlock Global <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-500">Company Insights</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-light mb-10">
                  Search millions of job records to find hiring trends, verified LMIA sponsors, and top employers in your industry.
                </p>

                {/* Search Bar */}
                <div className="mb-12">
                  <CompanySearchBar />
                </div>

                {/* Market Stats */}
                <div className="mb-12">
                  <MarketStats />
                </div>

                {/* Featured Company Spotlight */}
                <div className="mb-20 text-left">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="h-1 w-10 bg-brand-600 rounded-full" />
                    <span className="text-sm font-bold text-brand-600 uppercase tracking-wider">Editor's Pick</span>
                  </div>
                  <FeaturedCompany />
                </div>

                {/* Tier Based Leaderboard */}
                <div className="mb-20">
                  <CompanyTierList />
                </div>


              </motion.div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">

              {/* Left Column: Top Companies & LMIA (Span 8) */}
              <div className="lg:col-span-12 space-y-20">

                {/* Top Trending Companies */}
                <div>
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-brand-600" />
                        Trending Companies
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">Top employers with the most active job postings this month.</p>
                    </div>
                    <Button variant="ghost" className="text-brand-600 hover:bg-brand-50" asChild>
                      <CustomLink href="/search?sort=date_desc">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                      </CustomLink>
                    </Button>
                  </div>
                  <TopCompaniesList variant="trending" />
                </div>

                {/* Top LMIA Companies */}
                <div>
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-brand-600" />
                        Top LMIA Sponsors
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">Verified companies with the highest number of approved positions.</p>
                    </div>
                    <Button variant="ghost" className="text-brand-600 hover:bg-brand-50" asChild>
                      <CustomLink href="/search?t=lmia">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                      </CustomLink>
                    </Button>
                  </div>
                  <TopCompaniesList variant="lmia" />
                </div>

                {/* Categorized Companies */}
                <div>
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <PieChart className="h-6 w-6 text-brand-600" />
                        Category Leaders
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">Leading employers across key industries.</p>
                    </div>
                  </div>
                  <CategorizedCompanies />
                </div>

              </div>
            </div>

          </div>
        </div >

        {!isMobile && <Footer />
        }
        {isMobile && <BottomNav />}
      </BackgroundWrapper >
    </>
  );
}

export default Analysis;
