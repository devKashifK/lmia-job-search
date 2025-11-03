"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { HoverCard } from "@/components/ui/hover-card";
import SectionTitle from "@/components/ui/section-title";
import useMobile from "@/hooks/use-mobile";

const testimonials = [
  {
    name: "John D.",
    role: "Data Analyst",
    initials: "JD",
    content:
      "This platform revolutionized how I access and analyze data. The search capabilities are simply outstanding!",
  },
  {
    name: "Sarah K.",
    role: "Research Manager",
    initials: "SK",
    content:
      "Perfect for professionals seeking actionable insights in seconds. The dynamic charts feature is a game-changer.",
  },
  {
    name: "Mike P.",
    role: "Business Analyst",
    initials: "MP",
    content:
      "The credits-based system is brilliant. It gives me the flexibility to access premium data when I need it most.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Testimonials() {
  const { isMobile, isMounted } = useMobile();

  if (!isMounted) {
    return null;
  }

  return (
    <section id="testimonials" className={isMobile ? "py-10 relative" : "py-16 relative"}>
      <div className={isMobile ? "max-w-7xl mx-auto px-4" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <SectionTitle
          title="What Our Users Say"
          subtitle="Hear from professionals who use our platform daily"
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-8"}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={item}>
              <HoverCard>
                <Card className="h-full">
                  <CardContent className={isMobile ? "p-4" : "p-8"}>
                    <div className={isMobile ? "flex items-center mb-4" : "flex items-center mb-6"}>
                      <Avatar className={isMobile ? "h-10 w-10 bg-brand-100 group-hover:bg-brand-200 transition-colors duration-300" : "h-14 w-14 bg-brand-100 group-hover:bg-brand-200 transition-colors duration-300"}>
                        <AvatarFallback className={isMobile ? "text-brand-600 text-sm font-semibold" : "text-brand-600 text-lg font-semibold"}>
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <h4 className={isMobile ? "text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors duration-300" : "text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors duration-300"}>
                          {testimonial.name}
                        </h4>
                        <p className={isMobile ? "text-xs text-gray-600" : "text-gray-600"}>{testimonial.role}</p>
                      </div>
                    </div>
                    <div className={isMobile ? "flex text-brand-500 mb-3" : "flex text-brand-500 mb-6"}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={isMobile ? "w-4 h-4 fill-current" : "w-5 h-5 fill-current"} />
                      ))}
                    </div>
                    <p className={isMobile ? "text-sm text-gray-600 leading-relaxed" : "text-gray-600 leading-relaxed"}>
                      {testimonial.content}
                    </p>
                  </CardContent>
                </Card>
              </HoverCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
