// import { ProvinceCarousel } from "@/components/ui/province";

import CTA from "@/pages/homepage/cta";
import FAQ from "@/pages/homepage/faq";
import Features from "@/pages/homepage/features";
import Footer from "@/pages/homepage/footer";
import Hero from "@/pages/homepage/hero";
import Pricing from "@/pages/homepage/pricing";
import SeeItAction from "@/pages/homepage/see-it-action";
import Testimonials from "@/pages/homepage/testimonals";
import Navbar from "./nabvar";
import HowItWorks from "@/pages/homepage/how-it-works";
import UseCases from "@/pages/homepage/use-cases";
import BackgroundWrapper from "@/components/ui/background-wrapper";

export default function Home() {
  return (
    <BackgroundWrapper>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <UseCases />
      <SeeItAction />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </BackgroundWrapper>
  );
}
