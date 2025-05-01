"use client";

import {
  Search,
  BarChart2,
  CreditCard,
  Lock,
  Filter,
  Play,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/section-title";

const features = [
  {
    title: "Advanced Search",
    description:
      "Fuzzy search across multiple fields like NOC Code, Employer, and City.",
    icon: Search,
  },
  {
    title: "Dynamic Charts",
    description:
      "Visualize your search results with statistics—highest, lowest, and average values.",
    icon: BarChart2,
  },
  {
    title: "Credits-Based Model",
    description:
      "5 free credits on login, purchase more for advanced features.",
    icon: CreditCard,
  },
  {
    title: "Premium Information",
    description: "Access locked phone and email details with secure payments.",
    icon: Lock,
  },
  {
    title: "Real-Time Filtering",
    description:
      "Filter search results dynamically without altering original data.",
    icon: Filter,
  },
  {
    title: "Live Preview",
    description: "Preview search results instantly as you type.",
    icon: Play,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Powerful Features for Enhanced Search"
          subtitle="Everything you need to streamline your search experience"
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
