"use client";

import { motion } from "framer-motion";
import useMobile from "@/hooks/use-mobile";
import { Star, Quote, BadgeCheck } from "lucide-react";
import SectionTitle from "@/components/ui/section-title";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "John D.",
    role: "Data Analyst at TechCorp",
    initials: "JD",
    content: "The raw LMIA data access completely changed our hiring strategy. We found 3 niche competitors we didn't know existed.",
    color: "bg-blue-100 text-blue-700",
    verified: true,
  },
  {
    name: "Sarah K.",
    role: "Recruitment Manager",
    initials: "SK",
    content: "Speed is everything. I verify employer history in seconds instead of days. The NOC code logic is spot on.",
    color: "bg-purple-100 text-purple-700",
    verified: true,
  },
  {
    name: "Mike P.",
    role: "Immigration Consultant",
    initials: "MP",
    content:
      "The credits-based system is brilliant. It gives me the flexibility to access premium data when I need it most.",
  },
];

export default function Testimonials() {
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) {
    return null;
  }

  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className={isMobile ? "max-w-full px-4" : "max-w-7xl mx-auto px-6 lg:px-8"}>

        <SectionTitle
          badge="User Success"
          title={<>Trusted by <span className="text-brand-600">Pros</span></>}
          subtitle="The intelligence tool of choice for data-driven recruiters."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6"
            >
              <div className="flex gap-1 text-brand-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 leading-relaxed font-medium flex-grow">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
