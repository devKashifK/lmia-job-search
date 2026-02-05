"use client";

import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/section-title";

// Mock application interface examples
const useCases = [
  {
    title: "Job Seekers",
    description:
      "Discover the right Canadian jobs, understand employer hiring behavior, and apply with clarity and confidence.",
    content: (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col justify-center items-center text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <p className="text-sm text-gray-500">Apply with confidence</p>
      </div>
    ),
  },
  {
    title: "Immigration Consultants & Recruiters",
    description:
      "Identify active employers, access hiring trend intelligence, and reduce guesswork in client profiling.",
    content: (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col justify-center items-center text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <p className="text-sm text-gray-500">Data-driven profiling</p>
      </div>
    ),
  },
  {
    title: "Employers (Coming Soon)",
    description:
      "Showcase hiring presence, access talent insights, and make data-driven hiring decisions.",
    content: (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">Soon</div>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <p className="text-sm text-gray-500">Showcase your brand</p>
      </div>
    ),
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

export default function UseCases() {
  return (
    <section className="py-16 relative">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title="Who JobMaze Is For"
          subtitle="Tailored solutions for every stakeholder in the ecosystem"
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {useCases.map((uc) => (
            <motion.div
              key={uc.title}
              variants={item}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-red-500/5 rounded-xl transform rotate-1 transition-transform duration-300 group-hover:rotate-0" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-red-500/5 rounded-xl transform -rotate-1 transition-transform duration-300 group-hover:rotate-0" />

              <div className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                {/* Visual Example */}
                <div className="aspect-[16/9]">{uc.content}</div>

                {/* Description */}
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors duration-300">
                    {uc.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {uc.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
