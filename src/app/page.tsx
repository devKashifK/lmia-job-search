// import { ProvinceCarousel } from "@/components/ui/province";
import { CompanySection } from "@/sections/companies";
import { FeaturedJobs } from "@/sections/featured-jobs";
import { Footer } from "@/sections/footer";
import { Header } from "@/sections/header";
import { HeroSection } from "@/sections/hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf5ff] ">
      <Header />
      <HeroSection />
      <FeaturedJobs />
      <CompanySection />
      <Footer />
    </main>
  );
}
