'use client';

import CTA from '@/sections/homepage/cta';
import Features from '@/sections/homepage/features';
import Footer from '@/sections/homepage/footer';
import Hero from '@/sections/homepage/hero';
import Pricing from '@/sections/homepage/pricing';
import Testimonials from '@/sections/homepage/testimonals';
import Navbar from '../components/ui/nabvar';
import HowItWorks from '@/sections/homepage/how-it-works';
import dynamic from 'next/dynamic';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import Company from '@/components/ui/company';
import PopularProfile from '@/components/ui/popular-profile';
import CtaSmall from '@/components/ui/cta-small';
import SearchBox from '@/components/ui/search-box';
import UseCases from '@/sections/homepage/use-cases';

// Dynamic import to prevent SSR issues with React Query
const Intelligence = dynamic(() => import('@/sections/homepage/intelligence'), {
  ssr: false
});

export default function Home() {
  return (
    <BackgroundWrapper>
      <Navbar />
      <SearchBox />
      <Hero />
      <Features />
      {/* <HowItWorks /> */}
      <Intelligence />
      {/* <UseCases /> */}
      <Company />
      {/* <SeeItAction /> */}
      <Pricing />
      <Testimonials />
      {/* <FAQ /> */}
      <CTA />
      <Footer />
    </BackgroundWrapper>
  );
}
