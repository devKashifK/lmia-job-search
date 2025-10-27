'use client';

import { Lightbulb, MousePointerClick, Sparkles, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/ui/section-title';

const steps = [
  {
    icon: Lightbulb,
    title: 'Start by entering your query',
    description:
      "Type in what you're looking for—NOC code, employer, city, or more.",
  },
  {
    icon: MousePointerClick,
    title: 'Click to generate results',
    description:
      'Our engine instantly fetches and visualizes the most relevant data.',
  },
  {
    icon: Sparkles,
    title: 'Polish it up, make it yours',
    description:
      'Use filters and charts to refine your results and gain insights.',
  },
  {
    icon: Share2,
    title: 'Take it anywhere',
    description:
      'Export your findings or share them with your team in one click.',
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

export default function HowItWorks() {
  return (
    <section className="py-16 relative">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <SectionTitle
          title="How it works"
          subtitle="Get started in minutes with our simple yet powerful search process"
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative flex flex-col items-center"
        >
          {/* Vertical timeline line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-1 bg-gradient-to-b from-brand-200 via-brand-400 to-brand-200 rounded-full opacity-40" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={item}
              className="relative w-full mb-16 last:mb-0"
            >
              <div
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  i % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Icon container */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative flex-shrink-0"
                >
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 group relative">
                    <div className="absolute inset-0.5 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    <step.icon className="w-12 h-12 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-white to-brand-50 shadow-lg flex items-center justify-center border border-brand-100">
                    <span className="text-sm font-bold bg-gradient-to-br from-brand-500 to-brand-600 bg-clip-text text-transparent">
                      {i + 1}
                    </span>
                  </div>
                </motion.div>

                {/* Content container */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`flex-1 relative group ${
                    i % 2 === 0 ? 'md:text-right' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-brand-600/5 rounded-2xl transform -rotate-1 transition-transform duration-300 group-hover:rotate-0" />
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-brand-600/5 rounded-2xl transform rotate-1 transition-transform duration-300 group-hover:rotate-0" />
                  <div className="relative bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-brand-100/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-brand-100/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <span className="inline-block text-sm font-semibold text-brand-500 mb-2 uppercase tracking-wider">
                        Step {i + 1}
                      </span>
                      <h3 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                        {step.title}
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Timeline dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 border-4 border-white shadow-md" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
