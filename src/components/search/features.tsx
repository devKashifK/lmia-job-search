"use client";

import { motion } from "framer-motion";
import { FeatureCard } from "@/components/ui/feature-card";

const features = [
  {
    icon: "🚀",
    title: "Fast Results",
    description:
      "Get instant matches for your search queries with our optimized search engine.",
  },
  {
    icon: "🔒",
    title: "Secure Search",
    description:
      "Your search data is encrypted and protected with enterprise-grade security.",
  },
  {
    icon: "🌟",
    title: "Smart Filters",
    description:
      "Refine your search with intelligent filters to find exactly what you need.",
  },
] as const;

export function SearchFeatures() {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 w-full max-w-5xl mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </motion.div>
  );
}
