"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/nabvar";
import Footer from "@/pages/homepage/footer";
import { HoverCard } from "@/components/ui/hover-card";
import BackgroundWrapper from "@/components/ui/background-wrapper";

const PricingPage = () => {
  const tiers = [
    {
      name: "Basic",
      price: "$29",
      description: "Perfect for individual job seekers and small businesses",
      features: [
        "Up to 100 job searches per month",
        "Basic job filtering and sorting",
        "Email notifications for new jobs",
        "Standard support (24-48h)",
        "Basic job analytics",
        "Single user access",
        "Save up to 50 jobs",
      ],
      highlighted: false,
      badge: null,
    },
    {
      name: "Professional",
      price: "$79",
      description: "Ideal for recruiters and growing businesses",
      features: [
        "Unlimited job searches",
        "Advanced filtering and sorting",
        "Priority support (12h)",
        "Custom job alerts",
        "Advanced analytics dashboard",
        "Team collaboration tools",
        "Save up to 500 jobs",
        "Export job data to CSV",
      ],
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations and recruitment agencies",
      features: [
        "Unlimited everything",
        "Custom API access",
        "24/7 dedicated support",
        "SLA guarantees",
        "Advanced security features",
        "Custom integrations",
        "Bulk job processing",
        "Training & onboarding",
      ],
      highlighted: false,
      badge: "Custom Solution",
    },
  ];

  return (
    <BackgroundWrapper>
      <div className="bg-brand-50/80">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-3 sm:mb-4"
            >
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-brand-500" />
              <span className="uppercase text-[10px] sm:text-xs font-semibold text-brand-600 tracking-widest">
                Pricing
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4"
            >
              Find Your Perfect Job Match
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0"
            >
              Access comprehensive job listings, advanced search tools, and
              powerful analytics to streamline your job search or recruitment
              process.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <HoverCard>
                  <div
                    className={`rounded-2xl p-6 sm:p-8 h-full flex flex-col ${
                      tier.highlighted
                        ? "bg-white border-2 border-brand-500 shadow-xl scale-105"
                        : "bg-white/80 backdrop-blur-sm border border-brand-100 shadow-md hover:shadow-lg transition-all duration-300"
                    }`}
                  >
                    {tier.badge && (
                      <div className="absolute top-4 right-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                            tier.highlighted
                              ? "bg-brand-500 text-white"
                              : "bg-brand-100 text-brand-600"
                          }`}
                        >
                          {tier.badge}
                        </span>
                      </div>
                    )}
                    <div className="mb-6 sm:mb-8">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        {tier.name}
                      </h2>
                      <div className="mb-3 sm:mb-4">
                        <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                          {tier.price}
                        </span>
                        {tier.price !== "Custom" && (
                          <span className="text-base sm:text-lg text-gray-500">
                            /month
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-600">
                        {tier.description}
                      </p>
                    </div>

                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center text-sm sm:text-base text-gray-700"
                        >
                          <Check
                            className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0 ${
                              tier.highlighted
                                ? "text-brand-500"
                                : "text-brand-400"
                            }`}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      <Button
                        className={`w-full h-11 sm:h-12 ${
                          tier.highlighted
                            ? "bg-brand-500 hover:bg-brand-600 text-white"
                            : "bg-brand-100 hover:bg-brand-200 text-brand-600"
                        }`}
                      >
                        {tier.name === "Enterprise" ? (
                          "Contact Sales"
                        ) : (
                          <>
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </HoverCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 sm:mt-20 text-center"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-brand-100 shadow-lg">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                <Zap className="h-4 w-4 text-brand-500" />
                <span className="uppercase text-[10px] sm:text-xs font-semibold text-brand-600 tracking-widest">
                  Enterprise Solutions
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Need a Custom Solution?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Our enterprise plan includes personalized support, custom
                integrations, and flexible pricing tailored to your
                organization&apos;s specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-brand-200 text-brand-600 hover:bg-brand-50"
                >
                  Schedule Demo
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </BackgroundWrapper>
  );
};

export default PricingPage;
