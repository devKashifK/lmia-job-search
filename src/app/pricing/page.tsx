"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../nabvar";
import Footer from "@/pages/homepage/footer";

const PricingPage = () => {
  const tiers = [
    {
      name: "Starter",
      price: "$19",
      description: "Perfect for freelancers and individual developers",
      features: [
        "Up to 10,000 API calls/month",
        "Real-time data analytics",
        "Basic code generation",
        "Standard support (24-48h)",
        "Community forums access",
        "Basic documentation",
        "Single user license",
      ],
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$49",
      description: "Ideal for small teams and growing startups",
      features: [
        "Up to 50,000 API calls/month",
        "Advanced AI code generation",
        "Priority support (12h)",
        "Custom API endpoints",
        "Team collaboration tools",
        "Advanced analytics dashboard",
        "Code review automation",
        "CI/CD integration",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large teams with complex requirements",
      features: [
        "Unlimited API calls",
        "Custom AI model training",
        "24/7 dedicated support",
        "SLA guarantees",
        "Advanced security features",
        "Custom integrations",
        "On-premise deployment",
        "Training & onboarding",
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-foreground sm:text-5xl mb-4"
          >
            Choose Your Development Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Accelerate your development process with our AI-powered tools and
            expert support. Scale your projects with confidence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl p-8 ${
                tier.highlighted
                  ? "bg-primary text-primary-foreground shadow-xl scale-105"
                  : "bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow"
              }`}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">{tier.name}</h2>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== "Custom" && (
                    <span className="text-lg">/month</span>
                  )}
                </div>
                <p
                  className={`${
                    tier.highlighted
                      ? "text-primary-foreground/90"
                      : "text-muted-foreground"
                  }`}
                >
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check
                      className={`h-5 w-5 mr-3 flex-shrink-0 ${
                        tier.highlighted
                          ? "text-primary-foreground"
                          : "text-primary"
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  tier.highlighted
                    ? "bg-background text-primary hover:bg-background/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {tier.name === "Enterprise"
                  ? "Contact Sales"
                  : "Start Free Trial"}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Enterprise Solutions
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Need a custom solution? Our enterprise plan includes personalized
            support, custom integrations, and flexible pricing based on your
            specific requirements.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
            <Button variant="default" size="lg">
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
