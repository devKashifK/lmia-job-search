// import { ProvinceCarousel } from "@/components/ui/province";

import CTA from "@/pages/homepage/cta";
import Features from "@/pages/homepage/features";
import Footer from "@/pages/homepage/footer";
import Hero from "@/pages/homepage/hero";
import Pricing from "@/pages/homepage/pricing";
import Testimonials from "@/pages/homepage/testimonals";
import Navbar from "./nabvar";
import HowItWorks from "@/pages/homepage/how-it-works";
import BackgroundWrapper from "@/components/ui/background-wrapper";
import Company from "@/components/ui/company";
import PopularProfile from "@/components/ui/popular-profile";
import CtaSmall from "@/components/ui/cta-small";

export default function Home() {
  return (
    <BackgroundWrapper>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Company />

      <CtaSmall />
      <PopularProfile />
      {/* <UseCases /> */}
      {/* <SeeItAction /> */}
      <Pricing />
      <Testimonials />
      {/* <FAQ /> */}
      <CTA />
      <Footer />
    </BackgroundWrapper>
  );
}
