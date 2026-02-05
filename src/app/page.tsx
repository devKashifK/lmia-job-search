import CTA from '@/pages/homepage/cta';
import Features from '@/pages/homepage/features';
import Footer from '@/pages/homepage/footer';
import Hero from '@/pages/homepage/hero';
import Pricing from '@/pages/homepage/pricing';
import Testimonials from '@/pages/homepage/testimonals';
import Navbar from '../components/ui/nabvar';
import HowItWorks from '@/pages/homepage/how-it-works';
import Intelligence from '@/pages/homepage/intelligence';
import BackgroundWrapper from '@/components/ui/background-wrapper';
import Company from '@/components/ui/company';
import PopularProfile from '@/components/ui/popular-profile';
import CtaSmall from '@/components/ui/cta-small';
import SearchBox from '@/components/ui/search-box';
import UseCases from '@/pages/homepage/use-cases';

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
